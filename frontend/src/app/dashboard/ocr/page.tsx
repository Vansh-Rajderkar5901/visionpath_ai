'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  AlertTriangle,
  Camera,
  Check,
  Copy,
  FileText,
  ImageIcon,
  Loader2,
  Scan,
  Upload,
  Volume2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { ocrService } from '@/services/ocr';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { useVoice } from '@/contexts/VoiceContext';
import { cn } from '@/lib/utils';
import type { OCRResult } from '@/types';

export default function OCRPage() {
  const { preferences } = useAccessibility();
  const { speak, stopSpeaking, announce, isSpeaking } = useVoice();

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<OCRResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const { data: ocrStatus } = useQuery({
    queryKey: ['ocr-status'],
    queryFn: () => ocrService.getStatus(),
    staleTime: 5 * 60 * 1000,
  });

  // Object URLs must be released or the blob stays in memory for the session.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const extractMutation = useMutation({
    mutationFn: (file: File) =>
      ocrService.extract(file, preferences.language || 'en', setProgress),
    onSuccess: (data) => {
      setResult(data);
      if (!data.text) {
        announce('No readable text was found in that image.', {
          priority: 'assertive',
          force: true,
        });
        toast('No text found in that image', { icon: '🔍' });
        return;
      }
      announce(`Text extracted. ${data.characterCount} characters found.`, {
        priority: 'assertive',
        force: true,
      });
      toast.success('Text extracted successfully');
      // For users relying on speech, reading it straight away is the point.
      if (preferences.textToSpeech) speak(data.text);
    },
    onError: (error: Error) => {
      setResult(null);
      announce(`Text extraction failed. ${error.message}`, {
        priority: 'assertive',
        force: true,
      });
      toast.error(error.message);
    },
    onSettled: () => setProgress(0),
  });

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    setResult(null);
    announce('Uploading image and extracting text.', { priority: 'assertive', force: true });
    extractMutation.mutate(file);

    // Reset so re-picking the same file fires change again.
    event.target.value = '';
  };

  const handleReadAloud = () => {
    if (!result?.text) return;
    if (isSpeaking) {
      stopSpeaking();
      return;
    }
    speak(result.text);
  };

  const handleCopy = async () => {
    if (!result?.text) return;
    try {
      await navigator.clipboard.writeText(result.text);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy — your browser blocked clipboard access.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl font-bold">OCR Reader</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Extract and read text from signs, notices, and documents
        </p>
      </motion.div>

      {ocrStatus && !ocrStatus.available && (
        <div
          role="alert"
          className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/30 flex items-start gap-3"
        >
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
              OCR engine unavailable
            </p>
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-0.5">
              {ocrStatus.message}
            </p>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upload */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <button
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'w-full aspect-[4/3] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all duration-300 bg-white dark:bg-dark-card relative overflow-hidden',
              previewUrl
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-gray-300 dark:border-dark-border hover:border-primary-400 hover:bg-gray-50 dark:hover:bg-dark-border'
            )}
            aria-label="Upload an image to read"
          >
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- blob: URLs cannot go through next/image
              <img
                src={previewUrl}
                alt="Uploaded document preview"
                className="w-full h-full object-contain p-2"
              />
            ) : (
              <div className="text-center p-8">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-dark-border flex items-center justify-center mx-auto mb-4">
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                </div>
                <p className="font-semibold text-gray-600 dark:text-gray-400">
                  Click to upload an image
                </p>
                <p className="text-sm text-gray-400 mt-1">JPG, PNG, GIF or WebP up to 10 MB</p>
              </div>
            )}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="hidden"
            aria-label="Upload image for text extraction"
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFile}
            className="hidden"
            aria-label="Capture image with camera"
          />

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={extractMutation.isPending}
              className="btn-secondary flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload Image
            </button>
            <button
              onClick={() => cameraInputRef.current?.click()}
              disabled={extractMutation.isPending}
              className="btn-secondary flex items-center justify-center gap-2"
            >
              <Camera className="w-4 h-4" />
              Capture
            </button>
          </div>
        </motion.div>

        {/* Result */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          {extractMutation.isPending && (
            <div className="p-4 rounded-2xl bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-900/30 flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-primary-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-primary-700 dark:text-primary-300">
                  {progress > 0 && progress < 100
                    ? `Uploading... ${progress}%`
                    : 'Extracting text...'}
                </p>
                <div className="w-full h-1.5 bg-primary-100 dark:bg-primary-900/40 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-primary-500 transition-all"
                    style={{ width: `${progress || 40}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {result && result.text && (
            <div className="p-4 rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/30">
              <p className="text-sm font-medium text-green-700 dark:text-green-300">
                {result.characterCount} characters found •{' '}
                {Math.round(result.confidence * 100)}% confidence
              </p>
            </div>
          )}

          <div className="rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border overflow-hidden">
            <div className="p-3 border-b border-gray-200 dark:border-dark-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary-500" />
                <span className="text-sm font-semibold">Extracted Text</span>
              </div>
              {result?.text && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleCopy}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-dark-border rounded-lg transition-colors"
                    aria-label="Copy extracted text"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={handleReadAloud}
                    className={cn(
                      'p-2 hover:bg-gray-100 dark:hover:bg-dark-border rounded-lg transition-colors',
                      isSpeaking && 'text-primary-500 animate-pulse'
                    )}
                    aria-label={isSpeaking ? 'Stop reading' : 'Read text aloud'}
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            <div className="p-4 min-h-[300px] max-h-[500px] overflow-y-auto">
              {result?.text ? (
                <pre className="text-sm font-mono whitespace-pre-wrap text-gray-800 dark:text-gray-200">
                  {result.text}
                </pre>
              ) : extractMutation.isPending ? (
                <div className="flex items-center justify-center h-full min-h-[260px]">
                  <div className="text-center space-y-2">
                    <Scan className="w-8 h-8 text-primary-500 animate-pulse mx-auto" />
                    <p className="text-sm text-gray-400">Processing...</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full min-h-[260px]">
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

          {result?.text && (
            <button
              onClick={handleReadAloud}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <Volume2 className="w-4 h-4" />
              {isSpeaking ? 'Stop Reading' : 'Read Aloud'}
            </button>
          )}
        </motion.div>
      </div>
    </div>
  );
}
