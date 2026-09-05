"use server";

import { prisma } from "@/lib/prisma";
import type { OrderStatus } from "@prisma/client";

// Note: every admin page is marked `export const dynamic = "force-dynamic"`
// (see the comment on that in src/app/(site)/page.tsx), so there's no page
// cache to invalidate here — submitting this form and Next.js refreshing
// the current route is enough for the updated status to show up immediately.
export async function updateOrder(orderId: string, formData: FormData) {
  const status = formData.get("status") as OrderStatus;
  const notes = String(formData.get("notes") ?? "");

  await prisma.orderRequest.update({
    where: { id: orderId },
    data: { status, notes },
  });
}
