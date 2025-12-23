import { useTranslations } from "@/providers/i18n.provider";
import Image from "next/image";
import { GuideSchema } from "@/schemas/guide";
import { IoCheckmarkCircle } from "react-icons/io5";
import { LuMapPin } from "react-icons/lu";
import { AiFillStar } from "react-icons/ai";

interface GuideCardProps {
  guide: GuideSchema;
}

export default function GuideCard({ guide }: GuideCardProps) {
  const dict = useTranslations();


  const categories = guide.categories || [
    "Site touristique",
    "Restaurant",
    "Shopping",
    "Bar",
    "Boite de nuit",
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300 max-w-sm">
      {/* Image de fond avec infos du guide */}
      <div className="relative h-48 w-full">
        <Image
          src={(guide.photoUrl as string) || "/assets/guide-pp-default.avif"}
          alt={`${guide.user?.firstName} ${guide.user?.lastName}`}
          fill
          className="object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.6) 100%)",
          }}
        />

        {/* Nom et localisation */}
        <div className="absolute bottom-4 left-4 text-white">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-2xl font-bold">
              {guide.user?.firstName} {guide.user?.lastName}
            </h3>
            {guide.pro_card && (
              <IoCheckmarkCircle className="text-[#7BCECC] text-3xl" />
            )}
          </div>
          <div className="flex items-center gap-1 text-xl text-white">
            <LuMapPin />
            <span className="text-white">{guide.country}</span>
          </div>
        </div>
      </div>

      {/* Contenu de la carte */}
      <div className="p-6">
        {/* Note */}
        <div className="flex items-center gap-2 mb-4 justify-center">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <AiFillStar key={i} className="text-secondary text-lg" />
            ))}
          </div>
          <span className="text-gray text-sm">{guide.reviewCount} avis</span>
        </div>

        {/* Langues */}
        {guide.languages && (
          <div className="mb-4 flex justify-center">
            <p className="text-sm">
              <span className="font-semibold">Langue :</span>{" "}
              <span className="text-gray">{guide.languages}</span>
            </p>
          </div>
        )}

        {/* Bio */}
        {guide.bio && (
          <p className="text-center text-sm text-gray italic mb-4 line-clamp-3">
            "{guide.bio}"
          </p>
        )}

        {/* Catégories */}
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          {categories.slice(0, 5).map((category, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-light rounded-full text-xs text-dark border border-gray-light"
            >
              {category}
            </span>
          ))}
        </div>

        {/* Bouton */}
        <button className="w-full bg-primary hover:bg-accent text-white font-semibold py-3 rounded-full transition-colors duration-300">
          {dict.home.sendMessage || "Envoyer un message"}
        </button>
      </div>
    </div>
  );
}
