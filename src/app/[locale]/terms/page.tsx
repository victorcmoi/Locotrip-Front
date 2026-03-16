'use client';

import React from "react";
import { useTranslations } from "@/providers/i18n.provider";

export default function TermsPage() {
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
        <section id="terms-of-use" className="w-full bg-light">
            <div className="page-hero flex items-center bg-linear-to-r from-accent to-primary">
                <div className="page-content">
                    <h1 className="text-white">{dict.terms.title}</h1>
                </div>
            </div>

            <div className="page-content page-section">
                <p className="text-sm text-gray mb-8 italic">{dict.terms.lastUpdate}</p>

                <Section title={`1. ${dict.terms.section1Title}`}>
                    <p>{renderTextWithLinks(dict.terms.section1Text)}</p>
                </Section>

                <Section title={`2. ${dict.terms.section2Title}`}>
                    <p>{renderTextWithLinks(dict.terms.section2Text)}</p>
                </Section>

                <Section title={`3. ${dict.terms.section3Title}`}>
                    <p>{renderTextWithLinks(dict.terms.section3Text)}</p>
                </Section>

                <Section title={`4. ${dict.terms.section4Title}`}>
                    <p>{renderTextWithLinks(dict.terms.section4Text)}</p>
                </Section>

                <Section title={`5. ${dict.terms.section5Title}`}>
                    <p className="mb-3">{dict.terms.section5Intro}</p>
                    <BulletList items={dict.terms.section5Items} />
                </Section>

                <Section title={`6. ${dict.terms.section6Title}`}>
                    <p>{renderTextWithLinks(dict.terms.section6Text)}</p>
                </Section>

                <Section title={`7. ${dict.terms.section7Title}`}>
                    <p>{renderTextWithLinks(dict.terms.section7Text)}</p>
                </Section>

                <Section title={`8. ${dict.terms.section8Title}`}>
                    <p>{renderTextWithLinks(dict.terms.section8Text)}</p>
                </Section>

                <Section title={`9. ${dict.terms.section9Title}`}>
                    <p>{renderTextWithLinks(dict.terms.section9Text)}</p>
                </Section>
            </div>
        </section>
    );
}
