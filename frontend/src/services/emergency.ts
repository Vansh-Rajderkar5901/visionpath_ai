import type { AlertType, EmergencyAlert, EmergencyContact, SOSResponse } from '@/types';
import { api } from './api';

export interface ContactInput {
  name: string;
  phone: string;
  relationship: string;
  isPrimary?: boolean;
}

export interface SOSInput {
  type?: AlertType;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  building?: string;
  floor?: string;
  message?: string;
}

export const emergencyService = {
  async getContacts(): Promise<EmergencyContact[]> {
    return api.get<EmergencyContact[]>('/api/emergency/contacts');
  },

  async addContact(input: ContactInput): Promise<EmergencyContact> {
    return api.post<EmergencyContact>('/api/emergency/contacts', {
      isPrimary: false,
      ...input,
    });
  },

  async updateContact(contactId: string, input: ContactInput): Promise<EmergencyContact> {
    return api.put<EmergencyContact>(`/api/emergency/contacts/${contactId}`, {
      isPrimary: false,
      ...input,
    });
  },

  async deleteContact(contactId: string): Promise<void> {
    await api.delete(`/api/emergency/contacts/${contactId}`);
  },

  async triggerSOS(input: SOSInput = {}): Promise<SOSResponse> {
    return api.post<SOSResponse>('/api/emergency/sos', { type: 'sos', ...input });
  },

  async getAlerts(): Promise<EmergencyAlert[]> {
    return api.get<EmergencyAlert[]>('/api/emergency/alerts');
  },

  async resolveAlert(alertId: string): Promise<EmergencyAlert> {
    return api.post<EmergencyAlert>(`/api/emergency/alerts/${alertId}/resolve`);
  },
};

/**
 * Read the browser's current position. Resolves to null rather than throwing
 * when permission is denied — an SOS must still go out without coordinates.
 */
export function getCurrentPosition(timeoutMs = 8000): Promise<GeolocationPosition | null> {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: 0 }
    );
  });
}
