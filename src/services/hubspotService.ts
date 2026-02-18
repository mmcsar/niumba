// Niumba - HubSpot CRM Integration Service
// Manage leads, contacts, and deals for real estate

import { queue, TaskPriority } from './queueService';

import { INTEGRATIONS } from '../config/integrations';

// HubSpot Configuration (mutable so configureHubSpot can set values)
const _hubspotConfig = {
  apiKey: (INTEGRATIONS.hubspot as { apiKey?: string }).apiKey ?? '',
  portalId: (INTEGRATIONS.hubspot as { portalId?: string }).portalId ?? '',
};
const HUBSPOT_CONFIG = {
  get apiKey() { return _hubspotConfig.apiKey; },
  get portalId() { return _hubspotConfig.portalId; },
  baseUrl: 'https://api.hubapi.com',
};

// Check if HubSpot is configured
export const isHubSpotConfigured = () => {
  return INTEGRATIONS.hubspot.enabled &&
         _hubspotConfig.apiKey !== '' &&
         _hubspotConfig.portalId !== '';
};

// Configure HubSpot (call this at app startup)
export const configureHubSpot = (apiKey: string, portalId: string) => {
  _hubspotConfig.apiKey = apiKey;
  _hubspotConfig.portalId = portalId;
};

// ============================================
// TYPES
// ============================================

interface HubSpotContact {
  email: string;
  firstname?: string;
  lastname?: string;
  phone?: string;
  city?: string;
  company?: string;
  // Custom properties for real estate
  property_interest?: string; // 'buy' | 'rent'
  budget_min?: number;
  budget_max?: number;
  preferred_city?: string;
  preferred_property_type?: string;
}

interface HubSpotDeal {
  dealname: string;
  amount?: number;
  dealstage: string;
  pipeline?: string;
  // Custom properties
  property_id?: string;
  property_type?: string;
  property_address?: string;
}

interface HubSpotNote {
  body: string;
  timestamp?: number;
}

// ============================================
// API HELPERS
// ============================================

