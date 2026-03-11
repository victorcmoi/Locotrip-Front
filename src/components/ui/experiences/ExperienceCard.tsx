import { useTranslations } from "@/providers/i18n.provider";
import Image from "next/image";
import { IoCheckmarkCircle } from "react-icons/io5";
import { LuMapPin } from "react-icons/lu";
import { AiFillStar } from "react-icons/ai";
import { Accessibility } from "lucide-react";
import Link from "next/link";
import { MinioHelpers } from "@/utils/minio";
import { Experience } from "@/schemas/experience";
import ExperiencesRoutes from "@/utils/routes/experiences.routes";
import GuidesRoutes from "@/utils/routes/guides.routes";

interface ExperienceCardProps {
  experience: Experience;
}

export default function ExperienceCard({ experience }: ExperienceCardProps) {
  const dict = useTranslations();
  const guide = experience.guide;
  
  if (!guide) return null;
  
  const experienceImage = experience.medias?.[0]?.url;
  const guideProfilePicture = guide.medias?.[0]?.url;

  // Formatage de la durée (en minutes vers heures/minutes)
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) return `${hours}h${mins}`;
    if (hours > 0) return `${hours}h`;
    return `${mins}min`;
  };

  return (
    <div className="bg-light rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 h-full flex flex-col border border-gray-light">
      {/* Image de l'expérience */}
      <Link href={ExperiencesRoutes.DETAIL(experience.id)} className="relative h-48 w-full block cursor-pointer overflow-hidden group">
        <Image
          src={MinioHelpers.experience(experienceImage)}
          alt={experience.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-110"
        />
      </Link>

      {/* Contenu de la carte */}
      <div className="p-6 flex-1 flex flex-col">
        {/* Pp guide */}
        <Link href={GuidesRoutes.PROFILE(guide.id)} className="flex justify-center -mt-20 mb-3">
          <div className="relative w-24 h-24 rounded-full border-4 border-white overflow-hidden shadow-lg hover:scale-105 transition-transform duration-300">
            <Image
              src={MinioHelpers.guideProfile(guide.id, guideProfilePicture)}
              alt={`${guide.user?.first_name} ${guide.user?.last_name}`}
              fill
              className="object-cover"
            />
          </div>
        </Link>

        {/* Nom guide */}
        <Link href={GuidesRoutes.PROFILE(guide.id)} className="flex items-center gap-2 mb-4 justify-center hover:opacity-80 transition-opacity">
          <p className="text-base text-dark">
            {dict.search.experienceName} <span className="font-bold text-dark">{guide.user?.first_name}</span> <span className="font-bold uppercase text-dark">{guide.user?.last_name}</span>
          </p>
          {guide?.pro_card && (
            <IoCheckmarkCircle className="text-accent text-2xl" />
          )}
        </Link>

        {/* Note */}
        {(guide.reviewCount || 0) > 0 ? (
          <div className="flex items-center gap-2 mb-4 justify-center">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <AiFillStar key={i} className="text-secondary text-xl" />
              ))}
            </div>
            <span className="text-dark text-base">{guide.reviewCount || 0} {dict.common.review}</span>
          </div>
        ) : (
          <div className="mb-4" />
        )}

        {/* Titre expérience */}
        <Link href={ExperiencesRoutes.DETAIL(experience.id)}>
          <h3 className="text-center font-bold text-2xl! text-accent mb-4 line-clamp-2 hover:underline cursor-pointer">
            {experience.title}
          </h3>
        </Link>

        {/* Localisation */}
        <div className="flex items-center gap-1 justify-center mb-4">
          <LuMapPin className="text-dark text-xl" />
          <span className="text-dark text-base">{experience.city?.name}</span>
          
          {/* Accessibilité */}
          {experience.is_accessible && (
            <div className="flex items-center gap-1 text-green-600 ml-2" title="Accessible PMR">
              <Accessibility size={18} />
            </div>
          )}
        </div>

        {/* Langues */}
        {guide.languages && (
          <div className="mb-4 flex justify-center text-center">
            <p className="text-base">
              <span className="text-dark">{dict.common.languages}</span>{" "}
              <span className="text-dark">{guide.languages}</span>
            </p>
          </div>
        )}

        {/* Durée et prix */}
        <div className="flex flex-wrap gap-2 mb-4 justify-center">
          <span className="px-3 py-1 bg-light rounded-full text-sm text-dark border border-gray-light">
            {formatDuration(experience.duration)}
          </span>
          <span className="px-3 py-1 bg-light rounded-full text-sm text-dark border border-gray-light">
            {experience.price}€/{dict.common.person}
          </span>
        </div>

        {/* Description */}
        {experience.description && (
          <p className="text-center text-base text-dark italic mb-4 line-clamp-3">
            "{experience.description}"
          </p>
        )}

        {/* Spacer pour pousser le bouton vers le bas */}
        <div className="flex-1"></div>

        {/* Bouton */}
        <button className="mx-auto hover:bg-accent text-light transition-colors duration-300 cursor-pointer text-base py-2.5">
          {dict.common.checkAvailability}
        </button>
      </div>
    </div>
  );
}
