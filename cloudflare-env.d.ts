declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
    EMAIL_API_KEY?: string;
    EMAIL_FROM?: string;
    EXPO_ACCESS_TOKEN?: string;
    APP_URL?: string;
  }
}
