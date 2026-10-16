# 3. Regras de arquitetura do projeto

## Finalidade e situação atual

Este documento define os limites técnicos do Combat Clicker 2D a partir do briefing do usuário. Deve ser lido com os outros três documentos antes de implementar ou alterar funcionalidades.

O protótipo foi implementado em 16/10/2026 com a separação abaixo. O build e os testes estão disponíveis pelos scripts de `package.json`; a instalação reproduzível usa `npm ci` e o `package-lock.json` versionado junto ao código.

## Stack obrigatória

| Tecnologia | Responsabilidade |
| --- | --- |
| Vite | Desenvolvimento local e build |
| React | Interface, HUD, menus e controles |
| TypeScript | Tipagem e contratos do projeto |
| PixiJS | Renderização e animação do mundo 2D |
| Tailwind CSS | Estilização e responsividade da interface |
| GSAP | Animações da UI, microinterações e sequências especiais |
| Zustand | Estado de jogo compartilhado e consumo seletivo pela UI |
| Howler.js | Efeitos sonoros e música |

Versões instaladas nesta entrega: Vite 8.3.4, React/React DOM 19.3.1, TypeScript 5.9.3, PixiJS 8.22.0, Tailwind CSS 4.3.3, GSAP 3.15.0, Zustand 5.0.15 e Howler 2.2.4. Decimal.js 10.6.0 trata números grandes, Lucide fornece ícones e Fontsource distribui fontes locais. Vitest e Playwright verificam regras e integração. O ambiente validado usa Node 24.13.0 e npm 11.6.2.

## Separação de responsabilidades

### Engine: regras do jogo

Deve calcular dano, vida, derrotas, recompensas, compras, fases e escalonamento. Não pode importar componentes React, objetos PixiJS, timelines GSAP ou instâncias de áudio para decidir resultados.

Fórmulas e transições de estado devem ser verificáveis sem montar a interface ou iniciar um canvas. A engine informa o que ocorreu; apresentação e áudio decidem como representá-lo.

### Renderização: mundo e efeitos

PixiJS controla cenário, personagens, sprites, parallax, partículas, números de dano e atualizações visuais contínuas por ticker. Transformações e estado temporário de efeitos pertencem a essa camada.

O renderizador observa estado e eventos. Não decide recompensa, custo, dano ou avanço de fase. A remoção de um sprite ou o término de uma animação não podem conceder gold novamente.

### Interface: apresentação e intenção do jogador

React, Tailwind e GSAP apresentam HUD, barras, controles, configurações e feedback de interface. A UI envia comandos e apresenta resultados; não implementa cópias das fórmulas de economia ou combate.

Após o redesign, `App.tsx` compõe uma única tela que ocupa `100dvh`: canvas, HUD e upgrade sobrepostos, sem header/footer de website. Textos e componentes visuais seguem a política estrita do documento de UI/UX. Configurações continuam em diálogo nativo, com foco modal e fechamento por Escape.

A UI pode sobrepor o canvas, com tratamento explícito de eventos e áreas interativas para evitar bloqueios de clique e ataques ao pressionar botões.

### Estado compartilhado

Zustand mantém a interface compartilhada de estado. Deve existir uma única representação autoritativa do progresso e da economia; não manter saldos ou vidas independentes na engine, na UI e no renderizador.

A engine recebe uma store vanilla criada por `createGameStore`. Esse objeto é a única fonte de progresso; React o consome por `useStore` com seletores. Dano, custo, vida máxima e recompensa são derivados pela configuração. Cópias apenas visuais, como o contador interpolado, não decidem regras.

Não atualizar posições, alpha, escalas de partículas ou transformações por frame no Zustand. Use seletores específicos em React e mantenha animação contínua no renderizador ou na camada de animação correspondente.

## Fluxo de uma interação

1. A entrada do jogador identifica uma intenção válida de atacar ou comprar.
2. A engine valida o estado e aplica a regra uma única vez.
3. O estado autoritativo é atualizado de forma coerente com o resultado.
4. Eventos tipados descrevem o que aconteceu.
5. Renderizador, UI e áudio apresentam o resultado conforme suas responsabilidades.
6. A persistência registra os dados necessários para restauração segundo a política definida na implementação.

Animações podem continuar após a transição lógica. A correção das regras não pode depender do sucesso ou do tempo de um efeito visual.

## Organização de diretórios

O briefing propõe a organização abaixo como referência. Não é obrigatório criar todos os arquivos ou extrair um sistema para cada regra pequena. Adapte a estrutura quando houver uma solução mais simples, mantendo os limites das camadas.

```text
docs/
src/
  app/
  game/
    engine/
    rendering/
      scenes/
      entities/
      backgrounds/
    effects/
    animation/
    config/
  ui/
    components/
    hud/
    upgrades/
    menus/
  store/
  audio/
  persistence/
  assets/
    sprites/
    backgrounds/
    effects/
    sounds/
  styles/
```

