import { useTranslations } from "@/providers/i18n.provider";
import Image from "next/image";
import { IoIosArrowRoundForward } from "react-icons/io";

export default function ButtonAvaibleGuide() {
  const dict = useTranslations();
    
  return (
    <button className="flex items-center text-light font-normal pl-4 p-0 justify-between cursor-pointer shadow-lg">
      <p className="text-left text-light max-w-32 leading-tight">{dict.home.avaibleGuides}</p>
      <div className="flex items-center shrink-0">
          <Image 
          src="/assets/guide-home-1.avif"
          alt="Guide"
          width={80}
          height={80}
          className="rounded-full w-20 h-20 object-cover"
          />
          <Image
          src="/assets/guide-home-2.avif"
          alt="Guide"
          width={80}
          height={80}
          className="rounded-full -ml-8 w-20 h-20 object-cover"
          />
          <IoIosArrowRoundForward 
          size={24}
          className="rounded-full bg-light -ml-8 text-dark w-20 h-20 flex items-center justify-center p-4 hover:bg-gray transition-colors duration-300"
          />
      </div>
    </button>
  );
}