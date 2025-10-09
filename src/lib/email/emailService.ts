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
 * Send thank you email to customer after booking
 */
export async function sendCustomerThankYouEmail(data: EmailData): Promise<boolean> {
  try {
    const mailOptions = {
      from: `Captura Camera Rental <${EMAIL_CONFIG.from}>`,
      to: data.email,
      subject: `🎉 Booking Confirmed - Thank You for Choosing Captura!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 32px;">🎉 Thank You!</h1>
            <p style="margin: 15px 0 0 0; font-size: 18px;">Your booking has been received</p>
          </div>
          
          <div style="background: #f7fafc; padding: 30px;">
            <p style="color: #2d3748; font-size: 18px; margin-top: 0;">
              Hi <strong>${data.customerName}</strong>,
            </p>
            
            <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
              Thank you for choosing <strong>Captura Camera Rental</strong>! We've received your booking request and our team will review it shortly.
            </p>
            
            <div style="background: white; border-radius: 12px; padding: 25px; margin: 25px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <h2 style="color: #2d3748; margin-top: 0; font-size: 20px;">📋 Your Booking Details</h2>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 12px 0; color: #4a5568; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Booking ID:</td>
                  <td style="padding: 12px 0; color: #2d3748; border-bottom: 1px solid #e2e8f0;">${data.bookingId.slice(-8).toUpperCase()}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; color: #4a5568; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Camera:</td>
                  <td style="padding: 12px 0; color: #2d3748; border-bottom: 1px solid #e2e8f0;">${data.cameraName}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; color: #4a5568; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Rental Period:</td>
                  <td style="padding: 12px 0; color: #2d3748; border-bottom: 1px solid #e2e8f0;">${data.startDate} - ${data.endDate}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; color: #4a5568; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Total Amount:</td>
                  <td style="padding: 12px 0; color: #10b981; font-weight: bold; font-size: 18px; border-bottom: 1px solid #e2e8f0;">RM${data.totalAmount?.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; color: #4a5568; font-weight: bold;">Pickup Date:</td>
                  <td style="padding: 12px 0; color: #e53e3e; font-weight: bold;">${data.pickupDate}</td>
                </tr>
              </table>
            </div>
            
            <div style="background: #dbeafe; border-left: 4px solid #3b82f6; padding: 20px; margin: 25px 0; border-radius: 8px;">
              <h3 style="color: #1e40af; margin-top: 0; font-size: 18px;">📌 What's Next?</h3>
              <ol style="color: #1e3a8a; margin: 10px 0 0 20px; line-height: 1.8;">
                <li>Our team will review and approve your booking</li>
                <li>You'll receive a confirmation email within 24 hours</li>
                <li>Pickup your equipment on <strong>${data.pickupDate}</strong></li>
                <li>We'll send you a reminder before pickup</li>
              </ol>
            </div>
            
            <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 25px 0; border-radius: 8px;">
              <p style="margin: 0; color: #856404; font-weight: bold;">
                💡 <strong>Important:</strong> Please bring a valid ID for equipment pickup.
              </p>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 25px; margin: 25px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <h3 style="color: #2d3748; margin-top: 0;">📍 Pickup Location</h3>
              <p style="color: #4a5568; margin: 10px 0;">
                <strong>Caltex Selayang Pandang</strong><br>
                Lot 1, 2, Batu 8, Jalan Rawang<br>
                Selayang Pandang, 68100 Batu Caves<br>
                Selangor, Malaysia
              </p>
            </div>
            
            <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
              If you have any questions, feel free to contact us at <strong>+60 17-746 4121</strong> or reply to this email.
            </p>
            
            <p style="color: #4a5568; font-size: 16px;">
              Thank you for choosing Captura! 📷
            </p>
          </div>
          
          <div style="background: #2d3748; color: #cbd5e0; padding: 25px; text-align: center; font-size: 14px;">
            <p style="margin: 5px 0;"><strong>Captura Camera Rental</strong></p>
            <p style="margin: 5px 0;">📞 +60 17-746 4121</p>
            <p style="margin: 5px 0;">📧 captura.my@gmail.com</p>
            <p style="margin: 5px 0;">📍 Caltex Selayang Pandang, Batu Caves</p>
            <p style="margin: 15px 0 5px 0; color: #9ca3af; font-size: 12px;">
              © 2024 Captura Camera Rental. All rights reserved.
            </p>
          </div>
        </div>
      `
    };

    const transport = getTransporter();
    await transport.sendMail(mailOptions);
    console.log('✅ Thank you email sent to customer:', data.email);
    return true;
  } catch (error) {
    console.error('❌ Error sending thank you email to customer:', error);
    return false;
  }
}

/**
 * Send pickup reminder to customer (1 day before or same day)
 */
