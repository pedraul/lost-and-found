'use client';

import { useAuth } from '../context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LogOut, Menu, Moon, Sun, X } from 'lucide-react';
import { getImageUrl } from '../utils/image-url';
import { usePreferences } from '../context/PreferencesContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { language, setLanguage, theme, setTheme } = usePreferences();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const labels = {
    en: { about: 'About Us', contact: 'Contact', login: 'Login', signUp: 'Sign Up', language: 'Language', light: 'Switch to light mode', dark: 'Switch to dark mode' },
    fr: { about: 'À propos', contact: 'Contact', login: 'Connexion', signUp: 'Créer un compte', language: 'Langue', light: 'Passer au thème clair', dark: 'Passer au thème sombre' },
    rw: { about: 'Ibyerekeye', contact: 'Twandikire', login: 'Injira', signUp: 'Iyandikishe', language: 'Ururimi', light: 'Koresha isura y’urumuri', dark: 'Koresha isura y’umwijima' },
  }[language];

  const preferenceControls = (placement) => (
    <>
      <label className="sr-only" htmlFor={`site-language-${placement}`}>{labels.language}</label>
      <select
        id={`site-language-${placement}`}
        value={language}
        onChange={(event) => setLanguage(event.target.value)}
        className="h-10 w-32 rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
      >
        <option value="en">English</option>
        <option value="fr">Français</option>
        <option value="rw">Kinyarwanda</option>
      </select>
      <button
        type="button"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        aria-label={theme === 'dark' ? labels.light : labels.dark}
        title={theme === 'dark' ? labels.light : labels.dark}
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-400"
      >
        {theme === 'dark' ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
      </button>
    </>
  );

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-200/80 bg-[#f8f9f7]/95 shadow-sm backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="flex items-center space-x-2 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#10233f] shadow-sm">
                <span className="text-lg font-bold text-[#ff9277]">🔍</span>
              </div>
              <h1 className="hidden text-lg font-black tracking-tight text-[#10233f] transition-colors group-hover:text-[#f46b4f] sm:block">
                Lost & Found
              </h1>
            </a>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            <div className="mr-2 flex items-center gap-2">{preferenceControls('desktop')}</div>
            <a
              href="/about"
              className="text-gray-700 hover:text-orange-600 px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              {labels.about}
            </a>
            <a
              href="/contact"
              className="text-gray-700 hover:text-orange-600 px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              {labels.contact}
            </a>
            {user && pathname !== '/' ? (
              <>
                <div className="border-l border-gray-300 mx-2 h-6"></div>
                <div className="flex min-w-0 items-center space-x-3">
                  <button type="button" onClick={() => router.push('/account/settings')} className="rounded-full ring-offset-2 transition hover:ring-2 hover:ring-orange-400" title="Account settings">
                    {user.avatar_url ? <img src={getImageUrl(user.avatar_url)} alt="Profile" className="h-8 w-8 rounded-full object-cover" /> : <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#10233f] text-sm font-bold text-white">{user.full_name?.charAt(0)?.toUpperCase() || 'U'}</span>}
                  </button>
                  <button
                    onClick={handleLogout}
                    aria-label="Log out"
                    title="Log out"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
                  >
                    <LogOut size={16} aria-hidden="true" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <a
                  href="/login"
                  className="text-gray-700 hover:text-orange-600 px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
                >
                  {labels.login}
                </a>
                <a
                  href="/register"
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full text-sm font-bold transition-all shadow-sm hover:shadow-md"
                >
                  {labels.signUp}
                </a>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            {preferenceControls('mobile')}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation-menu"
              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-all"
            >
              {mobileMenuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div id="mobile-navigation-menu" className="space-y-2 border-t border-gray-200 pb-4 pt-2 md:hidden">
            <a
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="text-gray-700 hover:text-orange-600 hover:bg-orange-50 px-4 py-3 rounded-lg text-sm font-semibold transition-all block"
            >
              {labels.about}
            </a>
            <a
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="text-gray-700 hover:text-orange-600 hover:bg-orange-50 px-4 py-3 rounded-lg text-sm font-semibold transition-all block"
            >
              {labels.contact}
            </a>
            {user ? (
              <>
                <div className="border-t border-gray-200 my-2"></div>
                <div className="flex items-center gap-3 px-4 py-2">
                <button type="button" onClick={() => { setMobileMenuOpen(false); router.push('/account/settings'); }} className="flex h-11 w-11 items-center justify-center rounded-full ring-offset-2 transition hover:ring-2 hover:ring-orange-400" title="Account settings" aria-label="Account settings">
                  {user.avatar_url ? <img src={getImageUrl(user.avatar_url)} alt="Profile" className="h-10 w-10 rounded-full object-cover" /> : <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#10233f] text-sm font-bold text-white">{user.full_name?.charAt(0)?.toUpperCase() || 'U'}</span>}
                </button>
                <button
                  onClick={handleLogout}
                  aria-label="Log out"
                  title="Log out"
                  className="flex h-11 w-11 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-700 transition hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
                >
                  <LogOut size={17} aria-hidden="true" />
                </button>
                </div>
              </>
            ) : (
              <div className="space-y-2 px-2 py-3 border-t border-gray-200 mt-2">
                <a
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-700 hover:text-orange-600 hover:bg-orange-50 px-4 py-3 rounded-lg text-sm font-semibold transition-all block text-center"
                >
                  {labels.login}
                </a>
                <a
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 rounded-lg text-sm font-bold transition-all block text-center"
                >
                  {labels.signUp}
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

