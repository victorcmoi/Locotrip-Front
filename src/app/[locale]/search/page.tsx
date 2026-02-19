"use client";

import { useTranslations, useLocalizedPath } from "@/providers/i18n.provider";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import GuideCard from "@/components/ui/guides/GuideCard";
import { useSearchGuides } from "@/services/search/search";
import { HOME_ROUTES } from "@/utils/routes";
import { MdLanguage } from "react-icons/md";
import { SlArrowDown } from "react-icons/sl";
import { LuEarth } from "react-icons/lu";
import { AiOutlineEuro } from "react-icons/ai";
import { SearchBar } from "@/components/common/SearchBar";
import { City } from "@/schemas/city";
import type { Guide } from "@/schemas/guide";

export default function SearchPage() {
  const dict = useTranslations();
  const searchParams = useSearchParams();
  const router = useRouter();
  const localizedPath = useLocalizedPath();

  const [initialDateRange, setInitialDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null,
  });
  const [initialLocation, setInitialLocation] = useState<string>("");
  const [initialMode, setInitialMode] = useState<"guide" | "activity">("guide");
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [showPriceFilter, setShowPriceFilter] = useState<boolean>(false);
  const [showLanguageFilter, setShowLanguageFilter] = useState<boolean>(false);
  const [showInterestFilter, setShowInterestFilter] = useState<boolean>(false);

  useEffect(() => {
    const modeParam = searchParams.get("mode") as "guide" | "activity";
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");
    const locationParam = searchParams.get("location");
    const minPriceParam = searchParams.get("minPrice");
    const maxPriceParam = searchParams.get("maxPrice");

    if (modeParam) setInitialMode(modeParam);
    if (startDateParam) {
      const startDate = new Date(startDateParam);
      const endDate = endDateParam ? new Date(endDateParam) : null;
      setInitialDateRange({ start: startDate, end: endDate });
    }
    if (locationParam) setInitialLocation(locationParam);
    if (minPriceParam) setMinPrice(Number(minPriceParam));
    if (maxPriceParam) setMaxPrice(Number(maxPriceParam));
  }, [searchParams]);

  const modeParam = searchParams.get("mode") as "guide" | "activity";
  const startDateParam = searchParams.get("startDate") || undefined;
  const endDateParam = searchParams.get("endDate") || undefined;
  const locationParam = searchParams.get("location") || undefined;
  const minPriceParam = searchParams.get("minPrice");
  const maxPriceParam = searchParams.get("maxPrice");
  
  const { data: guidesResponse, isLoading: guidesLoading, error: guidesError } = useSearchGuides(
    {
      location: locationParam,
      startDate: startDateParam,
      endDate: endDateParam,
      minPrice: minPriceParam ? Number(minPriceParam) : undefined,
      maxPrice: maxPriceParam ? Number(maxPriceParam) : undefined,
    },
    !!(modeParam || startDateParam || endDateParam || locationParam)
  );
  const guides = guidesResponse?.data;
  const languages = guides?.flatMap((guide: Guide) => guide.languages ? guide.languages.split(", ").map((lang: string) => lang.trim()) : []);
  const uniqueLanguages = Array.from(new Set(languages));

  const hobbies = guides?.flatMap((guide: Guide) => guide.hobbies?.map((hobby: { category_id: string; category?: { id: string; name: string } }) => hobby.category?.name).filter((name): name is string => Boolean(name)) || []);
  const uniqueHobbies = Array.from(new Set(hobbies));

  const handleSearch = (params: {
    mode : "guide" | "activity";
    location: string;
    selectedCity: City | null;
    dateRange: { start: Date | null; end: Date | null };
  }) => {
    const searchParams = new URLSearchParams();
    if (params.mode) searchParams.append("mode", params.mode);
    if (params.dateRange.start) {
      searchParams.append("startDate", params.dateRange.start.toISOString());
    }
    if (params.dateRange.end) {
      searchParams.append("endDate", params.dateRange.end.toISOString());
    }
    if (params.selectedCity) searchParams.append("location", params.selectedCity.name);
    if (minPrice !== undefined) searchParams.append("minPrice", minPrice.toString());
    if (maxPrice !== undefined) searchParams.append("maxPrice", maxPrice.toString());
    router.push(localizedPath(`${HOME_ROUTES.SEARCH}?${searchParams.toString()}`));
  };

  const handlePriceFilterApply = () => {
    const current = new URLSearchParams(window.location.search);
    if (minPrice !== undefined) {
      current.set("minPrice", minPrice.toString());
    } else {
      current.delete("minPrice");
    }
    if (maxPrice !== undefined) {
      current.set("maxPrice", maxPrice.toString());
    } else {
      current.delete("maxPrice");
    }
    router.push(localizedPath(`${HOME_ROUTES.SEARCH}?${current.toString()}`));
    setShowPriceFilter(false);
  };


  return (
    <div className="min-h-screen bg-light pt-16 pb-12">
      <div className="w-[95%] md:w-[92%] lg:max-w-[90%] mx-auto px-4 md:px-8 lg:px-12">

        {/* Formulaire de recherche */}
        <SearchBar
          onSearch={handleSearch}
          initialMode={initialMode}
          initialLocation={initialLocation}
          initialDateRange={initialDateRange}
          className="max-w-3xl mx-auto mb-12"
        />
      </div>

      {/* Filters */}
      <div className="w-full flex gap-4 items-center justify-center py-4 bg-accent mb-10">
        <div className="relative">
          <button 
            onClick={() => {
              setShowLanguageFilter(!showLanguageFilter);
              setShowInterestFilter(false);
              setShowPriceFilter(false);
            }}
            className="bg-light text-gray-800 font-normal flex justify-center items-center gap-3 px-6 py-3"
          >
            <MdLanguage />
            {dict.search.language}
            <SlArrowDown />
          </button>
        </div>

        <div className="relative">
          <button 
            onClick={() => {
              setShowInterestFilter(!showInterestFilter);
              setShowLanguageFilter(false);
              setShowPriceFilter(false);
            }}
            className="bg-light text-gray-800 flex font-normal justify-center items-center gap-3 px-6 py-3"
          >
            <LuEarth />
            {dict.search.interest}
            <SlArrowDown />
          </button>
        </div>

        <div className="relative">
          <button 
            onClick={() => {
              setShowPriceFilter(!showPriceFilter);
              setShowLanguageFilter(false);
              setShowInterestFilter(false);
            }}
            className="bg-light text-gray-800 flex font-normal justify-center items-center gap-3 px-6 py-3"
          >
            <AiOutlineEuro />
            {dict.search.price}
            <SlArrowDown />
          </button>
          
          {showPriceFilter && (
            <div className="absolute top-full mt-2 left-0 bg-light shadow-xl rounded-lg p-6 z-50 min-w-75">
              <h3 className="mb-4">{dict.search.priceRange}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-2">{dict.search.minPrice}</label>
                  <input
                    type="number"
                    value={minPrice || ''}
                    onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-light rounded focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2">{dict.search.maxPrice}</label>
                  <input
                    type="number"
                    value={maxPrice || ''}
                    onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="1000"
                    className="w-full px-3 py-2 border border-gray-light rounded focus:outline-none focus:border-accent"
                  />
                </div>
                <button
                  onClick={handlePriceFilterApply}
                  className="w-full bg-primary text-white py-2 rounded hover:bg-accent-dark transition-colors"
                >
                  {dict.search.apply}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="w-[95%] md:w-[92%] lg:max-w-[90%] mx-auto px-4 md:px-8 lg:px-12">
        {/* Résultats */}
        <div className="mt-12">
          {guidesLoading && (
            <div className="text-center text-gray py-12">
              <p className="text-xl">{dict.search.loading}</p>
            </div>
          )}

          {guidesError && (
            <div className="text-center text-error py-12">
              <p className="text-xl">{dict.search.error}</p>
            </div>
          )}

          {guides && guides.length === 0 && !guidesLoading && (
            <div className="text-center text-gray py-12">
              <p className="text-xl">{dict.search.noResult}</p>
            </div>
          )}

          {guides && guides.length > 0 && (
            <div>
              <h2 className="mb-4">
                {dict.search.titleGuide}
              </h2>
              <p className="mb-12">{guides.length} {guides.length === 1 ? dict.search.resultTitle : dict.search.resultsTitle}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {guides.map((guide: Guide) => (
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
