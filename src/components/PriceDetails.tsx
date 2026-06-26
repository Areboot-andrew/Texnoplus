import React, { useState } from 'react';
import { FaMoneyBillWave, FaChevronDown, FaChevronUp, FaCheckCircle, FaClock, FaTools } from 'react-icons/fa';
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
  icon: string;
  services: Service[];
  problems: string[];
}

interface PriceDetailsProps {
  categories: Category[];
}

const PriceDetails: React.FC<PriceDetailsProps> = ({ categories }) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  return (
    <ParallaxSection
      id="prices"
      className="py-16 lg:py-24"
      backgroundImage="/images/categories/appliances.webp"
      overlayClassName="bg-gradient-to-b from-accent-50/95 via-white/95 to-primary-50/95"
    >
      <div className="container mx-auto px-4">
        <Reveal className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <FaMoneyBillWave />
            <span>Прозорі ціни</span>
          </div>
          
          <h2 className="text-3xl lg:text-5xl font-bold text-neutral-800 mb-6">
            Прайс-лист{' '}
            <span className="bg-gradient-to-r from-neutral-700 to-accent-600 bg-clip-text text-transparent">
              послуг з ремонту
            </span>
          </h2>
          
          <p className="text-lg text-neutral-600 max-w-3xl mx-auto">
            Орієнтовна вартість ремонту телефонів, ноутбуків, телевізорів, колонок, кавомашин та побутової техніки. Точну ціну погоджуємо після діагностики.
          </p>
        </Reveal>

        <div className="space-y-6">
          {categories.map((category, index) => (
            <Reveal key={category.id} delayMs={120 + index * 60} className="bg-white rounded-2xl shadow-lg border border-neutral-100 overflow-hidden">
              {/* Category header */}
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full p-6 text-left hover:bg-neutral-50 transition-colors duration-300 flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-neutral-600 to-accent-500 rounded-xl flex items-center justify-center text-white text-2xl">
                    {category.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-neutral-800 mb-1">{category.title}</h3>
                    <p className="text-neutral-600">{category.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-neutral-500">{category.services.length} послуг</span>
                  {expandedCategories.has(category.id) ? (
                    <FaChevronUp className="text-primary-500" />
                  ) : (
                    <FaChevronDown className="text-primary-500" />
                  )}
                </div>
              </button>

              {/* Expanded content */}
              <div
                className={`grid transition-[grid-template-rows] duration-300 ease-in-out border-t border-neutral-100 ${
                  expandedCategories.has(category.id) ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                }`}
              >
                <div className="overflow-hidden">
                  <div className="p-6">
                    {/* Services table */}
                    <div className="mb-8">
                      <h4 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center space-x-2">
                        <FaTools className="text-primary-500" />
                        <span>Ціни на ремонт</span>
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b-2 border-neutral-200">
                              <th className="text-left py-3 px-4 font-semibold text-neutral-700">Послуга</th>
                              <th className="text-right py-3 px-4 font-semibold text-neutral-700">Ціна</th>
                            </tr>
                          </thead>
                          <tbody>
                            {category.services.map((service, idx) => (
                              <tr key={idx} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                                <td className="py-3 px-4 text-neutral-800">{service.name}</td>
                                <td className="py-3 px-4 text-right font-semibold text-primary-600">{service.price}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Common problems */}
                    <div>
                      <h4 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center space-x-2">
                        <FaCheckCircle className="text-green-500" />
                        <span>Найчастіші проблеми</span>
                      </h4>
                      <div className="grid md:grid-cols-2 gap-3">
                        {category.problems.map((problem, idx) => (
                          <div key={idx} className="flex items-start space-x-3 p-3 bg-neutral-50 rounded-lg">
                            <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                            <span className="text-neutral-700 text-sm">{problem}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Additional info */}
        <Reveal delayMs={180} className="grid md:grid-cols-3 gap-6 mt-16">
          <div className="bg-white rounded-xl p-6 shadow-lg text-center border border-primary-100">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCheckCircle className="text-green-600 text-xl" />
            </div>
            <h3 className="font-bold text-neutral-800 mb-2">Діагностика перед ремонтом</h3>
            <p className="text-neutral-600 text-sm">Перевіряємо причину несправності й пояснюємо, що саме потрібно ремонтувати</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg text-center border border-primary-100">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaClock className="text-blue-600 text-xl" />
            </div>
            <h3 className="font-bold text-neutral-800 mb-2">Погодження до старту</h3>
            <p className="text-neutral-600 text-sm">Називаємо вартість, строки та варіанти запчастин до початку робіт</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg text-center border border-primary-100">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaMoneyBillWave className="text-orange-600 text-xl" />
            </div>
            <h3 className="font-bold text-neutral-800 mb-2">Гарантія та перевірка</h3>
            <p className="text-neutral-600 text-sm">Після ремонту тестуємо пристрій і надаємо гарантію на виконані роботи</p>
          </div>
        </Reveal>

        {/* Call to action */}
        <Reveal delayMs={240} className="bg-gradient-to-r from-neutral-600 to-accent-500 rounded-2xl p-8 mt-16 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Потрібна консультація щодо ремонту?</h3>
          <p className="mb-6 opacity-90">Зателефонуйте нам або залиште заявку, і ми розрахуємо точну вартість ремонту</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:0673851560"
              className="bg-white text-primary-600 px-8 py-4 rounded-xl font-semibold hover:bg-neutral-50 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95"
            >
              Зателефонувати зараз
            </a>
            <button
              onClick={() => {
                const element = document.querySelector('#contact');
                if (element) element.scrollIntoView({ behavior: 'smooth' });
              }}
              className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-primary-600 transition-all duration-300 hover:scale-[1.02] active:scale-95"
            >
              Залишити заявку
            </button>
          </div>
        </Reveal>
      </div>
    </ParallaxSection>
  );
};

export default PriceDetails;
