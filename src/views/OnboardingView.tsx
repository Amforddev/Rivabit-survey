import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, ChevronLeft } from 'lucide-react';
import { View } from '../types';
import logo2Img from '../assets/logo2.png';

type AuthStep = 'welcome' | 'signup' | 'verify-email' | 'verify-phone' | 'success' | 'signin' | 'forgot';

interface OnboardingViewProps {
  setView: (view: View) => void;
}

export function OnboardingView({ setView }: OnboardingViewProps) {
  const [step, setStep] = useState<AuthStep>('welcome');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBack = () => {
    if (step === 'signup' || step === 'signin') setStep('welcome');
    else if (step === 'forgot') setStep('signin');
  };

  const handleMockAuth = (isSignUp: boolean = false) => {
    setLoading(true);
    // Simulate a delay for UI feedback
    setTimeout(() => {
      setLoading(false);
      if (isSignUp) {
        setStep('verify-email');
      } else {
        setView('home');
      }
    }, 1500);
  };

  const handleSocialAuth = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setView('home');
    }, 1500);
  };

  const handleVerifyEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOtp('');
      setStep('success');
    }, 1000);
  };

  const handleVerifyPhone = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('success');
    }, 1000);
  };

  const handleSuccessContinue = () => {
    setView('home');
  };

  const renderStep = () => {
    switch (step) {
      case 'welcome':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="text-center space-y-4">
              <div className="w-32 h-32 mx-auto">
                <img src={logo2Img} alt="berry Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
              </div>
              <h1 className="text-5xl font-bold text-white tracking-tighter">berry</h1>
              <p className="text-gray-400 text-lg">Your opinions, harvested into rewards.</p>
            </div>
            <div className="space-y-4">
              <button onClick={() => setStep('signup')} className="btn-primary group">
                <span>Create Account</span>
                <div className="btn-icon group-hover:translate-x-1 transition-transform">
                  <ArrowRight size={24} />
                </div>
              </button>
              <button onClick={() => setStep('signin')} className="w-full py-4 text-white font-semibold text-lg border-2 border-white/10 rounded-full hover:bg-white/5 transition-colors">
                Sign In
              </button>
            </div>

            <div className="pt-4">
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                <div className="relative flex justify-center text-sm"><span className="px-2 bg-[#0F1115] text-gray-500">Or continue with</span></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={handleSocialAuth}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors disabled:opacity-50"
                >
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" referrerPolicy="no-referrer" />
                  <span className="text-white font-medium">Google</span>
                </button>
                <button 
                  onClick={handleSocialAuth}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors disabled:opacity-50"
                >
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/facebook.svg" alt="Facebook" className="w-5 h-5" referrerPolicy="no-referrer" />
                  <span className="text-white font-medium">Facebook</span>
                </button>
              </div>
            </div>
          </motion.div>
        );

      case 'signup':
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <h2 className="text-4xl font-bold text-white">Sign Up</h2>
              <p className="text-gray-400">Welcome to berry, let's get you started</p>
            </div>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleMockAuth(true); }}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">First Name</label>
                  <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full bg-[#1C1F26] border-none rounded-2xl p-4 text-white focus:ring-2 focus:ring-secondary" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Last Name</label>
                  <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full bg-[#1C1F26] border-none rounded-2xl p-4 text-white focus:ring-2 focus:ring-secondary" required />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Email</label>
                <input type="email" placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-[#1C1F26] border-none rounded-2xl p-4 text-white focus:ring-2 focus:ring-secondary" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Password</label>
                <input type="password" placeholder="At least six characters" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-[#1C1F26] border-none rounded-2xl p-4 text-white focus:ring-2 focus:ring-secondary" required minLength={6} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Referral Code (Optional)</label>
                <input type="text" placeholder="Enter referral code" value={referralCode} onChange={(e) => setReferralCode(e.target.value)} className="w-full bg-[#1C1F26] border-none rounded-2xl p-4 text-white focus:ring-2 focus:ring-secondary uppercase" />
              </div>
              <div className="text-center py-2">
                <p className="text-gray-400">Already have an account? <button type="button" onClick={() => setStep('signin')} className="text-secondary font-semibold">Sign In</button></p>
              </div>
              <button type="submit" disabled={loading} className="btn-primary group disabled:opacity-50">
                <span>{loading ? 'Creating Account...' : 'Continue'}</span>
                <div className="btn-icon group-hover:translate-x-1 transition-transform">
                  <ArrowRight size={24} />
                </div>
              </button>
              <div className="flex items-center gap-3 pt-2">
                <div className="w-6 h-6 border-2 border-secondary rounded-md flex items-center justify-center">
                  <div className="w-3 h-3 bg-secondary rounded-sm" />
                </div>
                <p className="text-sm text-gray-400">I agree to the <span className="text-secondary">terms & Conditions</span></p>
              </div>
            </form>
          </motion.div>
        );

      case 'verify-email':
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <h2 className="text-4xl font-bold text-white">Verify Email</h2>
              <p className="text-gray-400">We've sent a code to {email || 'your email'}</p>
            </div>
            <form className="space-y-4" onSubmit={handleVerifyEmail}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">OTP Code</label>
                <input type="text" placeholder="Enter 6-digit code" value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full bg-[#1C1F26] border-none rounded-2xl p-4 text-white focus:ring-2 focus:ring-secondary text-center tracking-widest text-lg" required minLength={6} maxLength={6} />
              </div>
              <div className="pt-8">
                <button type="submit" disabled={loading || otp.length < 6} className="btn-primary group disabled:opacity-50">
                  <span>{loading ? 'Verifying...' : 'Verify Email'}</span>
                  <div className="btn-icon group-hover:translate-x-1 transition-transform">
                    <ArrowRight size={24} />
                  </div>
                </button>
              </div>
            </form>
          </motion.div>
        );

      case 'success':
        return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="space-y-6 text-center"
          >
            <div className="w-24 h-24 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center text-[#0F1115]">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-4xl font-bold text-white">Account Created!</h2>
              <p className="text-gray-400">Your account has been successfully created and verified.</p>
            </div>
            <div className="pt-8">
              <button onClick={handleSuccessContinue} className="btn-primary group">
                <span>Go to Dashboard</span>
                <div className="btn-icon group-hover:translate-x-1 transition-transform">
                  <ArrowRight size={24} />
                </div>
              </button>
            </div>
          </motion.div>
        );

      case 'signin':
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <h2 className="text-4xl font-bold text-white">Sign In</h2>
              <p className="text-gray-400">Welcome Back!, let's harvest some rewards for you</p>
            </div>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleMockAuth(false); }}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Email</label>
                <input type="email" placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-[#1C1F26] border-none rounded-2xl p-4 text-white focus:ring-2 focus:ring-secondary" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Password</label>
                <input type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-[#1C1F26] border-none rounded-2xl p-4 text-white focus:ring-2 focus:ring-secondary" required />
              </div>
              <div className="text-center">
                <button type="button" onClick={() => setStep('forgot')} className="bg-[#1C1F26] text-secondary px-4 py-2 rounded-xl text-sm font-medium">Forgot Password?</button>
              </div>
              <div className="pt-12 space-y-6">
                <button type="submit" disabled={loading} className="btn-primary group disabled:opacity-50">
                  <span>{loading ? 'Signing in...' : 'Sign in'}</span>
                  <div className="btn-icon group-hover:translate-x-1 transition-transform">
                    <ArrowRight size={24} />
                  </div>
                </button>
                <p className="text-center text-gray-400">Don't have an account? <button type="button" onClick={() => setStep('signup')} className="text-secondary font-semibold">Sign up</button></p>
              </div>
            </form>
          </motion.div>
        );

      case 'forgot':
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <h2 className="text-4xl font-bold text-white">Forgot Password</h2>
              <p className="text-gray-400">Lets help you reset your password</p>
            </div>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setStep('signin'); }}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Email</label>
                <input type="email" placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-[#1C1F26] border-none rounded-2xl p-4 text-white focus:ring-2 focus:ring-secondary" required />
              </div>
              <div className="pt-32">
                <button type="submit" disabled={loading} className="btn-primary group disabled:opacity-50">
                  <span>{loading ? 'Sending...' : 'Confirm'}</span>
                  <div className="btn-icon group-hover:translate-x-1 transition-transform">
                    <ArrowRight size={24} />
                  </div>
                </button>
              </div>
            </form>
          </motion.div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 bg-[#0F1115] flex flex-col p-8 overflow-y-auto scrollbar-hide w-full">
      {step !== 'welcome' && (
        <button 
          onClick={handleBack}
          className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-gray-900 mb-8 shrink-0"
        >
          <ChevronLeft size={24} />
        </button>
      )}
      
      <div className="flex-1 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </div>
    </div>
  );
}
