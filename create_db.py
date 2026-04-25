import os
import pymysql

try:
    host = os.environ.get('DB_HOST', '127.0.0.1')
    user = os.environ.get('DB_USER', 'root')
    password = os.environ.get('DB_PASSWORD', 'Qni]lKsqYD46i![I')
    
    connection = pymysql.connect(host=host, user=user, password=password)
    with connection.cursor() as cursor:
        cursor.execute("DROP DATABASE IF EXISTS takwira_db;")
        cursor.execute("CREATE DATABASE takwira_db CHARACTER SET utf8 COLLATE utf8_general_ci;")
    connection.commit()
    connection.close()
    print("Database created or already exists!")
except Exception as e:
    print(f"Could not connect or create database: {e}")
