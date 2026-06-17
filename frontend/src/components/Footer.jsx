import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Github, Search } from 'lucide-react';

const Footer = () => {
  const t = (key) => {
    const map = {
      brand: 'BAAFIN',
      footer_description: 'We help park visitors recover lost belongings quickly and securely. Join the community and make recovery simple.',
      explore: 'Explore',
      dashboard: 'Dashboard',
      report_item: 'Report Item',
      search_center: 'Search Center',
      how_it_works: 'How it Works',
      support: 'Support',
      help_center: 'Help Center',
      privacy_policy: 'Privacy Policy',
      terms: 'Terms',
      trust: 'Trust',
      contact_and_updates: 'Contact & Updates',
      address: 'Daarusalaam Park, Mogadishu',
      contact: 'Contact',
      made_with_love: 'Made with ❤ by the community'
    };
    return map[key] || key;
  };

  return (
    <footer className="bg-gradient-to-r from-emerald-900 via-slate-900 to-[#071014] text-gray-200 py-16 border-t border-[#0f2e1a]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 items-start">
          {/* Brand + About */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-4 mb-4 bg-white p-3 rounded-2xl w-max shadow-lg shadow-emerald-900/20">
              <img src="/logo.png" alt="Baafin Logo" className="h-14 w-auto" />
            </div>

            <p className="text-gray-300 leading-relaxed mb-6 text-sm">{t('footer_description')}</p>

            <div className="flex items-center gap-3 mt-2">
              <a href="https://facebook.com" aria-label="Facebook" target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-full bg-white/5 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all duration-300 shadow-sm">
                <Facebook size={18} />
              </a>
              <a href="https://twitter.com" aria-label="Twitter" target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-full bg-white/5 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all duration-300 shadow-sm">
                <Twitter size={18} />
              </a>
              <a href="https://instagram.com" aria-label="Instagram" target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-full bg-white/5 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all duration-300 shadow-sm">
                <Instagram size={18} />
              </a>
              <a href="https://github.com" aria-label="Github" target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-full bg-white/5 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all duration-300 shadow-sm">
                <Github size={18} />
              </a>
            </div>
          </div>

          {/* Links */}
          <div className="hidden md:block">
            <h3 className="text-white font-bold text-lg mb-6 uppercase tracking-wider">{t('explore')}</h3>
            <ul className="space-y-3 font-medium text-sm">
              <li><Link to="/" className="hover:text-emerald-300 transition-colors">{t('dashboard')}</Link></li>
              <li><Link to="/add" className="hover:text-emerald-300 transition-colors">{t('report_item')}</Link></li>
              <li><Link to="/results" className="hover:text-emerald-300 transition-colors">{t('search_center')}</Link></li>
              <li><Link to="/landing" className="hover:text-emerald-300 transition-colors">{t('how_it_works')}</Link></li>
            </ul>
          </div>

          <div className="hidden md:block">
            <h3 className="text-white font-bold text-lg mb-6 uppercase tracking-wider">{t('support')}</h3>
            <ul className="space-y-3 font-medium text-sm">
              <li><a href="#" className="hover:text-emerald-300 transition-colors">{t('help_center')}</a></li>
              <li><a href="#" className="hover:text-emerald-300 transition-colors">{t('privacy_policy')}</a></li>
              <li><a href="#" className="hover:text-emerald-300 transition-colors">{t('terms')}</a></li>
              <li><a href="#" className="hover:text-emerald-300 transition-colors">{t('trust')}</a></li>
            </ul>
          </div>

          {/* Contact & Newsletter (prominent) */}
          <div className="md:col-span-1">
            <h3 className="text-white font-bold text-lg mb-4 uppercase tracking-wider">{t('contact_and_updates')}</h3>

            <div className="bg-white/5 p-4 rounded-2xl border border-white/6 mb-4">
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3"><MapPin className="text-emerald-400 mt-1" size={18} /><span>{t('address')}</span></li>
                <li className="flex items-center gap-3"><Phone className="text-emerald-400" size={18} /><a href="tel:+252610000000" className="hover:text-emerald-300">+252 61 0000000</a></li>
                <li className="flex items-center gap-3"><Mail className="text-emerald-400" size={18} /><a href="mailto:support@baafin.so" className="hover:text-emerald-300">support@baafin.so</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/6 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-sm text-gray-300">© {new Date().getFullYear()} {t('brand')} — Built for Daarusalaam Park.</p>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <Link to="/contact" className="hover:text-emerald-300">{t('contact')}</Link>
            <Link to="/report" className="hover:text-emerald-300">Report Issue</Link>
            <span className="hidden md:inline">•</span>
            <span className="text-xs text-gray-500">{t('made_with_love')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
