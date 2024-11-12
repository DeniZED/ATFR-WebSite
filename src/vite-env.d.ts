/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WOT_APPLICATION_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}