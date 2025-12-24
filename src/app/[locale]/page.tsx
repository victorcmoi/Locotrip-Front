"use client";

import { useTranslations } from "@/providers/i18n.provider";
import { useState } from "react";
import { LuMapPin } from "react-icons/lu";
import { BsCalendar2 } from "react-icons/bs";
import { HiMagnifyingGlass } from "react-icons/hi2";
import Image from "next/image";
import ButtonAvaibleGuide from "@/components/ui/home/ButtonAvaibleGuide";
import GuidesCarousel from "@/components/ui/home/GuidesCarousel";
import { useTopRatedGuides } from "@/services/guides/getGuides";
import { bubbles } from "@/utils/config/bubbles.config";
import { FloatingBubble } from "@/components/ui/home/FloatingBubble";

export default function Page() {
  const dict = useTranslations();
  const [selectedMode, setSelectedMode] = useState<"guide" | "activity">(
    "guide"
  );
  const { data: guides, isLoading, error } = useTopRatedGuides();
  return (
    <div className="min-h-screen">
      <section
        id="research"
        className="relative h-[85vh] overflow-hidden after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-24 after:bg-light after:rounded-t-[50%]"
      >
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat brightness-[0.5]"
          style={{
            backgroundImage: `var(--gradient-accent), url('/assets/accueil.png')`,
          }}
        />

        <div className="relative z-10 h-full flex items-center justify-center">
          <main className="max-w-6xl mx-auto text-center px-8 text-white">
            <h1 className="mb-12">{dict.home.title}</h1>
            <p className="text-3xl mb-16 w-3/5 mx-auto">{dict.home.subtitle}</p>
            <div className="grid grid-cols-3 gap-8 mt-12 mb-24">
              <div className="flex flex-col gap-2 border-r-2 border-dashed">
                <p className="text-2xl font-semibold">{dict.home.assistance}</p>
                <span className="text-xl text-light">{dict.home["7/7"]}</span>
              </div>
              <div className="flex flex-col gap-2 border-r-2 border-dashed">
                <p className="text-2xl font-semibold">{dict.home.visit}</p>
                <span className="text-xl text-light">{dict.home.private}</span>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-2xl font-semibold">{dict.home.activity}</p>
                <span className="text-xl text-light">
                  {dict.home.customizable}
                </span>
              </div>
            </div>
            <nav className="mt-10 flex justify-center mb-16">
              <button
                onClick={() => setSelectedMode("guide")}
                className={`px-15 py-3 rounded-full cursor-pointer transition-all duration-300 ${
                  selectedMode === "guide"
                    ? "bg-accent text-light"
                    : "bg-light text-dark"
                }`}
              >
                {dict.home.localGuide}
              </button>
              <button
                onClick={() => setSelectedMode("activity")}
                className={`px-18 py-3 rounded-full -ml-10 cursor-pointer transition-all duration-300 ${
                  selectedMode === "activity"
                    ? "bg-accent text-light"
                    : "bg-light text-dark"
                }`}
              >
                {dict.home.activity}
              </button>
            </nav>
            <form
              id="search"
              className="max-w-2xl mx-auto flex items-center bg-light rounded-full shadow-lg pl-6 text-black"
            >
              <LuMapPin size="24" />
              <input
                type="text"
                placeholder={dict.home.searchPlace}
                className="grow px-4 py-2 rounded-full focus:outline-none"
              />

              <BsCalendar2 size="24" />
              <input
                type="date"
                placeholder={dict.home.searchDate}
                className="grow px-4 py-2 rounded-full focus:outline-none"
              />

              <button
                type="submit"
                className="bg-accent text-light px-6 rounded-full ml-4 hover:bg-accent-dark transition-colors duration-300 cursor-pointer"
              >
                <HiMagnifyingGlass size="24" />
              </button>
            </form>
          </main>
        </div>
      </section>

      <section id="destinations" className="bg-light py-16">
        <div className="max-w-full mx-auto px-24">
          <h2>
            {dict.home.popularDestinationsStart}
            <span className="text-accent">
              {dict.home.popularDestinationsHighlight}
            </span>
            {dict.home.popularDestinationsEnd}
          </h2>
          <div className="mt-12 grid grid-cols-2 gap-8">
            <div className="relative h-145 rounded-lg overflow-hidden shadow-lg cursor-pointer">
              <Image
                src="/assets/france.avif"
                alt="France"
                fill
                className="object-cover hover:scale-105 transition-transform duration-300"
              />
              <div
                className="absolute bottom-0 left-0 right-0 p-8"
                style={{ background: "var(--gradient-primary)" }}
              >
                <h3 className="text-light mb-3">{dict.home.france}</h3>
                <ButtonAvaibleGuide />
              </div>
            </div>
            <div className="relative h-145 rounded-lg overflow-hidden shadow-lg cursor-pointer">
              <Image
                src="/assets/spain.avif"
                alt="Spain"
                fill
                className="object-cover hover:scale-105 transition-transform duration-300"
              />
              <div
                className="absolute bottom-0 left-0 right-0 p-8"
                style={{ background: "var(--gradient-primary)" }}
              >
                <h3 className="text-white mb-3">{dict.home.spain}</h3>
                <ButtonAvaibleGuide />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="guides" className="bg-light py-16">
        <div className="max-w-full mx-auto px-24">
          <h2>
            {dict.home.guidesTitleStart}
            <span className="text-accent">
              {dict.home.guidesTitleHighlight}
            </span>
            {dict.home.guidesTitleEnd}
          </h2>

          {isLoading && (
            <div className="mt-12 text-center text-gray">
              Chargement des guides...
            </div>
          )}

          {error && (
            <div className="mt-12 text-center text-error">
              Une erreur est survenue lors du chargement des guides
            </div>
          )}

          {guides && guides.length > 0 && (
            <div className="mt-12">
              <GuidesCarousel guides={guides} />
            </div>
          )}
        </div>
      </section>

      <section id="stats" className="bg-light py-16">
        <div className="max-w-full mx-auto px-24 grid grid-cols-2 items-center justify-evenly">
          <h2 className="text-left">
            {dict.home.statsTitleStart}
            <span className="text-accent">
              {dict.home.statsTitleHighlight}
            </span>
            {dict.home.statsTitleNext}
            <span className="text-accent">
              {dict.home.statusTitleHighlight2}
            </span>
            {dict.home.statsTitleEnd}
          </h2>
          <div className="relative h-150 overflow-hidden">
            {bubbles.map(bubble => (
              <FloatingBubble key={bubble.id} {...bubble} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
