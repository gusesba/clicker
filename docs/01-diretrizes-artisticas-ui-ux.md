# 1. Diretrizes artísticas de UI/UX

## Finalidade e situação atual

Este documento orienta toda criação ou alteração visual do Combat Clicker 2D. Sua referência é o briefing fornecido pelo usuário, intitulado “Combat Clicker 2D — Protótipo UI/UX”. Deve ser consultado junto aos outros três documentos antes de implementar uma funcionalidade.

O protótipo implementado em 16/10/2026 se chama **Wildbound — Guardiões do Bosque**. Há uma floresta vetorial em camadas, herói composto por partes, três criaturas comuns, um boss e interface responsiva. As regras abaixo continuam obrigatórias para novas funcionalidades.

O redesign solicitado em “Refatoração de UI/UX — Combat Clicker 2D” substitui a composição de página pela tela de jogo. Cenário, personagens, animações e mecânicas são preservados. A riqueza visual vem da arte e do acabamento; informações permanentes ficam restritas às decisões do combate.

## Identidade implementada

| Elemento | Escolha atual | Fonte |
| --- | --- | --- |
| Mundo | Floresta Sussurrante; fantasia de bosque, musgo e luz dourada | `src/game/rendering/art.ts` |
| Herói | Kael, guardião com capa terracota, túnica verde e espada clara | Texturas separadas de capa, corpo, cabeça e braço/espada |
| Criaturas | Broto travesso, cogumelo errante e pedrinha ancestral | Variações visuais, sem diferença de atributos na mesma fase |
| Boss | Ancião das raízes | Ilustração própria, atmosfera violeta discreta e barra dourada |
| Verde principal | `#153c34` | Tema e `presentation.ts` |
| Gold | `#e7bf67` | Tema e `presentation.ts` |
| Verde claro | `#a8d6ae` | Tema e `presentation.ts` |
| Superfícies da HUD | `#35533c` e `#203b2b`, com contornos dourados | Upgrade e configurações integrados ao bosque |
| Acento de boss | `#ef977e` | Configuração semântica de apresentação |
| Títulos | Cinzel, pesos 600/700 | Fontes locais via Fontsource |
| Texto e números | Nunito Sans, pesos 400/600/700/800 | Fontes locais via Fontsource |

SVGs são originais, convertidos em texturas do PixiJS e reutilizados. As ilustrações não dependem de downloads em tempo de execução. Ícones são Lucide; áudio é sintetizado localmente. Não há música ambiente nesta versão.

## Intenção da experiência

O jogo deve transmitir impacto, recompensa e progressão desde os primeiros segundos. A apresentação é fantasia 2D estilizada, colorida e expressiva, com acabamento de jogo mobile comercial. Tap Titans é referência de gênero e organização visual, sem reprodução de personagens, cenários ou identidade proprietária.

A prioridade de produto é: direção artística e composição; UI/UX; impacto e responsividade; animações e microinterações; recompensas e progressão; integração técnica; mecânicas básicas; performance e estabilidade; balanceamento. Performance e estabilidade são restrições contínuas de toda entrega, mesmo com essa ordem de prioridade.

Uma funcionalidade só está visualmente concluída quando seus estados, sua interação e seu feedback estiverem coerentes com o restante do jogo.

## Identidade artística

- Use cartoon fantasy com formas claras, cores vibrantes, iluminação simulada, sombras suaves e brilhos controlados.
- Construa personagens com silhuetas reconhecíveis, cabeças ligeiramente exageradas, poses expressivas e armas ou acessórios destacados.
- Mantenha consistência de escala, contorno, iluminação e nível de detalhe entre herói, inimigos, cenário e interface.
- Dê personalidade à composição com ilustrações, sobreposição de planos e elementos ambientais sutis.
- Não entregue personagens como formas geométricas simples, placeholders genéricos, wireframes ou imagens estáticas sem animação expressiva.
- Use assets próprios, de licença compatível ou produzidos para o projeto. O funcionamento não pode depender de assets pagos ou de recursos externos indisponíveis.
- Na ausência de sprites prontos, são permitidos SVGs, texturas e formas vetoriais compostas ou procedurais do PixiJS, com acabamento coeso.
- O mundo é 2D e deve ser renderizado com PixiJS. Não usar Three.js, modelos 3D ou renderização de mundo tridimensional.

