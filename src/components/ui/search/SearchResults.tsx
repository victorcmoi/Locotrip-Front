"use client";

import { useTranslations } from "@/providers/i18n.provider";
import GuideCard from "@/components/ui/guides/GuideCard";
import ExperienceCard from "@/components/ui/experiences/ExperienceCard";
import { SearchPagination } from "./SearchPagination";
import type { Guide } from "@/schemas/guide";
import type { Experience } from "@/schemas/experience";

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
      <div className="text-center text-gray py-12">
        <p className="text-xl">{dict.search.noResult}</p>
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
