import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const backgroundImages = [
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200',
    'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200',
    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200',
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200',
    'https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=1200',
  ];

  const [backgroundImage] = useState(() => {
    return backgroundImages[Math.floor(Math.random() * backgroundImages.length)];
  });

  const [formData, setFormData] = useState(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    const savedPassword = localStorage.getItem('rememberedPassword');
    return {
      email: savedEmail || '',
      password: savedPassword || '',
      rememberMe: !!(savedEmail && savedPassword)
    };
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    if (serverError) {
      setServerError('');
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      setIsLoading(true);
      setServerError('');

      try {
        const response = await authAPI.login(formData.email, formData.password);

        // Assuming the API returns user data and token
        const userData = {
          email: formData.email,
          name: response.user?.name || formData.email.split('@')[0],
          ...response.user
        };

        const authToken = response.access_token || response.token;
        const expiresIn = response.expires_in || 3600;

        console.log('🎉 ═══════════════════════════════════════════════════');
        console.log('🎉 [LOGIN SUCCESS] Session ID received:', authToken);
        console.log('🎉 [LOGIN SUCCESS] Token expires in:', expiresIn, 'seconds');
        console.log('🎉 ═══════════════════════════════════════════════════');

        if (authToken) {
          // Handle Remember Me
          if (formData.rememberMe) {
            localStorage.setItem('rememberedEmail', formData.email);
            localStorage.setItem('rememberedPassword', formData.password);
          } else {
            localStorage.removeItem('rememberedEmail');
            localStorage.removeItem('rememberedPassword');
          }

          login(userData, authToken, expiresIn);
          navigate('/assistant');
        } else {
          throw new Error('No authentication token received');
        }
      } catch (error) {
        console.error('Login error:', error);
        setServerError(error.message || 'Login failed. Please check your credentials and try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-content">
          {/* Left Side - Branding */}
          <div
            className="login-branding"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          >
            <div className="branding-overlay"></div>
            <div className="branding-content">
              <h1>Welcome Back</h1>
              <p className="branding-subtitle">Continue Your Journey with AAHAAS</p>

              <div className="benefits-list">
                <div className="benefit-item">
                  <i className="fas fa-plane-departure"></i>
                  <div>
                    <h3>Quick Access</h3>
                    <p>Get instant quotes and travel recommendations</p>
                  </div>
                </div>

                <div className="benefit-item">
                  <i className="fas fa-map-marked-alt"></i>
                  <div>
                    <h3>Your Itineraries</h3>
                    <p>View and manage all your travel plans</p>
                  </div>
                </div>

                <div className="benefit-item">
                  <i className="fas fa-comments"></i>
                  <div>
                    <h3>AI Assistant</h3>
                    <p>Chat with our intelligent travel assistant</p>
                  </div>
                </div>

                <div className="benefit-item">
                  <i className="fas fa-shield-alt"></i>
                  <div>
                    <h3>Secure & Reliable</h3>
                    <p>Your data is protected with enterprise-grade security</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="login-form-section">
            <div className="login-form-container">
              <h2>Sign In</h2>
              <p className="form-subtitle">Enter your credentials to access your account</p>

              {serverError && (
                <div className="server-error-message">
                  <i className="fas fa-exclamation-circle"></i>
                  <div>{serverError}</div>
                </div>
              )}


              {/* Login Form */}
              <form onSubmit={handleSubmit} className="login-form">
                <div className="form-group">
                  <label htmlFor="email">
                    <i className="fas fa-envelope"></i>
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className={errors.email ? 'error' : ''}
                    disabled={isLoading}
                  />
                  {errors.email && <span className="error-message">{errors.email}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="password">
                    <i className="fas fa-lock"></i>
                    Password
                  </label>
                  <div className="password-input-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      className={errors.password ? 'error' : ''}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <i className={showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
                    </button>
                  </div>
                  {errors.password && <span className="error-message">{errors.password}</span>}
                </div>

                <div className="form-options">
                  <label className="remember-me">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleChange}
                    />
                    <span>Remember me</span>
                  </label>
                  <a href="/forgot-password" className="forgot-password">
                    Forgot Password?
                  </a>
                </div>

                <button type="submit" className="login-btn" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Signing In...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-sign-in-alt"></i>
                      Sign In
                    </>
                  )}
                </button>
              </form>

              <div className="register-link">
                Don't have an account?{' '}
                <a href="/register" onClick={(e) => {
                  e.preventDefault();
                  navigate('/register');
                }}>
                  Create one now
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
