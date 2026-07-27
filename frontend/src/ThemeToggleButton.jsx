import { useContext } from 'react';
import { FaMoon, FaSun } from 'react-icons/fa';
import { ThemeContext } from './ThemeContext';

export default function ThemeToggleButton({ className = '' }) {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      className={`theme-switch theme-switch--pill ${className}`.trim()}
      onClick={toggleTheme}
      role="switch"
      aria-checked={isDark}
      aria-label="Toggle theme"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className={`theme-switch-option ${isDark ? 'active' : ''}`} aria-hidden>
        <FaMoon size={16} />
      </span>
      <span className={`theme-switch-option ${!isDark ? 'active' : ''}`} aria-hidden>
        <FaSun size={16} />
      </span>
    </button>
  );
}
