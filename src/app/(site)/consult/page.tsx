import type { Metadata } from "next";
import { ConsultForm } from "./ConsultForm";

// No database read on this page, so no `dynamic = "force-dynamic"` needed
// here — that's only required on pages that query Prisma directly. This
// page is static; the ConsultForm component handles the dynamic part
// (submitting) entirely through its Server Action.
export const metadata: Metadata = { title: "Book a Consultation" };

export default function ConsultPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="font-display text-3xl text-olive-dark">Book a Consultation</h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-olive-dark/70">
        Tell us a little about what you have in mind — a special occasion
        piece, a made-to-measure order, or something else entirely — and
        we&apos;ll reach out to arrange next steps.
      </p>

      <div className="mt-10">
        <ConsultForm />
      </div>
    </div>
  );
}
