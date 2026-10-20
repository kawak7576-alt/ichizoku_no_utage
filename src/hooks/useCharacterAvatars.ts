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

  const refreshAvatars = (serverAvailable?: string[]) => {
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

    // Check server available images if provided or cached
    const applyServerList = (availableList: string[]) => {
      const now = Date.now();
      availableList.forEach((id) => {
        if (!next[id]) {
          next[id] = `/characters/${id}.png?v=${now}`;
        }
      });
      avatarCache = { ...next };
      setAvatars({ ...next });
    };

    if (serverAvailable && Array.isArray(serverAvailable) && serverAvailable.length > 0) {
      applyServerList(serverAvailable);
    } else {
      fetch('/api/characters/list')
        .then((res) => res.json())
        .then((data) => {
          if (data && Array.isArray(data.available)) {
            applyServerList(data.available);
          } else {
            avatarCache = next;
            setAvatars(next);
          }
        })
        .catch(() => {
          avatarCache = next;
          setAvatars(next);
        });
    }
  };

  useEffect(() => {
    // Initial fetch from server for any existing uploaded images
    refreshAvatars();

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ available?: string[] }>;
      refreshAvatars(customEvent.detail?.available);
    };

    window.addEventListener('mansion_characters_updated', handleUpdate);
    return () => {
      window.removeEventListener('mansion_characters_updated', handleUpdate);
    };
  }, []);

  return { avatars, refreshAvatars };
}
