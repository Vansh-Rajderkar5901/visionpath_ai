'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  Camera,
  FileText,
  Volume2,
  Languages,
  Copy,
  Check,
  Loader2,
  Scan,
  Image,
} from 'lucide-react';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { useVoice } from '@/contexts/VoiceContext';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

type OCRStatus = 'idle' | 'processing' | 'complete' | 'error';

export default function OCRPage() {
  const { preferences } = useAccessibility();
  const { speak, announce } = useVoice();
  const [image, setImage] = useState<string | null>(null);
  const [status, setStatus] = useState<OCRStatus>('idle');
  const [extractedText, setExtractedText] = useState('');
  const [copied, setCopied] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target?.result as string);
      processOCR();
    };
    reader.readAsDataURL(file);
  };

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target?.result as string);
      processOCR();
    };
    reader.readAsDataURL(file);
  };

const processOCR = async () => {
    setStatus('processing');
    announce('Uploading and processing image. Extracting text.', { priority: 'assertive', force: true });
    // Simulate OCR processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mock OCR result
    const mockText = `VisionPath AI Accessibility Platform
Campus Navigation Guide
Building: Engineering Block
Floor: Second Floor
Room: Lab 204 - Computer Science Department
Hours: Monday-Friday 8:00 AM - 8:00 PM
Emergency Exit: East Wing Staircase
Nearest Washroom: Floor 2, North Corridor
Fire Assembly Point: Main Ground, East Parking Lot

Contact Information:
Department Office: Ext. 2041
IT Support: Ext. 2000
Security: Ext. 1999
Medical Emergency: Ext. 1998

Accessibility Features:
- Elevator accessible from Ground Floor
- Wheelchair ramps at all entrances
- Braille signage available
- Hearing loop installed in Lecture Hall`;

    setExtractedText(mockText);
    setStatus('complete');
    announce(`Text extracted successfully. ${mockText.length} characters found.`, { priority: 'assertive', force: true });
    toast.success('Text extracted successfully!');
  };

  const handleReadAloud = () => {
    if (!extractedText) return;
    setIsReading(true);
    speak(extractedText);
    setTimeout(() => setIsReading(false), extractedText.length * 50);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl sm:text-3xl font-bold">OCR Reader</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Extract and read text from images and documents
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left - Upload Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          {/* Upload Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'aspect-[4/3] rounded-2xl border-2 border-dashed border-gray-300 dark:border-dark-border flex flex-col items-center justify-center cursor-pointer transition-all duration-300 bg-white dark:bg-dark-card',
              image ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'hover:border-primary-400 hover:bg-gray-50 dark:hover:bg-dark-border'
            )}
          >
            {image ? (
              <img
                src={image}
                alt="Uploaded document"
                className="w-full h-full object-contain rounded-2xl p-2"
              />
            ) : (
              <div className="text-center p-8">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-dark-border flex items-center justify-center mx-auto mb-4">
                  <Image className="w-8 h-8 text-gray-400" />
                </div>
                <p className="font-semibold text-gray-600 dark:text-gray-400">
                  Drop an image or click to upload
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Supports JPG, PNG, GIF up to 10MB
                </p>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            aria-label="Upload image for OCR"
          />

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-secondary flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload Image
            </button>
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="btn-secondary flex items-center justify-center gap-2"
            >
              <Camera className="w-4 h-4" />
              Capture
            </button>
          </div>

          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleCameraCapture}
            className="hidden"
            aria-label="Capture image with camera"
          />
        </motion.div>

        {/* Right - Results Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          {/* Status Indicator */}
          {status === 'processing' && (
            <div className="p-4 rounded-2xl bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-900/30 flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-primary-600" />
              <p className="text-sm font-medium text-primary-700 dark:text-primary-300">
                Processing image... Extracting text...
              </p>
            </div>
          )}

          {status === 'complete' && (
            <div className="p-4 rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/30">
              <p className="text-sm font-medium text-green-700 dark:text-green-300">
                Text extracted successfully! {extractedText.length} characters found.
              </p>
            </div>
          )}

          {/* Extracted Text */}
          <div className="rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border overflow-hidden">
            <div className="p-3 border-b border-gray-200 dark:border-dark-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary-500" />
                <span className="text-sm font-semibold">Extracted Text</span>
              </div>
              <div className="flex items-center gap-1">
                {extractedText && (
                  <>
                    <button
                      onClick={handleCopy}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-dark-border rounded-lg transition-colors"
                      aria-label="Copy text"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={handleReadAloud}
                      disabled={isReading}
                      className={cn(
                        'p-2 hover:bg-gray-100 dark:hover:bg-dark-border rounded-lg transition-colors',
                        isReading && 'text-primary-500 animate-pulse'
                      )}
                      aria-label="Read text aloud"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 hover:bg-gray-100 dark:hover:bg-dark-border rounded-lg transition-colors"
                      aria-label="Translate text"
                    >
                      <Languages className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="p-4 min-h-[300px] max-h-[500px] overflow-y-auto">
              {status === 'complete' && extractedText ? (
                <pre className="text-sm font-mono whitespace-pre-wrap text-gray-800 dark:text-gray-200">
                  {extractedText}
                </pre>
              ) : status === 'processing' ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-2">
                    <Scan className="w-8 h-8 text-primary-500 animate-pulse mx-auto" />
                    <p className="text-sm text-gray-400">Processing...</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-2">
                    <FileText className="w-8 h-8 text-gray-300 mx-auto" />
                    <p className="text-sm text-gray-400">
                      Upload or capture an image to extract text
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          {extractedText && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-2"
            >
              <button
                onClick={handleReadAloud}
                disabled={isReading}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                <Volume2 className="w-4 h-4" />
                {isReading ? 'Reading...' : 'Read Aloud'}
              </button>
              <button className="btn-secondary flex items-center justify-center gap-2">
                <Languages className="w-4 h-4" />
                Translate
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

