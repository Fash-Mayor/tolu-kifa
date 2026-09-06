"use server";

import { prisma } from "@/lib/prisma";
import { refresh } from "next/cache";
import type { OrderStatus } from "@prisma/client";

// `force-dynamic` (see src/app/(site)/page.tsx for the full explanation)
// means this page is never cached — but a Server Action only gets a fresh
// re-render of the current route bundled into its response when it calls
// refresh() (or revalidatePath/updateTag/redirect). Without it, the page
// you're looking at stays on the pre-save data until the next real
// navigation, even though the database write already succeeded.
export async function updateOrder(orderId: string, formData: FormData) {
  const status = formData.get("status") as OrderStatus;
  const notes = String(formData.get("notes") ?? "");

  await prisma.orderRequest.update({
    where: { id: orderId },
    data: { status, notes },
  });

  refresh();
}
