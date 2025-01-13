declare namespace NodeJS {
  interface ProcessEnv {
    readonly JWT_SECRET?: string;
    readonly DATABASE_URL?: string;
    readonly PORT: number;

    readonly CALLBACK_URL: string;
    readonly GITHUB_CLIENT_ID: string;
    readonly GITHUB_CLIENT_SECRET: string;
  }
}
