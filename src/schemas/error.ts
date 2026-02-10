import { z } from "zod";

export const apiErrorResponseSchema = z.object({
  message: z.union([z.string(), z.array(z.string())]).nullish(),
  error: z.string().nullish(),
  statusCode: z.number(),
});

export type ApiErrorResponseSchema = z.infer<typeof apiErrorResponseSchema>;
