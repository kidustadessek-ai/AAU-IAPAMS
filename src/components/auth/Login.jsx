import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/authContext';
import {
  Box, Button, FormControl, IconButton, InputAdornment,
  InputLabel, Link as MuiLink, MenuItem, Select, TextField,
  Typography, CircularProgress,
} from '@mui/material';
import { Visibility, VisibilityOff, SchoolOutlined } from '@mui/icons-material';
import { ThemeProvider } from '@mui/material/styles';
import { aauTheme } from '../../theme';

const Login = () => {
  const [selectedRole, setSelectedRole] = useState('');
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const roles = [
    { value: 'admin', label: 'Administrator' },
    { value: 'evaluator', label: 'Evaluator' },
    { value: 'staff', label: 'Academic Staff' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!credentials.username || !credentials.password || !selectedRole) {
      toast.error('Please fill in all fields');
      return;
    }
    setIsLoading(true);
    try {
      const user = await login(credentials.username, credentials.password);
      toast.success('Welcome back!');
      navigate(`/${user.role}/dashboard`);
    } catch (error) {
      toast.error(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemeProvider theme={aauTheme}>
      <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: '#f8f7f5' }}>

        {/* Left Panel — Branding */}
        <Box sx={{
          display: { xs: 'none', md: 'flex' },
          width: '45%',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: '#7B1113',
          position: 'relative',
          overflow: 'hidden',
          px: 6,
        }}>
          {/* Subtle pattern overlay */}
          <Box sx={{
            position: 'absolute', inset: 0, opacity: 0.04,
            backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)',
            backgroundSize: '20px 20px',
          }} />

          <Box sx={{ position: 'relative', textAlign: 'center' }}>
            {/* AAU Seal placeholder */}
            <Box sx={{
              width: 96, height: 96, borderRadius: '50%',
              border: '3px solid rgba(255,255,255,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              mx: 'auto', mb: 4, bgcolor: 'rgba(255,255,255,0.08)',
            }}>
              <SchoolOutlined sx={{ fontSize: 48, color: 'rgba(255,255,255,0.9)' }} />
            </Box>

            <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700, letterSpacing: 0.5, mb: 1 }}>
              Addis Ababa University
            </Typography>
            <Box sx={{ width: 48, height: 2, bgcolor: '#C9A84C', mx: 'auto', mb: 3 }} />
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.75)', lineHeight: 1.8, maxWidth: 320 }}>
              Internal Academic Position Appointment Management System
            </Typography>

            <Box sx={{ mt: 6, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {['Streamlined Appointments', 'Transparent Evaluation', 'Institutional Excellence'].map((item) => (
                <Box key={item} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#C9A84C', flexShrink: 0 }} />
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.65)' }}>{item}</Typography>
                </Box>
              ))}
            </Box>
          </Box>

          <Typography variant="caption" sx={{ position: 'absolute', bottom: 24, color: 'rgba(255,255,255,0.35)' }}>
            © {new Date().getFullYear()} Addis Ababa University
          </Typography>
        </Box>

        {/* Right Panel — Form */}
        <Box sx={{
          flex: 1, display: 'flex', flexDirection: 'column',
          justifyContent: 'center', alignItems: 'center', px: { xs: 3, sm: 6, md: 8 },
        }}>
          <Box sx={{ width: '100%', maxWidth: 420 }}>

            {/* Mobile header */}
            <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 4, textAlign: 'center' }}>
              <Typography variant="h5" fontWeight={700} sx={{ color: '#7B1113' }}>
                Addis Ababa University
              </Typography>
              <Typography variant="caption" color="text.secondary">IAPAMS</Typography>
            </Box>

            <Typography variant="h5" fontWeight={700} sx={{ color: '#1a1a2e', mb: 0.5 }}>
              Sign in to your account
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Enter your credentials to access the system
            </Typography>

            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

              <FormControl fullWidth required>
                <InputLabel>Role</InputLabel>
                <Select value={selectedRole} label="Role" onChange={(e) => setSelectedRole(e.target.value)}
                  sx={{ borderRadius: 1.5 }}>
                  {roles.map((r) => (
                    <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                required fullWidth label="Username" name="username"
                autoComplete="username" autoFocus
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
              />

              <TextField
                required fullWidth label="Password" name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: -1 }}>
                <MuiLink component={Link} to="/forgot-password" variant="body2"
                  sx={{ color: '#7B1113', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                  Forgot password?
                </MuiLink>
              </Box>

              <Button type="submit" fullWidth variant="contained" disabled={isLoading}
                sx={{
                  py: 1.5, borderRadius: 1.5, bgcolor: '#7B1113',
                  '&:hover': { bgcolor: '#5a0d0f' },
                  fontWeight: 600, fontSize: '0.95rem', letterSpacing: 0.3,
                  boxShadow: '0 4px 14px rgba(123,17,19,0.3)',
                }}>
                {isLoading
                  ? <Box display="flex" alignItems="center" gap={1}><CircularProgress size={18} color="inherit" /><span>Signing in...</span></Box>
                  : 'Sign In'}
              </Button>
            </Box>

            <Typography variant="caption" color="text.disabled" sx={{ display: 'block', textAlign: 'center', mt: 5 }}>
              AAU-IAPAMS · Secure Access Portal
            </Typography>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Login;
