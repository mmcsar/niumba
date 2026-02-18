// Niumba - Queue Service
// Background task management with priority, retry, and persistence

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

// Queue configuration
const QUEUE_CONFIG = {
  maxConcurrent: 3,
  maxRetries: 3,
  retryDelay: 1000, // Base delay in ms (exponential backoff)
  persistKey: '@niumba_queue',
  processInterval: 1000, // Check queue every second
};

// Task priority levels
export enum TaskPriority {
  LOW = 0,
  NORMAL = 1,
  HIGH = 2,
  CRITICAL = 3,
}

// Task status
export enum TaskStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

// Task definition
export interface Task<T = any> {
  id: string;
  type: string;
  payload: T;
  priority: TaskPriority;
  status: TaskStatus;
  retries: number;
  maxRetries: number;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  error?: string;
  result?: any;
  requiresNetwork: boolean;
  onProgress?: (progress: number) => void;
}

// Task handler function type
type TaskHandler<T = any, R = any> = (payload: T, task: Task<T>) => Promise<R>;

// Queue events
type QueueEventType = 'taskAdded' | 'taskStarted' | 'taskCompleted' | 'taskFailed' | 'queueEmpty';
type QueueEventHandler = (task: Task) => void;

class QueueService {
  private queue: Task[] = [];
  private handlers: Map<string, TaskHandler> = new Map();
  private eventListeners: Map<QueueEventType, Set<QueueEventHandler>> = new Map();
  private isProcessing: boolean = false;
  private activeCount: number = 0;
  private processTimer: NodeJS.Timeout | null = null;
  private isOnline: boolean = true;

  constructor() {
    this.initNetworkListener();
    this.loadPersistedQueue();
    this.startProcessing();
  }

  /**
   * Register a task handler
   */
  registerHandler<T, R>(type: string, handler: TaskHandler<T, R>): void {
    this.handlers.set(type, handler);
  }

  /**
   * Add a task to the queue
   */
  async addTask<T>(
    type: string,
    payload: T,
    options: {
      priority?: TaskPriority;
      maxRetries?: number;
      requiresNetwork?: boolean;
      id?: string;
    } = {}
  ): Promise<string> {
    const {
      priority = TaskPriority.NORMAL,
      maxRetries = QUEUE_CONFIG.maxRetries,
      requiresNetwork = true,
      id = this.generateId(),
    } = options;

    const task: Task<T> = {
      id,
      type,
      payload,
      priority,
      status: TaskStatus.PENDING,
      retries: 0,
      maxRetries,
      createdAt: Date.now(),
      requiresNetwork,
    };

    // Insert based on priority
    const insertIndex = this.queue.findIndex((t) => t.priority < priority);
    if (insertIndex === -1) {
      this.queue.push(task);
    } else {
      this.queue.splice(insertIndex, 0, task);
    }

    await this.persistQueue();
    this.emit('taskAdded', task);

    return id;
  }

  /**
   * Add multiple tasks
   */
  async addTasks<T>(
    type: string,
    payloads: T[],
    options: {
      priority?: TaskPriority;
      maxRetries?: number;
      requiresNetwork?: boolean;
    } = {}
  ): Promise<string[]> {
    const ids: string[] = [];
    
    for (const payload of payloads) {
      const id = await this.addTask(type, payload, options);
      ids.push(id);
    }

    return ids;
  }

  /**
   * Cancel a task
   */
  async cancelTask(id: string): Promise<boolean> {
    const index = this.queue.findIndex((t) => t.id === id);
    
    if (index !== -1) {
      const task = this.queue[index];
      
      if (task.status === TaskStatus.PENDING) {
        task.status = TaskStatus.CANCELLED;
        this.queue.splice(index, 1);
        await this.persistQueue();
        return true;
      }
    }

    return false;
  }

  /**
   * Get task by ID
   */
  getTask(id: string): Task | undefined {
    return this.queue.find((t) => t.id === id);
  }

