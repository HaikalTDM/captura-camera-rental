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
    pass: process.env.EMAIL_APP_PASSWORD // Gmail App Password (not regular password)
  }
};

// Create transporter
let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: EMAIL_CONFIG.service,
      auth: EMAIL_CONFIG.auth
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
  pickupDate?: string;
  returnDate?: string;
  startDate?: string;
  endDate?: string;
  totalAmount?: number;
}

/**
 * Send pickup reminder email
 */
export async function sendPickupReminder(data: EmailData): Promise<boolean> {
  try {
    const mailOptions = {
      from: `Captura Rental <${EMAIL_CONFIG.from}>`,
      to: EMAIL_CONFIG.to,
      subject: `🔔 PICKUP REMINDER - ${data.customerName} - ${data.cameraName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">📦 PICKUP REMINDER</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Equipment Ready for Pickup</p>
          </div>
          
          <div style="background: #f7fafc; padding: 30px; border-left: 4px solid #667eea;">
            <h2 style="color: #2d3748; margin-top: 0;">Booking Details</h2>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; color: #4a5568; font-weight: bold;">Booking ID:</td>
                <td style="padding: 10px 0; color: #2d3748;">${data.bookingId.slice(-8).toUpperCase()}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #4a5568; font-weight: bold;">Customer:</td>
                <td style="padding: 10px 0; color: #2d3748;">${data.customerName}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #4a5568; font-weight: bold;">Camera:</td>
                <td style="padding: 10px 0; color: #2d3748;">${data.cameraName}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #4a5568; font-weight: bold;">Pickup Date:</td>
                <td style="padding: 10px 0; color: #2d3748; font-weight: bold; color: #e53e3e;">${data.pickupDate}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #4a5568; font-weight: bold;">Phone:</td>
                <td style="padding: 10px 0; color: #2d3748;">${data.phone}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #4a5568; font-weight: bold;">Email:</td>
                <td style="padding: 10px 0; color: #2d3748;">${data.email}</td>
              </tr>
            </table>
          </div>
          
          <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin-top: 20px;">
            <p style="margin: 0; color: #856404;">
              <strong>⚠️ Action Required:</strong> Customer should pick up equipment today at Caltex Selayang Pandang.
            </p>
          </div>
          
          <div style="background: #f7fafc; padding: 20px; margin-top: 20px; text-align: center; color: #718096; font-size: 14px;">
            <p>This is an automated reminder from Captura Camera Rental</p>
            <p style="margin: 5px 0;">📍 Caltex Selayang Pandang, Batu Caves</p>
            <p style="margin: 5px 0;">📞 +60 17-746 4121</p>
          </div>
        </div>
      `
    };

    const transport = getTransporter();
    await transport.sendMail(mailOptions);
    console.log('✅ Pickup reminder email sent:', data.bookingId);
    return true;
  } catch (error) {
    console.error('❌ Error sending pickup reminder email:', error);
    return false;
  }
}

/**
 * Send return reminder email
 */
