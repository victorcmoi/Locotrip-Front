'use client'

import { useTranslations } from "@/providers/i18n.provider";
import { useExperienceById } from "@/services/experiences/getExperiences";
import { use, useCallback, useEffect, useState, useRef } from "react";
import { AiFillStar } from "react-icons/ai";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";
import { Clock, Users, Accessibility, Globe, Calendar, ChevronDown, MapPin, Info } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";

export default function ExperiencePage({ params }: { params: Promise<{ experience_id: string; locale: string }> }) {
    const dict = useTranslations();
    const { experience_id: experienceId, locale } = use(params);
    const { data: experience, isLoading, error } = useExperienceById(experienceId);
    const guide = experience?.guide;

    // Mapping des locales pour les dates
    const dateLocaleMap: Record<string, string> = {
        fr: 'fr-FR',
        en: 'en-US',
        de: 'de-DE',
        sp: 'es-ES'
    };
    const dateLocale = dateLocaleMap[locale] ?? locale;

    const autoplayRef = useRef(
        Autoplay({ delay: 6500, stopOnInteraction: false })
    );
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [autoplayRef.current]);
    const [canScrollNext, setCanScrollNext] = useState(false);
    const [canScrollPrev, setCanScrollPrev] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedAdults, setSelectedAdults] = useState<number>(1);
    const [selectedTime, setSelectedTime] = useState<string>('');
    const [selectedSection, setSelectedSection] = useState<'informations' | 'photos' | 'reviews'>('informations');

    const scrollNext = useCallback(() => {
        if (emblaApi) {
            emblaApi.scrollNext();
            autoplayRef.current.reset();
        }
    }, [emblaApi]);

    const scrollPrev = useCallback(() => {
        if (emblaApi) {
            emblaApi.scrollPrev();
            autoplayRef.current.reset();
        }
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

    if (isLoading) {
        return <div className="flex items-center justify-center min-h-screen">{dict.common.loading}</div>;
    }

    if (error || !experience) {
        return <div className="flex items-center justify-center min-h-screen">{dict.experiences.notFound}</div>;
    }

    const guideLanguages = guide?.languages?.split(',').map(l => l.trim().substring(0, 2).toUpperCase()).join(', ') ?? '-';

    return (
        <section id="detail-experience" className="flex flex-col w-full items-center justify-center pt-20 pb-16">
            <div className="max-w-[90vw] grid grid-cols-12 items-start bg-light p-12 py-16 gap-20">
                <div className="flex col-span-7 flex-col items-start gap-6">
                    <h1 className="text-4xl font-bold text-left">{experience.title}</h1>
                    <div className="flex items-center gap-3">
                        <p>{experience.reviewCount} {dict.common.review}</p>
                        <div className="flex">
                            {[...Array(5)].map((_, i) => (
                                <AiFillStar key={i} className="text-secondary text-xl" />
                            ))}
                        </div>
                        <p>{experience.bookings?.length ?? 0} {dict.experiences.reservations}</p>
                    </div>

                    {/* Carrousel de photos */}
                    <div className="relative w-full mt-4">
                        {experience.medias && experience.medias.length > 0 ? (
                            <>
                                <div className="overflow-hidden rounded-xl" ref={emblaRef}>
                                    <div className="flex">
                                        {experience.medias.map((media, index) => (
                                            <div key={media.id ?? index} className="flex-[0_0_100%] min-w-0">
                                                <div className="relative aspect-video">
                                                    <Image
                                                        src={media.url}
                                                        alt={`${experience.title} - ${index + 1}`}
                                                        fill
                                                        className="object-cover rounded-xl"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {experience.medias.length > 1 && (
                                    <>
                                        <button
                                            onClick={scrollPrev}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-all"
                                            aria-label={dict.experiences.previousPhoto}
                                        >
                                            <HiChevronLeft size={24} />
                                        </button>
                                        <button
                                            onClick={scrollNext}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-all"
                                            aria-label={dict.experiences.nextPhoto}
                                        >
                                            <HiChevronRight size={24} />
                                        </button>
                                    </>
                                )}
                            </>
                        ) : (
                            <div className="w-full aspect-video bg-gray-200 rounded-xl flex items-center justify-center">
                                <p className="">{dict.experiences.noPhotos}</p>
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div className="w-full mt-6">
                        <p className="text-dark leading-relaxed">{experience.description}</p>
                    </div>

                    {/* Tableau d'informations */}
                    <div className="w-full mt-6 grid grid-cols-4 divide-x divide-gray-500 border border-gray-500 rounded-xl">
                        <div className="flex flex-col items-center justify-center py-6 gap-4">
                            <div className="flex items-center gap-2">
                                <Clock size={28} />
                                <span className="text-dark">{dict.experiences.duration}</span>
                            </div>
                            <span className="font-semibold text-dark">{Math.floor(experience.duration / 60)} h</span>
                        </div>
                        <div className="flex flex-col items-center justify-center py-6 gap-4">
                            <div className="flex items-center gap-2 ">
                                <Users size={28} />
                                <span className="text-dark">{dict.experiences.maxCapacity}</span>
                            </div>
                            <span className="font-semibold text-dark">{experience.max_capacity ?? '-'}</span>
                        </div>
                        <div className="flex flex-col items-center justify-center py-6 gap-4">
                            <div className="flex items-center gap-2 ">
                                <Accessibility size={28} />
                                <span className="text-dark">{dict.experiences.accessibility}</span>
                            </div>
                            <span className="font-semibold text-dark">{experience.is_accessible ? dict.common.yes : dict.common.no}</span>
                        </div>
                        <div className="flex flex-col items-center justify-center py-6 gap-4">
                            <div className="flex items-center gap-2 ">
                                <Globe size={28} />
                                <span className="text-dark">{dict.experiences.language}</span>
                            </div>
                            <span className="font-semibold text-dark">{guideLanguages}</span>
                        </div>
                    </div>
                </div>

                {/* Sidebar de réservation */}
                <div className="col-span-5 sticky top-24">
                    <div className="rounded-2xl shadow-lg p-8 flex flex-col gap-6">
                        {/* Prix */}
                        <div>
                            <p className="text-3xl font-bold text-dark">{experience.price.toFixed(2)} €</p>
                            <p className="text-gray-500 text-sm">{dict.experiences.perPerson}</p>
                        </div>

                        {/* Texte explicatif */}
                        <p className="font-semibold text-dark">{dict.experiences.chooseParticipants}</p>

                        {/* Sélecteur de date */}
                        <div className="relative">
                            <div className="flex items-center border border-gray-300 rounded-full px-4 py-3 cursor-pointer hover:border-gray-400 transition-colors">
                                <Calendar size={20} className="text-gray-400 mr-3" />
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="flex-1 bg-transparent outline-none text-center cursor-pointer"
                                />
                                <ChevronDown size={20} className="text-gray-400" />
                            </div>
                        </div>

                        {/* Sélecteur de personnes */}
                        <div className="relative">
                            <div className="flex items-center border border-gray-300 rounded-full px-4 py-3 cursor-pointer hover:border-gray-400 transition-colors">
                                <Users size={20} className="text-gray-400 mr-3" />
                                <select
                                    value={selectedAdults}
                                    onChange={(e) => setSelectedAdults(Number(e.target.value))}
                                    className="flex-1 bg-transparent outline-none text-center cursor-pointer appearance-none"
                                >
                                    {[...Array(experience.max_capacity ?? 10)].map((_, i) => (
                                        <option key={i + 1} value={i + 1}>
                                            {i + 1} {i === 0 ? dict.experiences.adult : dict.experiences.adults}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown size={20} className="text-gray-400" />
                            </div>
                        </div>

                        {/* Sélecteur d'horaire */}
                        <div className="relative">
                            <div className="flex items-center border border-gray-300 rounded-full px-4 py-3 cursor-pointer hover:border-gray-400 transition-colors">
                                <Clock size={20} className="text-gray-400 mr-3" />
                                <select
                                    value={selectedTime}
                                    onChange={(e) => setSelectedTime(e.target.value)}
                                    className="flex-1 bg-transparent outline-none text-center cursor-pointer appearance-none"
                                >
                                    <option value="">{dict.experiences.selectTime}</option>
                                    {experience.availabilities?.filter(a => a.status === 'available').map((availability) => {
                                        const start = new Date(availability.start_date);
                                        const end = new Date(availability.end_date);
                                        const formatTime = (d: Date) => `${d.getHours().toString().padStart(2, '0')}h`;
                                        return (
                                            <option key={availability.id} value={availability.id}>
                                                {formatTime(start)} - {formatTime(end)}
                                            </option>
                                        );
                                    })}
                                </select>
                                <ChevronDown size={20} className="text-gray-400" />
                            </div>
                        </div>

                        {/* Info guide */}
                        {guide && (
                            <div className="flex items-center gap-3 mt-2">
                                <div className="relative w-12 h-12 rounded-full overflow-hidden">
                                    <Image
                                        src={guide.medias?.[0]?.url ?? '/assets/guide-pp-default.avif'}
                                        alt={`${guide.user.first_name} ${guide.user.last_name}`}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">{dict.experiences.proposedBy}</p>
                                    <p className="font-semibold text-accent">{guide.user.first_name} {guide.user.last_name}</p>
                                </div>
                            </div>
                        )}

                        {/* Bouton réserver */}
                        <button className="w-full hover:bg-primary/90 text-white mt-2">
                            {dict.experiences.book}
                        </button>
                    </div>
                </div>
            </div>
            {/* Navigation des sections */}
            <div className="w-full h-24 flex items-center justify-center bg-accent text-white mt-12 gap-8">
                <button
                    onClick={() => setSelectedSection('informations')}
                    className={`px-6 py-2 rounded-full transition-all duration-300 cursor-pointer font-semibold border-2 ${selectedSection === 'informations' ? 'bg-secondary text-dark border-secondary' : 'bg-accent text-white border-transparent hover:border-secondary'}`}
                >
                    {dict.experiences.informations}
                </button>
                <button
                    onClick={() => setSelectedSection('photos')}
                    className={`px-6 py-2 rounded-full transition-all duration-300 cursor-pointer font-semibold border-2 ${selectedSection === 'photos' ? 'bg-secondary text-dark border-secondary' : 'bg-accent text-white border-transparent hover:border-secondary'}`}
                >
                    {dict.experiences.pictures}
                </button>
                <button
                    onClick={() => setSelectedSection('reviews')}
                    className={`px-6 py-2 rounded-full transition-all duration-300 cursor-pointer font-semibold border-2 ${selectedSection === 'reviews' ? 'bg-secondary text-dark border-secondary' : 'bg-accent text-white border-transparent hover:border-secondary'}`}
                >
                    {dict.experiences.reviews}
                </button>
            </div>

            
            
            {/* TODO : Section Informations */}
            {selectedSection === 'informations' && (
                <div className="max-w-[90vw] w-full mt-12">
                    <h2 className="text-2xl font-bold text-dark mb-8 text-center">{dict.experiences.informations}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Lieu de rendez-vous */}
                        <div className="bg-light rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <MapPin size={24} className="text-accent" />
                                <h3 className="text-xl font-semibold text-dark">{dict.experiences.meetingPoint}</h3>
                            </div>
                            {experience.meeting_point ? (
                                <p className="text-dark">{experience.meeting_point}</p>
                            ) : (
                                <p className="text-gray-500 italic">{dict.experiences.noMeetingPoint}</p>
                            )}
                        </div>
                        {/* Informations importantes */}
                        <div className="bg-light rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <Info size={24} className="text-accent" />
                                <h3 className="text-xl font-semibold text-dark">{dict.experiences.importantInfo}</h3>
                            </div>
                            <ul className="text-dark space-y-2">
                                <li>• {dict.experiences.duration}: {Math.floor(experience.duration / 60)}h{experience.duration % 60 > 0 ? ` ${experience.duration % 60}min` : ''}</li>
                                <li>• {dict.experiences.maxCapacity}: {experience.max_capacity ?? '-'} {dict.experiences.persons}</li>
                                <li>• {dict.experiences.language}: {guideLanguages}</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* Section Photos */}
            {selectedSection === 'photos' && (
                <div className="max-w-[90vw] w-full mt-12">
                    <h2 className="text-2xl font-bold text-dark mb-8 text-center">{dict.experiences.pictures}</h2>
                    {experience.medias && experience.medias.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {experience.medias.map((media, index) => (
                                <div
                                    key={media.id ?? index}
                                    className={`relative aspect-video rounded-xl overflow-hidden ${
                                        experience.medias!.length === 1 ? 'sm:col-span-2 lg:col-span-3' :
                                        experience.medias!.length === 2 ? 'lg:col-span-1 sm:col-span-1' :
                                        experience.medias!.length % 3 === 1 && index === experience.medias!.length - 1 ? 'sm:col-span-2 lg:col-span-3' :
                                        experience.medias!.length % 3 === 2 && index >= experience.medias!.length - 2 ? 'lg:col-span-1' : ''
                                    }`}
                                >
                                    <Image
                                        src={media.url}
                                        alt={`${experience.title} - ${index + 1}`}
                                        fill
                                        className="object-cover hover:scale-105 transition-transform duration-300"
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="w-full py-12 bg-gray-100 rounded-xl flex items-center justify-center">
                            <p className="text-gray-500">{dict.experiences.noPhotos}</p>
                        </div>
                    )}
                </div>
            )}

            {/* Section Avis */}
            {selectedSection === 'reviews' && (
                <div className="max-w-[90vw] w-full mt-12">
                    <h2 className="text-2xl font-bold text-dark mb-8 text-center">{dict.experiences.reviews}</h2>
                    
                    {/* Note moyenne */}
                    <div className="flex items-center justify-center gap-4 mb-8">
                        <div className="flex items-center gap-2">
                            <span className="text-4xl font-bold text-dark">
                                {experience.avgRating?.toFixed(1) ?? '-'}
                            </span>
                            <span className="text-gray-500">/ 5</span>
                        </div>
                        <div className="flex">
                            {[...Array(5)].map((_, i) => (
                                <AiFillStar
                                    key={i}
                                    className={`text-2xl ${i < Math.round(experience.avgRating ?? 0) ? 'text-secondary' : 'text-gray-300'}`}
                                />
                            ))}
                        </div>
                        <span className="text-gray-500">({experience.reviewCount ?? 0} {dict.common.review})</span>
                    </div>

                    {/* Liste des avis */}
                    {experience.reviews && experience.reviews.length > 0 ? (
                        <div className="space-y-6">
                            {experience.reviews.map((review) => (
                                <div key={review.id} className="bg-light rounded-2xl p-6 shadow-sm">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white font-semibold">
                                                {review.user?.first_name?.charAt(0) ?? '?'}
                                            </div>
                                            <span className="font-semibold text-dark">
                                                {review.user?.first_name} {review.user?.last_name?.charAt(0)}.
                                            </span>
                                        </div>
                                        <div className="flex">
                                            {[...Array(5)].map((_, i) => (
                                                <AiFillStar
                                                    key={i}
                                                    className={`text-lg ${i < review.rating ? 'text-secondary' : 'text-gray-300'}`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    {review.title && <p className="font-semibold text-dark mb-2">{review.title}</p>}
                                    {review.comment && <p className="text-dark">{review.comment}</p>}
                                    <p className="text-gray-400 text-sm mt-3">
                                        {new Date(review.review_date).toLocaleDateString(dateLocale, { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="w-full py-12 bg-gray-100 rounded-xl flex items-center justify-center">
                            <p className="text-gray-500">{dict.experiences.noReviews}</p>
                        </div>
                    )}
                </div>
            )}
        </section>
    )
}