import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import './RegisterPage.css';

const RegisterPage = () => {
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

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
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
        const response = await authAPI.register(
          formData.name,
          formData.email,
          formData.password,
          formData.confirmPassword
        );

        // Assuming the API returns user data and token
        const userData = {
          email: formData.email,
          name: formData.name,
          ...response.user
        };

        const authToken = response.access_token || response.token;
        const expiresIn = response.expires_in || 3600;

        if (authToken) {
          // Auto-login after successful registration
          login(userData, authToken, expiresIn);
          navigate('/assistant');
        } else {
          // If no token, redirect to login page
          alert('Registration successful! Please login to continue.');
          navigate('/login');
        }
      } catch (error) {
        console.error('Registration error:', error);
        setServerError(error.message || 'Registration failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleGoogleSignUp = () => {
    console.log('Google sign-up clicked');
    alert('Google sign-up will be available soon!');
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-content">
          {/* Left Side - Branding */}
          <div
            className="register-branding"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          >
            <div className="branding-overlay"></div>
            <div className="branding-content">
              <h1>Join AAHAAS</h1>
              <p className="branding-subtitle">Your Gateway to Unforgettable Travel Experiences</p>

              <div className="benefits-list">
                <div className="benefit-item">
                  <i className="fas fa-check-circle"></i>
                  <div>
                    <h3>Best Price Guarantee</h3>
                    <p>Find the best deals on hotels, flights, and experiences</p>
                  </div>
                </div>

                <div className="benefit-item">
                  <i className="fas fa-check-circle"></i>
                  <div>
                    <h3>Exclusive Member Perks</h3>
                    <p>Get access to special discounts and offers</p>
                  </div>
                </div>

                <div className="benefit-item">
                  <i className="fas fa-check-circle"></i>
                  <div>
                    <h3>24/7 Customer Support</h3>
                    <p>We're here to help you anytime, anywhere</p>
                  </div>
                </div>

                <div className="benefit-item">
                  <i className="fas fa-check-circle"></i>
                  <div>
                    <h3>Easy Booking Management</h3>
                    <p>Manage all your bookings in one place</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Registration Form */}
          <div className="register-form-section">
            <div className="register-form-container">
              <h2>Create Your Account</h2>
              <p className="form-subtitle">Start your journey with us today</p>

              {serverError && (
                <div className="server-error-message">
                  <i className="fas fa-exclamation-circle"></i>
                  <div>{serverError}</div>
                </div>
              )}

              {/* Google Sign Up Button */}
              <button
                type="button"
                className="google-signup-btn"
                onClick={handleGoogleSignUp}
              >
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google logo"
                />
                <span>Sign up with Google</span>
              </button>

              <div className="divider">
                <span>OR</span>
              </div>

              {/* Registration Form */}
              <form onSubmit={handleSubmit} className="register-form">
                <div className="form-group">
                  <label htmlFor="name">
                    <i className="fas fa-user"></i>
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className={errors.name ? 'error' : ''}
                    disabled={isLoading}
                  />
                  {errors.name && <span className="error-message">{errors.name}</span>}
                </div>

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
                      placeholder="Create a strong password"
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
                  <div className="password-hint">
                    Must contain at least 8 characters, uppercase, lowercase, and number
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">
                    <i className="fas fa-lock"></i>
                    Confirm Password
                  </label>
                  <div className="password-input-wrapper">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Re-enter your password"
                      className={errors.confirmPassword ? 'error' : ''}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <i className={showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
                    </button>
                  </div>
                  {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                </div>

                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleChange}
                      className={errors.agreeToTerms ? 'error' : ''}
                      disabled={isLoading}
                    />
                    <span>
                      I agree to the{' '}
                      <a href="/terms" target="_blank" rel="noopener noreferrer">
                        Terms & Conditions
                      </a>{' '}
                      and{' '}
                      <a href="/privacy" target="_blank" rel="noopener noreferrer">
                        Privacy Policy
                      </a>
                    </span>
                  </label>
                  {errors.agreeToTerms && <span className="error-message">{errors.agreeToTerms}</span>}
                </div>

                <button type="submit" className="register-btn" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-user-plus"></i>
                      Create Account
                    </>
                  )}
                </button>
              </form>

              <div className="login-link">
                Already have an account?{' '}
                <a href="/login" onClick={(e) => {
                  e.preventDefault();
                  navigate('/login');
                }}>
                  Sign in here
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
