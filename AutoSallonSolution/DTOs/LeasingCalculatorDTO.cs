using System;

namespace AutoSallonSolution.DTOs
{
    public class LeasingCalculatorDTO
    {
        public int Id { get; set; }
        public string ClientName { get; set; }
        public int VehicleId { get; set; }
        public int LeaseTerm { get; set; }
        public decimal DownPayment { get; set; }
        public decimal InterestRate { get; set; }
        public decimal MonthlyPayment { get; set; }
        public DateTime StartDate { get; set; }
    }
}
