import type { PublicUser } from './user';

/**
 * Participant interface
 */
export interface Participant {
  userId: string;
  joinedAt: Date;
}

/**
 * Populated participant (after API populate)
 */
export interface PopulatedParticipant {
  userId: PublicUser;
  joinedAt: Date;
}

/**
 * Group information
 */
export interface Group {
  name?: string;
  normalized_name?: string;
  createdBy?: string;
  groupAvatar?: string;
  groupAvatarId?: string;
}

/**
 * Last message info
 */
export interface LastMessage {
  _id?: string;
  content?: string;
  senderId?: string;
  createdAt?: Date;
}

/**
 * Conversation interface - matches backend IConversation
 */
export interface Conversation {
  _id: string;
  type: 'direct' | 'group';
  participants: Participant[];
  group?: Group;
  lastMessageAt?: Date;
  seenBy: string[];
  lastMessage?: LastMessage | null;
  unreadCounts: Record<string, number>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Populated conversation (after API populate participants)
 */
export interface PopulatedConversation {
  _id: string;
  type: 'direct' | 'group';
  participants: PopulatedParticipant[];
  group?: Group;
  lastMessageAt?: Date;
  seenBy: string[];
  lastMessage?: LastMessage | null;
  unreadCounts: Record<string, number>;
  createdAt: Date;
  updatedAt: Date;
}
