import * as React from 'react'
import { Suspense, lazy } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { StateProvider } from './state/StateProvider'

const DesktopApp = lazy(() => import('./DesktopApp'))
const MobileApp = lazy(() => import('./MobileApp'))

const App: React.FC = () => {
  const isMobile = checkIfMobile()

  return (
    <BrowserRouter>
      <StateProvider>
        <Suspense fallback={<Fallback />}>
          {isMobile ? <MobileApp /> : <DesktopApp />}
        </Suspense>
      </StateProvider>
    </BrowserRouter>
  )
}

const Fallback = () => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100vw',
        fontSize: '1rem',
      }}
    >
      ...
    </div>
  )
}

const checkIfMobile = () => {
  const ua = navigator.userAgent
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    ua,
  )
}

export default App
