import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, CheckCircle2, Coins, Clock, ClipboardList, ShieldAlert, UserPlus, Lock, X } from 'lucide-react';
import * as Icons from 'lucide-react';
import { Survey, RewardCategory, UserProfile } from '../types';
import { MOCK_SURVEYS, REWARD_CATEGORIES } from '../data';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface HomeViewProps {
  userProfile: UserProfile;
  completedSurveys: string[];
  startSurvey: (s: Survey) => void;
  setView: (v: any) => void;
}

const HomeView: React.FC<HomeViewProps> = ({ userProfile, completedSurveys, startSurvey, setView }) => {
  const availableSurveys = MOCK_SURVEYS.filter(s => !completedSurveys.includes(s.id));
  const [showKycModal, setShowKycModal] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [kycLoading, setKycLoading] = useState(false);
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(userProfile.phoneNumber || '');
  const [otp, setOtp] = useState('');
  const [phoneStep, setPhoneStep] = useState<'input' | 'verify'>('input');
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);

  const handleKycVerification = () => {
    setKycLoading(true);
    // Mock 3rd party widget flow
    setTimeout(async () => {
      try {
        await updateDoc(doc(db, 'users', userProfile.uid), {
          kycVerified: true
        });
      } catch (e) {
        console.error("Error verifying KYC", e);
      }
      setKycLoading(false);
      setShowKycModal(false);
    }, 2000);
  };

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneLoading(true);
    setTimeout(() => {
      setPhoneLoading(false);
      setPhoneStep('verify');
    }, 1000);
  };

  const handlePhoneVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneLoading(true);
    setTimeout(async () => {
      try {
        await updateDoc(doc(db, 'users', userProfile.uid), {
          phoneNumber: phoneNumber,
          phoneVerified: true
        });
      } catch (e) {
        console.error("Error verifying phone", e);
      }
      setPhoneLoading(false);
      setShowPhoneModal(false);
      setPhoneStep('input');
      setOtp('');
    }, 1000);
  };

  const setupSteps = [
    {
      id: 'profile',
      isCompleted: userProfile.profileCompleted,
      action: () => setView('profile-builder'),
      icon: <UserPlus size={20} />,
      iconClass: 'bg-blue-100 text-blue-600',
      title: 'Complete your profile',
      subtitle: 'Earn 500 berries & unlock surveys'
    },
    {
      id: 'phone',
      isCompleted: (userProfile as any).phoneVerified,
      action: () => setShowPhoneModal(true),
      icon: <Icons.Phone size={20} />,
      iconClass: 'bg-orange-100 text-orange-600',
      title: 'Verify phone number',
      subtitle: 'Secure your account'
    },
    {
      id: 'kyc',
      isCompleted: userProfile.kycVerified,
      action: () => setShowKycModal(true),
      icon: <ShieldAlert size={20} />,
      iconClass: 'bg-red-100 text-red-600',
      title: 'Verify your account',
      subtitle: 'Required for withdrawals'
    }
  ];

  const completedStepsCount = setupSteps.filter(s => s.isCompleted).length;
  const nextIncompleteStep = setupSteps.find(s => !s.isCompleted);

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="p-6 space-y-8"
    >
      {/* Account Setup Steps */}
      {nextIncompleteStep && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-gray-900 text-sm">Account Setup</h3>
            <span className="text-xs font-semibold text-primary">{completedStepsCount}/3 Completed</span>
          </div>
          <div className="h-1.5 w-full bg-gray-100 rounded-full mb-4 overflow-hidden">
            <motion.div 
              className="h-full bg-primary" 
              initial={{ width: 0 }}
              animate={{ width: `${(completedStepsCount / 3) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <button 
            onClick={nextIncompleteStep.action}
            className="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl flex items-center justify-between group hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${nextIncompleteStep.iconClass}`}>
                {nextIncompleteStep.icon}
              </div>
              <div className="text-left">
                <h4 className="font-bold text-gray-900 text-sm">{nextIncompleteStep.title}</h4>
                <p className="text-xs text-gray-500">{nextIncompleteStep.subtitle}</p>
              </div>
            </div>
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-400 group-hover:text-primary transition-colors shadow-sm">
              <Icons.ArrowRight size={16} />
            </div>
          </button>
        </div>
      )}

      {/* Hero Card */}
      <div className="bg-gradient-to-br from-primary via-accent to-primary animate-gradient bg-size-200 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
        <h2 className="font-medium mb-1 text-gray-200">Welcome back, {userProfile.displayName?.split(' ')[0] || 'User'}!</h2>
        <div className="text-2xl font-semibold mb-4 flex items-center gap-2 leading-tight">
          <Zap className="text-white fill-white opacity-80" size={24} />
          Ready to earn?
        </div>
        <button 
          onClick={() => setView('surveys')}
          className="bg-gradient-to-r from-accent via-secondary to-accent animate-gradient bg-size-200 text-white px-6 py-3 rounded-full font-semibold text-sm shadow-sm hover:opacity-90 transition-all flex items-center gap-2 group"
        >
          <span>Answer Now</span>
          <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-primary group-hover:translate-x-0.5 transition-transform">
            <Icons.ArrowRight size={14} />
          </div>
        </button>
      </div>

      {/* Featured Surveys */}
      <section>
        <div className="flex justify-between items-end mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Available Surveys</h3>
        </div>
        <div className="space-y-3">
          {!userProfile.profileCompleted ? (
            <div className="bg-white p-6 rounded-2xl text-center shadow-sm border border-gray-100 flex flex-col items-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-3">
                <Lock size={24} />
              </div>
              <h4 className="font-bold text-gray-900 mb-1">Surveys Locked</h4>
              <p className="text-sm text-gray-500 mb-4">Complete your profile to unlock and start earning rewards.</p>
              <button 
                onClick={() => setView('profile-builder')}
                className="bg-primary text-white px-6 py-2.5 rounded-full font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                Complete Profile
              </button>
            </div>
          ) : availableSurveys.length > 0 ? (
            availableSurveys.slice(0, 2).map(survey => (
              <SurveyCard key={survey.id} survey={survey} onClick={() => setSelectedSurvey(survey)} />
            ))
          ) : (
            <div className="bg-white p-6 rounded-2xl text-center shadow-sm border border-gray-100">
              <CheckCircle2 className="mx-auto text-primary mb-2" size={40} />
              <p className="text-gray-900 font-medium text-lg">You're all caught up!</p>
            </div>
          )}
        </div>
      </section>

      {/* Quick Rewards */}
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Rewards</h3>
        <div className="grid grid-cols-2 gap-3">
          {REWARD_CATEGORIES.slice(0, 4).map(cat => {
            // Dynamically get icon component
            const Icon = (Icons as any)[cat.iconName];
            return (
              <div 
                key={cat.id} 
                onClick={() => setView('rewards')}
                className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div className={`w-12 h-12 rounded-full bg-gray-100 text-primary flex items-center justify-center`}>
                  {Icon && <Icon size={24} />}
                </div>
                <span className="font-medium text-gray-900 text-sm">{cat.title}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* KYC Modal */}
      <AnimatePresence>
        {showKycModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl relative overflow-hidden"
            >
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
                  <ShieldAlert size={32} className="text-blue-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Identity Verification</h3>
                <p className="text-gray-500 text-sm">
                  We need to verify your identity before you can withdraw funds. This process is handled securely by our partner.
                </p>
                
                <div className="pt-4 space-y-3">
                  <button 
                    onClick={handleKycVerification}
                    disabled={kycLoading}
                    className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-lg disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {kycLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      'Start Verification'
                    )}
                  </button>
                  <button 
                    onClick={() => setShowKycModal(false)}
                    disabled={kycLoading}
                    className="w-full py-4 text-gray-500 font-semibold hover:bg-gray-50 rounded-2xl transition-colors"
                  >
                    Maybe Later
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Phone Verification Modal */}
        {showPhoneModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl relative overflow-hidden"
            >
              <button 
                onClick={() => {
                  setShowPhoneModal(false);
                  setPhoneStep('input');
                  setOtp('');
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
              
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto">
                  <Icons.Phone size={32} className="text-orange-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Verify Phone</h3>
                <p className="text-gray-500 text-sm">
                  {phoneStep === 'input' 
                    ? "Enter your phone number to receive a verification code." 
                    : `We've sent an SMS to ${phoneNumber}`}
                </p>
                
                <div className="pt-4 space-y-3">
                  {phoneStep === 'input' ? (
                    <form onSubmit={handlePhoneSubmit} className="space-y-4">
                      <input 
                        type="tel" 
                        placeholder="Enter phone number" 
                        value={phoneNumber} 
                        onChange={(e) => setPhoneNumber(e.target.value)} 
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-gray-900 focus:ring-2 focus:ring-primary focus:outline-none" 
                        required 
                      />
                      <button 
                        type="submit"
                        disabled={phoneLoading || !phoneNumber}
                        className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-lg disabled:opacity-70 flex items-center justify-center gap-2"
                      >
                        {phoneLoading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Sending...</span>
                          </>
                        ) : (
                          'Send Code'
                        )}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handlePhoneVerify} className="space-y-4">
                      <input 
                        type="text" 
                        placeholder="Enter 6-digit code" 
                        value={otp} 
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} 
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-gray-900 focus:ring-2 focus:ring-primary focus:outline-none text-center tracking-widest text-lg" 
                        required 
                        minLength={6} 
                        maxLength={6} 
                      />
                      <button 
                        type="submit"
                        disabled={phoneLoading || otp.length < 6}
                        className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-lg disabled:opacity-70 flex items-center justify-center gap-2"
                      >
                        {phoneLoading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Verifying...</span>
                          </>
                        ) : (
                          'Verify'
                        )}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {selectedSurvey && (
          <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl relative"
            >
              <button 
                onClick={() => setSelectedSurvey(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
              
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-primary mb-4 mx-auto">
                <ClipboardList size={32} />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 text-center mb-2">{selectedSurvey.title}</h3>
              
              <div className="flex justify-center gap-4 mb-6">
                <div className="flex flex-col items-center">
                  <span className="text-xs text-gray-500 mb-1">Reward</span>
                  <div className="flex items-center gap-1 text-primary font-bold bg-primary/10 px-3 py-1 rounded-full">
                    <Coins size={14} />
                    {selectedSurvey.berry}
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-gray-500 mb-1">Time</span>
                  <div className="flex items-center gap-1 text-gray-700 font-medium bg-gray-100 px-3 py-1 rounded-full">
                    <Clock size={14} />
                    {selectedSurvey.time}
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-gray-500 mb-1">Category</span>
                  <div className="flex items-center gap-1 text-gray-700 font-medium bg-gray-100 px-3 py-1 rounded-full">
                    {selectedSurvey.category}
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => {
                  startSurvey(selectedSurvey);
                  setSelectedSurvey(null);
                }}
                className="w-full bg-primary text-white py-3.5 rounded-xl font-bold text-lg hover:bg-primary/90 transition-colors"
              >
                Start Survey
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default HomeView;

const SurveyCard: React.FC<{ survey: Survey, onClick: () => void }> = ({ survey, onClick }) => {
  return (
    <motion.div 
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 cursor-pointer flex gap-4 items-center transition-colors hover:bg-gray-50"
    >
      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-primary shrink-0">
        <ClipboardList size={24} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-1">
          <h4 className="font-medium text-gray-900 text-base truncate pr-2">{survey.title}</h4>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="flex items-center gap-1"><Clock size={12} /> {survey.time}</span>
          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
          <span>{survey.category}</span>
        </div>
      </div>
      <div className="flex items-center gap-1 text-primary font-semibold text-sm shrink-0 bg-gray-100 px-3 py-1.5 rounded-full">
        <Coins size={14} />
        {survey.berry}
      </div>
    </motion.div>
  );
}
