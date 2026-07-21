using System;
using Microsoft.EntityFrameworkCore.Migrations;
using MySql.EntityFrameworkCore.Metadata;

#nullable disable

namespace Growsure.Api.Migrations
{
    /// <inheritdoc />
    public partial class FirstMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "funds",
                columns: table => new
                {
                    fund_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    fund_name = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: false),
                    Category = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false),
                    risk_score = table.Column<int>(type: "int", nullable: false),
                    cagr = table.Column<double>(type: "double", nullable: false),
                    expense_ratio = table.Column<double>(type: "double", nullable: false),
                    aum_crores = table.Column<double>(type: "double", nullable: false),
                    fund_manager = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: true),
                    historical_returns = table.Column<string>(type: "longtext", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_funds", x => x.fund_id);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "users",
                columns: table => new
                {
                    user_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    Name = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: false),
                    Email = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: false),
                    Password = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: false),
                    Role = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_users", x => x.user_id);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "ai_recommendations",
                columns: table => new
                {
                    recommendation_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    user_id = table.Column<int>(type: "int", nullable: false),
                    recommendation_type = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false),
                    input_criteria = table.Column<string>(type: "longtext", nullable: true),
                    output_recommendation = table.Column<string>(type: "longtext", nullable: true),
                    generated_date = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ai_recommendations", x => x.recommendation_id);
                    table.ForeignKey(
                        name: "FK_ai_recommendations_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "audit_logs",
                columns: table => new
                {
                    log_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    user_id = table.Column<int>(type: "int", nullable: true),
                    Action = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: false),
                    Details = table.Column<string>(type: "longtext", nullable: true),
                    ip_address = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true),
                    timestamp = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_audit_logs", x => x.log_id);
                    table.ForeignKey(
                        name: "FK_audit_logs_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "user_id");
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "insurers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    user_id = table.Column<int>(type: "int", nullable: false),
                    license_number = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false),
                    company_name = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: false),
                    Address = table.Column<string>(type: "longtext", nullable: true),
                    Status = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_insurers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_insurers_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "policy_holders",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    user_id = table.Column<int>(type: "int", nullable: false),
                    Aadhaar = table.Column<string>(type: "varchar(12)", maxLength: 12, nullable: true),
                    Pan = table.Column<string>(type: "varchar(10)", maxLength: 10, nullable: true),
                    Dob = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    Contact = table.Column<string>(type: "varchar(15)", maxLength: 15, nullable: true),
                    Address = table.Column<string>(type: "longtext", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_policy_holders", x => x.Id);
                    table.ForeignKey(
                        name: "FK_policy_holders_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "transactions",
                columns: table => new
                {
                    transaction_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    user_id = table.Column<int>(type: "int", nullable: false),
                    order_id = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: false),
                    payment_id = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: true),
                    amount = table.Column<double>(type: "double", nullable: false),
                    Status = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false),
                    payment_type = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false),
                    reference_id = table.Column<int>(type: "int", nullable: true),
                    transaction_date = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_transactions", x => x.transaction_id);
                    table.ForeignKey(
                        name: "FK_transactions_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "policies",
                columns: table => new
                {
                    policy_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    insurer_id = table.Column<int>(type: "int", nullable: false),
                    policy_name = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: false),
                    Category = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false),
                    coverage_amount = table.Column<double>(type: "double", nullable: false),
                    premium_amount = table.Column<double>(type: "double", nullable: false),
                    Benefits = table.Column<string>(type: "longtext", nullable: true),
                    Exclusions = table.Column<string>(type: "longtext", nullable: true),
                    waiting_period_months = table.Column<int>(type: "int", nullable: false),
                    claim_settlement_ratio = table.Column<double>(type: "double", nullable: false),
                    is_active = table.Column<bool>(type: "tinyint(1)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_policies", x => x.policy_id);
                    table.ForeignKey(
                        name: "FK_policies_insurers_insurer_id",
                        column: x => x.insurer_id,
                        principalTable: "insurers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "investments",
                columns: table => new
                {
                    investment_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    policy_holder_id = table.Column<int>(type: "int", nullable: false),
                    fund_id = table.Column<int>(type: "int", nullable: false),
                    investment_amount = table.Column<double>(type: "double", nullable: false),
                    sip_amount = table.Column<double>(type: "double", nullable: false),
                    investment_type = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false),
                    day_of_month = table.Column<int>(type: "int", nullable: false),
                    start_date = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    Status = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_investments", x => x.investment_id);
                    table.ForeignKey(
                        name: "FK_investments_funds_fund_id",
                        column: x => x.fund_id,
                        principalTable: "funds",
                        principalColumn: "fund_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_investments_policy_holders_policy_holder_id",
                        column: x => x.policy_holder_id,
                        principalTable: "policy_holders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "purchased_policies",
                columns: table => new
                {
                    purchase_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    policy_holder_id = table.Column<int>(type: "int", nullable: false),
                    policy_id = table.Column<int>(type: "int", nullable: false),
                    start_date = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    end_date = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    Status = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false),
                    policy_number = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_purchased_policies", x => x.purchase_id);
                    table.ForeignKey(
                        name: "FK_purchased_policies_policies_policy_id",
                        column: x => x.policy_id,
                        principalTable: "policies",
                        principalColumn: "policy_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_purchased_policies_policy_holders_policy_holder_id",
                        column: x => x.policy_holder_id,
                        principalTable: "policy_holders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "claims",
                columns: table => new
                {
                    claim_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    purchase_id = table.Column<int>(type: "int", nullable: false),
                    claim_amount = table.Column<double>(type: "double", nullable: false),
                    Status = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false),
                    incident_details = table.Column<string>(type: "longtext", nullable: true),
                    document_urls = table.Column<string>(type: "longtext", nullable: true),
                    fraud_score = table.Column<double>(type: "double", nullable: false),
                    fraud_reasons = table.Column<string>(type: "longtext", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_claims", x => x.claim_id);
                    table.ForeignKey(
                        name: "FK_claims_purchased_policies_purchase_id",
                        column: x => x.purchase_id,
                        principalTable: "purchased_policies",
                        principalColumn: "purchase_id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "nominees",
                columns: table => new
                {
                    nominee_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    purchase_id = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: false),
                    Relationship = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false),
                    Contact = table.Column<string>(type: "varchar(15)", maxLength: 15, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_nominees", x => x.nominee_id);
                    table.ForeignKey(
                        name: "FK_nominees_purchased_policies_purchase_id",
                        column: x => x.purchase_id,
                        principalTable: "purchased_policies",
                        principalColumn: "purchase_id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_ai_recommendations_user_id",
                table: "ai_recommendations",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_audit_logs_user_id",
                table: "audit_logs",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_claims_purchase_id",
                table: "claims",
                column: "purchase_id");

            migrationBuilder.CreateIndex(
                name: "IX_insurers_user_id",
                table: "insurers",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_investments_fund_id",
                table: "investments",
                column: "fund_id");

            migrationBuilder.CreateIndex(
                name: "IX_investments_policy_holder_id",
                table: "investments",
                column: "policy_holder_id");

            migrationBuilder.CreateIndex(
                name: "IX_nominees_purchase_id",
                table: "nominees",
                column: "purchase_id");

            migrationBuilder.CreateIndex(
                name: "IX_policies_insurer_id",
                table: "policies",
                column: "insurer_id");

            migrationBuilder.CreateIndex(
                name: "IX_policy_holders_user_id",
                table: "policy_holders",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_purchased_policies_policy_holder_id",
                table: "purchased_policies",
                column: "policy_holder_id");

            migrationBuilder.CreateIndex(
                name: "IX_purchased_policies_policy_id",
                table: "purchased_policies",
                column: "policy_id");

            migrationBuilder.CreateIndex(
                name: "IX_transactions_user_id",
                table: "transactions",
                column: "user_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ai_recommendations");

            migrationBuilder.DropTable(
                name: "audit_logs");

            migrationBuilder.DropTable(
                name: "claims");

            migrationBuilder.DropTable(
                name: "investments");

            migrationBuilder.DropTable(
                name: "nominees");

            migrationBuilder.DropTable(
                name: "transactions");

            migrationBuilder.DropTable(
                name: "funds");

            migrationBuilder.DropTable(
                name: "purchased_policies");

            migrationBuilder.DropTable(
                name: "policies");

            migrationBuilder.DropTable(
                name: "policy_holders");

            migrationBuilder.DropTable(
                name: "insurers");

            migrationBuilder.DropTable(
                name: "users");
        }
    }
}
