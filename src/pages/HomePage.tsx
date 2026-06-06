import React from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import Services from '../components/Services';
import PriceDetails from '../components/PriceDetails';
import GoogleMap from '../components/GoogleMap';
import Contact from '../components/Contact';
import SEO from '../components/SEO';
import ParallaxSection from '../components/ParallaxSection';
import Reveal from '../components/Reveal';

interface HomePageProps {
    serviceData: any; // Using any for now to avoid duplicating the interface, or I should export it
}

const HomePage: React.FC<HomePageProps> = ({ serviceData }) => {
    const localBusinessJsonLd = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": serviceData.company.name,
        "image": "https://texno.plus/images/service-hero.webp?v=2",
        "url": "https://texno.plus/",
        "telephone": "+380673851560",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "вул. Івана Огієнка, 15",
            "addressLocality": "Львів",
            "addressCountry": "UA"
        },
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": serviceData.company.coordinates.lat,
            "longitude": serviceData.company.coordinates.lng
        },
        "openingHoursSpecification": [
            {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                "opens": "11:00",
                "closes": "18:00"
            },
            {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": "Saturday",
                "opens": "11:30",
                "closes": "16:00"
            }
        ],
        "sameAs": serviceData.company.socialLinks
            .map((link: any) => link.url)
            .filter((url: string) => url.startsWith('https://'))
    });

    return (
        <>
            <SEO
                title="Сервісний центр Техноплюс | Ремонт телефонів, колонок, ПК та ноутбуків"
                description="Професійний ремонт техніки у Львові. Адреса: вул. І. Огієнка, 15. Тел: +38 (067) 385 15 60. Швидка діагностика та гарантія на всі види робіт."
                keywords="ремонт техніки львів, сервісний центр львів, ремонт телефонів, ремонт ноутбуків, ремонт колонок, ремонт пк"
                canonicalUrl="https://texno.plus/"
                imageUrl="https://texno.plus/images/service-hero.webp?v=2"
                jsonLd={localBusinessJsonLd}
            />
            <Hero company={serviceData.company} />
            <Services categories={serviceData.categories} />
            <ParallaxSection
                className="py-12 lg:py-16"
                backgroundImage="/images/repair-work.webp"
                overlayClassName="bg-gradient-to-b from-white/95 via-white/95 to-accent-50/95"
            >
                <div className="container mx-auto px-4">
                    <Reveal className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 lg:p-12 shadow-xl border border-neutral-100 flex flex-col lg:flex-row gap-8 lg:items-center lg:justify-between">
                        <div className="max-w-3xl">
                            <h2 className="text-2xl lg:text-4xl font-bold text-neutral-800 mb-4">
                                Ремонт техніки{' '}
                                <span className="bg-gradient-to-r from-neutral-700 to-accent-600 bg-clip-text text-transparent">
                                    Apple, Samsung, JBL, Sony та інших брендів
                                </span>
                            </h2>
                            <p className="text-lg text-neutral-600">
                                Сервісний центр у Львові для смартфонів, ноутбуків, телевізорів, колонок, навушників, кавомашин та побутової техніки популярних брендів.
                            </p>
                        </div>

                        <div className="flex-shrink-0">
                            <Link
                                to="/brands"
                                className="inline-flex items-center justify-center px-8 py-4 rounded-full font-semibold text-white bg-gradient-to-r from-neutral-600 to-accent-500 hover:from-neutral-700 hover:to-accent-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            >
                                Переглянути бренди
                            </Link>
                        </div>
                    </Reveal>
                </div>
            </ParallaxSection>
            <PriceDetails categories={serviceData.categories} />
            <GoogleMap company={serviceData.company} />
            <Contact company={serviceData.company} />
        </>
    );
};

export default HomePage;
