import React, { useState } from 'react';
import axios from 'axios';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaTelegram, FaViber, FaFacebookF, FaInstagram, FaPaperPlane, FaUser, FaCheckCircle } from 'react-icons/fa';
import ParallaxSection from './ParallaxSection';
import Reveal from './Reveal';

interface Company {
  name: string;
  address: string;
  phone: string;
}

interface ContactProps {
  company: Company;
}

interface FormData {
  name: string;
  phone: string;
  email: string;
  device: string;
  problem: string;
  message: string;
}

const Contact: React.FC<ContactProps> = ({ company }) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    email: '',
    device: '',
    problem: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      if (name === 'device') {
        const availableProblems = getProblemsForDevice(value);
        return {
          ...prev,
          device: value,
          problem: availableProblems.includes(prev.problem) ? prev.problem : '',
        };
      }

      return { ...prev, [name]: value };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
    const TELEGRAM_CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID;

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      console.error('Telegram bot token or chat ID is not defined.');
      setIsSubmitting(false);
      return;
    }

    const text = `
      <b>Нова заявка з сайту!</b>
      
      <b>Ім'я:</b> ${formData.name}
      <b>Телефон:</b> ${formData.phone}
      <b>Email:</b> ${formData.email || 'Не вказано'}
      <b>Пристрій:</b> ${formData.device}
      <b>Проблема:</b> ${formData.problem}
      <b>Повідомлення:</b>
      ${formData.message}
    `;

    try {
      await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        chat_id: TELEGRAM_CHAT_ID,
        text,
        parse_mode: 'HTML',
      });

      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({
          name: '',
          phone: '',
          email: '',
          device: '',
          problem: '',
          message: '',
        });
      }, 3000);
    } catch (error) {
      console.error('Failed to send message to Telegram', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const socialLinks = [
    {
      name: 'Facebook',
      icon: <FaFacebookF />,
      url: 'https://facebook.com/www.texno.plus',
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      name: 'Instagram',
      icon: <FaInstagram />,
      url: 'https://instagram.com/areboot',
      color: 'bg-pink-600 hover:bg-pink-700'
    },
    {
      name: 'Telegram',
      icon: <FaTelegram />,
      url: 'https://t.me/Techno_Plus_Sc',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      name: 'Viber',
      icon: <FaViber />,
      url: 'viber://chat?number=380673851560',
      color: 'bg-purple-600 hover:bg-purple-700'
    }
  ];

  const deviceTypes = [
    'Смартфон/Телефон',
    'iPhone',
    'Samsung Galaxy',
    'Xiaomi/Redmi/Poco',
    'Ноутбук',
    'MacBook',
    'Компʼютер/ПК',
    'Планшет',
    'Телевізор',
    'Монітор',
    'Портативна колонка',
    'Зарядна станція/Power bank',
    'Навушники',
    'Кавомашина',
    'Мікрохвильовка',
    'Чайник',
    'Блендер',
    'Кухонний комбайн',
    'Побутова техніка',
    'Інше'
  ];

  const commonProblems = [
    'Не вмикається',
    'Не заряджається',
    'Потрібна діагностика',
    'Після падіння або удару',
    'Потрапляння вологи',
    'Пошкоджений корпус',
    'Інше'
  ];

  const mobileProblems = [
    'Розбитий екран',
    'Не працює сенсор',
    'Швидко розряджається',
    'Потрібна заміна акумулятора',
    'Пошкоджений розʼєм зарядки',
    'Не працює камера',
    'Не працює мікрофон',
    'Немає звуку',
    'Не підключається Bluetooth/Wi-Fi',
    'Повільно працює або зависає',
    'Перезавантажується самостійно',
    'Програмні проблеми',
    'Потрібна діагностика',
    'Після падіння або удару',
    'Потрапляння вологи',
    'Інше'
  ];

  const computerProblems = [
    'Не вмикається',
    'Не заряджається',
    'Перегрів',
    'Повільно працює або зависає',
    'Потрібна чистка або профілактика',
    'Потрібне встановлення Windows/macOS',
    'Розбитий екран',
    'Не працює клавіатура/тачпад',
    'Пошкоджений розʼєм зарядки',
    'Не працює Wi-Fi/Bluetooth',
    'Потрібна заміна SSD/HDD',
    'Потрібен апгрейд',
    'Потрапляння вологи',
    'Потрібна діагностика',
    'Інше'
  ];

  const tvProblems = [
    'Не вмикається',
    'Немає зображення',
    'Є звук, але немає зображення',
    'Не працює підсвітка',
    'Смуги або плями на екрані',
    'Не працює HDMI/USB',
    'Проблеми зі Smart TV',
    'Немає звуку',
    'Програмні проблеми',
    'Потрібна діагностика',
    'Інше'
  ];

  const audioProblems = [
    'Не вмикається',
    'Не заряджається',
    'Швидко розряджається',
    'Тихий або хриплий звук',
    'Немає звуку',
    'Не підключається Bluetooth',
    'Пошкоджений розʼєм зарядки',
    'Після падіння або удару',
    'Потрапляння вологи',
    'Потрібна діагностика',
    'Інше'
  ];

  const coffeeProblems = [
    'Не вмикається',
    'Протікає вода',
    'Не гріє',
    'Не меле каву',
    'Не подає воду',
    'Слабкий потік води',
    'Помилка на дисплеї',
    'Потрібна чистка або декальцинація',
    'Шумна робота',
    'Потрібна діагностика',
    'Інше'
  ];

  const applianceProblems = [
    'Не вмикається',
    'Не гріє',
    'Не обертається двигун',
    'Запах горілого',
    'Не працюють кнопки/перемикачі',
    'Пошкоджений корпус',
    'Протікає вода',
    'Шумна робота',
    'Потрібна заміна ножів/насадок',
    'Потрібна діагностика',
    'Інше'
  ];

  const powerStationProblems = [
    'Не вмикається',
    'Не заряджається',
    'Швидко розряджається',
    'Не видає напругу 220В',
    'Не працюють USB/DC виходи',
    'Помилка на дисплеї',
    'Шумить або не працює вентилятор',
    'Пошкоджений розʼєм зарядки',
    'Потрібна діагностика',
    'Інше'
  ];

  const getProblemsForDevice = (device: string) => {
    if (['Смартфон/Телефон', 'iPhone', 'Samsung Galaxy', 'Xiaomi/Redmi/Poco', 'Планшет'].includes(device)) {
      return mobileProblems;
    }

    if (['Ноутбук', 'MacBook', 'Компʼютер/ПК'].includes(device)) {
      return computerProblems;
    }

    if (['Телевізор', 'Монітор'].includes(device)) {
      return tvProblems;
    }

    if (['Портативна колонка', 'Навушники'].includes(device)) {
      return audioProblems;
    }

    if (device === 'Кавомашина') {
      return coffeeProblems;
    }

    if (['Мікрохвильовка', 'Чайник', 'Блендер', 'Кухонний комбайн', 'Побутова техніка'].includes(device)) {
      return applianceProblems;
    }

    if (device === 'Зарядна станція/Power bank') {
      return powerStationProblems;
    }

    return commonProblems;
  };

  const availableProblems = getProblemsForDevice(formData.device);

  return (
    <ParallaxSection
      id="contact"
      className="py-16 lg:py-24"
      backgroundImage="/images/categories/smartphones.webp"
      overlayClassName="bg-gradient-to-b from-white/95 via-white/95 to-neutral-50/95"
    >
      <div className="container mx-auto px-4">
        <Reveal className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <FaEnvelope />
            <span>Зв'яжіться з нами</span>
          </div>
          
          <h2 className="text-3xl lg:text-5xl font-bold text-neutral-800 mb-6">
            Залишити{' '}
            <span className="bg-gradient-to-r from-neutral-700 to-accent-600 bg-clip-text text-transparent">
              заявку
            </span>
          </h2>
          
          <p className="text-lg text-neutral-600 max-w-3xl mx-auto">
            Опишіть проблему з вашим пристроєм, і ми зв'яжемося з вами для консультації та попередньої оцінки вартості ремонту
          </p>
        </Reveal>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Contact Form */}
          <Reveal delayMs={120} className="lg:col-span-3">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-neutral-100">
              <h3 className="text-2xl font-bold text-neutral-800 mb-6">Форма зворотного зв'язку</h3>
              
              {!isSubmitted ? (
                <form onSubmit={handleSubmit} className="space-y-6" autoComplete="on">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-2">
                        Ім'я *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        autoComplete="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                        placeholder="Ваше ім'я"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 mb-2">
                        Телефон *
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        autoComplete="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                        placeholder="+380 XX XXX XX XX"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                      placeholder="example@email.com"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="device" className="block text-sm font-medium text-neutral-700 mb-2">
                        Тип пристрою
                      </label>
                      <select
                        id="device"
                        name="device"
                        autoComplete="off"
                        value={formData.device}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                      >
                        <option value="">Оберіть тип пристрою</option>
                        {deviceTypes.map((device) => (
                          <option key={device} value={device}>{device}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="problem" className="block text-sm font-medium text-neutral-700 mb-2">
                        Тип проблеми
                      </label>
                      <select
                        id="problem"
                        name="problem"
                        autoComplete="off"
                        value={formData.problem}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                      >
                        <option value="">Оберіть проблему</option>
                        {availableProblems.map((problem) => (
                          <option key={problem} value={problem}>{problem}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-neutral-700 mb-2">
                      Детальний опис проблеми
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      autoComplete="off"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 resize-vertical"
                      placeholder="Опишіть детально що саме не працює, коли виникла проблема, які симптоми тощо..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-primary-600 hover:to-primary-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Відправлення...</span>
                      </>
                    ) : (
                      <>
                        <FaPaperPlane />
                        <span>Відправити заявку</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="text-center py-8">
                  <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-neutral-800 mb-2">Дякуємо!</h3>
                  <p className="text-neutral-600">
                    Ваша заявка успішно відправлена. Ми зв'яжемося з вами найближчим часом.
                  </p>
                </div>
              )}
            </div>
          </Reveal>

          {/* Contact Info & Social */}
          <Reveal delayMs={180} className="lg:col-span-2 space-y-6">
            {/* Direct contact */}
            <div className="bg-gradient-to-br from-neutral-600 to-accent-500 rounded-2xl p-6 text-white">
              <h3 className="text-xl font-bold mb-6">Зв'яжіться з нами прямо зараз</h3>
              
              <div className="space-y-4">
                <a
                  href={`tel:${company.phone.replace(/[-\s]/g, '')}`}
                  className="flex items-center space-x-3 p-3 bg-white/20 rounded-lg hover:bg-white/30 transition-all duration-300"
                >
                  <FaPhone className="text-xl" />
                  <div>
                    <p className="font-semibold">{company.phone}</p>
                    <p className="text-sm opacity-80">Зателефонувати</p>
                  </div>
                </a>
                
                <div className="flex items-center space-x-3 p-3 bg-white/20 rounded-lg">
                  <FaMapMarkerAlt className="text-xl" />
                  <div>
                    <p className="font-semibold">{company.address}</p>
                    <p className="text-sm opacity-80">Наша адреса</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social media */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-neutral-100">
              <h3 className="text-xl font-bold text-neutral-800 mb-4">Соціальні мережі</h3>
              
              <div className="grid grid-cols-2 gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${social.color} text-white p-3 rounded-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg flex items-center space-x-2`}
                  >
                    {social.icon}
                    <span className="font-medium">{social.name}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Working hours */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-neutral-100">
              <h3 className="text-xl font-bold text-neutral-800 mb-4">Режим роботи</h3>
              
              <div className="space-y-2 text-neutral-600">
                <div className="flex justify-between">
                  <span>Понеділок - П'ятниця</span>
                  <span className="font-semibold">11:00 - 18:00</span>
                </div>
                <div className="flex justify-between">
                  <span>Субота</span>
                  <span className="font-semibold">11:30 - 16:00</span>
                </div>
                <div className="flex justify-between">
                  <span>Неділя</span>
                  <span className="font-semibold text-red-500">Вихідний</span>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 rounded-2xl p-6 shadow-lg border border-amber-100">
              <h3 className="text-xl font-bold text-neutral-800 mb-3">Важливо про строки ремонту</h3>
              <p className="text-neutral-700 leading-relaxed">
                Через складну ситуацію в країні, обмежену доступність майстрів і нестабільну
                логістику запчастин деякі ремонти можуть займати більше часу. Перед візитом
                радимо зателефонувати, щоб підтвердити графік роботи та орієнтовні строки ремонту.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </ParallaxSection>
  );
};

export default Contact;
