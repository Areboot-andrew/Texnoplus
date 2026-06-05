import React from 'react';
import { FaPhone, FaMapMarkerAlt, FaCogs, FaShieldAlt, FaClock, FaThumbsUp } from 'react-icons/fa';
import { withBasePath } from '@/lib/utils';
import ParallaxSection from './ParallaxSection';
import Reveal from './Reveal';

interface Company {
  name: string;
  address: string;
  phone: string;
}

interface HeroProps {
  company: Company;
}

const Hero: React.FC<HeroProps> = ({ company }) => {
  const features = [
    {
      icon: <FaCogs className="text-2xl" />,
      title: 'Професійний ремонт',
      description: 'Майстри з багаторічним досвідом'
    },
    {
      icon: <FaShieldAlt className="text-2xl" />,
      title: 'Гарантія якості',
      description: 'Гарантія на всі види робіт та запчастини'
    },
    {
      icon: <FaClock className="text-2xl" />,
      title: 'Швидко та надійно',
      description: 'Оперативна діагностика та ремонт'
    },
    {
      icon: <FaThumbsUp className="text-2xl" />,
      title: 'Доступні ціни',
      description: 'Справедливі ціни без переплат'
    }
  ];

  const scrollToSection = (sectionId: string) => {
    const element = document.querySelector(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <ParallaxSection
      className="min-h-screen flex items-center justify-center overflow-hidden pt-20 lg:pt-32"
      backgroundImage="/images/service-center.jpg"
      overlayClassName="bg-gradient-to-br from-primary-50/95 via-white/95 to-accent-50/95"
    >
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <Reveal className="text-center lg:text-left">
            <h1 className="text-4xl lg:text-6xl font-bold text-neutral-800 mb-4 leading-tight">
              Сервісний центр{' '}
              <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                "Техноплюс"
              </span>
            </h1>

            <p className="text-xl lg:text-2xl font-medium text-neutral-800 mb-4">
              Професійний ремонт та обслуговування техніки у Львові.
            </p>

            <p className="text-lg lg:text-xl text-neutral-600 mb-8 leading-relaxed">
              Ремонтуємо кавові апарати, телефони, навушники та портативні колонки. Проводимо чистку і профілактику ноутбуків, а також повний апгрейд ПК. Швидка діагностика та надійна гарантія на всі роботи.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button
                onClick={() => scrollToSection('#contact')}
                className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:from-primary-600 hover:to-primary-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Отримати консультацію
              </button>
              <a
                href={`tel:${company.phone.replace(/[-\s]/g, '')}`}
                className="bg-gradient-to-r from-accent-500 to-accent-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:from-accent-600 hover:to-accent-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center space-x-2"
              >
                <FaPhone />
                <span>Зателефонувати</span>
              </a>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 text-sm text-neutral-600">
              <div className="flex items-center space-x-2">
                <FaMapMarkerAlt className="text-accent-500" />
                <span>{company.address}</span>
              </div>
              <div className="flex items-center space-x-2">
                <FaPhone className="text-accent-500" />
                <span className="font-semibold">{company.phone}</span>
              </div>
            </div>
          </Reveal>

          {/* Right content - Hero image */}
          <Reveal delayMs={160} className="relative">
            <div className="relative">
              <img
                src={withBasePath('/images/service-hero.jpg')}
                alt="Сервісний центр Техноплюс"
                className="w-full h-auto rounded-2xl shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-600/20 to-transparent rounded-2xl"></div>
            </div>
          </Reveal>
        </div>

        {/* Features grid */}
        <Reveal delayMs={240} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white/80 md:backdrop-blur-sm rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-primary-100/50"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white mx-auto mb-4">
                {feature.icon}
              </div>
              <h3 className="font-semibold text-neutral-800 mb-2">{feature.title}</h3>
              <p className="text-sm text-neutral-600">{feature.description}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </ParallaxSection>
  );
};

export default Hero;
