# src/auth/services.py (VERSIÓN FINAL Y ESTÁNDAR)

from src.database.db_connector import get_db_connection
from psycopg2 import IntegrityError, Error as Psycopg2Error 
import sys
import traceback

# NOTA: datetime ya no es necesario si no lo usas.

def create_pyme_user(firebase_uid: str, email: str, rol: str = 'PYME'):
    conn = None
    cur = None
    try:
        # 1. Obtener la conexión directa
        conn = get_db_connection()
        cur = conn.cursor()
        
        # 2. Ejecutar INSERT SQL simplificado
        # La tabla maneja 'id' y 'fecha_creacion' automáticamente
        rol_limpio = rol.lower() # Opcional si la DB no es sensible a mayúsculas
        cur.execute(
        """
         INSERT INTO usuarios (firebase_uid, email, rol) 
         VALUES (%s, %s, %s);
        """,
         (firebase_uid, email, rol_limpio)
        )
        
        # 3. Commit
        conn.commit()
        return "Usuario registrado exitosamente en DB", None # Éxito

    except IntegrityError:
        # Atrapa duplicados de email o UID (constraint UNIQUE)
        if conn: conn.rollback()
        return None, "El usuario ya está registrado en la base de datos (duplicado)."

    except Psycopg2Error as e: 
        if conn: conn.rollback()
        # 🚨 ¡CRUCIAL! Imprimir el error completo de PostgreSQL
        print(f"\n[ERROR NEON DB - Psycopg2] El INSERT falló para el usuario {email}. DETALLE: {e}", file=sys.stderr)
        traceback.print_exc(file=sys.stderr) 
        
        # Devolver el error detallado
        return None, f"Error de DB: Falló la inserción. (Tipo: {type(e).__name__}, Msg: {e})"

    except Exception as e:
        # Error general inesperado
        if conn: conn.rollback()
        print(f"ERROR GENERAL INESPERADO: {e}", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        return None, f"Error interno desconocido. Detalle: {e}"
        
    finally:
        # Aseguramos que la conexión se cierre
        if cur: cur.close()
        if conn: conn.close()