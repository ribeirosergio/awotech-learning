import { useState } from 'react';

export function useCodeDraft(key: string, starterCode: string) {
  const [storageError, setStorageError] = useState(false);
  const [value, setValue] = useState(() => {
    try {
      return localStorage.getItem(key) ?? starterCode;
    } catch {
      return starterCode;
    }
  });
  function change(next: string) {
    setValue(next);
    try {
      localStorage.setItem(key, next);
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }
  return { value, change, storageError };
}
