-- Growsure Database Schema
CREATE DATABASE IF NOT EXISTS growsure;
USE growsure;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- POLICY_HOLDER, INSURER, ADMIN
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Policy Holders Table
CREATE TABLE IF NOT EXISTS policy_holders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    aadhaar VARCHAR(12) UNIQUE,
    pan VARCHAR(10) UNIQUE,
    dob DATE,
    contact VARCHAR(15),
    address TEXT,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Insurers Table
CREATE TABLE IF NOT EXISTS insurers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    license_number VARCHAR(100) NOT NULL UNIQUE,
    company_name VARCHAR(255) NOT NULL,
    address TEXT,
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Policies Table
CREATE TABLE IF NOT EXISTS policies (
    policy_id INT AUTO_INCREMENT PRIMARY KEY,
    insurer_id INT NOT NULL,
    policy_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL, -- HEALTH, LIFE, MOTOR, TRAVEL
    coverage_amount DOUBLE NOT NULL,
    premium_amount DOUBLE NOT NULL,
    benefits TEXT, -- stored as JSON or descriptive text
    exclusions TEXT, -- stored as JSON or descriptive text
    waiting_period_months INT DEFAULT 0,
    claim_settlement_ratio DOUBLE DEFAULT 90.0,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (insurer_id) REFERENCES insurers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Purchased Policies Table
CREATE TABLE IF NOT EXISTS purchased_policies (
    purchase_id INT AUTO_INCREMENT PRIMARY KEY,
    policy_holder_id INT NOT NULL,
    policy_id INT NOT NULL,
    start_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    end_date DATETIME NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, LAPSED, EXPIRED
    policy_number VARCHAR(100) NOT NULL UNIQUE,
    FOREIGN KEY (policy_holder_id) REFERENCES policy_holders(id) ON DELETE CASCADE,
    FOREIGN KEY (policy_id) REFERENCES policies(policy_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Nominees Table
CREATE TABLE IF NOT EXISTS nominees (
    nominee_id INT AUTO_INCREMENT PRIMARY KEY,
    purchase_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    relationship VARCHAR(100) NOT NULL,
    contact VARCHAR(15),
    FOREIGN KEY (purchase_id) REFERENCES purchased_policies(purchase_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Claims Table
CREATE TABLE IF NOT EXISTS claims (
    claim_id INT AUTO_INCREMENT PRIMARY KEY,
    purchase_id INT NOT NULL,
    claim_amount DOUBLE NOT NULL,
    status VARCHAR(50) DEFAULT 'SUBMITTED', -- SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED
    incident_details TEXT,
    document_urls TEXT, -- JSON array string of document paths
    fraud_score DOUBLE DEFAULT 0.0,
    fraud_reasons TEXT, -- descriptive reason for fraud score
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (purchase_id) REFERENCES purchased_policies(purchase_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    order_id VARCHAR(255) NOT NULL,
    payment_id VARCHAR(255),
    amount DOUBLE NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, SUCCESS, FAILED
    payment_type VARCHAR(100) NOT NULL, -- POLICY_PREMIUM, MUTUAL_FUND_SIP, MUTUAL_FUND_LUMPSUM
    reference_id INT, -- purchased_policy_id or investment_id
    transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. Funds Table
CREATE TABLE IF NOT EXISTS funds (
    fund_id INT AUTO_INCREMENT PRIMARY KEY,
    fund_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL, -- Equity, Debt, Hybrid, Solution Oriented, Other
    sub_category VARCHAR(150),
    amc_name VARCHAR(255),
    min_sip DOUBLE DEFAULT 500,
    min_lumpsum DOUBLE DEFAULT 1000,
    risk_score INT DEFAULT 3, -- 1 to 6
    cagr DOUBLE NOT NULL,
    returns_1yr DOUBLE DEFAULT 0.0,
    returns_3yr DOUBLE DEFAULT 0.0,
    returns_5yr DOUBLE DEFAULT 0.0,
    expense_ratio DOUBLE NOT NULL,
    aum_crores DOUBLE NOT NULL,
    fund_age_yr INT DEFAULT 0,
    fund_manager VARCHAR(255),
    rating INT DEFAULT 3,
    sortino DOUBLE NULL,
    alpha DOUBLE NULL,
    sd DOUBLE NULL,
    beta DOUBLE NULL,
    sharpe DOUBLE NULL,
    historical_returns TEXT -- JSON representation of annual/monthly returns
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. Investments Table
CREATE TABLE IF NOT EXISTS investments (
    investment_id INT AUTO_INCREMENT PRIMARY KEY,
    policy_holder_id INT NOT NULL,
    fund_id INT NOT NULL,
    investment_amount DOUBLE NOT NULL,
    sip_amount DOUBLE DEFAULT 0.0,
    investment_type VARCHAR(50) NOT NULL, -- SIP, LUMPSUM
    day_of_month INT DEFAULT 5,
    start_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, COMPLETED
    FOREIGN KEY (policy_holder_id) REFERENCES policy_holders(id) ON DELETE CASCADE,
    FOREIGN KEY (fund_id) REFERENCES funds(fund_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. AI Recommendations Table
CREATE TABLE IF NOT EXISTS ai_recommendations (
    recommendation_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    recommendation_type VARCHAR(100) NOT NULL, -- POLICY, FUND, FINANCIAL_PLAN
    input_criteria TEXT, -- JSON criteria supplied to AI
    output_recommendation TEXT, -- JSON response from AI
    generated_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 12. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    action VARCHAR(255) NOT NULL,
    details TEXT,
    ip_address VARCHAR(100),
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
