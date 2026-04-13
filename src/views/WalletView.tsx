import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Wallet, ArrowUpRight, ArrowDownLeft, Building2, CheckCircle2, AlertCircle } from 'lucide-react';
import { UserProfile } from '../types';

interface WalletViewProps {
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
}

export const WalletView: React.FC<WalletViewProps> = ({ userProfile, setUserProfile }) => {
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showBankSetupModal, setShowBankSetupModal] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [otp, setOtp] = useState('');
  
  const [bankName, setBankName] = useState(userProfile.bankName || '');
  const [accountNumber, setAccountNumber] = useState(userProfile.accountNumber || '');
  const [kycName, setKycName] = useState(userProfile.kycName || '');

  const handleWithdrawClick = () => {
    if (!userProfile.bankName || !userProfile.accountNumber || !userProfile.kycName) {
      setShowBankSetupModal(true);
    } else {
      setShowWithdrawModal(true);
    }
  };

  const handleBankSetupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUserProfile(prev => ({
      ...prev,
      bankName,
      accountNumber,
      kycName
    }));
    setShowBankSetupModal(false);
    setShowWithdrawModal(true);
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(withdrawAmount) > userProfile.walletBalance) return;
    setShowWithdrawModal(false);
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
        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-[#1F2937]">
          <Wallet size={20} />
        </div>
        <h1 className="text-2xl font-semibold text-gray-900">Wallet</h1>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-[2rem] p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-gray-300 font-medium mb-1">Available Balance</p>
          <h2 className="text-4xl font-bold mb-6">₦{userProfile.walletBalance?.toLocaleString() || '0'}</h2>
          
          <div className="flex gap-3">
            <button 
              onClick={handleWithdrawClick}
              className="flex-1 bg-white text-gray-900 py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
            >
              <ArrowUpRight size={18} />
              Withdraw
            </button>
          </div>
        </div>
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
      </div>

      {/* Recent Transactions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
        <div className="space-y-3">
          {/* Mock Transactions */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                <ArrowDownLeft size={20} />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">Reward Redemption</p>
                <p className="text-xs text-gray-500">Today, 10:24 AM</p>
              </div>
            </div>
            <span className="font-semibold text-green-600">+₦1,000</span>
          </div>
          
          <div className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                <ArrowDownLeft size={20} />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">Raffle Prize</p>
                <p className="text-xs text-gray-500">Yesterday</p>
              </div>
            </div>
            <span className="font-semibold text-green-600">+₦50,000</span>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showBankSetupModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl"
          >
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-[#1F2937] mb-4">
              <Building2 size={24} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Setup Bank Account</h3>
            <p className="text-sm text-gray-500 mb-6">Please provide your bank details. The name must match your KYC documents.</p>
            
            <form onSubmit={handleBankSetupSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Name (KYC)</label>
                <input 
                  type="text" 
                  required
                  value={kycName}
                  onChange={e => setKycName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1F2937]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                <input 
                  type="text" 
                  required
                  value={bankName}
                  onChange={e => setBankName(e.target.value)}
                  placeholder="e.g. GTBank"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1F2937]"
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
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1F2937]"
                />
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
                  className="flex-1 py-3 font-medium text-white bg-[#1F2937] rounded-xl hover:bg-gray-900"
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
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1F2937] text-lg font-medium"
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
                  className="flex-1 py-3 font-medium text-white bg-[#1F2937] rounded-xl hover:bg-gray-900 disabled:opacity-50"
                >
                  Continue
                </button>
              </div>
            </form>
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
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-[#1F2937] mx-auto mb-4">
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
                className="w-32 mx-auto text-center tracking-widest border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1F2937] text-2xl font-bold"
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
                  className="flex-1 py-3 font-medium text-white bg-[#1F2937] rounded-xl hover:bg-gray-900 disabled:opacity-50"
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
            <div className="w-20 h-20 bg-gray-100 text-[#1F2937] rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={40} />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">Withdrawal Successful</h3>
            <p className="text-gray-500 mb-6">Your funds are on the way to your bank account.</p>
            <button 
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-[#1F2937] text-white py-4 rounded-xl font-medium text-lg hover:bg-gray-900 transition-colors"
            >
              Done
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
