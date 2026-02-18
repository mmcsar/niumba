// Niumba - Inquiry Service (Contact Requests)
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { trackPropertyInquiry, isHubSpotConfigured } from './hubspotService';
import { errorLog } from '../utils/logHelper';

export interface Inquiry {
  id: string;
  property_id: string;
  sender_id: string | null; // null for guest inquiries
  owner_id: string;
  sender_name: string;
  sender_email: string;
  sender_phone: string | null;
  subject: string | null;
  message: string;
  status: 'new' | 'read' | 'responded' | 'closed';
  response: string | null;
  responded_at: string | null;
  created_at: string;
  read_at: string | null;
  property?: {
    id: string;
    title: string;
    images: string[];
    address: string;
    owner_id: string;
  };
  inquirer?: {
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
  };
}

/**
 * Create an inquiry
 */
export const createInquiry = async (
  propertyId: string,
  inquiryData: {
    sender_id?: string;
    sender_name: string;
    sender_email: string;
    sender_phone?: string;
    subject?: string;
    message: string;
  }
): Promise<Inquiry | null> => {
  if (!isSupabaseConfigured()) return null;

  try {
    // Get property owner
    const { data: property } = await supabase
      .from('properties')
      .select('owner_id, title')
      .eq('id', propertyId)
      .single();

    if (!property) {
      throw new Error('Property not found');
    }

    // @ts-ignore - TypeScript issue with Supabase insert types
    const { data, error } = await supabase
      .from('inquiries')
      .insert({
        property_id: propertyId,
        sender_id: inquiryData.sender_id || null,
        owner_id: (property as any).owner_id,
        sender_name: inquiryData.sender_name,
        sender_email: inquiryData.sender_email,
        sender_phone: inquiryData.sender_phone || null,
        subject: inquiryData.subject || null,
        message: inquiryData.message,
        status: 'new',
      } as any)
      .select(`
        *,
        property:properties(id, title, images, address, owner_id)
      `)
      .single();

    if (error) throw error;

    // Create notification for property owner
    // @ts-ignore - TypeScript issue with Supabase insert types
    await supabase.from('notifications').insert({
      user_id: (property as any).owner_id,
      title: 'Nouvelle demande de contact',
      body: `${inquiryData.sender_name} a envoyé une demande pour "${(property as any).title}"`,
      type: 'inquiry',
      data: {
        inquiry_id: (data as any).id,
        property_id: propertyId,
      },
    } as any);

    // Track in HubSpot if configured
    if (isHubSpotConfigured() && (data as any).property) {
      const propertyData = (data as any).property as any;
      await trackPropertyInquiry({
        name: inquiryData.sender_name,
        email: inquiryData.sender_email,
        phone: inquiryData.sender_phone,
        propertyId: propertyId,
        propertyTitle: propertyData.title || 'Unknown Property',
        propertyType: propertyData.type || 'unknown',
        propertyPrice: propertyData.price || 0,
        propertyAddress: propertyData.address || '',
        message: inquiryData.message,
        inquiryType: 'info',
      });
    }

    return data as Inquiry;
  } catch (error) {
    errorLog('Error creating inquiry', error instanceof Error ? error : new Error(String(error)), { inquiryData });
    throw error;
  }
};

/**
 * Get inquiries for a property owner
 */
export const getPropertyInquiries = async (
  propertyId: string,
  options: {
    status?: string;
    page?: number;
    pageSize?: number;
  } = {}
): Promise<{ data: Inquiry[]; count: number }> => {
  const { status, page = 0, pageSize = 20 } = options;

  if (!isSupabaseConfigured()) {
    return { data: [], count: 0 };
  }

  try {
    let query = supabase
      .from('inquiries')
      .select(`
        *,
        inquirer:profiles!sender_id(id, full_name, email, phone)
      `, { count: 'exact' })
      .eq('property_id', propertyId)
      .order('created_at', { ascending: false })
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      data: (data || []) as Inquiry[],
      count: count || 0,
    };
  } catch (error) {
    errorLog('Error fetching inquiries', error instanceof Error ? error : new Error(String(error)), { propertyId, status, errorDetails: error });
    return { data: [], count: 0 };
  }
};

/**
 * Get inquiries for a user (as inquirer)
 */
export const getUserInquiries = async (
  userId: string,
  options: {
    status?: string;
    page?: number;
    pageSize?: number;
  } = {}
): Promise<{ data: Inquiry[]; count: number }> => {
  const { status, page = 0, pageSize = 20 } = options;

  if (!isSupabaseConfigured()) {
    return { data: [], count: 0 };
  }

  try {
    let query = supabase
      .from('inquiries')
      .select(`
        *,
        property:properties(id, title, images, address)
      `, { count: 'exact' })
      .eq('sender_id', userId)
      .order('created_at', { ascending: false })
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      data: (data || []) as Inquiry[],
      count: count || 0,
    };
  } catch (error) {
    errorLog('Error fetching user inquiries', error instanceof Error ? error : new Error(String(error)), { userId });
    return { data: [], count: 0 };
  }
};

/**
 * Get all inquiries (for admins - no owner filter)
 */
