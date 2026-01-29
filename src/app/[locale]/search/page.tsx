"use client";

import { useTranslations, useLocalizedPath } from "@/providers/i18n.provider";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { LuMapPin } from "react-icons/lu";
import { BsCalendar2 } from "react-icons/bs";
import { HiMagnifyingGlass } from "react-icons/hi2";
import GuideCard from "@/components/ui/guides/GuideCard";
import { useSearchGuides } from "@/services/guides/getGuides";

export default function SearchPage() {
  const dict = useTranslations();
  const searchParams = useSearchParams();
  const [searchDate, setSearchDate] = useState<string>(searchParams.get("date") || "");
  const [location, setLocation] = useState<string>(searchParams.get("location") || "");
  
  const { data: guides, isLoading: guidesLoading, error: guidesError, refetch } = useSearchGuides(searchDate, !!searchDate);
  
  const [selectedMode, setSelectedMode] = useState<"guide" | "activity">(
      "guide"
  );

  useEffect(() => {
    const dateParam = searchParams.get("date");
    const locationParam = searchParams.get("location");
    if (dateParam) setSearchDate(dateParam);
    if (locationParam) setLocation(locationParam);
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchDate) {
      refetch();
    }
  };

  return (
    <div className="min-h-screen bg-light pt-24 pb-12">
      <div className="w-[95%] md:w-[92%] lg:max-w-[90%] mx-auto px-4 md:px-8 lg:px-12">
        <nav className="mt-8 md:mt-10 flex justify-center mb-8 md:mb-12">
          <button
            onClick={() =>   setSelectedMode("guide")}
            className={`px-15 py-3 rounded-full cursor-pointer transition-all duration-300 ${
              selectedMode === "guide"
                ? "bg-accent text-light border-2 border-accent"
                : "bg-light text-dark border-2 border-gray-light hover:border-accent"
            }`}
          >
            {dict.home.localGuide}
          </button>
          <button
            onClick={() => setSelectedMode("activity")}
            className={`px-18 py-3 rounded-full -ml-10 cursor-pointer transition-all duration-300 ${
              selectedMode === "activity"
                ? "bg-accent text-light border-2 border-accent"
                : "bg-light text-dark border-2 border-gray-light hover:border-accent"
            }`}
          >
            {dict.home.activity}
          </button>
        </nav>

        {/* Formulaire de recherche */}
        <form
          onSubmit={handleSearch}
          className="max-w-2xl mx-auto mb-12 flex items-center bg-white rounded-full shadow-xl pl-6"
        >
          <LuMapPin size={24} className="text-gray" />
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder={dict.home.searchPlace}
            className="grow px-4 py-3 rounded-full focus:outline-none placeholder:text-dark"
          />

          <BsCalendar2 size={24} className="text-gray" />
          <input
            type="date"
            value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)}
            placeholder={dict.home.searchDate}
            className="grow px-4 py-3 rounded-full focus:outline-none"
          />

          <button
            type="submit"
            className="bg-accent text-light p-4 rounded-full hover:bg-accent-dark transition-colors duration-300 cursor-pointer flex items-center justify-center shrink-0"
          >
            <HiMagnifyingGlass size={24} />
          </button>
        </form>

        {/* Résultats */}
        <div className="mt-12">
          {!searchDate && (
            <div className="text-center text-gray py-12">
              <p className="text-xl">{dict.home.selectDateToSearch || "Sélectionnez une date pour rechercher des guides disponibles"}</p>
            </div>
          )}

          {searchDate && guidesLoading && (
            <div className="text-center text-gray py-12">
              <p className="text-xl">{dict.home.guidesLoading || "Chargement..."}</p>
            </div>
          )}

          {searchDate && guidesError && (
            <div className="text-center text-error py-12">
              <p className="text-xl">{dict.home.errorLoadingGuides || "Erreur lors du chargement des guides"}</p>
            </div>
          )}

          {searchDate && guides && guides.length === 0 && !guidesLoading && (
            <div className="text-center text-gray py-12">
              <p className="text-xl">{dict.home.noGuidesFound || "Aucun guide disponible pour cette date"}</p>
            </div>
          )}

          {searchDate && guides && guides.length > 0 && (
            <div>
              <h2 className="mb-8">
                {guides.length} {guides.length === 1 ? "guide trouvé" : "guides trouvés"}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {guides.map((guide) => (
                  <GuideCard key={guide.id} guide={guide} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
