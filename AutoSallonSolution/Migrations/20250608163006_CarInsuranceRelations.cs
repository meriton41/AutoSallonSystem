using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AutoSallonSolution.Migrations
{
    /// <inheritdoc />
    public partial class CarInsuranceRelations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_CarInsurances_CarId",
                table: "CarInsurances");

            migrationBuilder.DropColumn(
                name: "CarId",
                table: "CarInsurances");

            migrationBuilder.AddColumn<int>(
                name: "VehicleId",
                table: "CarInsurances",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_CarInsurances_VehicleId",
                table: "CarInsurances",
                column: "VehicleId");

            migrationBuilder.AddForeignKey(
                name: "FK_CarInsurances_Vehicles_VehicleId",
                table: "CarInsurances",
                column: "VehicleId",
                principalTable: "Vehicles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CarInsurances_Vehicles_VehicleId",
                table: "CarInsurances");

            migrationBuilder.DropIndex(
                name: "IX_CarInsurances_VehicleId",
                table: "CarInsurances");

            migrationBuilder.DropColumn(
                name: "VehicleId",
                table: "CarInsurances");

            migrationBuilder.AddColumn<string>(
                name: "CarId",
                table: "CarInsurances",
                type: "nvarchar(450)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_CarInsurances_CarId",
                table: "CarInsurances",
                column: "CarId",
                unique: true);
        }
    }
}
