import json
import os
import psycopg2
from decimal import Decimal

def handler(event: dict, context) -> dict:
    '''API для начисления кэшбэка пользователям'''
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
    transaction_amount = body.get('transaction_amount')
    percentage = body.get('percentage', 5.0)

    if not user_id or not transaction_amount:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Необходимы user_id и transaction_amount'}),
            'isBase64Encoded': False
        }

    try:
        transaction_amount = Decimal(str(transaction_amount))
        percentage = Decimal(str(percentage))
        if transaction_amount <= 0 or percentage < 0:
            raise ValueError()
    except (ValueError, TypeError):
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Некорректные параметры'}),
            'isBase64Encoded': False
        }

    cashback_amount = (transaction_amount * percentage / 100).quantize(Decimal('0.01'))

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

        cur.execute(f"SELECT id FROM users WHERE id = {user_id}")
        if not cur.fetchone():
            cur.close()
            conn.close()
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Пользователь не найден'}),
                'isBase64Encoded': False
            }

        cur.execute(
            f"INSERT INTO cashback (user_id, amount, percentage, description) "
            f"VALUES ({user_id}, {cashback_amount}, {percentage}, 'Кэшбэк {percentage}%') "
            f"RETURNING id, created_at"
        )
        cashback_record = cur.fetchone()
        cashback_id = cashback_record[0]
        created_at = cashback_record[1]

        cur.execute(
            f"UPDATE accounts SET balance = balance + {cashback_amount} "
            f"WHERE user_id = {user_id} AND account_type = 'checking'"
        )

        cur.execute(
            f"INSERT INTO transactions (user_id, transaction_type, amount, description) "
            f"VALUES ({user_id}, 'reward', {cashback_amount}, 'Кэшбэк {percentage}%')"
        )

        conn.commit()
        cur.close()
        conn.close()

        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'cashback_id': cashback_id,
                'cashback_amount': float(cashback_amount),
                'percentage': float(percentage),
                'created_at': created_at.isoformat()
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
