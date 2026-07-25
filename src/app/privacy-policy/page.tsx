'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Header: Exact same padding & width as navbar */}
      <div className="sticky top-0 z-40 bg-[var(--color-background)]/80 backdrop-blur-md border-b border-gray-100 h-20">
        <div className="w-full max-w-[1440px] mx-auto px-4 h-full flex items-center justify-between">
          <Link href="/" className="flex-shrink-0">
            <Image 
              src="/logo.png" 
              alt="ServiaAI" 
              width={50} 
              height={40} 
              priority 
            />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-[var(--color-foreground)]/60 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition-all duration-200 group"
          >
            <svg
              className="w-4 h-4 transition-transform group-hover:-translate-x-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>

      {/* Main Content: Matches navbar horizontal padding exactly */}
      <main className="w-full max-w-[1440px] mx-auto px-4 py-10 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="max-w-3xl mx-auto"
        >
          <h1 className="text-3xl md:text-4xl font-medium text-[var(--color-secondary)] tracking-tight">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-[var(--color-foreground)]/50">
            Last updated: March 20, 2026
          </p>

          <div className="mt-10 space-y-10 text-[var(--color-foreground)]/80 leading-relaxed">
            <Section title="1. Introduction">
              <p>Welcome to ServiaAI. We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered hospitality recruitment platform. By using ServiaAI, you agree to the collection and use of information in accordance with this policy.</p>
            </Section>

            <Section title="2. Information We Collect">
              <SubSection title="2.1 Candidate Information" />
              <ul className="list-disc pl-5 space-y-2 mb-4">
                <li>Account Information: Email address, password (hashed), first name, last name, phone number, nationality</li>
                <li>Profile Information: Profile photo (optional), work experience, education, skills</li>
                <li>CV/Resume: Documents you upload (PDF or DOCX format, max 10MB)</li>
                <li>Video Introduction: 2-minute video recordings (MP4 format, max 50MB)</li>
                <li>Application Data: Jobs you apply for, application status, interview history</li>
                <li>Interview Data: Interview transcripts, AI-generated assessments, recruiter notes</li>
              </ul>

              <SubSection title="2.2 Recruiter Information" />
              <ul className="list-disc pl-5 space-y-2 mb-4">
                <li>Account Information: Email address, password (hashed), full name</li>
                <li>Professional Information: Department, role (recruiter or admin)</li>
                <li>Usage Data: Dashboard interactions, candidate reviews, interview scheduling</li>
              </ul>

              <SubSection title="2.3 Automatically Collected Information" />
              <ul className="list-disc pl-5 space-y-2">
                <li>Device Information: IP address, browser type, operating system, device identifiers</li>
                <li>Usage Information: Pages viewed, time spent, features used, click patterns</li>
                <li>Cookies: We use cookies and similar tracking technologies to enhance your experience</li>
              </ul>
            </Section>

            <Section title="3. How We Use Your Information">
              <p>We use the information we collect for the following purposes:</p>
              <ul className="list-disc pl-5 space-y-2 mt-3">
                <li>Service Delivery: To provide, maintain, and improve our recruitment platform</li>
                <li>Candidate Matching: To analyze CVs using AI and match candidates with suitable hospitality positions</li>
                <li>Interview Facilitation: To schedule interviews, generate Google Meet links, and provide live transcription</li>
                <li>AI Analysis: To generate automated assessments, scores, and recommendations using Google Gemini AI</li>
                <li>Communication: To send application updates, interview invitations, and platform notifications via email</li>
                <li>Security: To detect, prevent, and address fraud, abuse, and security incidents</li>
                <li>Compliance: To meet legal obligations and enforce our Terms of Service</li>
              </ul>
            </Section>

            <Section title="4. Third-Party Services & Data Sharing">
              <p>We share your information with the following third-party service providers to deliver our services:</p>
              <div className="mt-4 space-y-4">
                <ThirdPartyCard title="Google Cloud Services" items={['Gemini API: AI analysis of CVs and interview transcripts', 'Speech-to-Text: Live interview transcription', 'Calendar API: Interview scheduling and Google Meet link generation', 'Google Meet: Video interview hosting']} />
                <ThirdPartyCard title="Cloudflare" items={['R2 Storage: Secure CV file storage with zero egress fees', 'Stream: Video introduction storage and adaptive streaming']} />
                <ThirdPartyCard title="Other Service Providers" items={['Resend: Automated email delivery', 'Sentry: Error monitoring and performance tracking (PII redacted)', 'Railway/Vercel: Platform hosting and content delivery']} />
              </div>
              <p className="mt-4">All third-party providers are contractually obligated to protect your data and are prohibited from using it for any purpose other than providing services to ServiaAI.</p>
            </Section>

            <Section title="5. Data Retention">
              <p>We retain your personal information only for as long as necessary:</p>
              <ul className="list-disc pl-5 space-y-2 mt-3">
                <li>Candidate Data: 12 months after your last activity (application, interview, etc.)</li>
                <li>Interview Transcripts: 6 months post-interview, then anonymized for AI training (with consent)</li>
                <li>Temporary AI Responses: 7 days for debugging purposes, then automatically deleted</li>
                <li>Recruiter Data: Indefinitely while account is active; anonymized 24 months after deactivation</li>
              </ul>
              <p className="mt-3">You may request deletion of your data at any time by contacting us. We will respond within 30 days.</p>
            </Section>

            <Section title="6. Data Security">
              <p>We implement industry-standard security measures to protect your information:</p>
              <ul className="list-disc pl-5 space-y-2 mt-3">
                <li>Encryption in Transit: All data transmitted via TLS 1.3 (HTTPS)</li>
                <li>Encryption at Rest: PostgreSQL database encrypted with AES-256</li>
                <li>Password Security: Passwords hashed with bcrypt (cost factor ≥12)</li>
                <li>Access Controls: Role-based access control (RBAC) and JWT tokens with 24-hour expiry</li>
                <li>File Security: CVs and videos stored in private buckets; accessed only via short-lived signed URLs (1-hour expiry)</li>
                <li>PII Protection: Personal information never logged to monitoring tools; anonymized IDs used for debugging</li>
                <li>Rate Limiting: 100 requests per minute per user to prevent abuse</li>
              </ul>
            </Section>

            <Section title="7. AI Processing & Automated Decisions">
              <p>Our platform uses AI to analyze candidate profiles:</p>
              <ul className="list-disc pl-5 space-y-2 mt-3">
                <li>CV Screening: Google Gemini Flash analyzes CVs against hospitality-specific criteria</li>
                <li>Scoring: Candidates receive a fit score (0-100) with strengths, weaknesses, and personalized feedback</li>
                <li>Interview Analysis: AI generates post-interview reports with hiring recommendations</li>
                <li>Human Oversight: All AI decisions are reviewed by recruiters; scores between 40-69 are flagged for manual review</li>
                <li>PII Anonymization: Candidate names, emails, and phone numbers are removed before AI processing to reduce bias</li>
              </ul>
              <p className="mt-3">You have the right to request human review of any automated decision that significantly affects you.</p>
            </Section>

            <Section title="8. Your Rights & Choices">
              <p>Depending on your location, you may have the following rights:</p>
              <ul className="list-disc pl-5 space-y-2 mt-3">
                <li>Access: Request a copy of your personal data</li>
                <li>Correction: Update or correct inaccurate information</li>
                <li>Deletion: Request deletion of your personal data</li>
                <li>Portability: Receive your data in a structured, machine-readable format</li>
                <li>Opt-Out: Unsubscribe from non-essential communications</li>
                <li>Consent Withdrawal: Withdraw consent for data processing (may limit service availability)</li>
              </ul>
              <p className="mt-3">To exercise these rights, contact us at <Link href="mailto:privacy@servia-client.com" className="text-[var(--color-primary)] hover:underline">privacy@servia-client.com</Link></p>
            </Section>

            <Section title="9. International Data Transfers">
              <p>Your data may be transferred to and processed in countries outside Ethiopia:</p>
              <ul className="list-disc pl-5 space-y-2 mt-3">
                <li>Service Providers: Google (US/EU), Cloudflare (US), Resend (US), Railway/Vercel (US/EU)</li>
                <li>Safeguards: All transfers comply with applicable data protection laws; service providers have GDPR-compliant Data Processing Agreements</li>
                <li>No Unauthorized Transfers: We do not transfer data to countries without adequate protections</li>
              </ul>
            </Section>

            <Section title="10. Cookies & Tracking">
              <p>We use cookies and similar technologies:</p>
              <ul className="list-disc pl-5 space-y-2 mt-3">
                <li>Essential Cookies: Required for authentication and security</li>
                <li>Functional Cookies: Remember your preferences and settings</li>
                <li>Analytics Cookies: Help us understand how you use the platform (via Sentry with PII redaction)</li>
              </ul>
              <p className="mt-3">You can control cookies through your browser settings. Note that disabling essential cookies may prevent the platform from functioning properly.</p>
            </Section>

            <Section title="11. Children's Privacy">
              <p>ServiaAI is not intended for individuals under 18 years of age. We do not knowingly collect personal information from children. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.</p>
            </Section>

            <Section title="12. Data Breach Notification">
              <p>In the event of a data breach affecting your personal information, we will:</p>
              <ul className="list-disc pl-5 space-y-2 mt-3">
                <li>Notify the relevant data protection authority within 48 hours</li>
                <li>Notify affected individuals without undue delay if the breach poses a high risk to their rights</li>
                <li>Take immediate steps to contain the breach and mitigate harm</li>
              </ul>
            </Section>

            <Section title="13. Changes to This Privacy Policy">
              <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the &quot;Last updated&quot; date. Material changes will be communicated via email or prominent notice on the platform.</p>
            </Section>

            <Section title="14. Contact Information">
              <p>For questions about this Privacy Policy or our data practices, contact:</p>
              <div className="mt-4 p-5 rounded-xl bg-gray-50 border border-gray-100">
                <p className="mb-1">Data Protection Officer</p>
                <p className="mb-1">ServiaAI / [Client Agency Name]</p>
                <p className="mb-1">Addis Ababa, Ethiopia</p>
                <p>
                  Email: <Link href="mailto:privacy@servia-client.com" className="text-[var(--color-primary)] hover:underline">privacy@servia-client.com</Link>
                </p>
                <p>Phone: +251-XXX-XXX-XXX</p>
              </div>
            </Section>

            <Section title="15. Data Processing Agreement Summary">
              <ul className="list-disc pl-5 space-y-2">
                <li>Data Controller: [Client Agency Name] - determines purposes and means of processing</li>
                <li>Data Processor: Sorora Tech - processes data on behalf of the controller</li>
                <li>Processing Purpose: Recruitment automation, AI screening, interview support for hospitality positions</li>
                <li>Sub-processors: Google (Gemini, Cloud STT, Calendar), Cloudflare (R2, Stream), Resend (email), Railway/Vercel (hosting), Sentry (monitoring). All have GDPR-compliant DPAs.</li>
              </ul>
            </Section>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

// Reusable UI blocks
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="scroll-mt-24">
      <h2 className="text-xl md:text-2xl font-medium text-[var(--color-primary)] mb-4 tracking-tight">{title}</h2>
      {children}
    </section>
  );
}

function SubSection({ title }: { title: string }) {
  return <h3 className="text-lg font-medium text-[var(--color-foreground)] mt-6 mb-2">{title}</h3>;
}

function ThirdPartyCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
      <h4 className="font-medium text-[var(--color-secondary)] mb-2">{title}</h4>
      <ul className="list-disc pl-5 space-y-1 text-sm text-[var(--color-foreground)]/70">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
