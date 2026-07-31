# 🚀 Growsure Deployment & Production Guide

This guide details how to deploy the entire **Growsure** platform (Frontend, Backend API, and Database loaded with Kaggle Mutual Funds dataset) using Docker and Cloud hosting providers.

---

## 📊 1. Sourced Dataset Overview

The mutual funds database contains **814 active funds** sourced directly from the Kaggle dataset (`comprehensive_mutual_funds_data.csv`).

### Included Fields in Schema & APIs:
- **AMC Name** (e.g. SBI Mutual Fund, HDFC Mutual Fund, Quant Mutual Fund, etc.)
- **Category & Sub-Category** (e.g., Equity, Debt, Hybrid, Small Cap, Mid Cap, Large Cap, ELSS, Index, Arbitrage)
- **Star Rating** (1-5 Stars)
- **Minimum Investment Amounts** (Min SIP & Min Lumpsum)
- **Historical Returns** (1-Year, 3-Year, 5-Year Returns, CAGR %)
- **Risk Metrics** (Sortino, Alpha, Standard Deviation, Beta, Sharpe Ratio, Risk Score 1-6)
- **Fund Metadata** (AUM in Crores, Expense Ratio, Fund Manager, Fund Age in Years)

---

## 🐳 2. Quick Deploy with Docker Compose

The project includes pre-configured Dockerfiles and a `docker-compose.yml` file that orchestrates MySQL 8, .NET 8 Backend API, and Nginx Frontend.

### Prerequisites:
- Docker Desktop installed and running.

### Steps:
1. Clone / Navigate to the repository:
   ```bash
   cd growsure
   ```

2. (Optional) Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

3. Build and launch all services:
   ```bash
   docker compose up --build -d
   ```

4. Access the running platform:
   - **Frontend App**: `http://localhost`
   - **Backend API (Swagger Docs)**: `http://localhost:8081/swagger`
   - **MySQL Database**: `localhost:3306` (Database: `growsure`)

5. Stop all services:
   ```bash
   docker compose down
   ```

---

## ☁️ 3. Cloud Deployment Options

### A. Deploying Frontend (Vercel / Netlify / Cloudflare Pages)
1. Build command: `npm run build` inside `frontend/`.
2. Build output directory: `dist`.
3. Set environment variable `VITE_API_URL` to your backend URL (e.g., `https://api.yourdomain.com`).

### B. Deploying Backend (.NET 8 API)
- **Render / Railway / Fly.io**:
  - Deploy using Dockerfile at `backend-dotnet/Growsure.Api/Dockerfile`.
  - Set environment variables:
    - `ConnectionStrings__DefaultConnection`: MySQL connection string.
    - `JwtSettings__Secret`: Random 256-bit key.
    - `ASPNETCORE_ENVIRONMENT`: `Production`.
- **AWS (ECS / App Runner)**:
  - Push the container image to Amazon ECR and deploy to App Runner or ECS Task.

### C. Managed Database (AWS RDS / PlanetScale / DigitalOcean Managed DB)
1. Run `db/schema.sql` to initialize tables.
2. Run `db/seed.sql` to insert initial users, policies, and all 814 Kaggle mutual fund records.

---

## 🔒 4. Production Security & Best Practices

1. Change default passwords in `.env` (`MYSQL_ROOT_PASSWORD`, `MYSQL_PASSWORD`).
2. Generate a secure 256-bit JWT secret for `JWT_SECRET`.
3. Enable HTTPS / SSL certificates (e.g., via Let's Encrypt / Certbot / Nginx SSL proxy).

---

## 🛠️ 5. Default SeedTest User Credentials

| Role | Email | Password |
|---|---|---|
| Admin | `admin@growsure.com` | `password123` |
| Policy Holder | `amit@growsure.com` | `password123` |
| Policy Holder | `neha@growsure.com` | `password123` |
| Insurer | `partner@lic.com` | `password123` |
| Insurer | `partner@hdfcergo.com` | `password123` |
