import { notFound } from "next/navigation";
import LiveInterviewClient from "@/components/interview/LiveInterviewClient";
import { resolveInterviewId } from "@/lib/interviewRoutes";

type CandidateLiveInterviewPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ interviewId?: string }>;
};

export default async function Page({
  params,
  searchParams,
}: CandidateLiveInterviewPageProps) {
  const { id } = await params;
  const { interviewId } = await searchParams;
  const resolvedInterviewId = resolveInterviewId(id, interviewId);

  if (!resolvedInterviewId) {
    notFound();
  }

  return <LiveInterviewClient interviewId={resolvedInterviewId} />;
}
