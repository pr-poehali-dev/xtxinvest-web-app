import json
import os
import psycopg2
from decimal import Decimal

def handler(event: dict, context) -> dict:
    '''API для пополнения накопительного счёта'''
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

    try:
        body = json.loads(event.get('body', '{}'))
    except json.JSONDecodeError:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Некорректный JSON'}),
            'isBase64Encoded': False
        }

    user_id = body.get('user_id')
    amount = body.get('amount')

    if not user_id or not amount:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Необходимы user_id и amount'}),
            'isBase64Encoded': False
        }

    try:
        amount = Decimal(str(amount))
        if amount <= 0:
            raise ValueError()
    except (ValueError, TypeError):
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Некорректная сумма'}),
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

        cur.execute(f"SELECT balance FROM accounts WHERE user_id = {user_id} AND account_type = 'checking'")
        checking_account = cur.fetchone()

        if not checking_account or Decimal(str(checking_account[0])) < amount:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Недостаточно средств на основном счёте'}),
                'isBase64Encoded': False
            }

        cur.execute(f"SELECT id, balance FROM savings_accounts WHERE user_id = {user_id}")
        savings = cur.fetchone()

        if not savings:
            cur.execute(
                f"INSERT INTO savings_accounts (user_id, balance, interest_rate) "
                f"VALUES ({user_id}, {amount}, 8.0) RETURNING id, balance"
            )
            savings = cur.fetchone()
        else:
            cur.execute(
                f"UPDATE savings_accounts SET balance = balance + {amount} WHERE user_id = {user_id} "
                f"RETURNING id, balance"
            )
            savings = cur.fetchone()

        cur.execute(
            f"UPDATE accounts SET balance = balance - {amount} WHERE user_id = {user_id} AND account_type = 'checking'"
        )

        cur.execute(
            f"INSERT INTO transactions (user_id, transaction_type, amount, description) "
            f"VALUES ({user_id}, 'expense', {amount}, 'Пополнение накопительного счёта')"
        )

        conn.commit()
        cur.close()
        conn.close()

        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'savings_account_id': savings[0],
                'new_balance': float(savings[1]),
                'deposited_amount': float(amount)
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
