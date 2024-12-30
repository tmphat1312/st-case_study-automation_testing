import { randomUUID } from "crypto";

export const generateUniqueValue = (value: string) =>
  value ? `${randomUUID()}-${value}` : "";
