# src/database/db_connector.py

import os
import psycopg2
# 🔑 CLAVE: Importar las funciones para cargar el archivo .env
from dotenv import load_dotenv, dotenv_values 

# 1. Forzar la carga de variables del archivo .env
load_dotenv() 

def get_db_connection():
    # 2. Intenta leer la variable, ya sea del entorno o del .env cargado.
    DATABASE_URL = os.environ.get('DATABASE_URL')
    
    # 3. Si por alguna razón sigue fallando, usa dotenv_values como último recurso.
    if not DATABASE_URL:
        config = dotenv_values(".env")
        DATABASE_URL = config.get('DATABASE_URL')
        
    if not DATABASE_URL:
        raise ValueError("DATABASE_URL no está configurada.") 

    # La conexión limpia, sin 'search_path' ni pooler options
    conn = psycopg2.connect(DATABASE_URL)
    return conn