"use server";

import { prisma } from "@/lib/prisma";
import { refresh } from "next/cache";
import type { ConsultationStatus } from "@prisma/client";

export async function updateConsultationStatus(
  consultationId: string,
  formData: FormData
) {
  const status = formData.get("status") as ConsultationStatus;

  await prisma.consultationRequest.update({
    where: { id: consultationId },
    data: { status },
  });

  // Without this, the page stays on the pre-save status until the next
  // real navigation — see the comment in orders/[id]/actions.ts.
  refresh();
}