## Composição da tela

A área de combate ocupa toda a viewport, sem cabeçalho institucional, logotipo permanente, título editorial, margens de página ou rodapé. A HUD é sobreposta ao cenário. Não introduzir seções de website, painéis de dashboard, divisórias sem função ou cards para preencher espaço.

| Região | Conteúdo obrigatório | Regra de leitura e interação |
| --- | --- | --- |
| Topo | Fase e progresso à esquerda; gold e configurações à direita | Consulta rápida, ícones e números legíveis, sem subtítulos |
| Centro | Cenário, herói, um inimigo e efeitos | O combate domina a composição; o alvo é fácil de identificar e atingir |
| Próxima ao inimigo | Nome, barra de vida e identificação de boss | Distinguir vida restante e tipo do encontro sem depender só de cor |
| Base sobre o cenário | Ícone de ataque, dano atual → próximo dano, custo e botão de compra | Um único controle compacto, sem título, descrição, nível em badge ou mensagem motivacional |
| Sobreposições contextuais | Dano, recompensa, nova fase e apresentação de boss | Permanecer breves, legíveis e sem bloquear desnecessariamente o combate |
| Menu de configurações | Áudio e redução de efeitos | Mostrar claramente o estado selecionado e permitir retorno ao jogo |

A HUD não pode cobrir informações essenciais do inimigo ou interceptar cliques destinados ao combate. Botões de interface não devem disparar ataques por propagação da mesma interação.

### Política obrigatória de texto

- Durante o combate normal, manter apenas fase, progresso, gold, nome/vida do inimigo e números/ação do upgrade.
- Não usar slogans, taglines, nomes de seções, descrições redundantes, frases motivacionais ou mini-labels decorativas. Não substituir os textos removidos por variações semelhantes.
- A única orientação inicial é “Clique para atacar”, removida após o primeiro golpe válido. Um save com progresso não volta a exibi-la. A dica não cria um novo campo de persistência.
- Avanço comum de fase destaca a própria HUD; upgrade destaca o controle e o número. Não adicionar frases para acompanhar cada animação.
- Reservar apresentações textuais maiores a eventos especiais, como entrada e derrota de boss. Os avisos atuais são o nome do boss e “Boss derrotado”, temporários.
- Estado normal do save e controles de áudio ficam no menu. Um problema de save é sinalizado por um ponto no botão de configurações, com explicação funcional no menu.
- Rótulos acessíveis e anúncios para leitores de tela permanecem disponíveis, sem se tornarem texto visual permanente.

Antes de inserir texto, verificar se ele é necessário agora, muda uma decisão, já aparece em outro lugar ou pode ser comunicado visualmente. Se sua remoção não prejudicar o jogo, removê-lo.

## Linguagem visual da interface

Use peças de HUD compactas com silhuetas reconhecíveis, contornos intencionais, gradientes controlados e sombras com peso. Os detalhes decorativos reforçam fantasia RPG sem competir com o combate. Não usar cards genéricos, glassmorphism, bordas translúcidas indiscriminadas ou containers aninhados como linguagem padrão. Tailwind é ferramenta de implementação, não referência estética.

A tipografia deve ter hierarquia clara entre fase, recursos, vida e ações. Números precisam continuar legíveis sobre o cenário. Ícones devem compartilhar estilo e comunicar sua função, acompanhados de texto quando necessário.

