import React from 'react';
import SEO from '../components/SEO';
import Reveal from '../components/Reveal';
import ParallaxSection from '../components/ParallaxSection';
import Contact from '../components/Contact';
import GoogleMap from '../components/GoogleMap';

interface ContactPageProps {
    serviceData: any;
}

const ContactPage: React.FC<ContactPageProps> = ({ serviceData }) => {
    const localBusinessJsonLd = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": serviceData.company.name,
        "image": "https://texno.plus/images/service-hero.webp?v=2",
        "url": "https://texno.plus/contact",
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
            .filter((url: string) => url.startsWith('https://') || url.startsWith('viber://'))
    });

    return (
        <>
            <SEO
                title="Контакти | Сервісний центр Техноплюс у Львові"
                description="Адреса, телефон, графік роботи та соціальні мережі сервісного центру Техноплюс. Звертайтесь для ремонту техніки у Львові!"
                keywords="контакти сервісний центр львів, адреса техноплюс, телефон ремонту телефонів, де відремонтувати техніку"
                canonicalUrl="https://texno.plus/contact"
                jsonLd={localBusinessJsonLd}
            />

            <ParallaxSection
                className="pt-32 pb-16 min-h-[40vh] flex items-center justify-center"
                backgroundImage="/images/service-center.webp"
                overlayClassName="bg-gradient-to-br from-neutral-900/95 via-neutral-800/95 to-neutral-900/95"
            >
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <Reveal>
                        <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                            Наші <span className="text-accent-500">контакти</span>
                        </h1>
                        <p className="text-xl text-neutral-300 max-w-2xl mx-auto">
                            Ми завжди на зв'язку! Зателефонуйте нам, напишіть у соцмережі або завітайте до нашого сервісного центру у Львові.
                        </p>
                    </Reveal>
                </div>
            </ParallaxSection>

            {/* Render the existing Contact Component which has the form, social links, and details */}
            <Contact company={serviceData.company} />
            
            {/* Render the Map */}
            <GoogleMap company={serviceData.company} />
        </>
    );
};

export default ContactPage;
