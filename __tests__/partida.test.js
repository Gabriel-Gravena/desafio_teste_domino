/**
 * Dominó — partida para 2 jogadores (jogadores 0 e 1), com compra.
 *
 * new PartidaDomino({ maos?, monte?, rng? })
 *   - maos: [mao0, mao1] com 7 peças cada. Sem `maos`, as 28 peças são embaralhadas (rng) e
 *     cada jogador recebe 7; as 14 restantes formam o monte.
 *   - monte: peças compráveis, na ordem em que serão compradas (comprar tira a PRIMEIRA).
 *     Se `maos` for informado e `monte` não, o monte são as 14 peças restantes (embaralhadas).
 *     Peças que não estão em nenhuma mão nem no monte ficam fora do jogo.
 *
 * Regras:
 *   - Começa quem tem a maior dupla (6-6, senão 5-5 ...). Se ninguém tiver dupla, começa quem tem a
 *     peça de maior soma (empate na soma: a que tem o maior lado). A primeira jogada é OBRIGATORIAMENTE
 *     essa peça (pecaInicial).
 *   - Cada peça é encaixada numa das pontas ('esquerda' ou 'direita') com um lado igual ao número da ponta.
 *     A mesa guarda as peças já orientadas, de forma que os números vizinhos coincidem.
 *   - Se o lado não for informado e a peça só encaixar em uma ponta, vai para ela; se encaixar nas
 *     duas, é obrigatório informar o lado.
 *   - Sem jogada possível: compra do monte (quantas vezes precisar, sem passar a vez).
 *     Com o monte vazio: passa a vez. Não é permitido comprar/passar tendo jogada.
 *   - Fim por "batida": quem fica sem peças vence.
 *   - Fim por "trancada": monte vazio e nenhum dos dois consegue jogar. Vence quem tiver menos
 *     pontos na mão; se empatar, não há vencedor (vencedor = null).
 *   - pontos = soma das peças na mão do perdedor (0 em empate).
 */
const { criarPecas, PartidaDomino } = require('../src/domino');

const chave = ([a, b]) => `${Math.min(a, b)}-${Math.max(a, b)}`;
const restantes = (...maos) => {
  const usadas = new Set(maos.flat().map(chave));
  return criarPecas().filter((p) => !usadas.has(chave(p)));
};
const ordenar = (pecas) => pecas.map(chave).sort();

// ---------- cenários ----------

// Batida: jogador 0 tem uma "escada" 6-6 ... 1-0 e monte vazio
const BATIDA = {
  maos: [
    [[6, 6], [6, 5], [5, 4], [4, 3], [3, 2], [2, 1], [1, 0]],
    [[6, 0], [5, 3], [1, 1], [2, 2], [3, 3], [4, 4], [5, 5]],
  ],
  monte: [],
};

// Compra: jogador 1 não tem 6 e precisa comprar até achar um
const COMPRA_MAOS = [
  [[6, 6], [6, 5], [5, 4], [4, 3], [3, 2], [2, 1], [1, 0]],
  [[0, 0], [1, 1], [2, 2], [3, 3], [4, 4], [5, 5], [0, 3]],
];
const COMPRA = { maos: COMPRA_MAOS, monte: restantes(...COMPRA_MAOS) };
// monte em ordem: [0,2] [0,4] [0,5] [0,6] [1,3] ...

// Trancada com vencedor: jogador 0 termina com 3 pontos, jogador 1 com 18
const TRANCADA = {
  maos: [
    [[6, 6], [6, 1], [0, 0], [0, 1], [0, 2], [1, 1], [1, 2]],
    [[2, 2], [2, 3], [3, 3], [3, 4], [4, 4], [4, 5], [5, 5]],
  ],
  monte: [],
};

// Trancada em empate: depois do 6-6 ninguém tem 6; ambos ficam com 26 pontos
const EMPATE = {
  maos: [
    [[6, 6], [0, 1], [0, 2], [0, 3], [1, 2], [4, 4], [4, 5]],
    [[0, 0], [1, 1], [0, 4], [2, 2], [0, 5], [1, 4], [3, 3]],
  ],
  monte: [],
};

// ---------- testes ----------

