'use client';

import React from "react";
import { useTranslations } from "@/providers/i18n.provider";

export default function GuidePage() {
    const dict = useTranslations();

    return (
        <section id="become-guide" className="w-full">
            <div className="flex items-center w-full py-24 px-12 bg-[url(/assets/guide-banner.avif)] bg-cover bg-center">
                <h2 className="text-white">{dict.guide.becomeGuide}</h2>
            </div>  

            <div className="flex flex-wrap justify-between py-12">
                <h2 className="text-center text-accent w-full">
                    {dict.guide.introTitle}<br />
                    {dict.guide.introTitle2}
                </h2>
                <div>
                    <h2>{dict.guide.reasonsTitle1}</h2>
                </div>
            </div>
        </section>
    );
}