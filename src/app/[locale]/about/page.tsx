'use client';

import React from "react";

import { useTranslations } from "@/providers/i18n.provider";

export default function aboutPage() {
    const dict = useTranslations();

    return (
        <section id="about-us" className="w-full bg-light">
            <div className="page-hero flex items-center bg-[url(/assets/guide-banner.avif)] bg-cover bg-center">
                <h1 className="text-white">{dict.about.title}</h1>
            </div> 

            <div className="page-content page-section max-w-4xl">
                <h2 className="mb-12 text-xl"><span className="text-primary ">{dict.about.intro1}</span> {dict.about.intro2}</h2>
                <p className="mb-8 prose-block">{dict.about.subIntro}</p>
            </div>
        </section>
    );
}