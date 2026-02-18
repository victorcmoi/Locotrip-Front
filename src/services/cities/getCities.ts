import { use } from 'react';
import { Cities, citiesResponseSchema } from "@/schemas/city";
import { ApiRequest } from '@/services/instance';
import { useQuery } from '@tanstack/react-query';

export const getCities = async () => {
    return new ApiRequest<Cities>(citiesResponseSchema).get('cities');
}

export const getSuggestedCities = async () => {
    return new ApiRequest<Cities>(citiesResponseSchema).get('cities/suggested');
}

export const searchCities = async (searchValue: string, limit: number = 10, page: number = 1, order: 'asc' | 'desc' = 'asc') => {
    const params = new URLSearchParams({
        search: searchValue,
        limit: limit.toString(),
        page: page.toString(),
        order,
    });
    return new ApiRequest<Cities>(citiesResponseSchema).get(`cities?${params.toString()}`);
}

export const useCities = () => {
    return useQuery({
        queryKey: ['cities'],
        queryFn: () => getCities(),
    })
}

export const useSuggestedCities = () => {
    return useQuery({
        queryKey: ['suggestedCities'],
        queryFn: () => getSuggestedCities(),
    })
}

export const useSearchCities = (searchValue: string, enabled: boolean = true) => {
    return useQuery({
        queryKey: ['cities', 'search', searchValue],
        queryFn: () => searchCities(searchValue),
        enabled: enabled && searchValue.trim().length > 0,
    })
}