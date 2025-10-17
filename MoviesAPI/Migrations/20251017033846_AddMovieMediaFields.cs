using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MoviesAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddMovieMediaFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "revenue",
                table: "movies",
                type: "numeric(15,2)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "screenshots",
                table: "movies",
                type: "jsonb",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "trailer_url",
                table: "movies",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "revenue",
                table: "movies");

            migrationBuilder.DropColumn(
                name: "screenshots",
                table: "movies");

            migrationBuilder.DropColumn(
                name: "trailer_url",
                table: "movies");
        }
    }
}