export async function sendCustomerPickupReminder(data: EmailData): Promise<boolean> {
  try {
    const mailOptions = {
      from: `Captura Camera Rental <${EMAIL_CONFIG.from}>`,
      to: data.email,
      subject: `📦 Reminder: Camera Pickup Tomorrow - ${data.cameraName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 32px;">📦 Pickup Reminder</h1>
            <p style="margin: 15px 0 0 0; font-size: 18px;">Your camera is ready for pickup!</p>
          </div>
          
          <div style="background: #f7fafc; padding: 30px;">
            <p style="color: #2d3748; font-size: 18px; margin-top: 0;">
              Hi <strong>${data.customerName}</strong>,
            </p>
            
            <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
              This is a friendly reminder that your <strong>${data.cameraName}</strong> is ready for pickup!
            </p>
            
            <div style="background: white; border-radius: 12px; padding: 25px; margin: 25px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <h2 style="color: #2d3748; margin-top: 0; font-size: 20px;">📋 Pickup Details</h2>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 12px 0; color: #4a5568; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Booking ID:</td>
                  <td style="padding: 12px 0; color: #2d3748; border-bottom: 1px solid #e2e8f0;">${data.bookingId.slice(-8).toUpperCase()}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; color: #4a5568; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Camera:</td>
                  <td style="padding: 12px 0; color: #2d3748; border-bottom: 1px solid #e2e8f0;">${data.cameraName}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; color: #4a5568; font-weight: bold;">Pickup Date:</td>
                  <td style="padding: 12px 0; color: #e53e3e; font-weight: bold; font-size: 18px;">${data.pickupDate}</td>
                </tr>
              </table>
            </div>
            
            <div style="background: #d1fae5; border-left: 4px solid #10b981; padding: 20px; margin: 25px 0; border-radius: 8px;">
              <h3 style="color: #065f46; margin-top: 0; font-size: 18px;">✅ What to Bring:</h3>
              <ul style="color: #047857; margin: 10px 0 0 20px; line-height: 1.8;">
                <li><strong>Valid ID</strong> (IC, Passport, or Driver's License)</li>
                <li><strong>Deposit</strong> (RM100 - refundable)</li>
                <li>This booking confirmation (show this email)</li>
              </ul>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 25px; margin: 25px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <h3 style="color: #2d3748; margin-top: 0;">📍 Pickup Location</h3>
              <p style="color: #4a5568; margin: 10px 0; font-size: 16px;">
                <strong style="color: #2d3748;">Caltex Selayang Pandang</strong><br>
                Lot 1, 2, Batu 8, Jalan Rawang<br>
                Selayang Pandang, 68100 Batu Caves<br>
                Selangor, Malaysia
              </p>
              <div style="margin-top: 15px;">
                <a href="https://www.google.com/maps/dir/?api=1&destination=3.2597,101.6497" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-right: 10px;">📍 Google Maps</a>
                <a href="https://waze.com/ul?ll=3.2597,101.6497&navigate=yes" style="display: inline-block; background: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">🚗 Waze</a>
              </div>
            </div>
            
            <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 25px 0; border-radius: 8px;">
              <p style="margin: 0; color: #856404; font-weight: bold;">
                ⏰ <strong>Please arrive during business hours.</strong> Contact us if you need to change your pickup time.
              </p>
            </div>
            
            <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
              Need help? Call us at <strong>+60 17-746 4121</strong> or reply to this email.
            </p>
            
            <p style="color: #4a5568; font-size: 16px;">
              See you soon! 📷
            </p>
          </div>
          
          <div style="background: #2d3748; color: #cbd5e0; padding: 25px; text-align: center; font-size: 14px;">
            <p style="margin: 5px 0;"><strong>Captura Camera Rental</strong></p>
            <p style="margin: 5px 0;">📞 +60 17-746 4121</p>
            <p style="margin: 5px 0;">📧 captura.my@gmail.com</p>
            <p style="margin: 5px 0;">📍 Caltex Selayang Pandang, Batu Caves</p>
          </div>
        </div>
      `
    };

    const transport = getTransporter();
    await transport.sendMail(mailOptions);
    console.log('✅ Pickup reminder sent to customer:', data.email);
    return true;
  } catch (error) {
    console.error('❌ Error sending pickup reminder to customer:', error);
    return false;
  }
}

/**
 * Send return reminder to customer (on return date - before 10pm)
 */
