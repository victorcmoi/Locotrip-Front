'use client';

import React from "react";
import { useTranslations } from "@/providers/i18n.provider";
import Image from "next/image";
import { GrStatusGood } from "react-icons/gr";

export default function GuidePage() {
    const dict = useTranslations();

    return (
        <section id="become-guide" className="w-full">
            <div className="flex items-center w-full py-24 px-32 bg-[url(/assets/guide-banner.avif)] bg-cover bg-center">
                <h1 className="text-white">{dict.guide.becomeGuide}</h1>
            </div>  

            <div className="flex flex-wrap justify-between py-16">
                <h2 className="text-center text-accent w-full">
                    {dict.guide.introTitle}<br />
                    {dict.guide.introTitle2}
                </h2>
                <div className="flex px-32 py-16">
                    <h2 className="w-1/3">{dict.guide.reasonsTitle1}</h2>
                    <div className="grid grid-cols-2 gap-6 w-2/3">
                        <div className="flex flex-col justify-start gap-6">
                            <Image 
                                src="/assets/visibilite.png"
                                alt="Visibility Icon"
                                width={64}
                                height={64}
                            />
                            <h4 className="text-primary font-bold">{dict.guide.reason1}</h4>
                            <p>{dict.guide.reason1Sub}</p>
                        </div>

                        <div className="flex flex-col justify-start gap-6">
                            <Image 
                                src="/assets/accompagnement.png"
                                alt="Accompaniment Icon"
                                width={64}
                                height={64}
                            />
                            <h4 className="text-primary font-bold">{dict.guide.reason2}</h4>
                            <p>{dict.guide.reason2Sub}</p>
                        </div>

                        <div className="flex flex-col justify-start gap-6">
                            <Image 
                                src="/assets/interface-simple.png"
                                alt="Simple Interface Icon"
                                width={64}
                                height={64}
                            />
                            <h4 className="text-primary font-bold">{dict.guide.reason3}</h4>
                            <p>{dict.guide.reason3Sub}</p>
                        </div>

                        <div className="flex flex-col justify-start gap-6">
                            <Image 
                                src="/assets/tarif.png"
                                alt="Tarif Icon"
                                width={64}
                                height={64}
                            />
                            <h4 className="text-primary font-bold">{dict.guide.reason4}</h4>
                            <p>{dict.guide.reason4Sub}</p>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col px-32 py-16 w-full">
                    <h2 className="">{dict.guide.reasonsTitle2}</h2>
                    <div className="flex flex-col gap-8 mt-12 ms-16">
                        <div className="flex items-center gap-6">
                            <GrStatusGood
                                size={48}
                            />
                            {dict.guide.reason5}
                        </div>
                        <div className="flex items-center gap-6">
                            <GrStatusGood
                                size={48}
                            />
                            {dict.guide.reason6}
                        </div>
                        <div className="flex items-center gap-6">
                            <GrStatusGood
                                size={48}
                            />
                            {dict.guide.reason7}
                        </div>
                        <div className="flex items-center gap-6">
                            <GrStatusGood
                                size={48}
                            />
                            {dict.guide.reason8}
                        </div>
                    </div>    
                </div>
                <div className="flex px-32 py-16 w-full gap-42 items-center">
                    <div className="px-16 py-20 w-5/12 rounded-3xl shadow-2xl">
                        <h2 className="mb-16 text-center">{dict.guide.reasonTitle3}</h2>
                        
                        <div className="flex flex-col relative">
                            {/* Step 1 */}
                            <div className="flex gap-8 items-start relative">
                                <div className="shrink-0 flex flex-col items-center">
                                    <div className="step-circle w-16 h-16 rounded-full flex items-center justify-center relative z-10 bg-white">
                                        <span className="text-secondary font-bold text-2xl">1</span>
                                    </div>
                                    <div className="step-line w-1 mt-2 mb-2 h-14" />
                                </div>
                                <div className="pt-3 pb-8 w-2/3">
                                    <p className="font-semibold leading-relaxed">{dict.guide.step1}</p>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className="flex gap-8 items-start relative">
                                <div className="shrink-0 flex flex-col items-center">
                                    <div className="step-circle w-16 h-16 rounded-full flex items-center justify-center relative z-10 bg-white">
                                        <span className="text-secondary font-bold text-2xl">2</span>
                                    </div>
                                    <div className="step-line w-1 mt-2 mb-2 h-14" />
                                </div>
                                <div className="w-2/3 pt-3 pb-8">
                                    <p className="font-semibold leading-relaxed">{dict.guide.step2}</p>
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div className="flex gap-8 items-start relative">
                                <div className="shrink-0 flex flex-col items-center">
                                    <div className="step-circle w-16 h-16 rounded-full flex items-center justify-center relative z-10 bg-white">
                                        <span className="text-secondary font-bold text-2xl">3</span>
                                    </div>
                                    <div className="step-line w-1 mt-2 mb-2 h-14" />
                                </div>
                                <div className="w-2/3 pt-3 pb-8">
                                    <p className="font-semibold leading-relaxed">{dict.guide.step3}</p>
                                </div>
                            </div>

                            {/* Step 4 */}
                            <div className="flex gap-8 items-start relative">
                                <div className="shrink-0 flex flex-col items-center">
                                    <div className="step-circle w-16 h-16 rounded-full flex items-center justify-center relative z-10 bg-white">
                                        <span className="text-secondary font-bold text-2xl">4</span>
                                    </div>
                                    <div className="step-line w-1 mt-2 mb-2 h-14" />
                                </div>
                                <div className="w-2/3 pt-3">
                                    <p className="font-semibold leading-relaxed">{dict.guide.step4}</p>
                                </div>
                            </div>
                        </div>

                        <button className="mt-8 text-white py-4 px-6">
                            Je postule
                        </button>
                    </div>

                    
                    <div className="w-1/2 h-150 relative rounded-2xl overflow-hidden">
                        <Image 
                            src="/assets/guide-home-4.avif"
                            alt="Become a guide"
                            fill
                            className="object-cover"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}