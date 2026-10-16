/**
 * Count how many times each character appears in the input string.
 * Example: "ابا" -> { "ا": 2, "ب": 1 }
 *
 * We build this once per search instead of re-counting for every word,
 * which saves a lot of work when checking hundreds of thousands of words.
 */
export function buildLetterCount(letters) {
  const counts = {};
  for (const char of letters) {
    counts[char] = (counts[char] || 0) + 1;
  }
  return counts;
}

/**
 * Check if `word` can be built using only the available letters,
 * respecting how many times each letter is allowed.
 *
 * We work on a *copy* of the counts so we can "consume" letters without
 * mutating the caller's object between candidate words.
 */
export function canBuildWord(word, letterCounts) {
  const available = { ...letterCounts };
  for (const char of word) {
    if (!available[char]) return false; // letter missing or already used up
    available[char]--;
  }
  return true;
}

/**
 * Find every word that:
 *   1. Has a length between minLen and maxLen (inclusive)
 *   2. Can be built from the user's letters
 *
 * We only iterate over length buckets in the requested range, so we
 * never waste time scanning words whose length we already know is wrong.
 *
 * @param {Object} wordsByLength - { 3: [...], 4: [...], ... } from useWordList
 * @param {Object} letterCounts  - precomputed via buildLetterCount
 * @param {number} minLen
 * @param {number} maxLen
 * @returns {string[]}
 */
export function findWords(wordsByLength, letterCounts, minLen, maxLen) {
  const results = [];

  for (let len = minLen; len <= maxLen; len++) {
    const bucket = wordsByLength[len];
    if (!bucket) continue;

    for (const word of bucket) {
      if (canBuildWord(word, letterCounts)) {
        results.push(word);
      }
    }
  }

  return results;
}
