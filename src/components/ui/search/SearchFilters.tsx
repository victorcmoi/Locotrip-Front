"use client";

import { useTranslations } from "@/providers/i18n.provider";
import { SlArrowDown } from "react-icons/sl";
import { LuEarth } from "react-icons/lu";
import { HiOutlineAdjustmentsHorizontal } from "react-icons/hi2";
import { HiMagnifyingGlass } from "react-icons/hi2";

interface SearchFiltersProps {
  mode: "guide" | "activity";
  onModeChange: (mode: "guide" | "activity") => void;
  showModeFilter: boolean;
  setShowModeFilter: (show: boolean) => void;
  showHobbiesFilter: boolean;
  setShowHobbiesFilter: (show: boolean) => void;
  showCategoryFilter: boolean;
  setShowCategoryFilter: (show: boolean) => void;
  closeAllFilters: () => void;
  uniqueHobbies: string[];
  uniqueExperienceCategories: string[];
  selectedCategories: string[];
  onCategoryToggle: (category: string) => void;
  onResetCategories: () => void;
  onOpenFiltersModal: () => void;
  // TODO: Implémenter le filtre boosted
  // boostedOnly: boolean;
  // onBoostedToggle: () => void;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  mode,
  onModeChange,
  showModeFilter,
  setShowModeFilter,
  showHobbiesFilter,
  setShowHobbiesFilter,
  showCategoryFilter,
  setShowCategoryFilter,
  closeAllFilters,
  uniqueHobbies,
  uniqueExperienceCategories,
  selectedCategories,
  onCategoryToggle,
  onResetCategories,
  onOpenFiltersModal,
}) => {
  const dict = useTranslations();

  return (
    <div className="w-full flex flex-wrap gap-3 items-center justify-center py-4 bg-accent">
      <div className="relative">
        <button 
          onClick={() => {
            closeAllFilters();
            setShowModeFilter(!showModeFilter);
          }}
          className="bg-light text-dark font-medium flex justify-center items-center gap-2.5 px-6 py-3 rounded-xl hover:bg-gray-50 hover:shadow-md active:scale-[0.98] transition-all shadow-sm"
        >
          <HiMagnifyingGlass size={20} className="text-accent" />
          <span className="text-base font-semibold text-dark">{mode === "guide" ? dict.home.localGuide : dict.home.activity}</span>
          <SlArrowDown className={`transition-transform text-sm ${showModeFilter ? 'rotate-180' : ''}`} />
        </button>

        {showModeFilter && (
          <div className="absolute top-full mt-2 left-0 bg-light shadow-2xl rounded-xl p-4 z-50 min-w-75 border border-gray-100">
            <h3 className="mb-3 font-semibold text-dark text-xl!">{dict.search.mode}</h3>
            <div className="space-y-2">
              <button
                onClick={() => {
                  onModeChange("guide");
                  setShowModeFilter(false);
                }}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-all font-medium text-sm ${
                  mode === "guide" ? 'bg-accent text-white shadow-md' : 'bg-white hover:bg-gray-100 text-dark border border-accent'
                }`}
              >
                {dict.home.localGuide}
              </button>
              <button
                onClick={() => {
                  onModeChange("activity");
                  setShowModeFilter(false);
                }}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-all font-medium text-sm ${
                  mode === "activity" ? 'bg-accent text-white shadow-md' : 'bg-white hover:bg-gray-100 text-dark border border-accent'
                }`}
              >
                {dict.home.activity}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="relative">
        <button 
          onClick={() => {
            closeAllFilters();
            if (mode === "guide") {
              setShowHobbiesFilter(!showHobbiesFilter);
            } else {
              setShowCategoryFilter(!showCategoryFilter);
            }
          }}
          className={`bg-light text-dark font-medium flex justify-center items-center gap-2.5 px-6 py-3 rounded-xl hover:bg-gray-50 hover:shadow-md active:scale-[0.98] transition-all shadow-sm border min-w-50 ${
            selectedCategories.length > 0 ? 'border-accent ring-2 ring-accent/20' : 'border-gray-200'
          }`}
        >
          <LuEarth size={20} className="text-accent" />
          <span className="text-base font-semibold text-dark flex items-center">
            {mode === "guide" ? dict.search.hobbies : dict.search.category}
            <span className={`ml-1.5 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-accent rounded-full transition-opacity ${
              selectedCategories.length > 0 ? 'opacity-100' : 'opacity-0'
            }`}>
              {selectedCategories.length || 0}
            </span>
          </span>
          <SlArrowDown className={`transition-transform text-sm ${(showHobbiesFilter || showCategoryFilter) ? 'rotate-180' : ''}`} />
        </button>

        {showHobbiesFilter && mode === "guide" && (
            <div className="absolute top-full mt-2 left-0 bg-light shadow-2xl rounded-xl p-4 z-50 min-w-90 border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-xl! text-dark">{dict.search.interestCategories}</h3>
              {selectedCategories.length > 0 && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onResetCategories();
                  }}
                  className="text-base font-bold underline hover:text-accent transition-colors text-gray-700 cursor-pointer bg-light"
                >
                  {dict.search.resetFilters}
                </button>
              )}
            </div>
            <div className="space-y-1.5 max-h-60 overflow-y-auto">
              {uniqueHobbies.length > 0 ? uniqueHobbies.map((hobby) => (
                <label key={hobby} className="flex items-center gap-2.5 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors group">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-accent cursor-pointer"
                    checked={selectedCategories.includes(hobby)}
                    onChange={() => onCategoryToggle(hobby)}
                  />
                  <span className="text-sm text-dark group-hover:text-accent transition-colors">{hobby}</span>
                </label>
              )) : (
                <p className="text-gray-500 text-sm text-center py-2">{dict.search.noResults}</p>
              )}
            </div>
          </div>
        )}

        {showCategoryFilter && mode === "activity" && (
          <div className="absolute top-full mt-2 left-0 bg-light shadow-2xl rounded-xl p-4 z-50 min-w-85 border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-xl! text-dark">{dict.search.interestCategories}</h3>
              {selectedCategories.length > 0 && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onResetCategories();
                  }}
                  className="text-base font-bold underline hover:text-accent transition-colors text-gray-700 cursor-pointer bg-light"
                >
                  {dict.search.resetFilters}
                </button>
              )}
            </div>
            <div className="space-y-1.5 max-h-60 overflow-y-auto">
              {uniqueExperienceCategories.length > 0 ? uniqueExperienceCategories.map((category) => (
                <label key={category} className="flex items-center gap-2.5 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors group">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-accent cursor-pointer"
                    checked={selectedCategories.includes(category)}
                    onChange={() => onCategoryToggle(category)}
                  />
                  <span className="text-sm text-dark group-hover:text-accent transition-colors">{category}</span>
                </label>
              )) : (
                <p className="text-gray-500 text-sm text-center py-2">{dict.search.noResults}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* TODO: Implémenter le filtre boosted
      <button 
        onClick={onBoostedToggle}
        className={`bg-light text-dark font-normal flex justify-center items-center gap-2 px-5 py-2.5 rounded-lg hover:bg-gray-50 transition-colors ${
          boostedOnly ? 'ring-2 ring-accent' : ''
        }`}
      >
        <IoSparkles size={18} />
        <span className="text-sm">Boostés</span>
      </button>
      */}

      <button 
        onClick={onOpenFiltersModal}
        className="bg-light text-dark font-medium flex justify-center items-center gap-2.5 px-6 py-3 rounded-xl hover:bg-gray-50 hover:shadow-md active:scale-[0.98] transition-all shadow-sm border border-gray-200"
      >
        <HiOutlineAdjustmentsHorizontal size={20} className="text-accent" />
        <span className="text-base font-semibold text-dark">{dict.search.allFilters}</span>
      </button>
    </div>
  );
};
