# test_db.py (VERSION FINAL Y PREVENTIVA)

import os
import psycopg2
import datetime
# Importamos dotenv_values, que es crucial para forzar la lectura del archivo
from dotenv import dotenv_values, load_dotenv 

# Carga las variables de entorno desde el archivo .env (Esto asegura que el resto del proyecto también las tenga)
load_dotenv()

# 🚨 CORRECCIÓN CLAVE: Usamos dotenv_values para leer SOLO del archivo .env, ignorando variables viejas del sistema.
config = dotenv_values(".env")
DB_URL = config.get('DATABASE_URL')

if not DB_URL:
    print("Error: DATABASE_URL no está configurada o el archivo .env no se encontró en la raíz.")
    exit()

# Datos de prueba
test_uid = "TEST_UID_" + str(datetime.datetime.now().timestamp()).replace('.', '')
test_email = "test2_email_" + str(datetime.datetime.now().microsecond) + "@prueba2.com"
test_rol = "pyme" # Usamos minúsculas, por si el esquema SQL lo requiere

conn = None
try:
    # 🚨 Solo mostramos la URL del hostname por seguridad, no la credencial completa
    print(f"Intentando conectar a DB (Hostname): {DB_URL.split('@')[-1]}") 
    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor()
    
    print(f"Ejecutando INSERT para UID: {test_uid}")
    
    # El INSERT final y corregido
    cur.execute(
        """
        INSERT INTO usuarios (firebase_uid, email, rol) 
        VALUES (%s, %s, %s);
        """,
        (test_uid, test_email, test_rol) 
    )
    
    # OBLIGATORIO: Commit para guardar
    conn.commit()
    print("ÉXITO: La inserción fue exitosa y la transacción se hizo COMMIT.")
    
    # PRUEBA DE SELECT (¡Debe devolver 1!)
    cur.execute("SELECT COUNT(*) FROM usuarios WHERE firebase_uid = %s;", (test_uid,))
    count = cur.fetchone()[0]
    print(f"Verificación: {count} fila(s) encontrada(s) para el nuevo UID.")

except psycopg2.Error as e:
    if conn: conn.rollback()
    print("\n--- ERROR DE BASE DE DATOS REAL ---")
    print(f"FALLO: El error real de PostgreSQL es: {e}")
    print("-----------------------------------")
    
except Exception as e:
    print(f"FALLO: Error inesperado: {e}")

finally:
    if 'cur' in locals() and cur:
        cur.close()
    if conn:
        conn.close()
        print("Conexión cerrada.")