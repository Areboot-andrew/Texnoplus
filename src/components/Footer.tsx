import React from 'react';
import { FaPhone, FaMapMarkerAlt, FaClock, FaHeart, FaArrowUp } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';
import { withBasePath } from '@/lib/utils';

interface Company {
  name: string;
  address: string;
  phone: string;
}

interface SocialLink {
  name: string;
  url: string;
  icon: string;
  color: string;
}

interface FooterProps {
  company: Company;
  socialLinks: SocialLink[];
}

const Footer: React.FC<FooterProps> = ({ company, socialLinks }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  const quickLinks = [
    { label: 'Послуги', href: '#services' },
    { label: 'Бренди', href: '/brands' },
    { label: 'Ціни', href: '#prices' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Контакти', href: '/contact' },
  ];

  const serviceCategories = [
    'Телефони та смартфони',
    'Ноутбуки та комп\'ютери',
    'Планшети',
    'Телевізори',
    'Портативні колонки',
    'Навушники',
    'Побутова техніка',
    'Кавові апарати',
    'Зарядні станції'
  ];

  return (
    <footer className="bg-gradient-to-b from-neutral-800 to-neutral-900 text-white">
      {/* Main footer content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Company info */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <img 
                src={withBasePath('/images/logo.webp?v=1')} 
                alt={company.name} 
                className="w-12 h-12 object-contain bg-white rounded-lg p-1"
              />
              <div>
                <h3 className="text-xl font-bold">{company.name}</h3>
                <p className="text-neutral-400 text-sm">Професійний ремонт техніки</p>
              </div>
            </div>
            
            <p className="text-neutral-300 mb-6 leading-relaxed">
              Надаємо якісні послуги з ремонту електроніки та побутової техніки у Львові. 
              Досвід роботи понад 15 років, гарантія на всі види робіт.
            </p>

            {/* Contact info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <FaPhone className="text-accent-400 flex-shrink-0" />
                <a 
                  href={`tel:${company.phone.replace(/[-\s]/g, '')}`}
                  className="text-neutral-300 hover:text-white transition-colors"
                >
                  {company.phone}
                </a>
              </div>
              
              <div className="flex items-start space-x-3">
                <FaMapMarkerAlt className="text-accent-400 flex-shrink-0 mt-1" />
                <span className="text-neutral-300">{company.address}</span>
              </div>
              
              <div className="flex items-start space-x-3">
                <FaClock className="text-accent-400 flex-shrink-0 mt-1" />
                <div className="text-neutral-300 text-sm">
                  <p>Пн-Пт: 11:00 - 18:00</p>
                  <p>Сб: 11:30 - 16:00</p>
                  <p>Нд: Вихідний</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div className="lg:col-span-1">
            <h4 className="text-lg font-bold mb-6">Швидкі посилання</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="text-neutral-300 hover:text-white hover:translate-x-2 transition-all duration-300 flex items-center"
                  >
                    <span className="w-2 h-2 bg-accent-500 rounded-full mr-3"></span>
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="lg:col-span-1">
            <h4 className="text-lg font-bold mb-6">Наші послуги</h4>
            <ul className="space-y-2">
              {serviceCategories.map((service, index) => (
                <li key={index} className="text-neutral-300 text-sm hover:text-white transition-colors cursor-pointer">
                  {service}
                </li>
              ))}
            </ul>
          </div>

          {/* Social & Newsletter */}
          <div className="lg:col-span-1">
            <h4 className="text-lg font-bold mb-6">Слідкуйте за нами</h4>
            
            <div className="flex space-x-4 mb-6">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-10 h-10 bg-neutral-700 rounded-xl flex items-center justify-center text-neutral-300 transition-all duration-300 hover:scale-[1.05] active:scale-95 ${social.color}`}
                >
                  <img src={withBasePath(social.icon)} alt={social.name} className="w-5 h-5" />
                </a>
              ))}
            </div>

            <div className="bg-neutral-700/50 rounded-lg p-4">
              <h5 className="font-semibold mb-2">Потрібна консультація?</h5>
              <p className="text-neutral-300 text-sm mb-3">
                Зателефонуйте нам або залиште заявку на сайті
              </p>
              <button
                onClick={() => scrollToSection('/contact')}
                className="bg-gradient-to-r from-neutral-600 to-accent-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:from-neutral-700 hover:to-accent-600 transition-all duration-300 w-full hover:scale-[1.02] active:scale-95 shadow-md hover:shadow-accent-500/20"
              >
                Залишити заявку
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-neutral-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-neutral-400 text-sm mb-4 md:mb-0">
              <p className="flex items-center">
                © 2025 {company.name}. Всі права захищені. 
                <span className="mx-2">Створено з</span>
                <FaHeart className="text-red-500 mx-1" />
                <span>у Львові</span>
              </p>
            </div>
            
            <button
              onClick={scrollToTop}
              className="bg-gradient-to-r from-neutral-600 to-accent-500 text-white w-10 h-10 rounded-xl flex items-center justify-center hover:from-neutral-700 hover:to-accent-600 transition-all duration-300 hover:scale-[1.1] active:scale-95 shadow-lg shadow-accent-500/20"
              aria-label="Наверх"
            >
              <FaArrowUp />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
