'use client';

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";
import type { Experience } from "@/schemas/experience";
import ExperienceCard from "./ExperienceCard";

interface ExperiencesCarouselProps {
  experiences: Experience[];
  showGuide?: boolean;
}

export default function ExperiencesCarousel({ experiences, showGuide = true }: ExperiencesCarouselProps) {
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
        <div className="flex gap-8 pb-4">
          {experiences.map((experience) => (
            <div key={experience.id} className="flex-[0_0_88%] sm:flex-[0_0_calc(50%-16px)] xl:flex-[0_0_calc(33.333%-22px)] min-w-0">
              <ExperienceCard experience={experience} showGuide={showGuide} />
            </div>
          ))}
        </div>
      </div>

      {canScrollPrev && (
        <button
          onClick={scrollPrev}
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-accent text-light rounded-full p-4 shadow-lg hover:bg-accent-dark duration-300 z-10 -ml-6 cursor-pointer hover:scale-110"
          aria-label="Précédent"
        >
          <HiChevronLeft size={32} />
        </button>
      )}

      {canScrollNext && (
        <button
          onClick={scrollNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-accent text-light rounded-full p-4 shadow-lg hover:bg-accent-dark duration-300 z-10 -mr-6 cursor-pointer hover:scale-110"
          aria-label="Suivant"
        >
          <HiChevronRight size={32} />
        </button>
      )}
    </div>
  );
}