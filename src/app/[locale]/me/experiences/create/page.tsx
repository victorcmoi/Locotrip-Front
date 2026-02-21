"use client";

import React, { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useLocalizedPath } from "@/providers/i18n.provider";
import { useSearchCities } from "@/services/cities/getCities";
import { useCategories } from "@/services/categories/getCategories";
import { useCreateExperience } from "@/services/experiences/createExperiences";
import { uploadExperiencePhotos } from "@/services/experiences/uploadExperiencePhotos";
import {
  createExperienceAvailability,
  type CreateAvailabilityData,
} from "@/services/experiences/createExperienceAvailability";
import { addCategoryToExperience } from "@/services/experiences/createExperienceCategory";
import { createExperienceSchema } from "@/schemas/experience";
import {
  ArrowLeft,
  Check,
  MapPin,
  FileText,
  DollarSign,
  Tag,
  ImageIcon,
  Calendar,
  Plus,
  X,
  UploadCloud,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { City } from "@/schemas/city";
import type { Category } from "@/schemas/category";
import { z } from "zod";

const STEPS = [
  { label: "Informations", icon: FileText },
  { label: "Catégories", icon: Tag },
  { label: "Localisation", icon: MapPin },
  { label: "Photos", icon: ImageIcon },
  { label: "Disponibilités", icon: Calendar },
];

// Validation schemas per step
const step1Schema = z.object({
  title: z
    .string()
    .min(10, "Le titre doit contenir au moins 10 caractères")
    .max(150),
  description: z
    .string()
    .min(50, "La description doit contenir au moins 50 caractères"),
  price: z.number().positive("Le prix doit être positif"),
  duration: z.number().int().positive("La durée doit être positive"),
  max_capacity: z
    .number()
    .int()
    .positive("La capacité doit être positive")
    .optional(),
});

const step3Schema = z.object({
  city_id: z.string().uuid("Veuillez sélectionner une ville"),
  meeting_point: z.string().max(255).optional(),
  meeting_latitude: z.coerce
    .number()
    .min(-90)
    .max(90)
    .optional()
    .or(z.literal("")),
  meeting_longitude: z.coerce
    .number()
    .min(-180)
    .max(180)
    .optional()
    .or(z.literal("")),
});

type FormData = {
  title: string;
  description: string;
  price: number | "";
  duration: number | "";
  max_capacity: number | "";
  city_id: string;
  meeting_point: string;
  meeting_latitude: number | "";
  meeting_longitude: number | "";
};

type AvailabilitySlot = {
  start_date: string;
  end_date: string;
  status: "available" | "unavailable" | "blocked";
};

export default function CreateExperiencePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const localizedPath = useLocalizedPath();
  const guideId = session?.user?.guide_id;
  const isGuide = session?.user?.role === "guide";

  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    price: "",
    duration: "",
    max_capacity: "",
    city_id: "",
    meeting_point: "",
    meeting_latitude: "",
    meeting_longitude: "",
  });

  // Categories
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const { data: categories } = useCategories();

  // City search
  const [citySearch, setCitySearch] = useState("");
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const { data: searchResults, isLoading: searchLoading } = useSearchCities(
    citySearch,
    citySearch.length > 0,
  );

  // Photos
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [captions, setCaptions] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Availability
  const [availabilitySlots, setAvailabilitySlots] = useState<
    AvailabilitySlot[]
  >([]);
  const [newSlot, setNewSlot] = useState<AvailabilitySlot>({
    start_date: "",
    end_date: "",
    status: "available",
  });

  const createExperience = useCreateExperience();

  if (!isGuide) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-dark/60 text-lg">
          Cette page est réservée aux guides.
        </p>
      </div>
    );
  }

  const updateField = (field: keyof FormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const validateStep = (step: number): boolean => {
    let result;
    if (step === 0) {
      result = step1Schema.safeParse({
        title: formData.title,
        description: formData.description,
        price: formData.price === "" ? undefined : formData.price,
        duration: formData.duration === "" ? undefined : formData.duration,
        max_capacity:
          formData.max_capacity === "" ? undefined : formData.max_capacity,
      });
    } else if (step === 2) {
      result = step3Schema.safeParse({
        city_id: formData.city_id || undefined,
        meeting_point: formData.meeting_point || undefined,
        meeting_latitude:
          formData.meeting_latitude === ""
            ? undefined
            : formData.meeting_latitude,
        meeting_longitude:
          formData.meeting_longitude === ""
            ? undefined
            : formData.meeting_longitude,
      });
    } else {
      return true; // Steps 1 (categories), 3 (photos), 4 (availability) are optional
    }

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const field = String(issue.path[0]);
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSelectCity = (city: City) => {
    setSelectedCity(city);
    updateField("city_id", city.id);
    setCitySearch(city.name + ", " + city.country);
    setShowCityDropdown(false);
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    );
  };

  // Photo handlers
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = 10 - selectedFiles.length;
    const toAdd = files.slice(0, remaining);

    setSelectedFiles((prev) => [...prev, ...toAdd]);
    setCaptions((prev) => [...prev, ...toAdd.map(() => "")]);
    toAdd.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPreviews((prev) => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const updateCaption = (index: number, value: string) => {
    setCaptions((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const removePhoto = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    setCaptions((prev) => prev.filter((_, i) => i !== index));
  };

  // Availability handlers
  const addAvailabilitySlot = () => {
    if (!newSlot.start_date || !newSlot.end_date) return;
    setAvailabilitySlots((prev) => [...prev, { ...newSlot }]);
    setNewSlot({ start_date: "", end_date: "", status: "available" });
  };

  const removeAvailabilitySlot = (index: number) => {
    setAvailabilitySlots((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!guideId) return;

    const payload = {
      title: formData.title,
      description: formData.description,
      price: formData.price as number,
      duration: formData.duration as number,
      city_id: formData.city_id,
      guide_id: guideId,
      ...(formData.max_capacity !== "" && {
        max_capacity: formData.max_capacity,
      }),
      ...(formData.meeting_point && {
        meeting_point: formData.meeting_point,
      }),
      ...(formData.meeting_latitude !== "" && {
        meeting_latitude: formData.meeting_latitude,
      }),
      ...(formData.meeting_longitude !== "" && {
        meeting_longitude: formData.meeting_longitude,
      }),
    };

    const result = createExperienceSchema.safeParse(payload);
    if (!result.success) {
      setApiError(
        "Certaines données sont invalides. Veuillez vérifier le formulaire.",
      );
      return;
    }

    setApiError(null);
    setIsSubmitting(true);

    try {
      // 1. Create experience
      const experience = await createExperience.mutateAsync(result.data);

      // 2. Link categories
      for (const categoryId of selectedCategories) {
        await addCategoryToExperience(experience.id, categoryId);
      }

      // 3. Upload photos with captions
      if (selectedFiles.length > 0) {
        await uploadExperiencePhotos(experience.id, selectedFiles, captions);
      }

      // 4. Create availability slots
      for (const slot of availabilitySlots) {
        const availData: CreateAvailabilityData = {
          experience_id: experience.id,
          start_date: new Date(slot.start_date).toISOString(),
          end_date: new Date(slot.end_date).toISOString(),
          status: slot.status,
        };
        await createExperienceAvailability(availData);
      }

      router.push(localizedPath("/me/experiences"));
    } catch (err) {
      setApiError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue lors de la création.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDuration = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m} min`;
    if (m === 0) return `${h}h`;
    return `${h}h${m}`;
  };

  return (
    <div className="py-8">
      {/* Back link */}
      <Link
        href={localizedPath("/me/experiences")}
        className="flex items-center gap-2 text-dark/70 hover:text-dark transition text-sm font-medium mb-8"
      >
        <ArrowLeft size={12} />
        Retour aux expériences
      </Link>

      {/* Title */}
      <h1 className="text-3xl font-extrabold text-dark mb-8">
        Créer une expérience
      </h1>

      {/* Stepper */}
      <div className="flex items-center mb-12 max-w-3xl mx-auto">
        {STEPS.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          return (
            <React.Fragment key={index}>
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    isCompleted
                      ? "bg-accent text-white"
                      : isActive
                        ? "bg-accent text-white scale-110"
                        : "bg-gray-200 text-dark/40"
                  }`}
                >
                  {isCompleted ? <Check size={16} /> : <step.icon size={16} />}
                </div>
                <span
                  className={`text-[10px] font-semibold transition-colors duration-300 whitespace-nowrap ${
                    isActive || isCompleted ? "text-dark" : "text-dark/40"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div className="flex-1 mx-2 mt-[-20px]">
                  <div
                    className={`h-0.5 rounded-full transition-colors duration-300 ${
                      isCompleted ? "bg-accent" : "bg-gray-200"
                    }`}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Form content */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-light p-8 max-w-3xl mx-auto">
        {/* ========== Step 1: Informations générales ========== */}
        {currentStep === 0 && (
          <div className="flex flex-col gap-6">
            <h2 className="text-xl font-bold text-dark mb-2">
              Informations générales
            </h2>

            <div>
              <label className="block text-sm font-semibold text-dark mb-1.5">
                Titre de l&apos;expérience{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => updateField("title", e.target.value)}
                placeholder="Ex: Visite guidée du Louvre"
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.title ? "border-red-400" : "border-gray-light"
                } bg-light text-dark placeholder:text-dark/40 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition`}
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1">{errors.title}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-dark mb-1.5">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="Décrivez votre expérience en détail (minimum 50 caractères)..."
                rows={5}
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.description ? "border-red-400" : "border-gray-light"
                } bg-light text-dark placeholder:text-dark/40 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition resize-none`}
              />
              <div className="flex justify-between mt-1">
                {errors.description && (
                  <p className="text-red-500 text-xs">{errors.description}</p>
                )}
                <p className="text-xs text-dark/40 ml-auto">
                  {formData.description.length} / 50 min
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-dark mb-1.5">
                  Prix (€/pers) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <DollarSign
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-dark/40"
                    size={18}
                  />
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      updateField(
                        "price",
                        e.target.value === "" ? "" : parseFloat(e.target.value),
                      )
                    }
                    placeholder="45"
                    min="0"
                    step="0.01"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                      errors.price ? "border-red-400" : "border-gray-light"
                    } bg-light text-dark placeholder:text-dark/40 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition`}
                  />
                </div>
                {errors.price && (
                  <p className="text-red-500 text-xs mt-1">{errors.price}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-dark mb-1.5">
                  Durée (minutes) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) =>
                    updateField(
                      "duration",
                      e.target.value === "" ? "" : parseInt(e.target.value),
                    )
                  }
                  placeholder="120"
                  min="1"
                  className={`w-full px-4 py-3 rounded-xl border ${
                    errors.duration ? "border-red-400" : "border-gray-light"
                  } bg-light text-dark placeholder:text-dark/40 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition`}
                />
                {errors.duration && (
                  <p className="text-red-500 text-xs mt-1">{errors.duration}</p>
                )}
              </div>
            </div>

            <div className="md:w-1/2">
              <label className="block text-sm font-semibold text-dark mb-1.5">
                Capacité maximale{" "}
                <span className="text-dark/40 font-normal">(optionnel)</span>
              </label>
              <input
                type="number"
                value={formData.max_capacity}
                onChange={(e) =>
                  updateField(
                    "max_capacity",
                    e.target.value === "" ? "" : parseInt(e.target.value),
                  )
                }
                placeholder="15"
                min="1"
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.max_capacity ? "border-red-400" : "border-gray-light"
                } bg-light text-dark placeholder:text-dark/40 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition`}
              />
              {errors.max_capacity && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.max_capacity}
                </p>
              )}
            </div>
          </div>
        )}

        {/* ========== Step 2: Catégories ========== */}
        {currentStep === 1 && (
          <div className="flex flex-col gap-6">
            <h2 className="text-xl font-bold text-dark mb-1">Catégories</h2>
            <p className="text-sm text-dark/60">
              Sélectionnez les catégories qui correspondent à votre expérience.
            </p>

            {categories && categories.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {categories.map((cat: Category) => {
                  const isSelected = selectedCategories.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleCategory(cat.id)}
                      className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer border ${
                        isSelected
                          ? "bg-accent text-white border-accent shadow-md shadow-accent/20"
                          : "bg-light text-dark/70 border-gray-light hover:border-accent hover:text-accent"
                      }`}
                    >
                      {isSelected && (
                        <Check className="inline mr-1.5" size={14} />
                      )}
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-dark/50 text-sm">
                Chargement des catégories...
              </p>
            )}

            {selectedCategories.length > 0 && (
              <p className="text-sm text-accent font-medium">
                {selectedCategories.length} catégorie
                {selectedCategories.length > 1 ? "s" : ""} sélectionnée
                {selectedCategories.length > 1 ? "s" : ""}
              </p>
            )}
          </div>
        )}

        {/* ========== Step 3: Localisation ========== */}
        {currentStep === 2 && (
          <div className="flex flex-col gap-6">
            <h2 className="text-xl font-bold text-dark mb-2">Localisation</h2>

            <div className="relative">
              <label className="block text-sm font-semibold text-dark mb-1.5">
                Ville <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-dark/40"
                  size={18}
                />
                <input
                  type="text"
                  value={citySearch}
                  onChange={(e) => {
                    setCitySearch(e.target.value);
                    setShowCityDropdown(true);
                    if (selectedCity) {
                      setSelectedCity(null);
                      updateField("city_id", "");
                    }
                  }}
                  onFocus={() =>
                    citySearch.length > 0 && setShowCityDropdown(true)
                  }
                  placeholder="Rechercher une ville..."
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                    errors.city_id ? "border-red-400" : "border-gray-light"
                  } bg-light text-dark placeholder:text-dark/40 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition`}
                />
              </div>
              {errors.city_id && (
                <p className="text-red-500 text-xs mt-1">{errors.city_id}</p>
              )}

              {showCityDropdown && citySearch.length > 0 && (
                <div className="absolute z-20 top-full mt-1 w-full bg-white border border-gray-light rounded-xl shadow-lg max-h-48 overflow-y-auto">
                  {searchLoading && (
                    <p className="px-4 py-3 text-sm text-dark/50">
                      Recherche...
                    </p>
                  )}
                  {!searchLoading &&
                    searchResults &&
                    searchResults.length > 0 &&
                    searchResults.map((city: City) => (
                      <button
                        key={city.id}
                        type="button"
                        onClick={() => handleSelectCity(city)}
                        className="w-full text-left px-4 py-3 bg-light hover:bg-gray-100 duration-300 transition text-sm text-dark cursor-pointer"
                      >
                        <span className="font-medium">{city.name}</span>
                        <span className="text-dark/50">, {city.country}</span>
                      </button>
                    ))}
                  {!searchLoading &&
                    searchResults &&
                    searchResults.length === 0 && (
                      <p className="px-4 py-3 text-sm text-dark/50">
                        Aucune ville trouvée
                      </p>
                    )}
                </div>
              )}
            </div>

            {/* Separator */}
            <hr className="border-gray-light" />

            {/* Meeting point */}
            <div>
              <label className="block text-sm font-semibold text-dark mb-1.5">
                Point de rencontre
              </label>
              <input
                type="text"
                value={formData.meeting_point}
                onChange={(e) => updateField("meeting_point", e.target.value)}
                placeholder="Ex: Devant l'entrée principale du musée"
                className="w-full px-4 py-3 rounded-xl border border-gray-light bg-light text-dark placeholder:text-dark/40 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition"
              />
              <p className="text-xs text-dark/40 mt-1">
                Décrivez le lieu de rendez-vous pour les participants.
              </p>
            </div>

            {/* GPS coordinates */}
            <div>
              <label className="block text-sm font-semibold text-dark mb-1.5">
                Coordonnées GPS
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="number"
                    step="any"
                    value={formData.meeting_latitude}
                    onChange={(e) =>
                      updateField(
                        "meeting_latitude",
                        e.target.value === "" ? "" : parseFloat(e.target.value),
                      )
                    }
                    placeholder="Latitude (ex: 48.8566)"
                    className={`w-full px-4 py-3 rounded-xl border ${
                      errors.meeting_latitude
                        ? "border-red-400"
                        : "border-gray-light"
                    } bg-light text-dark placeholder:text-dark/40 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition`}
                  />
                  {errors.meeting_latitude && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.meeting_latitude}
                    </p>
                  )}
                </div>
                <div>
                  <input
                    type="number"
                    step="any"
                    value={formData.meeting_longitude}
                    onChange={(e) =>
                      updateField(
                        "meeting_longitude",
                        e.target.value === "" ? "" : parseFloat(e.target.value),
                      )
                    }
                    placeholder="Longitude (ex: 2.3522)"
                    className={`w-full px-4 py-3 rounded-xl border ${
                      errors.meeting_longitude
                        ? "border-red-400"
                        : "border-gray-light"
                    } bg-light text-dark placeholder:text-dark/40 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition`}
                  />
                  {errors.meeting_longitude && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.meeting_longitude}
                    </p>
                  )}
                </div>
              </div>
              <p className="text-xs text-dark/40 mt-1">
                Optionnel. Permet d&apos;afficher le lieu sur une carte.
              </p>
            </div>
          </div>
        )}

        {/* ========== Step 4: Photos ========== */}
        {currentStep === 3 && (
          <div className="flex flex-col gap-6">
            <h2 className="text-xl font-bold text-dark mb-1">Photos</h2>
            <p className="text-sm text-dark/60">
              Ajoutez jusqu&apos;à 10 photos pour illustrer votre expérience.
            </p>

            {/* Upload zone */}
            <div
              onClick={() =>
                selectedFiles.length < 10 && fileInputRef.current?.click()
              }
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors duration-200 ${
                selectedFiles.length >= 10
                  ? "border-gray-300 bg-gray-50 cursor-not-allowed"
                  : "border-accent/30 hover:border-accent cursor-pointer hover:bg-accent/5"
              }`}
            >
              <UploadCloud className="mx-auto text-accent/60 mb-3" size={40} />
              <p className="text-sm font-medium text-dark/70">
                {selectedFiles.length >= 10
                  ? "Maximum de 10 photos atteint"
                  : "Cliquez ou glissez vos photos ici"}
              </p>
              <p className="text-xs text-dark/40 mt-1">
                JPEG, PNG, WebP • Max 10 fichiers
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* Previews with captions */}
            {previews.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {previews.map((src, index) => (
                  <div
                    key={index}
                    className="flex flex-col gap-2 rounded-xl border border-gray-light p-3 bg-light"
                  >
                    <div className="relative aspect-4/3 rounded-lg overflow-hidden group">
                      <Image
                        src={src}
                        alt={`Photo ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute z-10 bg-light text-red-600 top-2 right-2 stroke-2 rounded-full w-6 h-6 flex opacity-0 group-hover:opacity-100 cursor-pointer"
                      >
                        <X width={16} height={16} />
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder={`Légende de la photo ${index + 1} (optionnel)`}
                      value={captions[index] || ""}
                      onChange={(e) => updateCaption(index, e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-light bg-white text-sm text-dark placeholder:text-dark/40 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition"
                    />
                  </div>
                ))}
              </div>
            )}

            <p className="text-xs text-dark/40">
              {selectedFiles.length} / 10 photo
              {selectedFiles.length > 1 ? "s" : ""} sélectionnée
              {selectedFiles.length > 1 ? "s" : ""}
            </p>
          </div>
        )}

        {/* ========== Step 5: Disponibilités + Récapitulatif ========== */}
        {currentStep === 4 && (
          <div className="flex flex-col gap-8">
            {/* Availability section */}
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-bold text-dark">Disponibilités</h2>
              <p className="text-sm text-dark/60">
                Ajoutez vos créneaux de disponibilité pour cette expérience.
              </p>

              {/* Add slot form */}
              <div className="bg-light rounded-xl p-4 border border-gray-light">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-dark/70 mb-1">
                      Date de début
                    </label>
                    <input
                      type="datetime-local"
                      value={newSlot.start_date}
                      onChange={(e) =>
                        setNewSlot((prev) => ({
                          ...prev,
                          start_date: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 rounded-lg border border-gray-light bg-white text-dark text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-dark/70 mb-1">
                      Date de fin
                    </label>
                    <input
                      type="datetime-local"
                      value={newSlot.end_date}
                      onChange={(e) =>
                        setNewSlot((prev) => ({
                          ...prev,
                          end_date: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 rounded-lg border border-gray-light bg-white text-dark text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={addAvailabilitySlot}
                      disabled={!newSlot.start_date || !newSlot.end_date}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-accent text-white font-semibold text-sm hover:bg-accent/90 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Plus size={16} />
                      Ajouter
                    </button>
                  </div>
                </div>
              </div>

              {/* Existing slots */}
              {availabilitySlots.length > 0 && (
                <div className="flex flex-col gap-2">
                  {availabilitySlots.map((slot, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-gray-light"
                    >
                      <div className="flex items-center gap-4 text-sm">
                        <Calendar className="text-accent" size={16} />
                        <span className="text-dark font-medium">
                          {new Date(slot.start_date).toLocaleDateString(
                            "fr-FR",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </span>
                        <span className="text-dark/40">→</span>
                        <span className="text-dark font-medium">
                          {new Date(slot.end_date).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                          {slot.status}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAvailabilitySlot(index)}
                        className="text-red-400 hover:text-red-600 transition cursor-pointer"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Separator */}
            <hr className="border-gray-light" />

            {/* Récapitulatif */}
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-bold text-dark">Récapitulatif</h2>
              <p className="text-sm text-dark/60">
                Vérifiez les informations avant de créer votre expérience.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <div className="md:col-span-2">
                  <p className="text-xs font-semibold text-dark/50 uppercase tracking-wider mb-1">
                    Titre
                  </p>
                  <p className="text-dark font-medium text-lg">
                    {formData.title}
                  </p>
                </div>

                <div className="md:col-span-2">
                  <p className="text-xs font-semibold text-dark/50 uppercase tracking-wider mb-1">
                    Description
                  </p>
                  <p className="text-dark/80 text-sm whitespace-pre-line leading-relaxed line-clamp-3">
                    {formData.description}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-dark/50 uppercase tracking-wider mb-1">
                    Prix
                  </p>
                  <p className="text-accent font-bold text-lg">
                    {formData.price}€ / pers
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-dark/50 uppercase tracking-wider mb-1">
                    Durée
                  </p>
                  <p className="text-dark font-bold text-lg">
                    {typeof formData.duration === "number"
                      ? formatDuration(formData.duration)
                      : "–"}
                  </p>
                </div>

                {formData.max_capacity !== "" && (
                  <div>
                    <p className="text-xs font-semibold text-dark/50 uppercase tracking-wider mb-1">
                      Capacité max
                    </p>
                    <p className="text-dark font-bold">
                      {formData.max_capacity} pers
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-xs font-semibold text-dark/50 uppercase tracking-wider mb-1">
                    Ville
                  </p>
                  <p className="text-dark font-medium">
                    {selectedCity
                      ? `${selectedCity.name}, ${selectedCity.country}`
                      : "–"}
                  </p>
                </div>

                {selectedCategories.length > 0 && categories && (
                  <div className="md:col-span-2">
                    <p className="text-xs font-semibold text-dark/50 uppercase tracking-wider mb-1">
                      Catégories
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedCategories.map((catId) => {
                        const cat = categories.find(
                          (c: Category) => c.id === catId,
                        );
                        return cat ? (
                          <span
                            key={catId}
                            className="px-3 py-1 rounded-full text-xs bg-accent/10 text-accent font-medium"
                          >
                            {cat.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}

                {selectedFiles.length > 0 && (
                  <div className="md:col-span-2">
                    <p className="text-xs font-semibold text-dark/50 uppercase tracking-wider mb-1">
                      Photos
                    </p>
                    <p className="text-dark font-medium text-sm">
                      {selectedFiles.length} photo
                      {selectedFiles.length > 1 ? "s" : ""} sélectionnée
                      {selectedFiles.length > 1 ? "s" : ""}
                    </p>
                  </div>
                )}

                {formData.meeting_point && (
                  <div className="md:col-span-2">
                    <p className="text-xs font-semibold text-dark/50 uppercase tracking-wider mb-1">
                      Point de rencontre
                    </p>
                    <p className="text-dark font-medium text-sm">
                      {formData.meeting_point}
                    </p>
                  </div>
                )}

                {formData.meeting_latitude !== "" &&
                  formData.meeting_longitude !== "" && (
                    <div>
                      <p className="text-xs font-semibold text-dark/50 uppercase tracking-wider mb-1">
                        Coordonnées GPS
                      </p>
                      <p className="text-dark font-medium text-sm">
                        {formData.meeting_latitude},{" "}
                        {formData.meeting_longitude}
                      </p>
                    </div>
                  )}

                {availabilitySlots.length > 0 && (
                  <div className="md:col-span-2">
                    <p className="text-xs font-semibold text-dark/50 uppercase tracking-wider mb-1">
                      Disponibilités
                    </p>
                    <p className="text-dark font-medium text-sm">
                      {availabilitySlots.length} créneau
                      {availabilitySlots.length > 1 ? "x" : ""}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* API error */}
            {apiError && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                {apiError}
              </div>
            )}
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-10 pt-6 border-t border-gray-light">
          {currentStep > 0 ? (
            <button
              type="button"
              onClick={handlePrev}
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl border border-gray-light text-dark font-semibold text-sm hover:bg-light transition-colors duration-200 cursor-pointer bg-transparent disabled:opacity-50"
            >
              Précédent
            </button>
          ) : (
            <div />
          )}

          {currentStep < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-8 py-2.5 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent/90 transition-colors duration-200 cursor-pointer shadow-md shadow-accent/20"
            >
              Suivant
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-8 py-2.5 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent/90 transition-colors duration-200 cursor-pointer shadow-md shadow-accent/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Création en cours..." : "Créer l'expérience"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
