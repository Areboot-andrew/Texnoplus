import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ServicePage from './pages/ServicePage';
import BrandsPage from './pages/BrandsPage';
import FaqPage from './pages/FaqPage';
import ContactPage from './pages/ContactPage';
import NotFoundPage from './pages/NotFoundPage';
import ScrollToHash from './components/ScrollToHash';
import './App.css';
import { withBasePath } from './lib/utils';

interface ServiceData {
  categories: Array<{
    id: string;
    title: string;
    description: string;
    image: string;
    icon: string;
    brands: Array<{ name: string; logo: string }>;
    services: Array<{ name: string; price: string }>;
    problems: string[];
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string;
    detailedDescription?: string;
  }>;
  company: {
    name: string;
    address: string;
    phone: string;
    coordinates: { lat: number; lng: number };
    socialLinks: Array<{ name: string; url: string; icon: string; color: string; }>;
  };
}

function App() {
  const [serviceData, setServiceData] = useState<ServiceData | null>(null);
  const [headerBottomContent, setHeaderBottomContent] = useState<React.ReactNode>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const response = await fetch(withBasePath('/data/services.json'));
      if (!response.ok) {
        throw new Error(`Failed to load services data: ${response.status} ${response.statusText}`);
      }
      const json = (await response.json()) as ServiceData;
      if (!cancelled) setServiceData(json);
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!serviceData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center">
        <div className="text-neutral-700 font-medium">Завантаження…</div>
      </div>
    );
  }

  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <ScrollToHash />
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 flex flex-col">
        <Header company={serviceData.company} bottomContent={headerBottomContent} />

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage serviceData={serviceData} />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/contact" element={<ContactPage serviceData={serviceData} />} />
            <Route path="/service/:id" element={<ServicePage categories={serviceData.categories} setHeaderBottomContent={setHeaderBottomContent} />} />
            <Route path="/service/:id/:brandSlug" element={<ServicePage categories={serviceData.categories} setHeaderBottomContent={setHeaderBottomContent} />} />
            <Route path="/brands" element={<BrandsPage categories={serviceData.categories} setHeaderBottomContent={setHeaderBottomContent} />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>

        <Footer company={serviceData.company} socialLinks={serviceData.company.socialLinks} />
      </div>
    </Router>
  );
}

export default App;
