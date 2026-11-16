# Mod "Melhorar Prompt" — design

## Intenção
Um botão acima da caixa de prompt do Claude Code que reescreve o rascunho
para ficar claro, concreto e objetivo para o agente, sem inventar nada que
não exista no projeto ou na conversa.

## Objetivos
- Botão **✨ Melhorar prompt** troca o texto da caixa pelo prompt melhorado.
- **↩ Desfazer** devolve o texto original.
- Modelo padrão: **Haiku**. Botão de alternância **Haiku ⇄ Sessão** troca para o
  modelo da sessão (que enxerga a conversa inteira). A escolha fica salva.
- Comando `/melhorar` faz o mesmo que o botão.
- A melhoria se adapta ao tamanho do pedido:
  - **Pedido simples** ("arruma essa parte q esta ruim") → uma ou duas frases
    concretas: o quê, onde, qual problema, o que é "pronto".
    Ex.: "Na seção X de `arquivo`, melhore A, B e C; mantenha D."
  - **Pedido complexo** (iniciar projeto, feature grande) → prompt estruturado:
    Objetivo · Contexto · Requisitos · Restrições · Critério de pronto.

## Não-objetivos
- Não envia o prompt sozinho; o usuário revisa e aperta Enter.
- Não responde a tarefa, só reescreve o pedido.

## Anti-objetivos (falha mesmo que funcione)
- Inventar arquivo, função, biblioteca ou requisito que não está no contexto.
  Quando falta informação, marca `[?]` em vez de chutar.
- Mudar a intenção do usuário ou trocar o idioma dele.
- Inflar um pedido simples em um documento enorme.

## Contexto que o modelo recebe
- **Haiku** (`$.model.complete`, sem histórico próprio): o mod monta
  - `CLAUDE.md` do projeto (se houver), lista de arquivos de topo,
  - branch e arquivos alterados do git,
  - últimas ~10 mensagens da conversa (`$.session.messages()`), truncadas —
    é isso que permite resolver "essa parte".
- **Sessão** (`$.model.fork`): já vê a conversa inteira; recebe só o guia + rascunho.

## "Skills" do melhorador
Nenhuma skill de prompt existe no claude.ai do usuário, e o Haiku não carrega
skills nessa chamada. O guia vai embutido no prompt de sistema (com cache):
boas práticas de prompt da Anthropic + pontos da skill local
`writing-for-agents`, condensados em regras curtas e 2 exemplos (simples e complexo).

## Regras de saída (vindas do prompt PromptBoost)
- Prompt já bom fica igual (ex.: "Explica o que é uma API REST").
- Pode acrescentar **processo** (investigar antes, validar, resumir no fim);
  nunca **requisitos do produto** (tecnologia, biblioteca, funcionalidade).
- Todo requisito explícito continua presente.
- Contradição ou informação essencial em falta não é resolvida por escolha
  arbitrária: vai numa **nota** ao usuário (linha `NOTAS:` da resposta do
  modelo, mostrada ao lado dos botões), e o prompt mantém os dois requisitos.
- Tom informal continua informal; nada de texto corporativo.
- Rascunho e contexto entram como dados delimitados, nunca como instruções.

## Fontes do guia embutido (técnicas adaptadas, nada copiado)
- getsentry/skills `prompt-optimizer`: objetivo/contexto/restrições/critério de
  pronto; uma regra por comportamento; menor texto que preserva a restrição.
- kzhekov `Prompt-Engineering-Skill` (MIT): clareza, grounding, critérios de
  conclusão para agentes, dados externos separados de instruções.
- obra `writing-clearly-and-concisely`: voz ativa, concreto, sem palavras a mais.
- jatinmayekar `claude-code-enhance`: detectar vaguidade e requisitos ausentes —
  mas **sem** inferir requisitos nem executar a tarefa.

## Abordagens consideradas
- A: só Haiku com contexto montado — barato, mas vê pouco da conversa.
- B: só `$.model.fork` com o modelo da sessão — contexto total, mais caro.
- **Escolhida: A como padrão + B opcional por alternância** (escolha do usuário).

## Feito pelo builder (minhas decisões)
- Linha `AbovePrompt` com os botões; fallback `/melhorar` se a superfície não
  desenhar botões.
- Escolha de modelo em `$.store` (persiste entre sessões); original para
  desfazer em `$.state`.
- Timeout ~15 s no Haiku; erro vira toast e o rascunho fica intacto.
- Rascunho vazio → toast "Escreva algo primeiro".
- Mod em `~/.claude/dev-mods/<sessão>/melhorar-prompt/`, com teste do fluxo
  (ler → chamar modelo → preencher → desfazer).
