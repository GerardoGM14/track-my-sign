import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Detectar scroll global para mostrar scrollbar
let scrollTimeout
const handleGlobalScroll = () => {
  document.documentElement.classList.add('scrolling')
  document.body.classList.add('scrolling')
  
  clearTimeout(scrollTimeout)
  scrollTimeout = setTimeout(() => {
    document.documentElement.classList.remove('scrolling')
    document.body.classList.remove('scrolling')
  }, 1000)
}

window.addEventListener('scroll', handleGlobalScroll, { passive: true })

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
