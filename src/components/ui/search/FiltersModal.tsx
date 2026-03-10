"use client";

import { useTranslations } from "@/providers/i18n.provider";
import Modal from "@/components/ui/Modal";
import { MdLanguage } from "react-icons/md";
import { AiOutlineEuro } from "react-icons/ai";
import { LuClock, LuSun, LuEarth } from "react-icons/lu";
import { IoShieldCheckmark, IoAccessibility } from "react-icons/io5";

interface FiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "guide" | "activity";
  
  uniqueHobbies: string[];
  uniqueExperienceCategories: string[];
  selectedCategories: string[];
  onCategoryToggle: (category: string) => void;
  
  uniqueLanguages: string[];
  selectedLanguages: string[];
  onLanguageToggle: (language: string) => void;
  proOnly: boolean;
  onProToggle: () => void;
  
  minDuration: number | undefined;
  maxDuration: number | undefined;
  setMinDuration: (value: number | undefined) => void;
  setMaxDuration: (value: number | undefined) => void;
  selectedTimePeriods: string[];
  onTimePeriodToggle: (period: string) => void;
  accessibilityEnabled: boolean;
  onAccessibilityToggle: () => void;
  
  minPrice: number | undefined;
  maxPrice: number | undefined;
  setMinPrice: (value: number | undefined) => void;
  setMaxPrice: (value: number | undefined) => void;
  
  onApply: () => void;
  onReset: () => void;
}

