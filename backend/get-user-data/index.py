import json
import os
import psycopg2

def handler(event: dict, context) -> dict:
    """Получение данных пользователя по ID"""
    
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    user_id = event.get('queryStringParameters', {}).get('user_id', '1')
    
    try:
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor()
        
        cur.execute(f"""
            SELECT id, full_name, phone, email, status, premium_level, created_at
            FROM {os.environ['MAIN_DB_SCHEMA']}.users
            WHERE id = {user_id}
        """)
        
        user_row = cur.fetchone()
        
        if not user_row:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'User not found'}),
                'isBase64Encoded': False
            }
        
        user = {
            'id': user_row[0],
            'full_name': user_row[1],
            'phone': user_row[2],
            'email': user_row[3],
            'status': user_row[4],
            'premium_level': user_row[5],
            'created_at': user_row[6].isoformat() if user_row[6] else None
        }
        
        cur.execute(f"""
            SELECT id, account_type, balance, currency, interest_rate, status
            FROM {os.environ['MAIN_DB_SCHEMA']}.accounts
            WHERE user_id = {user_id}
        """)
        
        accounts = []
        for row in cur.fetchall():
            accounts.append({
                'id': row[0],
                'account_type': row[1],
                'balance': float(row[2]),
                'currency': row[3],
                'interest_rate': float(row[4]),
                'status': row[5]
            })
        
        cur.execute(f"""
            SELECT id, card_type, card_number, balance, status
            FROM {os.environ['MAIN_DB_SCHEMA']}.cards
            WHERE user_id = {user_id}
        """)
        
        cards = []
        for row in cur.fetchall():
            cards.append({
                'id': row[0],
                'card_type': row[1],
                'card_number': row[2],
                'balance': float(row[3]),
                'status': row[4]
            })
        
        cur.execute(f"""
            SELECT id, transaction_type, amount, description, category, recipient_name, created_at
            FROM {os.environ['MAIN_DB_SCHEMA']}.transactions
            WHERE user_id = {user_id}
            ORDER BY created_at DESC
            LIMIT 20
        """)
        
        transactions = []
        for row in cur.fetchall():
            transactions.append({
                'id': row[0],
                'transaction_type': row[1],
                'amount': float(row[2]),
                'description': row[3],
                'category': row[4],
                'recipient_name': row[5],
                'created_at': row[6].isoformat() if row[6] else None
            })
        
        cur.execute(f"""
            SELECT COALESCE(SUM(amount), 0) as total_cashback
            FROM {os.environ['MAIN_DB_SCHEMA']}.cashback
            WHERE user_id = {user_id}
        """)
        
        total_rewards = cur.fetchone()[0] or 0
        
        cur.execute(f"""
            SELECT id, balance, interest_rate, total_earned
            FROM {os.environ['MAIN_DB_SCHEMA']}.savings_accounts
            WHERE user_id = {user_id}
        """)
        
        savings_row = cur.fetchone()
        savings_account = None
        if savings_row:
            savings_account = {
                'id': savings_row[0],
                'balance': float(savings_row[1]),
                'interest_rate': float(savings_row[2]),
                'total_earned': float(savings_row[3])
            }
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'user': user,
                'accounts': accounts,
                'cards': cards,
                'transactions': transactions,
                'total_rewards': float(total_rewards),
                'savings_account': savings_account
            }),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }