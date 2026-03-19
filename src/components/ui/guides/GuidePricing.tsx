"use client";

import React from "react";
import {
  Sprout,
  Target,
  Compass,
  Calendar,
  Users,
  MessageCircle,
  BarChart3,
  LifeBuoy,
  Lightbulb,
  Briefcase,
  Mail,
  Headset,
  Rocket,
  Bot,
  Plug,
  CheckCircle,
  Check,
} from "lucide-react";
import Link from "next/link";
import { useLocalizedPath, useTranslations } from "@/providers/i18n.provider";
import { GUIDES_ROUTES } from "@/utils/routes";

interface GuidePricingProps {
  variant?: "short" | "detailed";
}

export default function GuidePricing({ variant = "detailed" }: GuidePricingProps) {
  const localizedPath = useLocalizedPath();
  const dict = useTranslations();

  return (
    <div className="w-full">
      <div className="text-center mb-16">
        <h2 className="mb-4">{dict.guides.pricing.title}</h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          {dict.guides.pricing.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* ESSENTIEL */}
        <div className="flex flex-col bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
          <div className="p-8 pb-6 bg-slate-50 border-b border-gray-100">
            <h3 className="text-2xl font-bold flex items-center gap-3 mb-2">
              <Sprout className="text-accent" size={28} />
              {dict.guides.pricing.essential.title}
            </h3>
            <div className="mt-4 mb-2">
              <span className="text-4xl font-extrabold text-gray-800">
                {dict.guides.pricing.essential.price}
              </span>
              <span className="text-gray-500">
                {dict.guides.pricing.essential.perMonth}
              </span>
            </div>
            <p className="text-sm font-semibold text-accent mb-4">
              {dict.guides.pricing.essential.commission}
            </p>
            <p className="text-gray-600 text-sm italic">
              {dict.guides.pricing.essential.badge}
            </p>
          </div>

          <div className="p-8 flex-1 flex flex-col gap-6">
            <div>
              <h4 className="flex items-center gap-2 !text-xl font-bold mb-3 text-gray-800">
                <Target size={18} className="text-accent" />{" "}
                {dict.guides.pricing.essential.targetTitle}
              </h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <Check size={16} className="text-accent shrink-0 mt-0.5" />{" "}
                  {dict.guides.pricing.essential.targets[0]}
                </li>
                <li className="flex items-start gap-2">
                  <Check size={16} className="text-accent shrink-0 mt-0.5" />{" "}
                  {dict.guides.pricing.essential.targets[1]}
                </li>
                <li className="flex items-start gap-2">
                  <Check size={16} className="text-accent shrink-0 mt-0.5" />{" "}
                  {dict.guides.pricing.essential.targets[2]}
                </li>
                <li className="flex items-start gap-2">
                  <Check size={16} className="text-accent shrink-0 mt-0.5" />{" "}
                  {dict.guides.pricing.essential.targets[3]}
                </li>
              </ul>
            </div>

            {variant === "detailed" && (
              <>
                <div className="space-y-4">
              <div className="text-sm">
                <h5 className="font-bold flex items-center gap-2 mb-1 text-gray-800">
                  <Compass size={16} className="text-accent" />{" "}
                  {dict.guides.pricing.essential.activitiesTitle}
                </h5>
                <p className="text-gray-600 ml-6">
                  {dict.guides.pricing.essential.activitiesDesc}
                </p>
              </div>
              <div className="text-sm">
                <h5 className="font-bold flex !text-base items-center gap-2 mb-1 text-gray-800">
                  <Calendar size={16} className="text-accent" />{" "}
                  {dict.guides.pricing.essential.bookingsTitle}
                </h5>
                <p className="text-gray-600 ml-6">
                  {dict.guides.pricing.essential.bookingsDesc}
                </p>
              </div>
              <div className="text-sm">
                <h5 className="font-bold flex !text-base items-center gap-2 mb-1 text-gray-800">
                  <Users size={16} className="text-accent" />{" "}
                  {dict.guides.pricing.essential.crmTitle}
                </h5>
                <p className="text-gray-600 ml-6">
                  {dict.guides.pricing.essential.crmDesc}
                </p>
              </div>
              <div className="text-sm">
                <h5 className="font-bold flex !text-base items-center gap-2 mb-1 text-gray-800">
                  <MessageCircle size={16} className="text-accent" />{" "}
                  {dict.guides.pricing.essential.commsTitle}
                </h5>
                <p className="text-gray-600 ml-6">
                  {dict.guides.pricing.essential.commsDesc}
                </p>
              </div>
            </div>

            <div className="mt-auto pt-6 border-t border-gray-100">
              <h5 className="font-bold flex !text-base items-center gap-2 text-sm mb-2 text-gray-800">
                <Lightbulb size={16} className="text-amber-500" />{" "}
                {dict.guides.pricing.essential.whyTitle}
              </h5>
              <p className="text-xs text-gray-600">
                {dict.guides.pricing.essential.whyDesc}
              </p>
            </div>
              </>
            )}

            <div className="pt-4 mt-auto">
              <Link
                href={variant === "short" ? localizedPath(GUIDES_ROUTES.BECOME_GUIDE) : localizedPath(GUIDES_ROUTES.REGISTER_GUIDE)}
                className="block text-center w-full py-3 px-6 rounded-full font-semibold border-2 border-accent text-accent hover:bg-accent hover:text-white transition-colors duration-300"
              >
                {variant === "short" ? dict.guides.pricing.seeMoreDetails : dict.guides.pricing.essential.cta}
              </Link>
            </div>
          </div>
        </div>

        {/* PRO */}
        <div className="flex flex-col bg-white rounded-3xl shadow-xl overflow-hidden hover:-translate-y-1 transition-transform duration-300 border-2 border-primary relative">
          <div className="absolute top-0 left-0 right-0 py-1 bg-primary text-white text-center text-xs font-bold uppercase tracking-wider">
            {dict.guides.pricing.pro.recommended}
          </div>
          <div className="p-8 pb-6 bg-primary/5 border-b border-primary/10 mt-6">
            <h3 className="text-2xl font-bold flex items-center gap-3 mb-2 text-primary">
              <Briefcase size={28} />
              {dict.guides.pricing.pro.title}
            </h3>
            <div className="mt-4 mb-2">
              <span className="text-4xl font-extrabold text-primary">
                {dict.guides.pricing.pro.price}
              </span>
              <span className="text-gray-600">
                {dict.guides.pricing.pro.perMonth}
              </span>
            </div>
            <p className="text-sm font-bold text-accent mb-4">
              {dict.guides.pricing.pro.commission}
            </p>
            <p className="text-gray-600 text-sm italic">
              {dict.guides.pricing.pro.badge}
            </p>
          </div>

          <div className="p-8 flex-1 flex flex-col gap-6">
            <div>
              <h4 className="flex items-center gap-2 !text-xl font-bold mb-3 text-gray-800">
                <Target size={18} className="text-primary" />{" "}
                {dict.guides.pricing.pro.targetTitle}
              </h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <Check size={16} className="text-primary shrink-0 mt-0.5" />{" "}
                  {dict.guides.pricing.pro.targets[0]}
                </li>
                <li className="flex items-start gap-2">
                  <Check size={16} className="text-primary shrink-0 mt-0.5" />{" "}
                  {dict.guides.pricing.pro.targets[1]}
                </li>
                <li className="flex items-start gap-2">
                  <Check size={16} className="text-primary shrink-0 mt-0.5" />{" "}
                  {dict.guides.pricing.pro.targets[2]}
                </li>
              </ul>
            </div>

            {variant === "detailed" && (
              <>
                <div className="space-y-4">
              <div className="text-sm">
                <h5 className="font-bold !text-base flex items-center gap-2 mb-1 text-gray-800">
                  <Compass size={16} className="text-primary" />{" "}
                  {dict.guides.pricing.pro.activitiesTitle}
                </h5>
                <p className="text-gray-600 ml-6">
                  {dict.guides.pricing.pro.activitiesDesc}
                </p>
              </div>
              <div className="text-sm">
                <h5 className="font-bold !text-base flex items-center gap-2 mb-1 text-gray-800">
                  <Calendar size={16} className="text-primary" />{" "}
                  {dict.guides.pricing.pro.bookingsTitle}
                </h5>
                <p className="text-gray-600 ml-6">
                  {dict.guides.pricing.pro.bookingsDesc}
                </p>
              </div>
              <div className="text-sm">
                <h5 className="font-bold !text-base flex items-center gap-2 mb-1 text-gray-800">
                  <Users size={16} className="text-primary" />{" "}
                  {dict.guides.pricing.pro.crmTitle}
                </h5>
                <p className="text-gray-600 ml-6">
                  {dict.guides.pricing.pro.crmDesc}
                </p>
              </div>
              <div className="text-sm">
                <h5 className="font-bold !text-base flex items-center gap-2 mb-1 text-gray-800">
                  <Mail size={16} className="text-primary" />{" "}
                  {dict.guides.pricing.pro.commsTitle}
                </h5>
                <p className="text-gray-600 ml-6">
                  {dict.guides.pricing.pro.commsDesc}
                </p>
              </div>
            </div>

            <div className="mt-auto pt-6 border-t border-gray-100">
              <h5 className="font-bold !text-base flex items-center gap-2 text-sm mb-2 text-gray-800">
                <Lightbulb size={16} className="text-amber-500" />{" "}
                {dict.guides.pricing.pro.whyTitle}
              </h5>
              <p className="text-xs text-gray-600">
                {dict.guides.pricing.pro.whyDesc}
              </p>
            </div>
              </>
            )}

            <div className="pt-4 mt-auto">
              <Link
                href={variant === "short" ? localizedPath(GUIDES_ROUTES.BECOME_GUIDE) : localizedPath(GUIDES_ROUTES.REGISTER_GUIDE)}
                className="block text-center w-full py-3 px-6 rounded-full font-semibold bg-primary text-white hover:opacity-80 transition-opacity duration-300 shadow-md"
              >
                {variant === "short" ? dict.guides.pricing.seeMoreDetails : dict.guides.pricing.pro.cta}
              </Link>
            </div>
          </div>
        </div>

        {/* EXPERT */}
        <div className="flex flex-col bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
          <div className="p-8 pb-6 bg-slate-50 border-b border-gray-100">
            <h3 className="text-2xl font-bold flex items-center gap-3 mb-2 text-gray-800">
              <Rocket className="text-accent" size={28} />
              {dict.guides.pricing.expert.title}
            </h3>
            <div className="mt-4 mb-2">
              <span className="text-4xl font-extrabold text-gray-800">
                {dict.guides.pricing.expert.price}
              </span>
              <span className="text-gray-500">
                {dict.guides.pricing.expert.perMonth}
              </span>
            </div>
            <p className="text-sm font-semibold text-accent mb-4">
              {dict.guides.pricing.expert.commission}
            </p>
            <p className="text-gray-600 text-sm italic">
              {dict.guides.pricing.expert.badge}
            </p>
          </div>

          <div className="p-8 flex-1 flex flex-col gap-6">
            <div>
              <h4 className="!text-xl flex items-center gap-2 text-md font-bold mb-3 text-gray-800">
                <Target size={18} className="text-accent" />{" "}
                {dict.guides.pricing.expert.targetTitle}
              </h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <Check size={16} className="text-accent shrink-0 mt-0.5" />{" "}
                  {dict.guides.pricing.expert.targets[0]}
                </li>
                <li className="flex items-start gap-2">
                  <Check size={16} className="text-accent shrink-0 mt-0.5" />{" "}
                  {dict.guides.pricing.expert.targets[1]}
                </li>
                <li className="flex items-start gap-2">
                  <Check size={16} className="text-accent shrink-0 mt-0.5" />{" "}
                  {dict.guides.pricing.expert.targets[2]}
                </li>
              </ul>
            </div>

            {variant === "detailed" && (
              <>
                <div className="space-y-4">
              <div className="text-sm">
                <h5 className="font-bold !text-base flex items-center gap-2 mb-1 text-gray-800">
                  <Compass size={16} className="text-accent" />{" "}
                  {dict.guides.pricing.expert.activitiesTitle}
                </h5>
                <p className="text-gray-600 ml-6">
                  {dict.guides.pricing.expert.activitiesDesc}
                </p>
              </div>
              <div className="text-sm">
                <h5 className="font-bold !text-base flex items-center gap-2 mb-1 text-gray-800">
                  <Calendar size={16} className="text-accent" />{" "}
                  {dict.guides.pricing.expert.bookingsTitle}
                </h5>
                <p className="text-gray-600 ml-6">
                  {dict.guides.pricing.expert.bookingsDesc}
                </p>
              </div>
              <div className="text-sm">
                <h5 className="font-bold !text-base flex items-center gap-2 mb-1 text-gray-800">
                  <Bot size={16} className="text-accent" />{" "}
                  {dict.guides.pricing.expert.crmTitle}
                </h5>
                <p className="text-gray-600 ml-6">
                  {dict.guides.pricing.expert.crmDesc}
                </p>
              </div>
              <div className="text-sm">
                <h5 className="font-bold !text-base flex items-center gap-2 mb-1 text-gray-800">
                  <Plug size={16} className="text-accent" />{" "}
                  {dict.guides.pricing.expert.commsTitle}
                </h5>
                <p className="text-gray-600 ml-6">
                  {dict.guides.pricing.expert.commsDesc}
                </p>
              </div>
            </div>

            <div className="mt-auto pt-6 border-t border-gray-100">
              <h5 className="font-bold flex items-center gap-2 text-sm mb-2 text-gray-800">
                <Lightbulb size={16} className="text-amber-500" />{" "}
                {dict.guides.pricing.expert.whyTitle}
              </h5>
              <p className="text-xs text-gray-600">
                {dict.guides.pricing.expert.whyDesc}
              </p>
            </div>
              </>
            )}

            <div className="pt-4 mt-auto">
              <Link
                href={variant === "short" ? localizedPath(GUIDES_ROUTES.BECOME_GUIDE) : localizedPath(GUIDES_ROUTES.REGISTER_GUIDE)}
                className="block text-center w-full py-3 px-6 rounded-full font-semibold border-2 border-accent text-accent hover:bg-accent hover:text-white transition-colors duration-300"
              >
                {variant === "short" ? dict.guides.pricing.seeMoreDetails : dict.guides.pricing.expert.cta}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