Gold, dano, upgrades e bosses devem ter tratamentos semânticos distintos. A paleta atual está registrada acima; mudanças de identidade devem atualizar esse registro e as configurações correspondentes. O briefing autorizou decisões criativas de direção artística; essas escolhas descrevem a implementação, sem presumir uma validação artística final do usuário.

### Estados de controles

- Disponível: ação reconhecível e destaque discreto, especialmente quando houver gold para comprar.
- Hover, quando existir ponteiro: realce curto, sem deslocar o layout.
- Pressionado: resposta visual imediata de pressão ou escala.
- Indisponível: botão desabilitado e aparência distinta; gold disponível e custo continuam legíveis. Não adicionar uma descrição redundante de saldo insuficiente.
- Compra concluída: pulso, brilho ou efeito mágico, atualização do dano e do custo, mais som específico quando habilitado.
- Configuração ativada ou desativada: estado persistente visualmente identificável.

Não criar um aspecto de painel administrativo ou dashboard corporativo. Toda ação exposta deve ter comportamento real; não incluir controles decorativos que pareçam funcionalidades existentes.

A ordem de atenção é: inimigo/combate; vida; golpes; gold/progresso; upgrade disponível; configurações. Não usar tipografia grande para criar impacto editorial na tela de gameplay.

## Cenário e personagens

### Cenário

Organize a cena em planos: fundo distante; atmosfera; estruturas ou vegetação distante; cenário intermediário; terreno de combate; personagens; efeitos de combate; primeiro plano. Use parallax discreto, iluminação simulada e animação ambiental suave.

O cenário deve permanecer vivo em repouso, com partículas, brilhos, vegetação ou outros detalhes compatíveis com a composição. Um ambiente principal bem acabado é suficiente nesta etapa. A organização técnica deve permitir futuros ambientes sem exigir novos biomas agora.

### Herói

O herói fica visível e tem idle contínuo, ataque por interação válida, movimento corporal, efeitos de arma e recuperação fluida. Para spritesheets, use animação por frames; para personagens compostos, anime partes com intenção.

Cliques rápidos podem interromper ou substituir animações com segurança. A duração do ataque visual não deve limitar a aplicação de dano. A arte deve ser substituível sem alterar as regras de combate.

### Inimigos comuns

Exiba um alvo principal por vez, com algumas variações visuais coesas. Cada representação precisa de idle, reação ao dano, morte e entrada. Use deslocamento breve, squash and stretch e flash controlado para comunicar impacto.

### Boss

O boss precisa ser maior, mais imponente e ter silhueta própria. Use introdução curta, barra de vida especial, atmosfera diferenciada e impactos reforçados. A morte e a recompensa têm apresentação mais intensa, preservando a leitura da HUD e o ritmo do clicker.

## Feedback de combate e recompensa

| Nível | Evento | Apresentação esperada |
| --- | --- | --- |
| 1 | Clique comum | Ataque e reação imediatos, dano flutuante, slash, partículas e shake discretos |
| 2 | Golpe final comum | Impacto reforçado, morte, partículas e moedas indo ao contador |
| 3 | Compra de upgrade | Destaque na interface, aumento de dano perceptível e atualização do custo |
| 4 | Avanço de fase | Número da nova fase, progresso atualizado e celebração breve |
| 5 | Boss derrotado | Sequência especial de morte e recompensa com a maior intensidade relativa |

Não usar a intensidade máxima em todos os cliques. Eventos relevantes precisam continuar especiais após muitas repetições.

### Números flutuantes

Devem aparecer próximos ao impacto, subir com pequena variação horizontal, ter escala animada e desaparecer com fade-out. Use cores e contornos legíveis, distinguindo golpes comuns de finais. Limite a quantidade simultânea e reutilize objetos para evitar poluição visual e crescimento de recursos.

### Moedas e contador

Ao derrotar um inimigo, represente moedas próximas ao alvo, sua viagem até o contador e um destaque no valor de gold. Essa animação comunica a recompensa; não determina quando a regra econômica concede o recurso. A recompensa efetiva é registrada uma única vez pelo jogo.

