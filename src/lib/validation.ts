// -----------------------------------------------------------------------------
// Zod schemas shared by the forms that write to the database.
// -----------------------------------------------------------------------------
// Zod (https://zod.dev) lets us describe "what a valid submission looks
// like" once, then use that same description to both validate the data AND
// get TypeScript types for it — instead of writing manual if-checks and a
// separate type by hand.
//
// These are used inside Server Actions (see consult/actions.ts and
// checkout/actions.ts) to check submitted form data BEFORE it touches the
// database. Never trust data from a form, even your own — a visitor can
// submit anything, with browser dev tools or a raw HTTP request, regardless
// of what the HTML form allows.
// -----------------------------------------------------------------------------

import { z } from "zod";

export const consultationSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name."),
  email: z.string().trim().email("Please enter a valid email address."),
  phone: z.string().trim().min(7, "Please enter a valid phone number."),
  projectType: z.string().trim().min(1, "Please choose a project type."),
  budgetRange: z.string().trim().optional(),
  timeline: z.string().trim().optional(),
  description: z
    .string()
    .trim()
    .min(10, "Please tell us a little more about what you have in mind."),
});

export const checkoutSchema = z.object({
  customerName: z.string().trim().min(2, "Please enter your name."),
  email: z.string().trim().email("Please enter a valid email address."),
  phone: z.string().trim().min(7, "Please enter a valid phone number."),
  deliveryAddress: z
    .string()
    .trim()
    .min(10, "Please enter a full delivery address."),
});