const hubspotFetch = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  if (!isHubSpotConfigured()) {
    console.log('HubSpot not configured - skipping API call');
    return null;
  }

  const url = `${HUBSPOT_CONFIG.baseUrl}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${HUBSPOT_CONFIG.apiKey}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`HubSpot API Error: ${response.status} - ${error}`);
  }

  return response.json();
};

// ============================================
// CONTACTS
// ============================================

/**
 * Create or update a contact in HubSpot
 */
export const upsertContact = async (contact: HubSpotContact): Promise<string | null> => {
  if (!isHubSpotConfigured()) return null;

  try {
    // First, try to find existing contact by email
    const searchResult = await hubspotFetch(
      `/crm/v3/objects/contacts/search`,
      {
        method: 'POST',
        body: JSON.stringify({
          filterGroups: [{
            filters: [{
              propertyName: 'email',
              operator: 'EQ',
              value: contact.email,
            }],
          }],
        }),
      }
    );

    const properties: Record<string, any> = {
      email: contact.email,
      firstname: contact.firstname,
      lastname: contact.lastname,
      phone: contact.phone,
      city: contact.city,
      company: contact.company,
    };

    // Add custom properties if they exist
    if (contact.property_interest) properties.property_interest = contact.property_interest;
    if (contact.budget_min) properties.budget_min = contact.budget_min;
    if (contact.budget_max) properties.budget_max = contact.budget_max;
    if (contact.preferred_city) properties.preferred_city = contact.preferred_city;
    if (contact.preferred_property_type) properties.preferred_property_type = contact.preferred_property_type;

    if (searchResult?.results?.length > 0) {
      // Update existing contact
      const contactId = searchResult.results[0].id;
      await hubspotFetch(`/crm/v3/objects/contacts/${contactId}`, {
        method: 'PATCH',
        body: JSON.stringify({ properties }),
      });
      return contactId;
    } else {
      // Create new contact
      const result = await hubspotFetch('/crm/v3/objects/contacts', {
        method: 'POST',
        body: JSON.stringify({ properties }),
      });
      return result?.id || null;
    }
  } catch (error) {
    console.error('HubSpot upsertContact error:', error);
    return null;
  }
};

/**
 * Get contact by email
 */
export const getContactByEmail = async (email: string): Promise<any | null> => {
  if (!isHubSpotConfigured()) return null;

  try {
    const result = await hubspotFetch(
      `/crm/v3/objects/contacts/search`,
      {
        method: 'POST',
        body: JSON.stringify({
          filterGroups: [{
            filters: [{
              propertyName: 'email',
              operator: 'EQ',
              value: email,
            }],
          }],
        }),
      }
    );
    return result?.results?.[0] || null;
  } catch (error) {
    console.error('HubSpot getContactByEmail error:', error);
    return null;
  }
};

// ============================================
// DEALS (Property Transactions)
// ============================================

/**
 * Create a deal for a property inquiry
 */
export const createDeal = async (
  deal: HubSpotDeal,
  contactId?: string
): Promise<string | null> => {
  if (!isHubSpotConfigured()) return null;

  try {
    const properties: Record<string, any> = {
      dealname: deal.dealname,
      dealstage: deal.dealstage,
      pipeline: deal.pipeline || 'default',
    };

    if (deal.amount) properties.amount = deal.amount;
    if (deal.property_id) properties.property_id = deal.property_id;
    if (deal.property_type) properties.property_type = deal.property_type;
    if (deal.property_address) properties.property_address = deal.property_address;

    const result = await hubspotFetch('/crm/v3/objects/deals', {
      method: 'POST',
      body: JSON.stringify({ properties }),
    });

    const dealId = result?.id;

    // Associate deal with contact if provided
    if (dealId && contactId) {
      await hubspotFetch(
        `/crm/v3/objects/deals/${dealId}/associations/contacts/${contactId}/deal_to_contact`,
        { method: 'PUT' }
      );
    }

    return dealId || null;
  } catch (error) {
    console.error('HubSpot createDeal error:', error);
    return null;
  }
};

/**
 * Update deal stage
 */
export const updateDealStage = async (
  dealId: string,
  stage: string
): Promise<boolean> => {
  if (!isHubSpotConfigured()) return false;

  try {
    await hubspotFetch(`/crm/v3/objects/deals/${dealId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        properties: { dealstage: stage },
      }),
    });
    return true;
  } catch (error) {
    console.error('HubSpot updateDealStage error:', error);
    return false;
  }
};

// ============================================
// NOTES & ACTIVITIES
// ============================================

/**
 * Add a note to a contact
 */
export const addNoteToContact = async (
  contactId: string,
  note: HubSpotNote
): Promise<boolean> => {
  if (!isHubSpotConfigured()) return false;

  try {
    const result = await hubspotFetch('/crm/v3/objects/notes', {
      method: 'POST',
      body: JSON.stringify({
        properties: {
          hs_note_body: note.body,
          hs_timestamp: note.timestamp || Date.now(),
        },
      }),
    });

    const noteId = result?.id;
    if (noteId) {
      // Associate note with contact
      await hubspotFetch(
        `/crm/v3/objects/notes/${noteId}/associations/contacts/${contactId}/note_to_contact`,
        { method: 'PUT' }
      );
    }

    return true;
  } catch (error) {
    console.error('HubSpot addNoteToContact error:', error);
    return false;
  }
};

// ============================================
// NIUMBA SPECIFIC INTEGRATIONS
// ============================================

/**
 * Track property inquiry in HubSpot
 */
export const trackPropertyInquiry = async (data: {
  // Contact info
  name: string;
  email: string;
  phone?: string;
  // Property info
  propertyId: string;
  propertyTitle: string;
  propertyType: string;
  propertyPrice: number;
  propertyAddress: string;
  // Inquiry info
  message: string;
  inquiryType: 'buy' | 'rent' | 'info';
}) => {
  if (!isHubSpotConfigured()) {
    console.log('HubSpot not configured - inquiry not tracked');
    return;
  }

  // Add to queue for background processing
  queue.addTask('hubspot_inquiry', data, {
    priority: TaskPriority.NORMAL,
    requiresNetwork: true,
  });
};

