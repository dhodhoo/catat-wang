import { z } from "zod";

export const signUpSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6)
});

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const verifyEmailSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6)
});

export const resendVerificationSchema = z.object({
  email: z.string().email()
});
