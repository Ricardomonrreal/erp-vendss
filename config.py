import os
from dotenv import load_dotenv

# Cargar variables de entorno desde un archivo .env si existe
load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'erp_secret_key_129837198273')
    
    # Configuración de base de datos MySQL
    DB_HOST = os.environ.get('DB_HOST', 'localhost')
    DB_USER = os.environ.get('DB_USER', 'root')
    DB_PASSWORD = os.environ.get('DB_PASSWORD', '')
    DB_NAME = os.environ.get('DB_NAME', 'erp_db')
    DB_PORT = int(os.environ.get('DB_PORT', 3306))
