/**
 * Email Service for Captura
 * Sends automated notifications for pickups, returns, and booking events
 */

import nodemailer from 'nodemailer';

// Email configuration
const EMAIL_CONFIG = {
  from: process.env.EMAIL_FROM || 'captura.my@gmail.com',
  to: process.env.ADMIN_EMAIL || 'haikaltdm46@gmail.com',
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'captura.my@gmail.com',
    pass: process.env.EMAIL_APP_PASSWORD,
  },
};

const BUSINESS_INFO = {
  name: 'Captura Rental',
  phone: '+60 17-746 4121',
  email: 'captura.my@gmail.com',
  locationName: 'Caltex Selayang Pandang',
  address: 'Caltex Selayang Pandang, Batu Caves, Selangor',
  mapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=3.2597,101.6497',
  wazeUrl: 'https://waze.com/ul?ll=3.2597,101.6497&navigate=yes',
};

// Create transporter
let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: EMAIL_CONFIG.service,
      auth: EMAIL_CONFIG.auth,
    });
  }
  return transporter;
}

// Email Templates
export interface EmailData {
  bookingId: string;
  customerName: string;
  cameraName: string;
  phone: string;
  email: string;
  daysUntilPickup?: number;
  daysUntilReturn?: number;
  pickupDate?: string;
  returnDate?: string;
  startDate?: string;
  endDate?: string;
  totalAmount?: number;
}

type DetailRow = {
  label: string;
  value: string;
  emphasis?: boolean;
};

type CalloutTone = 'neutral' | 'accent' | 'warning' | 'success';

type EmailLayoutOptions = {
  eyebrow: string;
  title: string;
  subtitle: string;
  intro?: string;
  summary?: Array<{ label: string; value: string }>;
  sections: string[];
  footerNote?: string;
};

function describeTiming(days = 0) {
  if (days <= 0) {
    return {
      subjectLabel: 'Today',
      label: 'today',
      customerLabel: 'today',
      uppercaseLabel: 'TODAY',
    };
  }

  if (days === 1) {
    return {
      subjectLabel: 'Tomorrow',
      label: 'tomorrow',
      customerLabel: 'tomorrow',
      uppercaseLabel: 'TOMORROW',
    };
  }

  return {
    subjectLabel: `In ${days} Days`,
    label: `in ${days} days`,
    customerLabel: `in ${days} days`,
    uppercaseLabel: `IN ${days} DAYS`,
  };
}

function escapeHtml(value?: string | number | null) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatBookingCode(bookingId: string) {
  return escapeHtml(bookingId.slice(-8).toUpperCase());
}

function formatCurrency(amount?: number) {
  if (typeof amount !== 'number' || Number.isNaN(amount)) {
    return 'RM0.00';
  }

  return `RM${amount.toFixed(2)}`;
}

function renderDetailTable(rows: DetailRow[]) {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
      ${rows
        .map(
          (row, index) => `
            <tr>
              <td style="padding:14px 0; border-bottom:${index === rows.length - 1 ? 'none' : '1px solid #ede7df'}; color:#6b6258; font-size:13px; font-weight:600; letter-spacing:0.08em; text-transform:uppercase; width:38%;">
                ${escapeHtml(row.label)}
              </td>
              <td style="padding:14px 0; border-bottom:${index === rows.length - 1 ? 'none' : '1px solid #ede7df'}; color:${row.emphasis ? '#b85c21' : '#1b1713'}; font-size:${row.emphasis ? '17px' : '15px'}; font-weight:${row.emphasis ? '700' : '600'}; text-align:left;">
                ${escapeHtml(row.value)}
              </td>
            </tr>
          `
        )
        .join('')}
    </table>
  `;
}

function renderSection(title: string, content: string) {
  return `
    <tr>
      <td style="padding:0 32px 20px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate; border-spacing:0; border:1px solid #e8e0d5; border-radius:20px; background:#fffdf9;">
          <tr>
            <td style="padding:24px 24px 22px;">
              <div style="font-size:18px; line-height:1.3; font-weight:700; color:#1b1713; margin:0 0 18px;">
                ${escapeHtml(title)}
              </div>
              ${content}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;
}

