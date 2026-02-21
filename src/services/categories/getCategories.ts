import { useQuery } from '@tanstack/react-query';
import { ApiRequest } from '@/services/instance';
import { categoriesSchema, type Categories } from '@/schemas/category';

export const getCategories = async () => {
  return new ApiRequest<Categories>(categoriesSchema).get('categories');
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => getCategories(),
  });
};
