export const readFromStorage = (storage: Storage) => (
  key: string
): string | undefined => {
  const data = storage.getItem(key);

  return data ?? undefined;
};

export const writeToStorage = (storage: Storage) => (
  key: string,
  value: string
): void => {
  storage.setItem(key, value);
};

export const createStorage = (): Storage =>
  typeof window !== "undefined" ? window.localStorage : ({} as Storage);
