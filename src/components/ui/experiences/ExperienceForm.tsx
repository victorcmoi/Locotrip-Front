"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useSearchCities } from "@/services/cities/getCities";
import { useCategories } from "@/services/categories/getCategories";
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
  List,
  Accessibility,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { MinioHelpers } from "@/utils/minio";
import type { City } from "@/schemas/city";
import type { Category } from "@/schemas/category";
import type { Experience } from "@/schemas/experience";
import { z } from "zod";

const LocationPicker = dynamic(
  () => import("@/components/ui/experiences/LocationPicker"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[400px] rounded-xl bg-gray-100 animate-pulse" />
    ),
  },
);

const RichTextEditor = dynamic(() => import("@/components/ui/RichTextEditor"), {
  ssr: false,
  loading: () => (
    <div className="h-[160px] rounded-xl bg-gray-100 animate-pulse" />
  ),
});

// ── Types ──────────────────────────────────────────────

export type ExperienceFormData = {
  title: string;
  description: string;
  additional_info: string;
  price: number | "";
  duration: number | "";
  max_capacity: number | "";
  city_id: string;
  meeting_point: string;
  meeting_latitude: number | "";
  meeting_longitude: number | "";
  is_accessible: boolean;
};

export type ExperienceStep = {
  title: string;
  description: string;
};

export type AvailabilitySlot = {
  id?: string;
  start_date: string;
  end_date: string;
  status: "available" | "unavailable" | "blocked";
  isExisting?: boolean;
};

export type ExistingMedia = {
  id: string;
  url: string;
  description?: string | null;
  toDelete?: boolean;
};

export type ExperienceFormPayload = {
  formData: ExperienceFormData;
  selectedCategories: string[];
  originalCategories: string[];
  newFiles: File[];
  captions: string[];
  existingMediasToDelete: string[];
  newAvailabilitySlots: AvailabilitySlot[];
  steps: ExperienceStep[];
};

// ── Validation schemas ─────────────────────────────────

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

const STEPS = [
  { label: "Informations", icon: FileText },
  { label: "Détails", icon: List },
  { label: "Catégories", icon: Tag },
  { label: "Localisation", icon: MapPin },
  { label: "Photos", icon: ImageIcon },
  { label: "Disponibilités", icon: Calendar },
];

// ── Props ──────────────────────────────────────────────

interface ExperienceFormProps {
  mode: "create" | "update";
  initialExperience?: Experience;
  onSubmit: (payload: ExperienceFormPayload) => Promise<void>;
  title: string;
  backHref: string;
  backLabel: string;
  submitLabel: string;
  submittingLabel: string;
}

// ── Component ──────────────────────────────────────────

