-- Пользователи
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255),
    password_hash VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    premium_level VARCHAR(50) DEFAULT 'standard',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Счета пользователей
CREATE TABLE accounts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    account_type VARCHAR(50) NOT NULL,
    balance DECIMAL(15, 2) DEFAULT 0.00,
    currency VARCHAR(10) DEFAULT 'RUB',
    interest_rate DECIMAL(5, 2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Виртуальные карты
CREATE TABLE cards (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    account_id INTEGER REFERENCES accounts(id),
    card_type VARCHAR(50) NOT NULL,
    card_number VARCHAR(20) UNIQUE NOT NULL,
    card_holder VARCHAR(255) NOT NULL,
    expiry_date DATE NOT NULL,
    cvv VARCHAR(4) NOT NULL,
    balance DECIMAL(15, 2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Транзакции
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    account_id INTEGER REFERENCES accounts(id),
    card_id INTEGER REFERENCES cards(id),
    transaction_type VARCHAR(50) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'RUB',
    description VARCHAR(500),
    category VARCHAR(100),
    status VARCHAR(50) DEFAULT 'completed',
    recipient_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Бонусы и поощрения
CREATE TABLE rewards (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    reward_type VARCHAR(50) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    description VARCHAR(500),
    expires_at TIMESTAMP,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Настройки платёжных систем (для админки)
CREATE TABLE payment_systems (
    id SERIAL PRIMARY KEY,
    system_name VARCHAR(100) NOT NULL,
    system_type VARCHAR(50) NOT NULL,
    enabled BOOLEAN DEFAULT false,
    config JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для быстрого поиска
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_cards_user_id ON cards(user_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX idx_accounts_user_id ON accounts(user_id);

-- Вставка тестовых платёжных систем
INSERT INTO payment_systems (system_name, system_type, enabled, config) VALUES
('МИР', 'domestic', true, '{"commission": 0, "limits": {"daily": 500000, "monthly": 5000000}}'::jsonb),
('VISA / Mastercard', 'international', false, '{"commission": 1.5, "limits": {"daily": 300000, "monthly": 3000000}}'::jsonb),
('Крипто-интеграция', 'crypto', false, '{"supported_currencies": ["BTC", "ETH", "USDT"]}'::jsonb),
('Пользовательские', 'custom', false, '{}'::jsonb);
