import { useContext } from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';
import { ThemeContext } from './ThemeContext';

export default function ThemeToggleButton() {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      title="Toggle light / dark mode"
    >
      {theme === 'dark' ? <FiSun size={20} /> : <FiMoon size={20} />}
    </button>
  );
}
