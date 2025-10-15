import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../layouts/Layout';
import './Form.css';
import { saveToken } from '../utils/auth';

const LoginPage = ({ onLogin }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ usernameOrEmail: '', password: '' });
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
    setIsLoading(true);
    
    try {
      if (!otpPhase) {
        const response = await fetch('/user/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const data = await response.json();
        if (response.ok && data.step === 'verify-otp') {
          setOtpPhase(true);
        } else if (response.ok && data.token) {
          // Fallback: if server returned token (no OTP), finish login
          saveToken(data.token);
          onLogin(data.user);
          navigate('/listings');
        } else {
          alert(data.message || 'Login failed');
        }
      } else {
        const response = await fetch('/user/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ usernameOrEmail: formData.usernameOrEmail, otp }),
        });
        const data = await response.json();
        if (response.ok && data.token) {
          saveToken(data.token);
          onLogin(data.user);
          navigate('/listings');
        } else {
          alert(data.message || 'OTP verification failed');
        }
      }
    } catch (error) {
      alert('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="form-container">
        <h1>Login</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="usernameOrEmail" className="form-label">Username or Email</label>
            <input type="text" className="form-control" id="usernameOrEmail" name="usernameOrEmail" value={formData.usernameOrEmail} onChange={handleChange} required />
          </div>
          {!otpPhase && (
            <div className="mb-3">
              <label htmlFor="password" className="form-label">Password</label>
              <input type="password" autoComplete="current-password" className="form-control" id="password" name="password" value={formData.password} onChange={handleChange} required />
            </div>
          )}
          {otpPhase && (
            <div className="mb-3">
              <label htmlFor="otp" className="form-label">Enter OTP</label>
              <input type="text" className="form-control" id="otp" name="otp" value={otp} onChange={(e)=>setOtp(e.target.value)} required />
              <div className="form-text">We sent a 6-digit code to your email.</div>
              <div className="mt-2 d-flex gap-2">
                <button type="button" className="btn btn-outline-secondary btn-sm" disabled={cooldown>0 || isResending}
                  onClick={async()=>{
                    setIsResending(true);
                    try {
                      const resp = await fetch('/user/resend-otp', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ usernameOrEmail: formData.usernameOrEmail })});
                      const d = await resp.json();
                      if (!resp.ok) alert(d.message || 'Failed to resend');
                      else setCooldown(60);
                    } catch (error) {
                      alert('Failed to resend OTP. Please try again.');
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
                {otpPhase ? 'Verifying OTP...' : 'Logging in...'}
              </>
            ) : (
              otpPhase ? 'Verify OTP' : 'Login'
            )}
          </button>
          <p className="mt-3">Don't have an account? <Link to="/user/signup">Sign Up</Link></p>
        </form>
      </div>
    </Layout>
  );
};

export default LoginPage;
