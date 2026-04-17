import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';
import logo2Img from '../assets/logo2.jpg';

interface SplashScreenProps {
  onFinish: () => void;
}

export function SplashScreen({ onFinish }: SplashScreenProps) {
  const [phase, setPhase] = useState<'logo' | 'text'>('logo');

  useEffect(() => {
    if (phase === 'logo') {
      const timer = setTimeout(() => setPhase('text'), 10000);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  return (
    <div className="absolute inset-0 bg-[#0F1115] z-[100] overflow-hidden">
      <AnimatePresence mode="wait">
        {phase === 'logo' ? (
          <motion.div 
            key="logo-phase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full flex flex-col items-center justify-center"
          >
            {/* Abstract Background Elements (Deep Colors) */}
            <div className="absolute inset-0 pointer-events-none">
              <motion.div 
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.1, 0.2, 0.1] 
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary rounded-full blur-[120px]"
              />
              <motion.div 
                animate={{ 
                  scale: [1, 1.3, 1],
                  opacity: [0.1, 0.15, 0.1] 
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary rounded-full blur-[100px]"
              />
            </div>

            {/* Logo in the Middle */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative z-10 flex flex-col items-center"
            >
              <div className="w-32 h-32 mb-6 flex items-center justify-center">
                <img 
                  src={logo2Img} 
                  alt="berry Logo" 
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <motion.h1 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="text-5xl font-bold text-white tracking-tighter"
              >
                berry
              </motion.h1>
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: 40 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="h-1 bg-secondary rounded-full mt-4"
              />
            </motion.div>

            {/* Loading Indicator */}
            <div className="absolute bottom-16 left-0 right-0 flex justify-center">
              <div className="flex gap-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ 
                      scale: [1, 1.5, 1],
                      opacity: [0.3, 1, 0.3]
                    }}
                    transition={{ 
                      duration: 1, 
                      repeat: Infinity, 
                      delay: i * 0.2 
                    }}
                    className="w-2 h-2 bg-secondary rounded-full"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="text-phase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full flex flex-col relative"
          >
            {/* Abstract Background Elements (Deep Colors) */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Diagonal Lines */}
              <div className="absolute top-0 left-0 w-full h-full opacity-20">
                {[...Array(5)].map((_, i) => (
                  <div 
                    key={i}
                    className="absolute bg-secondary h-[1px] w-[200%] -rotate-45"
                    style={{ top: `${i * 15}%`, left: '-50%' }}
                  />
                ))}
              </div>

              {/* Floating Coins/Sparkles */}
              <motion.div 
                animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[15%] right-[-5%] w-48 h-48 border-2 border-secondary/30 rounded-full flex items-center justify-center"
              >
                <div className="w-32 h-32 border-2 border-secondary/20 rounded-full" />
              </motion.div>
              
              <motion.div 
                animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.2, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute top-[25%] left-[15%] text-white/40"
              >
                <Sparkles size={48} />
              </motion.div>
              
              <motion.div 
                animate={{ opacity: [0.2, 0.8, 0.2], scale: [0.8, 1, 0.8] }}
                transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                className="absolute top-[35%] left-[30%] text-white/30"
              >
                <Sparkles size={24} />
              </motion.div>
            </div>

            {/* Content at Bottom */}
            <div className="relative z-10 flex-1 flex flex-col justify-end p-8 pb-16">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-8"
              >
                <div className="space-y-2">
                  <h1 className="text-5xl font-bold text-white leading-[1.1] tracking-tight">
                    Harvest Your<br />
                    Rewards!
                  </h1>
                </div>

                <ul className="space-y-5">
                  {[
                    "Complete surveys effortlessly.",
                    "Earn berries for every opinion.",
                    "Redeem for real rewards instantly."
                  ].map((text, i) => (
                    <motion.li 
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + (i * 0.2) }}
                      className="flex items-center gap-3 text-gray-300 text-lg"
                    >
                      <div className="w-1.5 h-1.5 bg-secondary rounded-full" />
                      {text}
                    </motion.li>
                  ))}
                </ul>

                {/* Abstract Scribble at Bottom */}
                <div className="relative h-20 overflow-hidden opacity-20">
                  <svg viewBox="0 0 400 100" className="w-full h-full text-secondary">
                    <path 
                      d="M0,50 Q50,20 100,50 T200,50 T300,50 T400,50" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2"
                      className="animate-pulse"
                    />
                  </svg>
                </div>

                <button 
                  onClick={onFinish}
                  className="btn-primary group"
                >
                  <span>Get Started</span>
                  <div className="btn-icon group-hover:translate-x-1 transition-transform">
                    <ArrowRight size={24} />
                  </div>
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
