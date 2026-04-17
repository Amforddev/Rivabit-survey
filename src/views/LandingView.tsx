import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Smartphone, Globe, BarChart3, Users, ShieldCheck, Zap, PlayCircle, Apple, CheckCircle2, Coins, ClipboardList, CheckSquare, Wallet, Star, Heart, Target, TrendingUp } from 'lucide-react';
import { View } from '../types';
import heroImg from '../assets/hero.jpg';
import logoImg from '../assets/logo2.png';

interface LandingViewProps {
  setView: (view: View) => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ setView }) => {
  const Scribble = ({ icon: Icon, top, left, delay = 0, size = 120 }: any) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: [0.08, 0.15, 0.08],
        y: [0, -20, 0],
        rotate: [0, 10, 0]
      }}
      transition={{ 
        duration: 10 + Math.random() * 5, 
        repeat: Infinity, 
        ease: "easeInOut",
        delay 
      }}
      className="absolute pointer-events-none text-kinetic-berry z-0"
      style={{ top, left }}
    >
      <Icon size={size} strokeWidth={1} />
    </motion.div>
  );

  const ScribbleLine = ({ d, top, left }: any) => (
    <svg 
      className="absolute pointer-events-none text-kinetic-berry/10 z-0" 
      style={{ top, left, width: '400px', height: '400px' }}
      viewBox="0 0 400 400"
      fill="none"
    >
      <motion.path
        d={d}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="10,10"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
      />
    </svg>
  );

  return (
    <div className="min-h-screen bg-kinetic-cream text-black font-sans selection:bg-kinetic-berry/30 relative overflow-x-hidden">
      {/* Global Background Scribbles & Lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Scribble icon={Coins} top="15%" left="5%" delay={0} />
        <ScribbleLine d="M 50 50 Q 150 100 250 50 T 350 150" top="12%" left="8%" />
        
        <Scribble icon={ClipboardList} top="25%" left="85%" delay={1} />
        <ScribbleLine d="M 350 50 Q 250 150 150 50 T 50 150" top="22%" left="70%" />

        <Scribble icon={Star} top="45%" left="10%" delay={2} size={80} />
        <ScribbleLine d="M 50 150 C 150 50 250 250 350 150" top="42%" left="15%" />

        <Scribble icon={Heart} top="65%" left="90%" delay={3} size={60} />
        <Scribble icon={Target} top="80%" left="15%" delay={4} />
        <ScribbleLine d="M 50 50 Q 200 200 350 50" top="75%" left="20%" />

        <Scribble icon={TrendingUp} top="35%" left="45%" delay={5} size={150} />
        <Scribble icon={Zap} top="75%" left="50%" delay={6} />
        <ScribbleLine d="M 50 350 Q 150 250 250 350 T 350 250" top="65%" left="40%" />

        <Scribble icon={Smartphone} top="55%" left="75%" delay={7} size={100} />
        <Scribble icon={Globe} top="5%" left="60%" delay={8} />
        <Scribble icon={Wallet} top="90%" left="80%" delay={9} />
      </div>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-black/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 flex items-center justify-center">
              <img src={logoImg} alt="berry Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
            </div>
            <span className="text-2xl font-extrabold tracking-tighter">berry</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-gray-600">
            <a href="#consumers" className="hover:text-black transition-colors">Our Services</a>
            <a href="#solutions" className="hover:text-black transition-colors">Solutions</a>
            <a href="#how-it-works" className="hover:text-black transition-colors">How It Works</a>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setView('onboarding')}
              className="hidden sm:block btn-kinetic-white !px-6 !py-2 text-sm"
            >
              Signup
            </button>
            <button 
              onClick={() => setView('onboarding')}
              className="btn-kinetic-berry !px-6 !py-2 text-sm"
            >
              Login
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden z-10">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-kinetic-berry/10 border border-kinetic-berry/20 text-kinetic-berry text-xs font-bold tracking-wide uppercase">
              The Best Survey Website
            </div>
            
            <h1 className="text-7xl md:text-8xl font-extrabold leading-[0.95] tracking-tighter text-black">
              Answer <span className="text-gray-900">Surveys</span>,<br />
              Earn <span className="text-gray-900">Money!</span>
            </h1>
            
            <p className="text-lg text-gray-700 max-w-lg font-medium leading-relaxed">
              Sign up for our survey website and start earning money from the comfort of your own home. Our surveys are easy and fun to complete, and you can earn cash rewards for every survey you complete.
            </p>
            
            <div className="flex flex-wrap gap-4 pt-4">
              <button 
                onClick={() => setView('onboarding')}
                className="btn-kinetic-berry text-lg"
              >
                Get Started
              </button>
              
              <button 
                className="btn-kinetic-white text-lg"
              >
                Learn More
              </button>
            </div>

            <div className="flex items-center gap-6 pt-8 border-t border-black/5">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <img 
                    key={i}
                    src={`https://picsum.photos/seed/user${i}/100/100`} 
                    alt="User" 
                    className="w-10 h-10 rounded-full border-2 border-kinetic-cream"
                    referrerPolicy="no-referrer"
                  />
                ))}
              </div>
              <div className="text-sm">
                <p className="font-bold">50k+ Active Users</p>
                <p className="text-gray-500 font-medium">Trust berry for daily rewards</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative"
          >
            <div className="relative z-10">
              <img 
                src={heroImg} 
                alt="Isometric Illustration" 
                className="w-full h-auto"
                referrerPolicy="no-referrer"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-32 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-kinetic-berry/10 text-kinetic-berry text-xs font-bold tracking-wide uppercase">
              Features
            </div>
            <h3 className="text-6xl font-extrabold tracking-tighter text-black">Simple & Straightforward <br />Process!</h3>
          </div>

          <div className="grid md:grid-cols-4 gap-12">
            {[
              { step: "01", title: "Download App", desc: "Get the berry app from your favorite store." },
              { step: "02", title: "Create Profile", desc: "Tell us a bit about yourself to get relevant surveys." },
              { step: "03", title: "Answer Surveys", desc: "Share your honest opinions on various topics." },
              { step: "04", title: "Get Paid", desc: "Redeem your berries for cash or awesome rewards." }
            ].map((item, i) => (
              <div key={i} className="relative group p-8 bg-white rounded-3xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-4px] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all">
                <div className="text-5xl font-black text-kinetic-berry/20 mb-4">
                  {item.step}
                </div>
                <div className="space-y-2">
                  <h4 className="text-xl font-extrabold">{item.title}</h4>
                  <p className="text-gray-600 font-medium leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Consumers Section */}
      <section id="consumers" className="py-32 px-6 relative bg-white border-y-2 border-black z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-20">
            <h2 className="text-sm font-bold text-kinetic-berry uppercase tracking-[0.2em]">For Consumers</h2>
            <h3 className="text-6xl font-extrabold tracking-tighter text-black">Turn Your Opinions Into <span className="text-kinetic-berry">Gold</span></h3>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg font-medium">
              Your voice matters. Companies are willing to pay for your insights. berry makes it easy to connect and earn.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Smartphone,
                title: "Easy to Use",
                desc: "Download the app and start answering surveys in minutes. No complex setup required."
              },
              {
                icon: Zap,
                title: "Instant Rewards",
                desc: "Get credited immediately after completing a survey. Withdraw to your bank account anytime."
              },
              {
                icon: ShieldCheck,
                title: "Privacy First",
                desc: "Your data is encrypted and anonymized. We never share your personal information without consent."
              }
            ].map((feature, i) => (
              <div key={i} className="bg-kinetic-cream border-2 border-black p-8 rounded-[2.5rem] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group">
                <div className="w-14 h-14 bg-kinetic-berry rounded-2xl flex items-center justify-center text-white mb-6 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover:scale-110 transition-transform">
                  <feature.icon size={28} />
                </div>
                <h4 className="text-xl font-extrabold mb-4">{feature.title}</h4>
                <p className="text-gray-600 font-medium leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Businesses Section */}
      <section id="businesses" className="py-32 px-6 relative overflow-hidden z-10">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <div className="order-2 lg:order-1">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="bg-white border-2 border-black p-6 rounded-3xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <BarChart3 className="text-kinetic-berry mb-4" size={32} />
                  <h5 className="font-extrabold mb-2">Real-time Data</h5>
                  <p className="text-sm text-gray-600 font-medium">Watch insights roll in as users complete your surveys.</p>
                </div>
                <div className="bg-white border-2 border-black p-6 rounded-3xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <Users className="text-kinetic-berry mb-4" size={32} />
                  <h5 className="font-extrabold mb-2">Targeted Audience</h5>
                  <p className="text-sm text-gray-600 font-medium">Reach the exact demographic you need for your research.</p>
                </div>
              </div>
              <div className="space-y-6 pt-12">
                <div className="bg-white border-2 border-black p-6 rounded-3xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <Globe className="text-kinetic-berry mb-4" size={32} />
                  <h5 className="font-extrabold mb-2">Global Reach</h5>
                  <p className="text-sm text-gray-600 font-medium">Conduct surveys across different regions and languages.</p>
                </div>
                <div className="bg-white border-2 border-black p-6 rounded-3xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <ShieldCheck className="text-kinetic-berry mb-4" size={32} />
                  <h5 className="font-extrabold mb-2">Quality Control</h5>
                  <p className="text-sm text-gray-600 font-medium">AI-powered verification ensures high-quality responses.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2 space-y-8">
            <h2 className="text-sm font-bold text-kinetic-berry uppercase tracking-[0.2em]">For Businesses</h2>
            <h3 className="text-6xl font-extrabold tracking-tighter leading-[0.9] text-black">Data-Driven Decisions <br />Made <span className="text-kinetic-berry">Simple</span></h3>
            <p className="text-xl text-gray-700 font-medium leading-relaxed">
              Get high-quality consumer insights in hours, not weeks. Our platform connects you with a verified audience ready to share their thoughts.
            </p>
            
            <ul className="space-y-4">
              {[
                "Custom survey builder with 20+ question types",
                "Advanced demographic targeting",
                "Automated data cleaning and analysis",
                "Export to CSV, Excel, or direct API integration"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-800 font-bold">
                  <div className="w-5 h-5 bg-kinetic-berry rounded-full flex items-center justify-center text-white border border-black">
                    <CheckCircle2 size={12} />
                  </div>
                  {item}
                </li>
              ))}
            </ul>

            <button className="btn-kinetic-white text-lg">
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section id="solutions" className="py-32 px-6 bg-white border-t-2 border-black z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
              <h2 className="text-sm font-bold text-kinetic-berry uppercase tracking-[0.2em]">Solutions</h2>
              <h3 className="text-6xl font-extrabold tracking-tighter leading-[0.9] text-black">Tailored Insights for <br />Every <span className="text-kinetic-berry">Industry</span></h3>
              <p className="text-xl text-gray-700 font-medium leading-relaxed">
                Whether you're a startup looking for product-market fit or a global enterprise tracking brand health, berry provides the tools you need.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-8">
                {[
                  { title: "Market Research", desc: "Understand trends and consumer behavior." },
                  { title: "Product Feedback", desc: "Test new features before launch." },
                  { title: "Brand Tracking", desc: "Monitor your brand's perception." },
                  { title: "Customer Satisfaction", desc: "Measure and improve loyalty." }
                ].map((sol, i) => (
                  <div key={i} className="space-y-2 p-4 bg-kinetic-cream border-2 border-black rounded-2xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <h5 className="font-extrabold text-lg">{sol.title}</h5>
                    <p className="text-sm text-gray-600 font-medium">{sol.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-square bg-kinetic-berry/5 rounded-[3rem] border-2 border-black flex items-center justify-center overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative">
                {/* Background Scribbles */}
                <motion.div 
                  animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-10 left-10 text-kinetic-berry/10"
                >
                  <Coins size={80} />
                </motion.div>
                <motion.div 
                  animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute bottom-10 right-10 text-kinetic-berry/10"
                >
                  <ClipboardList size={100} />
                </motion.div>
                <motion.div 
                  animate={{ x: [0, 15, 0], rotate: [0, 10, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                  className="absolute top-1/2 left-1/4 -translate-y-1/2 text-kinetic-berry/5"
                >
                  <CheckSquare size={120} />
                </motion.div>
                <motion.div 
                  animate={{ x: [0, -15, 0], rotate: [0, -10, 0] }}
                  transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  className="absolute top-1/4 right-1/4 text-kinetic-berry/5"
                >
                  <Wallet size={90} />
                </motion.div>

                <div className="relative z-10 grid grid-cols-2 gap-6 p-8 w-full">
                  {[
                    { val: 45, label: "Market Share" },
                    { val: 78, label: "User Retention" },
                    { val: 92, label: "Data Accuracy" },
                    { val: 64, label: "Campaign ROI" }
                  ].map((metric, i) => (
                    <div key={i} className="bg-white border-2 border-black p-8 rounded-3xl flex flex-col items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-4px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all group">
                      <span className="text-4xl font-black text-kinetic-berry group-hover:scale-110 transition-transform">{metric.val}%</span>
                      <span className="text-[10px] uppercase font-black text-gray-400 mt-1 tracking-widest">{metric.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 bg-kinetic-cream relative z-10">
        <div className="max-w-5xl mx-auto bg-kinetic-berry rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] border-4 border-black">
          <div className="relative z-10 space-y-8">
            <h2 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-white">Ready to start harvesting?</h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto font-medium">
              Download the berry app today and join the community of earners. Your first 500 Berry are waiting for you!
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
              <button 
                onClick={() => setView('onboarding')}
                className="w-full sm:w-auto bg-gradient-to-r from-white via-gray-100 to-white animate-gradient bg-size-200 text-black px-10 py-5 rounded-2xl font-black text-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] border-2 border-black hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-3"
              >
                <Apple size={28} />
                <span>App Store</span>
              </button>
              <button 
                onClick={() => setView('onboarding')}
                className="w-full sm:w-auto bg-gradient-to-r from-black via-gray-800 to-black animate-gradient bg-size-200 text-white px-10 py-5 rounded-2xl font-black text-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] border-2 border-white/20 hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-3"
              >
                <PlayCircle size={28} />
                <span>Google Play</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t-2 border-black bg-white">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 flex items-center justify-center">
                <img src={logoImg} alt="berry Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
              </div>
              <span className="text-2xl font-extrabold tracking-tighter">berry</span>
            </div>
            <p className="text-gray-600 text-sm font-medium leading-relaxed">
              The world's most rewarding survey platform. Empowering consumers and businesses through data.
            </p>
          </div>

          <div>
            <h6 className="font-extrabold mb-6 text-black">Platform</h6>
            <ul className="space-y-4 text-sm text-gray-500 font-bold">
              <li><a href="#" className="hover:text-kinetic-berry transition-colors">How it works</a></li>
              <li><a href="#" className="hover:text-kinetic-berry transition-colors">Rewards</a></li>
              <li><a href="#" className="hover:text-kinetic-berry transition-colors">Raffles</a></li>
              <li><a href="#" className="hover:text-kinetic-berry transition-colors">Referral Program</a></li>
            </ul>
          </div>

          <div>
            <h6 className="font-extrabold mb-6 text-black">Company</h6>
            <ul className="space-y-4 text-sm text-gray-500 font-bold">
              <li><a href="#" className="hover:text-kinetic-berry transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-kinetic-berry transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-kinetic-berry transition-colors">Press</a></li>
              <li><a href="#" className="hover:text-kinetic-berry transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h6 className="font-extrabold mb-6 text-black">Legal</h6>
            <ul className="space-y-4 text-sm text-gray-500 font-bold">
              <li><a href="#" className="hover:text-kinetic-berry transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-kinetic-berry transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-kinetic-berry transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto pt-20 mt-20 border-t-2 border-black flex flex-col md:row items-center justify-between gap-6 text-gray-500 text-xs font-bold">
          <p>© 2026 berry Technologies Inc. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-kinetic-berry transition-colors">Twitter</a>
            <a href="#" className="hover:text-kinetic-berry transition-colors">Instagram</a>
            <a href="#" className="hover:text-kinetic-berry transition-colors">LinkedIn</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
