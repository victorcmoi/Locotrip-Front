import { useQuery } from '@tanstack/react-query';
import { ApiRequest } from '@/services/instance';
import { currenciesSchema, CurrenciesSchema } from '@/schemas/currency';

export const getCurrencies = async () => {
    return new ApiRequest<CurrenciesSchema>(currenciesSchema).get('currencies');
};

export const useCurrencies = () => {
    return useQuery({
        queryKey: ['currencies'],
        queryFn: () => getCurrencies(),
    });
};
