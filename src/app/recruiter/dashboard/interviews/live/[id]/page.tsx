import LiveInterviewClient from "@/components/interview/LiveInterviewClient";
import { resolveInterviewId } from "@/lib/interviewRoutes";

type RecruiterLiveInterviewPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    interviewId?: string;
    candidateName?: string;
    candidateEmail?: string;
    candidateRole?: string;
  }>;
};

export default async function Page({
  params,
  searchParams,
}: RecruiterLiveInterviewPageProps) {
  const { id } = await params;
  const {
    interviewId,
    candidateName = "",
    candidateEmail = "",
    candidateRole = "",
  } = await searchParams;
  const resolvedInterviewId = resolveInterviewId(id, interviewId);

  if (!resolvedInterviewId) {
    return (
      <LiveInterviewClient
        interviewId={id}
        initialCandidateName={candidateName}
        initialCandidateEmail={candidateEmail}
        initialCandidateRole={candidateRole}
      />
    );
  }

  return (
    <LiveInterviewClient
      interviewId={resolvedInterviewId}
      initialCandidateName={candidateName}
      initialCandidateEmail={candidateEmail}
      initialCandidateRole={candidateRole}
    />
  );
}