export const FiltersModal: React.FC<FiltersModalProps> = ({
  isOpen,
  onClose,
  mode,
  uniqueHobbies,
  uniqueExperienceCategories,
  selectedCategories,
  onCategoryToggle,
  uniqueLanguages,
  selectedLanguages,
  onLanguageToggle,
  proOnly,
  onProToggle,
  minDuration,
  maxDuration,
  setMinDuration,
  setMaxDuration,
  selectedTimePeriods,
  onTimePeriodToggle,
  accessibilityEnabled,
  onAccessibilityToggle,
  minPrice,
  maxPrice,
  setMinPrice,
  setMaxPrice,
  onApply,
  onReset,
}) => {
  const dict = useTranslations();

  return (
    <Modal open={isOpen} onClose={onClose} title={dict.search.allFilters}>
      <div className="space-y-6 max-h-[70vh] overflow-y-auto px-1">
        <div>
          <h3 className="mb-3 font-semibold flex items-center gap-2 text-2xl!">
            <LuEarth className="text-accent" size={25} />
            {mode === "guide" ? dict.search.hobbies : dict.search.category}
          </h3>
          <div className="space-y-2">
            {mode === "guide" ? (
              uniqueHobbies.length > 0 ? uniqueHobbies.map((hobby) => (
                <label key={hobby} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-accent cursor-pointer"
                    checked={selectedCategories.includes(hobby)}
                    onChange={() => onCategoryToggle(hobby)}
                  />
                  <span className="text-sm text-gray-900">{hobby}</span>
                </label>
              )) : (
                <p className="text-gray-500 text-sm text-center py-2">{dict.search.noResults}</p>
              )
            ) : (
              uniqueExperienceCategories.length > 0 ? uniqueExperienceCategories.map((category) => (
                <label key={category} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-accent cursor-pointer"
                    checked={selectedCategories.includes(category)}
                    onChange={() => onCategoryToggle(category)}
                  />
                  <span className="text-sm text-gray-900">{category}</span>
                </label>
              )) : (
                <p className="text-gray-500 text-sm text-center py-2">{dict.search.noResults}</p>
              )
            )}
          </div>
        </div>
        
        <div>
          <h3 className="mb-3 font-semibold flex items-center gap-2 text-2xl!">
            <AiOutlineEuro className="text-accent" size={25} />
            {dict.search.price}
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">{dict.search.minPrice}</label>
              <input
                type="number"
                value={minPrice || ''}
                onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">{dict.search.maxPrice}</label>
              <input
                type="number"
                value={maxPrice || ''}
                onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="1000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-accent"
              />
            </div>
          </div>
        </div>

        {mode === "guide" && (
          <>
            <div>
              <h3 className="mb-3 font-semibold flex items-center gap-2 text-2xl!">
                <MdLanguage className="text-accent" size={25} />
                {dict.search.languages}
              </h3>
              <div className="space-y-2">
                {uniqueLanguages.length > 0 ? uniqueLanguages.map((language) => (
                  <label key={language} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-accent cursor-pointer"
                      checked={selectedLanguages.includes(language)}
                      onChange={() => onLanguageToggle(language)}
                    />
                    <span className="text-sm text-gray-900">{language}</span>
                  </label>
                )) : (
                  <p className="text-gray-500 text-sm text-center py-2">{dict.search.noResults}</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="mb-3 font-semibold flex items-center gap-2 text-2xl!">
                <IoShieldCheckmark className="text-accent" size={25} />
                {dict.search.guidePro}
              </h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={proOnly}
                  onChange={onProToggle}
                  className="w-4 h-4 accent-accent cursor-pointer"
                />
                <span className="text-sm text-gray-900">{dict.search.proOnly}</span>
              </label>
            </div>
          </>
        )}

        {mode === "activity" && (
          <>
            <div>
              <h3 className="mb-3 font-semibold flex items-center gap-2 text-2xl!">
                <LuClock className="text-accent" size={25} />
                {dict.search.duration}
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">{dict.search.minDuration}</label>
                  <input
                    type="number"
                    value={minDuration || ''}
                    onChange={(e) => setMinDuration(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">{dict.search.maxDuration}</label>
                  <input
                    type="number"
                    value={maxDuration || ''}
                    onChange={(e) => setMaxDuration(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="480"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-accent"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-3 font-semibold flex items-center gap-2 text-2xl!">
                <LuSun className="text-accent" size={25} />
                {dict.search.timePeriod}
              </h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedTimePeriods.includes("morning")}
                    onChange={() => onTimePeriodToggle("morning")}
                    className="w-4 h-4 accent-accent cursor-pointer"
                  />
                  <span className="text-sm text-gray-900">{dict.search.morning} (6h - 12h)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedTimePeriods.includes("afternoon")}
                    onChange={() => onTimePeriodToggle("afternoon")}
                    className="w-4 h-4 accent-accent cursor-pointer"
                  />
                  <span className="text-sm text-gray-900">{dict.search.afternoon} (12h - 18h)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedTimePeriods.includes("evening")}
                    onChange={() => onTimePeriodToggle("evening")}
                    className="w-4 h-4 accent-accent cursor-pointer"
                  />
                  <span className="text-sm text-gray-900">{dict.search.evening} (18h - 23h)</span>
                </label>
              </div>
            </div>

            <div>
              <h3 className="mb-3 font-semibold flex items-center gap-2 text-2xl!">
                <IoAccessibility className="text-accent" size={25} />
                {dict.search.accessibility}
              </h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={accessibilityEnabled}
                  onChange={onAccessibilityToggle}
                  className="w-4 h-4 accent-accent cursor-pointer"
                />
                <span className="text-sm text-gray-900">{dict.search.wheelchairAccessible}</span>
              </label>
            </div>
          </>
        )}
      </div>

      <div className="flex gap-3 mt-6 pt-4 border-t">
        <button
          onClick={onReset}
          className="flex-1 px-6 py-3 bg-gray-100 text-gray-800 rounded-xl hover:bg-gray-250 active:scale-[0.98] transition-all font-semibold"
        >
          {dict.search.resetFilters}
        </button>
        <button
          onClick={() => {
            onApply();
            onClose();
          }}
          className="flex-1 px-6 py-3 bg-accent text-white rounded-xl hover:bg-accent-dark active:scale-[0.98] transition-all font-semibold shadow-md hover:shadow-lg"
        >
          {dict.search.apply}
        </button>
      </div>
    </Modal>
  );
};
