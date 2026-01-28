import json
import os
import psycopg2

def handler(event: dict, context) -> dict:
    """Получение списка платёжных систем"""
    
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
            SELECT id, system_name, system_type, enabled, config
            FROM {os.environ['MAIN_DB_SCHEMA']}.payment_systems
            ORDER BY id
        """)
        
        systems = []
        for row in cur.fetchall():
            systems.append({
                'id': row[0],
                'system_name': row[1],
                'system_type': row[2],
                'enabled': row[3],
                'config': row[4]
            })
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'payment_systems': systems}),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
