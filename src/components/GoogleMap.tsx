import React from 'react';
import { FaMapMarkerAlt, FaPhone, FaClock, FaRoute, FaExternalLinkAlt } from 'react-icons/fa';
import ParallaxSection from './ParallaxSection';
import Reveal from './Reveal';

interface Company {
  name: string;
  address: string;
  phone: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

interface GoogleMapProps {
  company: Company;
}

const GoogleMap: React.FC<GoogleMapProps> = ({ company }) => {
  const isReactSnap = typeof navigator !== 'undefined' && navigator.userAgent.includes('ReactSnap');

  const mapContainerStyle = {
    width: '100%',
    height: '400px',
    borderRadius: '1rem',
  };

  const addressQuery = encodeURIComponent(company.address);
  const embedUrl = `https://www.google.com/maps?q=${addressQuery}&z=16&output=embed`;

  const openInGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${addressQuery}`;
    window.open(url, '_blank');
  };

  const getDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${addressQuery}`;
    window.open(url, '_blank');
  };

  return (
    <ParallaxSection
      id="location"
      className="py-16 lg:py-24"
      backgroundImage="/images/categories/television.webp"
      overlayClassName="bg-gradient-to-b from-primary-50/95 via-white/95 to-white/95"
    >
      <div className="container mx-auto px-4">
        <Reveal className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <FaMapMarkerAlt />
            <span>Наше розташування</span>
          </div>
          
          <h2 className="text-3xl lg:text-5xl font-bold text-neutral-800 mb-6">
            Знайдіть нас{' '}
            <span className="bg-gradient-to-r from-neutral-700 to-accent-600 bg-clip-text text-transparent">
              у Львові
            </span>
          </h2>
          
          <p className="text-lg text-neutral-600 max-w-3xl mx-auto">
            Сервісний центр на вул. Івана Огієнка, 15: поруч із центром Львова, недалеко від церкви святої Анни та зупинок громадського транспорту.
          </p>
        </Reveal>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact info */}
          <Reveal delayMs={120} className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-neutral-100">
              <h3 className="text-xl font-bold text-neutral-800 mb-4">Контактна інформація</h3>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <FaMapMarkerAlt className="text-red-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-800">Адреса</p>
                    <p className="text-neutral-600">{company.address}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <FaPhone className="text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-800">Телефон</p>
                    <a 
                      href={`tel:${company.phone.replace(/[-\s]/g, '')}`}
                      className="text-green-600 hover:text-green-700 font-semibold"
                    >
                      {company.phone}
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <FaClock className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-800">Режим роботи</p>
                    <div className="text-neutral-600 text-sm">
                      <p>Пн-Пт: 11:00 - 18:00</p>
                      <p>Сб: 11:30 - 16:00</p>
                      <p>Нд: Вихідний</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={getDirections}
                  className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:from-primary-600 hover:to-primary-700 transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <FaRoute />
                  <span>Маршрут</span>
                </button>
                <button
                  onClick={openInGoogleMaps}
                  className="flex-1 border border-primary-500 text-primary-600 py-3 px-4 rounded-lg font-medium hover:bg-primary-50 transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <FaExternalLinkAlt />
                  <span>Відкрити</span>
                </button>
              </div>
            </div>

            {/* Additional info */}
            <div className="bg-gradient-to-r from-accent-500 to-accent-600 rounded-2xl p-6 text-white">
              <h4 className="font-bold mb-3">Як нас знайти?</h4>
              <ul className="space-y-2 text-sm opacity-90">
                <li>• Фасадний вхід з вулиці Івана Огієнка</li>
                <li>• Зупинка громадського транспорту біля церкви святої Анни</li>
                <li>• Перший поверх, легко знайти без проходу через двір</li>
                <li>• Поруч є місця для короткої зупинки авто</li>
              </ul>
            </div>

            <div className="bg-amber-50 rounded-2xl p-6 shadow-lg border border-amber-100">
              <h4 className="font-bold text-neutral-800 mb-3">Перед візитом</h4>
              <p className="text-sm text-neutral-700 leading-relaxed">
                Через складну ситуацію в країні, обмежену доступність майстрів і нестабільну
                логістику запчастин деякі ремонти можуть займати більше часу. Перед візитом
                радимо зателефонувати, щоб підтвердити графік роботи та орієнтовні строки ремонту.
              </p>
            </div>
          </Reveal>

          {/* Map */}
          <Reveal delayMs={180} className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-4 shadow-lg border border-neutral-100">
              {isReactSnap ? (
                <div
                  className="w-full rounded-2xl bg-neutral-50 border border-neutral-200 flex flex-col items-center justify-center text-center p-8"
                  style={{ height: mapContainerStyle.height }}
                >
                  <div className="text-4xl mb-3">🗺️</div>
                  <div className="text-neutral-800 font-bold mb-2">Карта</div>
                  <div className="text-neutral-600 text-sm max-w-md mb-6">
                    Щоб пришвидшити індексацію сторінок, інтерактивна карта не завантажується під час пререндеру.
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <button
                      onClick={getDirections}
                      className="bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 px-5 rounded-lg font-medium hover:from-primary-600 hover:to-primary-700 transition-all duration-300 flex items-center justify-center space-x-2"
                    >
                      <FaRoute />
                      <span>Маршрут</span>
                    </button>
                    <button
                      onClick={openInGoogleMaps}
                      className="border border-primary-500 text-primary-600 py-3 px-5 rounded-lg font-medium hover:bg-primary-50 transition-all duration-300 flex items-center justify-center space-x-2"
                    >
                      <FaExternalLinkAlt />
                      <span>Відкрити</span>
                    </button>
                  </div>
                </div>
              ) : (
                <iframe
                  title={`Карта — ${company.name}`}
                  src={embedUrl}
                  className="w-full rounded-2xl border-0"
                  style={{ height: mapContainerStyle.height }}
                  width="100%"
                  height="400"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </ParallaxSection>
  );
};

export default GoogleMap;
