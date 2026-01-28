-- Тестовые пользователи
INSERT INTO users (full_name, phone, email, password_hash, status, premium_level) VALUES
('Александр Иванов', '+79991234567', 'alex@example.com', '$2b$12$dummy_hash_1', 'active', 'premium'),
('Мария Петрова', '+79991234568', 'maria@example.com', '$2b$12$dummy_hash_2', 'active', 'premium'),
('Иван Сидоров', '+79991234569', 'ivan@example.com', '$2b$12$dummy_hash_3', 'pending', 'standard');

-- Счета пользователей
INSERT INTO accounts (user_id, account_type, balance, currency, interest_rate, status) VALUES
(1, 'main', 1247850.50, 'RUB', 0.00, 'active'),
(1, 'savings', 450000.00, 'RUB', 8.00, 'active'),
(2, 'main', 850000.00, 'RUB', 0.00, 'active'),
(3, 'main', 420000.00, 'RUB', 0.00, 'active');

-- Виртуальные карты
INSERT INTO cards (user_id, account_id, card_type, card_number, card_holder, expiry_date, cvv, balance, status) VALUES
(1, 1, 'МИР', '2200123456784892', 'ALEKSANDR IVANOV', '2027-12-31', '123', 247850.50, 'active'),
(1, 1, 'VISA', '4111111111117231', 'ALEKSANDR IVANOV', '2028-06-30', '456', 1000000.00, 'active'),
(1, 1, 'Mastercard', '5500000000005678', 'ALEKSANDR IVANOV', '2026-12-31', '789', 0.00, 'active'),
(2, 3, 'МИР', '2200123456785555', 'MARIA PETROVA', '2027-09-30', '321', 850000.00, 'active'),
(3, 4, 'МИР', '2200123456786666', 'IVAN SIDOROV', '2026-03-31', '654', 420000.00, 'active');

-- Транзакции
INSERT INTO transactions (user_id, account_id, card_id, transaction_type, amount, currency, description, category, status, recipient_name, created_at) VALUES
(1, 1, 1, 'expense', -12450.00, 'RUB', 'Покупка на Яндекс.Маркет', 'Покупки', 'completed', 'Яндекс.Маркет', NOW() - INTERVAL '0 days'),
(1, 1, 1, 'income', 150000.00, 'RUB', 'Зарплата', 'Доход', 'completed', 'ООО Компания', NOW() - INTERVAL '1 days'),
(1, 1, 1, 'expense', -5680.00, 'RUB', 'Покупка на Wildberries', 'Покупки', 'completed', 'Wildberries', NOW() - INTERVAL '2 days'),
(1, 1, 1, 'reward', 1250.00, 'RUB', 'Кэшбэк за покупки', 'Бонусы', 'completed', NULL, NOW() - INTERVAL '3 days'),
(2, 3, 4, 'expense', -25000.00, 'RUB', 'Оплата услуг', 'Платежи', 'completed', 'Коммунальные услуги', NOW() - INTERVAL '1 days'),
(3, 4, 5, 'income', 50000.00, 'RUB', 'Перевод от друга', 'Доход', 'pending', 'Друг', NOW() - INTERVAL '0 days');

-- Бонусы и поощрения
INSERT INTO rewards (user_id, reward_type, amount, description, expires_at, status) VALUES
(1, 'cashback', 12450.00, 'Накопленный кэшбэк', NOW() + INTERVAL '365 days', 'active'),
(1, 'bonus', 5000.00, 'Приветственный бонус', NOW() + INTERVAL '30 days', 'active'),
(2, 'cashback', 8500.00, 'Накопленный кэшбэк', NOW() + INTERVAL '365 days', 'active'),
(3, 'bonus', 2000.00, 'Реферальный бонус', NOW() + INTERVAL '60 days', 'active');
