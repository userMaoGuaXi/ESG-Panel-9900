/**
 * Register.jsx
 * 
 * User registration component for the ESG Panel application.
 * Provides a comprehensive registration form with real-time password strength validation,
 * form validation, and responsive design for different screen sizes.
 * 
 * @module Register
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
  Slide,
  LinearProgress,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { Visibility, VisibilityOff, Person, Lock, ArrowBack, Email, Business } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Register() {
  // State management for form fields and UI control
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
   * Calculates password strength score based on various security criteria
   * 
   * @param {string} pass - The password to evaluate
   * @returns {number} A score from 0-100 indicating password strength
   */
  const calculatePasswordStrength = (pass) => {
    if (!pass) return 0;

    let strength = 0;

    // Length check
    if (pass.length >= 8) strength += 25;
    else if (pass.length >= 6) strength += 15;
    else if (pass.length > 0) strength += 5;

    // Character variety checks
    if (/[A-Z]/.test(pass)) strength += 25; // Uppercase
    if (/[a-z]/.test(pass)) strength += 15; // Lowercase
    if (/[0-9]/.test(pass)) strength += 20; // Numbers
    if (/[^A-Za-z0-9]/.test(pass)) strength += 15; // Special chars

    return Math.min(strength, 100);
  };

  /**
   * Determines the appropriate color for password strength visualization
   * 
   * @param {number} strength - Password strength score (0-100)
   * @returns {string} Hex color code representing strength level
   */
  const getPasswordStrengthColor = (strength) => {
    if (strength < 30) return '#ef4444'; // Red
    if (strength < 60) return '#f59e0b'; // Orange/Amber
    return '#10b981'; // Green
  };

  /**
   * Returns a human-readable label for password strength level
   * 
   * @param {number} strength - Password strength score (0-100)
   * @returns {string} Description of password strength
   */
  const getPasswordStrengthLabel = (strength) => {
    if (strength < 30) return 'Weak';
    if (strength < 60) return 'Moderate';
    return 'Strong';
  };

  // Calculate current password strength metrics
  const passwordStrength = calculatePasswordStrength(password);
  const strengthColor = getPasswordStrengthColor(passwordStrength);
  const strengthLabel = getPasswordStrengthLabel(passwordStrength);

  /**
   * Validates form inputs before submission
   * Checks for username length, email format, password length, and password matching
   * 
   * @returns {boolean} True if all validations pass, false otherwise
   */
  const validateForm = () => {
    if (!username || username.length < 3) {
      setError("Username must be at least 3 characters");
      return false;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }

    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    return true;
  };

  /**
   * Handles form submission and account creation process
   * Validates form, manages loading state, and processes API response
   * 
   * @param {Event} e - Form submission event
   */
  const handleRegister = async (e) => {
    e.preventDefault();

    // Run form validation before proceeding
    if (!validateForm()) {
      return;
    }

    // Set loading state and clear previous messages
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Attempt registration via API
      const response = await axios.post('http://127.0.0.1:5001/auth/register', {
        username,
        password
      });

      // Display success message
      setSuccess(response.data.message || 'Registration successful! You can now login.');

      // Clear form fields
      setUsername('');
      setPassword('');
      setConfirmPassword('');
      setEmail('');
      setCompanyName('');

      // Auto redirect after animation
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (error) {
      // Handle registration errors
      if (error.response) {
        setError(error.response.data.error || 'Registration failed');
      } else {
        setError('Registration failed. Please check your connection and try again.');
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
      {/* Background Decorative Elements - animated gradient bubbles */}
      <Box
        sx={{
          position: 'absolute',
          top: '5%',
          left: '-5%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(241, 245, 249, 0.8) 0%, rgba(241, 245, 249, 0) 70%)',
          filter: 'blur(40px)',
          zIndex: 0,
          animation: 'float 15s ease-in-out infinite',
          '@keyframes float': {
            '0%': { transform: 'translateY(0px) translateX(0px)' },
            '33%': { transform: 'translateY(-20px) translateX(10px)' },
            '66%': { transform: 'translateY(10px) translateX(-10px)' },
            '100%': { transform: 'translateY(0px) translateX(0px)' },
          }
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '10%',
          right: '-5%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(226, 232, 240, 0.7) 0%, rgba(226, 232, 240, 0) 60%)',
          filter: 'blur(40px)',
          zIndex: 0,
          animation: 'float 20s ease-in-out infinite',
          animationDelay: '5s',
          animationDirection: 'reverse',
        }}
      />

      {/* Main Content Container */}
      <Container maxWidth="md" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
        <Grow in={true} timeout={800}>
          <Box
            sx={{
              width: '100%',
              borderRadius: 3,
              overflow: 'hidden',
              boxShadow: '0 10px 15px -5px rgba(0, 0, 0, 0.08)',
              backgroundColor: 'white',
              p: { xs: 3, sm: 4, md: 5 },
            }}
          >
            {/* Header section with title and back navigation */}
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 4
            }}>
              <Typography variant="h5" fontWeight="500" color="text.primary" sx={{ fontFamily: 'inherit' }}>
                Create Account
              </Typography>

              <Button
                variant="text"
                size="small"
                startIcon={<ArrowBack />}
                onClick={() => navigate('/login')}
                sx={{
                  textTransform: 'none',
                  color: '#000000',
                  fontWeight: 500,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'transparent',
                    color: '#3b82f6',
                    transform: 'translateX(-3px)',
                  },
                }}
              >
                Back to Login
              </Button>
            </Box>

            {/* Error message alert - displayed conditionally */}
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

            {/* Success message alert - displayed conditionally */}
            {success && (
              <Fade in={true}>
                <Alert
                  severity="success"
                  sx={{
                    mb: 3,
                    borderRadius: 1,
                  }}
                >
                  {success}
                </Alert>
              </Fade>
            )}

            {/* Registration form */}
            <Box component="form" onSubmit={handleRegister} noValidate>
              {/* Username and Email row - responsive layout switches to column on mobile */}
              <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2, mb: 3 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" fontWeight="500" sx={{ mb: 1, fontFamily: 'inherit', color: '#000000' }}>
                    Username
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Choose a username"
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

                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" fontWeight="500" sx={{ mb: 1, fontFamily: 'inherit', color: '#000000' }}>
                    Email Address (Optional)
                  </Typography>
                  <TextField
                    fullWidth
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    size="small"
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email sx={{ color: '#64748b', fontSize: 20 }} />
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
              </Box>

              {/* Company Name field */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" fontWeight="500" sx={{ mb: 1, fontFamily: 'inherit', color: '#000000' }}>
                  Company Name (Optional)
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Enter your company name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  size="small"
                  variant="outlined"
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

              {/* Password and Confirm Password row - responsive layout */}
              <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2, mb: 4 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" fontWeight="500" sx={{ mb: 1, fontFamily: 'inherit', color: '#000000' }}>
                    Password
                  </Typography>
                  <TextField
                    fullWidth
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password"
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
                  {/* Password strength indicator - appears when password has content */}
                  {password && (
                    <Fade in={true}>
                      <Box sx={{ mt: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Typography variant="caption" sx={{ color: strengthColor, fontFamily: 'inherit' }}>
                            {strengthLabel} Password
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748b', fontFamily: 'inherit' }}>
                            {passwordStrength}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={passwordStrength}
                          sx={{
                            height: 4,
                            borderRadius: 1,
                            mt: 0.5,
                            backgroundColor: 'rgba(0,0,0,0.05)',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: strengthColor,
                              transition: 'transform 0.8s ease-in-out',
                            }
                          }}
                        />
                      </Box>
                    </Fade>
                  )}
                </Box>

                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" fontWeight="500" sx={{ mb: 1, fontFamily: 'inherit', color: '#000000' }}>
                    Confirm Password
                  </Typography>
                  <TextField
                    fullWidth
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    size="small"
                    variant="outlined"
                    required
                    error={confirmPassword !== '' && password !== confirmPassword}
                    helperText={confirmPassword !== '' && password !== confirmPassword ? "Passwords do not match" : ""}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ color: '#64748b', fontSize: 20 }} />
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
              </Box>

              {/* Submit button with animation */}
              <Slide direction="up" in={true} mountOnEnter unmountOnExit timeout={800}>
                <Button
                  type="submit"
                  variant="outlined"
                  fullWidth
                  disabled={loading || success}
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
                  {loading ? 'Creating account...' : 'Create Account'}
                </Button>
              </Slide>

              {/* Password requirements section - appears when password field has content */}
              {password && (
                <Fade in={true}>
                  <Box
                    sx={{
                      mt: 3,
                      p: 2,
                      borderRadius: 1,
                      backgroundColor: 'rgba(0,0,0,0.02)',
                      border: '1px solid rgba(0,0,0,0.05)'
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ mb: 1.5, fontFamily: 'inherit' }}>
                      Password requirements:
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {/* Requirement indicators that change color based on password content */}
                      <Typography
                        variant="caption"
                        sx={{
                          color: password.length >= 6 ? '#10b981' : '#64748b',
                          display: 'flex',
                          alignItems: 'center',
                          fontFamily: 'inherit',
                          '&:before': {
                            content: '""',
                            display: 'inline-block',
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: password.length >= 6 ? '#10b981' : '#64748b',
                            marginRight: '8px',
                          }
                        }}
                      >
                        At least 6 characters
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: /[A-Z]/.test(password) ? '#10b981' : '#64748b',
                          display: 'flex',
                          alignItems: 'center',
                          fontFamily: 'inherit',
                          '&:before': {
                            content: '""',
                            display: 'inline-block',
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: /[A-Z]/.test(password) ? '#10b981' : '#64748b',
                            marginRight: '8px',
                          }
                        }}
                      >
                        At least one uppercase letter
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: /[0-9]/.test(password) ? '#10b981' : '#64748b',
                          display: 'flex',
                          alignItems: 'center',
                          fontFamily: 'inherit',
                          '&:before': {
                            content: '""',
                            display: 'inline-block',
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: /[0-9]/.test(password) ? '#10b981' : '#64748b',
                            marginRight: '8px',
                          }
                        }}
                      >
                        At least one number
                      </Typography>
                    </Box>
                  </Box>
                </Fade>
              )}
            </Box>
          </Box>
        </Grow>
      </Container>
    </Box>
  );
}

export default Register;