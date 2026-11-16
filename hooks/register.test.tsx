import { expect, test } from 'claude-code/testing'

const BAND = {
  plugin: 'melhorar-prompt',
  component: 'AbovePrompt',
  surface: 'desktop',
  props: {
    hasSurvey: false,
    isCollapsed: false,
    isWorking: false,
    maxRows: 10,
    bodyColumns: 80,
    scroll: { offset: 0, bodyRows: 10 },
    view: {},
  },
} as const

const USAGE = { input_tokens: 1, output_tokens: 1 }

test('o botão troca o rascunho pelo prompt melhorado e o Desfazer devolve', async ($, on) => {
  let box = 'arruma essa parte q esta ruim'
  let asked = ''

  on('prompt.read', () => ({ value: { text: box, cursor: 0 } }))
  on('prompt.fill', (_, e) => {
    box = e.text

    return { isFilled: true }
  })
  on('fs.read', () => ({ value: 'Projeto de teste' }))
  on('fs.list', () => ({ value: [] }))
  on('process.run', () => ({ value: { exitCode: 0, stdout: '', stderr: '' } }))
  on('session.messages', () => ({
    value: [{ role: 'assistant', text: 'Editei src/Signup.tsx', toolUses: [] }],
  }))
  on('model.complete', (_, e) => {
    asked = `${e.model}|${e.prompt}`

    return {
      value: {
        isAnswered: true,
        text: '<pedido>Corrija o formulário em src/Signup.tsx.</pedido>\n<nota>Diga qual campo falha.</nota>',
        usage: USAGE,
      },
    }
  })

  const ui = await $.ui.mount(BAND)
  await ui.press({ key: 'improve' })

  // Haiku por padrão, com a conversa e o rascunho delimitados como dados.
  expect(asked).toContain('haiku|')
  expect(asked).toContain('Editei src/Signup.tsx')
  expect(asked).toContain('<rascunho>\narruma essa parte q esta ruim\n</rascunho>')
  // A nota não entra no prompt: vai para a linha de aviso.
  expect(box).toBe('Corrija o formulário em src/Signup.tsx.')
  expect((await ui.find({ type: 'Text', text: /Diga qual campo/ }))?.text).toContain('Diga qual campo falha.')

  await ui.press({ key: 'undo' })
  expect(box).toBe('arruma essa parte q esta ruim')
  expect(await ui.find({ key: 'undo' })).toBeUndefined()
  await ui.unmount()
})

test('falha do modelo deixa o rascunho intacto', async ($, on) => {
  let fills = 0

  on('prompt.read', () => ({ value: { text: 'algo', cursor: 0 } }))
  on('prompt.fill', () => {
    fills += 1

    return { isFilled: true }
  })
  on('fs.read', () => ({ value: '' }))
  on('fs.list', () => ({ value: [] }))
  on('process.run', () => ({ value: { exitCode: 0, stdout: '', stderr: '' } }))
  on('session.messages', () => ({ value: [] }))
  on('model.complete', () => ({
    value: { isAnswered: false, reason: 'aborted', usage: USAGE },
  }))

  const ui = await $.ui.mount(BAND)
  await ui.press({ key: 'improve' })

  expect(fills).toBe(0)
  expect(await ui.find({ key: 'undo' })).toBeUndefined()
  await ui.unmount()
})

test('alvo desconhecido: o rascunho fica e só o aviso aparece', async ($, on) => {
  let fills = 0

  on('prompt.read', () => ({ value: { text: 'arruma essa parte', cursor: 0 } }))
  on('prompt.fill', () => {
    fills += 1

    return { isFilled: true }
  })
  on('fs.read', () => ({ value: '' }))
  on('fs.list', () => ({ value: [] }))
  on('process.run', () => ({ value: { exitCode: 0, stdout: '', stderr: '' } }))
  on('session.messages', () => ({ value: [] }))
  on('model.complete', () => ({
    value: { isAnswered: true, text: '<pedido>Revise a parte [?].</pedido><nota>Diga qual parte.</nota>', usage: USAGE },
  }))

  const ui = await $.ui.mount(BAND)
  await ui.press({ key: 'improve' })

  expect(fills).toBe(0)
  expect(await ui.find({ key: 'undo' })).toBeUndefined()
  expect((await ui.find({ type: 'Text', text: /Diga qual parte/ }))?.text).toContain('Diga qual parte.')
  await ui.unmount()
})

test('no modo sessão usa o fork, sem montar contexto', async ($, on) => {
  let box = 'faz isso melhor'
  let forked = ''

  on('store.set', () => ({ value: undefined }))
  on('prompt.read', () => ({ value: { text: box, cursor: 0 } }))
  on('prompt.fill', (_, e) => {
    box = e.text

    return { isFilled: true }
  })
  on('model.fork', (_, e) => {
    forked = e.prompt

    return { value: { isAnswered: true, text: '<pedido>Refatore X.</pedido>', usage: USAGE, effort: 'low' } }
  })

  const ui = await $.ui.mount(BAND)
  await ui.press({ key: 'model' })
  await ui.press({ key: 'improve' })

  expect(forked).toContain('<rascunho>\nfaz isso melhor\n</rascunho>')
  expect(box).toBe('Refatore X.')
  await ui.unmount()
})
