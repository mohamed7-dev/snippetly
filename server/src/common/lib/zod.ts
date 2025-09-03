import z from "zod";

export const ObjectIdStringSchema = z
  .string()
  .trim()
  .regex(
    /^[a-fA-F0-9]{24}$/,
    "Invalid MongoDB ObjectId (must be 24 hex chars)"
  );
