/**
 * User interface - matches backend IUser (without Document/Mongoose fields)
 */
export interface User {
  _id: string;
  user_name: string;
  email: string;
  display_name: string;
  normalized_display_name?: string;
  avatarURL?: string;
  avatarID?: string;
  bio?: string;
  phone?: string;
  status?: 'online' | 'offline' | 'away';
  lastSeen?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Public user info (returned by search, populate, etc.)
 */
export interface PublicUser {
  _id: string;
  user_name: string;
  display_name: string;
  avatarURL?: string;
  bio?: string;
  status?: 'online' | 'offline' | 'away';
  lastSeen?: Date;
}

/**
 * User with relationship status (returned by searchUsers)
 */
export interface UserWithRelationship extends PublicUser {
  relationshipStatus?: 'friend' | 'sent' | 'received' | 'none';
  requestId?: string;
}