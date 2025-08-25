using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace AutoSallonSolution.Models
{
    public class WebsiteRating
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("userId")]
        public required string UserId { get; set; }

        [BsonElement("value")]
        public int Value { get; set; }

        [BsonElement("comment")]
        public string? Comment { get; set; }

        [BsonElement("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
