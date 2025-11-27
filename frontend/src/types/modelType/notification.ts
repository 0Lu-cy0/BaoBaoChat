import type { PublicUser } from './user';

/**
 * Notification interface - matches backend INotification (with populated relatedUser)
 */
export interface Notification {
  _id: string;
  userId: string;
  type: 'friend_request' | 'friend_accept' | 'message' | 'group_invite' | 'group_message';
  title: string;
  content: string;
  relatedId?: string;
  relatedUser?: PublicUser;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}
