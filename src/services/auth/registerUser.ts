import { useMutation } from '@tanstack/react-query';
import { CreateUser } from '@/schemas/user';

export const registerUser = async (data: CreateUser): Promise<void> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erreur lors de l\'inscription');
  }
};

export const useRegisterUser = () => {
  return useMutation({
    mutationFn: (data: CreateUser) => registerUser(data),
  });
};
