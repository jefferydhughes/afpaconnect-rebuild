type SendEmailArgs = {
  to: string | string[]
  subject: string
  html: string
  text: string
  replyTo?: string
}

type QuizUserEmailArgs = {
  to: string
  firstName?: string | null
  matchCount: number
  quizId: string
}

type QuizAdminEmailArgs = {
  to: string
  submittedEmail: string
  submittedName?: string | null
  source?: string | null
  budgetRange?: string | null
  matchCount: number
  quizId: string
}

type FranchiseApplicationEmailArgs = {
  to: string
  franchiseName: string
  applicantName: string
  applicantEmail: string
  applicationId: string
}

function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL
  if (explicit) return explicit.replace(/\/+$/, '')
  const vercel = process.env.VERCEL_URL
  if (vercel) return `https://${vercel}`.replace(/\/+$/, '')
  return 'http://localhost:3000'
}

function isEmailEnabled(): boolean {
  return Boolean(process.env.RESEND_API_KEY)
}

function getFromAddress(): string {
  return (
    process.env.AFPA_EMAIL_FROM ||
    process.env.EMAIL_FROM ||
    'AFPAConnect Notifications <notifications@afpaconnect.com>'
  )
}

async function sendEmail(args: SendEmailArgs): Promise<void> {
  if (!isEmailEnabled()) return

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: getFromAddress(),
      to: args.to,
      subject: args.subject,
      html: args.html,
      text: args.text,
      reply_to: args.replyTo,
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Resend email failed (${response.status}): ${body}`)
  }
}

export async function sendQuizUserConfirmationEmail(args: QuizUserEmailArgs): Promise<void> {
  const siteUrl = getSiteUrl()
  const safeFirstName = args.firstName?.trim() || 'there'
  const subject = 'Your AFPA quiz was received'
  const html = `
    <p>Hi ${safeFirstName},</p>
    <p>Thanks for completing your AFPA franchise quiz. We received your submission successfully.</p>
    <p><strong>Quiz ID:</strong> ${args.quizId}<br/>
    <strong>Matches found:</strong> ${args.matchCount}</p>
    <p>You can continue exploring franchises at <a href="${siteUrl}">${siteUrl}</a>.</p>
    <p>- AFPAConnect</p>
  `
  const text = [
    `Hi ${safeFirstName},`,
    '',
    'Thanks for completing your AFPA franchise quiz. We received your submission successfully.',
    `Quiz ID: ${args.quizId}`,
    `Matches found: ${args.matchCount}`,
    `Explore franchises: ${siteUrl}`,
    '',
    '- AFPAConnect',
  ].join('\n')

  await sendEmail({
    to: args.to,
    subject,
    html,
    text,
  })
}

export async function sendQuizAdminNotificationEmail(args: QuizAdminEmailArgs): Promise<void> {
  const siteUrl = getSiteUrl()
  const subject = `New quiz submission: ${args.submittedEmail}`
  const displayName = args.submittedName?.trim() || 'Unknown'
  const html = `
    <p>A new quiz submission was received.</p>
    <p><strong>Email:</strong> ${args.submittedEmail}<br/>
    <strong>Name:</strong> ${displayName}<br/>
    <strong>Source:</strong> ${args.source || 'website'}<br/>
    <strong>Budget:</strong> ${args.budgetRange || 'Not provided'}<br/>
    <strong>Matches found:</strong> ${args.matchCount}<br/>
    <strong>Quiz ID:</strong> ${args.quizId}</p>
    <p>Review in admin: <a href="${siteUrl}/dashboard/admin/quizzes">${siteUrl}/dashboard/admin/quizzes</a></p>
  `
  const text = [
    'A new quiz submission was received.',
    `Email: ${args.submittedEmail}`,
    `Name: ${displayName}`,
    `Source: ${args.source || 'website'}`,
    `Budget: ${args.budgetRange || 'Not provided'}`,
    `Matches found: ${args.matchCount}`,
    `Quiz ID: ${args.quizId}`,
    `Review in admin: ${siteUrl}/dashboard/admin/quizzes`,
  ].join('\n')

  await sendEmail({
    to: args.to,
    subject,
    html,
    text,
    replyTo: args.submittedEmail,
  })
}

export async function sendFranchiseApplicationNotificationEmail(
  args: FranchiseApplicationEmailArgs
): Promise<void> {
  const siteUrl = getSiteUrl()
  const subject = `New application for ${args.franchiseName}`
  const reviewUrl = `${siteUrl}/dashboard/franchisor/applications`
  const html = `
    <p>A new franchise application was submitted.</p>
    <p><strong>Franchise:</strong> ${args.franchiseName}<br/>
    <strong>Applicant:</strong> ${args.applicantName}<br/>
    <strong>Email:</strong> ${args.applicantEmail}<br/>
    <strong>Application ID:</strong> ${args.applicationId}</p>
    <p>Review applications: <a href="${reviewUrl}">${reviewUrl}</a></p>
  `
  const text = [
    'A new franchise application was submitted.',
    `Franchise: ${args.franchiseName}`,
    `Applicant: ${args.applicantName}`,
    `Email: ${args.applicantEmail}`,
    `Application ID: ${args.applicationId}`,
    `Review applications: ${reviewUrl}`,
  ].join('\n')

  await sendEmail({
    to: args.to,
    subject,
    html,
    text,
    replyTo: args.applicantEmail,
  })
}
