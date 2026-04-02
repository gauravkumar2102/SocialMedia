import React, { useState } from 'react'
import {
  Box, Card, CardContent, Typography, TextField,
  Button, CircularProgress, Link, Divider, InputAdornment, IconButton
} from '@mui/material'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import { signup } from '../api/index.js'
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

export default function SignupPage() {
  const [form, setForm]         = useState({ username: '', email: '', password: '', confirmPassword: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [errors, setErrors]     = useState({})
  const { loginUser }           = useAuth()
  const navigate                = useNavigate()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' })
  }

  const validate = () => {
    const e = {}
    if (!form.username.trim()) e.username = 'Username is required'
    else if (form.username.length < 3) e.username = 'Min 3 characters'
    else if (form.username.length > 30) e.username = 'Max 30 characters'
    if (!form.email) e.email = 'Email is required'
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.password) e.password = 'Password is required'
    else if (form.password.length < 6) e.password = 'Min 6 characters'
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match'
    setErrors(e)
    return !Object.keys(e).length
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const res = await signup({ username: form.username.trim(), email: form.email, password: form.password })
      const { token, ...userData } = res.data
      loginUser(userData, token)
      toast.success(`Welcome to SocialWave, ${userData.username}! 🌊`)
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed')
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
        <Typography fontWeight={800} fontSize="1.7rem" color="text.primary" sx={{ letterSpacing: '-0.5px' }}>
          SocialWave
        </Typography>
        <Typography variant="body2" color="text.secondary">Join the community today</Typography>
      </Box>

      <Card sx={{ width: '100%', maxWidth: 420, borderRadius: '20px', boxShadow: '0 4px 28px rgba(0,0,0,0.10)' }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Typography fontWeight={700} fontSize="1.25rem" mb={0.5}>Create Account ✨</Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>Free and takes less than a minute</Typography>

          <Box component="form" onSubmit={handleSubmit} noValidate>
            {[
              { label: 'Username', name: 'username', type: 'text', placeholder: 'johndoe' },
              { label: 'Email',    name: 'email',    type: 'email', placeholder: 'your@email.com' },
            ].map(({ label, name, type, placeholder }) => (
              <Box key={name} sx={{ mb: 2 }}>
                <Typography variant="body2" fontWeight={600} mb={0.5}>{label}</Typography>
                <TextField fullWidth size="small" name={name} type={type}
                  placeholder={placeholder} value={form[name]}
                  onChange={handleChange}
                  error={!!errors[name]} helperText={errors[name]}
                  sx={fieldSx} />
              </Box>
            ))}

            <Typography variant="body2" fontWeight={600} mb={0.5}>Password</Typography>
            <TextField fullWidth size="small" name="password"
              type={showPass ? 'text' : 'password'} placeholder="Min. 6 characters"
              value={form.password} onChange={handleChange}
              error={!!errors.password} helperText={errors.password}
              sx={{ ...fieldSx, mb: 2 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPass(!showPass)} size="small" edge="end">
                      {showPass ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }} />

            <Typography variant="body2" fontWeight={600} mb={0.5}>Confirm Password</Typography>
            <TextField fullWidth size="small" name="confirmPassword"
              type="password" placeholder="Re-enter password"
              value={form.confirmPassword} onChange={handleChange}
              error={!!errors.confirmPassword} helperText={errors.confirmPassword}
              sx={{ ...fieldSx, mb: 3 }} />

            <Button type="submit" fullWidth variant="contained" size="large"
              disabled={loading}
              endIcon={loading && <CircularProgress size={18} color="inherit" />}
              sx={{ borderRadius: 2, py: 1.3, fontSize: '0.97rem', mb: 2 }}>
              {loading ? 'Creating…' : 'Create Account'}
            </Button>
          </Box>

          <Divider sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary">OR</Typography>
          </Divider>

          <Typography variant="body2" color="text.secondary" textAlign="center">
            Already have an account?{' '}
            <Link component={RouterLink} to="/login"
              sx={{ color: '#1877F2', fontWeight: 700, textDecoration: 'none' }}>
              Sign In
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}
