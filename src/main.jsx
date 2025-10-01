import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'

import AppContexts from './contexts/AppContexts.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AppContexts>
        <App />
      </AppContexts>
    </BrowserRouter>
  </StrictMode>,
)
