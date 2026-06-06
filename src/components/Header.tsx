import React, { useLayoutEffect, useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaPhone, FaMapMarkerAlt, FaBars, FaTimes } from 'react-icons/fa';
import { withBasePath } from '@/lib/utils';

interface Company {
  name: string;
  address: string;
  phone: string;
}

interface HeaderProps {
  company: Company;
  bottomContent?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ company, bottomContent }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPortalReady, setIsPortalReady] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);
  const lastHeaderHeightRef = useRef(0);
  const location = useLocation();
  const navigate = useNavigate();

  useLayoutEffect(() => {
    const update = () => {
      const height = headerRef.current?.offsetHeight ?? 0;
      if (height > 0) lastHeaderHeightRef.current = height;
      const finalHeight = lastHeaderHeightRef.current || height;
      document.documentElement.style.setProperty('--header-height', `${finalHeight}px`);
    };

    update();
    window.addEventListener('resize', update);
    // Create a ResizeObserver to handle height changes from bottomContent
    const resizeObserver = new ResizeObserver(update);
    if (headerRef.current) {
      resizeObserver.observe(headerRef.current);
    }
    
    return () => {
      window.removeEventListener('resize', update);
      resizeObserver.disconnect();
    };
  }, [isScrolled, isMobileMenuOpen, bottomContent]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsPortalReady(true);
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const mql = window.matchMedia('(max-width: 1023px)');
    if (!mql.matches) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isMobileMenuOpen]);

  const navItems = [
    { href: '#services', label: 'Послуги' },
    { href: '/brands', label: 'Бренди' },
    { href: '#prices', label: 'Ціни' },
    { href: '#location', label: 'Розташування' },
    { href: '#contact', label: 'Контакти' },
  ];

  const scrollToSection = (href: string) => {
    if (href.startsWith('/')) {
      navigate(href);
      return;
    }

    if (location.pathname !== '/') {
      navigate('/' + href);
      return;
    }

    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const openMobileMenu = () => {
    setIsMobileMenuOpen(true);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header
      ref={headerRef}
      className={`fixed top-0 left-0 right-0 z-[9999] transition-all duration-300 ${
        isScrolled
          ? 'bg-white/90 backdrop-blur-md shadow-md py-1.5'
          : 'bg-white/70 backdrop-blur-sm py-2.5'
      }`}
      style={{ position: 'fixed', top: 0, left: 0, right: 0 }}
    >
      <div className="container mx-auto px-4">
        {/* Top bar with contact info */}
        <div className="hidden md:flex justify-between items-center py-1.5 text-sm border-b border-primary-200/20">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 text-neutral-600">
              <FaMapMarkerAlt className="text-accent-500" />
              <span>{company.address}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-neutral-600">
            <FaPhone className="text-accent-500" />
            <span className="font-semibold">{company.phone}</span>
          </div>
        </div>

        {/* Main navigation */}
        <div className="flex items-center justify-between py-2.5">
          <div className="flex items-center space-x-3">
            <img 
              src={withBasePath('/images/logo.webp?v=1')} 
              alt="Техноплюс Логотип" 
              className="w-12 h-12 object-contain"
            />
            <div>
              <div className="text-xl font-bold text-neutral-800">{company.name}</div>
              <p className="text-sm text-neutral-600 hidden sm:block">Професійний ремонт техніки</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => scrollToSection(item.href)}
                className="text-neutral-700 hover:text-primary-600 font-medium transition-colors duration-300 relative group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-neutral-600 to-accent-500 transition-all duration-300 group-hover:w-full"></span>
              </button>
            ))}
          </nav>

          {/* Call to Action Button */}
          <a
            href={`tel:${company.phone.replace(/[-\s]/g, '')}`}
            className="hidden md:flex items-center space-x-2 bg-gradient-to-r from-accent-500 to-accent-600 text-white px-6 py-2.5 rounded-full font-semibold hover:from-accent-600 hover:to-accent-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <FaPhone />
            <span>Зателефонувати</span>
          </a>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={openMobileMenu}
            className="lg:hidden p-2 text-neutral-700 hover:text-primary-600 transition-colors"
          >
            {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        {isPortalReady &&
          isMobileMenuOpen &&
          createPortal(
            <div
              className="fixed inset-0 z-[9999] lg:hidden"
            >
              <div
                className="absolute inset-0 bg-black/35 backdrop-blur-[2px]"
                onClick={closeMobileMenu}
              />

              <div
                onClick={(event) => event.stopPropagation()}
                className="absolute inset-0 overflow-auto bg-white/95"
              >
                <div className="container mx-auto px-4 pt-4 pb-6">
                  <div className="flex items-center justify-end">
                    <button
                      onClick={closeMobileMenu}
                      className="p-2 text-neutral-700 hover:text-primary-600 transition-colors"
                    >
                      <FaTimes size={24} />
                    </button>
                  </div>
                  <nav className="flex flex-col space-y-4">
                    {navItems.map((item) => (
                      <button
                        key={item.href}
                        onClick={() => {
                          closeMobileMenu();
                          scrollToSection(item.href);
                        }}
                        className="text-left text-neutral-800 hover:text-primary-600 font-semibold py-2 transition-colors"
                      >
                        {item.label}
                      </button>
                    ))}
                    <a
                      href={`tel:${company.phone.replace(/[-\s]/g, '')}`}
                      className="flex items-center space-x-2 bg-gradient-to-r from-accent-500 to-accent-600 text-white px-4 py-3 rounded-full font-semibold mt-2 w-fit"
                    >
                      <FaPhone />
                      <span>Зателефонувати</span>
                    </a>
                  </nav>
                </div>
              </div>
            </div>,
            document.body
          )}
      </div>
      {bottomContent}
    </header>
  );
};

export default Header;
