declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      validatedBody?: unknown;
      validationErrors?: string[];
    }
  }
}

export {};
