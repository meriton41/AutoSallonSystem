using Microsoft.Extensions.Configuration;
using System.Net;
using System.Net.Mail;
using System.Net.Mime;

namespace AutoSallonSolution.Services
{
    public class EmailService
    {
        private readonly IConfiguration _config;

        public EmailService(IConfiguration config)
        {
            _config = config;
        }

        public async Task SendVerificationEmailAsync(string toEmail, string encodedToken)
        {
            try
            {
                Console.WriteLine("📧 Starting to send verification email to: " + toEmail);

                var smtpSettings = _config.GetSection("SmtpSettings");
                var fromAddress = smtpSettings["UserName"];
                var password = smtpSettings["Password"];
                var host = smtpSettings["Host"];
                var port = int.Parse(smtpSettings["Port"]);
                var enableSsl = bool.Parse(smtpSettings["EnableSsl"]);

                if (string.IsNullOrEmpty(fromAddress) || string.IsNullOrEmpty(password))
                {
                    Console.WriteLine("❌ Email configuration is missing");
                    throw new Exception("Email configuration is incomplete");
                }

                var verifyUrl = $"http://localhost:3000/verify-email?token={encodedToken}";
                Console.WriteLine("🔗 Verification URL: " + verifyUrl);

                var htmlBody = $@"
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <style>
                                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }}
                                .header {{ text-align: center; margin-bottom: 20px; }}
                                .logo {{ max-width: 400px; }}
                                .button {{ 
                                    background-color: black ; 
                                    color: white; 
                                    padding: 12px 24px; 
                                    text-decoration: none; 
                                    border-radius: 4px; 
                                    display: inline-block; 
                                    margin: 15px 0;
                                    font-weight: bold;
                                }}
                                .footer {{ 
                                    margin-top: 30px; 
                                    font-size: 12px; 
                                    color: #777; 
                                    text-align: center;
                                }}
                                .code {{ 
                                    background: #f5f5f5; 
                                    padding: 10px; 
                                    word-break: break-all;
                                    font-family: monospace;
                                }}
                            </style>
                        </head>
                        <body>
                            <div class='header'>
                                <img src='https://i.pinimg.com/736x/79/d8/62/79d8626b8e0849552c2c0917b624de30.jpg' alt='AutoSallon' class='logo'>
                            </div>

                            <h2>Verify Your Email</h2>
                            <p>Hello,</p>
                            <p>Click the button below to verify your account:</p>

                            <p>
                                <a href='{verifyUrl}' class='button' style='color: white;'>Verify Email Address</a>
                            </p>

                            <p>If you didn't request this, please ignore this email.</p>

                            <div class='footer'>
                                <p>© 2023 AutoSallon. All rights reserved.</p>
                                <p>
                                    AutoSallon Inc.<br>
                                    123 Auto Street, Pristina, Kosovo
                                </p>
                            </div>
                        </body>
                        </html>";

                var message = new MailMessage(fromAddress, toEmail)
                {
                    Subject = "Verify your email",
                    IsBodyHtml = true
                };

                var htmlView = AlternateView.CreateAlternateViewFromString(htmlBody, null, MediaTypeNames.Text.Html);

                // Adjust the image path to the actual location of your logo image file
                string imagePath = "wwwroot/images/logo.jpg";

                // Remove LinkedResource since image is loaded from URL
                // LinkedResource logoImage = new LinkedResource(imagePath, MediaTypeNames.Image.Jpeg)
                // {
                //     ContentId = "logoImage",
                //     TransferEncoding = System.Net.Mime.TransferEncoding.Base64
                // };

                // htmlView.LinkedResources.Add(logoImage);

                message.AlternateViews.Add(htmlView);

                using var smtp = new SmtpClient(host, port)
                {
                    EnableSsl = enableSsl,
                    Credentials = new NetworkCredential(fromAddress, password)
                };

                Console.WriteLine("📤 Sending email...");
                await smtp.SendMailAsync(message);
                Console.WriteLine("✅ Email sent successfully to: " + toEmail);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Failed to send email: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                throw;
            }
        }
    }
}
