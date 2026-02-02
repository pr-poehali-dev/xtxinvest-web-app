import json
import os
import psycopg2
from decimal import Decimal

def handler(event: dict, context) -> dict:
    '''API для переводов денег между пользователями'''
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

    sender_id = body.get('sender_id')
    recipient_phone = body.get('recipient_phone')
    amount = body.get('amount')
    description = body.get('description', '')

    if not sender_id or not recipient_phone or not amount:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Необходимы sender_id, recipient_phone и amount'}),
            'isBase64Encoded': False
        }

    try:
        amount = Decimal(str(amount))
        if amount <= 0:
            raise ValueError('Сумма должна быть положительной')
    except (ValueError, TypeError):
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Некорректная сумма перевода'}),
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

        phone_escaped = recipient_phone.replace("'", "''")
        cur.execute(f"SELECT id, full_name FROM users WHERE phone = '{phone_escaped}'")
        recipient = cur.fetchone()

        if not recipient:
            cur.close()
            conn.close()
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Получатель не найден'}),
                'isBase64Encoded': False
            }

        recipient_id = recipient[0]
        recipient_name = recipient[1]

        cur.execute(f"SELECT balance FROM accounts WHERE user_id = {sender_id} AND account_type = 'checking' LIMIT 1")
        sender_account = cur.fetchone()

        if not sender_account or Decimal(str(sender_account[0])) < amount:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Недостаточно средств'}),
                'isBase64Encoded': False
            }

        cur.execute(f"UPDATE accounts SET balance = balance - {amount} WHERE user_id = {sender_id} AND account_type = 'checking'")
        cur.execute(f"UPDATE accounts SET balance = balance + {amount} WHERE user_id = {recipient_id} AND account_type = 'checking'")

        desc_escaped = description.replace("'", "''")
        cur.execute(
            f"INSERT INTO transfers (sender_id, recipient_id, amount, description, status) "
            f"VALUES ({sender_id}, {recipient_id}, {amount}, '{desc_escaped}', 'completed') RETURNING id, created_at"
        )
        transfer = cur.fetchone()

        name_escaped = recipient_name.replace("'", "''")
        cur.execute(
            f"INSERT INTO transactions (user_id, transaction_type, amount, description, recipient_name) "
            f"VALUES ({sender_id}, 'expense', {amount}, 'Перевод {name_escaped}', '{name_escaped}')"
        )
        
        cur.execute(
            f"INSERT INTO transactions (user_id, transaction_type, amount, description, recipient_name) "
            f"VALUES ({recipient_id}, 'income', {amount}, 'Входящий перевод', 'Входящий перевод')"
        )

        conn.commit()
        cur.close()
        conn.close()

        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'transfer_id': transfer[0],
                'recipient_name': recipient_name,
                'amount': float(amount),
                'created_at': transfer[1].isoformat()
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
