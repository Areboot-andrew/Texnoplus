import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import BrandsGallery from '../components/BrandsGallery';
import SEO from '../components/SEO';

interface BrandsPageProps {
  categories: any[];
  setHeaderBottomContent: (content: React.ReactNode) => void;
}

const BrandsPage: React.FC<BrandsPageProps> = ({ categories, setHeaderBottomContent }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    setHeaderBottomContent(
      <div className="w-full border-b border-neutral-100 shadow-sm">
        <div className="container mx-auto px-4 py-2 flex items-center justify-between gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-700 hover:text-primary-600 transition-colors min-w-0"
          >
            <ArrowLeft className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">Назад на головну</span>
          </Link>

          <div className="hidden sm:flex items-center gap-2 text-sm text-neutral-600 min-w-0">
            <Link to="/" className="hover:text-primary-600 transition-colors truncate">
              Головна
            </Link>
            <ChevronRight className="w-4 h-4 text-neutral-400 flex-shrink-0" />
            <span className="font-semibold text-neutral-800 truncate">Бренди</span>
          </div>
        </div>
      </div>
    );
    return () => setHeaderBottomContent(null);
  }, [setHeaderBottomContent]);

  return (
    <>
      <SEO
        title="Бренди, які ми ремонтуємо | Сервісний центр Техноплюс"
        description="Ремонтуємо техніку Apple, Samsung, Xiaomi, JBL, Sony та інших брендів у Львові. Адреса: вул. І. Огієнка, 15. Тел: +38 (067) 385 15 60. Гарантія на роботи."
        keywords="ремонт брендів львів, ремонт техніки брендів, сервісний центр львів"
        canonicalUrl="https://texno.plus/brands"
        imageUrl="https://texno.plus/images/repair-work.webp"
      />

      <div className="pt-[var(--header-height)]">
        <div className="container mx-auto px-4 pt-8">
          <BrandsGallery categories={categories} />
        </div>
      </div>
    </>
  );
};

export default BrandsPage;
