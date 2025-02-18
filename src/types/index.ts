export interface Joke {
  id: string;
  content: string;
  type: 'normal' | 'dark';
  created_at?: string;
  createdAt: Date;
  likes?: number;
  reactions: {
    laugh: number;
    sad: number;
    puke: number;
  };
  imageUrl?: string | null;
} 