describe('distribuição', () => {
  test('sem mãos definidas: 7 peças para cada um e 14 no monte, sem repetição', () => {
    const p = new PartidaDomino();
    expect(p.maoDoJogador(0)).toHaveLength(7);
    expect(p.maoDoJogador(1)).toHaveLength(7);
    expect(p.tamanhoMonte).toBe(14);
    const todas = [...p.maoDoJogador(0), ...p.maoDoJogador(1)].map(chave);
    expect(new Set(todas).size).toBe(14);
  });

  test('com mãos definidas, usa exatamente essas peças', () => {
    const p = new PartidaDomino(BATIDA);
    expect(ordenar(p.maoDoJogador(0))).toEqual(ordenar(BATIDA.maos[0]));
    expect(ordenar(p.maoDoJogador(1))).toEqual(ordenar(BATIDA.maos[1]));
    expect(p.tamanhoMonte).toBe(0);
  });

  test('com mãos definidas e sem monte, o monte tem as 14 peças restantes', () => {
    const p = new PartidaDomino({ maos: BATIDA.maos });
    expect(p.tamanhoMonte).toBe(14);
  });

  test('rejeita mão com quantidade diferente de 7', () => {
    expect(() => new PartidaDomino({ maos: [BATIDA.maos[0].slice(0, 6), BATIDA.maos[1]] })).toThrow();
  });

  test('rejeita peça repetida entre as mãos (inclusive invertida)', () => {
    const mao1 = [...BATIDA.maos[1]];
    mao1[0] = [5, 6]; // [6,5] já está na mão 0
    expect(() => new PartidaDomino({ maos: [BATIDA.maos[0], mao1], monte: [] })).toThrow();
  });

  test('rejeita peça repetida entre mão e monte', () => {
    expect(() => new PartidaDomino({ maos: BATIDA.maos, monte: [[6, 6]] })).toThrow();
  });

  test('rejeita peça inválida', () => {
    const mao0 = [...BATIDA.maos[0]];
    mao0[0] = [7, 7];
    expect(() => new PartidaDomino({ maos: [mao0, BATIDA.maos[1]], monte: [] })).toThrow();
  });

  test('maoDoJogador retorna uma cópia', () => {
    const p = new PartidaDomino(BATIDA);
    p.maoDoJogador(0).pop();
    expect(p.maoDoJogador(0)).toHaveLength(7);
  });

  test('estado inicial: mesa vazia, sem pontas, partida não finalizada', () => {
    const p = new PartidaDomino(BATIDA);
    expect(p.mesa).toEqual([]);
    expect(p.pontas).toBeNull();
    expect(p.finalizada).toBe(false);
    expect(p.vencedor).toBeNull();
  });
});

describe('quem começa', () => {
  test('quem tem o 6-6 começa', () => {
    const p = new PartidaDomino(BATIDA);
    expect(p.jogadorInicial).toBe(0);
    expect(p.vez).toBe(0);
    expect(chave(p.pecaInicial)).toBe('6-6');
  });

  test('o jogador 1 começa se tiver a maior dupla', () => {
    const p = new PartidaDomino({ maos: [BATIDA.maos[1], BATIDA.maos[0]], monte: [] });
    expect(p.jogadorInicial).toBe(1);
    expect(p.vez).toBe(1);
  });

  test('sem 6-6, vale a maior dupla existente', () => {
    const maos = [
      [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6]],
      [[3, 3], [1, 2], [1, 3], [1, 4], [1, 5], [1, 6], [2, 6]],
    ];
    const p = new PartidaDomino({ maos, monte: [] });
    expect(p.jogadorInicial).toBe(1);
    expect(chave(p.pecaInicial)).toBe('3-3');
  });

  test('uma dupla baixa vence peças comuns de soma maior', () => {
    const maos = [
      [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6]],
      [[5, 6], [1, 2], [1, 3], [1, 4], [1, 5], [1, 6], [2, 6]],
    ];
    const p = new PartidaDomino({ maos, monte: [] });
    expect(p.jogadorInicial).toBe(0);
    expect(chave(p.pecaInicial)).toBe('0-0');
  });

  test('sem duplas, começa a peça de maior soma (empate: maior lado)', () => {
    const maos = [
      [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [1, 2]],
      [[1, 3], [1, 4], [1, 5], [1, 6], [2, 3], [2, 4], [2, 5]],
    ];
    const p = new PartidaDomino({ maos, monte: [] });
    expect(p.jogadorInicial).toBe(1);
    expect(chave(p.pecaInicial)).toBe('1-6'); // 1-6 e 2-5 somam 7; 1-6 tem o maior lado
  });

  test('a primeira jogada tem que ser a peça inicial', () => {
    const p = new PartidaDomino(BATIDA);
    expect(() => p.jogar(0, [6, 5])).toThrow();
    expect(() => p.jogar(0, [6, 6])).not.toThrow();
  });

  test('sorteio aleatório: começa quem tem a maior dupla distribuída', () => {
    for (let i = 0; i < 30; i++) {
      const p = new PartidaDomino();
      const duplas = [0, 1].map((j) => p.maoDoJogador(j).filter(([a, b]) => a === b).map(([a]) => a));
      const maior = Math.max(...duplas.flat());
      if (duplas.flat().length > 0) {
        expect(duplas[p.jogadorInicial]).toContain(maior);
        expect(p.pecaInicial).toEqual([maior, maior]);
      }
    }
  });
});

