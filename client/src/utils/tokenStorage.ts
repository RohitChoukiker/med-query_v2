const STORAGE_KEY = 'access_token';
const STORAGE_MODE_KEY = 'access_token_storage_mode';

type TokenStorageMode = 'memory' | 'localStorage';

let inMemoryToken: string | null = null;

const isBrowser = (): boolean =>
  typeof window !== 'undefined' && typeof window.document !== 'undefined';

const readMode = (): TokenStorageMode => {
  if (!isBrowser()) {
    return 'memory';
  }
  const stored = window.localStorage.getItem(STORAGE_MODE_KEY);
  return stored === 'localStorage' ? 'localStorage' : 'memory';
};

const persistMode = (mode: TokenStorageMode) => {
  if (!isBrowser()) {
    return;
  }
  window.localStorage.setItem(STORAGE_MODE_KEY, mode);
};

export const tokenStorage = {
  initialize() {
    if (!isBrowser()) {
      return;
    }

    const mode = readMode();
    if (mode === 'localStorage') {
      inMemoryToken = window.localStorage.getItem(STORAGE_KEY);
    }
  },

  setToken(token: string, persist: boolean = false) {
    inMemoryToken = token;

    if (!isBrowser()) {
      return;
    }

    if (persist) {
      window.localStorage.setItem(STORAGE_KEY, token);
      persistMode('localStorage');
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
      persistMode('memory');
    }
  },

  clear() {
    inMemoryToken = null;
    if (!isBrowser()) {
      return;
    }

    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem(STORAGE_MODE_KEY);
  },

  getToken(): string | null {
    return inMemoryToken;
  },

  hasToken(): boolean {
    return !!inMemoryToken;
  },

  getMode(): TokenStorageMode {
    return readMode();
  },
};

// Initialize on module load to hydrate memory storage early.
tokenStorage.initialize();

