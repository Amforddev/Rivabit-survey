import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wallet, ArrowUpRight, ArrowDownLeft, Building2, CheckCircle2, AlertCircle, ShieldAlert, Phone as PhoneIcon, ArrowRight, X } from 'lucide-react';
import { UserProfile } from '../types';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface WalletViewProps {
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
}

export const WalletView: React.FC<WalletViewProps> = ({ userProfile, setUserProfile }) => {
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showBankSetupModal, setShowBankSetupModal] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showKycRequiredModal, setShowKycRequiredModal] = useState(false);
  
  const [showKycModal, setShowKycModal] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [kycLoading, setKycLoading] = useState(false);
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(userProfile.phoneNumber || '');
  const [phoneStep, setPhoneStep] = useState<'input' | 'verify'>('input');
  const [phoneOtp, setPhoneOtp] = useState('');

  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [otp, setOtp] = useState('');
  
  const [bankName, setBankName] = useState(userProfile.bankName || '');
  const [accountNumber, setAccountNumber] = useState(userProfile.accountNumber || '');
  
  // Mock derived customer name
  const derivedCustomerName = `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim() || userProfile.displayName || 'Demo User';

  const handleWithdrawClick = () => {
    if (!userProfile.kycVerified || !(userProfile as any).phoneVerified) {
      setShowKycRequiredModal(true);
      return;
    }
    if (!userProfile.bankName || !userProfile.accountNumber) {
      setShowBankSetupModal(true);
    } else {
      setShowWithdrawModal(true);
    }
  };

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
      setPhoneOtp('');
    }, 1000);
  };

  const handleBankSetupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUserProfile(prev => ({
      ...prev,
      bankName,
      accountNumber,
      kycName: derivedCustomerName
    }));
    setShowBankSetupModal(false);
    setShowWithdrawModal(true);
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(withdrawAmount) > userProfile.walletBalance) return;
    setShowWithdrawModal(false);
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = () => {
    setShowConfirmModal(false);
    setShowOTPModal(true);
  };

  const handleOTPSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === 4) {
      // Mock success
      setUserProfile(prev => ({
        ...prev,
        walletBalance: prev.walletBalance - Number(withdrawAmount)
      }));
      setShowOTPModal(false);
      setShowSuccessModal(true);
      setWithdrawAmount('');
      setOtp('');
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-primary">
          <Wallet size={20} />
        </div>
        <h1 className="text-2xl font-semibold text-gray-900">Wallet</h1>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-br from-primary to-primary/80 rounded-[2rem] p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-gray-300 font-medium mb-1">Available Balance</p>
          <h2 className="text-4xl font-bold mb-6">₦{userProfile.walletBalance?.toLocaleString() || '0'}</h2>
          
          <div className="flex gap-3">
            <button 
              onClick={handleWithdrawClick}
              className="flex-1 bg-gradient-to-r from-accent via-secondary to-accent animate-gradient bg-size-200 text-white py-4 px-8 rounded-full font-black text-xl flex items-center justify-between transition-all hover:opacity-90 active:scale-[0.98] shadow-lg group"
            >
              <span className="tracking-tight">Withdraw</span>
              <div className="w-12 h-12 bg-[#1C1F26] rounded-full flex items-center justify-center text-white group-hover:translate-x-1 transition-transform shadow-inner">
                <ArrowUpRight size={24} strokeWidth={3} />
              </div>
            </button>
          </div>
        </div>
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
      </div>

      {(!userProfile.kycVerified || !(userProfile as any).phoneVerified) && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-gray-900 text-sm">Action Required for Withdrawal</h3>
          </div>
          
          <div className="space-y-3">
            {!(userProfile as any).phoneVerified && (
              <button 
                onClick={() => setShowPhoneModal(true)}
                className="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl flex items-center justify-between group hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-orange-100 text-orange-600">
                     <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-gray-900 text-sm">Verify phone number</h4>
                    <p className="text-xs text-gray-500">Secure your account</p>
                  </div>
                </div>
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-400 group-hover:text-primary transition-colors shadow-sm">
                  <ArrowRight size={16} />
                </div>
              </button>
            )}

            {!userProfile.kycVerified && (
              <button 
                onClick={() => setShowKycModal(true)}
                className="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl flex items-center justify-between group hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-red-100 text-red-600">
                    <ShieldAlert size={20} />
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-gray-900 text-sm">Verify your identity</h4>
                    <p className="text-xs text-gray-500">Required for withdrawals</p>
                  </div>
                </div>
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-400 group-hover:text-primary transition-colors shadow-sm">
                  <ArrowRight size={16} />
                </div>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
        <div className="space-y-3">
          {/* Mock Transactions */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center text-secondary">
                <ArrowDownLeft size={20} />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">Reward Redemption</p>
                <p className="text-xs text-gray-500">Today, 10:24 AM</p>
              </div>
            </div>
            <span className="font-semibold text-secondary">+₦1,000</span>
          </div>
          
          <div className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center text-secondary">
                <ArrowDownLeft size={20} />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">Raffle Prize</p>
                <p className="text-xs text-gray-500">Yesterday</p>
              </div>
            </div>
            <span className="font-semibold text-secondary">+₦50,000</span>
          </div>
        </div>
      </div>

      {/* KYC Required Modal */}
      {showKycRequiredModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl relative overflow-hidden text-center"
          >
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} className="text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Verification Required</h3>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              To keep your account secure, we need to ensure your identity matches your withdrawal method. Please complete the pending verification steps to unlock withdrawals.
            </p>
            <button 
              onClick={() => setShowKycRequiredModal(false)}
              className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-lg"
            >
              Understood
            </button>
          </motion.div>
        </div>
      )}

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
                  setPhoneOtp('');
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
              
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto">
                  <PhoneIcon size={32} className="text-orange-500" />
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
                        value={phoneOtp} 
                        onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, ''))} 
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-gray-900 focus:ring-2 focus:ring-primary focus:outline-none text-center tracking-widest text-lg" 
                        required 
                        minLength={6} 
                        maxLength={6} 
                      />
                      <button 
                        type="submit"
                        disabled={phoneLoading || phoneOtp.length < 6}
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
      </AnimatePresence>

      {/* Modals */}
      {showBankSetupModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl"
          >
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-primary mb-4">
              <Building2 size={24} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Setup Bank Account</h3>
            <p className="text-sm text-gray-500 mb-6">Please provide your bank details. The customer name will be derived and cross-checked against your KYC name.</p>
            
            <form onSubmit={handleBankSetupSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                <input 
                  type="text" 
                  required
                  value={bankName}
                  onChange={e => setBankName(e.target.value)}
                  placeholder="e.g. GTBank"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                <input 
                  type="text" 
                  required
                  value={accountNumber}
                  onChange={e => setAccountNumber(e.target.value)}
                  placeholder="10-digit account number"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                <p className="text-xs text-blue-600 font-medium mb-1">Derived Customer Name</p>
                <p className="text-sm text-blue-900 font-semibold">{derivedCustomerName}</p>
                <p className="text-[10px] text-blue-500 mt-1">This will be cross-checked with your KYC records.</p>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button 
                  type="button"
                  onClick={() => setShowBankSetupModal(false)}
                  className="flex-1 py-3 font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 font-medium text-white bg-primary rounded-xl hover:bg-primary/90"
                >
                  Save Details
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Withdraw Funds</h3>
            
            <div className="bg-gray-50 p-4 rounded-xl mb-6 border border-gray-100">
              <p className="text-xs text-gray-500 mb-1">Withdrawing to</p>
              <p className="font-medium text-gray-900">{userProfile.bankName}</p>
              <p className="text-sm text-gray-600">{userProfile.accountNumber}</p>
              <p className="text-xs text-gray-500 mt-1">Name: {userProfile.kycName}</p>
            </div>

            <form onSubmit={handleWithdrawSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₦)</label>
                <input 
                  type="number" 
                  required
                  min="100"
                  max={userProfile.walletBalance}
                  value={withdrawAmount}
                  onChange={e => setWithdrawAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary text-lg font-medium"
                />
                <p className="text-xs text-gray-500 mt-2">Available: ₦{userProfile.walletBalance?.toLocaleString() || '0'}</p>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button 
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="flex-1 py-3 font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={!withdrawAmount || Number(withdrawAmount) > userProfile.walletBalance}
                  className="flex-1 py-3 font-medium text-white bg-primary rounded-xl hover:bg-primary/90 disabled:opacity-50"
                >
                  Continue
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Confirm Withdrawal</h3>
            
            <div className="bg-gray-50 p-4 rounded-xl mb-6 border border-gray-100 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Amount</span>
                <span className="font-bold text-lg text-gray-900">₦{Number(withdrawAmount).toLocaleString()}</span>
              </div>
              <div className="h-px bg-gray-200 w-full"></div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Bank Name</span>
                <span className="font-medium text-gray-900">{userProfile.bankName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Account Number</span>
                <span className="font-medium text-gray-900">{userProfile.accountNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Account Name</span>
                <span className="font-medium text-gray-900">{userProfile.kycName}</span>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button 
                type="button"
                onClick={() => {
                  setShowConfirmModal(false);
                  setShowWithdrawModal(true);
                }}
                className="flex-1 py-3 font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200"
              >
                Back
              </button>
              <button 
                onClick={handleConfirmSubmit}
                className="flex-1 py-3 font-medium text-white bg-primary rounded-xl hover:bg-primary/90"
              >
                Confirm
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {showOTPModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl text-center"
          >
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-primary mx-auto mb-4">
              <AlertCircle size={24} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Enter OTP</h3>
            <p className="text-sm text-gray-500 mb-6">Please enter the 4-digit code sent to your registered phone number to confirm withdrawal.</p>
            
            <form onSubmit={handleOTPSubmit} className="space-y-4">
              <input 
                type="text" 
                required
                maxLength={4}
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                className="w-32 mx-auto text-center tracking-widest border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary text-2xl font-bold"
              />
              
              <div className="flex gap-3 mt-6">
                <button 
                  type="button"
                  onClick={() => setShowOTPModal(false)}
                  className="flex-1 py-3 font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={otp.length !== 4}
                  className="flex-1 py-3 font-medium text-white bg-primary rounded-xl hover:bg-primary/90 disabled:opacity-50"
                >
                  Verify
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl text-center"
          >
            <div className="w-20 h-20 bg-gray-100 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={40} />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">Withdrawal Successful</h3>
            <p className="text-gray-500 mb-6">Your funds are on the way to your bank account.</p>
            
            <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-left space-y-4 border border-gray-100">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">Amount</span>
                <span className="font-bold text-gray-900">₦{Number(withdrawAmount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">Bank</span>
                <span className="font-medium text-gray-900">{userProfile.bankName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">Account</span>
                <span className="font-medium text-gray-900">{userProfile.accountNumber}</span>
              </div>
              <div className="pt-2 border-t border-gray-200 flex justify-between items-center">
                <span className="text-gray-500 text-sm">Status</span>
                <span className="text-green-600 font-bold text-sm uppercase">Processing</span>
              </div>
            </div>

            <button 
              onClick={() => {
                setShowSuccessModal(false);
                setWithdrawAmount('');
              }}
              className="w-full bg-accent text-gray-900 py-4 px-6 rounded-full font-semibold text-lg flex items-center justify-between transition-all hover:opacity-90 active:scale-[0.98] shadow-sm group"
            >
              <span>Done</span>
              <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center text-white group-hover:translate-x-1 transition-transform">
                <CheckCircle2 size={20} />
              </div>
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
