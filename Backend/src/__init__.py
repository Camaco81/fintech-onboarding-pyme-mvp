# src/__init__.py (VERSIÓN CORREGIDA Y FUNCIONAL)

import os
from flask import Flask
from config import Config
from src.database.db_setup import init_db
from flask_cors import CORS

# Importaciones adicionales necesarias
import json
import base64

# 🚨 CORRECCIÓN CLAVE: Importar el Blueprint desde el paquete 'auth',
# donde está definido en el __init__.py interno.
from .auth import auth_bp

# Importaciones de Firebase
from firebase_admin import credentials, initialize_app

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    CORS(app)

    # 1. Obtener la variable de credenciales Base64 ANTES del IF
    base64_json_string = os.getenv('FIREBASE_CREDENTIALS_BASE64')

    # 2. Lógica de inicialización de Firebase con doble verificación
    # ---------------------------------------------------------------
    if base64_json_string:
        print("[INFO] Usando credenciales decodificadas de Render (Producción).")

        # A. Decodificar Base64 a bytes
        json_bytes = base64.b64decode(base64_json_string)

        # B. Decodificar bytes a una cadena JSON y luego cargar el objeto Python
        json_content = json_bytes.decode('utf-8')
        service_account_info = json.loads(json_content)

        # C. Inicializar usando el objeto Python decodificado
        cred = credentials.Certificate(service_account_info)

    else:
        # 2. Fallback al archivo local (Desarrollo)
        local_path = os.getenv('FIREBASE_CREDENTIALS_PATH')
        if not local_path:
            raise EnvironmentError("Falta la variable FIREBASE_CREDENTIALS_PATH en el entorno local (.env).")

        print(f"[INFO] Usando archivo local de credenciales: {local_path}")
        cred = credentials.Certificate(local_path)

    # Inicializar Firebase con la credencial obtenida (ya sea local o de Render)
    initialize_app(cred)
    init_db(app)
    # ---------------------------------------------------------------

    # 3. Registrar Blueprints (Módulos)
    app.register_blueprint(auth_bp, url_prefix='/api/v1/auth')

    # ... (tu código de make_shell_context o CORS, si lo tienes) ...

    return app