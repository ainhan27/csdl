import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { emptyProgress, grade, normalize, recordAttempt, reviewQueue, shuffled } from '../src/study.js';

const chapters = [1, 2, 3, 4, 5].map(id =>
  JSON.parse(readFileSync(new URL(`../src/content/chapter-${id}.json`, import.meta.url), 'utf8')),
);

test('the chapter data retains the original exercise range and unique IDs', () => {
  const originalCounts = [48, 98, 79, 64, 0];
  const ids = new Set();
  for (const [index, chapter] of chapters.entries()) {
    assert.ok(chapter.questions.length >= originalCounts[index]);
    assert.deepEqual(chapter.questions.slice(0, originalCounts[index]).map(question => question.number),
      Array.from({ length: originalCounts[index] }, (_, n) => n + 1));
    for (const item of [...chapter.questions, ...chapter.cases]) {
      assert.ok(!ids.has(item.id), item.id);
      ids.add(item.id);
    }
    for (const question of chapter.questions) {
      assert.equal(question.options.length, 4);
      assert.ok(question.options.every(option => typeof option === 'string' && option.trim()));
      if (question.answer !== null) {
        assert.ok(Number.isInteger(question.answer) && question.answer >= 0 && question.answer < 4);
        assert.ok(question.explanation?.trim());
      }
    }
  }
  assert.deepEqual(chapters[4].cases.filter(item => !item.supplemental).slice(0, 6).map(item => item.number), [1, 2, 3, 4, 5, 6]);
});

test('verified questions are graded and unverified questions stay outside the score and review queue', () => {
  const items = [{ id: 'correct', answer: 0 }, { id: 'wrong', answer: 2 }, { id: 'pending', answer: null }];
  const result = grade(items, { correct: 0, wrong: 1, pending: 3 });
  assert.deepEqual([result.correct, result.graded], [1, 2]);
  assert.deepEqual(result.rows.map(row => row.status), ['correct', 'wrong', 'unverified']);
  const progress = recordAttempt(emptyProgress, result);
  assert.deepEqual(reviewQueue(items, progress.attempts).map(item => item.id), ['wrong']);

  const fixed = recordAttempt(progress, grade([items[1]], { wrong: 2 }));
  assert.deepEqual(reviewQueue(items, fixed.attempts), []);
  assert.equal(fixed.attempts.pending.status, 'unverified');
  assert.deepEqual(emptyProgress.attempts, {});
});

test('shuffle preserves every question and keeps the source order intact', () => {
  const items = [1, 2, 3, 4];
  assert.deepEqual(shuffled(items, () => 0), [2, 3, 4, 1]);
  assert.deepEqual(items, [1, 2, 3, 4]);
});

test('search accepts Vietnamese text with or without accents', () => {
  assert.equal(normalize('  Độc lập dữ liệu '), 'doc lap du lieu');
});
