'use client';

import { useParams, notFound, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { ApplicationProgress } from '@/components/ui/ApplicationProgress';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { ArrowLeft, FileText, Video, Star, MapPin, Calendar } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        setLoading(true);
        // Fetch specific application
        const response = await api.get(`/candidates/candidates/${id}/`);
        setApplication(response.data);
      } catch (err: any) {
        console.error("Failed to fetch application:", err);
        setError('Unable to load application details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchApplication();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <main className="flex-1 max-w-5xl mx-auto px-6 py-10 w-full">
          <LoadingSkeleton variant="card" count={1} />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-500 text-2xl font-bold">!</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => router.push('/candidate/applications')} variant="secondary">
              Back to Applications
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const appliedDate = new Date(application.applied_at);
  const timeAgo = formatDistanceToNow(appliedDate, { addSuffix: true });
  const fullDate = format(appliedDate, 'MMMM dd, yyyy');
  const job = application.job || {};

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      <main className="flex-1 max-w-5xl mx-auto px-6 py-10 w-full">
        {/* Navigation Header */}
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-[var(--color-primary)] transition-colors mb-8 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to My Applications</span>
        </button>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-lg shadow-gray-200/50 overflow-hidden mb-8">
          
          <div className="p-8 border-b border-gray-100 bg-gray-50/50">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-3 py-1 bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs font-bold uppercase tracking-wide rounded-full">
                    {application.status.replace('_', ' ')}
                  </span>
                  <span className="text-gray-400 text-sm flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Applied {fullDate}
                  </span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{job.title || 'Position Title'}</h2>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span className="font-medium">{job.location || 'Remote'}</span>
                  <span className="mx-2">•</span>
                  <span>{job.department || 'Department'}</span>
                </div>
              </div>

              {application.ai_score != null && (
                <div className="flex-shrink-0 flex flex-col items-center justify-center bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                  <Star className="w-6 h-6 text-yellow-500 mb-1 fill-yellow-500" />
                  <span className="text-2xl font-bold text-gray-900">{application.ai_score}%</span>
                  <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">AI Match</span>
                </div>
              )}
            </div>
          </div>

          <div className="p-8">
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-6">Application Progress</h4>
            <ApplicationProgress status={application.status} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                <FileText className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-1">Curriculum Vitae</h3>
                <p className="text-sm text-gray-500 mb-3">
                  {application.cv_uploaded_at 
                    ? `Uploaded ${timeAgo}` 
                    : 'You haven\'t uploaded a CV yet.'}
                </p>
                <div className={`inline-flex px-3 py-1 rounded-lg text-xs font-semibold ${
                  application.cv_status === 'analyzed' ? 'bg-green-100 text-green-700' :
                  application.cv_status === 'processing' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  Status: {application.cv_status || 'Pending'}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
                <Video className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-1">Video Introduction</h3>
                <p className="text-sm text-gray-500 mb-3">
                  {application.video_uploaded_at 
                    ? `Submitted ${timeAgo}` 
                    : 'You haven\'t recorded an intro yet.'}
                </p>
                {application.video_uploaded_at ? (
                  <span className="inline-flex px-3 py-1 rounded-lg text-xs font-semibold bg-green-100 text-green-700">
                    Submitted
                  </span>
                ) : (
                  <Button size="sm" variant="secondary">
                    Record Now
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 border-t border-gray-100 pt-8">
          <Button variant="ghost" onClick={() => router.push(`/jobs/${job.id}`)}>
            View Job Description
          </Button>
          <Button variant="secondary" className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300">
            Withdraw Application
          </Button>
        </div>

      </main>
      
      <Footer />
    </div>
  );
}