"use client";

import { useActionState } from "react";
import { createProduct, type ProductFormState } from "../actions";
import { STANDARD_SIZE_LABELS } from "@/lib/constants";

const initialState: ProductFormState = { status: "idle", message: "" };

const inputClasses =
  "w-full border border-olive/25 bg-cream px-4 py-2.5 text-sm text-olive-dark focus:border-olive-dark focus:outline-none";
const labelClasses = "mb-1.5 block text-sm text-olive-dark/70";

export function NewProductForm() {
  const [state, formAction, pending] = useActionState(createProduct, initialState);

  return (
    // See the comment in consult/ConsultForm.tsx for why there's no
    // encType attribute here despite the file input below.
    <form action={formAction} className="max-w-2xl space-y-6">
      <div>
        <label htmlFor="name" className={labelClasses}>Product name</label>
        <input id="name" name="name" required className={inputClasses} />
        <p className="mt-1 text-xs text-olive-dark/50">
          The shop page URL is generated from this automatically.
        </p>
      </div>

      <div>
        <label htmlFor="description" className={labelClasses}>Description</label>
        <textarea id="description" name="description" required rows={4} className={inputClasses} />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="price" className={labelClasses}>Price (Naira)</label>
          <input id="price" name="price" type="number" min="0" step="1" required className={inputClasses} />
        </div>
        <div>
          <label htmlFor="category" className={labelClasses}>Category</label>
          <input id="category" name="category" required placeholder="e.g. Dresses" className={inputClasses} />
        </div>
      </div>

      <div>
        <label htmlFor="sizeChartCategory" className={labelClasses}>Size chart</label>
        <select id="sizeChartCategory" name="sizeChartCategory" defaultValue="TOPS" className={inputClasses}>
          <option value="TOPS">Tops / Dresses / Suits (bust, waist, hip)</option>
          <option value="PANTS">Pants / Skirts (waist, hip)</option>
        </select>
      </div>

      <fieldset>
        <legend className={labelClasses}>Stock per size</legend>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {STANDARD_SIZE_LABELS.map((label) => (
            <div key={label}>
              <label htmlFor={`stock-${label}`} className="mb-1 block text-xs text-olive-dark/60">
                UK {label}
              </label>
              <input
                id={`stock-${label}`}
                name={`stock-${label}`}
                type="number"
                min="0"
                defaultValue={0}
                className={inputClasses}
              />
            </div>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="images" className={labelClasses}>Photos</label>
        <input id="images" name="images" type="file" accept="image/*" multiple className="text-sm text-olive-dark/80" />
        <p className="mt-1 text-xs text-olive-dark/50">
          Leave empty to use a placeholder photo for now — you can add real photos any time by editing the product.
        </p>
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm text-olive-dark">
          <input type="checkbox" name="isFeatured" className="h-4 w-4" />
          Feature on homepage
        </label>
        <label className="flex items-center gap-2 text-sm text-olive-dark">
          <input type="checkbox" name="isActive" defaultChecked className="h-4 w-4" />
          Visible in shop
        </label>
      </div>

      {state.status === "error" && <p className="text-sm text-red-700">{state.message}</p>}

      <button
        type="submit"
        disabled={pending}
        className="bg-olive-dark px-8 py-3 font-heading text-sm uppercase tracking-[0.15em] text-cream hover:bg-olive disabled:opacity-60"
      >
        {pending ? "Saving..." : "Create product"}
      </button>
    </form>
  );
}
