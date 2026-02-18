// Niumba - Inquiries Hook
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  createInquiry,
  getPropertyInquiries,
  getUserInquiries,
  getOwnerInquiries,
  getAllInquiries,
  updateInquiryStatus,
  respondToInquiry,
  deleteInquiry,
  type Inquiry,
} from '../services/inquiryService';

export const usePropertyInquiries = (propertyId: string) => {
  const { user, isOwner } = useAuth();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadInquiries = useCallback(async (status?: string) => {
    if (!isOwner) return;

    try {
      setLoading(true);
      setError(null);
      const { data } = await getPropertyInquiries(propertyId, { status });
      setInquiries(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  }, [propertyId, isOwner]);

  useEffect(() => {
    if (isOwner && propertyId) {
      loadInquiries();
    }
  }, [propertyId, isOwner, loadInquiries]);

  return {
    inquiries,
    loading,
    error,
    refresh: loadInquiries,
  };
};

export const useCreateInquiry = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(async (
    propertyId: string,
    inquiryData: {
      sender_name: string;
      sender_email: string;
      sender_phone?: string;
      subject?: string;
      message: string;
    }
  ): Promise<Inquiry | null> => {
    try {
      setLoading(true);
      setError(null);
      const inquiry = await createInquiry(propertyId, {
        sender_id: user?.id,
        ...inquiryData,
      });
      return inquiry;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'envoi de la demande';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  return { create, loading, error };
};

export const useUserInquiries = () => {
  const { user } = useAuth();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadInquiries = useCallback(async (status?: string) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const { data } = await getUserInquiries(user.id, { status });
      setInquiries(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadInquiries();
    }
  }, [user, loadInquiries]);

  return {
    inquiries,
    loading,
    error,
    refresh: loadInquiries,
  };
};

export const useOwnerInquiries = () => {
  const { user, isOwner, isAdmin } = useAuth();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadInquiries = useCallback(async (status?: string) => {
    if (!user) return;
    
    // Si admin, charger toutes les demandes
    if (isAdmin) {
      try {
        setLoading(true);
        setError(null);
        const { data } = await getAllInquiries({ status });
        setInquiries(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur');
      } finally {
        setLoading(false);
      }
      return;
    }
    
    if (!isOwner) return;

    try {
      setLoading(true);
      setError(null);
      const { data } = await getOwnerInquiries(user.id, { status });
      setInquiries(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  }, [user, isOwner, isAdmin]);

  const respond = useCallback(async (
    inquiryId: string,
    response: string
  ): Promise<Inquiry | null> => {
    if (!user) return null;

    try {
      const inquiry = await respondToInquiry(inquiryId, response, user.id);
      if (inquiry) {
        setInquiries((prev) => prev.map((i) => (i.id === inquiryId ? inquiry : i)));
      }
      return inquiry;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
      return null;
    }
  }, [user]);

  const updateStatus = useCallback(async (
    inquiryId: string,
    status: 'new' | 'read' | 'responded' | 'closed'
  ): Promise<Inquiry | null> => {
    if (!user) return null;

    try {
      const inquiry = await updateInquiryStatus(inquiryId, status, user.id, isAdmin);
      if (inquiry) {
        setInquiries((prev) => prev.map((i) => (i.id === inquiryId ? inquiry : i)));
      }
      return inquiry;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
      return null;
    }
  }, [user, isAdmin]);

  const remove = useCallback(async (inquiryId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const success = await deleteInquiry(inquiryId, user.id);
      if (success) {
        setInquiries((prev) => prev.filter((i) => i.id !== inquiryId));
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
      return false;
    }
  }, [user]);

  useEffect(() => {
    if (user && (isOwner || isAdmin)) {
      loadInquiries();
    }
  }, [user, isOwner, isAdmin, loadInquiries]);

  return {
    inquiries: inquiries || [],
    loading,
    error,
    loadInquiries,
    respond,
    updateStatus,
    remove,
    refresh: loadInquiries,
  };
};

export default usePropertyInquiries;


