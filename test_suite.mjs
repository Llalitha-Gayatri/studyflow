import { validateFlashcardResult } from './src/lib/validateResult.js';

console.log('==============================================');
console.log('RUNNING COMPREHENSIVE STUDYFLOW TEST SUITE');
console.log('==============================================\n');

let passedCount = 0;
let totalCount = 0;

function assert(description, condition) {
  totalCount++;
  if (condition) {
    console.log(`✓ [PASS] ${description}`);
    passedCount++;
  } else {
    console.error(`✗ [FAIL] ${description}`);
  }
}

// 1. Normal valid input
const validData = {
  topic: 'DBMS Normalization',
  cards: [
    { id: 1, question: 'What is 1NF?', answer: 'Atomic values.' },
    { id: 2, question: 'What is 2NF?', answer: '1NF + no partial dependency.' }
  ]
};
const res1 = validateFlashcardResult(validData);
assert('1. Normal valid input passes validation', res1.isValid === true && res1.data.cards.length === 2);

// 2. Stringified valid JSON
const res2 = validateFlashcardResult(JSON.stringify(validData));
assert('2. Stringified valid JSON parses and passes', res2.isValid === true && res2.data.topic === 'DBMS Normalization');

// 3. Null or undefined input
const res3 = validateFlashcardResult(null);
assert('3. Null input fails gracefully', res3.isValid === false && res3.error.includes('Empty response'));

const res3b = validateFlashcardResult(undefined);
assert('3b. Undefined input fails gracefully', res3b.isValid === false);

// 4. Empty string
const res4 = validateFlashcardResult('   ');
assert('4. Empty string fails gracefully', res4.isValid === false && res4.error.includes('Empty response text'));

// 5. Malformed JSON string
const res5 = validateFlashcardResult('{ topic: "invalid JSON", cards: [');
assert('5. Malformed JSON fails with friendly error', res5.isValid === false && res5.error.includes('unexpected response format'));

// 6. Non-object root (e.g. array)
const res6 = validateFlashcardResult([1, 2, 3]);
assert('6. Non-object root fails validation', res6.isValid === false && res6.error.includes('expected a JSON object'));

// 7. Missing topic
const res7 = validateFlashcardResult({ cards: [{ id: 1, question: 'Q', answer: 'A' }] });
assert('7. Missing topic fails validation', res7.isValid === false && res7.error.includes('missing or empty study topic'));

// 8. Empty string topic
const res8 = validateFlashcardResult({ topic: '   ', cards: [{ id: 1, question: 'Q', answer: 'A' }] });
assert('8. Blank topic fails validation', res8.isValid === false && res8.error.includes('missing or empty study topic'));

// 9. Missing cards property
const res9 = validateFlashcardResult({ topic: 'Operating Systems' });
assert('9. Missing cards property fails validation', res9.isValid === false && res9.error.includes('missing "cards" list'));

// 10. Cards is not an array
const res10 = validateFlashcardResult({ topic: 'Operating Systems', cards: 'not an array' });
assert('10. Non-array cards property fails validation', res10.isValid === false);

// 11. Empty cards array
const res11 = validateFlashcardResult({ topic: 'Operating Systems', cards: [] });
assert('11. Empty cards array fails with guidance', res11.isValid === false && res11.error.includes('could not generate flashcards'));

// 12. Card is not an object
const res12 = validateFlashcardResult({ topic: 'Test', cards: ['just a string'] });
assert('12. Primitive card item fails validation', res12.isValid === false && res12.error.includes('Invalid card structure'));

// 13. Card missing id
const res13 = validateFlashcardResult({ topic: 'Test', cards: [{ question: 'Q?', answer: 'A!' }] });
assert('13. Card missing id fails validation', res13.isValid === false && res13.error.includes('missing required fields'));

// 14. Card missing question
const res14 = validateFlashcardResult({ topic: 'Test', cards: [{ id: 1, answer: 'A!' }] });
assert('14. Card missing question fails validation', res14.isValid === false && res14.error.includes('missing required fields'));

// 15. Card missing answer
const res15 = validateFlashcardResult({ topic: 'Test', cards: [{ id: 1, question: 'Q?' }] });
assert('15. Card missing answer fails validation', res15.isValid === false && res15.error.includes('missing required fields'));

// 16. Card with blank question
const res16 = validateFlashcardResult({ topic: 'Test', cards: [{ id: 1, question: '   ', answer: 'A!' }] });
assert('16. Card with empty question string fails', res16.isValid === false && res16.error.includes('empty or invalid question'));

