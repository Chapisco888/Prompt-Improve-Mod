# Melhorar Prompt

[English](README.md) · **Português**

Mod para o [Claude Code](https://claude.com/claude-code) que põe um botão **✨ Melhorar prompt** acima da caixa de prompt. Um clique transforma o que você escreveu em um pedido mais claro e concreto para o agente. Ele nunca envia nada por você: você lê o resultado e aperta Enter.

```
┌──────────────────────────────────────────────────────────┐
│ [✨ Melhorar prompt] [↩ Desfazer] [Modelo: Haiku]         │
│ ⚠ Diga qual parte você quer arrumar e o que está ruim     │
├──────────────────────────────────────────────────────────┤
│ > agora arruma essa parte q esta ruim                     │
└──────────────────────────────────────────────────────────┘
```

> O mod foi testado principalmente com rascunhos em português. A resposta sai no idioma do rascunho, então um rascunho em inglês volta em inglês.

## Para que serve

Pedido vago faz o agente adivinhar. "Arruma essa parte que está ruim" obriga o Claude a descobrir qual parte, o que está ruim e o que significa "arrumado". O mod faz esse passo por você, usando o que o projeto e a conversa já dizem, e foi feito para **não inventar nada** no processo.

Ele age como **revisor, não como autor**. Só pode:

1. **Corrigir a escrita** (ortografia, abreviações, pontuação), mantendo seu tom e idioma.
2. **Trocar uma referência vaga** ("essa parte", "isso", "o bug") pelo alvo concreto que a conversa mostra.
3. **Reorganizar o que você já disse.** Com quatro ou mais requisitos, etapas ou restrições, vira uma lista curta (Objetivo, Requisitos, Etapas, Restrições); com menos, continua em frases.
4. **Em um bug de causa desconhecida**, acrescentar uma frase pedindo para o agente achar a causa antes de alterar e não mexer no que já funciona.

Todo o resto é proibido: ele não acrescenta tecnologias, bibliotecas, funcionalidades ou etapas que você não citou, e nunca remove nem enfraquece um requisito. Um pedido que já diz o que fazer e onde volta **igual**.

## Exemplos

| Você escreve | Você recebe |
|---|---|
| `Explica o que é uma API REST.` | igual |
| `Cria um site em React, sem bibliotecas de UI, com tema escuro e suporte a português.` | igual: todos os requisitos já estão lá |
| `faz um texto simples sobre java e o futuro dele mas n quero q fique mt formal` | `Faz um texto simples sobre Java e o futuro dele, mas não quero que fique muito formal.` |
| `agora arruma essa parte q esta ruim` (a conversa era sobre a validação de e-mail em `src/Signup.tsx`) | `Agora arruma a validação de e-mail em src/Signup.tsx, que ainda rejeita endereços com '+'. Investiga a causa antes de alterar e não mexe no que já funciona.` |
| `agora arruma essa parte q esta ruim` (nada diz qual parte) | seu texto continua como está, e um aviso pergunta o que falta |
| `Cria uma aplicação completamente offline que consulta dados atualizados de uma API externa em tempo real.` | igual, mais um aviso: os dois requisitos entram em conflito, decida qual vale |

Quando o pedido é uma descrição longa de projeto, o resultado vem estruturado:

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

Essas saídas vêm de rodar as instruções do mod no Haiku, por linha de comando (12 rascunhos de teste, duas rodadas cada). O resultado varia um pouco de uma rodada para outra.

## Como funciona

1. Você escreve um rascunho e clica em **✨ Melhorar prompt** (ou usa `/melhorar`).
2. O mod lê o rascunho da caixa de prompt.
3. Ele pede a um modelo que revise:
   - **Haiku (padrão).** Recebe o rascunho mais um contexto pequeno que o mod monta: o `CLAUDE.md` do projeto (primeiros 4.000 caracteres), os nomes dos arquivos da raiz, o `git status` e as 10 últimas mensagens da conversa. O contexto só serve para resolver referências vagas. Tem limite de 30 segundos.
   - **Modelo da sessão.** Faz um fork da conversa viva, então o modelo já enxerga tudo e recebe apenas as instruções e o seu rascunho. É mais consciente do contexto e mais caro. Se a conversa ainda estiver vazia, usa o Haiku.
4. A resposta é separada em pedido revisado e um aviso opcional.
5. Se o pedido tiver `[?]` (um alvo que não deu para resolver), o rascunho fica intacto e só o aviso aparece. Caso contrário, a caixa é substituída pelo novo texto.

Seu rascunho, o contexto e a resposta passam pelo cliente de API da própria sessão do Claude Code, então o custo aparece no `/cost`. Nada é enviado a outro serviço. Se o modelo falhar ou estourar o tempo, seu texto continua como estava.

## Controles

| Controle | O que faz |
|---|---|
| **✨ Melhorar prompt** | Reescreve o rascunho da caixa de prompt. |
| **↩ Desfazer** | Devolve o texto original. Some depois que você envia um prompt. |
| **Modelo: Haiku / Modelo: sessão** | Troca o revisor. A escolha fica salva entre sessões. |
| **`/melhorar [texto]`** | Igual ao botão. Com texto, melhora esse texto; sem, o rascunho da caixa. |
| Aviso amarelo | Aparece quando há requisitos em conflito ou uma referência sem solução. Uma frase. |

## Instalação

Em uma sessão do Claude Code no terminal:

```
/plugin install melhorar-prompt --marketplace Chapisco888/Prompt-Improve-Mod
```

Responda `y` para adicionar o marketplace e escolha o escopo (Enter para o de usuário).

Pelo shell:

```
claude plugin install melhorar-prompt --marketplace Chapisco888/Prompt-Improve-Mod
```

No app desktop, onde `/plugin` não roda: clique em **+** ao lado da caixa de prompt, depois **Plugins**, **Add marketplace** com `Chapisco888/Prompt-Improve-Mod` e **Add plugin**.

## Limites conhecidos

- Os botões só aparecem nas superfícies que desenham a faixa acima do prompt; `/melhorar` funciona onde o mod carregar.
- O revisor é um modelo, então ainda pode errar. Leia o resultado antes de enviar.
- O modo "modelo da sessão" não foi testado de ponta a ponta.
- A instalação pelo marketplace não foi testada em uma máquina limpa.
- O texto das instruções foi ajustado com poucos rascunhos, a maioria em português.

## Desenvolvimento

```
claude plugin validate .
claude plugin test .
```

| Caminho | Conteúdo |
|---|---|
| `hooks/register.tsx` | O mod: faixa de botões, comando `/melhorar`, coleta de contexto, chamada ao modelo e a constante `GUIDE` com as instruções do revisor. |
| `hooks/register.test.tsx` | Testes do botão, do desfazer, de falhas, de alvo não resolvido e do modo sessão. |
| `types/index.d.ts` | Os valores que o mod guarda: rascunho original, aviso, indicador de ocupado, modelo escolhido. |
| `.claude-plugin/` | `plugin.json` e `marketplace.json`, que tornam este repositório instalável. |
| `docs/` | As notas de design (em português). |

As instruções de `GUIDE` adaptam ideias de guias públicos de engenharia de prompt (getsentry `prompt-optimizer`, kzhekov `Prompt-Engineering-Skill`, obra `writing-clearly-and-concisely`, jatinmayekar `claude-code-enhance`). Foram reescritas, não copiadas.

## Licença

MIT, veja [LICENSE](LICENSE).
