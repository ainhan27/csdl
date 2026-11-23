import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { assessCase } from '../src/case-scoring.js';

const { cases } = JSON.parse(readFileSync(new URL('../src/content/chapter-5.json', import.meta.url)));

test('each case has a complete ten-point answer and blank text receives no credit', () => {
  for (const item of cases) {
    const answer = item.rubric.map(row => row.title + ': ' + row.answer).join('\n');
    assert.equal(assessCase(item.rubric, answer).score, 10, item.title);
    assert.equal(assessCase(item.rubric, '').score, 0, item.title);
  }
});

test('matches Vietnamese phrases without accents and gives each idea credit once', () => {
  const rubric = [{ points: 4, ideas: [['mở rộng ngang', 'scale out'], ['ACID']] }];
  const partial = assessCase(rubric, 'MO RONG NGANG, scale-out; acidity');
  assert.equal(partial.score, 2);
  assert.deepEqual(partial.criteria[0].missing, [['ACID']]);
  assert.equal(assessCase(rubric, 'mở rộng ngang và ACID.').score, 4);
});
