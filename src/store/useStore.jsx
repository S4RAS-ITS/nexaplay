import { create } from 'zustand';

export const useKeycloakStore = create((set) => ({
  keycloakClient: null,
  setKeycloakClient: (val) => set({ keycloakClient: val }),
}));

export const useUserInfoStore = create((set) => ({
  userInfo: null,
  setUserInfo: (val) => set({ userInfo: val }),
}));