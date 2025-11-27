import type { User } from './modelType/user'

export interface AuthState {
  accessToken: string | null;
  user: User | null;
  loading: boolean;

  clearState: () => void;
  isCheckingAuth: boolean;
  checkAuth: () => Promise<void>;

  signup: (user_name: string, password: string, email: string, first_name: string, last_name: string) => Promise<void>;
  signin: (user_name: string, password: string) => Promise<void>;
  signout: () => Promise<void>;
  refresh: () => Promise<boolean>;
  updateProfile: (display_name: string, bio?: string, phone?: string) => Promise<{ message: string; user: User }>;
}