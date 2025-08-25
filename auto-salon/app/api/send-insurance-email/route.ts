import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  const { to, subject, text, pdfBase64, pdfFileName } = await req.json();

  // Configure your SMTP transport
  const transporter = nodemailer.createTransport({
    host: "smtp.example.com", // e.g., smtp.gmail.com
    port: 587,
    secure: false,
    auth: {
      user: "rionhoxha8@gmail.com",
      pass: "Bukurieaxhanela1;",
    },
  });

  try {
    await transporter.sendMail({
      from: '"AutoSalon" <rionhoxha8@gmail.com>',
      to,
      subject,
      text,
      attachments: [
        {
          filename: pdfFileName || "insurance.pdf",
          content: Buffer.from(pdfBase64, "base64"),
          contentType: "application/pdf",
        },
      ],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email send error:", error);
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