export default function ExperienceForm({
  mode,
  initialExperience,
  onSubmit,
  title,
  backHref,
  backLabel,
  submitLabel,
  submittingLabel,
}: ExperienceFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialized, setInitialized] = useState(mode === "create");

  const [formData, setFormData] = useState<ExperienceFormData>({
    title: "",
    description: "",
    additional_info: "",
    price: "",
    duration: "",
    max_capacity: "",
    city_id: "",
    meeting_point: "",
    meeting_latitude: "",
    meeting_longitude: "",
    is_accessible: false,
  });

  // Steps
  const [steps, setSteps] = useState<ExperienceStep[]>([]);

  // Categories
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [originalCategories, setOriginalCategories] = useState<string[]>([]);
  const { data: categories } = useCategories();

  // City search
  const [citySearch, setCitySearch] = useState("");
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const { data: searchResults, isLoading: searchLoading } = useSearchCities(
    citySearch,
    citySearch.length > 0 && !selectedCity,
  );

  // Photos — existing (update mode only)
  const [existingMedias, setExistingMedias] = useState<ExistingMedia[]>([]);
  // Photos — new
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

  // Pre-fill form in update mode
  useEffect(() => {
    if (mode === "update" && initialExperience && !initialized) {
      setFormData({
        title: initialExperience.title,
        description: initialExperience.description || "",
        additional_info: initialExperience.additional_info || "",
        price: initialExperience.price,
        duration: initialExperience.duration,
        max_capacity: initialExperience.max_capacity ?? "",
        city_id: initialExperience.city_id,
        meeting_point: initialExperience.meeting_point || "",
        meeting_latitude: initialExperience.meeting_latitude ?? "",
        meeting_longitude: initialExperience.meeting_longitude ?? "",
        is_accessible: initialExperience.is_accessible ?? false,
      });

      if (initialExperience.steps && initialExperience.steps.length > 0) {
        setSteps(
          initialExperience.steps.map((s) => ({
            title: s.title,
            description: s.description || "",
          })),
        );
      }

      if (initialExperience.city) {
        setSelectedCity(initialExperience.city as City);
        setCitySearch(
          `${initialExperience.city.name}, ${initialExperience.city.country}`,
        );
      }

      const catIds =
        initialExperience.categories
          ?.map((c) => c.category_id)
          .filter((id): id is string => !!id) ?? [];
      setSelectedCategories(catIds);
      setOriginalCategories(catIds);

      if (initialExperience.medias) {
        setExistingMedias(
          initialExperience.medias.map((m) => ({
            id: m.id,
            url: m.url,
            description: m.description,
            toDelete: false,
          })),
        );
      }

      if (initialExperience.availabilities) {
        setAvailabilitySlots(
          initialExperience.availabilities.map((a) => ({
            id: a.id,
            start_date: new Date(a.start_date).toISOString().slice(0, 16),
            end_date: new Date(a.end_date).toISOString().slice(0, 16),
            status: a.status as "available" | "unavailable" | "blocked",
            isExisting: true,
          })),
        );
      }

      setInitialized(true);
    }
  }, [mode, initialExperience, initialized]);

  // ── Field helpers ────────────────────────────────────

  const updateField = (
    field: keyof ExperienceFormData,
    value: string | number | boolean,
  ) => {
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
    } else if (step === 3) {
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
      return true;
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

  // ── Photo handlers ───────────────────────────────────

  const toggleDeleteExistingMedia = (mediaId: string) => {
    setExistingMedias((prev) =>
      prev.map((m) => (m.id === mediaId ? { ...m, toDelete: !m.toDelete } : m)),
    );
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const keptExisting = existingMedias.filter((m) => !m.toDelete).length;
    const remaining = 10 - keptExisting - selectedFiles.length;
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

  const removeNewPhoto = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    setCaptions((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Availability handlers ────────────────────────────

  const addAvailabilitySlot = () => {
    if (!newSlot.start_date || !newSlot.end_date) return;
    setAvailabilitySlots((prev) => [
      ...prev,
      { ...newSlot, isExisting: false },
    ]);
    setNewSlot({ start_date: "", end_date: "", status: "available" });
  };

  const removeAvailabilitySlot = (index: number) => {
    setAvailabilitySlots((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Submit ───────────────────────────────────────────

  const handleSubmit = async () => {
    setApiError(null);
    setIsSubmitting(true);

    try {
      await onSubmit({
        formData,
        selectedCategories,
        originalCategories,
        newFiles: selectedFiles,
        captions,
        existingMediasToDelete: existingMedias
          .filter((m) => m.toDelete)
          .map((m) => m.id),
        newAvailabilitySlots: availabilitySlots.filter((s) => !s.isExisting),
        steps,
      });
    } catch (err) {
      setApiError(
        err instanceof Error ? err.message : "Une erreur est survenue.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Helpers ──────────────────────────────────────────

  const formatDuration = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m} min`;
    if (m === 0) return `${h}h`;
    return `${h}h${m}`;
  };

  const totalPhotos =
    existingMedias.filter((m) => !m.toDelete).length + selectedFiles.length;

  const inputClass = (field: string) =>
    `w-full px-4 py-3 rounded-xl border ${
      errors[field] ? "border-red-400" : "border-gray-light"
    } bg-light text-dark placeholder:text-dark/40 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition`;

  // ── Render ───────────────────────────────────────────

  return (
    <div className="py-8">
      {/* Back link */}
      <Link
        href={backHref}
        className="flex items-center gap-2 text-dark/70 hover:text-dark transition text-sm font-medium mb-8"
      >
        <ArrowLeft size={12} />
        {backLabel}
      </Link>

      {/* Title */}
      <h1 className="text-3xl font-extrabold text-dark mb-8">{title}</h1>

      {/* Stepper */}
      <div className="flex items-center mb-12 max-w-3xl mx-auto">
        {STEPS.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          return (
            <React.Fragment key={index}>
              <div className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (index <= currentStep || validateStep(currentStep)) {
                      setCurrentStep(index);
                    }
                  }}
                  className={`w-14 h-14 rounded-full flex items-center justify-center font-bold transition-all duration-300 cursor-pointer flex-shrink-0 ${
                    isCompleted
                      ? "bg-accent text-white"
                      : isActive
                        ? "bg-accent text-white scale-110"
                        : "bg-gray-200 text-dark/40"
                  }`}
                >
                  {isCompleted ? <Check size={32} /> : <step.icon size={32} />}
                </button>
                <span
                  className={`text-[10px] font-semibold transition-colors duration-300 whitespace-nowrap ${
                    isActive || isCompleted ? "text-dark" : "text-dark/40"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div className="flex-1 mx-2 mt-[-24px]">
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
                className={inputClass("title")}
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
                className={`${inputClass("description")} resize-none`}
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
                    className={`${inputClass("price")} !pl-10`}
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
                  className={inputClass("duration")}
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
                className={inputClass("max_capacity")}
              />
              {errors.max_capacity && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.max_capacity}
                </p>
              )}
            </div>

            {/* Accessibilité PMR */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-gray-light bg-light">
              <div className="flex items-center gap-3">
                <Accessibility size={24} className="text-dark/70" />
                <div>
                  <p className="text-sm font-semibold text-dark">
                    Accessible aux personnes à mobilité réduite
                  </p>
                  <p className="text-xs text-dark/50">
                    Cette expérience est adaptée aux PMR
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  updateField("is_accessible", !formData.is_accessible)
                }
                className={`p-0 relative w-14 h-8 rounded-full transition-colors cursor-pointer ${
                  formData.is_accessible ? "bg-accent" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow transition-transform ${
                    formData.is_accessible ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        )}

        {/* ========== Step 2: Détails ========== */}
        {currentStep === 1 && (
          <div className="flex flex-col gap-6">
            {/* Informations complémentaires (WYSIWYG) */}
            <div>
              <label className="block text-sm font-semibold text-dark mb-1.5">
                Informations complémentaires{" "}
                <span className="text-dark/40 font-normal">(optionnel)</span>
              </label>
              <p className="text-xs text-dark/50 mb-2">
                Ajoutez des détails supplémentaires : équipement à prévoir,
                conseils, accessibilité, etc.
              </p>
              <RichTextEditor
                value={formData.additional_info}
                onChange={(val) => updateField("additional_info", val)}
                placeholder="Ex: Pensez à apporter des chaussures confortables et une bouteille d'eau..."
              />
            </div>

            {/* Étapes de l'expérience */}
            <div>
              <label className="block text-sm font-semibold text-dark mb-1.5">
                Étapes de l&apos;expérience{" "}
                <span className="text-dark/40 font-normal">(optionnel)</span>
              </label>
              <p className="text-xs text-dark/50 mb-3">
                Décrivez le déroulement de votre expérience étape par étape.
              </p>

              {steps.length > 0 && (
                <div className="flex flex-col gap-3 mb-4">
                  {steps.map((step, index) => (
                    <div
                      key={index}
                      className="flex gap-3 items-start p-4 rounded-xl border border-gray-light bg-light"
                    >
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-accent text-white font-bold text-sm shrink-0 mt-0.5">
                        {index + 1}
                      </span>
                      <div className="flex-1 flex flex-col gap-2">
                        <input
                          type="text"
                          value={step.title}
                          onChange={(e) => {
                            const updated = [...steps];
                            updated[index] = {
                              ...updated[index],
                              title: e.target.value,
                            };
                            setSteps(updated);
                          }}
                          placeholder="Titre de l'étape"
                          className="w-full px-3 py-2 rounded-lg border border-gray-light bg-white text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                        />
                        <textarea
                          value={step.description}
                          onChange={(e) => {
                            const updated = [...steps];
                            updated[index] = {
                              ...updated[index],
                              description: e.target.value,
                            };
                            setSteps(updated);
                          }}
                          placeholder="Description de l'étape (optionnel)"
                          rows={2}
                          className="w-full px-3 py-2 rounded-lg border border-gray-light bg-white text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 resize-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setSteps((prev) => prev.filter((_, i) => i !== index))
                        }
                        className="bg-white p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-500 transition cursor-pointer shrink-0"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={() =>
                  setSteps((prev) => [...prev, { title: "", description: "" }])
                }
                className="flex bg-white items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-accent/40 text-accent text-sm font-medium hover:bg-accent/5 transition cursor-pointer"
              >
                <Plus size={16} />
                Ajouter une étape
              </button>
            </div>
          </div>
        )}

        {/* ========== Step 3: Catégories ========== */}
        {currentStep === 2 && (
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

        {/* ========== Step 4: Localisation ========== */}
        {currentStep === 3 && (
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
                  className={`${inputClass("city_id")} !pl-10`}
                />
              </div>
              {errors.city_id && (
                <p className="text-red-500 text-xs mt-1">{errors.city_id}</p>
              )}

              {showCityDropdown && citySearch.length > 0 && !selectedCity && (
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

            <hr className="border-gray-light" />

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

            <div>
              <label className="block text-sm font-semibold text-dark mb-1.5">
                Point de rencontre sur la carte
              </label>
              <p className="text-xs text-dark/40 mb-3">
                Cliquez sur la carte pour placer le marqueur, ou déplacez-le
                pour ajuster la position.
              </p>

              <LocationPicker
                latitude={formData.meeting_latitude}
                longitude={formData.meeting_longitude}
                onChange={(lat, lng) => {
                  updateField("meeting_latitude", lat);
                  updateField("meeting_longitude", lng);
                }}
              />

              {formData.meeting_latitude !== "" &&
                formData.meeting_longitude !== "" && (
                  <p className="text-xs text-dark/60 mt-2 font-mono">
                    📍 {formData.meeting_latitude}, {formData.meeting_longitude}
                  </p>
                )}

              {(errors.meeting_latitude || errors.meeting_longitude) && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.meeting_latitude || errors.meeting_longitude}
                </p>
              )}
            </div>
          </div>
        )}

        {/* ========== Step 5: Photos ========== */}
        {currentStep === 4 && (
          <div className="flex flex-col gap-6">
            <h2 className="text-xl font-bold text-dark mb-1">Photos</h2>
            <p className="text-sm text-dark/60">
              {mode === "update"
                ? "Gérez les photos existantes et ajoutez-en de nouvelles (max 10 au total)."
                : "Ajoutez jusqu\u0027à 10 photos pour illustrer votre expérience."}
            </p>

            {/* Existing photos (update mode) */}
            {existingMedias.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-dark mb-3">
                  Photos existantes
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {existingMedias.map((media) => (
                    <div
                      key={media.id}
                      className={`flex flex-col gap-2 rounded-xl border p-3 transition-all duration-200 ${
                        media.toDelete
                          ? "border-red-300 bg-red-50 opacity-60"
                          : "border-gray-light bg-light"
                      }`}
                    >
                      <div className="relative aspect-4/3 rounded-lg overflow-hidden group">
                        <Image
                          src={MinioHelpers.experience(media.url)}
                          alt={media.description || "Photo"}
                          fill
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => toggleDeleteExistingMedia(media.id)}
                          className={`absolute z-10 top-2 p-1 right-2 rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity ${
                            media.toDelete
                              ? "bg-accent text-white"
                              : "bg-light text-red-600"
                          }`}
                        >
                          {media.toDelete ? (
                            <Plus size={16} className="rotate-45" />
                          ) : (
                            <X size={16} />
                          )}
                        </button>
                        {media.toDelete && (
                          <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                            <span className="bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                              Sera supprimée
                            </span>
                          </div>
                        )}
                      </div>
                      {media.description && (
                        <p className="text-xs text-dark/60 px-1 line-clamp-2">
                          {media.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload zone */}
            <div>
              {existingMedias.length > 0 && (
                <h3 className="text-sm font-semibold text-dark mb-3">
                  Ajouter de nouvelles photos
                </h3>
              )}
              <div
                onClick={() =>
                  totalPhotos < 10 && fileInputRef.current?.click()
                }
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors duration-200 ${
                  totalPhotos >= 10
                    ? "border-gray-300 bg-gray-50 cursor-not-allowed"
                    : "border-accent/30 hover:border-accent cursor-pointer hover:bg-accent/5"
                }`}
              >
                <UploadCloud
                  className="mx-auto text-accent/60 mb-3"
                  size={40}
                />
                <p className="text-sm font-medium text-dark/70">
                  {totalPhotos >= 10
                    ? "Maximum de 10 photos atteint"
                    : "Cliquez ou glissez vos photos ici"}
                </p>
                <p className="text-xs text-dark/40 mt-1">
                  JPEG, PNG, WebP • Max 10 fichiers
                  {mode === "update" ? " au total" : ""}
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
            </div>

            {/* New photo previews */}
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
                        onClick={() => removeNewPhoto(index)}
                        className="absolute z-10 p-1 bg-light text-red-600 top-2 right-2 stroke-2 rounded-full w-6 h-6 flex opacity-0 group-hover:opacity-100 cursor-pointer"
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
              {totalPhotos} / 10 photo
              {totalPhotos > 1 ? "s" : ""}
              {mode === "update"
                ? " au total"
                : ` sélectionnée${totalPhotos > 1 ? "s" : ""}`}
            </p>
          </div>
        )}

        {/* ========== Step 6: Disponibilités + Récapitulatif ========== */}
        {currentStep === 5 && (
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-bold text-dark">Disponibilités</h2>
              <p className="text-sm text-dark/60">
                {mode === "update"
                  ? "Gérez les créneaux de disponibilité pour cette expérience."
                  : "Ajoutez vos créneaux de disponibilité pour cette expérience."}
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

              {/* Slots list */}
              {availabilitySlots.length > 0 && (
                <div className="flex flex-col gap-2">
                  {availabilitySlots.map((slot, index) => (
                    <div
                      key={slot.id || index}
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
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            slot.status === "available"
                              ? "bg-green-100 text-green-700"
                              : slot.status === "blocked"
                                ? "bg-red-100 text-red-600"
                                : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {slot.status === "available"
                            ? "Disponible"
                            : slot.status === "blocked"
                              ? "Bloqué"
                              : "Indisponible"}
                        </span>
                        {slot.isExisting && (
                          <span className="text-xs text-dark/30">
                            (existant)
                          </span>
                        )}
                      </div>
                      {!slot.isExisting && (
                        <button
                          type="button"
                          onClick={() => removeAvailabilitySlot(index)}
                          className="text-red-400 hover:text-red-600 transition cursor-pointer bg-light p-1"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <hr className="border-gray-light" />

            {/* Récapitulatif */}
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-bold text-dark">Récapitulatif</h2>
              <p className="text-sm text-dark/60">
                Vérifiez les informations avant{" "}
                {mode === "create"
                  ? "de créer votre expérience."
                  : "d\u0027enregistrer les modifications."}
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

                {formData.additional_info &&
                  formData.additional_info !== "<p><br></p>" && (
                    <div className="md:col-span-2">
                      <p className="text-xs font-semibold text-dark/50 uppercase tracking-wider mb-1">
                        Informations complémentaires
                      </p>
                      <div
                        className="text-dark/80 text-sm leading-relaxed prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{
                          __html: formData.additional_info,
                        }}
                      />
                    </div>
                  )}

                {steps.length > 0 && (
                  <div className="md:col-span-2">
                    <p className="text-xs font-semibold text-dark/50 uppercase tracking-wider mb-2">
                      Étapes ({steps.length})
                    </p>
                    <div className="flex flex-col gap-2">
                      {steps
                        .filter((s) => s.title.trim())
                        .map((step, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-2 text-sm"
                          >
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-accent/10 text-accent font-bold text-xs shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            <div>
                              <p className="text-dark font-medium">
                                {step.title}
                              </p>
                              {step.description && (
                                <p className="text-dark/60 text-xs">
                                  {step.description}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

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
                    Accessibilité PMR
                  </p>
                  <p className="text-dark font-medium flex items-center gap-1.5">
                    {formData.is_accessible ? (
                      <span className="text-green-600">Oui</span>
                    ) : (
                      <span className="text-dark/40">Non</span>
                    )}
                  </p>
                </div>

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

                {(selectedFiles.length > 0 || existingMedias.length > 0) && (
                  <div className="md:col-span-2">
                    <p className="text-xs font-semibold text-dark/50 uppercase tracking-wider mb-1">
                      Photos
                    </p>
                    <p className="text-dark font-medium text-sm">
                      {mode === "update" ? (
                        <>
                          {existingMedias.filter((m) => !m.toDelete).length}{" "}
                          existante
                          {existingMedias.filter((m) => !m.toDelete).length > 1
                            ? "s"
                            : ""}
                          {existingMedias.filter((m) => m.toDelete).length >
                            0 &&
                            ` (${existingMedias.filter((m) => m.toDelete).length} à supprimer)`}
                          {selectedFiles.length > 0 &&
                            ` + ${selectedFiles.length} nouvelle${selectedFiles.length > 1 ? "s" : ""}`}
                        </>
                      ) : (
                        <>
                          {selectedFiles.length} photo
                          {selectedFiles.length > 1 ? "s" : ""} sélectionnée
                          {selectedFiles.length > 1 ? "s" : ""}
                        </>
                      )}
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
                    <div className="md:col-span-2">
                      <p className="text-xs font-semibold text-dark/50 uppercase tracking-wider mb-2">
                        Point de rencontre
                      </p>
                      <LocationPicker
                        latitude={formData.meeting_latitude}
                        longitude={formData.meeting_longitude}
                        onChange={() => {}}
                      />
                      <p className="text-dark/50 text-xs mt-2 font-mono">
                        📍 {formData.meeting_latitude},{" "}
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
                      {mode === "update" ? (
                        <>
                          {availabilitySlots.filter((s) => s.isExisting).length}{" "}
                          existant
                          {availabilitySlots.filter((s) => s.isExisting)
                            .length > 1
                            ? "s"
                            : ""}
                          {availabilitySlots.filter((s) => !s.isExisting)
                            .length > 0 &&
                            ` + ${availabilitySlots.filter((s) => !s.isExisting).length} nouveau${
                              availabilitySlots.filter((s) => !s.isExisting)
                                .length > 1
                                ? "x"
                                : ""
                            }`}
                        </>
                      ) : (
                        <>
                          {availabilitySlots.length} créneau
                          {availabilitySlots.length > 1 ? "x" : ""}
                        </>
                      )}
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
              {isSubmitting ? submittingLabel : submitLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
