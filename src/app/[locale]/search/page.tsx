"use client";

import { useTranslations, useLocalizedPath } from "@/providers/i18n.provider";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { LuMapPin } from "react-icons/lu";
import { BsCalendar2 } from "react-icons/bs";
import { HiMagnifyingGlass } from "react-icons/hi2";
import GuideCard from "@/components/ui/guides/GuideCard";
import { useSearchGuides } from "@/services/guides/getGuides";
import Calendar from "@/components/ui/calendar/Calendar";
import { HOME_ROUTES } from "@/utils/routes";
import { MdLanguage } from "react-icons/md";
import { SlArrowDown } from "react-icons/sl";
import { LuEarth } from "react-icons/lu";
import { AiOutlineEuro } from "react-icons/ai";

export default function SearchPage() {
  const dict = useTranslations();
  const searchParams = useSearchParams();
  const router = useRouter();
  const localizedPath = useLocalizedPath();
  const [searchDate, setSearchDate] = useState<string>("");
  const [location, setLocation] = useState<string>(searchParams.get("location") || "");
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [selectedDateRange, setSelectedDateRange] = useState<{ start: Date | null; end: Date | null }>({ 
    start: null, 
    end: null 
  });
  
  const [selectedMode, setSelectedMode] = useState<"guide" | "activity">(
      "guide"
  );

  useEffect(() => {
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");
    const locationParam = searchParams.get("location");
    
    if (startDateParam) {
      const startDate = new Date(startDateParam);
      const endDate = endDateParam ? new Date(endDateParam) : null;
      setSelectedDateRange({ start: startDate, end: endDate });
      if (endDate) {
        setSearchDate(`${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`);
      }
    }
    if (locationParam) setLocation(locationParam);
  }, [searchParams]);

  const startDateParam = searchParams.get("startDate") || undefined;
  const endDateParam = searchParams.get("endDate") || undefined;
  
  const { data: guides, isLoading: guidesLoading, error: guidesError } = useSearchGuides(
    undefined,
    startDateParam,
    endDateParam,
    !!(startDateParam || endDateParam)
  );

  const handleDateRangeChange = (range: { start: Date | null; end: Date | null }) => {
    setSelectedDateRange(range);
    if (range.start && range.end) {
      setSearchDate(`${range.start.toLocaleDateString()} - ${range.end.toLocaleDateString()}`);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location) params.append("location", location);
    if (selectedDateRange.start) {
      params.append("startDate", selectedDateRange.start.toISOString());
    }
    if (selectedDateRange.end) {
      params.append("endDate", selectedDateRange.end.toISOString());
    }
    router.push(localizedPath(`${HOME_ROUTES.SEARCH}?${params.toString()}`));
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
        <div className="relative max-w-2xl mx-auto mb-12">
        <form
          onSubmit={handleSearch}
          className="flex items-center bg-white rounded-full shadow-xl pl-6"
        >
          <LuMapPin size={24} className="text-gray shrink-0" />
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder={dict.home.searchPlace}
            className="grow px-4 py-3 rounded-full focus:outline-none placeholder:text-dark"
          />

          <BsCalendar2 size={24} className="text-gray shrink-0" />
          <input
            type="text"
            value={searchDate}
            onClick={() => setShowCalendar(!showCalendar)}
            readOnly
            placeholder={dict.home.searchDate}
            className="grow px-4 py-3 rounded-full focus:outline-none placeholder:text-dark cursor-pointer"
          />

          <button
            type="submit"
            className="bg-accent text-light p-4 rounded-full hover:bg-accent-dark transition-colors duration-300 cursor-pointer flex items-center justify-center shrink-0"
          >
            <HiMagnifyingGlass size={24} />
          </button>
        </form>

        {showCalendar && (
          <Calendar
            mode="range"
            selectedRange={selectedDateRange}
            onChange={(range) => handleDateRangeChange(range as { start: Date | null; end: Date | null })}
            onClose={() => setShowCalendar(false)}
            locale="fr"
          />
        )}
        </div>
      </div>

        {/* Filters */}
        <div className="w-full flex gap-4 items-center justify-center py-4 bg-accent mb-10">
          <button className="bg-light text-gray-800 font-normal flex justify-center items-center gap-3 px-6 py-3">
            <MdLanguage />
            {dict.search.language}
            <SlArrowDown />
          </button>
          <button className="bg-light text-gray-800 flex font-normal justify-center items-center gap-3 px-6 py-3">
            <LuEarth />
            {dict.search.interest}
            <SlArrowDown />
          </button>
          <button className="bg-light text-gray-800 flex font-normal justify-center items-center gap-3 px-6 py-3">
            <AiOutlineEuro />
            {dict.search.price}
            <SlArrowDown />
          </button>
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
