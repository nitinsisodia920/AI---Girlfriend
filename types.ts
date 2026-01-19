
export type Mood = 'happy' | 'sad' | 'angry' | 'shy' | 'excited';

export interface Message {
  id: string;
  sender: 'user' | 'gunnu';
  text: string;
  timestamp: number;
  type: 'text' | 'image' | 'voice';
  mediaUrl?: string;
  mood?: Mood;
}

export interface UserProfile {
  name: string;
  affectionLevel: number;
  lastMood: Mood;
  chatHistory: Message[];
}

export interface VoiceConfig {
  voiceName: 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr';
}
