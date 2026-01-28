import React from 'react';
import { Metadata } from 'next';
import SyroHeader from './components/SyroHeader';
import SyroFooter from './components/SyroFooter';
import NavigationBreadcrumb from './components/NavigationBreadcrumb';
import ImageSlider from './components/ImageSlider';
import '@/styles/syro-malabar.css';

export const metadata: Metadata = {
  title: {
    template: '%s | Syro-Malabar Church',
    default: 'Syro-Malabar Church',
  },
  description: 'Official website of the Syro-Malabar Church - Saint Thomas Christian Community',
  keywords: ['Syro-Malabar Church', 'Catholic Christianity', 'Saint Thomas', 'Indian Catholic Church'],
  openGraph: {
    title: 'Syro-Malabar Church',
    description: 'Official website of the Syro-Malabar Church - Saint Thomas Christian Community',
    type: 'website',
  },
};

interface SyroLayoutProps {
  children: React.ReactNode;
}

export default function SyroLayout({ children }: SyroLayoutProps) {
  return (
    <div className="syro-layout min-h-screen bg-syro-bg-gray flex flex-col font-syro-primary">
      <SyroHeader />
      
      {/* Image Slider after navbar */}
      <ImageSlider />

      <main className="syro-main flex-1">
        <NavigationBreadcrumb />
        {children}
      </main>

      <SyroFooter />
    </div>
  );
}
