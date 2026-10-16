import { useEffect, useState } from 'react';

/**
 * Loads /words.txt once, then prepares it for fast searching:
 *   - Trims whitespace and drops empty lines
 *   - Deduplicates via a Set (750k-word dumps often contain repeats)
 *   - Groups words into buckets keyed by their length
 *
 * Bucketing is the key optimization: for a search limited to, say,
 * lengths 4–6, we never even look at the other ~700k words.
 */
export function useWordList() {
  const [wordsByLength, setWordsByLength] = useState({});
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Prevents state updates after unmount (React 18 StrictMode double-invokes effects)
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch('/words.txt');
        if (!res.ok)
          throw new Error(`بارگذاری فایل با خطا مواجه شد (${res.status})`);

        const text = await res.text();

        // Clean + dedupe in one pass
        const unique = new Set(
          text
            .split('\n')
            .map((w) => w.trim())
            .filter(Boolean),
        );

        // Group by length: { 2: [...], 3: [...], ... }
        const buckets = {};
        for (const word of unique) {
          const len = word.length;
          (buckets[len] ||= []).push(word);
        }

        if (!cancelled) {
          setWordsByLength(buckets);
          setTotalCount(unique.size);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { wordsByLength, totalCount, loading, error };
}
