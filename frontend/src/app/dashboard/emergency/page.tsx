'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  Ambulance,
  CheckCircle,
  ChevronRight,
  Loader2,
  MapPin,
  Phone,
  Plus,
  Share2,
  Shield,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { emergencyService, getCurrentPosition } from '@/services/emergency';
import { useVoice } from '@/contexts/VoiceContext';
import { onVoiceEvent, VOICE_EVENTS } from '@/lib/voiceEvents';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { EmergencyContact } from '@/types';

function contactIcon(relationship: string) {
  const value = relationship.toLowerCase();
  if (value.includes('security')) return Shield;
  if (value.includes('medical')) return Ambulance;
  return Phone;
}

export default function EmergencyPage() {
  const { announce } = useVoice();
  const queryClient = useQueryClient();

  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    relationship: 'Emergency Contact',
  });

  const { data: contacts, isLoading: contactsLoading } = useQuery({
    queryKey: ['emergency-contacts'],
    queryFn: () => emergencyService.getContacts(),
  });

  const { data: alerts } = useQuery({
    queryKey: ['emergency-alerts'],
    queryFn: () => emergencyService.getAlerts(),
  });

  const activeAlert = alerts?.find((alert) => alert.status === 'active') ?? null;

  const sosMutation = useMutation({
    mutationFn: async () => {
      announce('Sending emergency alert. Getting your location.', {
        priority: 'assertive',
        force: true,
      });
      // Coordinates are best-effort: a denied permission must not block the alert.
      const position = await getCurrentPosition();
      return emergencyService.triggerSOS({
        type: 'sos',
        latitude: position?.coords.latitude,
        longitude: position?.coords.longitude,
        accuracy: position?.coords.accuracy,
        building: 'CSE Block',
      });
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['emergency-alerts'] });
      announce('Emergency alert sent. Help is on the way.', {
        priority: 'assertive',
        force: true,
      });
      toast.success(result.message, { duration: 6000 });
    },
    onError: (error: Error) => {
      announce(`Emergency alert failed. ${error.message}`, {
        priority: 'assertive',
        force: true,
      });
      toast.error(error.message);
    },
  });

  const resolveMutation = useMutation({
    mutationFn: (alertId: string) => emergencyService.resolveAlert(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emergency-alerts'] });
      announce('Emergency alert cancelled.', { priority: 'assertive', force: true });
      toast.success('Emergency alert cancelled');
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const addContactMutation = useMutation({
    mutationFn: () => emergencyService.addContact(newContact),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emergency-contacts'] });
      setShowAddContact(false);
      setNewContact({ name: '', phone: '', relationship: 'Emergency Contact' });
      toast.success('Contact added');
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteContactMutation = useMutation({
    mutationFn: (contactId: string) => emergencyService.deleteContact(contactId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emergency-contacts'] });
      toast.success('Contact removed');
    },
    onError: (error: Error) => toast.error(error.message),
  });

  // Saying "emergency" anywhere in the app fires the SOS from here.
  // `mutate` has a stable identity; the mutation object does not.
  const raiseSOS = sosMutation.mutate;
  const sosPending = sosMutation.isPending;

  useEffect(() => {
    return onVoiceEvent(VOICE_EVENTS.emergencySOS, () => {
      if (!sosPending && !activeAlert) {
        raiseSOS();
      }
    });
  }, [activeAlert, raiseSOS, sosPending]);

  const handleCall = (contact: EmergencyContact) => {
    announce(`Calling ${contact.name} on ${contact.phone}.`, {
      priority: 'assertive',
      force: true,
    });
    // tel: hands off to the device dialler; harmless on desktop.
    window.location.href = `tel:${contact.phone.replace(/\s/g, '')}`;
  };

  const handleShareLocation = async () => {
    const position = await getCurrentPosition();
    if (!position) {
      toast.error('Location permission is needed to share your position.');
      return;
    }
    await sosMutation.mutateAsync();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
          <AlertTriangle className="w-7 h-7 text-red-500" />
          Emergency SOS
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Raise an alert with campus administrators and reach your contacts fast.
        </p>
      </motion.div>

      {/* SOS button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex justify-center"
      >
        {!activeAlert ? (
          <button
            onClick={() => sosMutation.mutate()}
            disabled={sosMutation.isPending}
            className={cn(
              'w-48 h-48 rounded-full bg-gradient-to-br from-red-500 to-red-700 shadow-2xl shadow-red-500/40 flex flex-col items-center justify-center text-white transition-all duration-300',
              'hover:scale-105 hover:shadow-red-500/60 active:scale-95 disabled:opacity-80',
              'focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-offset-4 dark:focus:ring-offset-dark-bg'
            )}
            aria-label="Activate emergency SOS"
          >
            {sosMutation.isPending ? (
              <>
                <Loader2 className="w-12 h-12 animate-spin mb-2" />
                <span className="text-lg font-bold">SENDING...</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-16 h-16 mb-2" />
                <span className="text-2xl font-bold">SOS</span>
                <span className="text-sm opacity-80 mt-1">Tap for help</span>
              </>
            )}
          </button>
        ) : (
          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-center">
            <div className="w-48 h-48 rounded-full bg-gradient-to-br from-green-500 to-green-700 shadow-2xl shadow-green-500/40 flex flex-col items-center justify-center text-white mb-4">
              <CheckCircle className="w-16 h-16 mb-2" />
              <span className="text-lg font-bold">HELP ON THE WAY</span>
              <span className="text-sm opacity-80">Administrators notified</span>
            </div>
            <button
              onClick={() => resolveMutation.mutate(activeAlert.id)}
              disabled={resolveMutation.isPending}
              className="btn-secondary text-red-600 border-red-300 hover:bg-red-50"
            >
              {resolveMutation.isPending ? 'Cancelling...' : 'Cancel SOS'}
            </button>
          </motion.div>
        )}
      </motion.div>

      {activeAlert && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          role="alert"
          className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30"
        >
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse flex-shrink-0" />
            <p className="text-sm font-medium text-red-700 dark:text-red-300">
              Emergency alert active
              {activeAlert.location.latitude
                ? ` — location shared (${activeAlert.location.latitude.toFixed(
                    4
                  )}, ${activeAlert.location.longitude?.toFixed(4)})`
                : ' — location unavailable, contacts notified without coordinates'}
            </p>
          </div>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Contacts */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="p-4 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold flex items-center gap-2">
                <Users className="w-5 h-5 text-red-500" />
                Emergency Contacts
              </h2>
              <button
                onClick={() => setShowAddContact(!showAddContact)}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-border"
                aria-label={showAddContact ? 'Cancel adding contact' : 'Add a contact'}
              >
                {showAddContact ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </button>
            </div>

            {showAddContact && (
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  addContactMutation.mutate();
                }}
                className="space-y-2 mb-4 p-3 rounded-xl bg-gray-50 dark:bg-dark-border/40"
              >
                <input
                  className="input-field"
                  placeholder="Name"
                  value={newContact.name}
                  onChange={(event) =>
                    setNewContact({ ...newContact, name: event.target.value })
                  }
                  required
                  aria-label="Contact name"
                />
                <input
                  className="input-field"
                  placeholder="Phone number"
                  value={newContact.phone}
                  onChange={(event) =>
                    setNewContact({ ...newContact, phone: event.target.value })
                  }
                  required
                  aria-label="Contact phone number"
                />
                <input
                  className="input-field"
                  placeholder="Relationship"
                  value={newContact.relationship}
                  onChange={(event) =>
                    setNewContact({ ...newContact, relationship: event.target.value })
                  }
                  aria-label="Relationship"
                />
                <button
                  type="submit"
                  disabled={addContactMutation.isPending}
                  className="btn-primary w-full text-sm"
                >
                  {addContactMutation.isPending ? 'Saving...' : 'Save Contact'}
                </button>
              </form>
            )}

            <div className="space-y-2">
              {contactsLoading && <LoadingSpinner size="sm" text="Loading contacts..." />}
              {contacts?.map((contact) => {
                const Icon = contactIcon(contact.relationship);
                return (
                  <div
                    key={contact.id}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-border transition-colors gap-2"
                  >
                    <button
                      onClick={() => handleCall(contact)}
                      className="flex items-center gap-3 flex-1 text-left min-w-0"
                    >
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 dark:bg-dark-border flex-shrink-0">
                        <Icon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{contact.name}</p>
                        <p className="text-xs text-gray-500">{contact.relationship}</p>
                      </div>
                      <span className="text-sm font-semibold text-primary-600 ml-auto whitespace-nowrap">
                        {contact.phone}
                      </span>
                      <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    </button>
                    <button
                      onClick={() => deleteContactMutation.mutate(contact.id)}
                      className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-600 flex-shrink-0"
                      aria-label={`Remove ${contact.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Quick actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <button
            onClick={handleShareLocation}
            disabled={sosMutation.isPending}
            className="w-full p-4 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border card-hover flex items-center gap-4 text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
              <Share2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="font-semibold">Share Live Location</p>
              <p className="text-sm text-gray-500">
                Raise an alert that includes your current coordinates
              </p>
            </div>
          </button>

          <div className="p-4 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border">
            <h2 className="font-semibold flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-primary-500" />
              Nearest Emergency Points
            </h2>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>• Emergency exits: east wing staircase, ground floor</li>
              <li>• Fire extinguishers: every floor, near the lifts</li>
              <li>• First aid: Room 101, admin block</li>
              <li>• Assembly point: main ground, east parking</li>
            </ul>
          </div>

          {(alerts?.length ?? 0) > 0 && (
            <div className="p-4 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border">
              <h2 className="font-semibold mb-3">Alert History</h2>
              <ul className="space-y-2">
                {alerts?.slice(0, 5).map((alert) => (
                  <li
                    key={alert.id}
                    className="flex items-center justify-between text-sm gap-2"
                  >
                    <span className="capitalize">{alert.type}</span>
                    <span className="text-xs text-gray-500">
                      {alert.timestamp ? new Date(alert.timestamp).toLocaleString() : ''}
                    </span>
                    <span
                      className={cn(
                        'text-xs px-2 py-0.5 rounded-full flex-shrink-0',
                        alert.status === 'active'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-green-100 text-green-700'
                      )}
                    >
                      {alert.status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
