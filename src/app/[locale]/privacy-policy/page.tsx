'use client';

import React from "react";
import { useTranslations } from "@/providers/i18n.provider";

export default function PrivacyPolicyPage() {
    const dict = useTranslations();

    const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
        <div className="mb-8">
            <h3 className="text-primary mb-4">{title}</h3>
            {children}
        </div>
    );

    const BulletList = ({ items }: { items: string }) => (
        <ul className="list-none space-y-2 ml-4">
            {items.split('•').map((item, index) => (
                item.trim() && (
                    <li key={index} className="flex items-start">
                        <span className="text-dark mr-2">•</span>
                        <span className="text-dark">{item.trim()}</span>
                    </li>
                )
            ))}
        </ul>
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
        <section id="privacy-policy" className="w-full bg-light">
            <div className="flex items-center w-full py-24 px-12 bg-linear-to-r from-accent to-primary">
                <div className="max-w-7xl mx-auto w-full">
                    <h1 className="text-white">{dict.privacy.title}</h1>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8 py-16">
                <p className="text-sm text-gray mb-8 italic">{dict.privacy.lastUpdate}</p>
                
                <p className="text-lg mb-12 leading-relaxed">{dict.privacy.intro}</p>

                <Section title={`1. ${dict.privacy.section1Title}`}>
                    <p className="mb-2">{renderTextWithLinks(dict.privacy.section1Text)}</p>
                    <p className="mb-2">{renderTextWithLinks(dict.privacy.section1Contact)}</p>
                    <p>{renderTextWithLinks(dict.privacy.section1Address)}</p>
                </Section>

                <Section title={`2. ${dict.privacy.section2Title}`}>
                    <p className="mb-4">{dict.privacy.section2Intro}</p>
                    <div className="mb-4">
                        <p className="font-semibold mb-2">{dict.privacy.section2Sub1}</p>
                        <BulletList items={dict.privacy.section2Sub1Items} />
                    </div>
                    <div>
                        <p className="font-semibold mb-2">{dict.privacy.section2Sub2}</p>
                        <BulletList items={dict.privacy.section2Sub2Items} />
                    </div>
                </Section>

                <Section title={`3. ${dict.privacy.section3Title}`}>
                    <p className="mb-3">{dict.privacy.section3Intro}</p>
                    <BulletList items={dict.privacy.section3Items} />
                </Section>

                <Section title={`4. ${dict.privacy.section4Title}`}>
                    <p className="mb-3">{dict.privacy.section4Intro}</p>
                    <BulletList items={dict.privacy.section4Items} />
                </Section>

                <Section title={`5. ${dict.privacy.section5Title}`}>
                    <p className="mb-3">{dict.privacy.section5Intro}</p>
                    <BulletList items={dict.privacy.section5Items} />
                    <p className="mt-4 font-semibold text-primary">{dict.privacy.section5Note}</p>
                </Section>

                <Section title={`6. ${dict.privacy.section6Title}`}>
                    <BulletList items={`${dict.privacy.section6Item1} • ${dict.privacy.section6Item2} • ${dict.privacy.section6Item3}`} />
                </Section>

                <Section title={`7. ${dict.privacy.section7Title}`}>
                    <p className="mb-3">{dict.privacy.section7Intro}</p>
                    <BulletList items={dict.privacy.section7Items} />
                    <p className="mt-4">{renderTextWithLinks(dict.privacy.section7Exercise)}</p>
                </Section>

                <Section title={`8. ${dict.privacy.section8Title}`}>
                    <p className="mb-3">{dict.privacy.section8Text}</p>
                    <p className="italic text-gray">{dict.privacy.section8Examples}</p>
                </Section>

                <Section title={`9. ${dict.privacy.section9Title}`}>
                    <p className="mb-3">{dict.privacy.section9Intro}</p>
                    <BulletList items={dict.privacy.section9Items} />
                    <p className="mt-4">{dict.privacy.section9Manage}</p>
                </Section>

                <Section title={`10. ${dict.privacy.section10Title}`}>
                    <p>{dict.privacy.section10Text}</p>
                </Section>

                <Section title={`11. ${dict.privacy.section11Title}`}>
                    <p>{renderTextWithLinks(dict.privacy.section11Text)}</p>
                </Section>
            </div>
        </section>
    );
}
        