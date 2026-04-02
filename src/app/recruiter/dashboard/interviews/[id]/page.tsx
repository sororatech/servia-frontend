type RecruiterInterviewDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function RecruiterInterviewDetailsPage({
  params,
}: RecruiterInterviewDetailsPageProps) {
  const { id } = await params;

  return (
    <main className="min-h-screen bg-[#f8f5f2] px-4 py-10 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-[#eaded8] bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8a817b]">
          Interview Details
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-[#171717]">
          {id}
        </h1>
        <p className="mt-4 text-[#5e5752]">
          This detail page is ready for interview metadata. For the live recruiter experience, use
          the live route:
          {" "}
          <span className="font-semibold text-[#0c6c75]">
            /recruiter/dashboard/interviews/live/{id}
          </span>
        </p>
      </div>
    </main>
  );
}
