import React, { useMemo, useState } from 'react';
import { FaStar } from 'react-icons/fa';
import { withBasePath } from '@/lib/utils';
import ParallaxSection from './ParallaxSection';
import Reveal from './Reveal';

interface Brand {
  name: string;
  logo: string;
}

interface Category {
  id: string;
  title: string;
  brands: Brand[];
}

interface BrandsGalleryProps {
  categories: Category[];
}

const photoLikeLogoFiles = new Set([
  '/images/brands/apple_5.webp',
  '/images/brands/apple_6.webp',
  '/images/brands/apple_7.webp',
  '/images/brands/anker.webp',
  '/images/brands/asus.webp',
  '/images/brands/hp.webp',
  '/images/brands/jackery.webp',
  '/images/brands/samsung.webp',
  '/images/brands/sony.webp',
  '/images/brands/xiaomi.webp',
]);

const BrandsGallery: React.FC<BrandsGalleryProps> = ({ categories }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const shouldUseTextLogo = (logo: string) => !logo || /^(https?:)?\/\//.test(logo) || photoLikeLogoFiles.has(logo);

  const uniqueBrands = useMemo(() => {
    const allBrands = categories.flatMap((cat) => cat.brands || []);
    const map = new Map<string, Brand>();
    for (const brand of allBrands) {
      if (!map.has(brand.name)) map.set(brand.name, brand);
    }
    return Array.from(map.values());
  }, [categories]);

  const brandsToRender = useMemo(() => {
    if (selectedCategory === 'all') return uniqueBrands;
    return categories.find((cat) => cat.id === selectedCategory)?.brands || [];
  }, [categories, selectedCategory, uniqueBrands]);

  return (
    <ParallaxSection
      id="brands"
      className="py-16 lg:py-24"
      backgroundImage="/images/repair-work.webp"
      overlayClassName="bg-gradient-to-b from-white/95 via-white/95 to-accent-50/95"
    >
      <div className="container mx-auto px-4">
        <Reveal className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-accent-100 text-accent-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <FaStar />
            <span>Бренди</span>
          </div>

          <h2 className="text-3xl lg:text-5xl font-bold text-neutral-800 mb-6">
            Ремонт техніки{' '}
            <span className="bg-gradient-to-r from-neutral-700 to-accent-600 bg-clip-text text-transparent">
              Apple, Samsung, JBL, Marshall, Bose та інших брендів
            </span>
          </h2>

          <p className="text-lg text-neutral-600 max-w-3xl mx-auto">
            Сервісний центр "Техноплюс" — надійний ремонт смартфонів, ноутбуків, телевізорів, портативних колонок, навушників, кавомашин та дрібної побутової техніки популярних брендів у Львові.
          </p>
        </Reveal>

        <Reveal delayMs={100} className="flex flex-wrap justify-center gap-2 mb-10">
          <button
            onClick={() => setSelectedCategory('all')}
            className={selectedCategory === 'all'
              ? 'px-6 py-3 rounded-xl font-medium transition-all duration-300 bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/20 hover:scale-[1.02] active:scale-95'
              : 'px-6 py-3 rounded-xl font-medium transition-all duration-300 bg-white text-neutral-600 hover:bg-neutral-50 hover:text-primary-600 border border-neutral-200 hover:border-primary-200 hover:scale-[1.02] active:scale-95'}
          >
            Всі бренди
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={selectedCategory === category.id
                ? 'px-6 py-3 rounded-xl font-medium transition-all duration-300 bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/20 hover:scale-[1.02] active:scale-95'
                : 'px-6 py-3 rounded-xl font-medium transition-all duration-300 bg-white text-neutral-600 hover:bg-neutral-50 hover:text-primary-600 border border-neutral-200 hover:border-primary-200 hover:scale-[1.02] active:scale-95'}
            >
              {category.title}
            </button>
          ))}
        </Reveal>

        <Reveal delayMs={200}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
            {brandsToRender.map((brand, index) => (
              <div key={`${brand.name}-${index}`} className="group">
                <div className="bg-white rounded-2xl p-4 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] border border-neutral-100 aspect-square flex items-center justify-center">
                  <div className="w-full h-full flex items-center justify-center">
                    {shouldUseTextLogo(brand.logo) ? (
                      <div className="brand-text text-center font-extrabold text-neutral-700 text-base sm:text-lg leading-tight tracking-wide px-2">
                        {brand.name}
                      </div>
                    ) : (
                      <img
                        src={withBasePath(brand.logo)}
                        alt={brand.name}
                        className="max-w-full max-h-full object-contain transition-all duration-300 group-hover:scale-110"
                        loading="lazy"
                        width="160"
                        height="160"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent && !parent.querySelector('.brand-text')) {
                            const textEl = document.createElement('div');
                            textEl.className = 'brand-text text-center font-extrabold text-neutral-700 text-base sm:text-lg leading-tight tracking-wide px-2';
                            textEl.textContent = brand.name;
                            parent.appendChild(textEl);
                          }
                        }}
                      />
                    )}
                  </div>
                </div>
                <div className="text-center text-xs sm:text-sm font-medium text-neutral-700 mt-2">
                  {brand.name}
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delayMs={300} className="mt-14 grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/90 rounded-2xl p-6 shadow-lg border border-neutral-100 text-center">
            <div className="text-3xl lg:text-4xl font-bold text-primary-600 mb-1">50+</div>
            <div className="text-neutral-600">Брендів</div>
          </div>
          <div className="bg-white/90 rounded-2xl p-6 shadow-lg border border-neutral-100 text-center">
            <div className="text-3xl lg:text-4xl font-bold text-accent-600 mb-1">7</div>
            <div className="text-neutral-600">Категорій</div>
          </div>
          <div className="bg-white/90 rounded-2xl p-6 shadow-lg border border-neutral-100 text-center">
            <div className="text-3xl lg:text-4xl font-bold text-primary-600 mb-1">10000+</div>
            <div className="text-neutral-600">Ремонтів</div>
          </div>
          <div className="bg-white/90 rounded-2xl p-6 shadow-lg border border-neutral-100 text-center">
            <div className="text-3xl lg:text-4xl font-bold text-accent-600 mb-1">99%</div>
            <div className="text-neutral-600">Задоволених</div>
          </div>
        </Reveal>
      </div>
    </ParallaxSection>
  );
};

export default BrandsGallery;
