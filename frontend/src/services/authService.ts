import api from "@/lib/axios";

export const authService = {
  signUp: async (
    user_name: string,
    password: string,
    email: string,
    first_name: string,
    last_name: string
  ) => {
    const res = await api.post(
      "/auth/register",
      {
        user_name,
        password,
        email,
        first_name,
        last_name
      },
      { withCredentials: true }
    );

    return res.data;
  },

  signIn: async (username: string, password: string) => {
    const res = await api.post(
      "/auth/login",
      { user_name: username, password },
      { withCredentials: true }
    );
    return res.data; // access token
  },

  signOut: async () => {
    return api.post("/auth/logout", { withCredentials: true });
  },

  fetchMe: async () => {
    const res = await api.get("/home/users/me", { withCredentials: true });
    return res.data.user;
  },

  refresh: async () => {
    const res = await api.post("/auth/refresh", { withCredentials: true });
    return res.data;
  },

  updateProfile: async (display_name: string, bio?: string, phone?: string) => {
    const res = await api.put("/home/users/update", { display_name, bio, phone }, { withCredentials: true });
    return res.data;
  },

  changePassword: async (old_password: string, new_password: string) => {
    const res = await api.put("/home/users/change-password", { old_password, new_password }, { withCredentials: true });
    return res.data;
  },

  requestPasswordReset: async (email: string) => {
    const res = await api.post("/auth/forgot-password", { email });
    return res.data;
  },

  verifyOTP: async (email: string, otp: string) => {
    const res = await api.post("/auth/verify-otp", { email, otp });
    return res.data;
  },

  resetPassword: async (token: string, new_password: string) => {
    const res = await api.post("/auth/reset-password", { token, new_password });
    return res.data;
  },
};