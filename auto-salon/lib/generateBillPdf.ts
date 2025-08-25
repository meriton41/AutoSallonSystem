import { Bill } from "../types/bill";
import { Car } from "../types/car";
import jsPDF from "jspdf";

export function generateBillPdf(bill: Bill, car: Car) {
  const doc = new jsPDF();

  // Company Name
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("Nitron", 20, 20);

  // Invoice Title
  doc.setFontSize(16);
  doc.setFont("helvetica", "normal");
  doc.text("INVOICE", 20, 32);

  // Horizontal line
  doc.setLineWidth(0.5);
  doc.line(20, 36, 190, 36);

  // Bill & Client Info
  doc.setFontSize(11);
  doc.text(`Bill ID: ${bill.id}`, 20, 44);
  doc.text(`Date: ${new Date(bill.date).toLocaleDateString()}`, 20, 52);

  doc.text(`Billed To:`, 20, 62);
  doc.setFont("helvetica", "bold");
  doc.text(`${bill.clientName}`, 40, 62);
  doc.setFont("helvetica", "normal");
  doc.text(`Email: ${bill.clientEmail}`, 40, 68);
  
  // Car Details Section
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Car Details:", 20, 84);
  
  // Draw rectangle for car details
  const rectY = 88;
  const rectHeight = 56;
  doc.setDrawColor(0);
  doc.rect(20, rectY, 170, rectHeight);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);

  let leftX = 25;
  let rightX = 100;
  let startY = rectY + 8;
  let y = startY;

  // Left column
  doc.text(`Car ID: ${bill.vehicleId}`, leftX, y);
  doc.text(`Title: ${car.title || ""}`, leftX, y + 8);
  doc.text(`Brand: ${car.brand || ""}`, leftX, y + 16);
  doc.text(`Year: ${car.year || ""}`, leftX, y + 24);
  doc.text(`Color: ${car.color || ""}`, leftX, y + 32);
  doc.text(`Interior Color: ${car.interiorColor || ""}`, leftX, y + 40);

  // Right column
  doc.text(`Engine: ${car.engine || ""}`, rightX, y);
  doc.text(`Fuel: ${car.fuel || ""}`, rightX, y + 8);
  doc.text(`Power: ${car.power || ""}`, rightX, y + 16);
  doc.text(`Transmission: ${car.transmission || ""}`, rightX, y + 24);
  doc.text(`Mileage: ${car.mileage || ""}`, rightX, y + 32);

  // Price Breakdown Section
  const priceSectionY = rectY + rectHeight + 10;
  doc.setLineWidth(0.1);
  doc.line(20, priceSectionY, 190, priceSectionY);

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Price Breakdown", 20, priceSectionY + 8);

  // Price details
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  let priceY = priceSectionY + 18;

  // Amount
  doc.text("Amount:", 20, priceY);
  doc.text(`$${bill.amount.toFixed(2)}`, 190, priceY, { align: "right" });

  // Line after amount
  priceY += 4;
  doc.setLineWidth(0.1);
  doc.line(20, priceY, 190, priceY);
  priceY += 4;

  // Description
  doc.setFont("helvetica", "bold");
  doc.text("Description:", 20, priceY);
  doc.setFont("helvetica", "normal");
  doc.text(bill.description, 20, priceY + 8, { maxWidth: 170 });

  // Footer
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Thank you for your business!", 20, 280);

  // Business Information
  doc.setFont("helvetica", "italic");
  doc.text("Nitron AutoSalloni | Rr. Kryesore, Prishtinë, Kosovë | Tel: +383 44 123 456 | Email: info@nitron-ks.com", 20, 285);
  doc.text("Business Hours: Mon-Fri 09:00-18:00 | Sat 10:00-14:00", 20, 291);

  return doc;
}