/**
 * Track property viewing appointment
 */
export const trackAppointment = async (data: {
  // Contact info
  name: string;
  email: string;
  phone?: string;
  // Property info
  propertyId: string;
  propertyTitle: string;
  // Appointment info
  date: string;
  time: string;
  type: 'in_person' | 'video_call' | 'phone_call';
}) => {
  if (!isHubSpotConfigured()) return;

  queue.addTask('hubspot_appointment', data, {
    priority: TaskPriority.NORMAL,
    requiresNetwork: true,
  });
};

/**
 * Track user registration
 */
export const trackUserRegistration = async (data: {
  email: string;
  name: string;
  phone?: string;
  city?: string;
  role: 'user' | 'agent' | 'owner';
}) => {
  if (!isHubSpotConfigured()) return;

  queue.addTask('hubspot_registration', data, {
    priority: TaskPriority.LOW,
    requiresNetwork: true,
  });
};

// ============================================
// QUEUE HANDLERS
// ============================================

// Register HubSpot queue handlers
queue.registerHandler('hubspot_inquiry', async (payload: any) => {
  const nameParts = payload.name.split(' ');
  const firstname = nameParts[0];
  const lastname = nameParts.slice(1).join(' ') || '';

  // Create/update contact
  const contactId = await upsertContact({
    email: payload.email,
    firstname,
    lastname,
    phone: payload.phone,
    property_interest: payload.inquiryType,
    budget_max: payload.propertyPrice,
    preferred_property_type: payload.propertyType,
  });

  // Create deal
  if (contactId) {
    await createDeal(
      {
        dealname: `${payload.inquiryType.toUpperCase()}: ${payload.propertyTitle}`,
        amount: payload.propertyPrice,
        dealstage: 'qualifiedtobuy', // Customize based on your pipeline
        property_id: payload.propertyId,
        property_type: payload.propertyType,
        property_address: payload.propertyAddress,
      },
      contactId
    );

    // Add inquiry note
    await addNoteToContact(contactId, {
      body: `Property Inquiry:\n\nProperty: ${payload.propertyTitle}\nType: ${payload.inquiryType}\nPrice: $${payload.propertyPrice}\n\nMessage:\n${payload.message}`,
    });
  }

  return { contactId };
});

queue.registerHandler('hubspot_appointment', async (payload: any) => {
  const nameParts = payload.name.split(' ');
  const firstname = nameParts[0];
  const lastname = nameParts.slice(1).join(' ') || '';

  const contactId = await upsertContact({
    email: payload.email,
    firstname,
    lastname,
    phone: payload.phone,
  });

  if (contactId) {
    await addNoteToContact(contactId, {
      body: `Appointment Scheduled:\n\nProperty: ${payload.propertyTitle}\nDate: ${payload.date}\nTime: ${payload.time}\nType: ${payload.type}`,
    });
  }

  return { contactId };
});

queue.registerHandler('hubspot_registration', async (payload: any) => {
  const nameParts = payload.name.split(' ');
  const firstname = nameParts[0];
  const lastname = nameParts.slice(1).join(' ') || '';

  const contactId = await upsertContact({
    email: payload.email,
    firstname,
    lastname,
    phone: payload.phone,
    city: payload.city,
  });

  if (contactId) {
    await addNoteToContact(contactId, {
      body: `New User Registration:\n\nRole: ${payload.role}\nCity: ${payload.city || 'Not specified'}`,
    });
  }

  return { contactId };
});

// ============================================
// EXPORT
// ============================================

export default {
  configureHubSpot,
  isHubSpotConfigured,
  upsertContact,
  getContactByEmail,
  createDeal,
  updateDealStage,
  addNoteToContact,
  trackPropertyInquiry,
  trackAppointment,
  trackUserRegistration,
};

