import React, { useState } from 'react';
import { Menu, X, ArrowRight, Calendar } from 'lucide-react';
import { BrightloopLogo } from './BrightloopLogo';
import { AppPage } from './Sidebar';

interface PublicNavbarProps {
  currentPage: AppPage;
  onNavigate: (page: AppPage) => void;
}

export const PublicNavbar: React.FC<PublicNavbarProps> = ({
  currentPage,
  onNavigate,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks: { id: AppPage; label: string }[] = [
    { id: 'landing', label: 'Home' },
    { id: 'product', label: 'Product' },
    { id: 'solutions', label: 'Solutions' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'resources', label: 'Resources' },
  ];

  return (
    <nav className="bg-[#0B2E2B] text-white px-6 lg:px-12 py-3 border-b border-[#144743] sticky top-0 z-40 select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo & Desktop Nav Links */}
        <div className="flex items-center gap-8">
          <button
            onClick={() => onNavigate('landing')}
            className="focus:outline-hidden flex items-center"
            aria-label="Brightloop Home"
          >
            <BrightloopLogo variant="light" size="md" />
          </button>

          <div className="hidden md:flex items-center gap-6 text-xs font-medium text-[#B0D0CE]">
            {navLinks.map((link) => {
              const isActive = currentPage === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => onNavigate(link.id)}
                  className={`transition-colors py-1 ${
                    isActive
                      ? 'text-white font-semibold border-b-2 border-[#F4BA28]'
                      : 'hover:text-white'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right CTA Actions: Log In & Book a Demo */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => onNavigate('login')}
            className="text-xs font-medium text-white hover:text-[#F4BA28] transition-colors px-2 py-1"
          >
            Log In
          </button>
          <button
            onClick={() => onNavigate('book-demo')}
            className="px-3.5 py-1.5 bg-[#F4BA28] text-slate-950 rounded text-xs font-semibold hover:bg-[#E5A817] transition-colors shadow-2xs flex items-center gap-1.5"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-950" />
            <span>Book a Demo</span>
          </button>
        </div>

        {/* Mobile menu toggle */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-[#B0D0CE] hover:text-white focus:outline-hidden"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="dropdown-enter md:hidden pt-3 pb-2 border-t border-[#144743] mt-3 space-y-1 text-xs">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                onNavigate(link.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded transition-colors ${
                currentPage === link.id
                  ? 'bg-[#154442] text-white font-semibold'
                  : 'text-[#B0D0CE] hover:bg-[#113A36] hover:text-white'
              }`}
            >
              {link.label}
            </button>
          ))}
          <div className="pt-2 border-t border-[#144743] flex flex-col gap-2 px-1">
            <button
              onClick={() => {
                onNavigate('login');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-[#B0D0CE] hover:text-white"
            >
              Log In
            </button>
            <button
              onClick={() => {
                onNavigate('book-demo');
                setMobileMenuOpen(false);
              }}
              className="w-full py-2 bg-[#F4BA28] text-slate-950 rounded font-semibold text-center"
            >
              Book a Demo
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
