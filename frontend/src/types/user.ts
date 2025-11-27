export interface User {
  _id: string;
  user_name: string;
  email: string;
  display_name: string;
  avatarURL?: string;
  bio?: string;
  phone?: string;
  status?: 'online' | 'offline' | 'away';
  lastSeen?: Date;
  createdAt?: string;
  updatedAt?: string;
}