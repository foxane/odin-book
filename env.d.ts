declare namespace NodeJS {
  interface ProcessEnv {
    readonly JWT_SECRET?: string;
    readonly DATABASE_URL?: string;
    readonly PORT: number;
  }
}
