-- Создание таблицы для переводов между пользователями
CREATE TABLE IF NOT EXISTS transfers (
  id SERIAL PRIMARY KEY,
  sender_id INTEGER NOT NULL,
  recipient_id INTEGER NOT NULL,
  amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
  description TEXT,
  status VARCHAR(20) DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_sender FOREIGN KEY (sender_id) REFERENCES users(id),
  CONSTRAINT fk_recipient FOREIGN KEY (recipient_id) REFERENCES users(id)
);

-- Создание таблицы для кэшбэка
CREATE TABLE IF NOT EXISTS cashback (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  transaction_id INTEGER,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
  percentage DECIMAL(5, 2) DEFAULT 5.0,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_cashback FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Создание таблицы для накопительного счёта
CREATE TABLE IF NOT EXISTS savings_accounts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE,
  balance DECIMAL(12, 2) DEFAULT 0.00 CHECK (balance >= 0),
  interest_rate DECIMAL(5, 2) DEFAULT 8.0,
  total_earned DECIMAL(12, 2) DEFAULT 0.00,
  last_interest_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_savings FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Создание таблицы для истории начисления процентов
CREATE TABLE IF NOT EXISTS interest_history (
  id SERIAL PRIMARY KEY,
  savings_account_id INTEGER NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  rate DECIMAL(5, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_savings_account FOREIGN KEY (savings_account_id) REFERENCES savings_accounts(id)
);

-- Индексы для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_transfers_sender ON transfers(sender_id);
CREATE INDEX IF NOT EXISTS idx_transfers_recipient ON transfers(recipient_id);
CREATE INDEX IF NOT EXISTS idx_transfers_created ON transfers(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cashback_user ON cashback(user_id);
CREATE INDEX IF NOT EXISTS idx_cashback_created ON cashback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_savings_user ON savings_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_interest_history_account ON interest_history(savings_account_id);