  /**
   * Get all tasks of a type
   */
  getTasksByType(type: string): Task[] {
    return this.queue.filter((t) => t.type === type);
  }

  /**
   * Get queue statistics
   */
  getStats(): {
    total: number;
    pending: number;
    running: number;
    completed: number;
    failed: number;
    byType: Record<string, number>;
  } {
    const byType: Record<string, number> = {};
    
    this.queue.forEach((t) => {
      byType[t.type] = (byType[t.type] || 0) + 1;
    });

    return {
      total: this.queue.length,
      pending: this.queue.filter((t) => t.status === TaskStatus.PENDING).length,
      running: this.activeCount,
      completed: this.queue.filter((t) => t.status === TaskStatus.COMPLETED).length,
      failed: this.queue.filter((t) => t.status === TaskStatus.FAILED).length,
      byType,
    };
  }

  /**
   * Clear completed tasks
   */
  async clearCompleted(): Promise<void> {
    this.queue = this.queue.filter(
      (t) => t.status !== TaskStatus.COMPLETED && t.status !== TaskStatus.CANCELLED
    );
    await this.persistQueue();
  }

  /**
   * Clear all tasks
   */
  async clearAll(): Promise<void> {
    this.queue = [];
    await this.persistQueue();
  }

  /**
   * Retry failed tasks
   */
  async retryFailed(): Promise<void> {
    this.queue.forEach((task) => {
      if (task.status === TaskStatus.FAILED) {
        task.status = TaskStatus.PENDING;
        task.retries = 0;
        task.error = undefined;
      }
    });
    await this.persistQueue();
  }

  /**
   * Subscribe to queue events
   */
  on(event: QueueEventType, handler: QueueEventHandler): () => void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(handler);

    // Return unsubscribe function
    return () => {
      this.eventListeners.get(event)?.delete(handler);
    };
  }

  /**
   * Pause processing
   */
  pause(): void {
    this.isProcessing = false;
    if (this.processTimer) {
      clearInterval(this.processTimer);
      this.processTimer = null;
    }
  }

  /**
   * Resume processing
   */
  resume(): void {
    this.startProcessing();
  }

  // ============================================
  // PRIVATE METHODS
  // ============================================

  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private emit(event: QueueEventType, task: Task): void {
    this.eventListeners.get(event)?.forEach((handler) => {
      try {
        handler(task);
      } catch (error) {
        console.error('Queue event handler error:', error);
      }
    });
  }

  private initNetworkListener(): void {
    NetInfo.addEventListener((state) => {
      this.isOnline = state.isConnected === true && state.isInternetReachable !== false;
    });

    NetInfo.fetch().then((state) => {
      this.isOnline = state.isConnected === true && state.isInternetReachable !== false;
    });
  }

  private startProcessing(): void {
    if (this.processTimer) return;

    this.isProcessing = true;
    this.processTimer = setInterval(() => {
      this.processQueue();
    }, QUEUE_CONFIG.processInterval);
  }

  private async processQueue(): Promise<void> {
    if (!this.isProcessing) return;
    if (this.activeCount >= QUEUE_CONFIG.maxConcurrent) return;

    // Find next eligible task
    const task = this.queue.find((t) => {
      if (t.status !== TaskStatus.PENDING) return false;
      if (t.requiresNetwork && !this.isOnline) return false;
      return true;
    });

    if (!task) return;

    // Check if handler exists
    const handler = this.handlers.get(task.type);
    if (!handler) {
      console.warn(`No handler registered for task type: ${task.type}`);
      task.status = TaskStatus.FAILED;
      task.error = 'No handler registered';
      return;
    }

    // Start processing task
    this.activeCount++;
    task.status = TaskStatus.RUNNING;
    task.startedAt = Date.now();
    this.emit('taskStarted', task);

    try {
      const result = await handler(task.payload, task);
      
      task.status = TaskStatus.COMPLETED;
      task.completedAt = Date.now();
      task.result = result;
      
      this.emit('taskCompleted', task);
      
      // Check if queue is empty
      if (this.queue.every((t) => t.status === TaskStatus.COMPLETED || t.status === TaskStatus.FAILED)) {
        this.emit('queueEmpty', task);
      }
    } catch (error: any) {
      task.retries++;
      
      if (task.retries < task.maxRetries) {
        // Schedule retry with exponential backoff
        task.status = TaskStatus.PENDING;
        const delay = QUEUE_CONFIG.retryDelay * Math.pow(2, task.retries - 1);
        
        setTimeout(() => {
          // Task will be picked up by next process cycle
        }, delay);
      } else {
        task.status = TaskStatus.FAILED;
        task.error = error.message || 'Unknown error';
        this.emit('taskFailed', task);
      }
    } finally {
      this.activeCount--;
      await this.persistQueue();
    }
  }

  private async persistQueue(): Promise<void> {
    try {
      // Only persist pending and failed tasks
      const toPersist = this.queue.filter(
        (t) => t.status === TaskStatus.PENDING || t.status === TaskStatus.FAILED
      );
      
      await AsyncStorage.setItem(
        QUEUE_CONFIG.persistKey,
        JSON.stringify(toPersist)
      );
    } catch (error) {
      console.error('Queue persist error:', error);
    }
  }

  private async loadPersistedQueue(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(QUEUE_CONFIG.persistKey);
      
      if (stored) {
        const tasks: Task[] = JSON.parse(stored);
        
        // Reset running tasks to pending
        tasks.forEach((task) => {
          if (task.status === TaskStatus.RUNNING) {
            task.status = TaskStatus.PENDING;
          }
        });

        this.queue = tasks;
      }
    } catch (error) {
      console.error('Queue load error:', error);
    }
  }

  /**
   * Destroy the queue service
   */
  destroy(): void {
    this.pause();
    this.queue = [];
    this.handlers.clear();
    this.eventListeners.clear();
  }
}

