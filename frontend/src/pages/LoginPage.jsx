import React, { useState } from 'react'
import {
  Box, Card, CardContent, Typography, TextField,
  Button, CircularProgress, Link, Divider, InputAdornment, IconButton
} from '@mui/material'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import { login } from '../api/index.js'
import { useAuth } from '../context/AuthContext.jsx'
import { toast } from 'react-toastify'

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    bgcolor: '#F8F9FA',
    '& fieldset': { borderColor: '#E0E0E0' },
    '&:hover fieldset': { borderColor: '#1877F2' },
    '&.Mui-focused fieldset': { borderColor: '#1877F2', borderWidth: 2 },
  },
}

export default function LoginPage() {
  const [email, setEmail]               = useState('')
  const [password, setPassword]         = useState('')
  const [showPass, setShowPass]         = useState(false)
  const [loading, setLoading]           = useState(false)
  const [errors, setErrors]             = useState({})
  const { loginUser }                   = useAuth()
  const navigate                        = useNavigate()

  const validate = () => {
    const e = {}
    if (!email) e.email = 'Email is required'
    else if (!/^\S+@\S+\.\S+$/.test(email)) e.email = 'Enter a valid email'
    if (!password) e.password = 'Password is required'
    setErrors(e)
    return !Object.keys(e).length
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const res = await login({ email, password })
      const { token, ...userData } = res.data
      loginUser(userData, token)
      toast.success(`Welcome back, ${userData.username}! 👋`)
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{
      minHeight: '100vh', bgcolor: '#F0F2F5',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', p: 2,
    }}>
      {/* Logo */}
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Box sx={{
          width: 68, height: 68, borderRadius: '18px',
          bgcolor: '#1877F2', display: 'flex', alignItems: 'center',
          justifyContent: 'center', mx: 'auto', mb: 1.5,
          boxShadow: '0 6px 20px rgba(24,119,242,0.45)',
        }}>
          <Typography fontSize="2rem">🌊</Typography>
        </Box>
        <Typography fontWeight={800} fontSize="1.7rem" color="text.primary"
          sx={{ letterSpacing: '-0.5px' }}>
          SocialWave
        </Typography>
        <Typography variant="body2" color="text.secondary">Connect. Share. Inspire.</Typography>
      </Box>

      <Card sx={{ width: '100%', maxWidth: 420, borderRadius: '20px', boxShadow: '0 4px 28px rgba(0,0,0,0.10)' }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Typography fontWeight={700} fontSize="1.25rem" mb={0.5}>Welcome back 👋</Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>Sign in to your account</Typography>

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Typography variant="body2" fontWeight={600} mb={0.5}>Email</Typography>
            <TextField fullWidth size="small" type="email" placeholder="your@email.com"
              value={email} onChange={(e) => setEmail(e.target.value)}
              error={!!errors.email} helperText={errors.email}
              sx={{ ...fieldSx, mb: 2 }} />

            <Typography variant="body2" fontWeight={600} mb={0.5}>Password</Typography>
            <TextField fullWidth size="small"
              type={showPass ? 'text' : 'password'} placeholder="••••••••"
              value={password} onChange={(e) => setPassword(e.target.value)}
              error={!!errors.password} helperText={errors.password}
              sx={{ ...fieldSx, mb: 3 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPass(!showPass)} size="small" edge="end">
                      {showPass ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }} />

            <Button type="submit" fullWidth variant="contained" size="large"
              disabled={loading}
              endIcon={loading && <CircularProgress size={18} color="inherit" />}
              sx={{ borderRadius: 2, py: 1.3, fontSize: '0.97rem', mb: 2 }}>
              {loading ? 'Signing in…' : 'Sign In'}
            </Button>
          </Box>

          <Divider sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary">OR</Typography>
          </Divider>

          <Typography variant="body2" color="text.secondary" textAlign="center">
            Don't have an account?{' '}
            <Link component={RouterLink} to="/signup"
              sx={{ color: '#1877F2', fontWeight: 700, textDecoration: 'none' }}>
              Sign Up
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}
