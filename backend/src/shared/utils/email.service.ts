import nodemailer, { Transporter } from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    // Gmail veya başka bir SMTP servisi için
    const emailConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    };

    // Eğer SMTP bilgileri yoksa test account kullan (sadece development için)
    if (!process.env.SMTP_USER && process.env.NODE_ENV === 'development') {
      console.log('⚠️  SMTP credentials not found. Email sending will be simulated.');
      return;
    }

    this.transporter = nodemailer.createTransport(emailConfig);
    console.log('✅ Email service initialized');
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.transporter) {
      console.log('📧 [SIMULATED EMAIL]');
      console.log(`To: ${options.to}`);
      console.log(`Subject: ${options.subject}`);
      console.log(`Content: ${options.text || options.html}`);
      return true;
    }

    try {
      const info = await this.transporter.sendMail({
        from: `"Erasmus Connect" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });

      console.log('✅ Email sent:', info.messageId);
      return true;
    } catch (error) {
      console.error('❌ Error sending email:', error);
      return false;
    }
  }

  async sendVerificationEmail(email: string, token: string, firstName: string): Promise<boolean> {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🌍 Erasmus Connect</h1>
              <p>Verify Your Email Address</p>
            </div>
            <div class="content">
              <h2>Hello ${firstName}! 👋</h2>
              <p>Welcome to Erasmus Connect! Please verify your email address to activate your account.</p>
              <p>Click the button below to verify your email:</p>
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify My Email</a>
              </div>
              <p>Or copy this link to your browser:</p>
              <p style="background: white; padding: 10px; border-radius: 5px; word-break: break-all;">
                ${verificationUrl}
              </p>
              <p><strong>Note:</strong> This link is valid for 24 hours.</p>
              <p>If you didn't create this account, you can ignore this email.</p>
            </div>
            <div class="footer">
              <p>© 2025 Erasmus Connect. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
      Hello ${firstName}!
      
      Welcome to Erasmus Connect! Click the link below to verify your email address:
      
      ${verificationUrl}
      
      This link is valid for 24 hours.
      
      If you didn't create this account, you can ignore this email.
    `;

    return this.sendEmail({
      to: email,
      subject: 'Verify Your Email - Erasmus Connect',
      html,
      text,
    });
  }

  async sendWelcomeEmail(email: string, firstName: string): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome!</h1>
            </div>
            <div class="content">
              <h2>Hello ${firstName}! 👋</h2>
              <p>We're so excited to have you join the Erasmus Connect community!</p>
              <p>Now you can:</p>
              <ul>
                <li>🌍 Learn about your destination country</li>
                <li>🤝 Match with students with similar goals</li>
                <li>📝 Share your experiences</li>
                <li>🗺️ Discover travel routes</li>
              </ul>
              <p>Have fun!</p>
            </div>
            <div class="footer">
              <p>© 2025 Erasmus Connect. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Welcome to Erasmus Connect 🎉',
      html,
      text: `Hello ${firstName}! Welcome to the Erasmus Connect community!`,
    });
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<boolean> {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔒 Password Reset</h1>
            </div>
            <div class="content">
              <h2>Password Reset Request</h2>
              <p>We received a password reset request for your Erasmus Connect account.</p>
              <p>Click the button below to reset your password:</p>
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset My Password</a>
              </div>
              <p><strong>Note:</strong> This link is valid for 1 hour.</p>
              <p>If you didn't make this request, you can ignore this email.</p>
            </div>
            <div class="footer">
              <p>© 2025 Erasmus Connect. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Password Reset - Erasmus Connect',
      html,
    });
  }
}

export const emailService = new EmailService();

