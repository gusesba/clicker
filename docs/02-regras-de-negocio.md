# 2. Regras de negócio do jogo

## Finalidade e situação atual

Este documento descreve as funcionalidades exigidas pelo briefing “Combat Clicker 2D — Protótipo UI/UX”, fornecido pelo usuário. Deve ser consultado junto aos outros três documentos antes de implementar ou alterar funcionalidades.

O protótipo Wildbound foi implementado em 16/10/2026. Combate, gold, upgrade, fases, boss, save e preferências estão funcionais. Os valores de partida e a política de recuperação foram confirmados pelo usuário nesta conversa. Este documento descreve as regras atuais e os limites que novas funcionalidades devem preservar.

## Conceitos do domínio

| Conceito | Significado |
| --- | --- |
| Fase | Unidade de progressão que define o encontro e o escalonamento |
| Inimigo comum | Alvo individual em uma fase comum |
| Boss | Alvo especial das fases múltiplas de dez |
| Progresso da fase | Quantidade de inimigos derrotados no objetivo da fase atual |
| Vida atual e máxima | Resistência restante e total do alvo |
| Dano por clique | Dano associado a uma interação válida de ataque |
| Gold | Recurso recebido por derrotas e usado na compra de dano |
| Upgrade | Compra que aumenta o dano por clique e altera o custo da compra seguinte |
| Encontro | Um inimigo específico, com seu estado de combate e sua recompensa |

Existe apenas um inimigo principal ativo por vez. Herói, animações, áudio e partículas representam o combate, sem criar regras econômicas independentes.

## 1. Inicialização e retomada

**Objetivo:** iniciar um jogo utilizável e restaurar progresso local quando disponível.

Ao abrir o jogo, carregar os dados persistidos, validar sua versão e estrutura e construir um estado coerente antes de aceitar ações de combate. Sem um save utilizável, é necessário um estado inicial válido conforme a configuração definida na implementação.

O briefing exige persistir fase, progresso da fase, gold, dano, upgrades e o estado necessário para restaurar o jogo. O jogador deve conseguir atualizar a página e continuar seu progresso.

**Implementação atual:** nova partida na fase 1, progresso 0/5, 0 gold, nível de upgrade 0, dano 5 e vida do alvo 30. O save preserva vida parcial e preferências. Dados inválidos são copiados para `wildbound.save.recovery` antes de permitir que uma nova partida seja salva. Se a cópia falhar, o jogo continua em memória sem sobrescrever o original. Saves de versão futura são preservados e não recebem gravações desta versão.

## 2. Entrada de ataque

**Gatilho:** clique ou toque válido no inimigo/área de interação do combate.

**Condições:** existe um alvo ativo que pode receber dano; a interação não é uma ação de botão ou menu sobreposto.

**Resultado:** aplicar dano uma única vez à vida do alvo e produzir o feedback correspondente. A entrada deve continuar responsiva em cliques rápidos, sem aguardar a conclusão de uma animação de ataque.

O briefing não define críticos, combos, habilidades ou limite artificial de ataques por segundo. Não adicionar esses sistemas como parte implícita do clique básico.

**Verificação futura:** uma interação válida produz um único dano; clicar no upgrade não ataca; sequências rápidas não concedem derrotas duplicadas.

## 3. Dano e vida do inimigo

**Objetivo:** permitir que o jogador reduza a vida do inimigo até derrotá-lo.

O dano por clique vem do estado do jogo e dos upgrades adquiridos. A vida máxima do encontro vem da configuração de progressão e do tipo de inimigo. O dano reduz a vida atual; a barra e os números exibem esse resultado sem se tornarem fontes de cálculo.

A vida apresentada não deve ficar negativa. Um dano suficiente para zerar a vida gera uma única derrota. Conforme confirmado pelo usuário, dano excedente não passa ao próximo inimigo. O número flutuante mostra o dano nominal do ataque, mesmo quando a vida restante é menor.

**Feedback:** ataque do herói, reação do inimigo, flash, slash, partículas, número de dano e shake configuráveis. A apresentação distingue golpe comum e final, sem depender de uma mecânica de crítico.

**Valores atuais:** dano `5 × 1,20^nível`, arredondado para duas casas decimais; vida comum `teto(30 × 1,18^(fase − 1))`. Boss aplica multiplicador 6 antes do arredondamento. Fórmulas e exemplos completos estão no documento de balanceamento e em `src/game/config/balance.ts`.

## 4. Derrota e troca de inimigo

**Gatilho:** vida do inimigo chega a zero.

**Resultado lógico:** registrar a derrota, conceder a recompensa uma única vez e atualizar o progresso da fase. Se o objetivo ainda não tiver sido concluído, preparar o próximo inimigo da mesma fase. Se foi concluído, avançar de fase.

