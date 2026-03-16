'use client';

import React from "react";
import { useTranslations } from "@/providers/i18n.provider";

export default function CookiesPage() {
    const dict = useTranslations();

    const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
        <div className="mb-8">
            <h3 className="text-primary mb-4">{title}</h3>
            {children}
        </div>
    );

    const renderTextWithLinks = (text: string) => {
        const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
        const parts = text.split(urlRegex);
        
        return parts.map((part, index) => {
            if (part.match(urlRegex)) {
                const href = part.startsWith('http') ? part : 
                           part.includes('@') ? `mailto:${part}` : 
                           `https://${part}`;
                return (
                    <a key={index} href={href} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                        {part}
                    </a>
                );
            }
            return <span className="text-dark" key={index}>{part}</span>;
        });
    };

    return (
        <section id="cookies-policy" className="w-full bg-light">
            <div className="page-hero flex items-center bg-linear-to-r from-accent to-primary">
                <div className="page-content">
                    <h1 className="text-white">{dict.cookies.title}</h1>
                </div>
            </div>

            <div className="page-content page-section">
                <Section title={`1. ${dict.cookies.section1Title}`}>
                    <p>{renderTextWithLinks(dict.cookies.section1Text)}</p>
                </Section>

                <Section title={`2. ${dict.cookies.section2Title}`}>
                    <div className="space-y-6">
                        <div>
                            <p className="font-semibold text-dark mb-2">{dict.cookies.section2Sub1}</p>
                            <p className="text-dark">{dict.cookies.section2Sub1Text}</p>
                        </div>
                        <div>
                            <p className="font-semibold text-dark mb-2">{dict.cookies.section2Sub2}</p>
                            <p className="text-dark">{dict.cookies.section2Sub2Text}</p>
                        </div>
                        <div>
                            <p className="font-semibold text-dark mb-2">{dict.cookies.section2Sub3}</p>
                            <p className="text-dark">{dict.cookies.section2Sub3Text}</p>
                        </div>
                    </div>
                </Section>

                <Section title={`3. ${dict.cookies.section3Title}`}>
                    <p>{renderTextWithLinks(dict.cookies.section3Text)}</p>
                </Section>

                <Section title={`4. ${dict.cookies.section4Title}`}>
                    <p>{renderTextWithLinks(dict.cookies.section4Text)}</p>
                </Section>
            </div>
        </section>
    );
}
