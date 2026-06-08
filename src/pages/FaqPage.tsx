import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import SEO from '../components/SEO';
import Reveal from '../components/Reveal';
import ParallaxSection from '../components/ParallaxSection';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronRight } from 'lucide-react';

interface FaqPageProps {
    setHeaderBottomContent: (content: React.ReactNode) => void;
}

const faqs = [
    {
        question: "Скільки часу займає діагностика та ремонт?",
        answer: "Стандартна діагностика зазвичай займає від 1 до 3 робочих днів. Більшість ремонтів ми виконуємо за 1-2 дні після погодження вартості з клієнтом, за умови наявності необхідних запчастин на складі."
    },
    {
        question: "Скільки коштує діагностика, якщо я відмовлюсь від ремонту?",
        answer: "Діагностика безкоштовна за умови подальшого ремонту в нашому сервісному центрі. У разі відмови від ремонту оплачується лише базова вартість діагностики згідно з прайс-листом."
    },
    {
        question: "Чи надаєте ви гарантію на виконані роботи?",
        answer: "Так, ми надаємо гарантію на всі види ремонтних робіт та встановлені запчастини. Термін гарантії залежить від типу послуги та деталі (зазвичай від 1 до 6 місяців)."
    },
    {
        question: "Які бренди техніки ви ремонтуєте?",
        answer: "Ми ремонтуємо техніку Apple, Samsung, Xiaomi, JBL, Marshall, Bose, Asus, Lenovo, HP та багатьох інших популярних брендів. Детальніший перелік ви можете знайти на сторінці 'Бренди'."
    },
    {
        question: "Чи можна викликати майстра додому або в офіс?",
        answer: "Ми спеціалізуємося на складному компонентному ремонті, який вимагає спеціального обладнання. Тому всі ремонтні роботи проводяться безпосередньо в нашому сервісному центрі за адресою вул. І. Огієнка, 15 у Львові."
    }
];

const FaqPage: React.FC<FaqPageProps> = ({ setHeaderBottomContent }) => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

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
                        <span className="font-semibold text-neutral-800 truncate">FAQ</span>
                    </div>
                </div>
            </div>
        );
        return () => setHeaderBottomContent(null);
    }, [setHeaderBottomContent]);

    const faqJsonLd = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
            }
        }))
    });

    return (
        <>
            <SEO
                title="Часті запитання (FAQ) | Сервісний центр Техноплюс Львів"
                description="Відповіді на найчастіші запитання про ремонт техніки, ціни, гарантію та терміни в сервісному центрі Техноплюс у Львові."
                keywords="ремонт техніки питання, faq сервісний центр, скільки коштує діагностика, гарантія на ремонт львів"
                canonicalUrl="https://texno.plus/faq"
                jsonLd={faqJsonLd}
            />

            <div className="pt-[var(--header-height)]">
                <ParallaxSection
                    className="pt-16 pb-16 min-h-[40vh] flex items-center justify-center"
                    backgroundImage="/images/service-center.webp"
                    overlayClassName="bg-gradient-to-br from-neutral-900/95 via-neutral-800/95 to-neutral-900/95"
                >
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <Reveal>
                        <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                            Часті <span className="text-accent-500">запитання</span>
                        </h1>
                        <p className="text-xl text-neutral-300 max-w-2xl mx-auto">
                            Відповідаємо на найпопулярніші запитання щодо діагностики, гарантії та ремонту техніки.
                        </p>
                    </Reveal>
                </div>
            </ParallaxSection>

            <section className="py-16 bg-white">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <Reveal key={index} delayMs={index * 100}>
                                <div 
                                    className="border border-neutral-200 rounded-2xl overflow-hidden transition-all duration-300 hover:border-accent-500/50 hover:shadow-md"
                                >
                                    <button
                                        className="w-full px-6 py-5 text-left flex justify-between items-center bg-white"
                                        onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                    >
                                        <h3 className="text-lg font-semibold text-neutral-800 pr-8">
                                            {faq.question}
                                        </h3>
                                        <div className="flex-shrink-0 text-accent-500">
                                            {openIndex === index ? <ChevronUp /> : <ChevronDown />}
                                        </div>
                                    </button>
                                    
                                    <div 
                                        className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${
                                            openIndex === index ? 'max-h-96 py-5 border-t border-neutral-100 bg-neutral-50/50' : 'max-h-0'
                                        }`}
                                    >
                                        <p className="text-neutral-600 leading-relaxed">
                                            {faq.answer}
                                        </p>
                                    </div>
                                </div>
                            </Reveal>
                        ))}
                    </div>

                    <Reveal delayMs={600} className="mt-16 text-center bg-neutral-50 rounded-3xl p-8 border border-neutral-100">
                        <h3 className="text-2xl font-bold text-neutral-800 mb-4">Не знайшли відповідь на своє запитання?</h3>
                        <p className="text-neutral-600 mb-6">Зателефонуйте нам або залиште заявку на сайті, і наші фахівці з радістю вас проконсультують.</p>
                        <Link 
                            to="/contact" 
                            className="inline-flex px-8 py-3 bg-gradient-to-r from-neutral-600 to-accent-500 text-white font-semibold rounded-xl hover:from-neutral-700 hover:to-accent-600 transition-all duration-300 shadow-lg shadow-accent-500/20 hover:shadow-accent-500/40 hover:scale-[1.02] active:scale-95"
                        >
                            Зв'язатися з нами
                        </Link>
                    </Reveal>
                </div>
            </section>
            </div>
        </>
    );
};

export default FaqPage;
