# Desafio de testes: Dominó (2 jogadores)

Este repositório tem **apenas os casos de teste** (Jest). O desafio é implementar `src/domino.js` até que todos passem.

```bash
npm install
npm test
```

> Sem a implementação, os testes falham com `Cannot find module`, e isso é esperado.

## Regras adotadas (dominó com compra)

- São **28 peças** (duplo-seis). Uma peça é `[a, b]`, e `[a, b]` e `[b, a]` são a mesma peça.
- Cada jogador recebe **7 peças**. As 14 restantes formam o **monte**.
- Começa quem tem a **maior dupla**. Se ninguém tiver dupla, começa quem tem a peça de maior soma; em caso de empate na soma, vale a que tem o maior lado. A primeira jogada tem que ser essa peça.
- As peças são encaixadas na ponta `'esquerda'` ou `'direita'`. A mesa guarda as peças já orientadas, de modo que os números vizinhos coincidem.
  - Se a peça só encaixa em uma ponta, o lado pode ser omitido. Se encaixa nas duas, o lado é obrigatório.
- Quem não tem jogada **compra** do monte (a primeira peça), quantas vezes precisar e sem passar a vez. Com o monte vazio, **passa** a vez. Não é permitido comprar nem passar tendo jogada.
- **Batida**: quem fica sem peças vence.
- **Trancada**: o monte está vazio e ninguém consegue jogar. Vence quem tem menos pontos na mão; se empatar, não há vencedor.
- `pontos` é a soma das peças do perdedor (0 em caso de empate).

## API esperada (`src/domino.js`, CommonJS)

| Export | Descrição |
|---|---|
| `criarPecas()` | 28 peças `[a, b]` com `a <= b` |
| `ehDupla(p)`, `somaPeca(p)`, `somaPontos(pecas)`, `pecasIguais(a, b)` | Utilitários. Uma peça inválida lança erro |
| `PartidaDomino` | Classe da partida (veja abaixo) |

`new PartidaDomino({ maos?, monte?, rng? })`

- Métodos: `jogar(j, peca, lado?)`, `comprar(j)` (retorna a peça comprada), `passar(j)`, `jogadasPossiveis(j)` (lista de `{ peca, lado }`), `podeJogar(j)`, `maoDoJogador(j)`.
- Getters: `vez`, `jogadorInicial`, `pecaInicial`, `mesa`, `pontas` (`[esq, dir]` ou `null`), `tamanhoMonte`, `finalizada`, `vencedor` (`0`, `1` ou `null`), `motivo` (`'batida'` ou `'trancada'`), `pontos`.
- Quando `maos` é informado sem `monte`, o monte são as peças restantes. Peças que não estão em nenhuma mão nem no monte ficam fora do jogo.
