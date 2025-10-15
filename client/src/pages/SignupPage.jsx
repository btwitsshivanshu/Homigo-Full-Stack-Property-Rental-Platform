import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../layouts/Layout';
import './Form.css';
import { saveToken } from '../utils/auth';

const SignupPage = ({ onLogin }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', email: '', password: '', role: 'customer' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [otpPhase, setOtpPhase] = useState(false);
  const [otp, setOtp] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  React.useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      if (!otpPhase) {
        const response = await fetch('/user/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const result = await response.json();
        if (response.ok && result.step === 'verify-otp') {
          setOtpPhase(true);
        } else if (response.ok && result.token) {
          saveToken(result.token);
          onLogin(result.user);
          navigate('/listings');
        } else {
          setError(result.message || 'An error occurred');
        }
      } else {
        const response = await fetch('/user/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ usernameOrEmail: formData.email || formData.username, otp }),
        });
        const result = await response.json();
        if (response.ok && result.token) {
          saveToken(result.token);
          onLogin(result.user);
          navigate('/listings');
        } else {
          setError(result.message || 'OTP verification failed');
        }
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Layout>
      <div className="form-container">
        <h1>Sign Up</h1>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit} noValidate className="needs-validation">
          <div className="mb-3">
            <label className="form-label" htmlFor="username">Username</label>
            <input type="text" className="form-control" id="username" name="username" value={formData.username} onChange={handleChange} required />
          </div>
          {!otpPhase && (
            <>
              <div className="mb-3">
                <label className="form-label" htmlFor="email">Email</label>
                <input type="email" className="form-control" id="email" name="email" value={formData.email} onChange={handleChange} required />
              </div>
              <div className="mb-3">
                <label className="form-label" htmlFor="password">Password</label>
                <input type={showPassword ? 'text' : 'password'} autoComplete="new-password" className="form-control" id="password" name="password" value={formData.password} onChange={handleChange} required />
                <div className="form-text">
                  <input type="checkbox" onChange={togglePassword} /> Show password
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Account Type</label>
                <select className="form-select" name="role" value={formData.role} onChange={handleChange}>
                  <option value="customer">Customer (book stays)</option>
                  <option value="owner">Owner (list properties)</option>
                </select>
              </div>
            </>
          )}
          {otpPhase && (
            <div className="mb-3">
              <label className="form-label" htmlFor="otp">Enter OTP</label>
              <input type="text" className="form-control" id="otp" name="otp" value={otp} onChange={(e)=>setOtp(e.target.value)} required />
              <div className="form-text">We sent a 6-digit code to your email. It expires in 10 minutes.</div>
              <div className="mt-2 d-flex gap-2">
                <button type="button" className="btn btn-outline-secondary btn-sm" disabled={cooldown>0 || isResending}
                  onClick={async()=>{
                    setIsResending(true);
                    setError('');
                    try {
                      const identifier = formData.email || formData.username;
                      const resp = await fetch('/user/resend-otp', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ usernameOrEmail: identifier })});
                      const d = await resp.json();
                      if (!resp.ok) setError(d.message || 'Failed to resend');
                      else setCooldown(60);
                    } catch (error) {
                      setError('Failed to resend OTP. Please try again.');
                    } finally {
                      setIsResending(false);
                    }
                  }}>
                  {isResending ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                      Sending...
                    </>
                  ) : cooldown>0 ? `Resend in ${cooldown}s` : 'Resend OTP'}
                </button>
              </div>
            </div>
          )}
          <button type="submit" className="btn btn-primary w-100" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                {otpPhase ? 'Verifying OTP...' : 'Creating Account...'}
              </>
            ) : (
              otpPhase ? 'Verify OTP' : 'Sign Up'
            )}
          </button>
          <p className="mt-3">Already have an account? <Link to="/user/login">Login</Link></p>
        </form>
      </div>
    </Layout>
  );
};

export default SignupPage;
