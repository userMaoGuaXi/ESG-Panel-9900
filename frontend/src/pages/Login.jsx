/**
 * Login.jsx
 * 
 * Authentication component handling user login functionality for the ESG Panel application.
 * Features a responsive design with decorative elements, form validation, and navigation.
 * The component handles authentication state, form submission, and error messaging.
 * 
 * @module Login
 */

import React, { useState } from 'react';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Divider,
  Alert,
  Paper,
  Fade,
  Grow,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { Visibility, VisibilityOff, Person, Business, Lock } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
  // State management for form fields and UI control
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Hooks for navigation and responsive layout
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  /**
   * Toggles password visibility between plain text and masked characters
   */
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  /**
   * Handles form submission and authentication process
   * Validates inputs, manages loading state, and processes API response
   * 
   * @param {Event} e - Form submission event
   */
  const handleLogin = async (e) => {
    e.preventDefault();

    // Form validation - ensure all fields are filled
    if (!username || !password || !company) {
      setError("Please enter username, password, and company");
      return;
    }

    // Set loading state and clear previous errors
    setLoading(true);
    setError('');

    try {
      // Attempt authentication via API
      const response = await axios.post('http://127.0.0.1:5001/auth/login', {
        username,
        password,
        company
      });

      // Save user session and navigate to dashboard on success
      localStorage.setItem("currentUser", username);
      navigate('/dashboard', { state: { company } });
    } catch (error) {
      // Handle authentication errors
      if (error.response) {
        setError(error.response.data.error || 'Authentication failed');
      } else {
        setError('Login failed. Please check your connection and try again.');
      }
    } finally {
      // Reset loading state regardless of outcome
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#f5f5f5',
      }}
    >
      {/* Background Decorative Elements - floating gradient bubbles */}
      <Box
        sx={{
          position: 'absolute',
          top: '-10%',
          right: '-5%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(241, 245, 249, 0.8) 0%, rgba(241, 245, 249, 0) 70%)',
          filter: 'blur(40px)',
          zIndex: 0,
          animation: 'float 10s ease-in-out infinite',
          '@keyframes float': {
            '0%': { transform: 'translateY(0px)' },
            '50%': { transform: 'translateY(-20px)' },
            '100%': { transform: 'translateY(0px)' },
          }
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '-20%',
          left: '-10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(226, 232, 240, 0.7) 0%, rgba(226, 232, 240, 0) 60%)',
          filter: 'blur(40px)',
          zIndex: 0,
          animation: 'float 14s ease-in-out infinite',
          animationDelay: '2s',
        }}
      />

      {/* Main Content Container */}
      <Container maxWidth="lg" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            width: '100%',
            maxWidth: '1000px',
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: '0 10px 15px -5px rgba(0, 0, 0, 0.08)',
          }}
        >
          {/* Left Section - Brand Information and Visual Elements (hidden on mobile) */}
          {!isMobile && (
            <Grow in={true} timeout={800}>
              <Box
                sx={{
                  flex: '1 1 50%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'center',
                  p: 6,
                  background: 'rgba(255, 255, 255, 0.9)',
                  color: '#000',
                  position: 'relative',
                  overflow: 'hidden',
                  borderRight: '1px solid rgba(226, 232, 240, 0.8)',
                }}
              >
                {/* Decorative background pattern */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    opacity: 0.05,
                    backgroundImage: 'radial-gradient(circle at 25px 25px, black 2%, transparent 0%), radial-gradient(circle at 75px 75px, black 2%, transparent 0%)',
                    backgroundSize: '100px 100px',
                  }}
                />

                {/* Brand title and tagline */}
                <Typography variant="h3" fontWeight="600" sx={{ mb: 3, fontFamily: 'inherit', position: 'relative' }}>
                  ESG Panel
                </Typography>
                <Typography variant="h6" fontWeight="400" sx={{ mb: 4, fontFamily: 'inherit', opacity: 0.7, position: 'relative' }}>
                  Environmental, Social & Governance Data Analytics
                </Typography>

                {/* Animated dashboard preview mockup */}
                <Box sx={{ mb: 5, mt: 4, position: 'relative', width: '100%' }}>
                  <Fade in={true} timeout={1500}>
                    <Box
                      sx={{
                        width: '90%',
                        height: '250px',
                        margin: '0 auto',
                        borderRadius: 3,
                        background: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(0, 0, 0, 0.1)',
                        boxShadow: '0 15px 25px -12px rgba(0, 0, 0, 0.15)',
                        position: 'relative',
                        overflow: 'hidden',
                        p: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: '0 20px 30px -15px rgba(0, 0, 0, 0.2)',
                        }
                      }}
                    >
                      {/* Window control icons */}
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 1.5,
                        pb: 1.5,
                        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                      }}>
                        <Box sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: '#f87171'
                        }} />
                        <Box sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: '#fbbf24'
                        }} />
                        <Box sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: '#4ade80'
                        }} />
                      </Box>

                      {/* Mock code comment */}
                      <Typography sx={{
                        textAlign: 'left',
                        fontSize: '11px',
                        mb: 0.5,
                        fontFamily: 'monospace',
                        color: 'rgba(0, 0, 0, 0.6)'
                      }}>
                        /* ESG Analytics Dashboard */
                      </Typography>

                      {/* Animated content placeholder bars */}
                      <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box sx={{
                          height: 14,
                          width: '90%',
                          backgroundColor: 'rgba(0, 0, 0, 0.1)',
                          borderRadius: 1,
                          animation: 'pulse 3s infinite',
                          '@keyframes pulse': {
                            '0%': { opacity: 0.6 },
                            '50%': { opacity: 1 },
                            '100%': { opacity: 0.6 }
                          }
                        }} />
                        <Box sx={{
                          height: 14,
                          width: '75%',
                          backgroundColor: 'rgba(0, 0, 0, 0.1)',
                          borderRadius: 1,
                          animation: 'pulse 3s infinite',
                          animationDelay: '0.5s'
                        }} />
                        <Box sx={{
                          height: 14,
                          width: '85%',
                          backgroundColor: 'rgba(0, 0, 0, 0.1)',
                          borderRadius: 1,
                          animation: 'pulse 3s infinite',
                          animationDelay: '1s'
                        }} />
                        <Box sx={{
                          height: 14,
                          width: '70%',
                          backgroundColor: 'rgba(0, 0, 0, 0.1)',
                          borderRadius: 1,
                          animation: 'pulse 3s infinite',
                          animationDelay: '1.5s'
                        }} />
                      </Box>

                      {/* Mock chart/visualization placeholders */}
                      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                        <Box sx={{
                          height: 60,
                          width: '48%',
                          backgroundColor: 'rgba(0, 0, 0, 0.1)',
                          borderRadius: 1
                        }} />
                        <Box sx={{
                          height: 60,
                          width: '48%',
                          backgroundColor: 'rgba(0, 0, 0, 0.1)',
                          borderRadius: 1
                        }} />
                      </Box>
                    </Box>
                  </Fade>
                </Box>

                {/* Descriptive text about application purpose */}
                <Typography variant="body2" sx={{ maxWidth: '90%', fontFamily: 'inherit', opacity: 0.8, position: 'relative' }}>
                  Unlock comprehensive analytics and reporting for your company's environmental, social, and governance data.
                </Typography>
              </Box>
            </Grow>
          )}

          {/* Right Section - Login Form */}
          <Grow in={true} timeout={600}>
            <Box
              sx={{
                flex: isMobile ? '1' : '1 1 50%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                p: { xs: 3, sm: 4, md: 5 },
                background: 'white',
                backdropFilter: 'blur(20px)',
                position: 'relative',
              }}
            >
              {/* Mobile Logo (only visible on small screens) */}
              {isMobile && (
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Typography variant="h4" fontWeight="600" sx={{ fontFamily: 'inherit' }}>
                    ESG Panel
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b', fontFamily: 'inherit' }}>
                    Environmental, Social & Governance Portal
                  </Typography>
                </Box>
              )}

              {/* Welcome message */}
              <Typography variant="h5" fontWeight="500" color="text.primary" sx={{ mb: 1, fontFamily: 'inherit' }}>
                Welcome back
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4, fontFamily: 'inherit' }}>
                Sign in to your account to continue
              </Typography>

              {/* Error alert - displayed conditionally when error state is present */}
              {error && (
                <Fade in={true}>
                  <Alert
                    severity="error"
                    sx={{
                      mb: 3,
                      borderRadius: 1,
                    }}
                  >
                    {error}
                  </Alert>
                </Fade>
              )}

              {/* Login form */}
              <Box component="form" onSubmit={handleLogin} noValidate>
                {/* Username field */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" fontWeight="500" sx={{ mb: 1, fontFamily: 'inherit', color: '#000000' }}>
                    Username
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    size="small"
                    variant="outlined"
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person sx={{ color: '#64748b', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1,
                        transition: 'all 0.2s ease-in-out',
                        '&:hover fieldset': {
                          borderColor: '#000000',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#000000',
                          borderWidth: '1px',
                        }
                      }
                    }}
                  />
                </Box>

                {/* Password field with visibility toggle */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" fontWeight="500" sx={{ mb: 1, fontFamily: 'inherit', color: '#000000' }}>
                    Password
                  </Typography>
                  <TextField
                    fullWidth
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    size="small"
                    variant="outlined"
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ color: '#64748b', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={handleTogglePasswordVisibility}
                            edge="end"
                            size="small"
                          >
                            {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1,
                        transition: 'all 0.2s ease-in-out',
                        '&:hover fieldset': {
                          borderColor: '#000000',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#000000',
                          borderWidth: '1px',
                        }
                      }
                    }}
                  />
                </Box>

                {/* Company field */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="subtitle2" fontWeight="500" sx={{ mb: 1, fontFamily: 'inherit', color: '#000000' }}>
                    Company
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Enter your company name(e.g. Soitec SA)"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    size="small"
                    variant="outlined"
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Business sx={{ color: '#64748b', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1,
                        transition: 'all 0.2s ease-in-out',
                        '&:hover fieldset': {
                          borderColor: '#000000',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#000000',
                          borderWidth: '1px',
                        }
                      }
                    }}
                  />
                </Box>

                {/* Action buttons - Sign in and Register */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    type="submit"
                    variant="outlined"
                    fullWidth
                    disabled={loading}
                    sx={{
                      py: 0.8,
                      borderRadius: 1,
                      textTransform: 'none',
                      borderColor: '#000000',
                      color: '#000000',
                      fontWeight: 500,
                      fontSize: '0.95rem',
                      boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.05)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: '#f0f9ff',
                        borderColor: '#3b82f6',
                        color: '#3b82f6',
                        transform: 'translateY(-2px)',
                        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
                      },
                    }}
                  >
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>

                  <Button
                    variant="outlined"
                    onClick={() => navigate('/register')}
                    sx={{
                      py: 0.8,
                      borderRadius: 1,
                      textTransform: 'none',
                      borderColor: '#000000',
                      color: '#000000',
                      fontWeight: 500,
                      fontSize: '0.95rem',
                      boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.05)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: '#f0f9ff',
                        borderColor: '#3b82f6',
                        color: '#3b82f6',
                        transform: 'translateY(-2px)',
                        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
                      },
                    }}
                  >
                    Register
                  </Button>
                </Box>
              </Box>
            </Box>
          </Grow>
        </Box>
      </Container>
    </Box>
  );
}

export default Login;