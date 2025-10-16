# src/__init__.py (VERSIÓN FINAL Y FUNCIONAL)

import os
from flask import Flask
from config import Config
from src.database.db_setup import init_db
from flask_cors import CORS

# 🚨 CORRECCIÓN CLAVE: Importar el Blueprint desde el paquete 'auth',
# donde está definido en el __init__.py interno.
from .auth import auth_bp 

# Importaciones de Firebase
from firebase_admin import credentials, initialize_app

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    CORS(app)

    # 1. Inicializar Firebase Admin SDK
    try:
        # Obtiene la ruta absoluta del directorio donde está __init__.py (Backend/src)
        ruta_actual = os.path.abspath(os.path.dirname(__file__))
        
        # 🚨 CÁLCULO DE RUTA: Sube un nivel (..) y entra a 'credentials'
        ruta_credenciales = os.path.join(ruta_actual, '..', 'credentials', 'firebase-admin-sdk-1.json')
        
        print(f"\n[INFO] Ruta de credenciales probada: {ruta_credenciales}")
        
        cred = credentials.Certificate(ruta_credenciales)
        initialize_app(cred)
        print("[INFO] Firebase Admin SDK inicializado con éxito.")

    except Exception as e:
        print(f"\n[ERROR FATAL] Falló la inicialización de Firebase Admin SDK. Detalle: {e}")
        # Si la inicialización falla, levantamos la excepción.
        raise 
    
    # 2. Inicializar Base de Datos (Neon DB)
    init_db(app)

    # 3. Registrar Blueprints (Módulos)
    app.register_blueprint(auth_bp, url_prefix='/api/v1/auth')
    
    # ... (tu código de make_shell_context o CORS, si lo tienes) ...

    return app