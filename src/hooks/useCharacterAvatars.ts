import { useState, useEffect } from 'react';

// Cache in memory
let avatarCache: Record<string, string> = {};

export function useCharacterAvatars() {
  const [avatars, setAvatars] = useState<Record<string, string>>(() => {
    // Initialize from cache or localStorage
    const initial: Record<string, string> = { ...avatarCache };
    const keys = [
      'head',
      'eldest_son',
      'eldest_daughter',
      'second_son',
      'second_daughter',
      'third_son',
      'third_daughter',
      'phantom_thief',
      'kitsune',
      'grandfather',
    ];

    keys.forEach((k) => {
      if (!initial[k]) {
        try {
          const stored = localStorage.getItem(`mansion_avatar_${k}`);
          if (stored) {
            initial[k] = stored;
          }
        } catch {
          // ignore
        }
      }
    });

    avatarCache = initial;
    return initial;
  });

  const refreshAvatars = (data?: {
    available?: string[];
    characters?: Record<string, string>;
  }) => {
    const next: Record<string, string> = {};
    const keys = [
      'head',
      'eldest_son',
      'eldest_daughter',
      'second_son',
      'second_daughter',
      'third_son',
      'third_daughter',
      'phantom_thief',
      'kitsune',
      'grandfather',
    ];

    // 1. Load from localStorage
    keys.forEach((k) => {
      try {
        const stored = localStorage.getItem(`mansion_avatar_${k}`);
        if (stored) {
          next[k] = stored;
        }
      } catch {
        // ignore
      }
    });

    // 2. If data passed directly includes character data URLs, apply and persist
    if (data?.characters && typeof data.characters === 'object') {
      Object.entries(data.characters).forEach(([id, val]) => {
        if (typeof val === 'string' && val.startsWith('data:image/')) {
          next[id] = val;
          try {
            localStorage.setItem(`mansion_avatar_${id}`, val);
          } catch {
            // ignore
          }
        }
      });
      if (next['head'] && !next['grandfather']) {
        next['grandfather'] = next['head'];
      }
      avatarCache = { ...next };
      setAvatars({ ...next });
      return;
    }

    // 3. Fallback: fetch /api/characters/all from server to get all in-memory avatars
    fetch('/api/characters/all')
      .then((res) => res.json())
      .then((resData) => {
        if (resData?.characters && typeof resData.characters === 'object') {
          Object.entries(resData.characters).forEach(([id, val]) => {
            if (typeof val === 'string' && val.startsWith('data:image/')) {
              next[id] = val;
              try {
                localStorage.setItem(`mansion_avatar_${id}`, val);
              } catch {
                // ignore
              }
            }
          });
          if (next['head'] && !next['grandfather']) {
            next['grandfather'] = next['head'];
          }
        }

        // 4. If files exist on server under /characters/${id}.png
        if (data?.available && Array.isArray(data.available)) {
          const now = Date.now();
          data.available.forEach((id) => {
            if (!next[id]) {
              next[id] = `/characters/${id}.png?v=${now}`;
            }
          });
        }

        avatarCache = { ...next };
        setAvatars({ ...next });
      })
      .catch(() => {
        avatarCache = next;
        setAvatars({ ...next });
      });
  };

  useEffect(() => {
    // Initial fetch from server
    refreshAvatars();

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{
        available?: string[];
        characters?: Record<string, string>;
      }>;
      refreshAvatars(customEvent.detail);
    };

    window.addEventListener('mansion_characters_updated', handleUpdate);
    return () => {
      window.removeEventListener('mansion_characters_updated', handleUpdate);
    };
  }, []);

  return { avatars, refreshAvatars };
}
