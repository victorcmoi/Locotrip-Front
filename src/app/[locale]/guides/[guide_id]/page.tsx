'use client';

import React from "react";
import { useTranslations } from "@/providers/i18n.provider";
import Image from "next/image";
import { useGuideById } from "@/services/guides/getGuides";
import { LuMapPin } from "react-icons/lu";
import { IoCheckmarkCircle } from "react-icons/io5";

export default function GuideProfile({params}: {params: { guide_id: string}}) {
    const dict = useTranslations();
    const guideId = params.guide_id;

    const { data : guide, isLoading, error } = useGuideById(guideId);

    if (isLoading) {
        return <div>Chargement...</div>;
    }

    if (error) {
        return <div>Erreur lors du chargement du guide</div>;
    }

    return (
        <section id="guide-profile" className="w-full grid grid-cols-12 items-center bg-light p-12 gap-8">
            <div className="flex col-span-5 text-center flex-col items-center">
                <Image
                    src={(guide?.photoUrl as string) || "/assets/guide-pp-default.avif"}
                    alt={`${guide?.user?.first_name} ${guide?.user?.last_name}`}
                    width={300}
                    height={300}
                    className="object-cover rounded-full shadow-lg"
                />
                <p className="flex items-center gap-2 text-xl text-dark"><LuMapPin /> {guide?.country}</p>    
                <p className="mt-4 text-base text-dark">{guide?.bio}</p>
            </div>
            <div className="flex col-span-7">
                <h1 className="text-3xl font-bold mb-4">{guide?.user?.first_name} <span className="uppercase">{guide?.user?.last_name}</span></h1>
                {guide?.guide_status === 'pro' && (
                    <p className="flex items-center gap-2 text accent-accent"><IoCheckmarkCircle /> {dict.guides.profile.guidePro}</p>
                )}
                
            </div>
        </section>
    );
}