import z from "zod";

export const citiesSearchSchema = z.object({
  query: z
    .string()
    .min(2, "Search query must be at least 2 characters")
    .max(50, "Search query must be less than 50 characters"),
  limit: z
    .number()
    .int("Limit must be an integer")
    .min(1, "Limit must be at least 1")
    .max(10, "Limit cannot exceed 10")
    .optional()
    .default(5),
});

export type CitiesSearchRequest = z.infer<typeof citiesSearchSchema>;