export const getAllInquiries = async (
  options: {
    status?: string;
    page?: number;
    pageSize?: number;
  } = {}
): Promise<{ data: Inquiry[]; count: number }> => {
  const { status, page = 0, pageSize = 20 } = options;

  if (!isSupabaseConfigured()) {
    return { data: [], count: 0 };
  }

  try {
    let query = supabase
      .from('inquiries')
      .select(`
        *,
        property:properties(id, title, images, address, owner_id),
        inquirer:profiles!sender_id(id, full_name, email, phone)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      data: (data || []) as Inquiry[],
      count: count || 0,
    };
  } catch (error) {
    errorLog('Error fetching all inquiries', error instanceof Error ? error : new Error(String(error)), { options });
    return { data: [], count: 0 };
  }
};

/**
 * Get all inquiries for a property owner (across all properties)
 */
export const getOwnerInquiries = async (
  ownerId: string,
  options: {
    status?: string;
    page?: number;
    pageSize?: number;
  } = {}
): Promise<{ data: Inquiry[]; count: number }> => {
  const { status, page = 0, pageSize = 20 } = options;

  if (!isSupabaseConfigured()) {
    return { data: [], count: 0 };
  }

  try {
    // First get all properties owned by this user
    const { data: properties } = await supabase
      .from('properties')
      .select('id')
      .eq('owner_id', ownerId);

    if (!properties || properties.length === 0) {
      return { data: [], count: 0 };
    }

    const propertyIds = (properties as any[]).map((p: any) => (p as any).id);

    let query = supabase
      .from('inquiries')
      .select(`
        *,
        property:properties(id, title, images, address),
        inquirer:profiles!sender_id(id, full_name, email, phone)
      `, { count: 'exact' })
      .in('property_id', propertyIds)
      .order('created_at', { ascending: false })
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      data: (data || []) as Inquiry[],
      count: count || 0,
    };
  } catch (error) {
    errorLog('Error fetching owner inquiries', error instanceof Error ? error : new Error(String(error)), { ownerId });
    return { data: [], count: 0 };
  }
};

/**
 * Update inquiry status
 */
export const updateInquiryStatus = async (
  inquiryId: string,
  status: 'new' | 'read' | 'responded' | 'closed',
  userId: string,
  isAdmin: boolean = false
): Promise<Inquiry | null> => {
  if (!isSupabaseConfigured()) return null;

  try {
    // Verify user has permission (owner of property or admin)
    const { data: inquiry } = await supabase
      .from('inquiries')
      .select('property_id, owner_id')
      .eq('id', inquiryId)
      .single();

    if (!inquiry) {
      throw new Error('Inquiry not found');
    }

    // Admin can update any inquiry, owner can only update their own
    if (!isAdmin && (inquiry as any).owner_id !== userId) {
      throw new Error('Unauthorized');
    }

    const updateData: any = { status };
    if (status === 'read' && !(inquiry as any).read_at) {
      updateData.read_at = new Date().toISOString();
    }

    const { data, error } = await (supabase
      .from('inquiries') as any)
      .update(updateData as any)
      .eq('id', inquiryId)
      .select(`
        *,
        property:properties(id, title, images, address),
        inquirer:profiles!sender_id(id, full_name, email, phone)
      `)
      .single();

    if (error) throw error;

    return data as Inquiry;
  } catch (error) {
    errorLog('Error updating inquiry status', error instanceof Error ? error : new Error(String(error)), { inquiryId, status });
    throw error;
  }
};

/**
 * Respond to an inquiry
 */
export const respondToInquiry = async (
  inquiryId: string,
  response: string,
  userId: string
): Promise<Inquiry | null> => {
  if (!isSupabaseConfigured()) return null;

  try {
    // Verify user has permission
    const { data: inquiry } = await supabase
      .from('inquiries')
      .select('property_id, sender_id, owner_id, property:properties(title)')
      .eq('id', inquiryId)
      .single();

    if (!inquiry || (inquiry as any).owner_id !== userId) {
      throw new Error('Unauthorized');
    }

    const { data, error } = await (supabase
      .from('inquiries') as any)
      .update({
        response,
        status: 'responded',
        responded_at: new Date().toISOString(),
      } as any)
      .eq('id', inquiryId)
      .select(`
        *,
        property:properties(id, title, images, address),
        inquirer:profiles!sender_id(id, full_name, email, phone)
      `)
      .single();

    if (error) throw error;

    // Create notification for inquirer
    if ((inquiry as any).sender_id) {
      await supabase.from('notifications').insert({
        user_id: (inquiry as any).sender_id,
        title: 'Réponse à votre demande',
        body: `Le propriétaire a répondu à votre demande pour "${((inquiry as any).property as any)?.title || 'cette propriété'}"`,
        type: 'inquiry_response',
        data: {
          inquiry_id: inquiryId,
          property_id: (inquiry as any).property_id,
        },
      } as any);
    }

    return data as Inquiry;
  } catch (error) {
    errorLog('Error responding to inquiry', error instanceof Error ? error : new Error(String(error)), { inquiryId });
    throw error;
  }
};

/**
 * Delete an inquiry
 */
export const deleteInquiry = async (
  inquiryId: string,
  userId: string
): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;

  try {
    // Verify user has permission (owner or sender)
    const { data: inquiry } = await supabase
      .from('inquiries')
      .select('sender_id, owner_id')
      .eq('id', inquiryId)
      .single();

    if (
      !inquiry ||
      ((inquiry as any).owner_id !== userId && (inquiry as any).sender_id !== userId)
    ) {
      throw new Error('Unauthorized');
    }

    const { error } = await supabase
      .from('inquiries')
      .delete()
      .eq('id', inquiryId);

    if (error) throw error;

    return true;
  } catch (error) {
    errorLog('Error deleting inquiry', error instanceof Error ? error : new Error(String(error)), { inquiryId });
    return false;
  }
};

export default {
  createInquiry,
  getPropertyInquiries,
  getUserInquiries,
  getOwnerInquiries,
  updateInquiryStatus,
  respondToInquiry,
  deleteInquiry,
};

