'use client';

import React, { useMemo, useState } from "react";
import { useTranslations } from "@/providers/i18n.provider";
import { useLocalizedPath } from "@/providers/i18n.provider";
import Image from "next/image";
import { useGuideById } from "@/services/guides/getGuides";
import { getExperienceAvailabilities, useExperiencesByGuide } from "@/services/experiences/getExperiences";
import { LuMapPin } from "react-icons/lu";
import { IoCheckmarkCircle } from "react-icons/io5";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";
import { BsStarHalf } from "react-icons/bs";
import { use } from "react";
import { MdLanguage } from "react-icons/md";
import { BsCalendar2 } from "react-icons/bs";
import { PiHandbagLight } from "react-icons/pi";
import { Calendar } from "@/components/ui/calendar/Calendar";
import { MinioHelpers } from "@/utils/minio";
import dayjs from "@/lib/dayjs";
import { useQueries } from "@tanstack/react-query";
import ExperiencesCarousel from "@/components/ui/experiences/ExperiencesCarousel";
import Link from "next/link";
import MessagerieRoutes from "@/utils/routes/messagerie.routes";

export default function GuideProfile({params}: {params: Promise<{ guide_id: string; locale: string }>}) {
    const dict = useTranslations();
    const localizedPath = useLocalizedPath();
    const { guide_id: guideId, locale } = use(params);
    const { data: guide, isLoading, error } = useGuideById(guideId);
    const { data: experiences, isLoading: experiencesLoading } = useExperiencesByGuide(guideId);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const dateLocaleMap: Record<string, string> = {
        fr: "fr-FR",
        en: "en-US",
        de: "de-DE",
        sp: "es-ES",
    };
    const dateLocale = dateLocaleMap[locale] ?? locale;

    const availabilityQueries = useQueries({
        queries: (experiences ?? []).map((experience) => ({
            queryKey: ["experience", experience.id, "availabilities"],
            queryFn: () => getExperienceAvailabilities(experience.id),
            enabled: !!experience.id,
        })),
    });

    const hobbies = guide?.hobbies?.map((h: { category?: { id: string; name: string } }) => h.category?.name).filter((name: string | undefined): name is string => !!name) || [];
    const profilePicture = guide?.medias?.[0]?.url;

    const reviews = useMemo(() => {
        const allReviews = (experiences ?? []).flatMap((experience) => experience.reviews ?? []);
        const dedupedReviews = new Map<string, (typeof allReviews)[number]>();
        for (const review of allReviews) {
            dedupedReviews.set(review.id, review);
        }
        return Array.from(dedupedReviews.values()).sort(
            (a, b) => new Date(b.review_date).getTime() - new Date(a.review_date).getTime()
        );
    }, [experiences]);

    const guideExperiences = useMemo(() => {
        const baseExperiences = (experiences ?? []).filter((experience) => experience.is_published);
        return baseExperiences.map((experience) => ({
            ...experience,
            guide: {
                id: guide?.id ?? guideId,
                user: {
                    id: guide?.user?.id ?? "",
                    first_name: guide?.user?.first_name ?? "",
                    last_name: guide?.user?.last_name ?? "",
                },
                bio: guide?.bio,
                languages: guide?.languages,
                country: guide?.country,
                pro_card: guide?.pro_card,
                reviewCount: guide?.reviewCount,
                medias: guide?.medias,
            },
        }));
    }, [experiences, guide, guideId]);

    const availableDatesStr = useMemo(() => {
        const dates = new Set<string>();

        for (const query of availabilityQueries) {
            const availabilities = query.data ?? [];
            for (const availability of availabilities) {
                if (availability.status !== "available") continue;

                let current = dayjs(availability.start_date).startOf("day");
                const end = dayjs(availability.end_date).startOf("day");

                while (current.isBefore(end, "day") || current.isSame(end, "day")) {
                    dates.add(current.format("YYYY-MM-DD"));
                    current = current.add(1, "day");
                }
            }
        }

        return dates;
    }, [availabilityQueries]);

    const availabilityCountsByDate = useMemo(() => {
        const counts: Record<string, number> = {};

        for (const query of availabilityQueries) {
            const availabilities = query.data ?? [];
            for (const availability of availabilities) {
                if (availability.status !== "available") continue;

                let current = dayjs(availability.start_date).startOf("day");
                const end = dayjs(availability.end_date).startOf("day");

                while (current.isBefore(end, "day") || current.isSame(end, "day")) {
                    const key = current.format("YYYY-MM-DD");
                    counts[key] = (counts[key] ?? 0) + 1;
                    current = current.add(1, "day");
                }
            }
        }

        return counts;
    }, [availabilityQueries]);

    const selectableDates = useMemo(
        () => Array.from(availableDatesStr).map((dateKey) => dayjs(dateKey).toDate()),
        [availableDatesStr]
    );

    const today = useMemo(() => dayjs().startOf("day"), []);
    const maxSelectableDate = useMemo(() => {
        const latestDate = Array.from(availableDatesStr).sort().at(-1);
        return latestDate ? dayjs(latestDate).toDate() : undefined;
    }, [availableDatesStr]);

    const unavailableDates = useMemo(() => {
        if (!maxSelectableDate) return [] as Date[];

        const maxDate = dayjs(maxSelectableDate).startOf("day");
        const daysToCover = maxDate.diff(today, "day");
        if (daysToCover < 0) return [] as Date[];

        const dates: Date[] = [];
        for (let i = 0; i <= daysToCover; i++) {
            const d = today.add(i, "day");
            if (!availableDatesStr.has(d.format("YYYY-MM-DD"))) {
                dates.push(d.toDate());
            }
        }

        return dates;
    }, [availableDatesStr, maxSelectableDate, today]);

    const isCalendarLoading = experiencesLoading || availabilityQueries.some((query) => query.isLoading);
    const avgRating = guide?.avgRating ?? 0;
    const reviewCount = guide?.reviewCount ?? 0;
    const reviewCountLabel = reviewCount > 99 ? '99+' : `${reviewCount}`;

    if (isLoading) {
        return <div className="flex items-center justify-center min-h-95 text-2xl font-medium">{dict.guides.profile.loading}</div>;
    }

    if (error || !guide) {
        return <div className="flex items-center justify-center min-h-95 text-2xl font-medium text-red-500">{dict.guides.profile.error}</div>;
    }

    return (
        <section id="guide-profile" className="flex flex-col w-full items-center justify-center pt-20 pb-16">
            <div className="w-full min-h-[85vh] grid grid-cols-1 lg:grid-cols-12 items-start bg-light px-4 sm:px-6 lg:px-12 py-10 lg:py-16 gap-10 lg:gap-16">
                <div className="flex lg:col-span-5 text-center flex-col items-center gap-4">
                    <Image
                        src={MinioHelpers.guideProfile(guide?.id, profilePicture)}
                        alt={`${guide?.user?.first_name} ${guide?.user?.last_name}`}
                        width={320}
                        height={320}
                        className="object-cover rounded-full shadow-lg w-80 h-80"
                    />
                    <p className="flex items-center justify-center gap-2 text-2xl font-bold text-dark mt-4"><LuMapPin className="text-2xl" /> {guide?.country}</p>    
                    <p className="mt-2 text-lg leading-relaxed text-dark max-w-lg">"{guide?.bio}"</p>
                </div>
                <div className="flex flex-col justify-start items-start lg:col-span-7 gap-6 w-full">
                    <h1 className="text-3xl md:text-4xl font-bold">{guide?.user?.first_name} <span className="uppercase text-dark">{guide?.user?.last_name}</span></h1>
                    {guide?.guide_status === 'pro' && (
                        <p className="flex items-center gap-2 text-lg font-medium text-accent"><IoCheckmarkCircle className="text-3xl" /> {dict.guides.profile.guidePro}</p>
                    )}
                    {reviewCount > 0 && (
                        <div className="flex items-center gap-3 mt-2">
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
                            <span className="text-dark text-lg font-medium">{reviewCountLabel} {dict.common.review}</span>
                        </div>
                    )}
                    <p className="text-lg font-medium flex items-center gap-2 mt-2"><MdLanguage className="text-3xl" /> {guide?.languages}</p>
                    <div className="grid grid-cols-2 mt-8 max-w-4xl">
                        <div className="flex-col col-span-1 border border-gray-light px-5 py-2">
                            <h4 className="flex items-center gap-3 mb-3 font-normal"><BsCalendar2 className="text-md" /> {dict.guides.profile.reservations} </h4>
                            <p className="text-2xl text-center font-bold">{guide?.experiencesCount}</p>
                        </div>
                        <div className="flex-col col-span-1 border border-gray-light px-5 py-2">
                            <h4 className="flex items-center gap-3 mb-3"><PiHandbagLight className="text-2xl" /> {dict.guides.profile.experience} </h4>
                            <p className="text-2xl text-center font-bold">{guide?.years_of_experience} {dict.guides.profile.years}</p>
                        </div>
                    </div>
                    <Link
                        href={localizedPath(MessagerieRoutes.NEW_CONVERSATION(guide.user?.id ?? guide.user_id))}
                        className="inline-flex text-white font-medium text-lg mt-6 cursor-pointer"
                    >
                        <button>
                            {dict.guides.profile.contactGuide}
                        </button>
                    </Link>
                </div>
            </div>
            <div className="w-full grid grid-cols-1 lg:grid-cols-12 px-4 sm:px-6 lg:px-24 py-10 lg:py-24 gap-10 lg:gap-26" style={{ background: "linear-gradient(180deg, #FCC13D 0%, rgba(226, 128, 32, 0.07) 100%)" }}>
                <div className="lg:col-span-5 flex flex-col items-start justify-start gap-6">
                    <h3 className="mb-6">{dict.guides.profile.hobbies}</h3>
                    <div className="flex flex-wrap gap-3">
                        {hobbies.length > 0 ? (
                            hobbies.map((hobby: string, index: number) => (
                                <span
                                    key={index}
                                    className="px-4 py-2 bg-light rounded-full text-base text-dark border border-gray-light font-medium"
                                >
                                    {hobby}
                                </span>
                            ))
                        ) : (
                            <p className="text-lg">{dict.guides.profile.noHobbies}</p>
                        )}
                    </div>
                </div>
                <div className="lg:col-span-7 flex flex-col items-start justify-start gap-6">
                    <h3 className="mb-6">{dict.guides.profile.availabilityTitle}</h3>
                    {isCalendarLoading ? (
                        <p className="text-lg text-dark">{dict.common.loading}</p>
                    ) : selectableDates.length > 0 ? (
                        <div className="w-full max-w-4xl">
                            <Calendar
                                mode="single"
                                selectedDate={selectedDate}
                                onChange={(date) => setSelectedDate(date as Date)}
                                unavailableDates={unavailableDates}
                                minDate={new Date()}
                                maxDate={maxSelectableDate}
                                selectableDates={selectableDates}
                                strikeThroughUnavailableDates={true}
                                monthsToShow={2}
                                locale={dateLocale}
                                dateHoverCounts={availabilityCountsByDate}
                                className="relative top-auto! left-auto! mt-0! w-full! max-w-none! translate-x-0!"
                            />
                        </div>
                    ) : (
                        <p className="text-lg text-dark">{dict.guides.profile.noAvailability}</p>
                    )}
                </div>
            </div>

            <div className="w-full px-4 sm:px-6 lg:px-24 py-12 lg:py-20">
                <h3 className="mb-8">{dict.guides.profile.experiencesSectionTitle}</h3>
                {guideExperiences.length > 0 ? (
                    <ExperiencesCarousel experiences={guideExperiences} />
                ) : (
                    <p className="text-lg text-dark">{dict.guides.profile.noExperiences}</p>
                )}
            </div>

            <div className="w-full px-4 sm:px-6 lg:px-24 pb-8 lg:pb-16">
                <h3 className="mb-8">{dict.guides.profile.reviewsSectionTitle}</h3>
                {reviews.length > 0 ? (
                    <div className="space-y-6">
                        {reviews.map((review) => (
                            <div key={review.id} className="bg-light rounded-2xl p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white font-semibold">
                                            {review.user?.first_name?.charAt(0) ?? "?"}
                                        </div>
                                        <span className="font-semibold text-dark">
                                            {review.user?.first_name} {review.user?.last_name?.charAt(0)}.
                                        </span>
                                    </div>
                                    <div className="flex">
                                        {[...Array(5)].map((_, i) => (
                                            <AiFillStar
                                                key={i}
                                                className={`text-lg ${i < review.rating ? "text-secondary" : "text-gray-300"}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                                {review.title && <p className="font-semibold text-dark mb-2">{review.title}</p>}
                                {review.comment && <p className="text-dark">{review.comment}</p>}
                                <p className="text-gray-400 text-sm mt-3">
                                    {new Date(review.review_date).toLocaleDateString(dateLocale, { day: "numeric", month: "long", year: "numeric" })}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-lg text-dark">{dict.guides.profile.noReviews}</p>
                )}
            </div>
        </section>
    );
}