import { getSession } from 'next-auth/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const resubmitGuideDocument = async (
  guideId: string,
  documentId: string,
  file: File,
): Promise<void> => {
  const session = await getSession();
  const apiBase = process.env.NEXT_PUBLIC_API_BASE;
  const token = session?.accessToken ?? '';

  // 1. Upload the new file
  const formData = new FormData();
  formData.append('file', file);
  formData.append('entityType', 'guide');
  formData.append('entityId', guideId);
  formData.append('mediaType', 'pictures');
  formData.append('bucket', 'locotrip');

  const uploadRes = await fetch(`${apiBase}media/upload/single`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!uploadRes.ok) {
    throw new Error("Erreur lors de l'upload du fichier");
  }

  const uploadData = await uploadRes.json();
  const newUrl = uploadData.media?.url || uploadData.uploadInfo?.url || '';

  // 2. Update the guide document with the new URL and reset status to pending
  const updateRes = await fetch(`${apiBase}guides/${guideId}/documents/${documentId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      document_url: newUrl,
      verification_status: 'pending',
      verification_comment: null,
    }),
  });

  if (!updateRes.ok) {
    throw new Error('Erreur lors de la mise à jour du document');
  }
};

export const useResubmitGuideDocument = (userId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ guideId, documentId, file }: { guideId: string; documentId: string; file: File }) =>
      resubmitGuideDocument(guideId, documentId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guide-by-user', userId] });
    },
  });
};
