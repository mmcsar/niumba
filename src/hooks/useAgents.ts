// Niumba - Agents Hook
import { useState, useEffect, useCallback } from 'react';
import {
  getAgents,
  getAgentById,
  getAgentStats,
  upsertAgent,
  updateAgentStatus,
  deleteAgent,
  type Agent,
  type AgentStats,
} from '../services/agentService';

export const useAgents = (options: {
  isActive?: boolean;
  isVerified?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
} = {}) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(options.page || 0);

  const loadAgents = useCallback(async (reset: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      const currentPage = reset ? 0 : page;
      const { data, count } = await getAgents({
        ...options,
        page: currentPage,
      });

      if (reset) {
        setAgents(data);
        setPage(0);
      } else {
        setAgents((prev) => [...prev, ...data]);
      }

      const pageSize = options.pageSize || 20;
      setHasMore(data.length === pageSize && (count || 0) > (currentPage + 1) * pageSize);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des agents');
    } finally {
      setLoading(false);
    }
  }, [options, page]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
      loadAgents(false);
    }
  }, [loading, hasMore, loadAgents]);

  useEffect(() => {
    loadAgents(true);
  }, [options.isActive, options.isVerified, options.search]);

  const refresh = useCallback(() => {
    setPage(0);
    loadAgents(true);
  }, [loadAgents]);

  return {
    agents,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
  };
};

export const useAgent = (agentId: string) => {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [stats, setStats] = useState<AgentStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAgent = useCallback(async () => {
    if (!agentId || agentId === '') {
      setAgent(null);
      setStats(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const [agentData, statsData] = await Promise.all([
        getAgentById(agentId),
        getAgentStats(agentId),
      ]);
      setAgent(agentData);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  }, [agentId]);

  useEffect(() => {
    loadAgent();
  }, [loadAgent]);

  const updateStatus = useCallback(async (
    updates: { is_active?: boolean; is_verified?: boolean }
  ): Promise<boolean> => {
    if (!agentId || agentId === '') return false;

    try {
      const success = await updateAgentStatus(agentId, updates);
      if (success) {
        await loadAgent();
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
      return false;
    }
  }, [agentId, loadAgent]);

  const remove = useCallback(async (): Promise<boolean> => {
    if (!agentId || agentId === '') return false;

    try {
      const success = await deleteAgent(agentId);
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
      return false;
    }
  }, [agentId]);

  return {
    agent,
    stats,
    loading,
    error,
    updateStatus,
    remove,
    refresh: loadAgent,
  };
};

export const useCreateAgent = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(async (
    agentData: {
      user_id: string;
      agency_name?: string;
      license_number?: string;
      bio?: string;
      specializations?: string[];
      regions?: string[];
      is_active?: boolean;
      is_verified?: boolean;
    }
  ): Promise<Agent | null> => {
    try {
      setLoading(true);
      setError(null);
      const agent = await upsertAgent(agentData);
      return agent;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création de l\'agent';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { create, loading, error };
};

export default useAgents;


