import type { PublicUser } from './user';

/**
 * Friend interface - represents formatted API response from getFriends
 * Note: This is NOT the database model. Backend transforms:
 * Database: { userA: ObjectId, userB: ObjectId }
 * API Response: { _id, friendId: {...userInfo}, createdAt }
 */
export interface Friend {
  _id: string;
  friendId: PublicUser;
  createdAt: Date;
}