export async function sendReturnReminder(data: EmailData): Promise<boolean> {
  try {
    const mailOptions = {
      from: `Captura Rental <${EMAIL_CONFIG.from}>`,
      to: EMAIL_CONFIG.to,
      subject: `🔔 RETURN REMINDER - ${data.customerName} - ${data.cameraName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">🔙 RETURN REMINDER</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Equipment Due for Return</p>
          </div>
          
          <div style="background: #f7fafc; padding: 30px; border-left: 4px solid #f5576c;">
            <h2 style="color: #2d3748; margin-top: 0;">Booking Details</h2>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; color: #4a5568; font-weight: bold;">Booking ID:</td>
                <td style="padding: 10px 0; color: #2d3748;">${data.bookingId.slice(-8).toUpperCase()}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #4a5568; font-weight: bold;">Customer:</td>
                <td style="padding: 10px 0; color: #2d3748;">${data.customerName}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #4a5568; font-weight: bold;">Camera:</td>
                <td style="padding: 10px 0; color: #2d3748;">${data.cameraName}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #4a5568; font-weight: bold;">Return Date:</td>
                <td style="padding: 10px 0; color: #2d3748; font-weight: bold; color: #e53e3e;">${data.returnDate}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #4a5568; font-weight: bold;">Phone:</td>
                <td style="padding: 10px 0; color: #2d3748;">${data.phone}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #4a5568; font-weight: bold;">Email:</td>
                <td style="padding: 10px 0; color: #2d3748;">${data.email}</td>
              </tr>
            </table>
          </div>
          
          <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin-top: 20px;">
            <p style="margin: 0; color: #856404;">
              <strong>⚠️ Action Required:</strong> Customer should return equipment today. Please inspect for damages.
            </p>
          </div>
          
          <div style="background: #d1fae5; border-left: 4px solid #10b981; padding: 20px; margin-top: 20px;">
            <p style="margin: 0; color: #065f46;">
              <strong>✅ Next Steps:</strong>
            </p>
            <ul style="margin: 10px 0 0 20px; color: #065f46;">
              <li>Check equipment condition</li>
              <li>Process deposit refund if applicable</li>
              <li>Mark booking as completed</li>
            </ul>
          </div>
          
          <div style="background: #f7fafc; padding: 20px; margin-top: 20px; text-align: center; color: #718096; font-size: 14px;">
            <p>This is an automated reminder from Captura Camera Rental</p>
            <p style="margin: 5px 0;">📍 Caltex Selayang Pandang, Batu Caves</p>
            <p style="margin: 5px 0;">📞 +60 17-746 4121</p>
          </div>
        </div>
      `
    };

    const transport = getTransporter();
    await transport.sendMail(mailOptions);
    console.log('✅ Return reminder email sent:', data.bookingId);
    return true;
  } catch (error) {
    console.error('❌ Error sending return reminder email:', error);
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
      subject: `🆕 NEW BOOKING - ${data.customerName} - ${data.cameraName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">🎉 NEW BOOKING!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Awaiting Approval</p>
          </div>
          
          <div style="background: #f7fafc; padding: 30px; border-left: 4px solid #4facfe;">
            <h2 style="color: #2d3748; margin-top: 0;">Booking Details</h2>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; color: #4a5568; font-weight: bold;">Booking ID:</td>
                <td style="padding: 10px 0; color: #2d3748;">${data.bookingId.slice(-8).toUpperCase()}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #4a5568; font-weight: bold;">Customer:</td>
                <td style="padding: 10px 0; color: #2d3748;">${data.customerName}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #4a5568; font-weight: bold;">Camera:</td>
                <td style="padding: 10px 0; color: #2d3748;">${data.cameraName}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #4a5568; font-weight: bold;">Rental Period:</td>
                <td style="padding: 10px 0; color: #2d3748;">${data.startDate} - ${data.endDate}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #4a5568; font-weight: bold;">Total Amount:</td>
                <td style="padding: 10px 0; color: #2d3748; font-weight: bold;">RM${data.totalAmount?.toFixed(2)}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #4a5568; font-weight: bold;">Phone:</td>
                <td style="padding: 10px 0; color: #2d3748;">${data.phone}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #4a5568; font-weight: bold;">Email:</td>
                <td style="padding: 10px 0; color: #2d3748;">${data.email}</td>
              </tr>
            </table>
          </div>
          
          <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin-top: 20px;">
            <p style="margin: 0; color: #856404;">
              <strong>⚠️ Action Required:</strong> Please approve or reject this booking in the admin panel.
            </p>
          </div>
          
          <div style="background: #f7fafc; padding: 20px; margin-top: 20px; text-align: center; color: #718096; font-size: 14px;">
            <p>This is an automated notification from Captura Camera Rental</p>
            <p style="margin: 5px 0;">Log in to admin panel to manage this booking</p>
          </div>
        </div>
      `
    };

    const transport = getTransporter();
    await transport.sendMail(mailOptions);
    console.log('✅ New booking notification email sent:', data.bookingId);
    return true;
  } catch (error) {
    console.error('❌ Error sending new booking notification email:', error);
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
    console.log('✅ Email service configured correctly');
    return true;
  } catch (error) {
    console.error('❌ Email service configuration error:', error);
    return false;
  }
}

