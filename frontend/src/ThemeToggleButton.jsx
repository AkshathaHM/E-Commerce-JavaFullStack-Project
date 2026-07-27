import { useContext } from 'react';
import { HiMoon, HiSun } from 'react-icons/hi';
import { ThemeContext } from './ThemeContext';

export default function ThemeToggleButton() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? <HiSun size={22} color="currentColor" /> : <HiMoon size={22} color="currentColor" />}
    </button>
  );
}
