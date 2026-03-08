import { getSession } from 'next-auth/react';

export const uploadGuideDocument = async (
  guideId: string,
  file: File,
): Promise<string> => {
  const session = await getSession();
  const apiBase = process.env.NEXT_PUBLIC_API_BASE;
  const token = session?.accessToken ?? '';

  const formData = new FormData();
  formData.append('file', file);
  formData.append('entityType', 'guide');
  formData.append('entityId', guideId);
  formData.append('mediaType', 'pictures');
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

  const data = await res.json();
  return data.media?.url || data.uploadInfo?.url || '';
};
