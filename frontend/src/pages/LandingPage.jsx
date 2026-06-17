import React, { useState, useEffect } from 'react';
import { 
  Search, PlusCircle, ArrowRight, ShieldCheck, MapPin, 
  Archive, CheckCircle2, Fingerprint, Bell, Users, 
  ChevronRight, Lock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

const STEPS = [
  {
    n: '01',
    icon: <PlusCircle size={32} strokeWidth={1.5} />,
    title: 'Report an Item',
    desc: 'If you lost or found something, simply register it in the system. Add an image and details.',
  },
  {
    n: '02',
    icon: <Search size={32} strokeWidth={1.5} />,
    title: 'Smart Match',
    desc: 'Our Smart Match system automatically scans the database to match lost and found items.',
  },
  {
    n: '03',
    icon: <ShieldCheck size={32} strokeWidth={1.5} />,
    title: 'Secure Claiming',
    desc: 'Once an item is matched, a Verification Code is provided to ensure it is given to the right person.',
  },
];

const FEATURES = [
  { icon: <Archive size={24} />, label: 'Centralized Database', desc: 'A platform that gathers all lost and found data for easy reference.' },
  { icon: <Lock size={24} />, label: 'Secure Verification', desc: 'No item is handed over without going through the verification process.' },
  { icon: <Bell size={24} />, label: 'Instant Notifications', desc: 'You will receive an SMS/Email notification as soon as your item is found.' },
  { icon: <MapPin size={24} />, label: 'Location Tracking', desc: 'Items are sorted by the different sections of the park where they were lost.' },
];

const LandingPage = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-emerald-200 text-slate-900">
      
      {/* HERO SECTION */}
      <div className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-slate-900 pt-20 pb-24">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-teal-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute inset-0 bg-[url('/bg.png')] bg-cover bg-center opacity-30 mix-blend-overlay" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/90 to-slate-900" />
        </div>

        <div className={`relative z-10 text-center px-4 max-w-5xl mx-auto transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-md px-4 py-2 rounded-full mb-8 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold text-emerald-300 tracking-wider">Official BAAFIN System</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-8 tracking-tight leading-[1.1]">
            Don't Give Up On<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 filter drop-shadow-[0_0_30px_rgba(52,211,153,0.3)]">
              Your Lost Items
            </span>
          </h1>

          <p className="text-lg md:text-2xl text-slate-300 font-medium mb-12 max-w-3xl mx-auto leading-relaxed">
            A modern platform connecting people who lost items with those who found them. 
            <span className="text-emerald-400 font-semibold block mt-2">Report, Search, and Recover — securely.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
            <Link
              to="/add"
              className="group relative inline-flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-[0_0_40px_rgba(16,185,129,0.4)] hover:shadow-[0_0_60px_rgba(16,185,129,0.6)] hover:-translate-y-1 w-full sm:w-auto overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
              <span className="relative flex items-center gap-2"><PlusCircle size={22} /> Report Item</span>
            </Link>
            <Link
              to="/results"
              className="group inline-flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/20 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all hover:-translate-y-1 backdrop-blur-md w-full sm:w-auto"
            >
              <Search size={22} className="group-hover:text-emerald-400 transition-colors" /> View Records
            </Link>
          </div>
        </div>
        
        {/* Scroll Down Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce flex flex-col items-center gap-2 text-slate-400 opacity-70">
          <span className="text-xs font-bold uppercase tracking-widest">Details</span>
          <ChevronRight className="rotate-90" size={20} />
        </div>
      </div>

      {/* ABOUT THE SYSTEM */}
      <div className="py-24 px-6 max-w-7xl mx-auto relative z-10 bg-slate-50">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-lg text-sm font-bold mb-6">
              <ShieldCheck size={18} /> About The System
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">
              What is <span className="text-emerald-600">Baafin?</span>
            </h2>
            <p className="text-slate-600 text-lg leading-relaxed mb-6 font-medium">
              <b className="text-slate-900">Baafin</b> is a Digital Lost and Found system designed to solve the recurring problem of items getting lost in crowded public spaces.
            </p>
            <p className="text-slate-600 text-lg leading-relaxed mb-8">
              Instead of relying on manual searches or logbooks, this system makes it easy to register, match, and verify the rightful owner digitally.
            </p>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:-translate-y-1 transition-transform">
                <div className="text-3xl font-black text-emerald-600 mb-1">100%</div>
                <div className="text-sm text-slate-500 font-semibold">Highly Secure</div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:-translate-y-1 transition-transform">
                <div className="text-3xl font-black text-teal-600 mb-1">24/7</div>
                <div className="text-sm text-slate-500 font-semibold">Open Records</div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-3xl blur-2xl opacity-20 transform rotate-3 scale-105" />
            <div className="bg-slate-900 rounded-3xl p-8 relative border border-slate-700 shadow-2xl overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-xl rounded-full" />
              <div className="flex items-center gap-3 mb-8 border-b border-slate-800 pb-6">
                <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center">
                  <Fingerprint size={24} />
                </div>
                <div>
                  <h3 className="text-white font-bold text-xl">Owner Verification</h3>
                  <p className="text-slate-400 text-sm">Security System (Verification)</p>
                </div>
              </div>
              
              <ul className="space-y-5">
                {[
                  'Proof of item details (e.g. Model, Color)',
                  'Photo verification of ownership',
                  'Provision of a unique secret code',
                  'Management signature before handover'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-300">
                    <CheckCircle2 className="text-emerald-400 shrink-0 mt-0.5" size={20} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div className="py-24 px-6 bg-slate-900 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-900/20 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">How The System Works</h2>
            <p className="text-slate-400 text-lg">Three simple steps to recover what was lost.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

            {STEPS.map((s, i) => (
              <div key={i} className="relative group bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 hover:border-emerald-500/50 rounded-3xl p-8 hover:bg-slate-800 transition-all duration-300 hover:-translate-y-2 shadow-xl">
                <div className="absolute -top-6 -left-4 text-8xl font-black text-slate-700/20 group-hover:text-emerald-900/40 transition-colors z-0 pointer-events-none select-none">
                  {s.n}
                </div>
                
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform duration-300">
                    {s.icon}
                  </div>
                  <h3 className="text-2xl font-black text-white mb-4">{s.title}</h3>
                  <p className="text-slate-400 leading-relaxed text-base">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FEATURES STRIP */}
      <div className="py-24 px-6 bg-slate-50 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">Key Features</h2>
            <p className="text-slate-600 text-lg">Everything needed to manage lost items professionally.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-emerald-100 transition-all duration-300 group">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-5 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  {f.icon}
                </div>
                <h3 className="font-bold text-slate-900 mb-2 text-lg">{f.label}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-12 px-6 pb-24 bg-slate-50">
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/20 blur-[80px] rounded-full" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-teal-500/20 blur-[80px] rounded-full" />
          </div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/10 text-emerald-300 px-4 py-1.5 rounded-full text-sm font-bold mb-6 backdrop-blur-sm border border-white/10">
              <Users size={16} /> Join the system
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">
              Ready to get started?
            </h2>
            <p className="text-slate-300 font-medium mb-10 max-w-2xl mx-auto text-lg leading-relaxed">
              Join the Baafin community and be part of the solution. Help return lost items to their owners, or search for one you lost.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:-translate-y-1"
              >
                Create Account <ArrowRight size={20} />
              </Link>
              <Link
                to="/add"
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-900 px-8 py-4 rounded-xl font-bold text-lg transition-all hover:-translate-y-1"
              >
                I Lost Something
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default LandingPage;