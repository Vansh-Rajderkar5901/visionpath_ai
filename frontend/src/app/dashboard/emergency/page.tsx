'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Phone,
  MapPin,
  Users,
  Shield,
  Ambulance,
  Share2,
  Loader2,
  CheckCircle,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useVoice } from '@/contexts/VoiceContext';
import toast from 'react-hot-toast';

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

const emergencyContacts: EmergencyContact[] = [
  { id: '1', name: 'Campus Security', phone: '1999', relationship: 'Security' },
  { id: '2', name: 'Medical Emergency', phone: '1998', relationship: 'Medical' },
  { id: '3', name: 'Sarah Johnson', phone: '+1 555-0123', relationship: 'Emergency Contact' },
  { id: '4', name: 'Dr. Michael Chen', phone: '+1 555-0124', relationship: 'Faculty Advisor' },
];

export default function EmergencyPage() {
  const { announce } = useVoice();
  const [isSOSActive, setIsSOSActive] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);

  const handleSOS = async () => {
    setIsSending(true);
    setIsSOSActive(true);
    announce('Sending emergency SOS alert. Your location is being shared.', { priority: 'assertive', force: true });

    // Simulate emergency alert
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsSending(false);
    announce('Emergency alert sent. Help is on the way.', { priority: 'assertive', force: true });
    toast.success('Emergency alert sent! Help is on the way.', { duration: 5000 });
  };

  const handleCancelSOS = () => {
    setIsSOSActive(false);
    announce('Emergency alert cancelled.', { priority: 'assertive', force: true });
    toast.success('Emergency alert cancelled');
  };

  const handleCall = (phone: string) => {
    announce(`Calling ${phone}.`, { priority: 'assertive', force: true });
    toast.success(`Calling ${phone}...`);
  };

  const handleShareLocation = () => {
    announce('Location shared with emergency contacts.', { priority: 'assertive', force: true });
    toast.success('Location shared with emergency contacts');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
          <AlertTriangle className="w-7 h-7 text-red-500" />
          Emergency SOS
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Quick access to emergency services and contacts
        </p>
      </motion.div>

      {/* SOS Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex justify-center"
      >
        {!isSOSActive ? (
          <button
            onClick={handleSOS}
            disabled={isSending}
            className={cn(
              'w-48 h-48 rounded-full bg-gradient-to-br from-red-500 to-red-700 shadow-2xl shadow-red-500/40 flex flex-col items-center justify-center text-white transition-all duration-300',
              'hover:scale-105 hover:shadow-red-500/60 active:scale-95',
              'focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-offset-4 dark:focus:ring-offset-dark-bg'
            )}
            aria-label="Activate emergency SOS"
          >
            {isSending ? (
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
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="text-center"
          >
            <div className="w-48 h-48 rounded-full bg-gradient-to-br from-green-500 to-green-700 shadow-2xl shadow-green-500/40 flex flex-col items-center justify-center text-white mb-4">
              <CheckCircle className="w-16 h-16 mb-2" />
              <span className="text-lg font-bold">HELP ON THE WAY</span>
              <span className="text-sm opacity-80">Your location shared</span>
            </div>
            <button
              onClick={handleCancelSOS}
              className="btn-secondary text-red-600 border-red-300 hover:bg-red-50"
            >
              Cancel SOS
            </button>
          </motion.div>
        )}
      </motion.div>

      {/* Active Alert Indicator */}
      {isSOSActive && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30"
        >
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <p className="text-sm font-medium text-red-700 dark:text-red-300">
              Emergency alert active — your location is being shared with emergency contacts
            </p>
          </div>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Emergency Contacts */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="p-4 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border">
            <h2 className="font-semibold flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-red-500" />
              Emergency Contacts
            </h2>
            <div className="space-y-2">
              {emergencyContacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => handleCall(contact.phone)}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-border transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold',
                      contact.relationship === 'Security' ? 'bg-blue-100 text-blue-700' :
                      contact.relationship === 'Medical' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-700'
                    )}>
                      {contact.relationship === 'Security' ? <Shield className="w-5 h-5" /> :
                       contact.relationship === 'Medical' ? <Ambulance className="w-5 h-5" /> :
                       <Phone className="w-5 h-5" />}
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-sm">{contact.name}</p>
                      <p className="text-xs text-gray-500">{contact.relationship}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-primary-600">{contact.phone}</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          {/* Share Location */}
          <button
            onClick={handleShareLocation}
            className="w-full p-4 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border card-hover flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Share2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-left">
              <p className="font-semibold">Share Live Location</p>
              <p className="text-sm text-gray-500">Update emergency contacts with your real-time location</p>
            </div>
          </button>

          {/* Call Security */}
          <button
            onClick={() => handleCall('1999')}
            className="w-full p-4 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border card-hover flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <Shield className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="text-left">
              <p className="font-semibold">Call Campus Security</p>
              <p className="text-sm text-gray-500">Direct line to campus security (Ext. 1999)</p>
            </div>
          </button>

          {/* Medical Help */}
          <button
            onClick={() => handleCall('1998')}
            className="w-full p-4 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border card-hover flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Ambulance className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-left">
              <p className="font-semibold">Medical Emergency</p>
              <p className="text-sm text-gray-500">Campus medical services (Ext. 1998)</p>
            </div>
          </button>

          {/* Emergency Info */}
          <div className="p-4 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border">
            <h3 className="font-semibold flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-primary-500" />
              Nearest Emergency Points
            </h3>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p>• Emergency Exits: East Wing Staircase, Ground Floor</p>
              <p>• Fire Extinguisher: Every floor, near elevators</p>
              <p>• First Aid: Room 101, Admin Block</p>
              <p>• Assembly Point: Main Ground, East Parking</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
