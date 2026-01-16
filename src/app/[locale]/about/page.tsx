'use client';

import React from "react";

import { useTranslations } from "@/providers/i18n.provider";

export default function aboutPage() {
    const dict = useTranslations();

    return (
        <section id="about-us" className="w-full bg-light">
            <div className="flex items-center w-full py-24 px-32 bg-[url(/assets/guide-banner.avif)] bg-cover bg-center">
                <h1 className="text-white">{dict.about.title}</h1>
            </div> 

            <div className="w-1/2 py-24 mx-44 px-22">
                <h2 className="mb-12 text-xl"><span className="text-primary ">{dict.about.intro1}</span> {dict.about.intro2}</h2>
                <p className="mb-8">{dict.about.subIntro}</p>
            </div>
        </section>
    );
}