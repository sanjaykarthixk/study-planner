import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser, verifyOTP as apiVerifyOTP } from '../api';
import toast from 'react-hot-toast';

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep]   = useState(1); // 1 = form, 2 = otp
  const [email, setEmail] = useState('');
  const [otp, setOtp]     = useState('');
  const [form, setForm]   = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await registerUser(form);
      setEmail(form.email);
      setStep(2);
      toast.success('OTP sent to your email!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await apiVerifyOTP({ email, otp });
      localStorage.setItem('user', JSON.stringify(data));
      toast.success('Email verified! Welcome to StudyOS 🎉');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px' }}>

        {step === 1 ? (
          <>
            <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '6px' }}>Create account</h1>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>Start your study journey</p>
            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label className="label">Name</label>
                <input className="input" placeholder="Your name"
                  value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="label">Email</label>
                <input className="input" type="email" placeholder="you@example.com"
                  value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="label">Password</label>
                <input className="input" type="password" placeholder="Min 6 characters"
                  value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
              </div>
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}
                type="submit" disabled={loading}>
                {loading ? 'Sending OTP...' : 'Create Account'}
              </button>
            </form>
            <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>
              Have an account? <Link to="/login" style={{ color: 'var(--accent)' }}>Sign in</Link>
            </p>
          </>
        ) : (
          <>
            <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '6px' }}>Verify email</h1>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
              We sent a 6-digit OTP to <span style={{ color: 'var(--accent)' }}>{email}</span>
            </p>
            <form onSubmit={handleVerify}>
              <div className="form-group">
                <label className="label">Enter OTP</label>
                <input className="input" placeholder="000000" maxLength={6}
                  value={otp} onChange={e => setOtp(e.target.value)}
                  style={{ fontSize: '24px', letterSpacing: '8px', textAlign: 'center', fontFamily: 'var(--font-mono)' }}
                  required />
              </div>
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}
                type="submit" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify & Continue'}
              </button>
            </form>
            <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>
              Wrong email? <span style={{ color: 'var(--accent)', cursor: 'pointer' }} onClick={() => setStep(1)}>Go back</span>
            </p>
          </>
        )}
      </div>
    </div>
  );
}