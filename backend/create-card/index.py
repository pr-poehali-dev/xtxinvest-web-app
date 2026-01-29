import json
import os
import psycopg2
from datetime import datetime, timedelta
import random

def handler(event: dict, context) -> dict:
    '''API для создания виртуальной карты пользователю'''
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

    if method == 'POST':
        try:
            body = json.loads(event.get('body', '{}'))
            user_id = body.get('user_id')
            card_type = body.get('card_type', 'МИР')
            
            if not user_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'user_id is required'}),
                    'isBase64Encoded': False
                }

            # Check for required env vars
            if 'DATABASE_URL' not in os.environ:
                return {
                    'statusCode': 500,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'DATABASE_URL not configured'}),
                    'isBase64Encoded': False
                }
            
            if 'MAIN_DB_SCHEMA' not in os.environ:
                return {
                    'statusCode': 500,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'MAIN_DB_SCHEMA not configured'}),
                    'isBase64Encoded': False
                }

            dsn = os.environ['DATABASE_URL']
            conn = psycopg2.connect(dsn)
            cur = conn.cursor()

            # Generate card number
            if card_type == 'МИР':
                prefix = '2200'
            elif card_type == 'Visa':
                prefix = '4276'
            else:  # Mastercard
                prefix = '5536'
            
            card_number = prefix + ''.join([str(random.randint(0, 9)) for _ in range(12)])
            
            # Generate expiry date (3 years from now)
            expiry = datetime.now() + timedelta(days=3*365)
            expiry_date = expiry.strftime('%Y-%m-%d')  # PostgreSQL DATE format

            # Get user's full name
            schema = os.environ['MAIN_DB_SCHEMA']
            query_user = f"SELECT full_name FROM {schema}.users WHERE id = {user_id}"
            cur.execute(query_user)
            user_result = cur.fetchone()
            
            if not user_result:
                cur.close()
                conn.close()
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'User not found'}),
                    'isBase64Encoded': False
                }
            
            card_holder = user_result[0].replace("'", "''")  # Escape quotes
            cvv = str(random.randint(100, 999))
            
            # Insert card using Simple Query Protocol (no parameters)
            query_insert = f"""
                INSERT INTO {schema}.cards 
                (user_id, card_number, card_type, card_holder, expiry_date, cvv, balance, status, is_virtual, currency)
                VALUES ({user_id}, '{card_number}', '{card_type}', '{card_holder}', '{expiry_date}', '{cvv}', 0, 'active', TRUE, 'RUB')
                RETURNING id, card_number, card_type, expiry_date, balance
            """
            cur.execute(query_insert)

            card = cur.fetchone()
            conn.commit()

            # Convert all values to JSON-serializable types
            result = {
                'id': int(card[0]),
                'card_number': str(card[1]),
                'card_type': str(card[2]),
                'expiry_date': str(card[3]) if card[3] else None,
                'balance': float(card[4]),
                'is_virtual': True
            }

            cur.close()
            conn.close()

            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(result),
                'isBase64Encoded': False
            }

        except Exception as e:
            import traceback
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': str(e), 'traceback': traceback.format_exc()}),
                'isBase64Encoded': False
            }

    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }