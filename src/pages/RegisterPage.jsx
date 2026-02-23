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
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

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

              {/*
                ── GOOGLE SIGN-UP ── DISABLED ──
                Google OAuth sign-up has been removed. To re-enable:
                  1. Restore the handleGoogleSignUp() handler function.
                  2. Uncomment the button and divider below.

                <button type="button" className="google-signup-btn" onClick={handleGoogleSignUp}>
                  <img src="https://www.google.com/favicon.ico" alt="Google" />
                  Continue with Google
                </button>

                <div className="divider">
                  <span>or</span>
                </div>
              */}

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
                      <button type="button" className="link-button" onClick={() => setShowTermsModal(true)}>
                        Terms & Conditions
                      </button>{' '}
                      and{' '}
                      <button type="button" className="link-button" onClick={() => setShowPrivacyModal(true)}>
                        Privacy Policy
                      </button>
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

      {/* Terms & Conditions Modal */}
      {showTermsModal && (
        <div className="modal-overlay" onClick={() => setShowTermsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Terms and Conditions</h2>
              <button className="modal-close" onClick={() => setShowTermsModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <h3>Acceptance of Terms</h3>
              <p>
                By accessing and using Aahaas Travel Services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>

              <h3>Use License</h3>
              <p>
                Permission is granted to temporarily access the materials (information or software) on Aahaas Travel's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul>
                <li>modify or copy the materials;</li>
                <li>use the materials for any commercial purpose, or for any public display (commercial or non-commercial);</li>
                <li>attempt to decompile or reverse engineer any software contained on Aahaas Travel's website;</li>
                <li>remove any copyright or other proprietary notations from the materials; or</li>
                <li>transfer the materials to another person or "mirror" the materials on any other server.</li>
              </ul>

              <h3>Disclaimer</h3>
              <p>
                The materials on Aahaas Travel's website are provided on an 'as is' basis. Aahaas Travel makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
              </p>

              <h3>Limitations</h3>
              <p>
                In no event shall Aahaas Travel or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Aahaas Travel's website, even if Aahaas Travel or an authorized representative has been notified orally or in writing of the possibility of such damage.
              </p>

              <h3>Accuracy of Materials</h3>
              <p>
                The materials appearing on Aahaas Travel's website could include technical, typographical, or photographic errors. Aahaas Travel does not warrant that any of the materials on its website are accurate, complete or current. Aahaas Travel may make changes to the materials contained on its website at any time without notice.
              </p>

              <h3>Links</h3>
              <p>
                Aahaas Travel has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Aahaas Travel of the site. Use of any such linked website is at the user's own risk.
              </p>

              <h3>Modifications</h3>
              <p>
                Aahaas Travel may revise these terms of service for its website at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of service.
              </p>

              <h3>Governing Law</h3>
              <p>
                These terms and conditions are governed by and construed in accordance with the laws and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
              </p>
            </div>
            <div className="modal-footer">
              <button className="modal-btn" onClick={() => setShowTermsModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {showPrivacyModal && (
        <div className="modal-overlay" onClick={() => setShowPrivacyModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Privacy Policy</h2>
              <button className="modal-close" onClick={() => setShowPrivacyModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <h3>Introduction</h3>
              <p>
                At Aahaas Travel Services, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our services.
              </p>

              <h3>Information We Collect</h3>
              <p>
                We collect information that you provide directly to us, including:
              </p>
              <ul>
                <li>Personal identification information (name, email address, phone number, etc.)</li>
                <li>Travel preferences and booking history</li>
                <li>Payment and billing information</li>
                <li>Communication preferences</li>
                <li>Any other information you choose to provide</li>
              </ul>

              <h3>How We Use Your Information</h3>
              <p>
                We use the information we collect to:
              </p>
              <ul>
                <li>Process your travel bookings and reservations</li>
                <li>Provide customer service and support</li>
                <li>Send you confirmations, updates, and other service-related communications</li>
                <li>Personalize your experience and improve our services</li>
                <li>Process payments and prevent fraudulent transactions</li>
                <li>Comply with legal obligations and enforce our terms</li>
                <li>Send marketing communications (with your consent)</li>
              </ul>

              <h3>Information Sharing and Disclosure</h3>
              <p>
                We may share your information with:
              </p>
              <ul>
                <li>Travel service providers (airlines, hotels, car rental companies, etc.) to complete your bookings</li>
                <li>Payment processors to handle transactions securely</li>
                <li>Service providers who assist us in operating our business</li>
                <li>Legal authorities when required by law or to protect our rights</li>
              </ul>
              <p>
                We do not sell your personal information to third parties for their marketing purposes.
              </p>

              <h3>Data Security</h3>
              <p>
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure.
              </p>

              <h3>Your Rights and Choices</h3>
              <p>
                You have the right to:
              </p>
              <ul>
                <li>Access and receive a copy of your personal information</li>
                <li>Correct inaccurate or incomplete information</li>
                <li>Request deletion of your personal information</li>
                <li>Object to or restrict certain processing of your information</li>
                <li>Opt-out of marketing communications at any time</li>
                <li>Withdraw consent where processing is based on consent</li>
              </ul>

              <h3>Cookies and Tracking Technologies</h3>
              <p>
                We use cookies and similar tracking technologies to enhance your experience, analyze usage patterns, and personalize content. You can control cookie settings through your browser preferences.
              </p>

              <h3>Data Retention</h3>
              <p>
                We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.
              </p>

              <h3>Children's Privacy</h3>
              <p>
                Our services are not directed to children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware of such collection, we will take steps to delete the information.
              </p>

              <h3>International Data Transfers</h3>
              <p>
                Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place to protect your information in accordance with this Privacy Policy.
              </p>

              <h3>Changes to This Privacy Policy</h3>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on our website and updating the "Last Updated" date.
              </p>

              <h3>Contact Us</h3>
              <p>
                If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us at:
              </p>
              <p>
                <strong>Aahaas Travel Services</strong><br />
                Email: privacy@aahaas.com<br />
                Phone: +1 (555) 123-4567
              </p>

              <p style={{ marginTop: '20px', fontSize: '0.9rem', color: '#64748b' }}>
                <strong>Last Updated:</strong> January 6, 2026
              </p>
            </div>
            <div className="modal-footer">
              <button className="modal-btn" onClick={() => setShowPrivacyModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterPage;
