declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    PORT?: string;
    SUPRESS_LOG?: boolean;

    DATABASE_URL: string;
    JWT_SECRET: string;

    SUPABASE_URL: string;
    SUPABASE_SERVICE_KEY: string;

    OAUTH_CALLBACK_URI: string;

    GITHUB_CLIENT_ID: string;
    GITHUB_CLIENT_SECRET: string;

    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
  }
}
