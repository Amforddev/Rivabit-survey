import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, CheckCircle2, Coins, User as UserIcon } from 'lucide-react';
import { View, UserProfile } from '../types';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';

interface ProfileBuilderViewProps {
  setView: (view: View) => void;
  userProfile: UserProfile;
}

const PROFILE_SECTIONS = [
  {
    id: 'occupation',
    title: 'Occupation',
    questions: [
      {
        id: 'employment',
        question: 'What is your current employment status?',
        options: ['Employed full-time', 'Employed part-time', 'Self-employed', 'Unemployed but looking for a job', 'Student']
      },
      {
        id: 'industry',
        question: 'In which industry do you work?',
        options: ['Technology', 'Finance', 'General Management', 'Engineering', 'Manufacturing', 'Other']
      },
      {
        id: 'job_role',
        question: 'What corresponds best to your job role?',
        options: ['C-Level / Executive', 'Senior Management', 'Middle Management', 'Entry Level / Staff', 'Freelancer', 'Other']
      },
      {
        id: 'company_size',
        question: 'How many employees work at your company?',
        options: ['1-10', '11-50', '51-200', '201-500', '500+']
      }
    ]
  },
  {
    id: 'shopping',
    title: 'Shopping',
    questions: [
      {
        id: 'shopping_frequency',
        question: 'How often do you shop online?',
        options: ['Weekly', 'Monthly', 'Rarely', 'Never']
      },
      {
        id: 'shopping_category',
        question: 'What do you buy most often online?',
        options: ['Electronics & Gadgets', 'Clothing & Fashion', 'Groceries & Food', 'Home & Garden', 'Digital Services']
      },
      {
        id: 'payment_method',
        question: 'What is your preferred payment method?',
        options: ['Credit/Debit Card', 'Bank Transfer', 'Mobile Money', 'Crypto', 'Cash on Delivery']
      },
      {
        id: 'monthly_budget',
        question: 'Estimated monthly online shopping budget?',
        options: ['Under ₦10,000', '₦10,000 - ₦50,000', '₦50,000 - ₦200,000', 'Over ₦200,000']
      }
    ]
  },
  {
    id: 'language',
    title: 'Language',
    questions: [
      {
        id: 'primary_language',
        question: 'What is your primary language?',
        options: ['English', 'Spanish', 'French', 'Hausa', 'Yoruba', 'Igbo', 'Other']
      },
      {
        id: 'fluency',
        question: 'Are you fluent in any secondary languages?',
        options: ['Yes', 'No']
      },
      {
        id: 'english_reading',
        question: 'How would you rate your English reading proficiency?',
        options: ['Native/Bilingual', 'Advanced', 'Intermediate', 'Beginner']
      },
      {
        id: 'english_writing',
        question: 'How would you rate your English writing proficiency?',
        options: ['Native/Bilingual', 'Advanced', 'Intermediate', 'Beginner']
      }
    ]
  },
  {
    id: 'health',
    title: 'Health & Lifestyle',
    questions: [
      {
        id: 'long_term_health',
        question: 'Do you have any long-term health conditions?',
        options: ['Yes', 'No', 'Prefer not to say']
      },
      {
        id: 'wear_glasses',
        question: 'Do you wear glasses or contact lenses?',
        options: ['Yes', 'No']
      },
      {
        id: 'diet',
        question: 'Which best describes your diet?',
        options: ['Omnivore', 'Vegetarian', 'Vegan', 'Pescetarian', 'Other']
      },
      {
        id: 'exercise',
        question: 'How often do you exercise?',
        options: ['Daily', '3-4 times a week', '1-2 times a week', 'Rarely', 'Never']
      }
    ]
  }
];

