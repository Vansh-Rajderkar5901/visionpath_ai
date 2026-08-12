import type { VoiceCommandResult, VoiceExample } from '@/types';
import { api } from './api';

export const voiceService = {
  /**
   * Send an utterance to the server for interpretation. When `currentNode` is
   * supplied and the command is a navigation request, the result already
   * contains the computed route.
   */
  async sendCommand(text: string, currentNode?: string | null): Promise<VoiceCommandResult> {
    return api.post<VoiceCommandResult>('/api/voice/command', {
      text,
      currentNode: currentNode || null,
    });
  },

  async getExamples(): Promise<{
    examples: VoiceExample[];
    intents: string[];
    helpText: string;
  }> {
    return api.get('/api/voice/commands');
  },
};