function renderCallout(title: string, text: string, tone: CalloutTone = 'neutral') {
  const palette = {
    neutral: { background: '#f6f1ea', border: '#ddd1c2', title: '#1f1a16', body: '#5f564c' },
    accent: { background: '#fff2e8', border: '#efc3a1', title: '#8b4519', body: '#7a4d2f' },
    warning: { background: '#fff7e9', border: '#f1d089', title: '#8b5a00', body: '#7a621e' },
    success: { background: '#eef8f1', border: '#b8dcc0', title: '#215c34', body: '#356848' },
  }[tone];

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate; border-spacing:0; border:1px solid ${palette.border}; border-radius:16px; background:${palette.background};">
      <tr>
        <td style="padding:18px 18px 16px;">
          <div style="font-size:14px; line-height:1.4; font-weight:700; color:${palette.title}; margin:0 0 8px;">
            ${escapeHtml(title)}
          </div>
          <div style="font-size:14px; line-height:1.7; color:${palette.body};">
            ${escapeHtml(text)}
          </div>
        </td>
      </tr>
    </table>
  `;
}

function renderChecklist(items: string[]) {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
      ${items
        .map(
          (item) => `
            <tr>
              <td style="padding:0 0 12px; vertical-align:top; width:18px; color:#b85c21; font-size:14px; font-weight:700;">•</td>
              <td style="padding:0 0 12px; color:#463f37; font-size:14px; line-height:1.7;">
                ${escapeHtml(item)}
              </td>
            </tr>
          `
        )
        .join('')}
    </table>
  `;
}

