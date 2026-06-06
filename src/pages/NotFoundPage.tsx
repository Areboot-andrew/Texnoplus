import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const NotFoundPage: React.FC = () => {
    return (
        <>
            <SEO
                title="404 — Сторінку не знайдено | Техноплюс"
                description="Сторінку не знайдено. Поверніться на головну сторінку сервісного центру Техноплюс у Львові."
                canonicalUrl="https://texno.plus/404.html"
                robots="noindex, follow"
            />

            <div className="pt-[var(--header-height)] min-h-[70vh] flex items-center justify-center px-4">
                <div className="max-w-xl text-center">
                    <div className="text-6xl font-bold text-primary-600 mb-4">404</div>
                    <h1 className="text-3xl lg:text-4xl font-bold text-neutral-800 mb-4">
                        Сторінку не знайдено
                    </h1>
                    <p className="text-lg text-neutral-600 mb-8">
                        Можливо, посилання змінилося або сторінка більше не існує.
                    </p>
                    <Link
                        to="/"
                        className="inline-flex items-center justify-center px-8 py-4 rounded-full font-semibold text-white bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 transition-all duration-300 shadow-lg"
                    >
                        На головну
                    </Link>
                </div>
            </div>
        </>
    );
};

export default NotFoundPage;
