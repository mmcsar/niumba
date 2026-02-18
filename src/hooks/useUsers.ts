// Niumba - Users Hook
import { useState, useEffect, useCallback } from 'react';
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserStats,
  type User,
} from '../services/userService';

export const useUsers = (options: {
  role?: 'user' | 'agent' | 'admin';
  isActive?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
} = {}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(options.page || 0);

  const loadUsers = useCallback(async (reset: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      const currentPage = reset ? 0 : page;
      const { data, count } = await getUsers({
        ...options,
        page: currentPage,
      });

      if (reset) {
        setUsers(data);
        setPage(0);
      } else {
        setUsers((prev) => [...prev, ...data]);
      }

      const pageSize = options.pageSize || 20;
      setHasMore(data.length === pageSize && (count || 0) > (currentPage + 1) * pageSize);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  }, [options, page]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
      loadUsers(false);
    }
  }, [loading, hasMore, loadUsers]);

  useEffect(() => {
    loadUsers(true);
  }, [options.role, options.isActive, options.search]);

  const refresh = useCallback(() => {
    setPage(0);
    loadUsers(true);
  }, [loadUsers]);

  return {
    users,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
  };
};

export const useUser = (userId: string) => {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUser = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);
      const [userData, statsData] = await Promise.all([
        getUserById(userId),
        getUserStats(userId),
      ]);
      setUser(userData);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const update = useCallback(async (
    updates: {
      full_name?: string;
      phone?: string;
      avatar_url?: string;
      is_active?: boolean;
      role?: 'user' | 'agent' | 'admin';
    }
  ): Promise<User | null> => {
    if (!userId) return null;

    try {
      const updatedUser = await updateUser(userId, updates);
      if (updatedUser) {
        setUser(updatedUser);
      }
      return updatedUser;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
      return null;
    }
  }, [userId]);

  const remove = useCallback(async (): Promise<boolean> => {
    if (!userId) return false;

    try {
      const success = await deleteUser(userId);
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
      return false;
    }
  }, [userId]);

  return {
    user,
    stats,
    loading,
    error,
    update,
    remove,
    refresh: loadUser,
  };
};

export default useUsers;


