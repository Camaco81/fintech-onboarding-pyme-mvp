# src/database/db_connector.py

import os
import psycopg2
from dotenv import load_dotenv # Si usas .env

load_dotenv() # Carga las variables del .env

def get_db_connection():
    # Esta es la línea crucial
    DATABASE_URL = os.getenv("DATABASE_URL") 
    if not DATABASE_URL:
        # Esto nos avisaría si la variable no está cargada
        raise ValueError("DATABASE_URL not found in environment variables.")

    # El fallo ocurre si la URL es incorrecta/expirada
    conn = psycopg2.connect(DATABASE_URL)
    return conn