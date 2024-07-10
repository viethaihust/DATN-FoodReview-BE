declare namespace NodeJS {
  export interface ProcessEnv {
    MONGODB_URI: string;
    JWT_SECRET_KEY: string;
    JWT_REFRESH_TOKEN_KEY: string;
  }
}
