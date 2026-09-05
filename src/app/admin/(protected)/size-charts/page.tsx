import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { updateSizeChart } from "./actions";
import type { SizeChartRow } from "@prisma/client";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Size Charts" };

const numberInputClasses =
  "w-16 border border-olive/25 bg-cream px-2 py-1.5 text-sm text-olive-dark focus:border-olive-dark focus:outline-none";

function SizeChartTable({ rows, hasBustColumn }: { rows: SizeChartRow[]; hasBustColumn: boolean }) {
  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b border-olive/15 font-heading uppercase tracking-wide text-olive-dark/60">
          <th className="py-2 pr-3">UK</th>
          <th className="py-2 pr-3">US</th>
          {hasBustColumn && <th className="py-2 pr-3">Bust (in)</th>}
          <th className="py-2 pr-3">Waist (in)</th>
          <th className="py-2">Hip (in)</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id} className="border-b border-olive/10">
            <td className="py-2 pr-3">{row.ukSize}</td>
            <td className="py-2 pr-3">{row.usSize}</td>
            {hasBustColumn && (
              <td className="py-2 pr-3">
                <input
                  type="number"
                  name={`bust-${row.id}`}
                  defaultValue={row.bustInches ?? undefined}
                  className={numberInputClasses}
                />
              </td>
            )}
            <td className="py-2 pr-3">
              <input
                type="number"
                name={`waist-${row.id}`}
                defaultValue={row.waistInches}
                className={numberInputClasses}
              />
            </td>
            <td className="py-2">
              <input
                type="number"
                name={`hip-${row.id}`}
                defaultValue={row.hipInches}
                className={numberInputClasses}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default async function AdminSizeChartsPage() {
  const [topsRows, pantsRows] = await Promise.all([
    prisma.sizeChartRow.findMany({ where: { category: "TOPS" }, orderBy: { sortOrder: "asc" } }),
    prisma.sizeChartRow.findMany({ where: { category: "PANTS" }, orderBy: { sortOrder: "asc" } }),
  ]);

  const updateTopsChart = updateSizeChart.bind(null, "TOPS");
  const updatePantsChart = updateSizeChart.bind(null, "PANTS");

  return (
    <div className="max-w-3xl space-y-12">
      <div>
        <h1 className="font-display text-2xl text-olive-dark">Size charts</h1>
        <p className="mt-1 text-sm text-olive-dark/60">
          These numbers power the &quot;Size guide&quot; popup shoppers see on every product page.
          Originally digitized from the founder&apos;s size-chart images — edit them here any time
          measurements change.
        </p>
      </div>

      <section>
        <h2 className="mb-3 font-heading text-sm uppercase tracking-[0.15em] text-olive-dark">
          Tops / Dresses / Suits
        </h2>
        <form action={updateTopsChart} className="space-y-4">
          <SizeChartTable rows={topsRows} hasBustColumn />
          <button
            type="submit"
            className="bg-olive-dark px-6 py-2.5 font-heading text-sm uppercase tracking-[0.15em] text-cream hover:bg-olive"
          >
            Save changes
          </button>
        </form>
      </section>

      <section>
        <h2 className="mb-3 font-heading text-sm uppercase tracking-[0.15em] text-olive-dark">
          Pants / Skirts
        </h2>
        <form action={updatePantsChart} className="space-y-4">
          <SizeChartTable rows={pantsRows} hasBustColumn={false} />
          <button
            type="submit"
            className="bg-olive-dark px-6 py-2.5 font-heading text-sm uppercase tracking-[0.15em] text-cream hover:bg-olive"
          >
            Save changes
          </button>
        </form>
      </section>
    </div>
  );
}
