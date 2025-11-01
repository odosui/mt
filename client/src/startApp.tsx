import * as React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

export function startApp() {
  document.addEventListener('DOMContentLoaded', () => {
    const el = document.createElement('div')
    el.id = 'root'
    document.body.appendChild(el)
    const root = createRoot(el)
    root.render(<App />)
  })

  // window.addEventListener('load', () => {
  //   navigator.serviceWorker
  //     .register('/service-worker.js')
  //     .then((registration) => {
  //       console.log('ServiceWorker registered: ', registration)

  //       // let serviceWorker
  //       if (registration.installing) {
  //         // serviceWorker = registration.installing
  //         console.log('Service worker installing.')
  //       } else if (registration.waiting) {
  //         // serviceWorker = registration.waiting
  //         console.log('Service worker installed & waiting.')
  //       } else if (registration.active) {
  //         // serviceWorker = registration.active
  //         console.log('Service worker active.')
  //       }
  //     })
  //     .catch((registrationError) => {
  //       console.log('Service worker registration failed: ', registrationError)
  //     })
  // })
}
