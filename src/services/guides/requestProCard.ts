import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiRequest } from '@/services/instance';
import { z } from 'zod';

const proRequestDocumentSchema = z.object({
  document_type: z.string(),
  document_url: z.string(),
});

const proRequestResponseSchema = z.array(
  z.object({
    id: z.string().uuid(),
    guide_id: z.string().uuid(),
    document_type: z.string(),
    document_url: z.string().nullish(),
    verification_status: z.string(),
    verification_comment: z.string().nullish(),
    upload_date: z.string().or(z.date()),
    verification_date: z.string().or(z.date()).nullish(),
  }),
);

type ProRequestResponse = z.infer<typeof proRequestResponseSchema>;

interface RequestProPayload {
  guideId: string;
  documents?: { document_type: string; document_url: string }[];
}

export const requestProCard = async (
  payload: RequestProPayload,
): Promise<ProRequestResponse> => {
  return new ApiRequest<ProRequestResponse>(proRequestResponseSchema).post(
    `guides/${payload.guideId}/request-pro`,
    { documents: payload.documents || [] },
  );
};

export const useRequestProCard = (userId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RequestProPayload) => requestProCard(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guide-by-user', userId] });
    },
  });
};
