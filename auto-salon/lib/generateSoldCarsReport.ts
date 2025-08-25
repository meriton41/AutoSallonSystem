import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

interface SoldCar {
  id: number;
  title: string;
  brand: string;
  year: number;
  originalPrice: number;
  salePrice: number;
  saleDate: string;
  clientName: string;
  clientEmail: string;
  image: string;
}

interface SalesSummary {
  totalSales: number;
  totalRevenue: number;
  averageDiscount: number;
  totalCars: number;
  topBrand: string;
  topBrandSales: number;
  recentSales: number;
}

export async function generateSoldCarsReport(cars: SoldCar[], summary: SalesSummary) {
  try {
    console.log("Starting report generation...");
    console.log("Number of cars:", cars.length);
    console.log("Summary data:", summary);

    if (!cars || cars.length === 0) {
      throw new Error("No sales data available to generate report");
    }

    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text("Auto Salon Sales Report", 14, 20);
    
    // Add date
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    
    // Remove the summary section from the PDF
    // Only add the detailed sales table
    doc.setFontSize(16);
    doc.text("Detailed Sales", 14, 45);
    
    const tableData = cars.map(car => [
      car.title || "N/A",
      car.brand || "N/A",
      car.year?.toString() || "N/A",
      `€${(car.originalPrice || 0).toFixed(2)}`,
      `€${(car.salePrice || 0).toFixed(2)}`,
      car.saleDate ? new Date(car.saleDate).toLocaleDateString() : "N/A",
      car.clientName || "N/A",
      car.clientEmail || "N/A"
    ]);
    
    console.log("Table data prepared:", tableData.length, "rows");
    
    autoTable(doc, {
      startY: 55,
      head: [['Vehicle', 'Brand', 'Year', 'Original Price', 'Sale Price', 'Sale Date', 'Client Name', 'Client Email']],
      body: tableData,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255
      }
    });
    
    console.log("PDF generated successfully");
    
    // Save the PDF
    const fileName = `sales-report-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    console.log("PDF saved as:", fileName);
    
    return true;
  } catch (error) {
    console.error("Error in generateSoldCarsReport:", error);
    throw new Error(`Failed to generate report: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
} 