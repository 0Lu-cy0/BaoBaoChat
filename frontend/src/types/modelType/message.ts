import type { PublicUser } from './user';

/**
 * Reaction interface
 */
export interface Reaction {
  userId: string;
  emoji: string;
  createdAt: Date;
}

/**
 * Message interface - matches backend IMessage (with populated senderId)
 */
export interface Message {
  _id: string;
  conversationId: string;
  senderId: PublicUser;
  isRecall: boolean;
  content?: string;
  imgUrl?: string;
  reactions: Reaction[];
  replyTo?: string;
  createdAt: Date;
  updatedAt: Date;
}
