import { normalize } from './study.js';

function words(text) {
  return ' ' + normalize(text).replace(/[^\p{L}\p{N}]+/gu, ' ').trim() + ' ';
}

export function assessCase(rubric, draft) {
  const text = words(draft);
  const criteria = rubric.map(criterion => {
    const missing = criterion.ideas.filter(aliases => !aliases.some(alias => text.includes(words(alias))));
    const matched = criterion.ideas.length - missing.length;
    return { ...criterion, missing, earned: criterion.points * matched / criterion.ideas.length };
  });
  return {
    criteria,
    score: criteria.reduce((sum, criterion) => sum + criterion.earned, 0),
    maximum: criteria.reduce((sum, criterion) => sum + criterion.points, 0),
  };
}
