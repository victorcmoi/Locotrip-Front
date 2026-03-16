'use client';

import React, { useState } from "react";
import { useTranslations } from "@/providers/i18n.provider";
import Image from "next/image";
import { useGuideById } from "@/services/guides/getGuides";
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

export default function GuideProfile({params}: {params: Promise<{ guide_id: string}>}) {
    const dict = useTranslations();
    const { guide_id: guideId } = use(params);
    const { data: guide, isLoading, error } = useGuideById(guideId);
    const [selectedButton, setSelectedButton] = useState<"offers" | "pictures" | "about" | "reviews">(
        "offers"
    );
    if (isLoading) {
        return <div className="flex items-center justify-center min-h-95 text-2xl font-medium">{dict.guides.profile.loading}</div>;
    }

    if (error) {
        return <div className="flex items-center justify-center min-h-95 text-2xl font-medium text-red-500">{dict.guides.profile.error}</div>;
    }

    const hobbies = guide?.hobbies?.map((h: { category?: { id: string; name: string } }) => h.category?.name).filter((name: string | undefined): name is string => !!name) || [];
    const profilePicture = guide?.medias?.[0]?.url;
    const avgRating = guide?.avgRating ?? 0;
    const reviewCount = guide?.reviewCount ?? 0;
    const reviewCountLabel = reviewCount > 99 ? '99+' : `${reviewCount}`;
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
                    <button className="text-white font-medium text-lg mt-6">{dict.guides.profile.contactGuide}</button>
                </div>
            </div>
            <div className="w-full grid grid-cols-1 lg:grid-cols-12 px-4 sm:px-6 lg:px-24 py-10 lg:py-24 gap-10 lg:gap-32" style={{ background: "linear-gradient(180deg, #FCC13D 0%, rgba(226, 128, 32, 0.07) 100%)" }}>
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
                    <h3 className="mb-6">{dict.guides.profile.about}</h3>
                </div>
            </div>
        </section>
    );
}