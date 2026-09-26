/**
 * Client for the Express backend.
 * Never connects directly to Gemini; all requests proxy through /api/generate.
 */
export async function generateFlashcards(input, count = 10, signal) {
  if (!input || !input.trim()) {
    throw new Error('Enter a topic or paste some notes to get started.');
  }

  // Gracefully handle argument polymorphism if called as generateFlashcards(input, signal)
  let effectiveCount = count;
  let effectiveSignal = signal;
  if (count instanceof AbortSignal || (count && typeof count === 'object' && 'aborted' in count)) {
    effectiveSignal = count;
    effectiveCount = 10;
  }

  let response;
  try {
    response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: input.trim(),
        count: Number(effectiveCount) || 10,
      }),
      signal: effectiveSignal,
    });
  } catch (err) {
    if (err.name === 'AbortError') {
      throw err; // Bubble up abort error for caller to ignore gracefully
    }
    throw new Error('Unable to reach the study server. Please check your connection and ensure the backend is running.');
  }

  let resultData;
  try {
    resultData = await response.json();
  } catch {
    throw new Error('We received an unexpected response format from the server. Please try again.');
  }

  if (!response.ok) {
    const errorMsg = resultData?.error || 'Something went wrong while generating your cards. Please try again.';
    throw new Error(errorMsg);
  }

  return resultData;
}
