import { MoonIcon, SunIcon } from '@primer/octicons-react'
import * as React from 'react'
import { useTheme } from '../hooks/useTheme'

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="theme-toggle">
      <button
        className="theme-toggle-button"
        onClick={toggleTheme}
        aria-label="Toggle theme"
        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        <div className={`theme-toggle-track ${theme}`}>
          <div className="theme-toggle-icons">
            <SunIcon className="theme-icon sun-icon" />
            <MoonIcon className="theme-icon moon-icon" />
          </div>
          <div className="theme-toggle-thumb" />
        </div>
      </button>
    </div>
  )
}

export default ThemeToggle
