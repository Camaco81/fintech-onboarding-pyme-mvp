# Backend/src/__init__.py

import os
from flask import Flask
from config import Config
from src.database.db_setup import init_db, db 
from flask_cors import CORS

# Importaciones de Firebase y utilidades necesarias
import json
import base64
from firebase_admin import credentials, initialize_app

# Importar el Blueprint (asumo que esta ruta es correcta)
from .auth import auth_bp 

import cloudinary

# NOTA: Reemplaza con tus variables de entorno (.env)
cloudinary.config( 
  cloud_name = os.environ.get('CLOUDINARY_CLOUD_NAME'), 
  api_key = os.environ.get('CLOUDINARY_API_KEY'), 
  api_secret = os.environ.get('CLOUDINARY_API_SECRET'),
  secure = True # Es esencial usar HTTPS
)


def create_app(config_class=Config, init_db_tables=False):
    app = Flask(__name__)
    app.config.from_object(config_class)
    CORS(app)

    # 1. Lógica para OBTENER las credenciales (cred)
    base64_json_string = os.getenv('FIREBASE_CREDENTIALS_BASE64')
    cred = None # Inicializamos 'cred' a None para asegurar su alcance

    if base64_json_string:
        print("[INFO] Usando credenciales decodificadas de Render (Producción).")

        # Decodificación y carga del JSON
        json_bytes = base64.b64decode(base64_json_string)
        json_content = json_bytes.decode('utf-8')
        service_account_info = json.loads(json_content)

        # Asignación de credenciales
        cred = credentials.Certificate(service_account_info)

    else:
        # Fallback al archivo local (Desarrollo)
        local_path = os.getenv('FIREBASE_CREDENTIALS_PATH')
        if not local_path:
            # En producción esto no debería pasar si se usa el if de arriba
            raise EnvironmentError("Falta la variable FIREBASE_CREDENTIALS_PATH en el entorno local (.env).")

        print(f"[INFO] Usando archivo local de credenciales: {local_path}")
        cred = credentials.Certificate(local_path)

    # 2. Inicializar Firebase y la DB

    # 🔥 CORRECCIÓN CLAVE: La llamada a initialize_app(cred) se hace aquí, 
    # después de que 'cred' ha sido asignado en el bloque if/else.
    if cred and not os.environ.get('FIREBASE_INITIALIZED'): # Evita doble inicialización en Flask
        initialize_app(cred)
        os.environ['FIREBASE_INITIALIZED'] = 'True' # Marca como inicializado
        print("[INFO] Firebase inicializado con éxito.")
        
    init_db(app) # Vincula la instancia 'db' a 'app'

    # 3. Lógica para la creación de tablas (SOLUCIÓN PARA RENDER)
    if init_db_tables:
        # Asegura la importación del modelo dentro del contexto o justo antes
        from .database.models import Usuario 
        
        with app.app_context():
            print("[INFO] Creando tablas desde la función create_app...")
            db.create_all() 
            print("[INFO] Tablas creadas exitosamente.")

    # 4. Registrar Blueprints (Módulos)
    app.register_blueprint(auth_bp, url_prefix='/api/v1/auth')

    return app