describe('jogar', () => {
  let p;
  beforeEach(() => {
    p = new PartidaDomino(BATIDA);
    p.jogar(0, [6, 6]);
  });

  test('a peça inicial vai para a mesa e define as pontas', () => {
    expect(p.mesa).toEqual([[6, 6]]);
    expect(p.pontas).toEqual([6, 6]);
    expect(p.maoDoJogador(0)).toHaveLength(6);
    expect(p.vez).toBe(1);
  });

  test('jogar fora da vez lança erro', () => {
    expect(() => p.jogar(0, [6, 5], 'esquerda')).toThrow();
  });

  test('jogar peça que não está na mão lança erro', () => {
    expect(() => p.jogar(1, [6, 1], 'direita')).toThrow();
  });

  test('jogar peça que não encaixa lança erro', () => {
    expect(() => p.jogar(1, [5, 3], 'direita')).toThrow();
    expect(() => p.jogar(1, [5, 3])).toThrow();
  });

  test('lado inválido lança erro', () => {
    expect(() => p.jogar(1, [6, 0], 'meio')).toThrow();
  });

  test('peça que encaixa nas duas pontas exige o lado', () => {
    expect(() => p.jogar(1, [6, 0])).toThrow();
    expect(p.maoDoJogador(1)).toHaveLength(7);
  });

  test('encaixar à direita orienta a peça (6-6 | 6-0)', () => {
    p.jogar(1, [0, 6], 'direita');
    expect(p.mesa).toEqual([[6, 6], [6, 0]]);
    expect(p.pontas).toEqual([6, 0]);
  });

  test('encaixar à esquerda orienta a peça (0-6 | 6-6)', () => {
    p.jogar(1, [6, 0], 'esquerda');
    expect(p.mesa).toEqual([[0, 6], [6, 6]]);
    expect(p.pontas).toEqual([0, 6]);
  });

  test('sem lado informado, a peça vai para a única ponta possível', () => {
    p.jogar(1, [6, 0], 'direita'); // pontas [6, 0]
    p.jogar(0, [5, 6]); // só encaixa no 6 (esquerda)
    expect(p.mesa).toEqual([[5, 6], [6, 6], [6, 0]]);
    expect(p.pontas).toEqual([5, 0]);
  });

  test('a peça jogada sai da mão do jogador', () => {
    p.jogar(1, [6, 0], 'direita');
    expect(p.maoDoJogador(1).map(chave)).not.toContain('0-6');
    expect(p.maoDoJogador(1)).toHaveLength(6);
  });

  test('a vez alterna após cada jogada', () => {
    p.jogar(1, [6, 0], 'direita');
    expect(p.vez).toBe(0);
  });

  test('a mesa retornada é uma cópia', () => {
    p.mesa.push([1, 1]);
    expect(p.mesa).toEqual([[6, 6]]);
  });
});

