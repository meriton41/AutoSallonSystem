﻿using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AutoSallonSolution.Migrations
{
    /// <inheritdoc />
    public partial class UniqueCarInsurancePerCar2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "CarId",
                table: "CarInsurances",
                type: "nvarchar(450)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.CreateIndex(
                name: "IX_CarInsurances_CarId",
                table: "CarInsurances",
                column: "CarId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_CarInsurances_CarId",
                table: "CarInsurances");

            migrationBuilder.AlterColumn<string>(
                name: "CarId",
                table: "CarInsurances",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");
        }
    }
}
