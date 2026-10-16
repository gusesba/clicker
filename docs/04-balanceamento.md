# 4. Balanceamento do jogo

## Estado atual em 16/10/2026

**A curva inicial está implementada e configurável em `src/game/config/balance.ts`.** Os valores de partida, crescimento e multiplicadores abaixo foram confirmados pelo usuário. Existe simulação reproduzível por `npm run balance`, além dos testes de combate, compra, progressão e save.

O briefing prioriza UI/UX e sensação de impacto. Esta curva fornece um ciclo inicial funcional, com poder crescente e resistência por fase. Os números são uma base de protótipo; os resultados de simulação abaixo não equivalem a playtest com jogadores nem garantem ritmo adequado em fases muito avançadas.

Leia este documento junto aos outros três antes de implementar ou alterar funcionalidades. Após qualquer mudança que afete poder, resistência, recompensas, custos ou ritmo, atualize os valores e a análise correspondentes.

## Parâmetros já definidos pelo briefing

| Parâmetro | Definição exigida | Situação no código |
| --- | --- | --- |
| Inimigos por fase comum | Inicialmente 5; quantidade configurável | Implementado |
| Intervalo entre bosses | Fases múltiplas de 10 | Implementado |
| Alvos por fase de boss | Inicialmente 1 boss substitui o grupo comum | Implementado |
| Meio de aumento de poder | Compra de dano por clique com gold | Implementado |
| Resistência ao avançar | Inimigos progressivamente mais resistentes | Crescimento de 18% por fase |
| Duração da progressão | Sem fase final prevista | Contadores limitados por inteiros seguros |

Distribuição implementada, com partida inicial na fase 1:

| Número de fase | Tipo | Derrotas necessárias |
| --- | --- | --- |
| 1 | Comum | 5 |
| 9 | Comum | 5 |
| 10 | Boss | 1 |
| 11 | Comum | 5 |
| 20 | Boss | 1 |

Se nove fases comuns e uma fase de boss forem concluídas com essa configuração, serão **46 derrotas** nesse conjunto: `9 × 5 + 1`. Isso é uma consequência aritmética do requisito, não uma medição de duração ou dificuldade.

## Parâmetros atuais

| Grupo | Valor implementado | Efeito sobre a experiência |
| --- | --- | --- |
| Partida inicial | Fase 1, 0/5 derrotas, 0 gold, nível 0 | Primeira recompensa exige derrotar um alvo |
| Dano base | 5 | Primeiro alvo exige 6 cliques |
| Vida comum | Base 30; crescimento × 1,18 por fase | Resistência aumenta a cada fase |
| Boss | Multiplicador de vida × 6 | Encontro individual mais resistente |
| Gold comum | Base 8; crescimento × 1,15 por fase | Aumenta a renda nominal |
| Gold de boss | Multiplicador × 5 | Recompensa especial, sem sorteio |
| Upgrade | Primeiro custo 20; crescimento × 1,22 por nível | Custo cresce mais rápido que dano por nível |
| Dano melhorado | Crescimento × 1,20 por nível | Primeiro upgrade passa dano de 5 para 6 |
| Arredondamento | Vida/recompensa/custo para cima; dano em duas casas, metade para cima | Preços e recompensas são inteiros |
| Números grandes | Decimal.js; 32 algarismos significativos | Evita o limite de magnitude de `Number` para vida e economia |
| Retomada | Preserva vida parcial; morte pendente salva próximo alvo com recompensa liquidada | Recarregar não recupera vida de alvo parcial nem duplica gold |
| Tempo de troca | 260 ms | Curta indisponibilidade entre alvos, sem cooldown entre ataques ativos |

Novas decisões de produto ou mudanças ambíguas devem ser esclarecidas com o usuário. Os parâmetros atuais não devem ser substituídos silenciosamente por outro modelo de curva.

## Fórmulas atuais

Para fase `s ≥ 1` e quantidade de upgrades já comprados `n ≥ 0`:

```text
boss(s) = s múltiplo de 10
vida(s) = teto(30 × 1,18^(s − 1) × (boss(s) ? 6 : 1))
recompensa(s) = teto(8 × 1,15^(s − 1) × (boss(s) ? 5 : 1))
custo(n) = teto(20 × 1,22^n)
dano(n) = arredondar2(5 × 1,20^n)
vidaApósGolpe = máximo(0, vidaAtual − dano(n))
```

O multiplicador de boss é aplicado antes do arredondamento. A compra usa `custo(n)`, debita esse preço e incrementa `n`; o próximo dano é `dano(n + 1)`. Não existe transferência do dano excedente para outro alvo.

Exemplos de níveis: `0 → dano 5 / custo 20`; `1 → dano 6 / custo 25`; `2 → dano 7,20 / custo 30`; `5 → dano 12,44 / custo 55`. A função de exibição abrevia milhares, milhões, bilhões e trilhões; acima disso usa notação científica. Abreviação não altera o valor da regra.

Uma animação mais intensa de boss não define, por si só, um multiplicador econômico. Uma variação visual de inimigo também não implica diferença de atributos.

## Como avaliar o ritmo

As expressões abaixo são ferramentas de análise das fórmulas atuais. Devem continuar acompanhando mudanças de configuração.

### Cliques necessários para derrotar um alvo

Para vida `H > 0` e dano constante `D > 0`, sem alterações de dano durante o encontro:

```text
cliques = teto(H / D)
```

Essa conta considera o clique que encerra o encontro. O número flutuante mostra o dano nominal; o excedente é descartado no alvo atingido.

### Acessibilidade de um upgrade

Com saldo atual `G` e preço atual `C`:

```text
gold_faltante = máximo(0, C - G)
```

