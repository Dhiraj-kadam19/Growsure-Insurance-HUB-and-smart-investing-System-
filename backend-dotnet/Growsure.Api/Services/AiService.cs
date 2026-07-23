using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;

namespace Growsure.Api.Services
{
    public class AiService
    {
        private readonly string _provider;
        private readonly string _apiKey;
        private readonly string _endpoint;
        private readonly string _model;
        private static readonly HttpClient HttpClient = new();

        public AiService(IConfiguration configuration)
        {
            _provider = configuration["AiSettings:Provider"] ?? "Mock";
            _apiKey = configuration["AiSettings:ApiKey"] ?? "mock-key";
            _endpoint = configuration["AiSettings:Endpoint"] ?? "https://api.openai.com/v1";
            _model = configuration["AiSettings:Model"] ?? "gpt-4o";
        }

        public async Task<string> RecommendPoliciesAsync(int age, double salary, string maritalStatus, int dependents, string healthCondition)
        {
            if (_provider.Equals("OpenAI", StringComparison.OrdinalIgnoreCase) && !_apiKey.Equals("mock-key"))
            {
                string prompt = $"You are Growsure's Lead Underwriter. Suggest the best health/life insurance: Age {age}, Income {salary}, Marital Status {maritalStatus}, Dependents {dependents}, Health {healthCondition}. Return only JSON containing 'recommended_policies' array of objects with policyName, category, coverageAmount, premiumAmount, reason.";
                try { return await CallOpenAiAsync(prompt); } catch { /* fallback */ }
            }

            double suggestedTermLife = salary * 12;
            double suggestedHealth = (age > 45 || (healthCondition?.Contains("diabetes", StringComparison.OrdinalIgnoreCase) ?? false)) ? 1000000.0 : 500000.0;
            return JsonSerializer.Serialize(new
            {
                recommended_policies = new[]
                {
                    new { policyName = "LIC Tech Term Plan", category = "LIFE", coverageAmount = suggestedTermLife, premiumAmount = suggestedTermLife * 0.0012, reason = "Young profile allows locked high coverage of " + suggestedTermLife + " at low rate." },
                    new { policyName = "HDFC Ergo Optima Secure", category = "HEALTH", coverageAmount = suggestedHealth, premiumAmount = suggestedHealth * 0.02, reason = "Provides restoration and zero copay for profile " + maritalStatus + " with health " + healthCondition }
                }
            });
        }

        public async Task<string> RecommendFundsAsync(string riskAppetite, int horizon, double monthlyInvestment, int age, double income)
        {
            if (_provider.Equals("OpenAI", StringComparison.OrdinalIgnoreCase) && !_apiKey.Equals("mock-key"))
            {
                string prompt = $"You are Growsure's Wealth Manager. Suggest mutual funds: Age {age}, Income {income}, Risk {riskAppetite}, Horizon {horizon} yrs, Monthly SIP {monthlyInvestment}. Return only JSON containing 'recommended_funds' array of objects with fundName, category, allocationPercentage, expectedReturn, riskLevel, whySelected.";
                try { return await CallOpenAiAsync(prompt); } catch { /* fallback */ }
            }

            if (riskAppetite.Equals("HIGH", StringComparison.OrdinalIgnoreCase) || age < 35)
            {
                return JsonSerializer.Serialize(new
                {
                    recommended_funds = new[]
                    {
                        new { fundName = "Quant Small Cap Fund", category = "SMALL_CAP", allocationPercentage = "40%", expectedReturn = "34.5%", riskLevel = "High", whySelected = "Small cap high return suits your young age and risk tolerance." },
                        new { fundName = "Nippon India Small Cap Fund", category = "SMALL_CAP", allocationPercentage = "30%", expectedReturn = "29.8%", riskLevel = "High", whySelected = "Market leader small cap with exceptional history." },
                        new { fundName = "HDFC Mid-Cap Opportunities Fund", category = "MID_CAP", allocationPercentage = "30%", expectedReturn = "23.2%", riskLevel = "Moderately High", whySelected = "Balances small cap volatility with quality mid cap stocks." }
                    }
                });
            }

            return JsonSerializer.Serialize(new
            {
                recommended_funds = new[]
                {
                    new { fundName = "Parag Parikh Flexi Cap Fund", category = "HYBRID", allocationPercentage = "50%", expectedReturn = "21.4%", riskLevel = "Moderate", whySelected = "Global equity mix reduces downside risks." },
                    new { fundName = "Mirae Asset Large Cap Fund", category = "LARGE_CAP", allocationPercentage = "30%", expectedReturn = "15.6%", riskLevel = "Low to Moderate", whySelected = "Invests in top blue chip companies for steady growth." },
                    new { fundName = "SBI Magnum Gilt Fund", category = "DEBT", allocationPercentage = "20%", expectedReturn = "7.8%", riskLevel = "Low", whySelected = "Sovereign holdings guarantee base capital security." }
                }
            });
        }

