import { useContext } from 'react';
import { FaMoon, FaSun } from 'react-icons/fa';
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
      {isDark ? <FaSun size={20} color="currentColor" /> : <FaMoon size={20} color="currentColor" />}
    </button>
  );
}
