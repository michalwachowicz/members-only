import { ZodError } from "zod";

export function formatZodErrors(error: ZodError): string[] {
  return error.issues.map((err) => err.message);
}
