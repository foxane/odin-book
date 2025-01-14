import type { Profile, VerifyCallback } from 'passport-google-oauth20';

type CB = (err: unknown, user: User, info?: unknown) => void;

// TODO: FIX profile to take profile type from passport-github2
type GithubStrategyCallback = (
  _access: string,
  _refresh: string | null,
  profile: {
    id: string;
    displayName?: string;
    username: string;
    email?: string;
    photos: { value: string }[];
  },
  done: CB,
) => void;

type GoogleStrategyCallback = (
  accessToken: string,
  refreshToken: string,
  profile: Profile,
  done: VerifyCallback,
) => void;
