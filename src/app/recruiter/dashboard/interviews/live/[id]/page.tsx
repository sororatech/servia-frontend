import LiveInterviewClient from "@/components/interview/LiveInterviewClient";

type LiveInterviewPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    candidateName?: string;
    candidateEmail?: string;
    candidateRole?: string;
  }>;
};

export default async function LiveInterviewPage({
  params,
  searchParams,
}: LiveInterviewPageProps) {
  const { id } = await params;
  const {
    candidateName = "",
    candidateEmail = "",
    candidateRole = "",
  } = await searchParams;

  return (
    <LiveInterviewClient
      interviewId={id}
      initialCandidateName={candidateName}
      initialCandidateEmail={candidateEmail}
      initialCandidateRole={candidateRole}
    />
  );
}
