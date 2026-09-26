/**
 * Validates and sanitizes AI-generated flashcard payloads before UI rendering.
 *
 * Verifies:
 * 1. Payload presence & JSON parsing
 * 2. Root object structure
 * 3. Topic string non-empty
 * 4. Cards array existence & non-empty
 * 5. Card count reasonableness against expectedCount
 * 6. Individual card schema (id, non-empty question, non-empty answer)
 */
export function validateFlashcardResult(data, expectedCount) {
  if (data === undefined || data === null) {
    return { isValid: false, error: 'Empty response received from the server.' };
  }

  let parsed = data;
  if (typeof data === 'string') {
    const trimmed = data.trim();
    if (!trimmed) {
      return { isValid: false, error: 'Empty response text received.' };
    }
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      return { isValid: false, error: 'We received an unexpected response format. Please try again.' };
    }
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return { isValid: false, error: 'Invalid response shape: expected a JSON object.' };
  }

  if (typeof parsed.topic !== 'string' || !parsed.topic.trim()) {
    return { isValid: false, error: 'Invalid response: missing or empty study topic.' };
  }

  if (!('cards' in parsed) || parsed.cards === undefined || parsed.cards === null) {
    return { isValid: false, error: 'Invalid response: missing "cards" list.' };
  }

  if (!Array.isArray(parsed.cards)) {
    return { isValid: false, error: 'Invalid response: "cards" must be an array.' };
  }

  if (parsed.cards.length === 0) {
    return { isValid: false, error: 'The AI could not generate flashcards for this topic. Please try with more detail.' };
  }

  // Allow reasonable tolerance around requested card count to avoid failing over minor LLM count variance
  if (typeof expectedCount === 'number' && expectedCount > 0) {
    const minReasonable = Math.max(1, Math.floor(expectedCount * 0.5));
    const maxReasonable = Math.ceil(expectedCount * 1.5) + 2;
    if (parsed.cards.length < minReasonable || parsed.cards.length > maxReasonable) {
      return {
        isValid: false,
        error: `Received an unexpected number of cards (${parsed.cards.length}). Expected approximately ${expectedCount}.`,
      };
    }
  } else if (parsed.cards.length > 50) {
    return { isValid: false, error: 'Received an unreasonably large number of flashcards.' };
  }

  const sanitizedCards = [];

  for (let i = 0; i < parsed.cards.length; i++) {
    const card = parsed.cards[i];
    const index = i + 1;

    if (typeof card !== 'object' || card === null || Array.isArray(card)) {
      return { isValid: false, error: `Invalid card structure at item #${index}.` };
    }

    if (
      !('id' in card) ||
      !('question' in card) ||
      !('answer' in card) ||
      card.id === undefined ||
      card.id === null ||
      card.id === ''
    ) {
      return {
        isValid: false,
        error: `Card #${index} is missing required fields (id, question, or answer).`,
      };
    }

    if (typeof card.question !== 'string' || !card.question.trim()) {
      return { isValid: false, error: `Card #${index} has an empty or invalid question.` };
    }

    if (typeof card.answer !== 'string' || !card.answer.trim()) {
      return { isValid: false, error: `Card #${index} has an empty or invalid answer.` };
    }

    sanitizedCards.push({
      id: card.id,
      question: card.question.trim(),
      answer: card.answer.trim(),
    });
  }

  return {
    isValid: true,
    data: {
      topic: parsed.topic.trim(),
      cards: sanitizedCards,
    },
  };
}
