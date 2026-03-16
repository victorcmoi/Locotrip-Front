"use client";

import { useLocalizedPath, useTranslations } from "@/providers/i18n.provider";
import Image from "next/image";
import Link from "next/link";
import { FaFacebook, FaSquareInstagram, FaYoutube } from "react-icons/fa6";
import { SlArrowLeft, SlArrowRight } from "react-icons/sl";
import { HOME_ROUTES, GUIDES_ROUTES, SUPPORT_ROUTES } from "@/utils/routes";

export default function Footer() {
  const dict = useTranslations();
  const localizedPath = useLocalizedPath();

  return (
    <footer className="w-full pt-4 text-center">
      <Link href={localizedPath(HOME_ROUTES.HOME)}>
        <Image
          src="/assets/logo_locotrip.png"
          alt="Locotrip Logo Footer"
          width={300}
          height={50}
          className="px-4 sm:px-8 lg:px-16 mx-auto"
        />
      </Link>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 justify-center mt-2 px-4 sm:px-8 lg:px-16 text-left gap-8 lg:gap-12">
        <div className="bg-light rounded-xl shadow-lg pl-6 pr-2 text-black p-6 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center">
            <input
              type="text"
              placeholder={dict.common.emailAddress}
              className="grow py-3 shadow-xl rounded-full focus:outline-none"
            />
            <button
              type="submit"
              className="bg-accent -ml-12 text-light p-3 rounded-full hover:bg-accent-dark transition-colors duration-300 cursor-pointer shrink-0"
            >
              <SlArrowRight size={30} />
            </button>
          </div>

          <p className="mt-4 font-bold text-base">
            {dict.footer.bestExperiences}
          </p>
          <p className="mt-4 text-base">{dict.footer.newsletter}</p>
        </div>
        <div className="flex flex-col gap-5">
          <h5>{dict.common.support}</h5>
          <Link
            href={localizedPath(GUIDES_ROUTES.BECOME_GUIDE)}
            className="hover:underline font-light"
          >
            {dict.navigation.becomeGuide}
          </Link>
          <Link
            href={localizedPath(HOME_ROUTES.HELP)}
            className="hover:underline font-light "
          >
            {dict.navigation.helpCenter}
          </Link>
        </div>
        <div className="flex flex-col gap-5">
          <h5>{dict.common.about}</h5>
          <Link
            href={localizedPath(HOME_ROUTES.ABOUT)}
            className="hover:underline font-light"
          >
            {dict.navigation.presentation}
          </Link>
          <Link
            href={localizedPath(SUPPORT_ROUTES.CONTACT)}
            className="hover:underline font-light"
          >
            {dict.navigation.contactUs}
          </Link>
        </div>
        <div className="flex flex-col">
          <h5>{dict.common.followUs}</h5>
          <div className="flex gap-6 mt-5">
            <Link
              href="https://www.instagram.com/locotrip"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaSquareInstagram
                size={46}
                className="hover:opacity-80 cursor-pointer text-gray"
              />
            </Link>
            <Link
              href="https://www.youtube.com/@locotrip"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaYoutube
                size={46}
                className="hover:opacity-80 cursor-pointer text-gray"
              />
            </Link>
            <Link
              href="https://www.facebook.com/locotrip"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaFacebook
                size={46}
                className="hover:opacity-80 cursor-pointer text-gray"
              />
            </Link>
          </div>
        </div>
      </div>
      <div className="w-full bg-accent text-white py-6 mt-8 text-center flex flex-wrap justify-center gap-4 sm:gap-12 text-base px-4">
        <Link
          href={localizedPath(HOME_ROUTES.POLITIQUE_CONFIDENTIALITE)}
          className="mx-2 hover:underline"
        >
          {dict.navigation.privacyPolicy}
        </Link>

        <Link
          href={localizedPath(HOME_ROUTES.COOKIES)}
          className="mx-2 hover:underline"
        >
          {dict.navigation.cookies}
        </Link>

        <Link
          href={localizedPath(HOME_ROUTES.TERMS)}
          className="mx-2 hover:underline"
        >
          {dict.navigation.termsOfUse}
        </Link>
      </div>
    </footer>
  );
}
