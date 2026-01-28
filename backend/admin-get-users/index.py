import json
import os
import psycopg2

def handler(event: dict, context) -> dict:
    """Получение списка пользователей для админ-панели"""
    
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
    
    try:
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor()
        
        cur.execute(f"""
            SELECT 
                u.id, 
                u.full_name, 
                u.phone, 
                u.status, 
                u.premium_level,
                COALESCE(SUM(a.balance), 0) as total_balance
            FROM {os.environ['MAIN_DB_SCHEMA']}.users u
            LEFT JOIN {os.environ['MAIN_DB_SCHEMA']}.accounts a ON u.id = a.user_id
            GROUP BY u.id, u.full_name, u.phone, u.status, u.premium_level
            ORDER BY u.created_at DESC
        """)
        
        users = []
        for row in cur.fetchall():
            users.append({
                'id': row[0],
                'full_name': row[1],
                'phone': row[2],
                'status': row[3],
                'premium_level': row[4],
                'total_balance': float(row[5])
            })
        
        cur.execute(f"""
            SELECT COUNT(*) as total_users,
                   COUNT(CASE WHEN status = 'active' THEN 1 END) as active_users,
                   COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_users
            FROM {os.environ['MAIN_DB_SCHEMA']}.users
        """)
        
        stats_row = cur.fetchone()
        stats = {
            'total_users': stats_row[0],
            'active_users': stats_row[1],
            'pending_users': stats_row[2]
        }
        
        cur.execute(f"""
            SELECT COUNT(*) as total_cards
            FROM {os.environ['MAIN_DB_SCHEMA']}.cards
            WHERE status = 'active'
        """)
        
        stats['total_cards'] = cur.fetchone()[0]
        
        cur.execute(f"""
            SELECT COUNT(*) as today_transactions
            FROM {os.environ['MAIN_DB_SCHEMA']}.transactions
            WHERE DATE(created_at) = CURRENT_DATE
        """)
        
        stats['today_transactions'] = cur.fetchone()[0]
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'users': users,
                'stats': stats
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