// Singleton instance
export const queue = new QueueService();

// ============================================
// PRE-REGISTERED HANDLERS
// ============================================

// Image upload handler
queue.registerHandler('image_upload', async (payload: { uri: string; bucket: string; path: string }) => {
  const { supabase } = await import('../lib/supabase');
  const { optimizeWithPreset } = await import('./imageOptimizationService');

  // Optimize image first
  const optimized = await optimizeWithPreset(payload.uri, 'detail');

  // Upload to Supabase Storage
  const response = await fetch(optimized.uri);
  const blob = await response.blob();

  const { error } = await supabase.storage
    .from(payload.bucket)
    .upload(payload.path, blob, {
      contentType: 'image/jpeg',
      upsert: true,
    });

  if (error) throw error;

  return { path: payload.path, size: optimized.size };
});

// Sync favorites handler
queue.registerHandler('sync_favorites', async (payload: { userId: string; propertyIds: string[] }) => {
  const { supabase } = await import('../lib/supabase');

  // Get current saved properties
  const { data: existing } = await supabase
    .from('saved_properties')
    .select('property_id')
    .eq('user_id', payload.userId);

  const existingIds = new Set((existing || []).map((e: any) => e.property_id));
  const newIds = new Set(payload.propertyIds);

  // Add new
  const toAdd = payload.propertyIds.filter((id) => !existingIds.has(id));
  if (toAdd.length > 0) {
    await (supabase as any).from('saved_properties').insert(
      toAdd.map((id) => ({ user_id: payload.userId, property_id: id }))
    );
  }

  // Remove old
  const toRemove = Array.from(existingIds).filter((id) => !newIds.has(id));
  if (toRemove.length > 0) {
    await supabase
      .from('saved_properties')
      .delete()
      .eq('user_id', payload.userId)
      .in('property_id', toRemove);
  }

  return { added: toAdd.length, removed: toRemove.length };
});

// Analytics event handler
queue.registerHandler('analytics_event', async (payload: { event: string; data: any }) => {
  // Send to analytics service (e.g., Mixpanel, Amplitude)
  console.log('Analytics event:', payload.event, payload.data);
  return { sent: true };
});

export default queue;

