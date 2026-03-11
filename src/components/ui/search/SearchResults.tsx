"use client";

import { useTranslations } from "@/providers/i18n.provider";
import GuideCard from "@/components/ui/guides/GuideCard";
import ExperienceCard from "@/components/ui/experiences/ExperienceCard";
import { SearchPagination } from "./SearchPagination";
import type { Guide } from "@/schemas/guide";
import type { Experience } from "@/schemas/experience";
import { FiSearch } from "react-icons/fi";

interface SearchResultsProps {
  mode: "guide" | "activity";
  isLoading: boolean;
  error: any;
  guides?: Guide[];
  experiences?: Experience[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onResetFilters?: () => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  mode,
  isLoading,
  error,
  guides,
  experiences,
  totalCount,
  currentPage,
  totalPages,
  onPageChange,
  onResetFilters,
}) => {
  const dict = useTranslations();

  if (isLoading) {
    return (
      <div className="text-center text-gray py-12">
        <p className="text-xl">{dict.search.loading}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-error py-12">
        <p className="text-xl">{dict.search.error}</p>
      </div>
    );
  }

  if ((mode === "guide" && (!guides || guides.length === 0)) || 
      (mode === "activity" && (!experiences || experiences.length === 0))) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 max-w-2xl w-full text-center">
          <div className="mb-6 flex justify-center">
            <div className="bg-gray-100 rounded-full p-6">
              <FiSearch className="text-gray-400" size={48} />
            </div>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            {dict.search.noResult}
          </h2>
          
          <p className="text-lg text-gray-600 mb-3">
            {dict.search.noResultMessage}
          </p>
          
          <p className="text-gray-500 mb-8">
            {dict.search.noResultSuggestion}
          </p>
          
          {onResetFilters && (
            <button
              onClick={onResetFilters}
              className="px-8 py-3 bg-accent text-white rounded-xl hover:bg-black-accent active:scale-[0.98] transition-all font-semibold shadow-md hover:shadow-lg"
            >
              {dict.search.resetFilters}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4">
        {mode === "guide" ? dict.search.titleGuide : dict.search.title}
      </h2>
      <p className="mb-12">
        {totalCount} {totalCount === 1 ? dict.search.resultTitle : dict.search.resultsTitle}
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mode === "guide" && guides?.map((guide: Guide) => (
          <GuideCard key={guide.id} guide={guide} />
        ))}
        {mode === "activity" && experiences?.map((experience: Experience) => (
          <ExperienceCard key={experience.id} experience={experience} />
        ))}
      </div>
      
      <SearchPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
};
