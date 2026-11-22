/**
 * Dominó — peças (jogo "duplo-seis": 28 pedras de [0,0] a [6,6]).
 * Uma peça é um array [a, b] com 0 <= a, b <= 6. [a, b] e [b, a] são a MESMA peça.
 */
const { criarPecas, ehDupla, somaPeca, pecasIguais, somaPontos } = require('../src/domino');

describe('criarPecas', () => {
  const pecas = criarPecas();

  test('gera 28 peças', () => {
    expect(pecas).toHaveLength(28);
  });

  test('cada peça é [a, b] com a <= b e valores de 0 a 6', () => {
    pecas.forEach(([a, b]) => {
      expect(Number.isInteger(a) && Number.isInteger(b)).toBe(true);
      expect(a).toBeGreaterThanOrEqual(0);
      expect(b).toBeLessThanOrEqual(6);
      expect(a).toBeLessThanOrEqual(b);
    });
  });

  test('não há peças repetidas (considerando [a,b] = [b,a])', () => {
    const chaves = new Set(pecas.map(([a, b]) => `${Math.min(a, b)}-${Math.max(a, b)}`));
    expect(chaves.size).toBe(28);
  });

  test('há 7 duplas (buchas)', () => {
    expect(pecas.filter(([a, b]) => a === b)).toHaveLength(7);
  });

  test('cada número aparece em 7 peças', () => {
    for (let n = 0; n <= 6; n++) expect(pecas.filter((p) => p.includes(n))).toHaveLength(7);
  });

  test('a soma de todos os pontos é 168', () => {
    expect(pecas.flat().reduce((a, b) => a + b, 0)).toBe(168);
  });

  test('cada chamada retorna um conjunto novo', () => {
    const a = criarPecas();
    a.pop();
    expect(criarPecas()).toHaveLength(28);
  });
});

describe('ehDupla', () => {
  test.each([
    [[0, 0], true],
    [[6, 6], true],
    [[3, 3], true],
    [[1, 2], false],
    [[6, 0], false],
  ])('%j => %s', (peca, esperado) => {
    expect(ehDupla(peca)).toBe(esperado);
  });
});

describe('somaPeca / somaPontos', () => {
  test('somaPeca soma os dois lados', () => {
    expect(somaPeca([0, 0])).toBe(0);
    expect(somaPeca([2, 5])).toBe(7);
    expect(somaPeca([6, 6])).toBe(12);
  });

  test('somaPontos soma uma lista de peças', () => {
    expect(somaPontos([])).toBe(0);
    expect(somaPontos([[1, 2], [3, 3], [0, 6]])).toBe(15);
  });
});

describe('pecasIguais', () => {
  test('a ordem dos lados não importa', () => {
    expect(pecasIguais([1, 4], [4, 1])).toBe(true);
    expect(pecasIguais([1, 4], [1, 4])).toBe(true);
  });

  test('peças diferentes', () => {
    expect(pecasIguais([1, 4], [1, 5])).toBe(false);
  });
});

describe('validação de peças', () => {
  test.each([[[7, 1]], [[-1, 0]], [[1]], [[1, 2, 3]], [['1', 2]], [[1.5, 2]], [null]])('%j é inválida', (peca) => {
    expect(() => somaPeca(peca)).toThrow();
    expect(() => ehDupla(peca)).toThrow();
  });
});
