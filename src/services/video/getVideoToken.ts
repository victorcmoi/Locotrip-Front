import { useMutation } from "@tanstack/react-query";
import { ApiRequest } from "@/services/instance";
import { z } from "zod";

const videoTokenResponseSchema = z.object({
  token: z.string(),
});

type VideoTokenResponse = z.infer<typeof videoTokenResponseSchema>;

interface GenerateTokenPayload {
  identity: string;
  room: string;
}

export const getVideoToken = async (
  payload: GenerateTokenPayload,
): Promise<VideoTokenResponse> => {
  return new ApiRequest<VideoTokenResponse>(videoTokenResponseSchema).post(
    "video/token",
    payload,
  );
};

export const useVideoToken = () => {
  return useMutation({
    mutationFn: getVideoToken,
  });
};
