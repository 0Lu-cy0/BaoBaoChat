import { create } from 'zustand';
import type { Friend, FriendRequest, UserWithRelationship } from '@/types/modelType';

interface FriendStore {
  // State
  friends: Friend[];
  friendRequests: FriendRequest[];
  sentRequests: FriendRequest[];
  onlineUsers: Set<string>; // User IDs
  searchResults: UserWithRelationship[];
  loadingFriends: boolean;
  loadingRequests: boolean;
  loadingSearch: boolean;

  // Actions
  setFriends: (friends: Friend[]) => void;
  setFriendRequests: (requests: FriendRequest[]) => void;
  setSentRequests: (requests: FriendRequest[]) => void;
  addFriendRequest: (request: FriendRequest) => void;
  removeFriendRequest: (requestId: string) => void;
  setOnlineUsers: (userIds: string[]) => void;
  setUserOnline: (userId: string) => void;
  setUserOffline: (userId: string) => void;
  setSearchResults: (results: UserWithRelationship[]) => void;
  clearSearchResults: () => void;
  setLoadingFriends: (loading: boolean) => void;
  setLoadingRequests: (loading: boolean) => void;
  setLoadingSearch: (loading: boolean) => void;
}

export const useFriendStore = create<FriendStore>((set) => ({
  // Initial state
  friends: [],
  friendRequests: [],
  sentRequests: [],
  onlineUsers: new Set(),
  searchResults: [],
  loadingFriends: false,
  loadingRequests: false,
  loadingSearch: false,

  // Actions
  setFriends: (friends) => set({ friends }),

  setFriendRequests: (requests) => set({ friendRequests: requests }),

  setSentRequests: (requests) => set({ sentRequests: requests }),

  addFriendRequest: (request) =>
    set((state) => ({
      friendRequests: [request, ...state.friendRequests],
    })),

  removeFriendRequest: (requestId) =>
    set((state) => ({
      friendRequests: state.friendRequests.filter((req) => req._id !== requestId),
      sentRequests: state.sentRequests.filter((req) => req._id !== requestId),
    })),

  setOnlineUsers: (userIds) => set({ onlineUsers: new Set(userIds) }),

  setUserOnline: (userId) =>
    set((state) => {
      const newOnlineUsers = new Set(state.onlineUsers);
      newOnlineUsers.add(userId);
      return { onlineUsers: newOnlineUsers };
    }),

  setUserOffline: (userId) =>
    set((state) => {
      const newOnlineUsers = new Set(state.onlineUsers);
      newOnlineUsers.delete(userId);
      return { onlineUsers: newOnlineUsers };
    }),

  setSearchResults: (results) => set({ searchResults: results }),

  clearSearchResults: () => set({ searchResults: [] }),

  setLoadingFriends: (loading) => set({ loadingFriends: loading }),

  setLoadingRequests: (loading) => set({ loadingRequests: loading }),

  setLoadingSearch: (loading) => set({ loadingSearch: loading }),
}));
