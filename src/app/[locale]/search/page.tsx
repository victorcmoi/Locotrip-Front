"use client";

import { useLocalizedPath } from "@/providers/i18n.provider";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSearchGuides, useSearchExperiences } from "@/services/search/search";
import { HOME_ROUTES } from "@/utils/routes";
import { SearchBar } from "@/components/common/SearchBar";
import { SearchFilters } from "@/components/ui/search/SearchFilters";
import { FiltersModal } from "@/components/ui/search/FiltersModal";
import { SearchResults } from "@/components/ui/search/SearchResults";
import { City } from "@/schemas/city";
import type { Guide } from "@/schemas/guide";
import type { Experience } from "@/schemas/experience";

const ITEMS_PER_PAGE = 12;

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const localizedPath = useLocalizedPath();
  const filtersRef = useRef<HTMLDivElement>(null);

  const [initialDateRange, setInitialDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null,
  });
  const [initialLocation, setInitialLocation] = useState<string>("");
  const [showModeFilter, setShowModeFilter] = useState<boolean>(false);
  const [showHobbiesFilter, setShowHobbiesFilter] = useState<boolean>(false);
  const [showCategoryFilter, setShowCategoryFilter] = useState<boolean>(false);
  const [showFiltersModal, setShowFiltersModal] = useState<boolean>(false);
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [minDuration, setMinDuration] = useState<number | undefined>(undefined);
  const [maxDuration, setMaxDuration] = useState<number | undefined>(undefined);
  const [proOnly, setProOnly] = useState<boolean>(false);
  const [selectedTimePeriods, setSelectedTimePeriods] = useState<string[]>([]);
  const [accessibilityEnabled, setAccessibilityEnabled] = useState<boolean>(false);
  // const [boostedOnly, setBoostedOnly] = useState<boolean>(false); // TODO: Implémenter le filtre boosted

  // États temporaires pour la modal
  const [tempSelectedCategoryIds, setTempSelectedCategoryIds] = useState<string[]>([]);
  const [tempSelectedLanguages, setTempSelectedLanguages] = useState<string[]>([]);
  const [tempProOnly, setTempProOnly] = useState<boolean>(false);
  const [tempSelectedTimePeriods, setTempSelectedTimePeriods] = useState<string[]>([]);
  const [tempAccessibilityEnabled, setTempAccessibilityEnabled] = useState<boolean>(false);
  const [tempMinPrice, setTempMinPrice] = useState<number | undefined>(undefined);
  const [tempMaxPrice, setTempMaxPrice] = useState<number | undefined>(undefined);
  const [tempMinDuration, setTempMinDuration] = useState<number | undefined>(undefined);
  const [tempMaxDuration, setTempMaxDuration] = useState<number | undefined>(undefined);

  const modeParam = (searchParams.get("mode") as "guide" | "activity") || "guide";
  const startDateParam = searchParams.get("startDate") || undefined;
  const endDateParam = searchParams.get("endDate") || undefined;
  const locationParam = searchParams.get("location") || undefined;
  const countryParam = searchParams.get("country") || undefined;
  const limitParam = Number(searchParams.get("limit") || "20");
  const safeLimit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 100) : 20;
  const languagesParam = searchParams.get("languages") || undefined;
  const categoriesParam = searchParams.get("categories") || undefined;
  const pageParam = parseInt(searchParams.get("page") || "1", 10);
  const currentPage = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  const isAnyFilterOpen = showModeFilter || showHobbiesFilter || showCategoryFilter;
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filtersRef.current && !filtersRef.current.contains(event.target as Node)) {
        closeAllFilters();
      }
    };

    if (isAnyFilterOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isAnyFilterOpen]);

  useEffect(() => {
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");
    const locationParam = searchParams.get("location");
    const minPriceParam = searchParams.get("minPrice");
    const maxPriceParam = searchParams.get("maxPrice");
    const proOnlyParam = searchParams.get("proOnly");
    const minDurationParam = searchParams.get("minDuration");
    const maxDurationParam = searchParams.get("maxDuration");
    const timePeriodsParam = searchParams.get("timePeriods");
    const accessibilityParam = searchParams.get("accessibility");

    if (startDateParam) {
      const startDate = new Date(startDateParam);
      const endDate = endDateParam ? new Date(endDateParam) : null;
      setInitialDateRange({ start: startDate, end: endDate });
    }
    if (locationParam) setInitialLocation(locationParam);
    if (minPriceParam) setMinPrice(Number(minPriceParam));
    if (maxPriceParam) setMaxPrice(Number(maxPriceParam));
    if (proOnlyParam === "true") setProOnly(true);
    if (minDurationParam) setMinDuration(Number(minDurationParam));
    if (maxDurationParam) setMaxDuration(Number(maxDurationParam));
    if (timePeriodsParam) setSelectedTimePeriods(timePeriodsParam.split(","));
    if (accessibilityParam === "true") setAccessibilityEnabled(true);
  }, [searchParams]);

  const { data: guidesResponse, isLoading: guidesLoading, error: guidesError } = useSearchGuides(
    {
      location: locationParam,
      startDate: startDateParam,
      endDate: endDateParam,
      limit: safeLimit,
    },
    modeParam === "guide" && !!(startDateParam || endDateParam || locationParam)
  );

  const { data: experiencesResponse, isLoading: experiencesLoading, error: experiencesError } = useSearchExperiences(
    {
      location: locationParam,
      country: countryParam,
      startDate: startDateParam,
      endDate: endDateParam,
      limit: safeLimit,
    },
    modeParam === "activity" && !!(startDateParam || endDateParam || locationParam || countryParam)
  );

  // Extraire les IDs de catégories sélectionnées depuis les paramètres URL
  const selectedCategoryIds = categoriesParam ? categoriesParam.split(",").filter(Boolean) : [];
  const selectedLanguages = languagesParam ? languagesParam.split(",").filter(Boolean) : [];

  const filteredGuides = useMemo(() => {
    if (!guidesResponse?.data) return [];
    let result = guidesResponse.data;
    
    // Filtre catégories côté client
    if (selectedCategoryIds.length > 0) {
      result = result.filter((guide: Guide) => {
        const guideHobbyIds = guide.hobbies?.map((h: any) => h.category_id) || [];
        return selectedCategoryIds.some(catId => guideHobbyIds.includes(catId));
      });
    }
    
    // Filtre langues côté client
    if (selectedLanguages.length > 0) {
      result = result.filter((guide: Guide) => {
        if (!guide.languages) return false;
        const guideLangs = guide.languages.split(", ").map(l => l.trim());
        return selectedLanguages.some(lang => guideLangs.includes(lang));
      });
    }
    
    
    if (proOnly) {
      result = result.filter((guide: Guide) => guide.pro_card === true);
    }
    // TODO: Filtre boosted
    // if (boostedOnly) result = result.filter((guide: Guide) => guide.is_boosted === true);
    return result;
  }, [guidesResponse?.data, selectedCategoryIds, selectedLanguages, proOnly]);

  const filteredExperiences = useMemo(() => {
    if (!experiencesResponse?.data) return [];
    let result = experiencesResponse.data;
    
    // Filtre catégories côté client
    if (selectedCategoryIds.length > 0) {
      result = result.filter((exp: Experience) => {
        const expCategoryIds = exp.categories?.map((c: any) => c.category_id) || [];
        return selectedCategoryIds.some(catId => expCategoryIds.includes(catId));
      });
    }
    
    // Filtre prix côté client
    if (minPrice !== undefined) {
      result = result.filter((exp: Experience) => {
        const price = exp.price || 0;
        return price >= minPrice;
      });
    }
    if (maxPrice !== undefined) {
      result = result.filter((exp: Experience) => {
        const price = exp.price || 0;
        return price <= maxPrice;
      });
    }
    
    // Filtre durée côté client
    if (minDuration !== undefined) {
      result = result.filter((exp: Experience) => {
        const duration = exp.duration || 0;
        return duration >= minDuration;
      });
    }
    if (maxDuration !== undefined) {
      result = result.filter((exp: Experience) => {
        const duration = exp.duration || 0;
        return duration <= maxDuration;
      });
    }
        
    // TODO: Filtre boosted
    // if (boostedOnly) result = result.filter((exp: Experience) => exp.is_boosted === true);
    return result;
  }, [experiencesResponse?.data, selectedCategoryIds, minPrice, maxPrice, minDuration, maxDuration]);

  const totalGuides = filteredGuides.length;
  const totalExperiences = filteredExperiences.length;
  const totalGuidesPages = Math.ceil(totalGuides / ITEMS_PER_PAGE);
  const totalExperiencesPages = Math.ceil(totalExperiences / ITEMS_PER_PAGE);

  const paginatedGuides = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredGuides.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredGuides, currentPage]);

  const paginatedExperiences = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredExperiences.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredExperiences, currentPage]);

  const allGuides = guidesResponse?.data || [];
  const uniqueLanguages = useMemo(() => {
    const langs = allGuides.flatMap((guide: Guide) => 
      guide.languages ? guide.languages.split(", ").map((lang: string) => lang.trim()) : []
    );
    return Array.from(new Set(langs));
  }, [allGuides]);

  // Extraire les catégories/hobbies avec leurs IDs
  const hobbiesMap = useMemo(() => {
    const map = new Map<string, string>();
    allGuides.forEach((guide: Guide) => {
      guide.hobbies?.forEach((hobby: {category_id: string; category?: {id: string; name: string}}) => {
        if (hobby.category?.id && hobby.category?.name) {
          map.set(hobby.category.id, hobby.category.name);
        }
      });
    });
    return map;
  }, [allGuides]);

  const experienceCategoriesMap = useMemo(() => {
    const map = new Map<string, string>();
    const allExperiences = experiencesResponse?.data || [];
    allExperiences.forEach((exp: Experience) => {
      exp.categories?.forEach((cat) => {
        if (cat.category?.id && cat.category?.name) {
          map.set(cat.category.id, cat.category.name);
        }
      });
    });
    return map;
  }, [experiencesResponse?.data]);

  // Extract price data for histogram
  const priceData = useMemo(() => {
    const allExperiences = experiencesResponse?.data || [];
    return allExperiences
      .filter((exp: Experience) => exp.price && exp.price > 0)
      .map((exp: Experience) => exp.price);
  }, [experiencesResponse?.data]);

  // Extract duration data for histogram
  const durationData = useMemo(() => {
    const allExperiences = experiencesResponse?.data || [];
    return allExperiences
      .filter((exp: Experience) => exp.duration && exp.duration > 0)
      .map((exp: Experience) => exp.duration);
  }, [experiencesResponse?.data]);

  const uniqueHobbies = Array.from(hobbiesMap.values());
  const uniqueExperienceCategories = Array.from(experienceCategoriesMap.values());
  
  // Convertir les IDs sélectionnés en noms pour l'affichage
  const selectedCategories = useMemo(() => {
    const currentMap = modeParam === "guide" ? hobbiesMap : experienceCategoriesMap;
    return selectedCategoryIds.map(id => currentMap.get(id)).filter((name): name is string => Boolean(name));
  }, [selectedCategoryIds, modeParam, hobbiesMap, experienceCategoriesMap]);

  // Convertir les IDs temporaires sélectionnés en noms pour l'affichage dans la modal
  const tempSelectedCategories = useMemo(() => {
    const currentMap = modeParam === "guide" ? hobbiesMap : experienceCategoriesMap;
    return tempSelectedCategoryIds.map(id => currentMap.get(id)).filter((name): name is string => Boolean(name));
  }, [tempSelectedCategoryIds, modeParam, hobbiesMap, experienceCategoriesMap]);

  const closeAllFilters = () => {
    setShowModeFilter(false);
    setShowHobbiesFilter(false);
    setShowCategoryFilter(false);
  };

  // Initialiser les états temporaires avec les valeurs actuelles
  const initializeTempFilters = () => {
    setTempSelectedCategoryIds(selectedCategoryIds);
    setTempSelectedLanguages(selectedLanguages);
    setTempProOnly(proOnly);
    setTempSelectedTimePeriods(selectedTimePeriods);
    setTempAccessibilityEnabled(accessibilityEnabled);
    setTempMinPrice(minPrice);
    setTempMaxPrice(maxPrice);
    setTempMinDuration(minDuration);
    setTempMaxDuration(maxDuration);
  };

  // Handlers temporaires pour la modal
  const handleTempCategoryToggle = (categoryName: string) => {
    const currentMap = modeParam === "guide" ? hobbiesMap : experienceCategoriesMap;
    
    let categoryId: string | undefined;
    for (const [id, name] of currentMap.entries()) {
      if (name === categoryName) {
        categoryId = id;
        break;
      }
    }
    
    if (!categoryId) return;
    
    if (tempSelectedCategoryIds.includes(categoryId)) {
      setTempSelectedCategoryIds(tempSelectedCategoryIds.filter((c) => c !== categoryId));
    } else {
      setTempSelectedCategoryIds([...tempSelectedCategoryIds, categoryId]);
    }
  };

  const handleTempLanguageToggle = (language: string) => {
    if (tempSelectedLanguages.includes(language)) {
      setTempSelectedLanguages(tempSelectedLanguages.filter((l) => l !== language));
    } else {
      setTempSelectedLanguages([...tempSelectedLanguages, language]);
    }
  };

  const handleTempProToggle = () => {
    setTempProOnly(!tempProOnly);
  };

  const handleTempTimePeriodToggle = (period: string) => {
    if (tempSelectedTimePeriods.includes(period)) {
      setTempSelectedTimePeriods(tempSelectedTimePeriods.filter((p) => p !== period));
    } else {
      setTempSelectedTimePeriods([...tempSelectedTimePeriods, period]);
    }
  };

  const handleTempAccessibilityToggle = () => {
    setTempAccessibilityEnabled(!tempAccessibilityEnabled);
  };

  // Appliquer tous les filtres de la modal (y compris catégories)
  const handleApplyModalFilters = () => {
    const current = new URLSearchParams(window.location.search);
    
    // Catégories
    if (tempSelectedCategoryIds.length > 0) {
      current.set("categories", tempSelectedCategoryIds.join(","));
    } else {
      current.delete("categories");
    }
    
    // Langues
    if (tempSelectedLanguages.length > 0) {
      current.set("languages", tempSelectedLanguages.join(","));
    } else {
      current.delete("languages");
    }
    
    // Prix
    if (tempMinPrice !== undefined) {
      current.set("minPrice", tempMinPrice.toString());
    } else {
      current.delete("minPrice");
    }
    if (tempMaxPrice !== undefined) {
      current.set("maxPrice", tempMaxPrice.toString());
    } else {
      current.delete("maxPrice");
    }
    
    // Filtres spécifiques aux guides
    if (modeParam === "guide") {
      if (tempProOnly) {
        current.set("proOnly", "true");
      } else {
        current.delete("proOnly");
      }
    }
    
    // Filtres spécifiques aux activités
    if (modeParam === "activity") {
      if (tempMinDuration !== undefined) {
        current.set("minDuration", tempMinDuration.toString());
      } else {
        current.delete("minDuration");
      }
      if (tempMaxDuration !== undefined) {
        current.set("maxDuration", tempMaxDuration.toString());
      } else {
        current.delete("maxDuration");
      }
      if (tempSelectedTimePeriods.length > 0) {
        current.set("timePeriods", tempSelectedTimePeriods.join(","));
      } else {
        current.delete("timePeriods");
      }
      if (tempAccessibilityEnabled) {
        current.set("accessibility", "true");
      } else {
        current.delete("accessibility");
      }
    }
    
    // Mettre à jour les états réels
    setMinPrice(tempMinPrice);
    setMaxPrice(tempMaxPrice);
    setMinDuration(tempMinDuration);
    setMaxDuration(tempMaxDuration);
    setProOnly(tempProOnly);
    setSelectedTimePeriods(tempSelectedTimePeriods);
    setAccessibilityEnabled(tempAccessibilityEnabled);
    
    updateUrlParams(current);
  };

  // Réinitialiser uniquement les catégories (pour la barre de filtres)
  const handleResetCategories = () => {
    const current = new URLSearchParams(window.location.search);
    current.delete("categories");
    updateUrlParams(current);
  };

  // Réinitialiser tous les filtres de la modal
  const handleResetModalFilters = () => {
    setTempSelectedCategoryIds([]);
    setTempSelectedLanguages([]);
    setTempProOnly(false);
    setTempSelectedTimePeriods([]);
    setTempAccessibilityEnabled(false);
    setTempMinPrice(undefined);
    setTempMaxPrice(undefined);
    setTempMinDuration(undefined);
    setTempMaxDuration(undefined);
  };

  const updateUrlParams = useCallback((params: URLSearchParams, resetPage = true) => {
    if (resetPage) params.delete("page");
    router.replace(localizedPath(`${HOME_ROUTES.SEARCH}?${params.toString()}`), { scroll: false });
  }, [router, localizedPath]);

  const handleSearch = (params: {
    mode: "guide" | "activity";
    location: string;
    selectedCity: City | null;
    dateRange: { start: Date | null; end: Date | null };
  }) => {
    const searchParams = new URLSearchParams();
    searchParams.append("mode", params.mode);
    if (params.dateRange.start) {
      searchParams.append("startDate", params.dateRange.start.toISOString());
    }
    if (params.dateRange.end) {
      searchParams.append("endDate", params.dateRange.end.toISOString());
    }
    if (params.selectedCity) {
      searchParams.append("location", params.selectedCity.name);
    }
    router.push(localizedPath(`${HOME_ROUTES.SEARCH}?${searchParams.toString()}`));
  };

  const handleModeChange = (mode: "guide" | "activity") => {
    const current = new URLSearchParams(window.location.search);
    const location = current.get("location");
    const startDate = current.get("startDate");
    const endDate = current.get("endDate");
    const country = current.get("country");
    const limit = current.get("limit");
    
    const newParams = new URLSearchParams();
    newParams.set("mode", mode);
    if (location) newParams.set("location", location);
    if (startDate) newParams.set("startDate", startDate);
    if (endDate) newParams.set("endDate", endDate);
    if (country) newParams.set("country", country);
    if (limit) newParams.set("limit", limit);
    
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setMinDuration(undefined);
    setMaxDuration(undefined);
    setProOnly(false);
    setSelectedTimePeriods([]);
    setAccessibilityEnabled(false);
    
    updateUrlParams(newParams);
  };

  const handleCategoryToggle = (categoryName: string) => {
    const current = new URLSearchParams(window.location.search);
    const currentMap = modeParam === "guide" ? hobbiesMap : experienceCategoriesMap;
    
    // Trouver l'ID correspondant au nom
    let categoryId: string | undefined;
    for (const [id, name] of currentMap.entries()) {
      if (name === categoryName) {
        categoryId = id;
        break;
      }
    }
    
    if (!categoryId) return;
    
    const existing = selectedCategoryIds;
    let updated: string[];
    if (existing.includes(categoryId)) {
      updated = existing.filter((c) => c !== categoryId);
    } else {
      updated = [...existing, categoryId];
    }
    if (updated.length > 0) {
      current.set("categories", updated.join(","));
    } else {
      current.delete("categories");
    }
    updateUrlParams(current);
  };

  const handleLanguageToggle = (language: string) => {
    const current = new URLSearchParams(window.location.search);
    const existing = selectedLanguages;
    let updated: string[];
    if (existing.includes(language)) {
      updated = existing.filter((l) => l !== language);
    } else {
      updated = [...existing, language];
    }
    if (updated.length > 0) {
      current.set("languages", updated.join(","));
    } else {
      current.delete("languages");
    }
    updateUrlParams(current);
  };

  const handleProToggle = () => {
    const current = new URLSearchParams(window.location.search);
    const newProOnly = !proOnly;
    setProOnly(newProOnly);
    if (newProOnly) {
      current.set("proOnly", "true");
    } else {
      current.delete("proOnly");
    }
    updateUrlParams(current);
  };

  const handleTimePeriodToggle = (period: string) => {
    const current = new URLSearchParams(window.location.search);
    let newPeriods: string[];
    if (selectedTimePeriods.includes(period)) {
      newPeriods = selectedTimePeriods.filter((p) => p !== period);
    } else {
      newPeriods = [...selectedTimePeriods, period];
    }
    setSelectedTimePeriods(newPeriods);
    if (newPeriods.length > 0) {
      current.set("timePeriods", newPeriods.join(","));
    } else {
      current.delete("timePeriods");
    }
    updateUrlParams(current);
  };

  const handleAccessibilityToggle = () => {
    const current = new URLSearchParams(window.location.search);
    const newAccessibility = !accessibilityEnabled;
    setAccessibilityEnabled(newAccessibility);
    if (newAccessibility) {
      current.set("accessibility", "true");
    } else {
      current.delete("accessibility");
    }
    updateUrlParams(current);
  };

  const handleApplyFilters = () => {
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

    if (modeParam === "activity") {
      if (minDuration !== undefined) {
        current.set("minDuration", minDuration.toString());
      } else {
        current.delete("minDuration");
      }
      if (maxDuration !== undefined) {
        current.set("maxDuration", maxDuration.toString());
      } else {
        current.delete("maxDuration");
      }
    }

    updateUrlParams(current);
  };

  const handleResetFilters = () => {
    const current = new URLSearchParams(window.location.search);
    const mode = current.get("mode");
    const location = current.get("location");
    const startDate = current.get("startDate");
    const endDate = current.get("endDate");
    const country = current.get("country");
    const limit = current.get("limit");
    
    const newParams = new URLSearchParams();
    if (mode) newParams.set("mode", mode);
    if (location) newParams.set("location", location);
    if (startDate) newParams.set("startDate", startDate);
    if (endDate) newParams.set("endDate", endDate);
    if (country) newParams.set("country", country);
    if (limit) newParams.set("limit", limit);
    
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setMinDuration(undefined);
    setMaxDuration(undefined);
    setProOnly(false);
    setSelectedTimePeriods([]);
    setAccessibilityEnabled(false);
    
    updateUrlParams(newParams);
    closeAllFilters();
  };

  const handlePageChange = (newPage: number) => {
    const current = new URLSearchParams(window.location.search);
    if (newPage === 1) {
      current.delete("page");
    } else {
      current.set("page", newPage.toString());
    }
    router.replace(localizedPath(`${HOME_ROUTES.SEARCH}?${current.toString()}`), { scroll: true });
  };

  return (
    <div className="min-h-screen bg-light pt-8 pb-12">
      {/* Sticky Search Bar + Filters */}
      <div className="sticky top-16 z-40 bg-light shadow-md">
        <div className="page-content max-w-[90%] pt-3 pb-2">
          <SearchBar
            onSearch={handleSearch}
            currentMode={modeParam}
            showModeButtons={false}
            initialLocation={initialLocation}
            initialDateRange={initialDateRange}
            className="max-w-3xl mx-auto"
          />
        </div>

        <div ref={filtersRef} className="pt-6">
          <SearchFilters
            mode={modeParam}
            onModeChange={handleModeChange}
            showModeFilter={showModeFilter}
            setShowModeFilter={setShowModeFilter}
            showHobbiesFilter={showHobbiesFilter}
            setShowHobbiesFilter={setShowHobbiesFilter}
            showCategoryFilter={showCategoryFilter}
            setShowCategoryFilter={setShowCategoryFilter}
            closeAllFilters={closeAllFilters}
            uniqueHobbies={uniqueHobbies}
            uniqueExperienceCategories={uniqueExperienceCategories}
            selectedCategories={selectedCategories}
            onCategoryToggle={handleCategoryToggle}
            onResetCategories={handleResetCategories}
            onOpenFiltersModal={() => {
              initializeTempFilters();
              setShowFiltersModal(true);
            }}
          />
        </div>
      </div>

      {/* Results */}
      <div className="page-content max-w-[90%] mt-10">
        <div className="mt-12">
          <SearchResults
            mode={modeParam}
            isLoading={modeParam === "guide" ? guidesLoading : experiencesLoading}
            error={modeParam === "guide" ? guidesError : experiencesError}
            guides={modeParam === "guide" ? paginatedGuides : undefined}
            experiences={modeParam === "activity" ? paginatedExperiences : undefined}
            totalCount={modeParam === "guide" ? totalGuides : totalExperiences}
            currentPage={currentPage}
            totalPages={modeParam === "guide" ? totalGuidesPages : totalExperiencesPages}
            onPageChange={handlePageChange}
            onResetFilters={handleResetFilters}
          />
        </div>
      </div>

      {/* Filters Modal */}
      <FiltersModal
        isOpen={showFiltersModal}
        onClose={() => setShowFiltersModal(false)}
        mode={modeParam}
        uniqueHobbies={uniqueHobbies}
        uniqueExperienceCategories={uniqueExperienceCategories}
        selectedCategories={tempSelectedCategories}
        onCategoryToggle={handleTempCategoryToggle}
        uniqueLanguages={uniqueLanguages}
        selectedLanguages={tempSelectedLanguages}
        onLanguageToggle={handleTempLanguageToggle}
        proOnly={tempProOnly}
        onProToggle={handleTempProToggle}
        minDuration={tempMinDuration}
        maxDuration={tempMaxDuration}
        setMinDuration={setTempMinDuration}
        setMaxDuration={setTempMaxDuration}
        selectedTimePeriods={tempSelectedTimePeriods}
        onTimePeriodToggle={handleTempTimePeriodToggle}
        accessibilityEnabled={tempAccessibilityEnabled}
        onAccessibilityToggle={handleTempAccessibilityToggle}
        minPrice={tempMinPrice}
        maxPrice={tempMaxPrice}
        setMinPrice={setTempMinPrice}
        setMaxPrice={setTempMaxPrice}
        priceData={priceData}
        onApply={handleApplyModalFilters}
        onReset={handleResetModalFilters}
      />
    </div>
  );
}