### Estrutura efetiva

| Arquivo ou diretório | Responsabilidade atual |
| --- | --- |
| `src/main.tsx` | Entrada React e fontes locais |
| `src/app/App.tsx` | Composição da tela, HUD e feedbacks GSAP |
| `src/app/runtime.ts` | Integra engine, store, save, áudio e comandos |
| `src/game/config/balance.ts` | Fórmulas, nomes de inimigos e formatação numérica |
| `src/game/config/presentation.ts` | Tema semântico, durações e limites de efeitos |
| `src/game/engine/types.ts` | Estado, preferências, save e eventos tipados |
| `src/game/engine/GameEngine.ts` | Combate, compra, progressão, transição e snapshot |
| `src/game/rendering/art.ts` | Ilustrações SVG originais por camada/parte |
| `src/game/rendering/GameRenderer.ts` | PixiJS, ticker, entrada no canvas e pools de efeitos |
| `src/store/gameStore.ts` | Store vanilla e estado inicial |
| `src/audio/AudioManager.ts` | Síntese WAV, Howler, volume e limite de sobreposição |
| `src/persistence/SaveManager.ts` | Validação, recuperação, proteção de versões e gravação |
| `src/ui/` | Configurações e contador animado reutilizável |
| `src/styles/index.css` | Tailwind, tema, estados e layouts responsivos |
| `tests/game.test.ts` | Invariantes e casos de borda de regras e save |
| `scripts/verify-ui.mjs` | Fluxos reais no navegador e screenshots |
| `scripts/analyze-balance.ts` | Simulação que reutiliza as fórmulas atuais |

Não foram criados diretórios vazios ou sistemas separados sem necessidade. Os efeitos pertencem ao renderizador nesta escala de protótipo; extraí-los só quando a evolução justificar. O componente de UI não calcula preços ou dano por conta própria.

### Integração de layout com a HUD

`GameRenderer` oferece o callback opcional `onLayout(SceneLayout)`, com posição do inimigo, terreno, escala e tipo do encontro. Ele é emitido em resize e troca de encontro. A UI usa refs para posicionar vida e foco de ataque sem atualizações por frame em React/Zustand. A escala se adapta à viewport para preservar espaço para HUD e upgrade; arte e animações não são substituídas.

As mesmas ilustrações SVG são rasterizadas na resolução configurada, com tamanho lógico preservado pelo `ImageSource`, para manter nitidez com personagens maiores. O cenário conserva suas proporções. Números longos usam composição compacta na HUD mobile sem alterar os valores de jogo.

O callback opcional `goldTarget()` informa o centro do ícone de gold em coordenadas do canvas. O renderizador o consulta uma vez por recompensa para direcionar as moedas ao contador real. Não há leitura de layout DOM a cada frame. Esses contratos são de apresentação e não interferem na engine.

Ataques por ponteiro continuam sendo tratados pelo PixiJS. O botão acessível de ataque não intercepta o ponteiro; recebe foco pelo teclado e encaminha a mesma intenção de ataque ao runtime. A dica inicial é derivada do progresso existente e removida ao primeiro golpe, sem alterar o formato de persistência.

## Contratos e eventos

Use TypeScript para estado, comandos, configurações, dados persistidos e eventos. Prefira contratos pequenos e explícitos a abstrações antecipadas.

Eventos sugeridos pelo briefing:

| Evento | Significado esperado |
| --- | --- |
| `enemy:damaged` | Dano aplicado ao alvo |
| `enemy:defeated` | Derrota registrada uma única vez |
| `gold:earned` | Recompensa incorporada ao saldo |
| `upgrade:purchased` | Compra concluída com custo debitado e melhoria aplicada |
| `stage:completed` | Objetivo da fase concluído |
| `stage:started` | Nova fase inicializada |
| `boss:spawned` | Boss preparado para o encontro |
| `boss:defeated` | Derrota do boss registrada |

Esses são os eventos existentes em `types.ts`; `enemy:hit` não foi criado porque repetiria o dano aceito. `enemy:damaged` carrega `damage`, `final` e `boss`; `enemy:defeated` carrega `boss`; `gold:earned` carrega `amount` e `boss`; `upgrade:purchased` carrega `level` e `damage`; os eventos de fase/boss carregam `stage`.

A engine faz a alteração de estado antes de emitir eventos. Em golpe fatal, a ordem é `enemy:damaged`, `enemy:defeated`, `gold:earned` e, se aplicável, `boss:defeated`. Após 260 ms ela prepara o próximo encontro; havendo mudança de fase, emite `stage:completed`, `stage:started` e, quando aplicável, `boss:spawned`. `subscribe()` retorna o cancelamento da assinatura. Compras emitidas durante uma transição são preservadas no próximo estado.

Cada evento deve carregar os dados necessários ao seu significado. Se a apresentação continuar após a troca de inimigo, preserve a identificação do encontro correspondente. Assinaturas devem ser removidas ao encerrar seus consumidores.

