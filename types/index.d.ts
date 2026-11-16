export type Note = string | null

declare module 'claude-code' {
  interface PluginState {
    'melhorar-prompt': {
      /** O rascunho antes da melhoria, para o Desfazer. */
      original: string | null
      /** Aviso do modelo ao usuário (contradição, informação em falta). */
      note: string | null
      isBusy: boolean
      /** true: modelo da sessão (fork); false: Haiku. */
      useSession: boolean
    }
  }
}
