export const emptyProgress = { completed: {}, attempts: {}, drafts: {} };

export function normalize(text) {
  return text.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').replaceAll('đ', 'd').trim();
}

export function shuffled(items, random = Math.random) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function grade(questions, responses) {
  const rows = questions.map(question => ({
    question,
    selected: responses[question.id],
    status: question.answer == null ? 'unverified' : responses[question.id] === question.answer ? 'correct' : 'wrong',
  }));
  return {
    rows,
    correct: rows.filter(row => row.status === 'correct').length,
    graded: rows.filter(row => row.status !== 'unverified').length,
  };
}

export function recordAttempt(progress, result) {
  const attempts = { ...progress.attempts };
  for (const { question, selected, status } of result.rows) {
    if (selected !== undefined) attempts[question.id] = { selected, status };
  }
  return { ...progress, attempts };
}

export function reviewQueue(questions, attempts) {
  return questions.filter(question => {
    const attempt = attempts[question.id];
    return question.answer != null && attempt && attempt.selected !== question.answer;
  });
}
