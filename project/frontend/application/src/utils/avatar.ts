export const getAvatarUrl = (avatarUrl: string | null | undefined): string =>
  avatarUrl ?? '/api/public/avatars/default.png';