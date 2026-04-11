import React, { useState } from 'react';
import { motion } from 'motion/react';
import { LogIn, Gift, UserPlus, CheckCircle2, AlertCircle } from 'lucide-react';
import { signInWithGoogle, db, auth, handleFirestoreError, OperationType } from '../firebase';
import { doc, getDoc, setDoc, serverTimestamp, collection, query, where, getDocs, updateDoc, increment } from 'firebase/firestore';

interface AuthViewProps {
  onLoginSuccess: () => void;
}

export default function AuthView({ onLoginSuccess }: AuthViewProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [referralCode, setReferralCode] = useState('');
  const [step, setStep] = useState<'login' | 'referral'>('login');
  const [tempUser, setTempUser] = useState<any>(null);

  const generateReferralCode = (uid: string) => {
    return uid.substring(0, 6).toUpperCase() + Math.floor(Math.random() * 1000);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await signInWithGoogle();
      
      // Check if user exists
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        onLoginSuccess();
      } else {
        // New user, ask for referral code
        setTempUser(user);
        setStep('referral');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteSignup = async () => {
    if (!tempUser) return;
    setLoading(true);
    setError(null);
    
    try {
      let referredByUid = null;
      let bonusPoints = 0;

      if (referralCode.trim()) {
        // Find user with this referral code
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('referralCode', '==', referralCode.trim().toUpperCase()));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const referrerDoc = querySnapshot.docs[0];
          referredByUid = referrerDoc.id;
          bonusPoints = 50; // Bonus for new user
          
          // Give bonus to referrer
          try {
            await updateDoc(doc(db, 'users', referredByUid), {
              points: increment(50)
            });
          } catch (e) {
            console.error("Failed to update referrer points", e);
          }
        } else {
          setError('Invalid referral code. Leave blank to skip.');
          setLoading(false);
          return;
        }
      }

      const newReferralCode = generateReferralCode(tempUser.uid);
      
      const userData = {
        uid: tempUser.uid,
        email: tempUser.email || '',
        displayName: tempUser.displayName || '',
        photoURL: tempUser.photoURL || '',
        points: bonusPoints,
        referralCode: newReferralCode,
        createdAt: serverTimestamp(),
        ...(referredByUid && { referredBy: referredByUid })
      };

      await setDoc(doc(db, 'users', tempUser.uid), userData);
      
      if (referredByUid) {
        // Create a notification for the referrer
        try {
          await setDoc(doc(collection(db, 'notifications')), {
            userId: referredByUid,
            title: 'New Referral!',
            message: `Someone signed up using your code. You earned 50 points!`,
            read: false,
            createdAt: serverTimestamp(),
            type: 'referral'
          });
        } catch (e) {
          console.error("Failed to notify referrer", e);
        }
      }

      onLoginSuccess();
    } catch (err: any) {
      handleFirestoreError(err, OperationType.CREATE, 'users');
      setError(err.message || 'Failed to complete signup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-brand-blue via-[#FF90E8] to-[#FFC900] animate-gradient text-brand-dark">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-white p-8 rounded-2xl neo-brutalist"
      >
        {step === 'login' ? (
          <>
            <div className="w-16 h-16 bg-[#23A094] rounded-2xl flex items-center justify-center mb-6 border-2 border-brand-dark shadow-[2px_2px_0px_0px_rgba(30,36,45,1)]">
              <Gift size={32} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-2 uppercase tracking-wide">Rivabit</h1>
            <p className="text-gray-600 mb-8 font-bold">Take surveys, earn points, get real rewards.</p>
            
            {error && (
              <div className="bg-red-100 text-red-600 p-3 rounded-xl mb-4 flex items-start gap-2 text-sm font-bold border-2 border-red-600">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-brand-dark text-white py-3.5 rounded-xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-gray-800 transition-colors disabled:opacity-70 border-2 border-brand-dark shadow-[2px_2px_0px_0px_rgba(30,36,45,1)] active:shadow-none active:translate-y-0.5 active:translate-x-0.5"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={20} />
                  Continue with Google
                </>
              )}
            </button>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-[#FFC900] rounded-2xl flex items-center justify-center mb-6 border-2 border-brand-dark shadow-[2px_2px_0px_0px_rgba(30,36,45,1)]">
              <UserPlus size={32} className="text-brand-dark" />
            </div>
            <h2 className="text-2xl font-bold mb-2 uppercase tracking-wide">Almost there!</h2>
            <p className="text-gray-600 mb-6 font-bold">Have a referral code? Enter it below to get a 50 point bonus.</p>
            
            {error && (
              <div className="bg-red-100 text-red-600 p-3 rounded-xl mb-4 flex items-start gap-2 text-sm font-bold border-2 border-red-600">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <input
              type="text"
              placeholder="Referral Code (Optional)"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
              className="w-full bg-white border-2 border-brand-dark rounded-xl px-4 py-3 text-brand-dark placeholder-gray-400 mb-4 focus:outline-none focus:ring-2 focus:ring-brand-blue uppercase font-bold"
            />

            <button
              onClick={handleCompleteSignup}
              disabled={loading}
              className="w-full bg-[#23A094] text-white py-3.5 rounded-xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-teal-600 transition-colors disabled:opacity-70 border-2 border-brand-dark shadow-[2px_2px_0px_0px_rgba(30,36,45,1)] active:shadow-none active:translate-y-0.5 active:translate-x-0.5"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 size={20} />
                  Complete Signup
                </>
              )}
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}