export async function sendCustomerReturnReminder(data: EmailData): Promise<boolean> {
  try {
    const mailOptions = {
      from: `Captura Camera Rental <${EMAIL_CONFIG.from}>`,
      to: data.email,
      subject: `🔙 Return Reminder: Camera Due Today by 10 PM - ${data.cameraName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 40px 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 32px;">🔙 Return Reminder</h1>
            <p style="margin: 15px 0 0 0; font-size: 18px;">Please return your camera today</p>
          </div>
          
          <div style="background: #f7fafc; padding: 30px;">
            <p style="color: #2d3748; font-size: 18px; margin-top: 0;">
              Hi <strong>${data.customerName}</strong>,
            </p>
            
            <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
              Thank you for renting from <strong>Captura</strong>! We hope you had a great experience with your <strong>${data.cameraName}</strong>.
            </p>
            
            <div style="background: #fee2e2; border-left: 4px solid #ef4444; padding: 20px; margin: 25px 0; border-radius: 8px;">
              <h3 style="color: #991b1b; margin-top: 0; font-size: 20px;">⏰ Return Due Today</h3>
              <p style="color: #7f1d1d; font-size: 18px; font-weight: bold; margin: 10px 0;">
                Please return by: <span style="font-size: 24px;">10:00 PM Tonight</span>
              </p>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 25px; margin: 25px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <h2 style="color: #2d3748; margin-top: 0; font-size: 20px;">📋 Return Details</h2>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 12px 0; color: #4a5568; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Booking ID:</td>
                  <td style="padding: 12px 0; color: #2d3748; border-bottom: 1px solid #e2e8f0;">${data.bookingId.slice(-8).toUpperCase()}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; color: #4a5568; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Camera:</td>
                  <td style="padding: 12px 0; color: #2d3748; border-bottom: 1px solid #e2e8f0;">${data.cameraName}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; color: #4a5568; font-weight: bold;">Return Date:</td>
                  <td style="padding: 12px 0; color: #e53e3e; font-weight: bold; font-size: 18px;">${data.returnDate}</td>
                </tr>
              </table>
            </div>
            
            <div style="background: #dbeafe; border-left: 4px solid #3b82f6; padding: 20px; margin: 25px 0; border-radius: 8px;">
              <h3 style="color: #1e40af; margin-top: 0; font-size: 18px;">✅ Before You Return:</h3>
              <ul style="color: #1e3a8a; margin: 10px 0 0 20px; line-height: 1.8;">
                <li>Ensure all equipment is in good condition</li>
                <li>Pack all accessories (batteries, charger, case, memory card)</li>
                <li>Format/delete your personal files from memory card</li>
                <li>Bring the equipment to our location</li>
              </ul>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 25px; margin: 25px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <h3 style="color: #2d3748; margin-top: 0;">📍 Return Location</h3>
              <p style="color: #4a5568; margin: 10px 0; font-size: 16px;">
                <strong style="color: #2d3748;">Caltex Selayang Pandang</strong><br>
                Lot 1, 2, Batu 8, Jalan Rawang<br>
                Selayang Pandang, 68100 Batu Caves<br>
                Selangor, Malaysia
              </p>
              <div style="margin-top: 15px;">
                <a href="https://www.google.com/maps/dir/?api=1&destination=3.2597,101.6497" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-right: 10px;">📍 Google Maps</a>
                <a href="https://waze.com/ul?ll=3.2597,101.6497&navigate=yes" style="display: inline-block; background: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">🚗 Waze</a>
              </div>
            </div>
            
            <div style="background: #d1fae5; border-left: 4px solid #10b981; padding: 20px; margin: 25px 0; border-radius: 8px;">
              <p style="margin: 0; color: #065f46; font-weight: bold;">
                💰 <strong>Deposit Refund:</strong> Your RM100 deposit will be refunded after equipment inspection (if no damage).
              </p>
            </div>
            
            <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 25px 0; border-radius: 8px;">
              <p style="margin: 0; color: #856404; font-weight: bold;">
                ⚠️ <strong>Late Return:</strong> Additional charges apply for late returns. Please return by 10 PM to avoid extra fees.
              </p>
            </div>
            
            <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
              Questions? Call us at <strong>+60 17-746 4121</strong> or reply to this email.
            </p>
            
            <p style="color: #4a5568; font-size: 16px;">
              Thank you for choosing Captura! We hope to serve you again soon. 📷
            </p>
          </div>
          
          <div style="background: #2d3748; color: #cbd5e0; padding: 25px; text-align: center; font-size: 14px;">
            <p style="margin: 5px 0;"><strong>Captura Camera Rental</strong></p>
            <p style="margin: 5px 0;">📞 +60 17-746 4121</p>
            <p style="margin: 5px 0;">📧 captura.my@gmail.com</p>
            <p style="margin: 5px 0;">📍 Caltex Selayang Pandang, Batu Caves</p>
          </div>
        </div>
      `
    };

    const transport = getTransporter();
    await transport.sendMail(mailOptions);
    console.log('✅ Return reminder sent to customer:', data.email);
    return true;
  } catch (error) {
    console.error('❌ Error sending return reminder to customer:', error);
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

