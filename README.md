# Wildbound — Guardiões do Bosque

Protótipo de Combat Clicker 2D: clique ou toque no inimigo para atacar, receba gold, aprimore a lâmina e avance pelo bosque. Cada fase comum tem cinco inimigos; a cada dez fases, um boss. A partida é salva no próprio navegador.

## Executar localmente

Ambiente validado: Node.js 24.13.0 e npm 11.6.2.

```powershell
npm ci
npm run dev
```

Abra [http://127.0.0.1:5173](http://127.0.0.1:5173). Clique ou toque no inimigo. Pelo teclado, use Tab para focar “Atacar inimigo” e Enter/Espaço para atacar. A dica “Clique para atacar” desaparece após o primeiro golpe. O controle “Aprimorar” fica na base da tela; configurações de som, volume e movimento ficam no botão do canto superior direito.

Para gerar e servir a versão de produção:

```powershell
npm run build
npm run preview
```

O preview usa [http://127.0.0.1:4173](http://127.0.0.1:4173). Saves são vinculados à origem do navegador; desenvolvimento e preview têm armazenamentos distintos por usarem portas diferentes.

## Arquitetura

- **Engine TypeScript:** combate, economia e progressão independentes de React e PixiJS.
- **Zustand vanilla:** fonte de estado do jogo, consumida pela UI com seletores.
- **PixiJS:** floresta em camadas, personagens compostos, animação contínua e pools limitados de efeitos.
- **React, Tailwind e GSAP:** HUD, menus, contadores, feedbacks e responsividade.
- **Howler:** efeitos WAV sintetizados localmente e desbloqueados após interação.
- **SaveManager:** save versionado, validação, vida parcial e proteção contra recompensa duplicada em recargas.

Arte SVG e efeitos sonoros são produzidos no projeto. Fontes Cinzel/Nunito Sans e ícones Lucide vêm das dependências instaladas; o jogo não precisa buscar assets em serviços externos durante a partida.

## Verificação

```powershell
npm test
npm run balance
```

Há 11 testes de invariantes e persistência. A análise de balanceamento utiliza as próprias fórmulas do jogo, com compra imediata após cada derrota.

Para repetir a integração e gerar screenshots, mantenha `npm run dev` ativo em outro terminal:

```powershell
npx playwright install chromium
npm run test:ui
```

O script verifica clique real no canvas, teclado, combate, compra, recarga, preferências e diálogo. Também verifica viewport sem rolagem, alinhamento da vida, dica temporária e controle de upgrade em desktop, mobile de 390/320 px e paisagem, incluindo boss. Capturas ficam em `artifacts/`. A variável opcional `CLICKER_URL` permite verificar outro servidor, como o preview de produção.

## Documentação obrigatória

Leia os quatro arquivos antes de implementar ou alterar funcionalidades e atualize os documentos afetados na mesma entrega:

1. [Diretrizes artísticas de UI/UX](docs/01-diretrizes-artisticas-ui-ux.md).
2. [Regras de negócio](docs/02-regras-de-negocio.md).
3. [Regras de arquitetura](docs/03-regras-de-arquitetura.md).
4. [Balanceamento atual](docs/04-balanceamento.md).

Essa obrigação também está no [AGENTS.md](AGENTS.md). Mudanças devem preservar a formatação dos trechos não envolvidos e seguir `karpathy-guidelines`.

## Limites desta versão

A curva é uma base de protótipo confirmada pelo usuário. A resistência passa a exigir mais cliques em fases avançadas; a documentação registra simulações e limites numéricos. Não há dano automático, ganhos offline, inventário, login, backend ou monetização. O áudio contém efeitos, sem música. O renderizador exige WebGL e não foi medido em dispositivos mobile físicos. O build mantém PixiJS em pacote separado e informa o tamanho desse vendor acima do limite padrão de aviso do Vite.
