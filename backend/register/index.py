import json
import os
import psycopg2

def handler(event: dict, context) -> dict:
    '''API для регистрации нового пользователя'''
    method = event.get('httpMethod', 'POST')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': ''
        }

    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }

    try:
        body = json.loads(event.get('body', '{}'))
        phone = body.get('phone', '').strip()
        full_name = body.get('full_name', '').strip()

        if not phone or not full_name:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Телефон и имя обязательны'})
            }

        dsn = os.environ.get('DATABASE_URL')
        if not dsn:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'DATABASE_URL not configured'})
            }

        conn = psycopg2.connect(dsn)
        cur = conn.cursor()

        # Проверка существования пользователя (Simple Query Protocol)
        phone_escaped = phone.replace("'", "''")
        cur.execute(f"SELECT id FROM users WHERE phone = '{phone_escaped}'")
        existing = cur.fetchone()

        if existing:
            cur.close()
            conn.close()
            return {
                'statusCode': 409,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Пользователь с таким номером уже существует'})
            }

        # Создание нового пользователя (Simple Query Protocol)
        full_name_escaped = full_name.replace("'", "''")
        cur.execute(
            f"INSERT INTO users (phone, full_name, balance) VALUES ('{phone_escaped}', '{full_name_escaped}', 0) RETURNING id, phone, full_name, balance"
        )
        new_user = cur.fetchone()
        conn.commit()
        
        cur.close()
        conn.close()

        return {
            'statusCode': 201,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'user': {
                    'id': new_user[0],
                    'phone': new_user[1],
                    'full_name': new_user[2],
                    'balance': float(new_user[3])
                }
            })
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }