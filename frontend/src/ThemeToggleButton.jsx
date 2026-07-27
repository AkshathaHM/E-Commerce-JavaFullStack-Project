import { useContext } from 'react';
import { FaMoon, FaSun } from 'react-icons/fa';
import { ThemeContext } from './ThemeContext';

export default function ThemeToggleButton({ className = '' }) {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      className={`theme-switch ${isDark ? 'theme-switch--dark' : 'theme-switch--light'} ${className}`.trim()}
      onClick={toggleTheme}
      role="switch"
      aria-checked={isDark}
      aria-label="Toggle theme"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className="theme-switch-icon" aria-hidden>
        {isDark ? <FaSun size={18} /> : <FaMoon size={18} />}
      </span>
      <span className="theme-switch-text" aria-hidden>{isDark ? 'DARK' : 'LIGHT'}</span>
    </button>
  );
}
