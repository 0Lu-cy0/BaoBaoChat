import type { PublicUser } from './user';

/**
 * FriendRequest interface - matches backend IFriendRequest
 * API returns populated 'from' and 'to' fields
 */
export interface FriendRequest {
  _id: string;
  from: PublicUser;
  to: PublicUser;
  message?: string;
  createdAt: Date;
  updatedAt: Date;
}
