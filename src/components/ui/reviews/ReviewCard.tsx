import { useTranslations } from "@/providers/i18n.provider";
import { useLocalizedPath } from "@/providers/i18n.provider";
import { ReviewApiResponse } from "@/schemas/reviews";
import { AiFillStar } from "react-icons/ai";
import Link from "next/link";
import GuidesRoutes from "@/utils/routes/guides.routes";

interface ReviewCardProps {
  review: ReviewApiResponse;
}


export default function ReviewCard({ review }: ReviewCardProps) {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${month}/${year}`;
  };

  const dict = useTranslations(); 
  const localizedPath = useLocalizedPath();
  
  return (
    <div className="bg-light rounded-2xl shadow-lg px-8 py-16 lg:py-10 hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
      {/* Header avec utilisateur */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-auto aspect-square rounded-full border-2 border-accent flex items-center justify-center bg-white">
          <span className="text-accent font-semibold text-lg">
            {review.user && getInitials(review.user.first_name, review.user.last_name)}
          </span>
        </div>
        <div>
          <h4 className="font-bold text-accent">
            {review.user?.first_name}
          </h4>
          {review.experience?.guide?.user && (
            <p className="text-sm font-bold">
              {dict.home.reviewCardLocal}{" "}
              <Link
                href={localizedPath(GuidesRoutes.PROFILE(review.experience.guide.id))}
                className="text-primary hover:underline"
              >
                {review.experience.guide.user.first_name}
              </Link>
            </p>
          )}
          {review.experience?.city && (
            <p className="text-sm text-gray-600">
              {review.experience.city.name} {formatDate(review.review_date.toString())}
            </p>
          )}
        </div>
      </div>

      {/* Titre de la review */}
      {review.title && (
        <p className="font-semibold text-dark mb-4">{review.title}</p>
      )}

      {/* Note */}
      <div className="flex items-center gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <AiFillStar 
            key={i} 
            className={i < review.rating ? "text-secondary" : "text-gray-300"}
          />
        ))}
      </div>

      {/* Commentaire */}
      {review.comment && (
        <p className="text-base text-dark leading-relaxed line-clamp-4">
          {review.comment}
        </p>
      )}
    </div>
  );
}
