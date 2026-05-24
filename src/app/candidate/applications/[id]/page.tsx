'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { ApplicationProgress } from '@/components/ui/ApplicationProgress';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { ArrowLeft, FileText, Video, MapPin, Calendar, Eye, Pencil, AlertTriangle, X } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { useApplicationDetail } from '@/hooks/useApplicationDetail';
import { formatStatusDisplay, getStatusBadgeClass, canWithdraw } from '@/lib/applications';


export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const {
    application,
    jobDetails,
    loading,
    error,
    withdraw,
    withdrawing,
    showWithdrawModal,
    setShowWithdrawModal,
    showCVPreview,
    setShowCVPreview,
  } = useApplicationDetail(id);

  const [iframeError, setIframeError] = useState(false);

  const jobTitle = jobDetails?.title || (typeof application?.job === 'object' ? application.job?.title : 'Position Applied For');
  const jobLocation = jobDetails?.location || (typeof application?.job === 'object' ? application.job?.location : 'Remote');
  const jobDepartment = jobDetails?.department_display || 
    (typeof application?.job === 'object' ? application.job?.department_display : '') ||
    jobDetails?.department || (typeof application?.job === 'object' ? application.job?.department : '');
  const jobId = jobDetails?.id || (typeof application?.job === 'string' ? application.job : application?.job?.id);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <main className="flex-1 max-w-5xl mx-auto px-6 py-10 w-full">
          <LoadingSkeleton variant="card" />
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
            <Button onClick={() => router.push('/candidate/applications')} variant="secondary">Back to Applications</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const appliedDate = new Date(application.applied_at);
  const isWithdrawn = application.status?.toLowerCase() === 'withdrawn';
  const showWithdrawButton = !isWithdrawn && canWithdraw(application.status);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto px-6 py-10 w-full">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-[var(--color-primary)] transition-colors mb-8 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to My Applications</span>
        </button>

        {/* Header Card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-lg shadow-gray-200/50 overflow-hidden mb-8">
          <div className="p-8 border-b border-gray-100 bg-gray-50/50">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wide rounded-full ${getStatusBadgeClass(application.status)}`}>
                    {formatStatusDisplay(application.status)}
                  </span>
                  <span className="text-gray-400 text-sm flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Applied {format(appliedDate, 'MMMM dd, yyyy')}
                  </span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{jobTitle}</h2>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" /><span className="font-medium">{jobLocation}</span>
                  <span className="mx-2">•</span><span>{jobDepartment}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="p-8">
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-6">Application Progress</h4>
            <ApplicationProgress status={application.status} />
          </div>
        </div>

        {/* CV and Video Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* CV Card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 rounded-xl text-blue-600"><FileText className="w-6 h-6" /></div>
                <h3 className="font-bold text-gray-900">Curriculum Vitae</h3>
              </div>
              {application.cv_uploaded_at && (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIframeError(false);
                      setShowCVPreview(true);
                    }}
                    className="p-2 text-gray-400 hover:text-[var(--color-primary)] transition-colors"
                    title="Preview CV"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button onClick={() => router.push(`/candidate/dashboard/cv?application=${id}`)} className="p-2 text-gray-400 hover:text-[var(--color-primary)] transition-colors" title="Edit/Replace CV">
                    <Pencil className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
            {application.cv_uploaded_at ? (
              <>
                <p className="text-sm text-gray-500 mb-3">Uploaded {formatDistanceToNow(new Date(application.cv_uploaded_at), { addSuffix: true })}</p>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700 truncate max-w-[180px]">{application.cv_filename || 'resume.pdf'}</span>
                  </div>
                </div>
                <div className={`inline-flex px-3 py-1 rounded-lg text-xs font-semibold ${
                  application.cv_status === 'analyzed' ? 'bg-green-100 text-green-700' :
                  application.cv_status === 'processing' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  Status: {formatStatusDisplay(application.cv_status || 'pending')}
                </div>
              </>
            ) : (
              <div className="text-center py-6">
                <p className="text-sm text-gray-500 mb-4">You haven&apos;t uploaded a CV yet.</p>
                <Button size="sm" variant="secondary" onClick={() => router.push(`/candidate/dashboard/cv?application=${id}`)}>Upload CV</Button>
              </div>
            )}
          </div>

          {/* Video Card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-50 rounded-xl text-purple-600"><Video className="w-6 h-6" /></div>
                <h3 className="font-bold text-gray-900">Video Introduction</h3>
              </div>
              {application.video_uploaded_at && (
                <div className="flex gap-2">
                  <button className="p-2 text-gray-400 hover:text-[var(--color-primary)] transition-colors" title="Preview Video"><Eye className="w-5 h-5" /></button>
                  <button onClick={() => router.push(`/candidate/dashboard/video?application=${id}`)} className="p-2 text-gray-400 hover:text-[var(--color-primary)] transition-colors" title="Edit/Replace Video"><Pencil className="w-5 h-5" /></button>
                </div>
              )}
            </div>
            {application.video_uploaded_at ? (
              <>
                <p className="text-sm text-gray-500 mb-4">Submitted {formatDistanceToNow(new Date(application.video_uploaded_at), { addSuffix: true })}</p>
                <div className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center mb-3 border border-gray-200">
                  <div className="text-center">
                    <Video className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Video Preview</p>
                    <p className="text-xs text-gray-400 mt-1">{application.video_duration || '00:00'}</p>
                  </div>
                </div>
                <span className="inline-flex px-3 py-1 rounded-lg text-xs font-semibold bg-green-100 text-green-700">Submitted</span>
              </>
            ) : (
              <div className="text-center py-6">
                <p className="text-sm text-gray-500 mb-4">You haven&apos;t recorded an intro yet.</p>
                <Button size="sm" variant="secondary" onClick={() => router.push(`/candidate/dashboard/video?application=${id}`)}>Record Video</Button>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 border-t border-gray-100 pt-8">
          <Button variant="ghost" onClick={() => jobId ? router.push(`/jobs/${jobId}`) : router.push('/jobs')}>
            View Job Description
          </Button>
          {showWithdrawButton && (
            <Button
              variant="secondary"
              className="text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => setShowWithdrawModal(true)}
              disabled={withdrawing}
            >
              Withdraw Application
            </Button>
          )}
        </div>
      </main>

      {/* CV Preview Modal */}
      {showCVPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-bold text-gray-900">CV Preview</h3>
              <button onClick={() => setShowCVPreview(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            {!iframeError && application.cv_preview_url ? (
              <iframe
                src={application.cv_preview_url}
                className="w-full h-full"
                title="CV Preview"
                onError={() => setIframeError(true)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <FileText className="w-16 h-16 text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">Cannot preview the CV. You can download it instead.</p>
                <Button
                  variant="primary"
                  onClick={() => window.open(application.cv_download_url, '_blank')}
                >
                  Download CV
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-red-50 rounded-full text-red-600"><AlertTriangle className="w-6 h-6" /></div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Withdraw Application?</h3>
                <p className="text-sm text-gray-500">This action cannot be undone. The recruiter will be notified.</p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="ghost" onClick={() => setShowWithdrawModal(false)} className="flex-1" disabled={withdrawing}>
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1 bg-red-600 hover:bg-red-700"
                onClick={withdraw}
                isLoading={withdrawing}
                disabled={withdrawing}
              >
                {withdrawing ? 'Withdrawing...' : 'Yes, Withdraw'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}