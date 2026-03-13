'use client'

import { useTranslations } from "@/providers/i18n.provider";
import { useExperienceById } from "@/services/experiences/getExperiences";
import { use, useCallback, useEffect, useState, useRef, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useLocalizedPath } from "@/providers/i18n.provider";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";
import { BsStarHalf } from "react-icons/bs";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";
import { Clock, Users, Accessibility, Globe, Calendar as CalendarIcon, ChevronDown, MapPin, Info } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import { Calendar } from "@/components/ui/calendar/Calendar";
import dayjs from "@/lib/dayjs";
import Link from "next/link";
import GuidesRoutes from "@/utils/routes/guides.routes";

export default function ExperiencePage({ params }: { params: Promise<{ experience_id: string; locale: string }> }) {
    const dict = useTranslations();
    const localizedPath = useLocalizedPath();
    const router = useRouter();
    const { data: session } = useSession();
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
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [selectedAdults, setSelectedAdults] = useState<number>(1);
    const [selectedTime, setSelectedTime] = useState<string>('');
    const [selectedSection, setSelectedSection] = useState<'informations' | 'programme' | 'photos' | 'reviews'>('informations');

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

    const guideLanguages = guide?.languages?.split(',').map(l => l.trim().substring(0, 2).toUpperCase()).join(', ') ?? '-';
    const reviews = experience?.reviews ?? [];
    const steps = experience?.steps ?? [];
    const reviewCount = experience?.reviewCount ?? reviews.length;
    const avgRating = experience?.avgRating ?? (reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
        : 0);
    const reviewCountLabel = reviewCount > 99 ? '99+' : `${reviewCount}`;
    const bookingsCount = experience?.bookingsCount ?? experience?.bookings?.length ?? 0;
    const availableAvailabilities = (experience?.availabilities ?? []).filter((availability) => availability.status === 'available');

    const getDateKey = (date: string | Date) => {
        if (typeof date === 'string') {
            return date.slice(0, 10);
        }

        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };

    const availableDatesStr = useMemo(
        () => new Set<string>(
            availableAvailabilities.map((availability) => getDateKey(availability.start_date))
        ),
        [availableAvailabilities]
    );

    const selectableDates = useMemo(
        () => Array.from(availableDatesStr).map((dateKey) => dayjs(dateKey).toDate()),
        [availableDatesStr]
    );

    const today = useMemo(() => dayjs().startOf('day'), []);
    const maxAvailabilityDay = useMemo(
        () => availableAvailabilities.reduce<Date | null>((max, availability) => {
            const current = dayjs(availability.start_date).startOf('day').toDate();
            if (!max || dayjs(current).isAfter(dayjs(max), 'day')) {
                return current;
            }
            return max;
        }, null),
        [availableAvailabilities]
    );

    const maxSelectableDate = maxAvailabilityDay ?? undefined;

    const unavailableDates = useMemo(() => {
        if (!maxAvailabilityDay) return [] as Date[];

        const daysToCover = dayjs(maxAvailabilityDay).diff(today, 'day');
        if (daysToCover < 0) return [] as Date[];

        const dates: Date[] = [];
        for (let i = 0; i <= daysToCover; i++) {
            const d = today.add(i, 'day');
            if (!availableDatesStr.has(d.format('YYYY-MM-DD'))) {
                dates.push(d.toDate());
            }
        }

        return dates;
    }, [availableDatesStr, maxAvailabilityDay, today]);

    const selectedDateKey = selectedDate ? getDateKey(selectedDate) : null;
    const selectedAvailabilities = selectedDateKey
        ? availableAvailabilities.filter((availability) => getDateKey(availability.start_date) === selectedDateKey)
        : [];

    const handleBook = () => {
        if (!selectedDate || !selectedTime) {
            toast.error("Sélectionnez une date et un horaire avant de réserver.");
            return;
        }

        const checkoutPath = localizedPath(
            `/bookings/checkout?experience_id=${encodeURIComponent(experienceId)}&availability_id=${encodeURIComponent(selectedTime)}&participants=${selectedAdults}`
        );

        if (!session?.user?.id) {
            if (typeof window !== 'undefined') {
                window.sessionStorage.setItem(
                    'pendingExperienceReservation',
                    JSON.stringify({
                        experience_id: experienceId,
                        availability_id: selectedTime,
                        participants: selectedAdults,
                    })
                );
            }

            router.push(localizedPath(`/login?redirect=${encodeURIComponent(checkoutPath)}`));
            return;
        }

        router.push(checkoutPath);
    };

    if (isLoading) {
        return <div className="flex items-center justify-center min-h-screen">{dict.common.loading}</div>;
    }

    if (error || !experience) {
        return <div className="flex items-center justify-center min-h-screen">{dict.experiences.notFound}</div>;
    }

    return (
        <section id="detail-experience" className="flex flex-col w-full items-center justify-center pt-20 pb-16">
            <div className="max-w-[90vw] grid grid-cols-12 items-start bg-light p-12 py-16 gap-20">
                <div className="flex col-span-7 flex-col items-start gap-6">
                    <h1 className="text-4xl font-bold text-left">{experience.title}</h1>
                    {(reviewCount > 0 || bookingsCount > 0) && (
                        <div className="flex items-center gap-3">
                            {reviewCount > 0 && (
                                <>
                                    <p>{reviewCountLabel} {dict.common.review}</p>
                                    <div className="flex">
                                        {[...Array(5)].map((_, i) => (
                                            avgRating >= i + 1 ? (
                                                <AiFillStar key={i} className="text-secondary text-xl" />
                                            ) : avgRating >= i + 0.5 ? (
                                                <BsStarHalf key={i} className="text-secondary text-xl" />
                                            ) : (
                                                <AiOutlineStar key={i} className="text-gray-300 text-xl" />
                                            )
                                        ))}
                                    </div>
                                </>
                            )}
                            {bookingsCount > 0 && (
                                <p>{bookingsCount} {dict.experiences.reservations}</p>
                            )}
                        </div>
                    )}

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
                            <div 
                                className="flex items-center border border-gray-300 rounded-full px-4 py-3 cursor-pointer hover:border-gray-400 transition-colors"
                                onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                            >
                                <CalendarIcon size={20} className="text-gray-400 mr-3" />
                                <span className="flex-1 text-center text-gray-700">
                                   {selectedDate ? dayjs(selectedDate).locale(dateLocale).format('DD/MM/YYYY') : dict.experiences.selectDate || "Sélectionner une date"}
                                </span>
                                <ChevronDown size={20} className="text-gray-400" />
                            </div>
                            {isCalendarOpen && (
                                <Calendar
                                    mode="single"
                                    selectedDate={selectedDate}
                                    onChange={(date) => {
                                        setSelectedDate(date as Date);
                                        setIsCalendarOpen(false);
                                        setSelectedTime('');
                                    }}
                                    onClose={() => setIsCalendarOpen(false)}
                                    unavailableDates={unavailableDates}
                                    minDate={new Date()}
                                    maxDate={maxSelectableDate}
                                    selectableDates={selectableDates}
                                    strikeThroughUnavailableDates={true}
                                    monthsToShow={1}
                                    locale={dateLocale}
                                    className="top-full! left-0! mt-2! w-full! max-w-none! translate-x-0!"
                                />
                            )}
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
                                    disabled={!selectedDate}
                                    className="flex-1 bg-transparent outline-none text-center cursor-pointer appearance-none disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="">{dict.experiences.selectTime}</option>
                                    {selectedAvailabilities.map((availability) => {
                                        const start = new Date(availability.start_date);
                                        const end = new Date(availability.end_date);
                                        const formatTime = (d: Date) => `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
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
                            <Link
                                href={localizedPath(GuidesRoutes.PROFILE(guide.id))}
                                className="flex items-center gap-3 mt-2 rounded-xl transition-opacity hover:opacity-80"
                            >
                                <div className="relative w-12 h-12 rounded-full overflow-hidden">
                                    <Image
                                        src={guide.medias?.[0]?.url ?? '/assets/guide-pp-default.avif'}
                                        alt={`${guide.user.first_name} ${guide.user.last_name}`}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div>
                                    <p className="font-semibold text-accent">{guide.user.first_name} {guide.user.last_name}</p>
                                    <p className="text-xs text-dark/60">Voir le profil du guide</p>
                                </div>
                            </Link>
                        )}

                        {/* Bouton réserver */}
                        <button onClick={handleBook} className="w-full hover:bg-primary/90 text-white mt-2">
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
                    onClick={() => setSelectedSection('programme')}
                    className={`px-6 py-2 rounded-full transition-all duration-300 cursor-pointer font-semibold border-2 ${selectedSection === 'programme' ? 'bg-secondary text-dark border-secondary' : 'bg-accent text-white border-transparent hover:border-secondary'}`}
                >
                    {dict.experiences.program}
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

            {/* Section Programme */}
            {selectedSection === 'programme' && (
                <div className="max-w-[90vw] w-full mt-12">
                    <h2 className="text-2xl font-bold text-dark mb-8 text-center">Programme</h2>
                    {steps.length > 0 ? (
                        <div className="mx-auto max-w-4xl space-y-4">
                            {steps.map((step) => (
                                <div key={step.id} className="rounded-2xl bg-light p-6 shadow-sm">
                                    <div className="flex items-start gap-4">
                                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent font-bold text-white">
                                            {step.step_number}
                                        </span>
                                        <div>
                                            <h3 className="text-lg font-semibold text-dark">{step.title}</h3>
                                            {step.description && (
                                                <p className="mt-2 text-dark/75">{step.description}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="w-full py-12 bg-gray-100 rounded-xl flex items-center justify-center">
                            <p className="text-gray-500">Programme non renseigné pour le moment</p>
                        </div>
                    )}
                </div>
            )}

            {selectedSection === 'informations' && (
                <div className="max-w-[90vw] w-full mt-12">
                    <h2 className="text-2xl font-bold text-dark mb-8 text-center">{dict.experiences.informations}</h2>
                    <div className="grid grid-cols-1 gap-8">
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
                        {experience.additional_info && (
                            <div className="bg-light rounded-2xl p-6 shadow-sm">
                                <div className="flex items-center gap-3 mb-4">
                                    <Info size={24} className="text-accent" />
                                    <h3 className="text-xl font-semibold text-dark">{dict.experiences.importantInfo}</h3>
                                </div>
                                <p className="text-dark whitespace-pre-wrap">{experience.additional_info}</p>
                            </div>
                        )}
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
                                {avgRating > 0 ? avgRating.toFixed(1) : '-'}
                            </span>
                            <span className="text-gray-500">/ 5</span>
                        </div>
                        <div className="flex">
                            {[...Array(5)].map((_, i) => (
                                avgRating >= i + 1 ? (
                                    <AiFillStar key={i} className="text-secondary text-2xl" />
                                ) : avgRating >= i + 0.5 ? (
                                    <BsStarHalf key={i} className="text-secondary text-2xl" />
                                ) : (
                                    <AiOutlineStar key={i} className="text-gray-300 text-2xl" />
                                )
                            ))}
                        </div>
                        <span className="text-gray-500">({reviewCountLabel} {dict.common.review})</span>
                    </div>

                    {/* Liste des avis */}
                    {reviews.length > 0 ? (
                        <div className="space-y-6">
                            {reviews.map((review) => (
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