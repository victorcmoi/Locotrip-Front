import { useTranslations } from "@/providers/i18n.provider";
import Image from "next/image";
import { Guide } from "@/schemas/guide";
import { IoCheckmarkCircle } from "react-icons/io5";
import { LuMapPin } from "react-icons/lu";
import { AiFillStar } from "react-icons/ai";
import Link from "next/link";
import GuidesRoutes from "@/utils/routes/guides.routes";
import { MinioHelpers } from "@/utils/minio";

interface GuideCardProps {
  guide: Guide;
}

export default function GuideCard({ guide }: GuideCardProps) {
  const dict = useTranslations();

  const hobbies = guide.hobbies?.map((h) => h.category?.name).filter((name): name is string => Boolean(name)) || [];

  return (
    <div className="bg-light rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 h-full flex flex-col border border-gray-light ">
      {/* Image de fond avec infos du guide */}
      <Link href={GuidesRoutes.PROFILE(guide.id)} className="relative h-48 w-full block cursor-pointer overflow-hidden group">
        <Image
          src={MinioHelpers.guideProfile()}
          alt={`${guide.user?.first_name || guide.user?.first_name} ${guide.user?.last_name || guide.user?.last_name}`}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.6) 100%)",
          }}
        />

        {/* Nom et localisation */}
        <div className="absolute bottom-4 left-4 text-light">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-xl font-bold">
              {guide.user?.first_name}
            </h3>
            {guide.pro_card && (
              <IoCheckmarkCircle className="text-[#7BCECC] text-3xl" />
            )}
          </div>
          <div className="flex items-center gap-1 text-xl text-light">
            <LuMapPin />
            <span className="text-light">{guide.country}</span>
          </div>
        </div>
      </Link>

      {/* Contenu de la carte */}
      <div className="p-8 flex-1 flex flex-col">
        {/* Note */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <AiFillStar key={i} className="text-secondary text-xl" />
            ))}
          </div>
          <span className="text-dark text-base">{guide.reviewCount} {dict.common.review}</span>
        </div>

        {/* Langues */}
        {guide.languages && (
          <div className="mb-8 flex justify-center">
            <p className="text-base">
              <span className="font-bold text-dark">{dict.common.languages}</span>{" "}
              <span className="text-dark">{guide.languages}</span>
            </p>
          </div>
        )}

        {/* Bio */}
        {guide.bio && (
          <p className="text-center text-base text-dark italic mb-8 line-clamp-3">
            "{guide.bio}"
          </p>
        )}

        {/* Spacer pour pousser les catégories vers le bas */}
        <div className="flex-1"></div>

        {/* Hobbies */}
        {hobbies.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8 justify-center max-w-70 mx-auto">
            {hobbies.slice(0, 6).map((hobby: string, index: number) => (
              <span
                key={index}
                className="px-3 py-1 bg-light rounded-full text-sm text-dark border border-gray-light"
              >
                {hobby}
              </span>
            ))}
          </div>
        )}

        {/* Bouton */}
        <button className="w-1/2 mx-auto bg-primary hover:bg-accent text-light font-semibold py-3 rounded-full transition-colors duration-300 cursor-pointer text-base">
          {dict.home.sendMessage || "Envoyer un message"}
        </button>
      </div>
    </div>
  );
}
