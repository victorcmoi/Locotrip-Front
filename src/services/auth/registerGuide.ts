import { useMutation } from '@tanstack/react-query';

export interface RegisterGuideData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  birth_date: string;
  phone?: string;
  bio: string;
  country: string;
  languages: string;
  years_of_experience: number;
}

export const registerGuide = async (data: RegisterGuideData): Promise<void> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}auth/register-guide`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erreur lors de l\'inscription');
  }
};

export const useRegisterGuide = () => {
  return useMutation({
    mutationFn: (data: RegisterGuideData) => registerGuide(data),
  });
};
