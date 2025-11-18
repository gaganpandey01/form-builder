using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FormBuilderApi.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:PostgresExtension:uuid-ossp", ",,");

            migrationBuilder.CreateTable(
                name: "Forms",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastModified = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Forms", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "FormFields",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FormId = table.Column<Guid>(type: "uuid", nullable: false),
                    Type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Label = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Placeholder = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Required = table.Column<bool>(type: "boolean", nullable: false),
                    Order = table.Column<int>(type: "integer", nullable: false),
                    ValidationRules = table.Column<string>(type: "jsonb", nullable: true),
                    Options = table.Column<string>(type: "jsonb", nullable: true),
                    ConditionalLogic = table.Column<string>(type: "jsonb", nullable: true),
                    Metadata = table.Column<string>(type: "jsonb", nullable: true),
                    ParentId = table.Column<Guid>(type: "uuid", nullable: true),
                    Depth = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FormFields", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FormFields_FormFields_ParentId",
                        column: x => x.ParentId,
                        principalTable: "FormFields",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_FormFields_Forms_FormId",
                        column: x => x.FormId,
                        principalTable: "Forms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FormResponses",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FormId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserIdentifier = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    ResponseData = table.Column<string>(type: "jsonb", nullable: false),
                    SubmittedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FormResponses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FormResponses_Forms_FormId",
                        column: x => x.FormId,
                        principalTable: "Forms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FormSettings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FormId = table.Column<Guid>(type: "uuid", nullable: false),
                    AllowMultipleResponses = table.Column<bool>(type: "boolean", nullable: false),
                    CloseType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    CloseDateTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CustomCloseTime = table.Column<int>(type: "integer", nullable: true),
                    IsClosed = table.Column<bool>(type: "boolean", nullable: false),
                    IsMultiStep = table.Column<bool>(type: "boolean", nullable: false),
                    StepsPerPage = table.Column<int>(type: "integer", nullable: false),
                    ShowProgressBar = table.Column<bool>(type: "boolean", nullable: false),
                    SubmitButtonText = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    SuccessMessage = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Theme = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastModified = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FormSettings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FormSettings_Forms_FormId",
                        column: x => x.FormId,
                        principalTable: "Forms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_FormFields_FormId_Order",
                table: "FormFields",
                columns: new[] { "FormId", "Order" });

            migrationBuilder.CreateIndex(
                name: "IX_FormFields_ParentId",
                table: "FormFields",
                column: "ParentId");

            migrationBuilder.CreateIndex(
                name: "IX_FormFields_Type",
                table: "FormFields",
                column: "Type");

            migrationBuilder.CreateIndex(
                name: "IX_FormResponses_FormId",
                table: "FormResponses",
                column: "FormId");

            migrationBuilder.CreateIndex(
                name: "IX_FormResponses_SubmittedAt",
                table: "FormResponses",
                column: "SubmittedAt");

            migrationBuilder.CreateIndex(
                name: "IX_FormResponses_UserIdentifier",
                table: "FormResponses",
                column: "UserIdentifier");

            migrationBuilder.CreateIndex(
                name: "IX_Forms_CreatedAt",
                table: "Forms",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Forms_Title",
                table: "Forms",
                column: "Title");

            migrationBuilder.CreateIndex(
                name: "IX_FormSettings_FormId",
                table: "FormSettings",
                column: "FormId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "FormFields");

            migrationBuilder.DropTable(
                name: "FormResponses");

            migrationBuilder.DropTable(
                name: "FormSettings");

            migrationBuilder.DropTable(
                name: "Forms");
        }
    }
}
