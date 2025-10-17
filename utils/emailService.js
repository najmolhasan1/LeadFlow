const nodemailer = require('nodemailer');

// Create transporter (using Gmail)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send welcome email with download information - FIXED VERSION
async function sendWelcomeEmail(userEmail, userName, fileTopic, fileId, appUrl) {
  try {
    const downloadUrl = `${appUrl}/download/${fileId}`;
    
    const mailOptions = {
      from: `LeadFlow <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `✅ Download Ready: ${fileTopic} - LeadFlow`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
            <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&display=swap" rel="stylesheet">
            <style>
                body { 
                    font-family: 'Space Grotesk', Arial, sans-serif; 
                    line-height: 1.6; 
                    color: #333; 
                    max-width: 600px; 
                    margin: 0 auto; 
                    background-color: #f8f9fa;
                }
                .container {
                    background: white;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                }
                .header { 
                    background: linear-gradient(90deg, #764ba2 0%, #E954E2 100%);
                    color: white; 
                    padding: 40px 30px; 
                    text-align: center; 
                }
                .content { 
                    padding: 40px 30px; 
                }
                .download-section { 
                    background: #f8f9fa; 
                    padding: 25px; 
                    border-radius: 8px; 
                    margin: 25px 0; 
                    border-left: 4px solid #667eea; 
                    text-align: center;
                }
                .download-button {
                    display: inline-block;
                    background: linear-gradient(90deg, #764ba2 0%, #E954E2 100%);
                    color: white;
                    padding: 14px 32px;
                    text-decoration: none;
                    border-radius: 8px;
                    font-weight: 600;
                    font-size: 16px;
                    margin: 15px 0;
                    border: none;
                    cursor: pointer;
                    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
                    transition: all 0.3s ease;
                }
                .download-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
                }
                /* FIXED CSS for Social Links */

                .social-icon-link{
                color:black;
                display:flex;
                justify-content:center;
                align-items:center;
                font-weight:bold;
                text-decoration:underline;
                gap:10px;
                }

                .footer { 
                    text-align: center; 
                    padding: 30px; 
                    color: #666; 
                    font-size: 14px; 
                    background: #f8f9fa;
                    border-top: 1px solid #e9ecef;
                }
                .note {
                    background: #fff3cd;
                    border: 1px solid #ffeaa7;
                    border-radius: 6px;
                    padding: 12px;
                    margin: 15px 0;
                    font-size: 14px;
                    color: #856404;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin:0; font-size: 28px;">🎉 Welcome to LeadFlow!</h1>
                    <p style="margin:10px 0 0; opacity:0.9; font-size:16px;">Your file download is ready</p>
                </div>
                
                <div class="content">
                    <h2 style="color: #2c3e50; margin-bottom: 20px;">Hello ${userName},</h2>
                    <p style="margin-bottom: 20px; font-size: 16px;">Thank you for registering with LeadFlow. We're excited to have you on board!</p>
                    
                    <div class="download-section">
                        <h3 style="color: #2c3e50; margin-bottom: 15px;">📁 Your File is Ready to Download</h3>
                        <p style="margin: 10px 0; font-size: 16px;"><strong>File:</strong> ${fileTopic}</p>
                        
                        <a href="${downloadUrl}" class="download-button">
                            <i class="fas fa-download"></i> Download Your File Now
                        </a>
                        
                        <div class="note">
                            <strong>Note:</strong> Click the button above to download your file instantly. 
                            You can also access it anytime from your LeadFlow account.
                        </div>
                    </div>
                    
                    <div style="margin: 30px 0;">
                        <h4 style="color: #2c3e50; margin-bottom: 15px;">What's Next?</h4>
                        <ul style="margin: 0; padding-left: 20px; font-size: 15px;">
                            <li style="margin-bottom: 8px;">✅ Access your file instantly with the download button</li>
                            <li style="margin-bottom: 8px;">🔔 Get notified about new content and updates</li>
                            <li style="margin-bottom: 8px;">📞 Contact us if you need any assistance</li>
                        </ul>
                    </div>
                    
                    <!-- FIXED Social Links Section -->
                    <div class="social-links">
                        <h4>Click below to Connect With Us</h4>
                        
                        <div class"social-link-a">
                            <a href="https://www.facebook.com/programmingHero/" class="social-icon-link" target="_blank">
                                <i class="fab fa-facebook-f"></i> facebook.
                            </a>
                            <a href="https://www.instagram.com/programminghero/?hl=en" class="social-icon-link" target="_blank">
                                <i class="fab fa-instagram"></i> Instagram.
                            </a>
                            <a href="https://bd.linkedin.com/company/programminghero" class="social-icon-link" target="_blank">
                                <i class="fab fa-linkedin-in"></i> Linkedin.
                            </a>
                            <a href="https://www.youtube.com/c/ProgrammingHeroCommunity" class="social-icon-link" target="_blank">
                                <i class="fab fa-youtube" style="color:black"></i> Youtube
                            </a>
                            <a href="https://wa.me/1234567890" class="social-icon-link" target="_blank">
                                <i class="fab fa-whatsapp"></i> whatsapp
                            </a>
                        </div>
                    </div>
                </div>
                
                <div class="footer">
                    <p style="margin: 0 0 10px;"><strong>The LeadFlow Team</strong></p>
                    <p style="margin: 0; font-size: 13px; opacity: 0.8;">
                        © 2024 LeadFlow. All rights reserved.<br>
                        <a href="#" style="color: #667eea; text-decoration: none;">Privacy Policy</a> | 
                        <a href="#" style="color: #667eea; text-decoration: none;">Terms of Service</a>
                    </p>
                </div>
            </div>
        </body>
        </html>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent to:', userEmail);
    return result;
    
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    // Don't throw error - email failure shouldn't break registration
    return null;
  }
}

module.exports = { sendWelcomeEmail };