**Apresentação:** golpe final reforçado, morte, partículas e moedas que seguem até o contador, destaque do gold e entrada fluida do próximo alvo. A conclusão de uma animação não deve conceder uma segunda recompensa.

Durante os 260 ms de troca, o estado é `transition` e novos ataques são ignorados. Após esse prazo, o estado volta a `ready` e o próximo alvo já aceita dano durante sua animação de entrada. Não há cooldown entre golpes contra um alvo ativo. Compras continuam disponíveis durante a troca.

Se houver recarga durante uma morte, o snapshot já contém a recompensa concedida e o próximo encontro com vida cheia. A retomada não repete a morte nem sua recompensa.

**Verificação futura:** cada encontro contribui uma única vez para gold e progresso; apenas um próximo encontro é criado.

## 5. Gold e recompensa

**Origem prevista:** derrota de inimigos comuns e bosses.

**Uso previsto:** compra do upgrade de dano por clique.

A recompensa é calculada pelas regras de economia e progressão do encontro e incorporada ao saldo na derrota. Moedas animadas e contador interpolado apenas comunicam esse valor. Volume desligado ou efeitos reduzidos não alteram o saldo recebido.

Não há regra aprovada de recompensa aleatória, gold por clique sem derrota, renda passiva, recompensa offline ou outras moedas. Esses comportamentos não devem ser presumidos.

**Valores atuais:** recompensa comum `teto(8 × 1,15^(fase − 1))`; boss multiplica por 5 antes de arredondar. O saldo é atualizado antes das animações de moedas.

## 6. Compra de upgrade de dano

**Gatilho:** jogador aciona o card ou botão de compra.

**Condição:** saldo de gold suficiente para o custo atual, incluindo saldo exatamente igual ao preço.

**Compra válida:** debitar o preço atual uma única vez, registrar o upgrade adquirido, aumentar o dano por clique e calcular/exibir o preço seguinte. Débito e melhoria devem permanecer coerentes mesmo em acionamentos rápidos.

**Compra inválida:** não alterar gold, dano ou quantidade de upgrades. O controle precisa mostrar indisponibilidade por saldo insuficiente.

**Feedback:** pressão, pulso, brilho ou efeito mágico, dano aumentado perceptivelmente, custo atualizado e som específico quando habilitado.

O briefing prevê um upgrade principal de dano. Não há compra em lote, árvore de talentos, reembolso ou múltiplos tipos de melhoria definidos.

**Valores atuais:** preço `teto(20 × 1,22^nível)`; dano após a compra `arredondar2(5 × 1,20^(nível + 1))`. O preço usa o nível anterior à compra. Não há teto de conteúdo ou árvore de upgrades. Há um limite técnico de contador inteiro seguro, explicado no documento de balanceamento.

## 7. Fases comuns

Uma fase comum exige inicialmente **cinco inimigos derrotados**. A quantidade deve ser configurável. A HUD mostra fase atual e progresso dessa fase.

Após cada derrota, o progresso aumenta uma vez. Antes de atingir o objetivo, o próximo inimigo aparece automaticamente na mesma fase. Ao atingir o objetivo, a fase termina e o jogo inicia a fase seguinte com seu próprio progresso.

A entrada de uma nova fase atualiza os dados do encontro de acordo com o escalonamento. Não reutilizar acidentalmente a vida parcial ou o estado de derrota do inimigo anterior.

**Feedback:** destaque da fase, atualização suave do progresso, transição breve e celebração moderada.

## 8. Fases de boss

Fases cujo número é múltiplo de **dez** são fases de boss. Cada uma exige inicialmente **um boss**, em lugar dos cinco inimigos comuns. O encontro de boss integra a sequência de progressão; não é uma fase extra paralela.

O boss tem multiplicador 6 de vida e 5 de gold, aplicados às bases da fase antes de arredondar. Sua apresentação inclui maior porte, silhueta diferenciada, introdução de 0,58 s, barra de vida exclusiva e alteração sutil de atmosfera. Esses efeitos não atrasam a disponibilidade lógica do alvo.

Ao derrotá-lo, conceder sua recompensa uma única vez e iniciar a próxima fase. O feedback de morte e recompensa é o mais intenso da hierarquia visual.

O briefing não define cronômetro, punição por falha, ataque contra o herói, derrota do jogador ou repetição de boss por tempo esgotado. Não incluir essas regras por referência a outros jogos do gênero.

## 9. Progressão e dificuldade

A sequência de fases continua automaticamente após os objetivos, sem uma fase final de conteúdo definida. Inimigos devem ficar progressivamente mais resistentes e upgrades devem tornar o aumento de poder perceptível.

Vida, gold, custo, dano e multiplicadores precisam ter fórmulas simples e centralizadas. O documento de balanceamento registra os valores conhecidos e as lacunas atuais.

