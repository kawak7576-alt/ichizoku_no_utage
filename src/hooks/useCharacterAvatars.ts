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

  const refreshAvatars = () => {
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

    avatarCache = next;
    setAvatars(next);
  };

  useEffect(() => {
    // Initial fetch from server for any existing uploaded images
    fetch('/api/characters/list')
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.available) && data.available.length > 0) {
          const updated: Record<string, string> = { ...avatarCache };
          data.available.forEach((id: string) => {
            if (!updated[id]) {
              updated[id] = `/characters/${id}.png?v=${Date.now()}`;
            }
          });
          avatarCache = updated;
          setAvatars(updated);
        }
      })
      .catch(() => {});

    const handleUpdate = () => {
      refreshAvatars();
    };

    window.addEventListener('mansion_characters_updated', handleUpdate);
    return () => {
      window.removeEventListener('mansion_characters_updated', handleUpdate);
    };
  }, []);

  return { avatars, refreshAvatars };
}
