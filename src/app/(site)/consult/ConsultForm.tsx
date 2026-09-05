"use client";

// The consultation request form. A Client Component because it uses
// React's useActionState to show validation errors and a pending state
// without a full page reload — the actual data handling still happens on
// the server, inside submitConsultationRequest (see actions.ts).

import { useActionState } from "react";
import { submitConsultationRequest, type ConsultationFormState } from "./actions";

const initialState: ConsultationFormState = { status: "idle", message: "" };

// A small helper so each field doesn't have to repeat the
// "look up this field's error and show it" logic.
function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return <p className="mt-1 text-sm text-red-700">{messages[0]}</p>;
}

const inputClasses =
  "w-full border border-olive/25 bg-cream px-4 py-2.5 text-sm text-olive-dark placeholder:text-olive-dark/40 focus:border-olive-dark focus:outline-none";
const labelClasses = "mb-1.5 block font-heading text-xs uppercase tracking-[0.15em] text-olive-dark/70";

export function ConsultForm() {
  const [state, formAction, pending] = useActionState(
    submitConsultationRequest,
    initialState
  );

  if (state.status === "success") {
    return (
      <div className="border border-olive/20 bg-cream-dark p-6 text-olive-dark">
        {state.message}
      </div>
    );
  }

  return (
    // No `encType` attribute here on purpose: when `action` is a function
    // (a Server Action) rather than a URL string, React builds the
    // FormData itself — including any files — regardless of encType, and
    // actually warns if you set one.
    <form action={formAction} className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="name" className={labelClasses}>Full name</label>
          <input id="name" name="name" type="text" required className={inputClasses} />
          <FieldError messages={state.fieldErrors?.name} />
        </div>
        <div>
          <label htmlFor="email" className={labelClasses}>Email</label>
          <input id="email" name="email" type="email" required className={inputClasses} />
          <FieldError messages={state.fieldErrors?.email} />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="phone" className={labelClasses}>Phone number</label>
          <input id="phone" name="phone" type="tel" required className={inputClasses} />
          <FieldError messages={state.fieldErrors?.phone} />
        </div>
        <div>
          <label htmlFor="projectType" className={labelClasses}>Project type</label>
          <select id="projectType" name="projectType" required defaultValue="" className={inputClasses}>
            <option value="" disabled>Select one...</option>
            <option value="Bridal">Bridal</option>
            <option value="Occasion wear">Occasion wear</option>
            <option value="Everyday/ready-to-wear">Everyday / ready-to-wear</option>
            <option value="Corporate/uniform">Corporate / uniform</option>
            <option value="Other">Other</option>
          </select>
          <FieldError messages={state.fieldErrors?.projectType} />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="budgetRange" className={labelClasses}>Budget range (optional)</label>
          <input
            id="budgetRange"
            name="budgetRange"
            type="text"
            placeholder="e.g. 100,000 – 200,000"
            className={inputClasses}
          />
        </div>
        <div>
          <label htmlFor="timeline" className={labelClasses}>Timeline (optional)</label>
          <input
            id="timeline"
            name="timeline"
            type="text"
            placeholder="e.g. needed by December"
            className={inputClasses}
          />
        </div>
      </div>

      <div>
        <label htmlFor="description" className={labelClasses}>Tell us about your project</label>
        <textarea
          id="description"
          name="description"
          required
          rows={5}
          className={inputClasses}
          placeholder="Fabrics, inspiration, occasion, measurements you already have..."
        />
        <FieldError messages={state.fieldErrors?.description} />
      </div>

      <div>
        <label htmlFor="referenceImage" className={labelClasses}>Reference photo (optional)</label>
        <input
          id="referenceImage"
          name="referenceImage"
          type="file"
          accept="image/*"
          className="w-full text-sm text-olive-dark/80"
        />
      </div>

      {state.status === "error" && (
        <p className="text-sm text-red-700">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="bg-olive-dark px-8 py-3 font-heading text-sm uppercase tracking-[0.15em] text-cream transition hover:bg-olive disabled:opacity-60"
      >
        {pending ? "Sending..." : "Send request"}
      </button>
    </form>
  );
}