“Progressão infinita” significa ausência de fase final de conteúdo. Valores econômicos e vida usam Decimal.js com 32 algarismos significativos e serialização em strings. Fase e nível usam inteiros de JavaScript e têm limite técnico em `Number.MAX_SAFE_INTEGER − 1`; ao atingir esse limite, fases deixam de incrementar e compras adicionais são recusadas. Esse limite não equivale a uma garantia matemática de infinitude nem a uma curva validada até ele.

Não há mudança automática de bioma em determinada fase especificada. A arquitetura deve permitir ambientes futuros, mas um ambiente principal bem executado atende ao escopo inicial.

## 10. Persistência local

**Meio exigido:** `localStorage`, com estrutura versionada e validação de dados.

Salvar o progresso necessário para retomar a partida e tolerar dados inválidos sem produzir saldo, vida ou fase incoerentes. Objetos gráficos, partículas e timelines não fazem parte do save.

Há gravação a cada alteração de vida, gold, nível, fase, progresso ou preferências, e também em `pagehide` e quando a página fica oculta. Isso preserva vida parcial e compras imediatamente. O snapshot de uma morte pendente já avança para o próximo encontro, mantendo a recompensa atual. Se o armazenamento falhar, a partida continua em memória e a interface informa a limitação.

A chave é `wildbound.save`, versão 1. O campo `level` é a quantidade de upgrades adquiridos; dano e custo são derivados desse nível para evitar fontes divergentes. Alterar as fórmulas recalcula esses atributos nos saves existentes e exige revisão de compatibilidade. O formato completo está no documento de arquitetura.

Não há sincronização em nuvem, conta, backend, múltiplos slots ou botão de reset solicitado. Também não existe regra de ganhos durante o tempo em que a página fica fechada.

## 11. Configurações de áudio e efeitos

Disponibilizar controle simples de volume e opção de desativar o áudio. Quando necessário, desbloquear áudio após interação do usuário. Limitar a sobreposição de sons em cliques rápidos e não depender de arquivos externos indisponíveis.

Preparar opção para reduzir efeitos e movimentos. Essa preferência altera a apresentação, preservando dano, recompensas, preços, progressão e capacidade de identificar eventos.

**Implementação atual:** áudio inicialmente habilitado, volume global de efeitos em 45%, sem música. O modo de redução começa conforme `prefers-reduced-motion` em uma partida nova e depois usa a preferência salva. Todas essas preferências são persistidas. Sons são gerados localmente; a reprodução é desbloqueada no primeiro ataque ou compra. O controle reduzido altera apenas apresentação.

## 12. Variações visuais e apresentação

Herói e inimigos ficam visíveis e animados. As três variações comuns alternam por `(fase − 1 + derrotadosNaFase) % 3`: broto, cogumelo e pedra. O boss é o Ancião das raízes. As variações comuns compartilham vida e recompensa na mesma fase; não há atributos por espécie.

Cenário, parallax, números de dano, moedas e efeitos seguem as diretrizes artísticas. A UI mostra os dados do jogo e seus estados reais; não deve anunciar sistemas ausentes como se estivessem disponíveis.

## 13. Invariantes de negócio

- Um único alvo principal ativo por vez.
- Um dano por interação válida; animação não é uma segunda origem de dano.
- Uma recompensa e uma contagem de derrota por encontro.
- Nenhuma compra sem saldo suficiente; saldo não fica negativo pela compra.
- Upgrade comprado aumenta o dano e atualiza a quantidade adquirida e o preço seguinte.
- Objetivo da fase comum inicialmente igual a cinco; objetivo da fase de boss inicialmente igual a um.
- Boss nas fases múltiplas de dez e avanço após sua derrota.
- Áudio, redução de efeitos e falhas de apresentação não alteram resultados econômicos.
- Dados inválidos do armazenamento não podem ser aplicados diretamente ao estado ativo.

## 14. Fora do escopo desta etapa

Não implementar inventário, equipamentos, habilidades complexas, quests, multiplayer, login, contas, loja premium, monetização, prestígio/rebirth, backend ou sistemas extensos de estatísticas.

Novos sistemas exigem solicitação explícita e atualização dos quatro documentos conforme seu impacto. Polimento das mecânicas mínimas tem prioridade sobre expansão de funcionalidades.

## 15. Critérios para concluir uma funcionalidade

Validar o fluxo relevante de ponta a ponta: entrada, condições, alteração de estado, feedback e restauração quando afetada. Cobrir os casos de borda pertinentes, especialmente cliques rápidos, golpe final, saldo igual ou inferior ao preço e passagem entre fase comum e boss.

Uma funcionalidade só pode passar a ser descrita como implementada após existir código verificável. Ao alterar uma regra, atualizar este documento e os documentos de UI/UX, arquitetura e balanceamento que forem afetados.
