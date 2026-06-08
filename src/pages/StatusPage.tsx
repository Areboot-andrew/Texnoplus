import React, { useState, useEffect } from 'react';
import { FaSearch, FaCheckCircle, FaSpinner, FaTimesCircle, FaTools, FaWrench, FaExclamationTriangle } from 'react-icons/fa';
import SEO from '../components/SEO';
import Reveal from '../components/Reveal';

interface RepairStatus {
  id: number;
  client_name: string;
  phone_last4: string;
  status: string;
  device: string;
  issue: string;
  price: number;
  update_date: string;
  notes?: string;
  client_message?: string;
}

const FIREBASE_URL = 'https://texnoplus-service-default-rtdb.europe-west1.firebasedatabase.app';

export default function StatusPage() {
  const [receiptId, setReceiptId] = useState('');
  const [phoneLast4, setPhoneLast4] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [repairData, setRepairData] = useState<RepairStatus | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const idParam = params.get('id');
    const phoneParam = params.get('phone');
    
    if (idParam && phoneParam) {
      setReceiptId(idParam);
      setPhoneLast4(phoneParam);
      fetchData(idParam, phoneParam);
    }
  }, []);

  const fetchData = async (id: string, phone: string) => {
    if (!id || !phone) {
      setError('Будь ласка, заповніть всі поля.');
      return;
    }
    if (phone.length !== 4) {
      setError('Введіть рівно 4 останні цифри вашого номера.');
      return;
    }

    setLoading(true);
    setError('');
    setRepairData(null);

    try {
      const response = await fetch(`${FIREBASE_URL}/repairs/${id}.json`);
      if (!response.ok) throw new Error('Помилка з\'єднання.');
      
      const data: RepairStatus | null = await response.json();
      if (!data) {
        setError('Ремонт за таким номером квитанції не знайдено.');
        return;
      }
      if (data.phone_last4 !== phone) {
        setError('Неправильні останні цифри номера телефону.');
        return;
      }
      setRepairData(data);
    } catch (err: any) {
      setError('Виникла помилка під час перевірки статусу.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData(receiptId, phoneLast4);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Готово':
      case 'Видано':
        return <FaCheckCircle className="text-5xl text-green-500" />;
      case 'Без ремонту':
        return <FaTimesCircle className="text-5xl text-neutral-400" />;
      case 'Очікує запчастин':
        return <FaSpinner className="text-5xl text-orange-500 animate-spin-slow" />;
      case 'На погодженні':
        return <FaExclamationTriangle className="text-5xl text-yellow-500" />;
      case 'Узгодити ціну':
        return <FaExclamationTriangle className="text-5xl text-purple-500" />;
      default:
        return <FaWrench className="text-5xl text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Готово':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'Видано':
        return 'bg-neutral-50 text-neutral-700 border-neutral-200';
      case 'Без ремонту':
        return 'bg-neutral-100 text-neutral-600 border-neutral-200';
      case 'Очікує запчастин':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'На погодженні':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'Узгодити ціну':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <>
      <SEO
        title="Перевірити статус ремонту | Сервісний центр Техноплюс"
        description="Перевірте статус ремонту вашої техніки онлайн. Просто введіть номер квитанції та останні 4 цифри телефону."
        keywords="статус ремонту, перевірити ремонт, Техноплюс львів"
        canonicalUrl="https://texno.plus/status"
      />

      <div className="pt-[var(--header-height)] min-h-screen bg-neutral-50">
        <section className="bg-neutral-900 text-white py-20 relative overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-500/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-[100px]" />
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <Reveal>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent-500/10 text-accent-500 mb-6">
                  <FaSearch className="text-2xl" />
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold mb-6">Статус ремонту</h1>
                <p className="text-lg text-neutral-300">
                  Перевіряйте стан вашого пристрою онлайн у будь-який час
                </p>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-xl mx-auto">
              <Reveal delayMs={100}>
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="receiptId" className="block text-sm font-medium text-neutral-700 mb-2">
                        Номер квитанції (ID)
                      </label>
                      <input
                        type="number"
                        id="receiptId"
                        value={receiptId}
                        onChange={(e) => setReceiptId(e.target.value)}
                        placeholder="Наприклад: 1254"
                        className="w-full px-4 py-3 bg-neutral-50 border-transparent focus:bg-white focus:border-accent-500 focus:ring-4 focus:ring-accent-500/15 rounded-xl transition-all duration-300"
                      />
                    </div>
                    <div>
                      <label htmlFor="phoneLast4" className="block text-sm font-medium text-neutral-700 mb-2">
                        Останні 4 цифри телефону
                      </label>
                      <input
                        type="text"
                        id="phoneLast4"
                        maxLength={4}
                        value={phoneLast4}
                        onChange={(e) => setPhoneLast4(e.target.value.replace(/\D/g, ''))}
                        placeholder="Наприклад: 1234"
                        className="w-full px-4 py-3 bg-neutral-50 border-transparent focus:bg-white focus:border-accent-500 focus:ring-4 focus:ring-accent-500/15 rounded-xl transition-all duration-300"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-accent-500 hover:bg-accent-600 text-white font-medium py-3 px-6 rounded-xl transition-colors duration-300 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <FaSpinner className="animate-spin mr-2" />
                          Перевірка...
                        </>
                      ) : (
                        'Перевірити статус'
                      )}
                    </button>
                  </form>

                  {error && (
                    <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-start text-sm">
                      <FaTimesCircle className="text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                      {error}
                    </div>
                  )}
                </div>
              </Reveal>

              {repairData && (
                <Reveal delayMs={200}>
                  <div className={`rounded-2xl border p-8 shadow-sm transition-colors ${getStatusColor(repairData.status)}`}>
                    <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6 mb-8">
                      <div className="flex-shrink-0 bg-white p-4 rounded-full shadow-sm">
                        {getStatusIcon(repairData.status)}
                      </div>
                      <div className="flex-grow">
                        <div className="text-sm font-medium opacity-80 mb-1">
                          Клієнт: {repairData.client_name}
                        </div>
                        <h2 className="text-3xl font-bold mb-2">{repairData.status}</h2>
                        <div className="text-lg font-medium opacity-90">{repairData.device}</div>
                        <div className="text-xs opacity-70 mt-1">
                          Оновлено: {repairData.update_date}
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/60 rounded-xl p-5 space-y-4">
                      {repairData.client_message && repairData.client_message.trim() !== '' && (
                        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl shadow-sm mb-4">
                          <div className="flex items-center text-red-600 mb-2">
                            <FaExclamationTriangle className="mr-2 text-lg" />
                            <span className="font-bold text-lg">Повідомлення для вас:</span>
                          </div>
                          <p className="font-medium text-[15px]">{repairData.client_message}</p>
                        </div>
                      )}
                      
                      <div>
                        <div className="text-sm font-medium opacity-70 mb-1">Опис несправності:</div>
                        <div className="font-medium">{repairData.issue}</div>
                      </div>
                      
                      {repairData.notes && repairData.notes.trim() !== '' && (
                        <div>
                          <div className="text-sm font-medium opacity-70 mb-1">Примітки / Виконані роботи:</div>
                          <div className="font-medium">{repairData.notes}</div>
                        </div>
                      )}
                      
                      {repairData.price > 0 && (
                        <div>
                          <div className="text-sm font-medium opacity-70 mb-1">Орієнтовна вартість:</div>
                          <div className="font-bold text-xl">{repairData.price} грн</div>
                        </div>
                      )}
                    </div>
                  </div>
                </Reveal>
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
