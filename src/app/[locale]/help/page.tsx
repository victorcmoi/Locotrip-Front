'use client';

import React, { useState } from "react";
import { useTranslations } from "@/providers/i18n.provider";
import { IoChevronDown } from "react-icons/io5";

export default function HelpPage() {
    const dict = useTranslations();
    const [openQuestion, setOpenQuestion] = useState<number | null>(null);

    const toggleQuestion = (index: number) => {
        setOpenQuestion(openQuestion === index ? null : index);
    };

    const faqItems = [
        {
            question: dict.help.faq1Question,
            answer: dict.help.faq1Answer
        },
        {
            question: dict.help.faq2Question,
            answer: dict.help.faq2Answer
        },
        {
            question: dict.help.faq3Question,
            answer: dict.help.faq3Answer
        },
        {
            question: dict.help.faq4Question,
            answer: dict.help.faq4Answer
        },
        {
            question: dict.help.faq5Question,
            answer: dict.help.faq5Answer
        }
    ];

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
        <section id="help-center" className="w-full bg-light">
            <div className="page-hero flex items-center bg-linear-to-r from-accent to-primary">
                <div className="page-content">
                    <h1 className="text-white">{dict.help.title}</h1>
                </div>
            </div>

            <div className="page-content page-section">
                <p className="text-lg md:text-xl font-semibold mb-12 leading-relaxed text-left w-full lg:w-3/5">{dict.help.intro}</p>

                {/* FAQ Section */}
                <div className="mb-16">
                    <h2 className="mb-8">{dict.help.faqTitle}</h2>
                    <div className="">
                        {faqItems.map((item, index) => (
                            <div 
                                key={index}
                                className="border-b border-gray-300 pt-6 pb-2"
                            >
                                <button
                                    onClick={() => toggleQuestion(index)}
                                    className="w-full flex items-center justify-between text-left bg-light rounded-full px-6 py-4"
                                >
                                    <p className="text-accent text-2xl pr-4">{item.question}</p>
                                    <div className="shrink-0 w-10 h-10 rounded-full bg-light flex items-center justify-center border border-dark">
                                        <IoChevronDown 
                                            className={`text-accent text-2xl transition-transform duration-300 ${
                                                openQuestion === index ? 'rotate-180' : ''
                                            }`}
                                        />
                                    </div>
                                </button>
                                <div 
                                    className={`overflow-hidden transition-all duration-300 ${
                                        openQuestion === index ? 'max-h-96 my-4 mx-6' : 'max-h-0'
                                    }`}
                                >
                                    {item.answer.includes('•') ? (
                                        <ol className="space-y-2 text-dark text-base list-decimal list-inside">
                                            {item.answer.split('•').map((step, stepIndex) => (
                                                step.trim() && <li key={stepIndex}>{step.trim()}</li>
                                            ))}
                                        </ol>
                                    ) : (
                                        <p className="text-dark text-base leading-relaxed">
                                            {renderTextWithLinks(item.answer)}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Technical Assistance */}
                <div className="mb-20">
                    <h2 className="mb-4">{dict.help.technicalTitle}</h2>
                    <p className="mb-4 text-dark">{dict.help.technicalIntro}</p>
                    <p className="mb-2 text-dark">{renderTextWithLinks(dict.help.technicalContact)}</p>
                    <p className="text-sm text-gray">{dict.help.technicalResponse}</p>
                </div>

                {/* Issue with Experience */}
                <div className="mb-16">
                    <h2 className="mb-4">{dict.help.issueTitle}</h2>
                    <p className="mb-4 text-dark">{dict.help.issueIntro}</p>
                    <ol className="space-y-2 list-decimal list-inside text-dark">
                        <li>{dict.help.issueStep1}</li>
                        <li>{dict.help.issueStep2}</li>
                        <li>{dict.help.issueStep3}</li>
                    </ol>
                </div>
            </div>
        </section>
    );
}
