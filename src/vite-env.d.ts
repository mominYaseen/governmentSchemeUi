/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  /** `oauth2` = Google redirect; omit or any other value = demo login */
  readonly VITE_AUTH_MODE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