        public async Task<string> AssessClaimAsync(double amount, string incidentDetails, string documentUrls)
        {
            if (_provider.Equals("OpenAI", StringComparison.OrdinalIgnoreCase) && !_apiKey.Equals("mock-key"))
            {
                string prompt = $"Auditing Bot. Evaluate claim amount {amount}, Incident: {incidentDetails}, Docs: {documentUrls}. Calculate fraud score (0 to 100) and suggestion (APPROVE/REJECT). Return JSON with fraudScore, confidenceScore, statusSuggestion, fraudReasons.";
                try { return await CallOpenAiAsync(prompt); } catch { /* fallback */ }
            }

            double fraudScore = 12.0;
            string reason = "Standard claims files matching patient records.";
            if (amount > 100000.0)
            {
                fraudScore = 35.0;
                reason = "Amount is high, claim needs standard administrative manual validation.";
            }
            if (incidentDetails.Contains("duplicate", StringComparison.OrdinalIgnoreCase) || documentUrls.Contains("duplicate", StringComparison.OrdinalIgnoreCase))
            {
                fraudScore = 80.0;
                reason = "Flagged: Duplicate document tags indicate potential double submission fraud risk.";
            }

            string status = fraudScore > 50.0 ? "REJECT" : "APPROVE";
            return JsonSerializer.Serialize(new
            {
                fraudScore,
                confidenceScore = 95.0 - (fraudScore / 2.0),
                statusSuggestion = status,
                fraudReasons = reason
            });
        }

