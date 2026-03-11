import { z } from "zod";
import { ApiRequest } from "../instance";

const experienceStepSchema = z.object({
  id: z.string().uuid(),
  experience_id: z.string().uuid(),
  step_number: z.number(),
  title: z.string(),
  description: z.string().nullish(),
});

const stepsResponseSchema = z.array(experienceStepSchema);

export type ExperienceStepPayload = {
  step_number: number;
  title: string;
  description?: string;
};

export async function updateExperienceSteps(
  experienceId: string,
  steps: ExperienceStepPayload[],
) {
  return new ApiRequest(stepsResponseSchema).put(
    `experiences/${experienceId}/steps`,
    steps,
  );
}
