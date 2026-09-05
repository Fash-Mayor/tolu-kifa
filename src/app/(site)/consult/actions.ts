"use server";

// -----------------------------------------------------------------------------
// Server Action — code that lives here but runs ONLY on the server, even
// though the form that calls it is a Client Component. The "use server"
// directive at the top of the file is what makes that possible: Next.js
// swaps this function out for a secure reference in the browser bundle and
// actually executes the real code (including the database write) back on
// the server. See https://nextjs.org/docs/app/getting-started/updating-data
// -----------------------------------------------------------------------------

import { prisma } from "@/lib/prisma";
import { saveUploadedImage } from "@/lib/storage";
import { consultationSchema } from "@/lib/validation";

// The shape of data this action hands back to the form, used with React's
// useActionState hook on the client (see ConsultForm.tsx). `fieldErrors`
// lets us show "Please enter a valid email" right under the email field,
// instead of one generic error message for the whole form.
export type ConsultationFormState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors?: Record<string, string[]>;
};

export async function submitConsultationRequest(
  _previousState: ConsultationFormState,
  formData: FormData
): Promise<ConsultationFormState> {
  const parsed = consultationSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    projectType: formData.get("projectType"),
    budgetRange: formData.get("budgetRange") || undefined,
    timeline: formData.get("timeline") || undefined,
    description: formData.get("description"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please fix the errors below and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  // The reference photo is optional — only save it if the visitor actually
  // attached one. `instanceof File` also filters out the empty string a
  // browser sends for a file input nobody touched.
  let referenceImageUrl: string | undefined;
  const referenceImage = formData.get("referenceImage");
  if (referenceImage instanceof File && referenceImage.size > 0) {
    referenceImageUrl = await saveUploadedImage(referenceImage);
  }

  await prisma.consultationRequest.create({
    data: {
      ...parsed.data,
      referenceImageUrl,
    },
  });

  return {
    status: "success",
    message:
      "Thank you! We've received your request and will be in touch shortly.",
  };
}