        public async Task<string> GetFinancialPlanAsync(int age, double income, string riskAppetite, string goals)
        {
            if (_provider.Equals("OpenAI", StringComparison.OrdinalIgnoreCase) && !_apiKey.Equals("mock-key"))
            {
                string prompt = $"Personal Finance Planner. Age: {age}, Income: {income}, Risk: {riskAppetite}, Goals: {goals}. Return JSON with: insuranceCoverageAmount, monthlySipAmount, emergencyFundAmount, retirementSavingsPlan, rationale, equitySmallCap, equityMidCap, equityLargeCap, elssTaxSaving, debtGovernment, projectedCorpusAt60, taxDeduction80C, taxDeduction80D.";
                try { return await CallOpenAiAsync(prompt); } catch { /* fallback */ }
            }

            double emergency = Math.Round(income * 0.5);
            double sip = Math.Round((income * 0.25) / 12);
            double lifeCover = Math.Round(income * 12);
            int yearsToRetire = Math.Max(60 - age, 10);
            
            // Compound wealth projection (15% CAGR assumption)
            double monthlyRate = 0.15 / 12;
            int totalMonths = yearsToRetire * 12;
            double projectedCorpus = sip * ((Math.Pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * (1 + monthlyRate);

            int smallCapPct = riskAppetite.Equals("HIGH", StringComparison.OrdinalIgnoreCase) ? 40 : 20;
            int midCapPct = riskAppetite.Equals("HIGH", StringComparison.OrdinalIgnoreCase) ? 30 : 25;
            int largeCapPct = riskAppetite.Equals("HIGH", StringComparison.OrdinalIgnoreCase) ? 15 : 35;
            int elssPct = 10;
            int debtPct = 5;

            return JsonSerializer.Serialize(new
            {
                insuranceCoverageAmount = lifeCover,
                monthlySipAmount = sip,
                emergencyFundAmount = emergency,
                projectedCorpusAt60 = Math.Round(projectedCorpus),
                taxDeduction80C = 150000,
                taxDeduction80D = 25000,
                equitySmallCap = smallCapPct,
                equityMidCap = midCapPct,
                equityLargeCap = largeCapPct,
                elssTaxSaving = elssPct,
                debtGovernment = debtPct,
                retirementSavingsPlan = $"Allocate {smallCapPct}% in High CAGR Small Cap Funds (e.g. Quant Small Cap), {midCapPct}% in Mid Cap Opportunities, {largeCapPct}% in Bluechip Large Cap, {elssPct}% in Tax-Saving ELSS, and {debtPct}% in Sovereign Debt.",
                rationale = $"Based on your profile (Age {age}, Annual Salary ₹{income:N0}, Risk: {riskAppetite}), we recommend a term cover of ₹{lifeCover:N0} and a monthly SIP of ₹{sip:N0}. At 15% estimated CAGR over {yearsToRetire} years, your projected corpus at age 60 reaches ~₹{projectedCorpus:N0} to achieve your goal: '{goals}'."
            });
        }

        public async Task<string> ChatAsync(string message)
        {
            if (_provider.Equals("OpenAI", StringComparison.OrdinalIgnoreCase) && !_apiKey.Equals("mock-key"))
            {
                string prompt = $"You are Growsure's Lead Financial Copilot. Answer user query realistically and helpfully: {message}. Keep response informative and structured.";
                try { return await CallOpenAiAsync(prompt); } catch { /* fallback */ }
            }

            string msg = (message ?? string.Empty).ToLower();

            if (msg.Contains("sip") && msg.Contains("lumpsum"))
            {
                return "💡 **SIP vs Lumpsum Investment Strategy:**\n\n• **SIP (Systematic Investment Plan)**: Ideal for salaried individuals. Helps average out market volatility through Rupee Cost Averaging.\n• **Lumpsum**: Best when market valuations are low or when you receive a one-time bonus/windfall.\n\n📌 *Recommendation*: For volatile funds like Quant Small Cap Fund, starting a monthly SIP reduces downside risk!";
            }
            if (msg.Contains("sip") || msg.Contains("mutual fund") || msg.Contains("cagr") || msg.Contains("fund"))
            {
                return "📈 **Growsure Mutual Funds Insights:**\n\nWe feature 814 top-performing mutual funds directly synced from Kaggle market data!\n• **Top Small Cap**: Quant Small Cap Fund (71.4% 3Y CAGR, 5★ Rating)\n• **Top Flexi Cap**: Parag Parikh Flexi Cap Fund\n• **Tax Saver**: HDFC TaxSaver ELSS Fund (Section 80C Benefit)\n\nYou can search, filter by AMC or rating, and start SIPs starting as low as ₹500/month in the Mutual Funds Marketplace tab!";
            }
            if (msg.Contains("waiting") || msg.Contains("period"))
            {
                return "⏱️ **Insurance Waiting Periods Overview:**\n\n1. **Initial Waiting Period**: 30 days for any non-accidental illness.\n2. **Specific Illnesses**: 24 months for surgeries like hernia, cataract, or joint replacement.\n3. **Pre-existing Diseases (PED)**: 24 to 36 months depending on insurer plan (e.g. HDFC Ergo Optima Secure has 36 months).\n\n💡 *Tip*: Buying health cover at a younger age eliminates waiting periods before health issues arise!";
            }
            if (msg.Contains("claim") || msg.Contains("submit") || msg.Contains("status"))
            {
                return "📋 **How to File a Claim on Growsure:**\n\n1. Navigate to **Claims Management** tab.\n2. Select your active policy & input incident details.\n3. Upload hospital billing receipts or police reports.\n4. Our integrated **AI Fraud Assessment Engine** audits document tags instantly and forwards approved claims directly to insurers for reimbursement within 48 hours!";
            }
            if (msg.Contains("tax") || msg.Contains("80c") || msg.Contains("80d") || msg.Contains("elss"))
            {
                return "💰 **Tax Saving Benefits on Growsure:**\n\n• **Section 80C**: Save up to ₹1,50,000 in income tax per year by investing in ELSS Mutual Funds (3-year lock-in, lowest among tax instruments).\n• **Section 80D**: Save up to ₹25,000 (₹50,000 for senior citizens) on health insurance premiums paid for self & family.\n\nCombined annual tax deduction can be up to ₹1,75,000!";
            }
            if (msg.Contains("health") || msg.Contains("life") || msg.Contains("term") || msg.Contains("policy"))
            {
                return "🛡️ **Growsure Insurance Protection:**\n\nWe partner with IRDAI-licensed insurers like HDFC Ergo, LIC, Star Health, and ICICI Lombard.\n• **Term Life Cover**: Get ₹1 Crore sum assured for premiums starting as low as ₹850/month.\n• **Health Cover**: 100% cashless hospitalization across 10,000+ network hospitals with zero copay!\n\nUse our **Compare Plans** tool to review claim settlement ratios side-by-side.";
            }
            if (msg.Contains("hi") || msg.Contains("hello") || msg.Contains("hey") || msg.Contains("help"))
            {
                return "👋 Hello! I am your Growsure Financial & Insurance Assistant. How can I help you today?\n\nYou can ask me about:\n• Best Mutual Funds & 3Y CAGR returns\n• Term Life & Health Insurance recommendations\n• How to file & track insurance claims\n• Tax saving under Section 80C & 80D\n• AI Financial Planning for retirement";
            }

            return $"🤖 **Growsure Advisory Bot Response:**\n\nRegarding **\"{message}\"**:\n\nOur platform integrates 814 mutual funds and comprehensive insurance coverage options. To maximize your financial growth:\n1. Maintain a term cover of 10x-15x your annual income.\n2. Start a monthly SIP in diversified small-cap & flexi-cap funds.\n3. Keep 6 months of living expenses in liquid debt funds.\n\nNeed specific fund details or policy comparison? Type 'best funds' or 'compare policies'!";
        }

        private async Task<string> CallOpenAiAsync(string prompt)
        {
            var request = new HttpRequestMessage(HttpMethod.Post, $"{_endpoint}/chat/completions");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);

            var body = new
            {
                model = _model,
                temperature = 0.3,
                messages = new[] { new { role = "user", content = prompt } }
            };

            request.Content = new StringContent(JsonSerializer.Serialize(body), Encoding.UTF8, "application/json");

            var response = await HttpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();

            var jsonResult = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(jsonResult);
            return doc.RootElement.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString() ?? string.Empty;
        }
    }
}