export function ProfileBuilderView({ setView, userProfile }: ProfileBuilderViewProps) {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  
  // mode: 'overview' | 'question' | 'section-complete' | 'all-complete'
  const [mode, setMode] = useState<'overview' | 'question' | 'section-complete' | 'all-complete'>('overview');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`profile_progress_${userProfile.uid}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed) {
          setCurrentSectionIndex(parsed.currentSectionIndex || 0);
          setCurrentQuestionIndex(parsed.currentQuestionIndex || 0);
          setAnswers(parsed.answers || {});
          setMode(parsed.mode || 'overview');
        }
      }
    } catch (e) {
      console.error("Failed to load profile progress", e);
    }
    setIsLoaded(true);
  }, [userProfile.uid]);

  useEffect(() => {
    if (isLoaded) {
      if (mode === 'all-complete') {
        localStorage.removeItem(`profile_progress_${userProfile.uid}`);
      } else {
        localStorage.setItem(`profile_progress_${userProfile.uid}`, JSON.stringify({
          currentSectionIndex,
          currentQuestionIndex,
          answers,
          mode
        }));
      }
    }
  }, [currentSectionIndex, currentQuestionIndex, answers, mode, isLoaded, userProfile.uid]);

  if (!isLoaded) return null;

  if (mode === 'all-complete') {
    return (
      <div className="w-full">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center"
        >
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={48} className="text-primary" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Profile Complete!</h2>
          <p className="text-gray-500 mb-6">Thanks for helping us know you better.</p>
          
          <div className="bg-gray-100 rounded-2xl p-4 flex items-center justify-center gap-2 mb-8">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white">
              <Coins size={18} />
            </div>
            <span className="text-xl font-semibold text-gray-900">+500 Berries Earned</span>
          </div>

          <button 
            onClick={() => setView('home')}
            className="w-full bg-accent text-white py-4 px-6 rounded-full font-semibold text-lg flex items-center justify-between transition-all hover:opacity-90 active:scale-[0.98] shadow-sm group"
          >
            <span>Go to Dashboard</span>
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-primary group-hover:translate-x-1 transition-transform">
              <ArrowRight size={20} />
            </div>
          </button>
        </motion.div>
      </div>
    );
  }

  const currentSection = PROFILE_SECTIONS[currentSectionIndex];
  
  // Overall progress logic: starts from 0. Each section contributes equally.
  const totalSections = PROFILE_SECTIONS.length;
  // If we've completed sections this session, that counts.
  // The first section starts overall space at 0%. When 1 is done, it's (1/3)*100%.
  const completedSectionsRatio = currentSectionIndex / totalSections;
  const overallProgress = Math.round(completedSectionsRatio * 100);
  const prevOverallProgress = currentSectionIndex > 0 ? Math.round(((currentSectionIndex - 1) / totalSections) * 100) : 0;

  // Calculate points bar (assuming max 200 points for visually pleasing bar like screenshot)
  const currentBerries = userProfile.berry || 0;
  const maxBerries = 200; 
  const pointsProgress = Math.min((currentBerries / maxBerries) * 100, 100);

  if (mode === 'overview') {
    return (
      <div className="w-full bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        
        <div className="px-6 pt-6 pb-2">
           <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
             Take surveys, rack up berries, and unlock your choice of rewards!
           </p>
        </div>
        
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <span className="text-4xl font-extrabold text-primary">{overallProgress}%</span>
            <div className="flex-1 h-6 bg-white rounded-full w-full shadow-inner border border-gray-100 overflow-hidden p-1">
              <motion.div 
                className="h-full bg-primary rounded-full"
                initial={{ width: `${prevOverallProgress}%` }}
                animate={{ width: `${overallProgress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
          
          <div className="rounded-3xl p-6">
            <p className="text-gray-600 text-base leading-relaxed mb-6">
              Complete your <span className="font-bold text-primary">{currentSection.title}</span> profile so we can more easily match you to studies that fit your lifestyle!
            </p>
            
            <button 
              onClick={() => setMode('question')}
              className="w-full bg-primary text-white py-4 rounded-full font-bold text-lg flex items-center justify-center transition-all hover:opacity-90 active:scale-[0.98] shadow-md group"
            >
              <span>Complete Profile</span>
              <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'section-complete') {
    return (
      <div className="w-full text-center p-6">
        <div className="bg-white w-full rounded-[2rem] p-8 shadow-sm border border-gray-100">
          <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Great Job!</h2>
          <p className="text-gray-500 mb-8 max-w-[250px] mx-auto">Your <span className="font-bold text-gray-700">{currentSection.title}</span> profile is complete.</p>
          
          <div className="space-y-3">
            <button 
              onClick={async () => {
                 if (currentSectionIndex < PROFILE_SECTIONS.length - 1) {
                   setCurrentSectionIndex(prev => prev + 1);
                   setCurrentQuestionIndex(0);
                   setMode('overview');
                 } else {
                   try {
                     await updateDoc(doc(db, 'users', userProfile.uid), {
                       berry: increment(500),
                       profileCompleted: true,
                       profileData: answers
                     });
                   } catch (e) {
                     console.error("Failed to complete profile", e);
                   }
                   setMode('all-complete');
                 }
              }}
              className="w-full bg-primary text-white py-3.5 px-6 rounded-full font-bold shadow-md hover:opacity-90 active:scale-[0.98] transition-all"
            >
              Continue to Next Category
            </button>

            <button 
              onClick={() => setView('home')}
              className="w-full bg-gray-100 text-gray-600 py-3.5 px-6 rounded-full font-semibold hover:bg-gray-200 active:scale-[0.98] transition-all"
            >
              Save and Return Later
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- mode === 'question' ---
  const currentQ = currentSection.questions[currentQuestionIndex];
  
  // Section progress logic: starts from 0%, moves to 100% when all questions are answered or skipped (on completion)
  // At Q1 out of 2, it is 0%. At Q2 out of 2 it is 50%. After Q2, it's complete.
  const sectionProgress = Math.round((currentQuestionIndex / currentSection.questions.length) * 100);

  const handleOptionSelect = (option: string) => {
    setAnswers(prev => ({ ...prev, [currentQ.id]: option }));
    
    // Auto advance
    setTimeout(() => {
      if (currentQuestionIndex < currentSection.questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        setMode('section-complete');
      }
    }, 400); // slight delay to show selection
  };

  return (
    <div className="w-full bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-gray-900 truncate pr-4">{currentSection.title}</h1>
        <div className="flex items-center gap-3">
          <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden shrink-0 flex items-center relative shadow-inner">
            <motion.div 
              className="absolute left-0 top-0 bottom-0 bg-primary rounded-full"
              animate={{ width: `${sectionProgress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <span className="text-sm text-gray-500 font-bold shrink-0">{sectionProgress}%</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <motion.div 
          key={`${currentSectionIndex}-${currentQuestionIndex}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="p-1"
        >
          <p className="text-lg font-bold text-gray-900 mb-6 flex items-start gap-1">
             <span className="text-primary mt-1">*</span> {currentQ.question}
          </p>
          
          <div className="space-y-3">
            {currentQ.options.map((option) => {
              const isSelected = answers[currentQ.id] === option;
              return (
                <button
                  key={option}
                  onClick={() => handleOptionSelect(option)}
                  className={`w-full text-left p-4 flex items-center gap-3 transition-colors border group rounded-2xl ${
                    isSelected 
                      ? 'border-primary bg-primary/5 shadow-sm' 
                      : 'border-gray-200 bg-white hover:border-primary/50 hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center ${isSelected ? 'border-primary' : 'border-gray-300 group-hover:border-primary/50'}`}>
                    {isSelected && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                  </div>
                  <span className={`text-[15px] font-medium leading-tight ${isSelected ? 'text-primary' : 'text-gray-700'}`}>{option}</span>
                </button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

