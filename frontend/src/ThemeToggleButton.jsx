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
      aria-label="Toggle theme"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className="theme-switch-track" aria-hidden />
      <span className="theme-switch-thumb" aria-hidden>
        {isDark ? <FaSun size={14} /> : <FaMoon size={14} />}
      </span>
    </button>
  );
}
