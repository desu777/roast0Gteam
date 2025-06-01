/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WALLETCONNECT_PROJECT_ID: string
  readonly VITE_TEST_ENV: string
  readonly VITE_CHAIN_ID: string
  readonly VITE_CHAIN_NAME: string
  readonly VITE_CHAIN_TOKEN: string
  readonly VITE_CHAIN_RPC: string
  readonly VITE_CHAIN_EXPLORER: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 