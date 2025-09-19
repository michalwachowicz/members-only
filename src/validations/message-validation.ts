import { z } from "zod";

export const MessageSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters"),
  content: z
    .string()
    .min(20, "Content must be at least 20 characters for clarity and detail")
    .max(1000, "Content must be less than 1000 characters"),
});
