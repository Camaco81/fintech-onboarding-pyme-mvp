# src/auth/firebase_client.py (VERSIÓN CORREGIDA Y ROBUSTA)

import firebase_admin
from firebase_admin import credentials
import os
from dotenv import load_dotenv

# 1. Cargamos el .env para obtener la ruta
load_dotenv()
FIREBASE_PATH = os.environ.get('FIREBASE_CREDENTIALS_PATH')
absolute_path = os.path.abspath(FIREBASE_PATH)

# 2. Inicialización de Firebase
try:
    # Intenta inicializar la aplicación con el nombre 'auth_app'
    cred = credentials.Certificate(absolute_path)
    # Inicializamos SIN 'name' para que sea la aplicación 'default'
    firebase_app = firebase_admin.initialize_app(cred) 
    
except ValueError as e:
    # Esto ocurre si la aplicación ya está inicializada.
    # Si ya existe, la recuperamos (asumiendo que es la app por defecto, sin nombre)
    if "The default Firebase app already exists." in str(e):
        firebase_app = firebase_admin.get_app()
    else:
        print(f"Error fatal de Firebase: {e}")
        exit(1)
except FileNotFoundError:
    print(f"FATAL ERROR: Archivo de credenciales no encontrado en: {absolute_path}")
    exit(1)


# 3. Exportar la instancia de autenticación
# Esto es lo que importarás en services.py
firebase_auth = firebase_admin.auth