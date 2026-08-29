import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const chatSchema = z.object({
  question: z.string().min(1, "Question is required").max(2000),
});

export const atsSchema = z
  .object({
    jobDescription: z.string().max(10000).optional(),
    useSavedJd: z.boolean().optional(),
  })
  .refine(
    (data) =>
      data.useSavedJd === true ||
      (typeof data.jobDescription === "string" &&
        data.jobDescription.trim().length >= 10),
    {
      message:
        "jobDescription is required (min 10 characters) unless useSavedJd is true",
      path: ["jobDescription"],
    },
  );

export const interviewSchema = z.object({
  topic: z.string().max(500).optional(),
});

export const searchSchema = z.object({
  question: z.string().min(1, "Search query is required").max(500),
});