Somente se todos os próximos inimigos concederem a mesma recompensa `R > 0`, sem outras compras ou variações:

```text
derrotas_para_comprar = teto(gold_faltante / R)
```

Com recompensas variáveis por fase ou boss, deve-se somar a sequência efetiva de ganhos; a divisão por uma recompensa única deixa de representar o percurso.

### Valor percebido de uma compra

Compare, para um mesmo alvo, os cliques necessários com dano antes e depois do upgrade. O dano deve aumentar, mas uma melhoria pequena pode não reduzir imediatamente o número inteiro de cliques daquele encontro. A UI precisa comunicar o aumento real sem prometer uma redução que não ocorreu.

### Tempo estimado

Converter cliques em segundos depende de uma cadência de entrada explicitamente escolhida para a simulação e dos tempos de disponibilidade dos alvos. Não existe cadência padrão nem tempo por fase aprovado. Tempos simulados não devem ser apresentados como medições com jogadores reais.

## Intenção de balanceamento

- Tornar possível perceber o aumento de poder após comprar dano.
- Fazer a resistência crescer com o avanço de fase.
- Manter bosses como marcos distintos, com desafio e recompensa configuráveis.
- Evitar que o primeiro contato esconda o ciclo de derrota, gold e upgrade atrás de uma espera excessiva.
- Preservar o ritmo de cliques durante efeitos e transições.
- Não adicionar dano automático, críticos, renda offline ou mecânicas fora do escopo para corrigir uma curva inadequada.

Esses objetivos são qualitativos. Não há alvo aprovado de segundos por inimigo, minutos até o boss, cliques por fase ou frequência de compra.

## Resultado da simulação atual

O script `scripts/analyze-balance.ts` reutiliza as funções do jogo e simula compra imediata de todos os upgrades acessíveis após cada derrota. Não compra durante um encontro, não presume cliques por segundo e não simula animações. Os valores da tabela são cliques necessários para derrotar os inimigos, sem contar cliques recusados durante uma troca.

| Fase | Vida por alvo | Gold por alvo | Cliques na fase | Cliques acumulados | Nível após a fase |
| --- | --- | --- | --- | --- | --- |
| 1 | 30 | 8 | 28 | 28 | 1 |
| 5 | 59 | 14 | 21 | 125 | 7 |
| 9 | 113 | 25 | 21 | 206 | 10 |
| 10, boss | 799 | 141 | 26 | 232 | 11 |
| 11 | 158 | 33 | 23 | 255 | 12 |
| 20, boss | 4.179 | 570 | 32 | 481 | 19 |
| 50, boss | 599.089 | 37.693 | 98 | 1.939 | 40 |
| 100, boss | 2.352.833.681 | 40.845.686 | 651 | 13.398 | 75 |

A primeira compra ocorre após **18 cliques e 3 derrotas**, com 24 gold acumulados; custa 20 e deixa 4. O primeiro boss é alcançado após 206 cliques nessa política e exige mais 26. Uma política de compra diferente pode alterar esses resultados.

## Limitações e pontos de atenção

A resistência cresce 18% por fase enquanto a recompensa cresce 15%. Cada upgrade aumenta dano em 20%, com preço crescendo 22%. A simulação evidencia que as fases posteriores ficam mais demoradas: o boss 100 exige 651 cliques, contra 26 no boss 10. A curva inicial favorece demonstrar o ciclo, mas ainda exige revisão se o objetivo passar a ser sessões longas com ritmo semelhante.

Não há playtest com jogadores, métricas de retenção, tempo real até boss ou medição de fadiga. Não converter os números acima em promessas de duração sem declarar uma cadência e incluir as transições.

Contadores de fase/nível são inteiros seguros com teto técnico em `Number.MAX_SAFE_INTEGER − 1`; nessa fase o avanço fica limitado ao próprio contador e compras nesse nível são recusadas. Decimal.js mantém 32 algarismos significativos, sem precisão inteira arbitrária para saldos extremos. Os testes confirmam valores finitos na fase e no nível 10.000, sem validar a experiência até os limites técnicos.

## Procedimento ao alterar o balanceamento

1. Identifique o problema concreto e a métrica ou situação observada.
2. Consulte as regras de negócio para preservar o significado da mecânica.
3. Altere os parâmetros ou fórmulas na fonte central, sem duplicá-los na UI ou no renderizador.
4. Compare antes e depois em início de jogo, antes do boss, no boss e após o boss, usando os mesmos pressupostos de simulação.
5. Verifique os casos afetados de compra, derrota, progressão e restauração.
6. Registre aqui os valores efetivos, exemplos, verificações e limitações; atualize os demais documentos afetados.

Simulações devem explicitar cadência de clique e política de compra. A análise não exige criar telemetria, backend ou um sistema de estatísticas no jogo.

## Registro de revisões

| Data | Alteração | Valores e fórmulas efetivos | Evidência |
| --- | --- | --- | --- |
| 16/10/2026 | Documentação inicial baseada no briefing | Apenas requisitos de 5 inimigos comuns, boss a cada 10 fases e 1 alvo na fase de boss; demais valores pendentes | Leitura do briefing e inspeção da pasta vazia; sem código ou testes de gameplay |
| 16/10/2026 | Protótipo implementado com base confirmada pelo usuário | Fórmulas e parâmetros desta versão; retomada de vida parcial e dano excedente sem transferência | 11 testes de regras/save, integração no navegador e simulação até a fase 100 |
| 16/10/2026 | Redesign da HUD e da composição de gameplay | Nenhuma alteração de fórmulas, preços, dano, recompensas, progressão ou tempo de troca; formato do save preservado | Refatoração concentrada na apresentação e integração de layout |
