"use server";

import { prisma } from "@/lib/prisma";
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
}
