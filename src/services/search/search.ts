import { useQuery } from '@tanstack/react-query';
import { ApiRequest } from '@/services/instance';
import {
    SearchMode,
    SearchParams,
    GuidesSearchResponse,
    ExperiencesSearchResponse,
    guidesSearchResponseSchema,
    experiencesSearchResponseSchema,
} from '@/schemas/search';

/**
 * Recherche de guides
 */
export const searchGuides = async (params: Omit<SearchParams, 'mode'> = {}) => {
    const queryParams = new URLSearchParams();
    queryParams.append('mode', SearchMode.GUIDE);

    // Paramètres par défaut
    const searchParams = {
        page: 1,
        limit: 20,
        sort: 'created_at',
        order: 'desc' as const,
        ...params,
    };

    Object.entries(searchParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            if (value instanceof Date) {
                queryParams.append(key, value.toISOString());
            } else {
                queryParams.append(key, String(value));
            }
        }
    });

    const queryString = queryParams.toString();
    return new ApiRequest<GuidesSearchResponse>(guidesSearchResponseSchema).get(
        `search?${queryString}`
    );
};

/**
 * Recherche d'expériences
 */
export const searchExperiences = async (params: Omit<SearchParams, 'mode'> = {}) => {
    const queryParams = new URLSearchParams();
    queryParams.append('mode', SearchMode.EXPERIENCE);

    // Paramètres par défaut
    const searchParams = {
        page: 1,
        limit: 20,
        sort: 'created_at',
        order: 'desc' as const,
        ...params,
    };

    Object.entries(searchParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            if (value instanceof Date) {
                queryParams.append(key, value.toISOString());
            } else {
                queryParams.append(key, String(value));
            }
        }
    });

    const queryString = queryParams.toString();
    return new ApiRequest<ExperiencesSearchResponse>(experiencesSearchResponseSchema).get(
        `search?${queryString}`
    );
};

/**
 * Hook pour rechercher des guides
 */
export const useSearchGuides = (
    params: Omit<SearchParams, 'mode'> = {},
    enabled: boolean = true
) => {
    return useQuery({
        queryKey: ['searchGuides', params],
        queryFn: () => searchGuides(params),
        enabled,
    });
};

/**
 * Hook pour rechercher des expériences
 */
export const useSearchExperiences = (
    params: Omit<SearchParams, 'mode'> = {},
    enabled: boolean = true
) => {
    return useQuery({
        queryKey: ['searchExperiences', params],
        queryFn: () => searchExperiences(params),
        enabled,
    });
};
