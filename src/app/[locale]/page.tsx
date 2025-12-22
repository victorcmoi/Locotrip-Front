'use client';

import { useTranslations } from "@/providers/i18n.provider";
import { useState } from "react";

export default function Page() {
  const dict = useTranslations();
  const [selectedMode, setSelectedMode] = useState<'guide' | 'activity'>('guide');

  return (
    <div className="min-h-screen">
      <section className="relative h-[85vh] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat brightness-[0.5]"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(32, 83, 82, 0.82) 80%), url('/assets/accueil.png')`
          }}
        />
        
        <div className="relative z-10 h-full flex items-center justify-center">
          <main className="max-w-6xl mx-auto text-center px-8 text-white">
            <h1 className="mb-12">
              {dict.home.title}
            </h1>
            <p className="text-3xl mb-16 w-3/5 mx-auto">
              {dict.home.subtitle}
            </p>
            <div className="grid grid-cols-3 gap-8 mt-12 mb-24">
              <div className="flex flex-col gap-2 border-r-2 border-dashed">
                <p className="text-2xl font-semibold">
                  {dict.home.assistance}
                </p>
                <span className="text-xl text-light">
                  {dict.home["7/7"]}
                </span>
              </div>
              <div className="flex flex-col gap-2 border-r-2 border-dashed">
                <p className="text-2xl font-semibold">
                  {dict.home.visit}
                </p>
                <span className="text-xl text-light">
                  {dict.home.private}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-2xl font-semibold">
                  {dict.home.activity}
                </p>
                <span className="text-xl text-light">
                  {dict.home.customizable}
                </span>
              </div>
            </div>
            <nav className="mt-10 flex justify-center mb-16">
              <button 
                onClick={() => setSelectedMode('guide')}
                className={`px-15 py-3 rounded-full cursor-pointer transition-all duration-300 ${
                  selectedMode === 'guide' 
                    ? 'bg-accent text-light' 
                    : 'bg-light text-dark'
                }`}
              >
                {dict.home.localGuide}
              </button>
              <button 
                onClick={() => setSelectedMode('activity')}
                className={`px-18 py-3 rounded-full -ml-10 cursor-pointer transition-all duration-300 ${
                  selectedMode === 'activity' 
                    ? 'bg-accent text-light' 
                    : 'bg-light text-dark'
                }`}
              >
                {dict.home.activity}
              </button>
            </nav>
            
          </main>
        </div>
      </section>

      <section className="bg-light py-16">
        <div className="max-w-6xl mx-auto px-8">

        </div>
      </section>
    </div>
  );
}
