import React from 'react';
import { Link } from 'react-router-dom';
import { FaChevronRight, FaTools, FaCheckCircle } from 'react-icons/fa';
import { withBasePath } from '@/lib/utils';
import ParallaxSection from './ParallaxSection';
import Reveal from './Reveal';

interface Service {
  name: string;
  price: string;
}

interface Category {
  id: string;
  title: string;
  description: string;
  image: string;
  icon: string;
  brands: Array<{ name: string; logo: string }>;
  services: Service[];
  problems: string[];
}

interface ServicesProps {
  categories: Category[];
}

const serviceKeywordByCategory: Record<string, string> = {
  speakers: 'колонок',
  phones: 'телефонів',
  tvs: 'телевізорів',
  appliances: 'побутової техніки',
  computers: 'ноутбуків і компʼютерів',
  headphones: 'навушників',
  'power-stations': 'зарядних станцій',
  'coffee-machines': 'кавомашин',
  'pc-assembly': 'компʼютерів',
};

const Services: React.FC<ServicesProps> = ({ categories }) => {
  return (
    <ParallaxSection
      id="services"
      className="py-16 lg:py-24"
      backgroundImage="/images/repair-work.webp"
      overlayClassName="bg-gradient-to-b from-primary-50/95 via-white/95 to-white/95"
    >
      <div className="container mx-auto px-4">
        <Reveal className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <FaTools />
            <span>Наші послуги</span>
          </div>

          <h2 className="text-3xl lg:text-5xl font-bold text-neutral-800 mb-6">
            Професійний ремонт{' '}
            <span className="bg-gradient-to-r from-neutral-700 to-accent-600 bg-clip-text text-transparent">
              усіх видів техніки
            </span>
          </h2>

          <p className="text-lg text-neutral-600 max-w-3xl mx-auto">
            Ми ремонтуємо широкий спектр електроніки та побутової техніки з гарантією якості та доступними цінами
          </p>
        </Reveal>

        <Reveal delayMs={140}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <Reveal key={category.id} delayMs={index * 100} className="h-full">
              <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] border border-primary-100/50 h-full flex flex-col">
                <Link to={`/service/${category.id}`} className="block h-full flex flex-col">
                  {/* Image */}
                  <div className="relative aspect-square overflow-hidden flex-shrink-0 bg-neutral-100">
                    <img
                      src={withBasePath(category.image)}
                      alt={category.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute top-4 left-4 w-12 h-12 bg-white/90 md:backdrop-blur-sm rounded-full flex items-center justify-center text-2xl">
                      {category.icon}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="font-bold text-lg text-neutral-800 mb-2 group-hover:text-primary-600 transition-colors">
                      {category.title}
                    </h3>
                    <p className="text-neutral-600 text-sm mb-4 line-clamp-2 flex-grow">
                      {category.description}
                    </p>

                    <p className="text-sm text-neutral-500 mb-4">
                      Ремонт {serviceKeywordByCategory[category.id] || 'техніки'}{' '}
                      {category.brands.slice(0, 3).map((brand) => brand.name).join(', ')} у Львові
                    </p>

                    {/* Quick info */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-neutral-600">
                        <FaCheckCircle className="text-green-500 mr-2 flex-shrink-0" />
                        <span>{category.services.length} видів ремонту</span>
                      </div>
                      <div className="flex items-center text-sm text-neutral-600">
                        <FaCheckCircle className="text-green-500 mr-2 flex-shrink-0" />
                        <span>{category.brands.length}+ брендів</span>
                      </div>
                    </div>

                    {/* Action button */}
                    <div className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 px-4 rounded-xl font-medium hover:from-primary-600 hover:to-primary-700 transition-all duration-300 flex items-center justify-center space-x-2 shadow-sm hover:shadow-primary-500/20 hover:scale-[1.02] active:scale-95">
                      <span>Детальніше</span>
                      <FaChevronRight className="transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              </div>
            </Reveal>
          ))}
          </div>
        </Reveal>

        <Reveal delayMs={220} className="text-center mt-12 mb-8 lg:mb-0">
          <p className="text-neutral-600 mb-6">
            Не знайшли свій пристрій? Зателефонуйте нам для консультації!
          </p>
          <Link
            to="/contact"
            className="bg-gradient-to-r from-accent-500 to-accent-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-accent-600 hover:to-accent-700 transition-all duration-300 shadow-lg shadow-accent-500/20 hover:shadow-accent-500/40 hover:scale-[1.02] active:scale-95 inline-block"
          >
            Отримати консультацію
          </Link>
        </Reveal>
      </div>
    </ParallaxSection>
  );
};

export default Services;
