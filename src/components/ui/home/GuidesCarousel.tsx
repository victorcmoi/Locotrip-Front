"use client";

import { GuideSchema } from "@/schemas/guide";
import GuideCard from "./GuideCard";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import { HiChevronRight, HiChevronLeft } from "react-icons/hi2";
import { useTranslations } from "@/providers/i18n.provider";

interface GuidesCarouselProps {
  guides: GuideSchema[];
}

export default function GuidesCarousel({ guides }: GuidesCarouselProps) {
  const dict = useTranslations();
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    slidesToScroll: 1,
  });
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [canScrollPrev, setCanScrollPrev] = useState(false);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollToSearch = () => {
    const searchSection = document.getElementById("research");
    if (searchSection) {
      searchSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollNext(emblaApi.canScrollNext());
    setCanScrollPrev(emblaApi.canScrollPrev());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-12 pb-4">
          {guides.map((guide: GuideSchema) => (
            <div key={guide.id} className="flex-[0_0_calc(32%-34px)] min-w-0">
              <GuideCard guide={guide} />
            </div>
          ))}

          {/* Carte "Voir plus" */}
          <div className="flex-[0_0_calc(32%-34px)] min-w-0">
            <div
              className="bg-accent rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex items-center justify-center cursor-pointer group"
              style={{ minHeight: "400px" }}
              onClick={scrollToSearch}
            >
              <div className="text-center text-light p-6">
                <h3 className="text-2xl font-bold mb-3">
                  {dict.home.seeMoreGuides}
                </h3>
                <p className="text-lg mb-4">{dict.home.discoverAllGuides}</p>
                <div className="flex justify-center">
                  <div className="bg-light text-accent rounded-full p-3 group-hover:scale-110 transition-transform duration-300">
                    <HiChevronRight size={28} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Flèche précédent */}
      {canScrollPrev && (
        <button
          onClick={scrollPrev}
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-accent text-light rounded-full p-4 shadow-lg hover:bg-accent-dark transition-colors duration-300 z-10 -ml-6"
          aria-label="Précédent"
        >
          <HiChevronLeft size={32} />
        </button>
      )}

      {/* Flèche suivant */}
      {canScrollNext && (
        <button
          onClick={scrollNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-accent text-light rounded-full p-4 shadow-lg hover:bg-accent-dark transition-colors duration-300 z-10 -mr-6"
          aria-label="Suivant"
        >
          <HiChevronRight size={32} />
        </button>
      )}
    </div>
  );
}
