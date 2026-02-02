import json
import os
import psycopg2
from decimal import Decimal
from datetime import datetime, timedelta

def handler(event: dict, context) -> dict:
    '''API для автоматического начисления процентов по накопительным счетам'''
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': '',
            'isBase64Encoded': False
        }

    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Метод не разрешён'}),
            'isBase64Encoded': False
        }

    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'DATABASE_URL не настроен'}),
            'isBase64Encoded': False
        }

    try:
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()

        cur.execute(
            "SELECT id, user_id, balance, interest_rate, last_interest_date "
            "FROM savings_accounts WHERE balance > 0"
        )
        
        accounts = cur.fetchall()
        processed_count = 0
        total_interest = Decimal('0')

        for account in accounts:
            account_id = account[0]
            user_id = account[1]
            balance = Decimal(str(account[2]))
            rate = Decimal(str(account[3]))
            last_interest_date = account[4]

            current_date = datetime.now()
            
            if last_interest_date:
                days_since = (current_date - last_interest_date).days
            else:
                days_since = 30

            if days_since >= 30:
                daily_rate = rate / Decimal('365') / Decimal('100')
                interest = (balance * daily_rate * Decimal(str(days_since))).quantize(Decimal('0.01'))

                if interest > 0:
                    cur.execute(
                        f"UPDATE savings_accounts SET balance = balance + {interest}, "
                        f"total_earned = total_earned + {interest}, "
                        f"last_interest_date = CURRENT_TIMESTAMP "
                        f"WHERE id = {account_id}"
                    )

                    cur.execute(
                        f"INSERT INTO interest_history (savings_account_id, amount, rate) "
                        f"VALUES ({account_id}, {interest}, {rate})"
                    )

                    cur.execute(
                        f"INSERT INTO transactions (user_id, transaction_type, amount, description) "
                        f"VALUES ({user_id}, 'reward', {interest}, 'Проценты по накопительному счёту')"
                    )

                    processed_count += 1
                    total_interest += interest

        conn.commit()
        cur.close()
        conn.close()

        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'processed_accounts': processed_count,
                'total_interest_paid': float(total_interest)
            }),
            'isBase64Encoded': False
        }

    except Exception as e:
        if 'conn' in locals():
            conn.rollback()
            conn.close()
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Ошибка сервера: {str(e)}'}),
            'isBase64Encoded': False
        }
