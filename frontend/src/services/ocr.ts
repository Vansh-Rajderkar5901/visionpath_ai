import type { OCRResult, OCRStatus } from '@/types';
import { api } from './api';

export const ocrService = {
  /** Whether the server has a working Tesseract engine. */
  async getStatus(): Promise<OCRStatus> {
    return api.get<OCRStatus>('/api/ocr/status');
  },

  async extract(
    file: File,
    language = 'en',
    onProgress?: (progress: number) => void
  ): Promise<OCRResult> {
    return api.upload<OCRResult>('/api/ocr/extract', file, { language }, onProgress);
  },
};