## Combate, economia e transições

- Centralize as fórmulas e os parâmetros descritos no documento de balanceamento.
- Aplique dano uma única vez por interação válida e recompensa uma única vez por inimigo.
- Execute validação de saldo, débito e aplicação do upgrade como uma operação coerente.
- Controle explicitamente a troca de inimigos e fases, inclusive cliques rápidos durante a morte.
- Uma animação de entrada ou morte não deve criar um segundo alvo econômico ativo por acidente.
- Não introduza críticos, dano automático ou outras mecânicas sem requisito explícito e atualização documental.

## Persistência

Use `localStorage` inicialmente e uma estrutura de save versionada. Separe serialização, leitura, validação e restauração da apresentação.

O save contém fase, progresso da fase, gold, nível de upgrade, vida parcial e preferências. Dano e custo são derivados do nível e da configuração, evitando duplicação. Na morte, `snapshot()` produz o próximo encontro já liquidado, impedindo uma segunda recompensa em recargas.

`validateSave` verifica versão, estrutura, inteiros seguros, progresso dentro do objetivo, valores finitos e não negativos, vida positiva até o máximo e preferências válidas. Ausência de save cria uma nova partida. Dados inválidos são copiados para `wildbound.save.recovery`; se a cópia falhar, o original não é sobrescrito. Uma versão superior a 1 é protegida de gravações, com aviso na interface. Falhas de armazenamento mantêm a partida em memória.

Não persistir instâncias de classes gráficas, texturas, partículas, timers de efeitos ou timelines. Preferências que forem persistidas precisam ter contrato próprio ou campos documentados no save.

Chave: `wildbound.save`. Formato atual:

```json
{
  "version": 1,
  "progress": { "stage": 1, "defeated": 0, "gold": "0", "level": 0, "hp": "30" },
  "preferences": { "muted": false, "volume": 0.45, "reducedMotion": false }
}
```

Gold e vida são strings decimais. O runtime salva em mudanças de progresso e preferências, em `pagehide` e ao ocultar a página. Não há migrações anteriores à versão 1. Mudanças de formato ou fórmulas exigem revisar a compatibilidade e documentar a decisão.

## Ciclo de vida e performance

- Inicialize e destrua canvas, ticker, listeners e assinaturas com um ciclo de vida explícito.
- Reutilize texturas e objetos temporários, com pooling quando apropriado para partículas e números flutuantes.
- Limite partículas, números e sons simultâneos; centralize esses limites.
- Remova efeitos concluídos e encerre animações antes de destruir seus alvos.
- Evite timelines concorrentes sobre a mesma propriedade e permita substituir animações em cliques rápidos.
- Trate redimensionamento e resolução de renderização conforme o dispositivo.
- Evite alocações desnecessárias em cada frame e re-renderizações amplas de React.
- Busque 60 FPS em dispositivos capazes, com redução controlada de efeitos em aparelhos limitados.

Essa meta de fluidez não é uma medição do estado atual. A implementação deverá registrar limitações observadas sem prometer FPS universal.

## Áudio e configurações

Howler.js concentra carregamento, desbloqueio após interação, volume, mute e reprodução. Consumidores de áudio reagem aos fatos do jogo e não alteram combate ou economia.

Centralize configurações de balanceamento, tema, animação, shake, transição, escala e limites de efeitos. A centralização pode usar arquivos separados por responsabilidade; não precisa virar uma configuração monolítica.

## Regras para manutenção

Antes de alterar uma funcionalidade, leia os quatro documentos e identifique a regra e a camada responsáveis. Use a skill `karpathy-guidelines`. Esclareça requisitos incertos com o usuário e evite funcionalidades ou abstrações não solicitadas.

Faça mudanças pontuais. Preserve a formatação dos trechos não envolvidos, não refatore áreas vizinhas sem necessidade e não remova código preexistente por conveniência.

Ao concluir, atualize os documentos afetados e verifique o comportamento proporcionalmente ao risco. Alterações de combate, economia ou save devem validar invariantes e casos relevantes, como cliques rápidos, saldo insuficiente, transição e restauração. Alterações apenas documentais não exigem testes de gameplay inexistente.

## Execução e verificações atuais

Use `npm ci` para instalar, `npm run dev` para desenvolver, `npm run build` para compilar e `npm run preview` para servir o build. `npm test` executa os 11 testes de regras/save; `npm run balance` simula a curva. Com o servidor ativo e Chromium instalado por `npx playwright install chromium`, `npm run test:ui` verifica integração e gera screenshots em `artifacts/`.

Build, testes de regras e fluxos de navegador passaram na entrega inicial, incluindo execução dos fluxos no preview de produção. O build informa que o pacote PixiJS minificado supera 500 kB; o vendor está separado e seu gzip é de aproximadamente 157 kB. Não há medição de 60 FPS em hardware mobile físico ou teste de uso por horas. Capturas e emulação desktop/mobile não devem ser descritas como validação universal de performance.
