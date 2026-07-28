'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function TermsOfService() {
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
            Terms of Service
          </h1>
          <p className="mt-3 text-sm text-[var(--color-foreground)]/50">
            Last updated: March 20, 2026
          </p>

          <div className="mt-10 space-y-10 text-[var(--color-foreground)]/80 leading-relaxed">
            <Section title="1. Agreement to Terms">
              <p>By accessing or using ServiaAI (&quot;the Platform&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;) and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site. These Terms apply to all users of the Platform, including candidates seeking employment in the hospitality sector and recruitment agency staff managing hiring processes.</p>
            </Section>

            <Section title="2. Description of Service">
              <p>ServiaAI is an AI-powered hospitality recruitment platform that provides:</p>
              <ul className="list-disc pl-5 space-y-2 mt-3">
                <li>For Candidates: Job browsing, application submission, CV upload, AI-powered screening and feedback, video introduction recording, interview scheduling, and AI-assisted interview participation</li>
                <li>For Recruiters: Candidate management dashboard, AI-powered CV analysis, interview scheduling with Google Meet integration, live interview transcription, AI-generated interview reports, and basic analytics</li>
              </ul>
              <p className="mt-3">We reserve the right to modify, suspend, or discontinue any aspect of the Service at any time without prior notice.</p>
            </Section>

            <Section title="3. Eligibility">
              <p>To use ServiaAI, you must:</p>
              <ul className="list-disc pl-5 space-y-2 mt-3">
                <li>Be at least 18 years of age</li>
                <li>Have the legal capacity to enter into binding agreements</li>
                <li>Not be prohibited from using the Service under applicable laws</li>
                <li>Provide accurate and complete registration information</li>
                <li>Maintain the security of your account credentials</li>
              </ul>
            </Section>

            <Section title="4. Account Registration & Security">
              <SubSection title="4.1 Account Creation" />
              <p>To access certain features, you must create an account by providing:</p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>Valid email address</li>
                <li>Secure password (minimum 8 characters, 1 letter, 1 number)</li>
                <li>Accurate personal information (name, phone, nationality)</li>
                <li>Explicit consent to data processing (mandatory checkbox)</li>
              </ul>

              <SubSection title="4.2 Account Security" />
              <p>You are responsible for:</p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>Maintaining the confidentiality of your login credentials</li>
                <li>All activities that occur under your account</li>
                <li>Immediately notifying us of any unauthorized access</li>
                <li>Logging out at the end of each session</li>
              </ul>

              <SubSection title="4.3 Account Termination" />
              <p>We reserve the right to suspend or terminate your account if:</p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>You violate these Terms</li>
                <li>Your account is inactive for 12 months</li>
                <li>We suspect fraud or unauthorized use</li>
                <li>Required by law or legal process</li>
              </ul>
            </Section>

            <Section title="5. Acceptable Use & Prohibited Activities">
              <p>You agree NOT to:</p>
              <ul className="list-disc pl-5 space-y-2 mt-3">
                <li>Use the Service for any illegal purpose or in violation of any local, national, or international law</li>
                <li>Upload false, misleading, or fraudulent CV information</li>
                <li>Upload malicious code, viruses, or harmful content</li>
                <li>Attempt to gain unauthorized access to other users&apos; accounts or data</li>
                <li>Use automated systems (bots, scrapers) to access the Service without permission</li>
                <li>Interfere with or disrupt the Service or servers</li>
                <li>Impersonate any person or entity or misrepresent your affiliation</li>
                <li>Harass, abuse, or harm another person through the Service</li>
                <li>Use the Service to spam or send unsolicited communications</li>
                <li>Circumvent any security measures or authentication</li>
                <li>Reverse engineer, decompile, or disassemble the Service</li>
                <li>Resell, sublicense, or commercially exploit the Service</li>
              </ul>
            </Section>

            <Section title="6. Candidate Obligations">
              <p>As a job seeker, you agree to:</p>
              <ul className="list-disc pl-5 space-y-2 mt-3">
                <li>Provide truthful and accurate information in your CV and profile</li>
                <li>Upload only your own CV and work samples</li>
                <li>Respect file size limits (CV: 10MB max, Video: 50MB max, 2 minutes)</li>
                <li>Use only supported file formats (CV: PDF/DOCX, Video: MP4)</li>
                <li>Attend scheduled interviews on time or provide timely notice if unable to attend</li>
                <li>Participate in interviews professionally and honestly</li>
                <li>Not submit multiple applications for the same position using different accounts</li>
                <li>Not exceed 3 video upload attempts per position (to prevent abuse)</li>
              </ul>
            </Section>

            <Section title="7. Recruiter Obligations">
              <p>As a recruitment agency staff member, you agree to:</p>
              <ul className="list-disc pl-5 space-y-2 mt-3">
                <li>Use the Service only for legitimate hospitality recruitment purposes</li>
                <li>Review AI recommendations critically and not rely solely on automated decisions</li>
                <li>Treat candidate data confidentially and use it only for recruitment</li>
                <li>Provide accurate job descriptions and requirements</li>
                <li>Respond to candidate applications in a timely manner</li>
                <li>Conduct interviews professionally and without discrimination</li>
                <li>Not share candidate data with unauthorized third parties</li>
                <li>Comply with all applicable employment and data protection laws</li>
              </ul>
            </Section>

            <Section title="8. AI-Powered Features & Disclaimers">
              <SubSection title="8.1 AI Analysis" />
              <p>The Platform uses Google Gemini AI to:</p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>Analyze CVs and generate fit scores (0-100)</li>
                <li>Identify strengths, weaknesses, and provide feedback</li>
                <li>Generate post-interview reports and hiring recommendations</li>
                <li>Suggest follow-up questions during interviews</li>
              </ul>

              <SubSection title="8.2 AI Limitations" />
              <p>You acknowledge that:</p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>AI scores are advisory and not definitive hiring decisions</li>
                <li>AI analysis is based on patterns in data and may not capture all nuances</li>
                <li>Final hiring decisions rest with human recruiters</li>
                <li>AI accuracy is targeted at ≥85% but not guaranteed</li>
                <li>Candidates may request human review of AI decisions</li>
              </ul>

              <SubSection title="8.3 Interview Bot" />
              <p>Our AI assistant (&quot;ServiaAI Assistant&quot;) may join interviews to:</p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>Provide live transcription for recruiters</li>
                <li>Capture conversation for post-interview analysis</li>
                <li>Suggest real-time follow-up questions</li>
              </ul>
              <p className="mt-2">The bot is visible to all participants. If the bot fails to join, interviews may proceed manually.</p>
            </Section>

            <Section title="9. Intellectual Property Rights">
              <SubSection title="9.1 Platform Ownership" />
              <p>ServiaAI and its original content, features, and functionality are owned by Sorora Tech and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.</p>

              <SubSection title="9.2 User Content License" />
              <p>By uploading CVs, videos, or other content, you grant ServiaAI and [Client Agency Name] a non-exclusive, worldwide, royalty-free license to store, process, analyze, and display your content for the purpose of facilitating recruitment for the duration of data retention (12 months). You retain all ownership rights to your original content.</p>

              <SubSection title="9.3 Feedback" />
              <p>Any feedback, suggestions, or ideas you provide to improve the Service become the exclusive property of ServiaAI without compensation to you.</p>
            </Section>

            <Section title="10. Third-Party Services">
              <p>The Service integrates with third-party platforms:</p>
              <ul className="list-disc pl-5 space-y-2 mt-3">
                <li>Google Services: Gemini AI, Speech-to-Text, Calendar, Meet</li>
                <li>Cloudflare: R2 storage, Stream video hosting</li>
                <li>Resend: Email delivery</li>
                <li>Railway/Vercel: Infrastructure hosting</li>
              </ul>
              <p className="mt-3">Your use of these services is also governed by their respective terms and privacy policies. We are not responsible for third-party service availability or content.</p>
            </Section>

            <Section title="11. Disclaimer of Warranties">
              <p>THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:</p>
              <ul className="list-disc pl-5 space-y-2 mt-3">
                <li>Merchantability, fitness for a particular purpose</li>
                <li>Non-infringement of intellectual property rights</li>
                <li>Accuracy, reliability, or completeness of AI analysis</li>
                <li>Uninterrupted or error-free operation</li>
                <li>That you will successfully obtain employment through the Platform</li>
                <li>That recruiters will respond to all applications</li>
              </ul>
              <p className="mt-3">WE DO NOT WARRANT THAT THE SERVICE WILL BE SECURE, FREE FROM VIRUSES, OR THAT DEFECTS WILL BE CORRECTED.</p>
            </Section>

            <Section title="12. Limitation of Liability">
              <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW:</p>
              <ul className="list-disc pl-5 space-y-2 mt-3">
                <li>No Consequential Damages: In no event shall ServiaAI, Sorora Tech, or [Client Agency Name] be liable for any indirect, incidental, special, consequential, or punitive damages</li>
                <li>Cap on Liability: Our total liability shall not exceed $100 USD or the amount you paid (if any) to use the Service</li>
                <li>Employment Outcomes: We are not responsible for hiring decisions, employment offers, or lack thereof</li>
                <li>AI Accuracy: We are not liable for AI scoring errors or recommendations, provided we maintain ≥85% accuracy target</li>
                <li>Third-Party Services: We are not liable for third-party service failures (Google, Cloudflare, etc.)</li>
                <li>Data Loss: We are not liable for data loss beyond our reasonable control</li>
              </ul>
            </Section>

            <Section title="13. Indemnification">
              <p>You agree to defend, indemnify, and hold harmless ServiaAI, Sorora Tech, [Client Agency Name], and their officers, directors, employees, and agents from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees arising from:</p>
              <ul className="list-disc pl-5 space-y-2 mt-3">
                <li>Your violation of these Terms</li>
                <li>Your use of the Service</li>
                <li>Your violation of any third-party right (including intellectual property or privacy rights)</li>
                <li>Your false or fraudulent CV information</li>
                <li>Your misconduct during interviews</li>
              </ul>
            </Section>

            <Section title="14. Termination">
              <SubSection title="14.1 By You" />
              <p>You may terminate your account at any time by contacting us. Upon termination, your data will be deleted according to our retention policy.</p>

              <SubSection title="14.2 By Us" />
              <p>We may terminate or suspend your access to the Service immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties, or for any violation of these Terms.</p>

              <SubSection title="14.3 Effect of Termination" />
              <p>Upon termination, your right to use the Service will immediately cease. All provisions of these Terms which by their nature should survive termination shall survive, including ownership provisions, warranty disclaimers, indemnity, and limitations of liability.</p>
            </Section>

            <Section title="15. Governing Law & Dispute Resolution">
              <SubSection title="15.1 Governing Law" />
              <p>These Terms shall be governed by and construed in accordance with the laws of the Federal Democratic Republic of Ethiopia, without regard to its conflict of law provisions.</p>

              <SubSection title="15.2 Dispute Resolution" />
              <p>Any disputes arising from these Terms or the Service shall be resolved through:</p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>Informal Negotiation: Contact us first to attempt to resolve the dispute informally</li>
                <li>Mediation: If informal negotiation fails, parties agree to non-binding mediation in Addis Ababa, Ethiopia</li>
                <li>Court Jurisdiction: If mediation fails, disputes shall be resolved in the courts of Addis Ababa, Ethiopia</li>
              </ul>

              <SubSection title="15.3 Class Action Waiver" />
              <p>You agree to resolve any disputes on an individual basis and waive any right to participate in class actions or representative proceedings.</p>
            </Section>

            <Section title="16. Changes to Terms">
              <p>We reserve the right to modify these Terms at any time. We will provide notice of material changes by:</p>
              <ul className="list-disc pl-5 space-y-2 mt-3">
                <li>Posting the updated Terms on this page</li>
                <li>Updating the &quot;Last updated&quot; date</li>
                <li>Sending email notification for material changes</li>
                <li>Displaying a prominent notice on the Platform</li>
              </ul>
              <p className="mt-3">Your continued use of the Service after changes constitutes acceptance of the new Terms. If you do not agree, you must stop using the Service.</p>
            </Section>

            <Section title="17. Service Availability & Modifications">
              <p>We reserve the right to:</p>
              <ul className="list-disc pl-5 space-y-2 mt-3">
                <li>Modify, suspend, or discontinue the Service (or any part) at any time</li>
                <li>Impose limits on certain features or restrict access</li>
                <li>Change pricing for any paid features (with 30 days notice)</li>
                <li>Perform maintenance that may cause temporary unavailability</li>
              </ul>
              <p className="mt-3">We target 99% uptime during business hours (8 AM–8 PM East Africa Time, Monday–Saturday) but do not guarantee uninterrupted service.</p>
            </Section>

            <Section title="18. Force Majeure">
              <p>We shall not be liable for any failure or delay in performance due to causes beyond our reasonable control, including but not limited to: acts of God, war, terrorism, riots, embargoes, acts of civil or military authorities, fire, floods, earthquakes, power failures, internet disruptions, third-party service outages (Google, Cloudflare, etc.), or technical failures.</p>
            </Section>

            <Section title="19. General Provisions">
              <SubSection title="19.1 Entire Agreement" />
              <p>These Terms, together with our Privacy Policy, constitute the entire agreement between you and ServiaAI regarding the Service.</p>

              <SubSection title="19.2 Severability" />
              <p>If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions shall remain in full force and effect.</p>

              <SubSection title="19.3 No Waiver" />
              <p>Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.</p>

              <SubSection title="19.4 Assignment" />
              <p>You may not assign these Terms without our prior written consent. We may assign these Terms in connection with a merger, acquisition, or sale of assets.</p>

              <SubSection title="19.5 Relationship" />
              <p>These Terms do not create any partnership, joint venture, employer-employee, or principal-agent relationship between you and ServiaAI.</p>
            </Section>

            <Section title="20. Contact Information">
              <p>For questions about these Terms of Service, please contact:</p>
              <div className="mt-4 p-5 rounded-xl bg-gray-50 border border-gray-100">
                <p className="mb-1">Legal Department</p>
                <p className="mb-1">ServiaAI / [Client Agency Name]</p>
                <p className="mb-1">Addis Ababa, Ethiopia</p>
                <p>
                  Email: <Link href="mailto:legal@servia-client.com" className="text-[var(--color-primary)] hover:underline">legal@servia-client.com</Link>
                </p>
                <p>Phone: +251-XXX-XXX-XXX</p>
              </div>
            </Section>

            <Section title="21. Additional Terms for Specific Features">
              <SubSection title="21.1 Video Recording Consent" />
              <p>By recording or uploading video introductions, you consent to:</p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>Storage and processing of your video for recruitment purposes</li>
                <li>Viewing by authorized recruiters and agency staff</li>
                <li>AI analysis for communication skills assessment</li>
                <li>Retention for 12 months or until deletion request</li>
              </ul>

              <SubSection title="21.2 Interview Recording" />
              <p>By participating in interviews, you acknowledge that:</p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>The session may be transcribed by AI</li>
                <li>Transcripts are stored for 6 months</li>
                <li>Transcripts may be used for AI training (anonymized)</li>
                <li>You may request deletion of transcripts</li>
              </ul>

              <SubSection title="21.3 Email Communications" />
              <p>By using the Service, you consent to receive:</p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>Application status updates</li>
                <li>Interview invitations and confirmations</li>
                <li>AI feedback and reports</li>
                <li>Platform notifications and announcements</li>
              </ul>
              <p className="mt-2">You may opt out of non-essential communications by clicking &quot;unsubscribe&quot; in emails.</p>
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
