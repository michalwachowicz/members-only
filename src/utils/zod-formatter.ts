import { ZodError } from "zod";

export function formatZodErrors(error: ZodError): string[] {
  return error.issues.map((err) => {
    const path = err.path.join(".");
    return `${path.charAt(0).toUpperCase() + path.slice(1)}: ${err.message}`;
  });
}
