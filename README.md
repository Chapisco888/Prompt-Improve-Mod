# Melhorar Prompt

Mod para o Claude Code que põe um botão **✨ Melhorar prompt** acima da caixa de
prompt. Um clique reescreve o rascunho para ficar claro e concreto para o
agente, sem inventar nada e sem enviar sozinho: você revisa e aperta Enter.

## O que ele faz

- **✨ Melhorar prompt** troca o texto da caixa pelo rascunho revisado.
- **↩ Desfazer** devolve o texto original.
- **Modelo: Haiku / Modelo: sessão** escolhe quem revisa. O Haiku (padrão) é
  rápido e barato; o modelo da sessão enxerga a conversa inteira. A escolha fica
  salva.
- **`/melhorar <texto>`** faz o mesmo pelo teclado.
- Um aviso amarelo aparece quando o pedido tem requisitos incompatíveis ou uma
  referência que não dá para resolver ("essa parte" sem contexto). Nesse segundo
  caso o seu texto fica como está.

## Como ele revisa

O modelo age como revisor, não como autor. Ele só pode:

1. corrigir a escrita, mantendo o tom e o idioma;
2. trocar uma referência vaga pelo alvo concreto que a conversa mostra;
3. reorganizar o que você já disse (com quatro ou mais requisitos, vira lista
   de Objetivo, Requisitos, Etapas, Restrições);
4. numa correção de causa desconhecida, pedir para investigar antes de alterar.

Um pedido que já diz o que fazer e em quê volta igual.

| Rascunho | Resultado |
|---|---|
| `Explica o que é uma API REST.` | igual |
| `agora arruma essa parte q esta ruim` (a conversa fala da validação de e-mail em `src/Signup.tsx`) | `Agora arruma a validação de e-mail em src/Signup.tsx, que ainda rejeita endereços com '+'. Investiga a causa antes de alterar e não mexe no que já funciona.` |

No modo Haiku, o mod envia junto, como contexto, o `CLAUDE.md` do projeto, os
nomes dos arquivos da raiz, o `git status` e as 10 últimas mensagens da
conversa. As chamadas usam o cliente da própria sessão do Claude Code (entram
no `/cost`); nada vai para outro serviço.

## Instalação

No prompt de uma sessão do Claude Code no terminal:

```
/plugin install melhorar-prompt --marketplace Chapisco888/Prompt-Improve-Mod
```

Responda `y` para adicionar o marketplace e escolha o escopo (Enter para o de
usuário).

Pelo shell:

```
claude plugin install melhorar-prompt --marketplace Chapisco888/Prompt-Improve-Mod
```

No app desktop, onde `/plugin` não roda: clique em **+** ao lado da caixa de
prompt, depois **Plugins**, **Add marketplace** com
`Chapisco888/Prompt-Improve-Mod` e **Add plugin**.

## Desenvolvimento

```
claude plugin validate .
claude plugin test .
```

O guia do revisor é a constante `GUIDE` em `hooks/register.tsx`. O desenho e as
fontes das técnicas estão em `docs/`.

## Licença

MIT.