## Movimento e tempo de resposta

Use antecipação, follow-through, overshoot, squash and stretch e easing expressivo com moderação. Evite movimentos lineares mecânicos. Microinterações devem ser curtas; recompensas podem durar mais; apresentações especiais precisam continuar agradáveis quando repetidas.

O feedback começa na interação, sem aguardar outra animação terminar. A configuração em `presentation.ts` define impacto de 0,16 s, morte de 0,24 s, entrada comum de 0,32 s, entrada de boss de 0,58 s, número de dano de 0,8 s e moedas de 0,7 s. O próximo alvo fica disponível após 260 ms, conforme `balance.ts`; o efeito de entrada pode continuar com o alvo já ativo.

Os pools têm 90 partículas, 16 números e 24 moedas. Golpes comuns usam 9 partículas; finais comuns usam 20; finais de boss usam 34, respeitando a disponibilidade do pool. Shake máximo é de 2, 5 e 8 unidades, respectivamente. O modo reduzido remove shake/parallax, reduz emissões a 3 partículas e 3 moedas e atenua movimento dos números. GSAP faz contadores, realce de gold, feedback de compra, pulso de fase e apresentações de boss; os demais estados visuais contínuos são atualizados no ticker do PixiJS. Upgrade disponível recebe brilho sutil, desativado no modo reduzido.

PixiJS cuida da animação contínua do mundo. GSAP atua principalmente na interface e nas sequências especiais. A separação e a limpeza de recursos seguem o documento de arquitetura.

## Áudio

Prever sons de golpe com pequenas variações, morte, moedas, upgrade, fase, entrada de boss e derrota de boss. Música ambiente é opcional, se houver recurso adequado. O áudio reforça a ação visual sem competir com ela.

Fornecer volume e opção de desativar o áudio, desbloquear a reprodução após interação quando exigido pelo navegador e limitar sons simultâneos em cliques rápidos. Ausência de áudio ou falha de carregamento não pode impedir combate ou progressão.

## Responsividade e redução de efeitos

- No mobile, priorize composição vertical, toque confortável e safe areas.
- Manter gameplay e controles na mesma viewport, sem rolagem de página para alcançar o upgrade; também verificar orientação paisagem.
- No desktop, aproveite o espaço sem perder a predominância do combate.
- Ajuste escala e posicionamento de personagens, cenário e HUD conforme o viewport; não dependa de uma proporção única.
- Mantenha alvo e controles acessíveis sem sobreposição, cortes de texto ou rolagem involuntária durante os cliques.
- Disponibilize redução de movimento e efeitos, atenuando shake, flashes e partículas sem eliminar informações de dano, recompensa e progressão.
- Preserve contraste, texto compreensível e estados identificáveis sem depender exclusivamente de cor, movimento ou som.

## Critérios de revisão de uma alteração

Verifique os estados relevantes em desktop e mobile: repouso, cliques rápidos, morte, compra disponível e indisponível, avanço de fase e boss. Confirme que a HUD permanece legível, os controles não bloqueiam ataques e não existem efeitos presos após transições.

Ao adicionar assets, componentes ou efeitos, registre as decisões definitivas de identidade, os parâmetros visuais e eventuais limitações aqui. O script `scripts/verify-ui.mjs` verifica desktop de 1440 px, mobile de 390/320 px, paisagem, boss e configurações, com capturas em `artifacts/`. Também verifica viewport sem rolagem, vida acima do alvo, controle inferior sem sobreposição e remoção da dica após atacar. Isso não substitui playtest em aparelhos físicos ou aprovação artística do usuário.

Na revisão final, avaliar como um jogador recorrente: cada informação precisa estar presente em todas as sessões? Explica algo óbvio? O componente pertence a um jogo? Sua remoção prejudica alguma ação? Remover os elementos que não se justificarem.
