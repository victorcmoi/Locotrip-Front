"use client";

import { useMemo } from "react";
import { useTranslations } from "@/providers/i18n.provider";

interface PriceHistogramProps {
  data: number[]; // Array of prices
  minPrice: number | undefined;
  maxPrice: number | undefined;
  onMinPriceChange: (value: number | undefined) => void;
  onMaxPriceChange: (value: number | undefined) => void;
  currency?: string;
}

export const PriceHistogram: React.FC<PriceHistogramProps> = ({
  data,
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  currency = "€",
}) => {
  const dict = useTranslations();

  // Calculate histogram data
  const histogramData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const validPrices = data.filter(p => p > 0);
    if (validPrices.length === 0) return [];

    const min = Math.min(...validPrices);
    const max = Math.max(...validPrices);
    const range = max - min;
    const bucketCount = 20;
    const bucketSize = range / bucketCount;

    const buckets = new Array(bucketCount).fill(0);
    
    validPrices.forEach(price => {
      const bucketIndex = Math.min(
        Math.floor((price - min) / bucketSize),
        bucketCount - 1
      );
      buckets[bucketIndex]++;
    });

    const maxCount = Math.max(...buckets);
    
    return buckets.map((count, index) => ({
      count,
      height: maxCount > 0 ? (count / maxCount) * 100 : 0,
      minValue: min + index * bucketSize,
      maxValue: min + (index + 1) * bucketSize,
    }));
  }, [data]);

  const dataMin = useMemo(() => {
    const validPrices = data.filter(p => p > 0);
    return validPrices.length > 0 ? Math.floor(Math.min(...validPrices)) : 0;
  }, [data]);

  const dataMax = useMemo(() => {
    const validPrices = data.filter(p => p > 0);
    return validPrices.length > 0 ? Math.ceil(Math.max(...validPrices)) : 1000;
  }, [data]);

  const effectiveMin = minPrice ?? dataMin;
  const effectiveMax = maxPrice ?? dataMax;

  if (histogramData.length === 0) {
    return (
      <div className="space-y-3">
        <div className="text-sm text-gray-600 mb-3">
          {dict.search.pricePerTraveler}
        </div>
        <div className="flex gap-3 items-center">
          <div className="w-32">
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Minimum
            </label>
            <div className="relative">
              <input
                type="number"
                value={minPrice || ""}
                onChange={(e) =>
                  onMinPriceChange(e.target.value ? Number(e.target.value) : undefined)
                }
                placeholder="0"
                className="w-full px-3 py-2 pl-7 border border-gray-300 rounded-lg focus:outline-none focus:border-accent"
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                {currency}
              </span>
            </div>
          </div>
          <div className="pt-6 text-gray-400">—</div>
          <div className="w-32">
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Maximum
            </label>
            <div className="relative">
              <input
                type="number"
                value={maxPrice || ""}
                onChange={(e) =>
                  onMaxPriceChange(e.target.value ? Number(e.target.value) : undefined)
                }
                placeholder="1000"
                className="w-full px-3 py-2 pl-7 border border-gray-300 rounded-lg focus:outline-none focus:border-accent"
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                {currency}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Sous-titre */}
      <div className="text-sm text-gray-600">
        {dict.search.pricePerTraveler}
      </div>

      {/* Histogram avec fond */}
      <div className="relative h-32 bg-gray-50 rounded-lg border border-gray-200">
        {/* Label min à gauche */}
        <div className="absolute left-2 bottom-3 text-xs font-semibold text-accent">
          {dataMin}{currency}
        </div>
        {/* Label max à droite */}
        <div className="absolute right-2 bottom-3 text-xs font-semibold text-accent">
          {dataMax}{currency}
        </div>
        
        {/* Conteneur des barres avec padding pour les labels */}
        <div className="absolute inset-0 left-8 right-8 p-3">
          {/* Ligne de base sous les barres - collée */}
          <div className="absolute bottom-3 left-3 right-3 h-0.5 bg-accent" />
          
          {/* Barres du graphique - collées juste au-dessus de la ligne */}
          <div className="relative h-full flex items-end justify-between gap-0.5 overflow-visible pb-0.5">
          {histogramData.map((bucket, index) => {
            const isInRange =
              bucket.maxValue >= effectiveMin && bucket.minValue <= effectiveMax;
            const isFirstOrLast = index === 0 || index === histogramData.length - 1;
            
            return (
              <div
                key={index}
                className="flex-1 relative group"
                style={{
                  height: `${bucket.height}%`,
                  minHeight: bucket.count > 0 ? "4px" : "0",
                }}
              >
                <div
                  className={`w-full h-full rounded-t transition-all duration-200 ${
                    isInRange
                      ? "bg-accent hover:bg-black-accent"
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                />
                {/* Tooltip avec positionnement dynamique pour éviter les coupures */}
                {bucket.count > 0 && (
                  <div 
                    className={`absolute bottom-full mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20 ${
                      index === 0 
                        ? 'left-0' 
                        : index === histogramData.length - 1 
                        ? 'right-0' 
                        : 'left-1/2 transform -translate-x-1/2'
                    }`}
                  >
                    {Math.round(bucket.minValue)}{currency} - {Math.round(bucket.maxValue)}
                    {currency}
                    <br />
                    {bucket.count} {bucket.count === 1 ? "résultat" : "résultats"}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        </div>
      </div>

      {/* Price inputs avec largeur réduite */}
      <div className="flex items-center justify-between">
        <div className="w-32">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Minimum
          </label>
          <div className="relative">
            <input
              type="number"
              value={minPrice ?? ""}
              onChange={(e) =>
                onMinPriceChange(e.target.value ? Number(e.target.value) : undefined)
              }
              min={dataMin}
              max={effectiveMax}
              placeholder={`${dataMin}`}
              className="w-full px-3 py-2 pl-7 border border-gray-300 rounded-lg focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              {currency}
            </span>
          </div>
        </div>
        
        <div className="pt-6 text-gray-400">—</div>
        
        <div className="w-32">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Maximum
          </label>
          <div className="relative">
            <input
              type="number"
              value={maxPrice ?? ""}
              onChange={(e) =>
                onMaxPriceChange(e.target.value ? Number(e.target.value) : undefined)
              }
              min={effectiveMin}
              max={dataMax}
              placeholder={`${dataMax}+`}
              className="w-full px-3 py-2 pl-7 border border-gray-300 rounded-lg focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              {currency}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
