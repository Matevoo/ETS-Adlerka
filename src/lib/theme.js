import { writable } from 'svelte/store';
import { browser } from '$app/environment';

function createTheme() {
  const initial = browser ? (localStorage.getItem('theme') ?? 'dark') : 'dark';
  const { subscribe, set, update } = writable(initial);

  function applyTheme(val) {
    if (!browser) return;
    document.documentElement.classList.toggle('dark',  val === 'dark');
    document.documentElement.classList.toggle('light', val === 'light');
    localStorage.setItem('theme', val);
  }

  return {
    subscribe,
    toggle() {
      update(current => {
        const next = current === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        return next;
      });
    },
    init() {
      if (!browser) return;
      const saved = localStorage.getItem('theme') ?? 'dark';
      set(saved);
      applyTheme(saved);
    }
  };
}

export const theme = createTheme();
