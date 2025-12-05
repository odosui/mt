import * as React from 'react'
import { useTheme } from '../../hooks/useTheme'
import Button from '../../ui/Button'

const ThemeSettings: React.FC = () => {
  const { theme, setTheme } = useTheme()

  return (
    <div className="settings-block">
      <h2>Appearance</h2>
      <p>Choose your preferred theme</p>
      <div className="theme-options">
        <Button
          variant={theme === 'light' ? 'primary' : undefined}
          onClick={() => setTheme('light')}
        >
          Light
        </Button>
        <Button
          variant={theme === 'dark' ? 'primary' : undefined}
          onClick={() => setTheme('dark')}
        >
          Dark
        </Button>
      </div>
    </div>
  )
}

export default ThemeSettings