// 17. Card with blank answer
const res17 = validateFlashcardResult({ topic: 'Test', cards: [{ id: 1, question: 'Q?', answer: '' }] });
assert('17. Card with empty answer string fails', res17.isValid === false && res17.error.includes('empty or invalid answer'));

// 18. Card trimming and sanitization
const res18 = validateFlashcardResult({
  topic: '  Trimmed Topic  ',
  cards: [{ id: 1, question: '  Trimmed Question?  ', answer: '  Trimmed Answer.  ' }]
});
assert(
  '18. Valid cards are trimmed correctly',
  res18.isValid === true &&
  res18.data.topic === 'Trimmed Topic' &&
  res18.data.cards[0].question === 'Trimmed Question?' &&
  res18.data.cards[0].answer === 'Trimmed Answer.'
);

// 19. Large deck handling
const largeCards = Array.from({ length: 15 }, (_, i) => ({
  id: i + 1,
  question: `Concept #${i + 1} Question?`,
  answer: `Concept #${i + 1} Detailed explanation and core insight.`
}));
const res19 = validateFlashcardResult({ topic: 'Large Deck', cards: largeCards });
assert('19. Large deck (15 cards) validates cleanly', res19.isValid === true && res19.data.cards.length === 15);

// 19b. Expected count validation: reasonable count matches
const res19b = validateFlashcardResult({ topic: '10 Cards', cards: Array.from({ length: 10 }, (_, i) => ({ id: i + 1, question: `Q${i + 1}`, answer: `A${i + 1}` })) }, 10);
assert('19b. Expected 10 cards with 10 cards returns valid', res19b.isValid === true && res19b.data.cards.length === 10);

// 19c. Expected count validation: unreasonably few cards rejected
const res19c = validateFlashcardResult({ topic: 'Too Few', cards: [{ id: 1, question: 'Q1', answer: 'A1' }, { id: 2, question: 'Q2', answer: 'A2' }] }, 10);
assert('19c. Expected 10 cards with only 2 cards fails reasonableness check', res19c.isValid === false && res19c.error.includes('unexpected number of cards'));

// 19d. Expected count validation: unreasonably many cards rejected
const res19d = validateFlashcardResult({ topic: 'Too Many', cards: Array.from({ length: 30 }, (_, i) => ({ id: i + 1, question: `Q${i + 1}`, answer: `A${i + 1}` })) }, 10);
assert('19d. Expected 10 cards with 30 cards fails reasonableness check', res19d.isValid === false && res19d.error.includes('unexpected number of cards'));

// 19e. Card with empty/missing id rejected
const res19e = validateFlashcardResult({ topic: 'No Id', cards: [{ id: '', question: 'Q', answer: 'A' }] });
assert('19e. Card with blank id fails validation', res19e.isValid === false && res19e.error.includes('missing required fields'));

// 19f. Unreasonably large deck without expectedCount rejected (> 50 cards)
const res19f = validateFlashcardResult({ topic: 'Massive Deck', cards: Array.from({ length: 60 }, (_, i) => ({ id: i + 1, question: `Q${i + 1}`, answer: `A${i + 1}` })) });
assert('19f. Deck with > 50 cards fails reasonableness check', res19f.isValid === false && res19f.error.includes('unreasonably large'));

let isBackendLive = false;
try {
  const healthCheck = await fetch('http://localhost:5000/api/health', { signal: AbortSignal.timeout(1500) });
  if (healthCheck.ok) {
    isBackendLive = true;
  }
} catch {
  isBackendLive = false;
}

if (isBackendLive) {
  console.log('\nTesting live backend /api/generate...');
  try {
    const t0 = Date.now();
    const response = await fetch('http://localhost:5000/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: 'DBMS normalization', count: 5 }),
    });

    const json = await response.json();
    const validBackend = validateFlashcardResult(json, 5);
    assert(
      '20. Live Backend returns strictly valid JSON matching schema and requested count',
      validBackend.isValid === true && validBackend.data.cards.length >= 3 && validBackend.data.cards.length <= 7
    );
    console.log(`Backend generation took: ${Date.now() - t0}ms, returned ${validBackend.data?.cards?.length} cards`);
  } catch (e) {
    assert('20. Live Backend check', false);
    console.error(e);
  }
} else {
  console.log('\n[INFO] Backend server is not running on port 5000.');
  console.log('Skipping live endpoint test. (To run live integration tests, start backend with `npm run server` and rerun `npm test`)\n');
}

console.log('\n==============================================');
console.log(`RESULTS: ${passedCount} / ${totalCount} TESTS PASSED`);
console.log('==============================================');

if (passedCount === totalCount) {
  process.exit(0);
} else {
  process.exit(1);
}
