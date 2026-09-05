import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Consultation Requests" };

export default async function AdminConsultationsPage() {
  const requests = await prisma.consultationRequest.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="font-display text-2xl text-olive-dark">Consultation requests</h1>

      <div className="mt-6 overflow-x-auto border border-olive/15 bg-cream">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-olive/15 font-heading uppercase tracking-wide text-olive-dark/60">
              <th className="p-3">Name</th>
              <th className="p-3">Project type</th>
              <th className="p-3">Status</th>
              <th className="p-3">Received</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request.id} className="border-b border-olive/10 last:border-0">
                <td className="p-3">
                  <Link href={`/admin/consultations/${request.id}`} className="text-olive-dark hover:underline">
                    {request.name}
                  </Link>
                </td>
                <td className="p-3">{request.projectType}</td>
                <td className="p-3">
                  <span className="text-xs uppercase tracking-wide text-olive-dark/70">
                    {request.status}
                  </span>
                </td>
                <td className="p-3 text-olive-dark/60">
                  {request.createdAt.toLocaleDateString()}
                </td>
              </tr>
            ))}
            {requests.length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-olive-dark/50">
                  No consultation requests yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
