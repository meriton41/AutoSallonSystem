import { CarInsurance } from "../types/insurance";
import jsPDF from "jspdf";

export function generateInsurancePdf(insurance: CarInsurance): jsPDF {
  const doc = new jsPDF();

  // Header
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 25, 'F');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text("Nitron", 14, 16);
  doc.setFontSize(10);
  doc.text("www.nitron.com | +123-456-7890 | info@nitron.com", 14, 22);

  // Title
  doc.setFontSize(20);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text("Car Insurance Policy", 105, 35, { align: "center" });

  // Policy Info
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text("Policy Information", 14, 45);
  doc.setFont('helvetica', 'normal');
  doc.text(`Policy Number: ${insurance.policyNumber}`, 14, 52);
  doc.text(`Start Date: ${insurance.startDate}`, 14, 58);
  doc.text(`End Date: ${insurance.endDate}`, 14, 64);
  doc.text(`Price: €${insurance.price}`, 14, 70);

  // Divider
  doc.setDrawColor(200, 200, 200);
  doc.line(14, 74, 196, 74);

  // Client Info
  doc.setFont('helvetica', 'bold');
  doc.text("Client Information", 14, 82);
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${insurance.clientName}`, 14, 88);
  doc.text(`Email: ${insurance.clientEmail}`, 14, 94);

  // Car Info
  doc.setFont('helvetica', 'bold');
  doc.text("Car Information", 14, 104);
  doc.setFont('helvetica', 'normal');
  
  // Draw a rectangle for car details
  const carInfoY = 110;
  const carInfoHeight = 60;
  doc.setDrawColor(0);
  doc.rect(14, carInfoY, 182, carInfoHeight);

  // Left column car details
  let leftX = 20;
  let rightX = 100;
  let y = carInfoY + 8;

  doc.text(`Car ID: ${insurance.vehicleId || insurance.carId}`, leftX, y);
  if (insurance.Vehicle) {
    doc.text(`Title: ${insurance.Vehicle.title || ""}`, leftX, y + 8);
    doc.text(`Brand: ${insurance.Vehicle.brand || ""}`, leftX, y + 16);
    doc.text(`Year: ${insurance.Vehicle.year || ""}`, leftX, y + 24);
    doc.text(`Color: ${insurance.Vehicle.color || ""}`, leftX, y + 32);
    doc.text(`Interior Color: ${insurance.Vehicle.interiorColor || ""}`, leftX, y + 40);
  }

  // Right column car details
  if (insurance.Vehicle) {
    doc.text(`Engine: ${insurance.Vehicle.engine || ""}`, rightX, y);
    doc.text(`Fuel: ${insurance.Vehicle.fuel || ""}`, rightX, y + 8);
    doc.text(`Power: ${insurance.Vehicle.power || ""}`, rightX, y + 16);
    doc.text(`Transmission: ${insurance.Vehicle.transmission || ""}`, rightX, y + 24);
    doc.text(`Mileage: ${insurance.Vehicle.mileage || ""}`, rightX, y + 32);
  }

  // Coverage
  doc.setFont('helvetica', 'bold');
  doc.text("Coverage Details", 14, carInfoY + carInfoHeight + 10);
  doc.setFont('helvetica', 'normal');
  doc.text(insurance.coverageDetails, 14, carInfoY + carInfoHeight + 18, { maxWidth: 180 });

  // Signature area
  doc.setFont('helvetica', 'bold');
  doc.text("Authorized Signature:", 14, 260);
  doc.setFont('helvetica', 'normal');
  doc.line(60, 260, 120, 260);

  // Footer
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text("Thank you for choosing AutoSalloni. This document serves as proof of insurance.", 105, 285, { align: "center" });

  return doc;
}

export async function sendInsuranceEmail(insurance: CarInsurance) {
  const doc = generateInsurancePdf(insurance);
  const pdfBase64 = doc.output("datauristring").split(",")[1];

  await fetch("/api/send-insurance-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      to: insurance.clientEmail,
      subject: "Your Car Insurance Policy",
      text: "Please find attached your car insurance policy.",
      pdfBase64,
      pdfFileName: `Insurance-${insurance.policyNumber}.pdf`,
    }),
  });
}
