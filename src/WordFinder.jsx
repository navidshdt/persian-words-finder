import { useState, useMemo } from 'react';
import { findWords, buildLetterCount } from './utils/wordUtils';
import { useWordList } from './hooks/useWordList';

export default function WordFinder() {
  // Load the dictionary once on mount
  const { wordsByLength, totalCount, loading, error } = useWordList();

  // --- Form state ---
  const [letters, setLetters] = useState('');
  const [minLen, setMinLen] = useState(3);
  const [maxLen, setMaxLen] = useState(5);

  // --- Search results state ---
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // Precompute letter counts only when the input changes.
  // This object is reused across every candidate word in findWords.
  const letterCounts = useMemo(
    () => buildLetterCount(letters.trim()),
    [letters],
  );

  // Show the user how many words will actually be checked.
  // It's a nice sanity check that bucketing is doing its job.
  const candidateCount = useMemo(() => {
    let sum = 0;
    for (let len = minLen; len <= maxLen; len++) {
      sum += wordsByLength[len]?.length || 0;
    }
    return sum;
  }, [wordsByLength, minLen, maxLen]);

  const handleSearch = () => {
    if (!letters.trim()) return;
    setSearching(true);

    // Defer the heavy work one tick so React can paint the "searching..."
    // state before the main thread is blocked by the search loop.
    setTimeout(() => {
      const found = findWords(wordsByLength, letterCounts, minLen, maxLen);
      setResults(found);
      setSearching(false);
    }, 0);
  };

  // --- Loading / error screens ---
  if (loading) {
    return (
      <div className="word-finder">
        <p className="state-message">
          در حال بارگذاری دیکشنری... (ممکن است چند ثانیه طول بکشد)
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="word-finder">
        <p className="state-message error">خطا: {error}</p>
      </div>
    );
  }

  return (
    <div className="word-finder">
      <h1>کلمه‌یاب فارسی</h1>
      <p className="subtitle">
        {totalCount.toLocaleString('fa-IR')} کلمه یکتا بارگذاری شد
      </p>

      {/* Letters input */}
      <div className="field">
        <label htmlFor="letters">حروف در دسترس</label>
        <input
          id="letters"
          type="text"
          placeholder="مثلاً: ابکلم"
          value={letters}
          onChange={(e) => setLetters(e.target.value)}
        />
      </div>

      {/* Length range */}
      <div className="length-row">
        <div className="field">
          <label htmlFor="minLen">حداقل طول</label>
          <input
            id="minLen"
            type="number"
            min={1}
            value={minLen}
            onChange={(e) => setMinLen(Number(e.target.value))}
          />
        </div>
        <div className="field">
          <label htmlFor="maxLen">حداکثر طول</label>
          <input
            id="maxLen"
            type="number"
            min={1}
            value={maxLen}
            onChange={(e) => setMaxLen(Number(e.target.value))}
          />
        </div>
      </div>

      <p className="meta">
        در این بازه طولی {candidateCount.toLocaleString('fa-IR')} کلمه بررسی
        خواهد شد
      </p>

      <button
        className="search-btn"
        onClick={handleSearch}
        disabled={searching || !letters.trim()}
      >
        {searching ? 'در حال جستجو...' : 'جستجو'}
      </button>

      {/* Results */}
      {results.length > 0 && (
        <>
          <p className="results-header">
            {results.length.toLocaleString('fa-IR')} کلمه پیدا شد:
          </p>
          <ul className="results-list">
            {results.map((word, i) => (
              <li key={i}>{word}</li>
            ))}
          </ul>
        </>
      )}

      {!searching && results.length === 0 && letters.trim() && (
        <p className="state-message">نتیجه‌ای یافت نشد.</p>
      )}
    </div>
  );
}
