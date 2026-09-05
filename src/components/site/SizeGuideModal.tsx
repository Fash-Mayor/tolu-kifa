"use client";

// A small popup showing the measurement table for a product's size chart
// category. The actual numbers are fetched server-side (in the product
// page) and passed in as the `rows` prop — this component only handles the
// open/close interaction, so it needs "use client".

import { useState } from "react";

export type SizeGuideRow = {
  ukSize: string;
  usSize: string;
  bustInches: number | null;
  waistInches: number;
  hipInches: number;
};

export function SizeGuideModal({
  rows,
  hasBustColumn,
}: {
  rows: SizeGuideRow[];
  hasBustColumn: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="text-sm text-olive-dark/70 underline underline-offset-4 hover:text-olive-dark"
      >
        Size guide
      </button>

      {isOpen && (
        // Clicking the dimmed backdrop closes the modal; clicking inside
        // the card stops that click from "bubbling up" to the backdrop
        // (via stopPropagation below) so the modal doesn't close by
        // accident while someone is reading it.
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-olive-dark/50 p-4"
          onClick={() => setIsOpen(false)}
          role="presentation"
        >
          <div
            className="max-h-[85vh] w-full max-w-lg overflow-auto bg-cream p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Size guide"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-heading text-lg uppercase tracking-[0.15em] text-olive-dark">
                Size Guide
              </h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close size guide"
                className="text-olive-dark/60 hover:text-olive-dark"
              >
                ✕
              </button>
            </div>

            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-olive/20 font-heading uppercase tracking-wide text-olive-dark/70">
                  <th className="py-2 pr-2">UK</th>
                  <th className="py-2 pr-2">US</th>
                  {hasBustColumn && <th className="py-2 pr-2">Bust (in)</th>}
                  <th className="py-2 pr-2">Waist (in)</th>
                  <th className="py-2">Hip (in)</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.ukSize} className="border-b border-olive/10">
                    <td className="py-2 pr-2">{row.ukSize}</td>
                    <td className="py-2 pr-2">{row.usSize}</td>
                    {hasBustColumn && <td className="py-2 pr-2">{row.bustInches}</td>}
                    <td className="py-2 pr-2">{row.waistInches}</td>
                    <td className="py-2">{row.hipInches}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
