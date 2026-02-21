import { getSession } from 'next-auth/react';

export const uploadExperiencePhotos = async (
  experienceId: string,
  files: File[],
  descriptions?: string[],
) => {
  const session = await getSession();
  const apiBase = process.env.NEXT_PUBLIC_API_BASE;

  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));
  formData.append('entityType', 'experience');
  formData.append('entityId', experienceId);
  formData.append('mediaType', 'pictures');
  formData.append('bucket', 'locotrip');

  // Append descriptions (captions) for each file
  if (descriptions) {
    descriptions.forEach((desc) => formData.append('descriptions', desc));
  }

  const res = await fetch(`${apiBase}media/upload/multiple`, {
    method: 'POST',
    headers: {
      ...(session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {}),
    },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Erreur inconnue" }));
    throw new Error(
      Array.isArray(err.message) ? err.message.join(', ') : err.message || "Erreur lors de l'upload"
    );
  }

  return res.json();
};
