import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import LoginPage from './pages/LoginPage.jsx'
import SignupPage from './pages/SignupPage.jsx'
import FeedPage from './pages/FeedPage.jsx'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1877F2' },
    secondary: { main: '#FF6B35' },
    background: { default: '#F0F2F5', paper: '#FFFFFF' },
    text: { primary: '#1C1E21', secondary: '#65676B' },
  },
  typography: {
    fontFamily: '"Sora", "Segoe UI", sans-serif',
    h6: { fontWeight: 700 },
    body1: { fontSize: '0.95rem' },
    body2: { fontSize: '0.85rem' },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600, borderRadius: 20, boxShadow: 'none' },
        contained: {
          backgroundColor: '#1877F2',
          '&:hover': { backgroundColor: '#166fe5', boxShadow: 'none' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { boxShadow: '0 1px 4px rgba(0,0,0,0.08)', borderRadius: 16 },
      },
    },
  },
})

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? children : <Navigate to="/login" replace />
}

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return null
  return !user ? children : <Navigate to="/" replace />
}

function AppContent() {
  return (
    <Router>
      <CssBaseline />
      <Routes>
        <Route path="/" element={<PrivateRoute><FeedPage /></PrivateRoute>} />
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer
        position="top-center"
        autoClose={2500}
        theme="light"
        toastStyle={{ borderRadius: 12, fontFamily: '"Sora", sans-serif' }}
      />
    </Router>
  )
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  )
}
