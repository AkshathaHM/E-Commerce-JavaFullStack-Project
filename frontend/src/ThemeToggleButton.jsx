import { useContext } from 'react';
import { FaMoon, FaSun } from 'react-icons/fa';
import { ThemeContext } from './ThemeContext';

export default function ThemeToggleButton() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      className={`theme-toggle theme-switch ${isDark ? 'theme-switch--dark' : 'theme-switch--light'}`}
      onClick={toggleTheme}
      role="switch"
      aria-checked={isDark}
      aria-label="Toggle theme"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div className="theme-switch-inner">
        <span className="theme-switch-icon" aria-hidden>
          {isDark ? <FaSun size={18} /> : <FaMoon size={18} />}
        </span>
        <span className="theme-switch-text" aria-hidden>{isDark ? 'DARK MODE' : 'LIGHT MODE'}</span>
      </div>
    </button>
  );
}
