namespace AutoSallonSolution.DTOs
{
    public class CreateOrderDTO
    {
        public int VehicleId { get; set; }
        public string? ShippingAddress { get; set; }
        public string? ShippingMethod { get; set; }
        public string? UserNotes { get; set; }
    }

    public class UpdateOrderDTO
    {
        public string Status { get; set; }
        public string? AdminNotes { get; set; }
        public DateTime? EstimatedDeliveryDate { get; set; }
    }

    public class OrderResponseDTO
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public string UserName { get; set; }
        public int VehicleId { get; set; }
        public string VehicleName { get; set; }
        public string VehicleImage { get; set; }
        public decimal TotalAmount { get; set; }
        public DateTime OrderDate { get; set; }
        public string Status { get; set; }
        public string? PaymentMethod { get; set; }
        public string? PaymentStatus { get; set; }
        public DateTime? PaymentDate { get; set; }
        public string? ShippingAddress { get; set; }
        public string? ShippingMethod { get; set; }
        public DateTime? EstimatedDeliveryDate { get; set; }
        public string? AdminNotes { get; set; }
        public string? UserNotes { get; set; }
        public DateTime? AdminActionDate { get; set; }
        public string? AdminActionBy { get; set; }
        public bool IsActive { get; set; }
        public DateTime? CancellationDate { get; set; }
        public string? CancellationReason { get; set; }
    }

    public class OrderStatusUpdateDTO
    {
        public string Status { get; set; }
        public string? Notes { get; set; }
    }

    public class CancelOrderDTO
    {
        public string CancellationReason { get; set; }
    }
} 