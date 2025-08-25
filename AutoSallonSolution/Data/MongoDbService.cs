using AutoSallonSolution.Models;
using MongoDB.Driver;

namespace AutoSallonSolution.Data
{
    public class MongoDbService
    {
        private readonly IConfiguration _configuration;
        private readonly IMongoDatabase? _database;

        public MongoDbService(IConfiguration configuration)
        {
            _configuration = configuration;
            var connectionString = _configuration.GetConnectionString("MongoDbConnection");
            var mongoUrl = MongoUrl.Create(connectionString);
            var mongoClient = new MongoClient(mongoUrl);
            _database = mongoClient.GetDatabase(mongoUrl.DatabaseName);

            var ratingsCollection = _database.GetCollection<WebsiteRating>("WebsiteRatings");
            ratingsCollection.Indexes.CreateOne(
                new CreateIndexModel<WebsiteRating>(
                    Builders<WebsiteRating>.IndexKeys.Ascending(r => r.UserId),
                new CreateIndexOptions { Unique = false }

            ));
        }

        public IMongoDatabase? Database => _database;
    }
}
