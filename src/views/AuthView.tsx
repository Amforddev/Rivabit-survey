import React, { useState } from 'react';
import { motion } from 'motion/react';
import { LogIn, Gift, UserPlus, CheckCircle2, AlertCircle, Play } from 'lucide-react';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { signInAnonymously } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, collection, query, where, getDocs, updateDoc, increment, limit } from 'firebase/firestore';

interface AuthViewProps {
  onLoginSuccess: () => void;
}

const REFERRAL_BONUS_POINTS = 100;

export default function AuthView({ onLoginSuccess }: AuthViewProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [referralCode, setReferralCode] = useState('');

  const generateReferralCode = (uid: string) => {
    return uid.substring(0, 6).toUpperCase() + Math.floor(Math.random() * 1000);
  };

  const handleStart = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const userCredential = await signInAnonymously(auth);
      const user = userCredential.user;

      // Check if user already exists (in case they previously signed in anonymously)
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        onLoginSuccess();
        return;
      }

      let referredByUid = null;
      let bonusPoints = 0;

      if (referralCode.trim()) {
        // Find user with this referral code
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('referralCode', '==', referralCode.trim().toUpperCase()), limit(1));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const referrerDoc = querySnapshot.docs[0];
          
          if (referrerDoc.id === user.uid) {
            setError('You cannot use your own referral code.');
            setLoading(false);
            return;
          }

          referredByUid = referrerDoc.id;
          bonusPoints = REFERRAL_BONUS_POINTS; // Bonus for new user
          
          // Give bonus to referrer
          try {
            await updateDoc(doc(db, 'users', referredByUid), {
              points: increment(REFERRAL_BONUS_POINTS)
            });
            // Create a notification for the referrer
            await setDoc(doc(collection(db, 'notifications')), {
              userId: referredByUid,
              title: 'New Referral!',
              message: `Someone signed up using your code. You earned ${REFERRAL_BONUS_POINTS} points!`,
              read: false,
              createdAt: serverTimestamp(),
              type: 'referral'
            });
          } catch (e) {
            console.error("Failed to update referrer points or notify", e);
          }
        } else {
          setError('Invalid referral code. Leave blank to skip.');
          setLoading(false);
          return;
        }
      }

      const newReferralCode = generateReferralCode(user.uid);
      
      const userData = {
        uid: user.uid,
        email: '',
        displayName: 'Guest User',
        photoURL: '',
        points: bonusPoints,
        referralCode: newReferralCode,
        createdAt: serverTimestamp(),
        ...(referredByUid && { referredBy: referredByUid })
      };

      await setDoc(doc(db, 'users', user.uid), userData);
      
      onLoginSuccess();
    } catch (err: any) {
      try {
        handleFirestoreError(err, OperationType.CREATE, 'users');
      } catch (e: any) {
        // handleFirestoreError throws, so we catch it here to update UI
        console.error(e);
      }
      setError('Failed to start. Please check your connection or try again.');
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
        <div className="w-16 h-16 bg-[#23A094] rounded-2xl flex items-center justify-center mb-6 border-2 border-brand-dark shadow-[2px_2px_0px_0px_rgba(30,36,45,1)]">
          <Play size={32} className="text-white" />
        </div>
        <h1 className="text-4xl font-bold mb-2 uppercase tracking-wide">Rivabit</h1>
        <p className="text-gray-600 mb-6 font-bold">Take surveys, earn points, get real rewards. No sign up required!</p>
        
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
          onClick={handleStart}
          disabled={loading}
          className="w-full bg-brand-dark text-white py-3.5 rounded-xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-gray-800 transition-colors disabled:opacity-70 border-2 border-brand-dark shadow-[2px_2px_0px_0px_rgba(30,36,45,1)] active:shadow-none active:translate-y-0.5 active:translate-x-0.5"
        >
          {loading ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Play size={20} />
              Start Earning
            </>
          )}
        </button>
      </motion.div>
    </div>
  );
}