function renderButtonRow(buttons: Array<{ label: string; href: string; variant?: 'primary' | 'secondary' }>) {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
      <tr>
        ${buttons
          .map((button, index) => {
            const isPrimary = button.variant !== 'secondary';
            return `
              <td style="padding:${index === 0 ? '0 10px 0 0' : '0'};">
                <a href="${escapeHtml(button.href)}" style="display:inline-block; padding:12px 18px; border-radius:999px; text-decoration:none; font-size:13px; font-weight:700; letter-spacing:0.04em; color:${isPrimary ? '#171411' : '#6b6258'}; background:${isPrimary ? '#df8a45' : '#efe6db'}; border:1px solid ${isPrimary ? '#df8a45' : '#d7c8b6'};">
                  ${escapeHtml(button.label)}
                </a>
              </td>
            `;
          })
          .join('')}
      </tr>
    </table>
  `;
}

function renderSummary(summary: Array<{ label: string; value: string }>) {
  return `
    <tr>
      <td style="padding:0 32px 20px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate; border-spacing:0; border:1px solid #3b332d; border-radius:20px; background:#221c17;">
          <tr>
            ${summary
              .map(
                (item, index) => `
                  <td style="padding:18px 20px; ${index < summary.length - 1 ? 'border-right:1px solid #342d27;' : ''}">
                    <div style="font-size:11px; letter-spacing:0.18em; text-transform:uppercase; color:#9d9185; margin-bottom:8px;">
                      ${escapeHtml(item.label)}
                    </div>
                    <div style="font-size:20px; line-height:1.2; font-weight:700; color:#f7f2eb;">
                      ${escapeHtml(item.value)}
                    </div>
                  </td>
                `
              )
              .join('')}
          </tr>
        </table>
      </td>
    </tr>
  `;
}

function renderEmailLayout({ eyebrow, title, subtitle, intro, summary, sections, footerNote }: EmailLayoutOptions) {
  return `
    <div style="margin:0; padding:24px 0; background:#efe9e0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px; border-collapse:collapse;">
              <tr>
                <td style="padding:0 18px;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate; border-spacing:0; overflow:hidden; border-radius:28px; background:#171411; box-shadow:0 18px 60px rgba(18, 14, 10, 0.22);">
                    <tr>
                      <td style="padding:0;">
                        <div style="height:6px; background:linear-gradient(90deg, #b85c21 0%, #ebad74 100%);"></div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:28px 32px 26px; background:radial-gradient(circle at top left, rgba(223,138,69,0.18), rgba(23,20,17,0) 38%), #171411;">
                        <div style="font-size:11px; line-height:1.4; letter-spacing:0.24em; text-transform:uppercase; color:#bcaa98; margin:0 0 14px;">
                          ${escapeHtml(eyebrow)}
                        </div>
                        <div style="font-size:34px; line-height:1.15; font-weight:700; color:#f8f4ee; margin:0 0 10px;">
                          ${escapeHtml(title)}
                        </div>
                        <div style="font-size:16px; line-height:1.7; color:#d5c7b9; margin:0;">
                          ${escapeHtml(subtitle)}
                        </div>
                      </td>
                    </tr>
                    ${summary && summary.length ? renderSummary(summary) : ''}
                    <tr>
                      <td style="padding:0 0 6px; background:#fcfaf6;">
                        ${
                          intro
                            ? `
                              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                                <tr>
                                  <td style="padding:30px 32px 12px; color:#433a31; font-size:15px; line-height:1.8;">
                                    ${escapeHtml(intro)}
                                  </td>
                                </tr>
                              </table>
                            `
                            : ''
                        }
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                          ${sections.join('')}
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:24px 32px 28px; background:#fcfaf6; border-top:1px solid #ece3d8;">
                        ${
                          footerNote
                            ? `<div style="font-size:13px; line-height:1.7; color:#6f655b; margin:0 0 18px;">${escapeHtml(footerNote)}</div>`
                            : ''
                        }
                        <div style="font-size:13px; line-height:1.8; color:#6f655b;">
                          <strong style="color:#1b1713;">${escapeHtml(BUSINESS_INFO.name)}</strong><br />
                          ${escapeHtml(BUSINESS_INFO.address)}<br />
                          ${escapeHtml(BUSINESS_INFO.phone)}<br />
                          ${escapeHtml(BUSINESS_INFO.email)}
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  `;
}

function createAdminPickupEmail(data: EmailData) {
  const timing = describeTiming(data.daysUntilPickup);

  return renderEmailLayout({
    eyebrow: 'Captura Operations',
    title: 'Pickup Reminder',
    subtitle: `A rental is scheduled for collection ${timing.label}.`,
    summary: [
      { label: 'Booking', value: formatBookingCode(data.bookingId) },
      { label: 'Customer', value: data.customerName },
      { label: 'Pickup', value: data.pickupDate || '-' },
    ],
    sections: [
      renderSection(
        'Booking Details',
        renderDetailTable([
          { label: 'Customer', value: data.customerName },
          { label: 'Camera', value: data.cameraName },
          { label: 'Phone', value: data.phone },
          { label: 'Email', value: data.email },
          { label: 'Pickup Date', value: data.pickupDate || '-', emphasis: true },
        ])
      ),
      renderSection(
        'Operations Note',
        renderCallout(
          'Prepare equipment',
          `Please make sure the booking is ready for handover ${timing.label} at ${BUSINESS_INFO.locationName}.`,
          'accent'
        )
      ),
    ],
    footerNote: 'This notification was sent automatically from your Captura booking workflow.',
  });
}

function createAdminReturnEmail(data: EmailData) {
  const timing = describeTiming(data.daysUntilReturn);

  return renderEmailLayout({
    eyebrow: 'Captura Operations',
    title: 'Return Reminder',
    subtitle: `A rental is due back ${timing.label}.`,
    summary: [
      { label: 'Booking', value: formatBookingCode(data.bookingId) },
      { label: 'Customer', value: data.customerName },
      { label: 'Return', value: data.returnDate || '-' },
    ],
    sections: [
      renderSection(
        'Booking Details',
        renderDetailTable([
          { label: 'Customer', value: data.customerName },
          { label: 'Camera', value: data.cameraName },
          { label: 'Phone', value: data.phone },
          { label: 'Email', value: data.email },
          { label: 'Return Date', value: data.returnDate || '-', emphasis: true },
        ])
      ),
      renderSection(
        'Inspection Checklist',
        [
          renderCallout(
            'Prepare for check-in',
            'Inspect the equipment condition, confirm accessories are returned, then process the deposit refund if applicable.',
            'warning'
          ),
          `<div style="height:16px;"></div>`,
          renderChecklist([
            'Check body, lens, battery, charger, and memory card before closing the booking.',
            'Confirm the final payment and refund status in the admin panel.',
            'Mark the rental as completed once the return is fully verified.',
          ]),
        ].join('')
      ),
    ],
    footerNote: 'This notification was sent automatically from your Captura booking workflow.',
  });
}

function createNewBookingAdminEmail(data: EmailData) {
  return renderEmailLayout({
    eyebrow: 'Captura Bookings',
    title: 'New Booking Request',
    subtitle: 'A new rental request has been submitted and is awaiting review.',
    summary: [
      { label: 'Booking', value: formatBookingCode(data.bookingId) },
      { label: 'Rental', value: `${data.startDate || '-'} to ${data.endDate || '-'}` },
      { label: 'Total', value: formatCurrency(data.totalAmount) },
    ],
    sections: [
      renderSection(
        'Booking Details',
        renderDetailTable([
          { label: 'Customer', value: data.customerName },
          { label: 'Camera', value: data.cameraName },
          { label: 'Phone', value: data.phone },
          { label: 'Email', value: data.email },
          { label: 'Pickup Date', value: data.pickupDate || '-' },
        ])
      ),
      renderSection(
        'Action Required',
        renderCallout(
          'Review the request',
          'Open the admin panel to approve or reject this booking, then continue with invoice and agreement processing.',
          'accent'
        )
      ),
    ],
    footerNote: 'This notification was sent automatically from your website booking flow.',
  });
}

function createCustomerBookingEmail(data: EmailData) {
  return renderEmailLayout({
    eyebrow: 'Captura Rental',
    title: 'Booking Received',
    subtitle: 'Your rental request is safely in our system and will be reviewed shortly.',
    intro: `Hi ${data.customerName}, thank you for choosing Captura. We have received your request for ${data.cameraName} and will confirm the booking as soon as possible.`,
    summary: [
      { label: 'Booking', value: formatBookingCode(data.bookingId) },
      { label: 'Rental', value: `${data.startDate || '-'} to ${data.endDate || '-'}` },
      { label: 'Total', value: formatCurrency(data.totalAmount) },
    ],
    sections: [
      renderSection(
        'Your Booking',
        renderDetailTable([
          { label: 'Camera', value: data.cameraName },
          { label: 'Rental Period', value: `${data.startDate || '-'} to ${data.endDate || '-'}` },
          { label: 'Pickup Date', value: data.pickupDate || '-', emphasis: true },
          { label: 'Total Amount', value: formatCurrency(data.totalAmount), emphasis: true },
        ])
      ),
      renderSection(
        'What Happens Next',
        [
          renderChecklist([
            'Our team will review your request and confirm the booking.',
            'You will receive a follow-up once everything is approved.',
            'We will send a reminder before your pickup date.',
            'Please bring a valid ID during collection.',
          ]),
          `<div style="height:16px;"></div>`,
          renderCallout(
            'Pickup timing',
            'Equipment is prepared for collection after 10:00 PM unless we confirm a different arrangement with you.',
            'warning'
          ),
        ].join('')
      ),
      renderSection(
        'Pickup Location',
        [
          `<div style="font-size:14px; line-height:1.8; color:#463f37; margin:0 0 18px;">`,
          `<strong style="color:#1b1713;">${escapeHtml(BUSINESS_INFO.locationName)}</strong><br />`,
          `${escapeHtml(BUSINESS_INFO.address)}`,
          `</div>`,
          renderButtonRow([
            { label: 'Open in Google Maps', href: BUSINESS_INFO.mapsUrl },
            { label: 'Open in Waze', href: BUSINESS_INFO.wazeUrl, variant: 'secondary' },
          ]),
        ].join(''),
      ),
    ],
    footerNote: 'If you have any questions, reply to this email or contact us directly on WhatsApp.',
  });
}

function createCustomerPickupEmail(data: EmailData) {
  const timing = describeTiming(data.daysUntilPickup);

  return renderEmailLayout({
    eyebrow: 'Captura Rental',
    title: 'Pickup Reminder',
    subtitle: `Your equipment is scheduled for pickup ${timing.customerLabel}.`,
    intro: `Hi ${data.customerName}, this is a quick reminder that your ${data.cameraName} booking is ready for collection ${timing.customerLabel}.`,
    summary: [
      { label: 'Booking', value: formatBookingCode(data.bookingId) },
      { label: 'Camera', value: data.cameraName },
      { label: 'Pickup', value: data.pickupDate || '-' },
    ],
    sections: [
      renderSection(
        'Pickup Details',
        renderDetailTable([
          { label: 'Booking', value: formatBookingCode(data.bookingId) },
          { label: 'Camera', value: data.cameraName },
          { label: 'Pickup Date', value: data.pickupDate || '-', emphasis: true },
          { label: 'Contact', value: BUSINESS_INFO.phone },
        ])
      ),
      renderSection(
        'Before You Arrive',
        [
          renderChecklist([
            'Bring a valid ID for verification.',
            'Keep this email or your booking reference ready.',
            'Contact us first if you need to adjust the pickup timing.',
          ]),
          `<div style="height:16px;"></div>`,
          renderCallout(
            'Pickup timing',
            'Equipment is prepared for collection after 10:00 PM unless a different arrangement has been confirmed with you.',
            'accent'
          ),
        ].join('')
      ),
      renderSection(
        'Pickup Location',
        [
          `<div style="font-size:14px; line-height:1.8; color:#463f37; margin:0 0 18px;">`,
          `<strong style="color:#1b1713;">${escapeHtml(BUSINESS_INFO.locationName)}</strong><br />`,
          `${escapeHtml(BUSINESS_INFO.address)}`,
          `</div>`,
          renderButtonRow([
            { label: 'Open in Google Maps', href: BUSINESS_INFO.mapsUrl },
            { label: 'Open in Waze', href: BUSINESS_INFO.wazeUrl, variant: 'secondary' },
          ]),
        ].join(''),
      ),
    ],
    footerNote: 'If your plans change, please contact Captura as early as possible so we can help.',
  });
}

function createCustomerReturnEmail(data: EmailData) {
  const timing = describeTiming(data.daysUntilReturn);

  return renderEmailLayout({
    eyebrow: 'Captura Rental',
    title: 'Return Reminder',
    subtitle: `Your rental is scheduled for return ${timing.customerLabel}.`,
    intro: `Hi ${data.customerName}, thank you for renting with Captura. This is a reminder to return your ${data.cameraName} ${timing.customerLabel}.`,
    summary: [
      { label: 'Booking', value: formatBookingCode(data.bookingId) },
      { label: 'Camera', value: data.cameraName },
      { label: 'Return', value: data.returnDate || '-' },
    ],
    sections: [
      renderSection(
        'Return Details',
        renderDetailTable([
          { label: 'Booking', value: formatBookingCode(data.bookingId) },
          { label: 'Camera', value: data.cameraName },
          { label: 'Return Date', value: data.returnDate || '-', emphasis: true },
          { label: 'Deadline', value: 'Before 8:00 PM', emphasis: true },
        ])
      ),
      renderSection(
        'Before You Return',
        [
          renderChecklist([
            'Pack the camera and all accessories that came with it.',
            'Remove any personal files from the memory card.',
            'Return the equipment in good condition for inspection.',
          ]),
          `<div style="height:16px;"></div>`,
          renderCallout(
            'Deposit refund',
            'Your deposit can be processed after the return inspection is completed and the equipment is confirmed to be in good order.',
            'success'
          ),
          `<div style="height:12px;"></div>`,
          renderCallout(
            'Late return policy',
            'Additional charges may apply if the return is late, so please arrive before the stated deadline.',
            'warning'
          ),
        ].join('')
      ),
      renderSection(
        'Return Location',
        [
          `<div style="font-size:14px; line-height:1.8; color:#463f37; margin:0 0 18px;">`,
          `<strong style="color:#1b1713;">${escapeHtml(BUSINESS_INFO.locationName)}</strong><br />`,
          `${escapeHtml(BUSINESS_INFO.address)}`,
          `</div>`,
          renderButtonRow([
            { label: 'Open in Google Maps', href: BUSINESS_INFO.mapsUrl },
            { label: 'Open in Waze', href: BUSINESS_INFO.wazeUrl, variant: 'secondary' },
          ]),
        ].join(''),
      ),
    ],
    footerNote: 'We appreciate your business and hope to serve you again on your next shoot.',
  });
}

/**
 * Send pickup reminder email
 */
export async function sendPickupReminder(data: EmailData): Promise<boolean> {
  try {
    const timing = describeTiming(data.daysUntilPickup);
    const mailOptions = {
      from: `Captura Rental <${EMAIL_CONFIG.from}>`,
      to: EMAIL_CONFIG.to,
      subject: `Pickup Reminder ${timing.uppercaseLabel} - ${data.customerName} - ${data.cameraName}`,
      html: createAdminPickupEmail(data),
    };

    const transport = getTransporter();
    await transport.sendMail(mailOptions);
    console.log('Pickup reminder email sent:', data.bookingId);
    return true;
  } catch (error) {
    console.error('Error sending pickup reminder email:', error);
    return false;
  }
}

/**
 * Send return reminder email
 */
export async function sendReturnReminder(data: EmailData): Promise<boolean> {
  try {
    const timing = describeTiming(data.daysUntilReturn);
    const mailOptions = {
      from: `Captura Rental <${EMAIL_CONFIG.from}>`,
      to: EMAIL_CONFIG.to,
      subject: `Return Reminder ${timing.uppercaseLabel} - ${data.customerName} - ${data.cameraName}`,
      html: createAdminReturnEmail(data),
    };

    const transport = getTransporter();
    await transport.sendMail(mailOptions);
    console.log('Return reminder email sent:', data.bookingId);
    return true;
  } catch (error) {
    console.error('Error sending return reminder email:', error);
    return false;
  }
}

/**
 * Send new booking notification
 */
export async function sendNewBookingNotification(data: EmailData): Promise<boolean> {
  try {
    const mailOptions = {
      from: `Captura Rental <${EMAIL_CONFIG.from}>`,
      to: EMAIL_CONFIG.to,
      subject: `New Booking Request - ${data.customerName} - ${data.cameraName}`,
      html: createNewBookingAdminEmail(data),
    };

    const transport = getTransporter();
    await transport.sendMail(mailOptions);
    console.log('New booking notification email sent:', data.bookingId);
    return true;
  } catch (error) {
    console.error('Error sending new booking notification email:', error);
    return false;
  }
}

/**
 * Send thank you email to customer after booking
 */
export async function sendCustomerThankYouEmail(data: EmailData): Promise<boolean> {
  try {
    const mailOptions = {
      from: `Captura Rental <${EMAIL_CONFIG.from}>`,
      to: data.email,
      subject: `Booking Received - ${data.cameraName} | Captura Rental`,
      html: createCustomerBookingEmail(data),
    };

    const transport = getTransporter();
    await transport.sendMail(mailOptions);
    console.log('Thank you email sent to customer:', data.email);
    return true;
  } catch (error) {
    console.error('Error sending thank you email to customer:', error);
    return false;
  }
}

/**
 * Send pickup reminder to customer (1 day before or same day)
 */
export async function sendCustomerPickupReminder(data: EmailData): Promise<boolean> {
  try {
    const timing = describeTiming(data.daysUntilPickup);
    const mailOptions = {
      from: `Captura Rental <${EMAIL_CONFIG.from}>`,
      to: data.email,
      subject: `Pickup Reminder ${timing.subjectLabel} - ${data.cameraName} | Captura Rental`,
      html: createCustomerPickupEmail(data),
    };

    const transport = getTransporter();
    await transport.sendMail(mailOptions);
    console.log('Pickup reminder sent to customer:', data.email);
    return true;
  } catch (error) {
    console.error('Error sending pickup reminder to customer:', error);
    return false;
  }
}

/**
 * Send return reminder to customer (on return date or lead-day reminder)
 */
export async function sendCustomerReturnReminder(data: EmailData): Promise<boolean> {
  try {
    const timing = describeTiming(data.daysUntilReturn);
    const mailOptions = {
      from: `Captura Rental <${EMAIL_CONFIG.from}>`,
      to: data.email,
      subject: `Return Reminder ${timing.subjectLabel} - ${data.cameraName} | Captura Rental`,
      html: createCustomerReturnEmail(data),
    };

    const transport = getTransporter();
    await transport.sendMail(mailOptions);
    console.log('Return reminder sent to customer:', data.email);
    return true;
  } catch (error) {
    console.error('Error sending return reminder to customer:', error);
    return false;
  }
}

/**
 * Test email configuration
 */
export async function testEmailConfig(): Promise<boolean> {
  try {
    const transport = getTransporter();
    await transport.verify();
    console.log('Email service configured correctly');
    return true;
  } catch (error) {
    console.error('Email service configuration error:', error);
    return false;
  }
}