describe('jogadasPossiveis / podeJogar', () => {
  test('antes da primeira jogada, só o jogador inicial pode jogar, e só a peça inicial', () => {
    const p = new PartidaDomino(BATIDA);
    expect(p.jogadasPossiveis(0)).toEqual([{ peca: [6, 6], lado: null }]);
    expect(p.jogadasPossiveis(1)).toEqual([]);
    expect(p.podeJogar(0)).toBe(true);
    expect(p.podeJogar(1)).toBe(false);
  });

  test('lista peça e lado de cada jogada possível', () => {
    const p = new PartidaDomino(BATIDA);
    p.jogar(0, [6, 6]);
    p.jogar(1, [6, 0], 'direita'); // pontas [6, 0]
    const jogadas = p.jogadasPossiveis(0).map(({ peca, lado }) => `${chave(peca)}@${lado}`).sort();
    expect(jogadas).toEqual(['0-1@direita', '5-6@esquerda']);
  });

  test('uma peça que encaixa nas duas pontas aparece duas vezes', () => {
    const p = new PartidaDomino(BATIDA);
    p.jogar(0, [6, 6]);
    const jogadas = p.jogadasPossiveis(1).map(({ peca, lado }) => `${chave(peca)}@${lado}`).sort();
    expect(jogadas).toEqual(['0-6@direita', '0-6@esquerda']);
  });
});

describe('comprar', () => {
  let p;
  beforeEach(() => {
    p = new PartidaDomino(COMPRA);
    p.jogar(0, [6, 6]);
  });

  test('sem jogada possível, compra a primeira peça do monte e continua na vez', () => {
    expect(p.podeJogar(1)).toBe(false);
    const comprada = p.comprar(1);
    expect(chave(comprada)).toBe('0-2');
    expect(p.tamanhoMonte).toBe(13);
    expect(p.maoDoJogador(1)).toHaveLength(8);
    expect(p.vez).toBe(1);
  });

  test('compra quantas vezes for preciso até conseguir jogar', () => {
    expect(chave(p.comprar(1))).toBe('0-2');
    expect(chave(p.comprar(1))).toBe('0-4');
    expect(chave(p.comprar(1))).toBe('0-5');
    expect(chave(p.comprar(1))).toBe('0-6');
    expect(p.podeJogar(1)).toBe(true);
    expect(() => p.comprar(1)).toThrow(); // agora tem jogada
    expect(p.tamanhoMonte).toBe(10);
    p.jogar(1, [0, 6], 'direita');
    expect(p.pontas).toEqual([6, 0]);
  });

  test('não pode comprar tendo jogada possível', () => {
    const q = new PartidaDomino(COMPRA);
    expect(() => q.comprar(0)).toThrow();
  });

  test('não pode comprar fora da vez', () => {
    expect(() => p.comprar(0)).toThrow();
  });

  test('não pode passar enquanto houver peças no monte', () => {
    expect(() => p.passar(1)).toThrow();
  });

  test('não pode comprar com o monte vazio', () => {
    const q = new PartidaDomino(TRANCADA);
    q.jogar(0, [6, 6]);
    expect(() => q.comprar(1)).toThrow();
  });
});

describe('passar', () => {
  let p;
  beforeEach(() => {
    p = new PartidaDomino(TRANCADA);
    p.jogar(0, [6, 6]);
  });

  test('sem jogada e com monte vazio, o jogador passa a vez', () => {
    p.passar(1);
    expect(p.vez).toBe(0);
    expect(p.finalizada).toBe(false);
  });

  test('não pode passar tendo jogada possível', () => {
    p.passar(1);
    expect(() => p.passar(0)).toThrow();
  });

  test('não pode passar fora da vez', () => {
    expect(() => p.passar(0)).toThrow();
  });
});

