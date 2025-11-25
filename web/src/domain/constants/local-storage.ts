export const LOCAL_STORAGE_KEYS = {
  accessToken: "monorepo_access_token",
  refreshToken: "monorepo_refresh_token",
  userStore: "monorepo_user_store",
  user: 'monorepo_user',
} as const;

export type LocalStorageKey =
  (typeof LOCAL_STORAGE_KEYS)[keyof typeof LOCAL_STORAGE_KEYS];
