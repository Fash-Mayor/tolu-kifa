"use server";

import { prisma } from "@/lib/prisma";
import { refresh } from "next/cache";
import type { SizeChartCategory } from "@prisma/client";

// One form covers every row of a chart at once (all 9 rows), with inputs
// named "waist-<rowId>", "hip-<rowId>", and (for the TOPS chart) "bust-<rowId>".
export async function updateSizeChart(category: SizeChartCategory, formData: FormData) {
  const rows = await prisma.sizeChartRow.findMany({ where: { category } });

  await prisma.$transaction(
    rows.map((row) =>
      prisma.sizeChartRow.update({
        where: { id: row.id },
        data: {
          waistInches: Number(formData.get(`waist-${row.id}`)) || row.waistInches,
          hipInches: Number(formData.get(`hip-${row.id}`)) || row.hipInches,
          bustInches:
            category === "TOPS"
              ? Number(formData.get(`bust-${row.id}`)) || row.bustInches
              : null,
        },
      })
    )
  );

  refresh();
}
