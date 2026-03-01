import { getSession } from 'next-auth/react';

const deleteMedia = async (mediaId: string, token: string) => {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE;
  await fetch(`${apiBase}media/${mediaId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const uploadGuideProfilePicture = async (
  guideId: string,
  file: File,
  previousMediaId?: string | null,
) => {
  const session = await getSession();
  const apiBase = process.env.NEXT_PUBLIC_API_BASE;
  const token = session?.accessToken ?? '';

  // Supprimer l'ancienne photo si elle existe
  if (previousMediaId) {
    await deleteMedia(previousMediaId, token);
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('entityType', 'guide');
  formData.append('entityId', guideId);
  formData.append('mediaType', 'profile_picture');
  formData.append('bucket', 'locotrip');

  const res = await fetch(`${apiBase}media/upload/single`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Erreur inconnue' }));
    throw new Error(
      Array.isArray(err.message) ? err.message.join(', ') : err.message || "Erreur lors de l'upload",
    );
  }

  return res.json();
};
