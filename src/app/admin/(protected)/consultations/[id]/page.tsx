import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SmartImage } from "@/components/site/SmartImage";
import { updateConsultationStatus } from "./actions";

export const dynamic = "force-dynamic";

const ALL_STATUSES = ["NEW", "CONTACTED", "CLOSED"] as const;

export default async function AdminConsultationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const request = await prisma.consultationRequest.findUnique({ where: { id } });
  if (!request) notFound();

  const updateStatusWithId = updateConsultationStatus.bind(null, request.id);

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl text-olive-dark">{request.name}</h1>
      <p className="text-sm text-olive-dark/60">
        Received {request.createdAt.toLocaleString()}
      </p>

      <div className="mt-6 border border-olive/15 bg-cream p-5">
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between"><dt className="text-olive-dark/60">Email</dt><dd>{request.email}</dd></div>
          <div className="flex justify-between"><dt className="text-olive-dark/60">Phone</dt><dd>{request.phone}</dd></div>
          <div className="flex justify-between"><dt className="text-olive-dark/60">Project type</dt><dd>{request.projectType}</dd></div>
          {request.budgetRange && (
            <div className="flex justify-between"><dt className="text-olive-dark/60">Budget</dt><dd>{request.budgetRange}</dd></div>
          )}
          {request.timeline && (
            <div className="flex justify-between"><dt className="text-olive-dark/60">Timeline</dt><dd>{request.timeline}</dd></div>
          )}
        </dl>

        <p className="mt-4 text-sm text-olive-dark/60">Description</p>
        <p className="mt-1 whitespace-pre-wrap text-sm">{request.description}</p>

        {request.referenceImageUrl && (
          <div className="mt-4">
            <p className="mb-2 text-sm text-olive-dark/60">Reference photo</p>
            <div className="relative h-64 w-48 overflow-hidden bg-cream-dark">
              <SmartImage
                src={request.referenceImageUrl}
                alt="Reference photo"
                fill
                sizes="192px"
                className="object-cover"
              />
            </div>
          </div>
        )}
      </div>

      <form
        action={updateStatusWithId}
        className="mt-6 flex items-end gap-4 border border-olive/15 bg-cream p-5"
      >
        <div>
          <label htmlFor="status" className="mb-1.5 block text-sm text-olive-dark/70">Status</label>
          <select
            id="status"
            name="status"
            defaultValue={request.status}
            className="border border-olive/25 bg-cream px-4 py-2.5 text-sm text-olive-dark focus:border-olive-dark focus:outline-none"
          >
            {ALL_STATUSES.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="bg-olive-dark px-6 py-2.5 font-heading text-sm uppercase tracking-[0.15em] text-cream hover:bg-olive"
        >
          Save
        </button>
      </form>
    </div>
  );
}
