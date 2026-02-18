'use client';

import { useTranslations } from '@/providers/i18n.provider';
import { useSuggestedCities, useSearchCities } from '@/services/cities/getCities';
import { City } from '@/schemas/city';
import React, { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { MinioHelpers } from '@/utils/minio';

export interface LocationProps {
  selectedCity?: City | null;
  onChange?: (city: City) => void;
  onClose?: () => void;
  searchQuery?: string;
  className?: string;
  showTitle?: boolean;
  title?: string;
}

export const Location: React.FC<LocationProps> = ({
  selectedCity,
  onChange,
  onClose,
  searchQuery = '',
  className = '',
}) => {
  const dict = useTranslations();
  const locationRef = useRef<HTMLDivElement>(null);
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

  const { data: suggestedCities, isLoading: isLoadingSuggested } = useSuggestedCities();
  const { data: searchResults, isLoading: isSearching } = useSearchCities(debouncedSearch);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
        onClose?.();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleCitySelect = (city: City) => {
    onChange?.(city);
    onClose?.();
  };

  return (
    <div
      ref={locationRef}
      className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-4 z-50 bg-light rounded-3xl shadow-2xl border border-gray-200 w-[95vw] max-w-2xl overflow-hidden ${className}`}
    >
      <div className="p-6 pr-2.5">
        {/* Contenu scrollable */}
        <div className="max-h-96 overflow-y-auto custom-scrollbar text-left text-dark pr-2 -mr-2">
          {/* Villes suggérées (affichées uniquement si pas de recherche) */}
          {!searchQuery.trim() && (
            <div className="mb-6">
              <h4 className="text-base text-left font-semibold text-dark mb-3">
                {dict.search.citiesSuggestions}
              </h4>
              {isLoadingSuggested ? (
                <p className="py-4">{dict.common.loading}</p>
              ) : suggestedCities && suggestedCities.length > 0 ? (
                <ul className="space-y-2">
                  {suggestedCities.map((city) => (
                    <li
                      key={city.id}
                      onClick={() => handleCitySelect(city)}
                      className={`p-3 rounded-2xl cursor-pointer transition-all duration-200 hover:bg-gray-100 flex items-center gap-3`}
                    >
                      <Image
                        src={MinioHelpers.city(city.image?.url)}
                        alt={city.name}
                        width={80}
                        height={80}
                        className="w-20 h-20 rounded-lg object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold">{city.name}, {city.country}</p>
                        <span className="text-sm text-dark line-clamp-2">{city.description}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-dark text-center py-4">{dict.search.noSuggestedCities}</p>
              )}
            </div>
          )}

          {/* Résultats de recherche */}
          {searchQuery.trim() && (
            <div>
              <h3 className="text-base text-left font-semibold text-dark mb-3">
                {dict.search.searchResults}
              </h3>
              {isSearching ? (
                <p className="text-dark text-center py-4">{dict.common.loading}</p>
              ) : searchResults && searchResults.length > 0 ? (
                <ul className="space-y-2">
                  {searchResults.map((city) => (
                    <li
                      key={city.id}
                      onClick={() => handleCitySelect(city)}
                      className={`p-3 rounded-2xl cursor-pointer transition-all duration-200 hover:bg-gray-100 flex items-center gap-3`}
                    >
                      <Image
                        src={MinioHelpers.city(city.image?.url)}
                        alt={city.name}
                        width={80}
                        height={80}
                        className="w-20 h-20 rounded-lg object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold">{city.name}, {city.country}</p>
                        <span className="text-sm text-dark line-clamp-2">{city.description}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-dark text-center py-4">{dict.search.noCitiesFound}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Location;