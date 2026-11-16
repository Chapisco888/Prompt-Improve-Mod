# Melhorar Prompt

**English** · [Português](README.pt-BR.md)

A [Claude Code](https://claude.com/claude-code) mod that adds a **✨ Melhorar prompt** ("Improve prompt") button above the prompt box. One click rewrites what you typed into a clearer, more concrete request for the agent. It never sends anything for you: you read the result and press Enter yourself.

```
┌──────────────────────────────────────────────────────────┐
│ [✨ Melhorar prompt] [↩ Desfazer] [Modelo: Haiku]         │
│ ⚠ Say which part you want fixed and what is wrong with it │
├──────────────────────────────────────────────────────────┤
│ > agora arruma essa parte q esta ruim                     │
└──────────────────────────────────────────────────────────┘
```

> The button labels and the instructions given to the model are in Portuguese. The model answers in the language of your draft, so English drafts come back in English. A Portuguese draft is what the mod has been tested on most.

## What it is for

Vague requests make agents guess. "Fix that part, it's bad" forces Claude to work out which part, what is wrong with it and what "fixed" means. This mod does that step for you, using what the project and the conversation already say, and it is built to **not invent anything** while doing it.

It acts as a **reviewer, not an author**. It may only:

1. **Fix the writing** (spelling, abbreviations, punctuation), keeping your tone and language.
2. **Replace a vague reference** ("that part", "it", "the bug") with the concrete target the conversation shows.
3. **Reorganize what you already said.** With four or more requirements, steps or constraints it becomes a short list (Objective, Requirements, Steps, Constraints); with fewer it stays as sentences.
4. **For a bug with an unknown cause**, add one sentence asking the agent to find the cause before changing anything and to leave what already works alone.

Everything else is off limits: it does not add technologies, libraries, features or steps you did not mention, and it never drops or weakens a requirement. A request that already says what to do and where comes back **unchanged**.

## Examples

| You write | You get |
|---|---|
| `Explica o que é uma API REST.` | unchanged |
| `Cria um site em React, sem bibliotecas de UI, com tema escuro e suporte a português.` | unchanged: every requirement is already there |
| `faz um texto simples sobre java e o futuro dele mas n quero q fique mt formal` | `Faz um texto simples sobre Java e o futuro dele, mas não quero que fique muito formal.` |
| `agora arruma essa parte q esta ruim` (the conversation was about e-mail validation in `src/Signup.tsx`) | `Agora arruma a validação de e-mail em src/Signup.tsx, que ainda rejeita endereços com '+'. Investiga a causa antes de alterar e não mexe no que já funciona.` |
| `agora arruma essa parte q esta ruim` (nothing says which part) | your text stays as it is, and a warning asks what is missing |
| `Cria uma aplicação completamente offline que consulta dados atualizados de uma API externa em tempo real.` | unchanged, plus a warning: the two requirements conflict, decide which one wins |

When the request is a long project description, the result is structured:

```
Objetivo: criar um app de lista de tarefas.

Requisitos:
- Ter login.
- Salvar as tarefas no banco.
- Usar Next e Postgres.
- Ter modo escuro.

Etapas:
1. Antes de tudo, mostrar um plano para eu aprovar.

Restrições:
- Não usar nenhuma biblioteca de UI.
```

These outputs come from running the mod's instructions on Haiku in a command-line harness (12 test drafts, two runs each). Results vary a little from run to run.

## How it works

1. You type a draft and click **✨ Melhorar prompt** (or run `/melhorar`).
2. The mod reads the draft from the prompt box.
3. It asks a model to review it:
   - **Haiku (default).** Called with the draft plus a small context the mod collects: the project's `CLAUDE.md` (first 4,000 characters), the file names at the project root, `git status`, and the last 10 messages of the conversation. The context is only used to resolve vague references. It has a 30-second limit.
   - **Session model.** Forks the live conversation, so the model already sees everything, and only receives the instructions and your draft. It is more aware and more expensive. If the conversation is still empty it falls back to Haiku.
4. The reply is split into the revised request and an optional warning.
5. If the request contains `[?]` (a target that could not be resolved), the draft is left untouched and only the warning is shown. Otherwise the box is replaced with the new text.

Your draft, the context and the reply go through the Claude Code session's own API client, so the cost appears in `/cost`. Nothing is sent to any other service. If the model fails or times out, your text stays as it was.

## Controls

| Control | What it does |
|---|---|
| **✨ Melhorar prompt** | Rewrites the draft in the prompt box. |
| **↩ Desfazer** | Puts the original text back. It disappears once you send a prompt. |
| **Modelo: Haiku / Modelo: sessão** | Switches the reviewer. The choice is saved across sessions. |
| **`/melhorar [text]`** | Same as the button. With text it improves that text; without, the draft in the box. |
| Yellow warning | Shown when requirements conflict or a reference cannot be resolved. One sentence. |

## Install

In a Claude Code session in the terminal:

```
/plugin install melhorar-prompt --marketplace Chapisco888/Prompt-Improve-Mod
```

Answer `y` to add the marketplace, then pick a scope (Enter for the user scope).

From a shell:

```
claude plugin install melhorar-prompt --marketplace Chapisco888/Prompt-Improve-Mod
```

In the desktop app, where `/plugin` does not run: click **+** next to the prompt box, then **Plugins**, **Add marketplace** with `Chapisco888/Prompt-Improve-Mod`, then **Add plugin**.

## Known limits

- The buttons only appear on surfaces that draw the band above the prompt; `/melhorar` works everywhere the mod loads.
- The reviewer is a model, so it can still be wrong. Always read the result before sending.
- The session-model mode has not been tested end to end.
- Installing through the marketplace has not been tested on a clean machine.
- The wording of the instructions was tuned on a small set of drafts, mostly in Portuguese.

## Development

```
claude plugin validate .
claude plugin test .
```

| Path | Contents |
|---|---|
| `hooks/register.tsx` | The mod: button band, `/melhorar` command, context collection, the model call and the `GUIDE` constant with the reviewer's instructions. |
| `hooks/register.test.tsx` | Tests of the button, undo, failure handling, unresolved targets and session mode. |
| `types/index.d.ts` | The mod's saved values: original draft, warning, busy flag, chosen model. |
| `.claude-plugin/` | `plugin.json` and `marketplace.json`, which make this repository installable. |
| `docs/` | The design notes (in Portuguese). |

The instructions in `GUIDE` adapt ideas from public prompt-engineering guides (getsentry `prompt-optimizer`, kzhekov `Prompt-Engineering-Skill`, obra `writing-clearly-and-concisely`, jatinmayekar `claude-code-enhance`). They are rewritten, not copied.

## License

MIT, see [LICENSE](LICENSE).
