import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      notifications: [],

      login: ({ user, token }) => set({ user, token, notifications: [] }),

      logout: () => set({ user: null, token: null, notifications: [] }),

      addNotification: (notification) => {
        const newNotification = {
          ...notification,
          id: Date.now().toString(),
          timestamp: new Date(),
          read: false,
        };
        set((state) => ({ notifications: [newNotification, ...state.notifications] }));
      },

      markNotificationAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        }));
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);

export default useAuthStore;
