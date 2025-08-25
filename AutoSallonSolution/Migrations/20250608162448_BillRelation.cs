using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AutoSallonSolution.Migrations
{
    /// <inheritdoc />
    public partial class BillRelation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CarId",
                table: "Bills");

            migrationBuilder.AddColumn<int>(
                name: "VehicleId",
                table: "Bills",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Bills_VehicleId",
                table: "Bills",
                column: "VehicleId");

            migrationBuilder.AddForeignKey(
                name: "FK_Bills_Vehicles_VehicleId",
                table: "Bills",
                column: "VehicleId",
                principalTable: "Vehicles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Bills_Vehicles_VehicleId",
                table: "Bills");

            migrationBuilder.DropIndex(
                name: "IX_Bills_VehicleId",
                table: "Bills");

            migrationBuilder.DropColumn(
                name: "VehicleId",
                table: "Bills");

            migrationBuilder.AddColumn<string>(
                name: "CarId",
                table: "Bills",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }
    }
}
