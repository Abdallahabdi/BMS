import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/api';
import {
  Mail,
  ShieldCheck,
  Lock,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // States for toggling password visibility
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [step, setStep] = useState('request');
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [resendTimer, setResendTimer] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startResendTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setResendTimer(30);

    timerRef.current = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      await API.post('/auth/forgot', {
        email: email.trim().toLowerCase()
      });

      setTimeout(() => {
        setLoading(false);
        setSuccess('Secure OTP code sent successfully');
        setStep('verify');
        startResendTimer();
      }, 1000);

    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to send OTP');
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp.trim()) {
      setError('OTP is required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      await API.post('/auth/verify-otp', { email, otp });

      setTimeout(() => {
        setLoading(false);
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        setResendTimer(0);
        setSuccess('Identity verified successfully');
        setStep('reset');
      }, 1000);

    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Invalid OTP');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      await API.post('/auth/reset-password', {
        email,
        otp,
        password: newPassword
      });

      setTimeout(() => {
        setLoading(false);
        setStep('success');
      }, 1000);

    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Password reset failed');
    }
  };

  return (
    <div className="min-h-screen flex bg-[#F8FAFC] font-sans antialiased overflow-hidden">
      
      {/* LEFT SIDE: Decorative Cinematic Sidebar */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden select-none">
        <div
          className="absolute inset-0 bg-cover bg-center scale-105 transition-all duration-1000"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop')"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-950/85 via-slate-900/70 to-transparent backdrop-blur-[1px]" />
        
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-400/20 rounded-full blur-[120px] pointer-events-none animate-pulse" />
        
        <div className="relative z-10 flex flex-col justify-between p-16 w-full text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-green-600 flex items-center justify-center font-black shadow-lg shadow-emerald-600/30">
              <img src="logo.png" alt="Logo" />
            </div>
            
          </div>
          
          <div>
            <h2 className="text-4xl font-black leading-tight max-w-md tracking-tight">
              Trust, Report, and Recover Your Belongings.
            </h2>
            <p className="mt-4 text-slate-300 max-w-sm text-sm font-medium leading-relaxed">
              The modern lost and found tracking platform tailored for Daarusalaam Park.
            </p>
          </div>
          
          <p className="text-xs font-medium text-slate-400/80">
            &copy; {new Date().getFullYear()} Baafin Platform. All rights reserved.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Elegant Authentication Panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 md:p-16 bg-gradient-to-br from-[#F8FAFC] via-[#F1FDF5] to-[#E6FAF0] relative">
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-400/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="w-full max-w-md transform transition-all duration-300">
          
          <div className="bg-white/80 backdrop-blur-3xl rounded-[2.5rem] p-8 sm:p-10 border border-white shadow-[0_20px_50px_-12px_rgba(15,23,42,0.08)] relative overflow-hidden">
            
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />

            {/* TOP DYNAMIC ILLUSTRATION */}
            <div className="mb-8 text-center relative z-10">
              <div className="w-20 h-20 mx-auto rounded-[2rem] bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-xl shadow-emerald-500/20 mb-6 transition-transform duration-500 hover:scale-105">
                {step === 'request' && <Mail size={32} className="text-white" />}
                {step === 'verify' && <ShieldCheck size={32} className="text-white" />}
                {step === 'reset' && <Lock size={32} className="text-white" />}
                {step === 'success' && <CheckCircle2 size={32} className="text-white scale-110" />}
              </div>

              <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                {step === 'request' && 'Forgot Password'}
                {step === 'verify' && 'Verify Security OTP'}
                {step === 'reset' && 'Create Password'}
                {step === 'success' && 'Account Secured'}
              </h1>

              <p className="text-slate-500 mt-2.5 text-sm font-medium leading-relaxed max-w-xs mx-auto">
                {step === 'request' && 'Enter your verified email to receive a secure OTP code.'}
                {step === 'verify' && `We've dispatched a unique 6-digit code to ${email}`}
                {step === 'reset' && 'Please establish a robust, new password for protection.'}
                {step === 'success' && 'Your credentials have been successfully reset and protected.'}
              </p>
            </div>

            {/* DYNAMIC ALERTS */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-100 text-red-600 px-5 py-3.5 rounded-2xl text-xs font-bold tracking-wide flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 bg-emerald-50 border border-emerald-100 text-emerald-700 px-5 py-3.5 rounded-2xl text-xs font-bold tracking-wide flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                {success}
              </div>
            )}

            {/* FORMS ENGINE */}
            <div className="relative z-10">
              
              {/* STEP 1: REQUEST OTP */}
              {step === 'request' && (
                <form onSubmit={handleSendOTP} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-14 px-5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 font-medium text-sm focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all duration-200"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-14 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-sm tracking-wide shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none transition-all duration-150 flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : 'Send Verification OTP'}
                  </button>
                </form>
              )}

              {/* STEP 2: VERIFY OTP */}
              {step === 'verify' && (
                <form onSubmit={handleVerifyOTP} className="space-y-6">
                  <div className="space-y-3">
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest text-center">
                      Enter Security Code
                    </label>
                    <input
                      type="text"
                      maxLength="6"
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      className="w-full h-16 text-center text-3xl tracking-[0.8rem] pl-[0.8rem] rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-300 font-black focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all duration-200"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-14 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-sm tracking-wide shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none transition-all duration-150 flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : 'Confirm Code'}
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      disabled={resendTimer > 0 || loading}
                      onClick={handleSendOTP}
                      className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-700 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
                    >
                      <RefreshCw size={12} />
                      {resendTimer > 0 ? `Resend Code in ${resendTimer}s` : 'Resend Code'}
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 3: RESET PASSWORD (With Eye Icon Toggle) */}
              {step === 'reset' && (
                <form onSubmit={handleResetPassword} className="space-y-5">
                  
                  {/* New Password Input Wrapper */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        required
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full h-14 pl-5 pr-12 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all duration-200"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password Input Wrapper */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full h-14 pl-5 pr-12 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all duration-200"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-14 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-sm tracking-wide shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none transition-all duration-150 flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : 'Update Credentials'}
                  </button>
                </form>
              )}

              {/* STEP 4: SUCCESS */}
              {step === 'success' && (
                <div className="space-y-6 text-center">
                  <Link
                    to="/login"
                    className="w-full h-14 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-sm tracking-wide flex items-center justify-center shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all active:scale-[0.99]"
                  >
                    Return to Login
                  </Link>
                </div>
              )}

            </div>

            {/* BACK TO LOGIN */}
            {step !== 'success' && (
              <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors duration-200"
                >
                  <ArrowLeft size={14} />
                  Back to Login
                </Link>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}