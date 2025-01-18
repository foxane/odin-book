import type { User } from '@prisma/client';

interface AuthResponse {
  user: User;
  token: string;
}

interface AuthResponseError {
  message: string;
  errorDetails?: string[];
}
