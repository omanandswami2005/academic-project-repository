import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { Toaster } from 'react-hot-toast'

const toastOptions = {
  duration: 4000,
  style: {
    background: 'var(--bg-elevated)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-primary)',
    borderRadius: '8px',
    fontSize: '0.875rem',
    padding: '12px 16px',
    boxShadow: 'var(--shadow-lg)',
  },
  success: {
    iconTheme: { primary: '#22c55e', secondary: 'var(--bg-elevated)' },
  },
  error: {
    iconTheme: { primary: '#ef4444', secondary: 'var(--bg-elevated)' },
  },
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <App />
          <Toaster position="top-right" toastOptions={toastOptions} />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
)