describe('fim por batida', () => {
  function jogarAteBater(p) {
    p.jogar(0, [6, 6]);
    p.jogar(1, [6, 0], 'direita'); // [6,0]
    p.jogar(0, [6, 5], 'esquerda'); // [5,0]
    p.jogar(1, [5, 5], 'esquerda');
    p.jogar(0, [5, 4], 'esquerda'); // [4,0]
    p.jogar(1, [4, 4], 'esquerda');
    p.jogar(0, [4, 3], 'esquerda'); // [3,0]
    p.jogar(1, [3, 3], 'esquerda');
    p.jogar(0, [3, 2], 'esquerda'); // [2,0]
    p.jogar(1, [2, 2], 'esquerda');
    p.jogar(0, [2, 1], 'esquerda'); // [1,0]
    p.jogar(1, [1, 1], 'esquerda');
  }

  test('quem joga a última peça vence', () => {
    const p = new PartidaDomino(BATIDA);
    jogarAteBater(p);
    expect(p.finalizada).toBe(false);
    p.jogar(0, [1, 0], 'esquerda');
    expect(p.finalizada).toBe(true);
    expect(p.vencedor).toBe(0);
    expect(p.motivo).toBe('batida');
    expect(p.maoDoJogador(0)).toEqual([]);
  });

  test('o vencedor marca a soma das peças do adversário', () => {
    const p = new PartidaDomino(BATIDA);
    jogarAteBater(p);
    p.jogar(0, [1, 0], 'esquerda');
    expect(p.maoDoJogador(1)).toEqual([[3, 5]]);
    expect(p.pontos).toBe(8);
  });

  test('a mesa final é uma corrente contínua', () => {
    const p = new PartidaDomino(BATIDA);
    jogarAteBater(p);
    p.jogar(0, [1, 0], 'esquerda');
    expect(p.mesa).toEqual([
      [0, 1], [1, 1], [1, 2], [2, 2], [2, 3], [3, 3], [3, 4],
      [4, 4], [4, 5], [5, 5], [5, 6], [6, 6], [6, 0],
    ]);
    expect(p.pontas).toEqual([0, 0]);
  });

  test('depois do fim, nenhuma ação é permitida', () => {
    const p = new PartidaDomino(BATIDA);
    jogarAteBater(p);
    p.jogar(0, [1, 0], 'esquerda');
    expect(() => p.jogar(1, [5, 3])).toThrow();
    expect(() => p.passar(1)).toThrow();
    expect(() => p.comprar(1)).toThrow();
    expect(p.jogadasPossiveis(1)).toEqual([]);
  });
});

describe('fim por trancada', () => {
  test('trava com vencedor: menor soma na mão vence', () => {
    const p = new PartidaDomino(TRANCADA);
    p.jogar(0, [6, 6]);
    p.passar(1);
    p.jogar(0, [6, 1], 'direita'); // [6,1]
    p.passar(1);
    p.jogar(0, [1, 1], 'direita'); // [6,1]
    p.passar(1);
    p.jogar(0, [1, 2], 'direita'); // [6,2]
    p.jogar(1, [2, 3], 'direita'); // [6,3]
    p.passar(0);
    p.jogar(1, [3, 4], 'direita'); // [6,4]
    p.passar(0);
    p.jogar(1, [4, 5], 'direita'); // [6,5]
    p.passar(0);
    expect(p.finalizada).toBe(false);
    p.jogar(1, [5, 5], 'direita'); // [6,5] — ninguém mais tem 6 nem 5
    expect(p.finalizada).toBe(true);
    expect(p.motivo).toBe('trancada');
    expect(p.vencedor).toBe(0); // 3 pontos x 18 pontos
    expect(p.pontos).toBe(18);
  });

  test('trava em empate: sem vencedor e 0 pontos', () => {
    const p = new PartidaDomino(EMPATE);
    p.jogar(0, [6, 6]); // ninguém tem outro 6 e o monte está vazio
    expect(p.finalizada).toBe(true);
    expect(p.motivo).toBe('trancada');
    expect(p.vencedor).toBeNull();
    expect(p.pontos).toBe(0);
  });

  test('não tranca enquanto houver peças no monte', () => {
    const p = new PartidaDomino({ maos: EMPATE.maos, monte: [[5, 6]] });
    p.jogar(0, [6, 6]);
    expect(p.finalizada).toBe(false);
    expect(chave(p.comprar(1))).toBe('5-6');
  });
});

describe('simulação', () => {
  test('partidas aleatórias sempre terminam, com estado coerente', () => {
    for (let i = 0; i < 50; i++) {
      const p = new PartidaDomino();
      let passos = 0;
      while (!p.finalizada) {
        const j = p.vez;
        const jogadas = p.jogadasPossiveis(j);
        if (jogadas.length) p.jogar(j, jogadas[0].peca, jogadas[0].lado ?? undefined);
        else if (p.tamanhoMonte > 0) p.comprar(j);
        else p.passar(j);
        passos += 1;
        if (passos > 500) throw new Error('partida não terminou');
      }
      expect(['batida', 'trancada']).toContain(p.motivo);
      if (p.motivo === 'batida') expect(p.maoDoJogador(p.vencedor)).toEqual([]);
      // a mesa é sempre uma corrente contínua
      const mesa = p.mesa;
      for (let k = 1; k < mesa.length; k++) expect(mesa[k][0]).toBe(mesa[k - 1][1]);
      // nenhuma peça some nem duplica
      const total = mesa.length + p.maoDoJogador(0).length + p.maoDoJogador(1).length + p.tamanhoMonte;
      expect(total).toBe(28);
    }
  });
});
