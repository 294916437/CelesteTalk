import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/types/user";
import { setCookie, removeCookie } from "@/utils/utils";

export interface UserState {
  user: User | null;
  setUser: (user: UserState["user"]) => void;
  clearUser: () => void;
}

const STORAGE_KEY = "user-storage";

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => {
        if (user) {
          setCookie(
            "auth-user",
            JSON.stringify({
              id: user._id,
              username: user.username,
            })
          );
        } else {
          removeCookie("auth-user");
        }
        set({ user });
      },
      clearUser: () => {
        removeCookie("auth-user");
        set({ user: null });
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        user: state.user,
      }),
    }
  )
);
