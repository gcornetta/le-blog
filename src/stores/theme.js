// src/stores/theme.js
import { persistentAtom } from '@nanostores/persistent';

export const themeStore = persistentAtom('theme', 'light');

export function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

themeStore.subscribe((theme) => {
  applyTheme(theme);
});
