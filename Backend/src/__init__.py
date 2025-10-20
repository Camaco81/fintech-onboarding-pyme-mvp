# Backend/src/__init__.py

import os
from flask import Flask
from config import Config
# 🚨 NECESITAS importar 'db' para el db.create_all() interno
from src.database.db_setup import init_db, db 
from flask_cors import CORS

# ... (otras importaciones y código de Firebase) ...

# 🚨 CAMBIO CLAVE: Añadir el argumento 'init_db_tables' (o 'init_db')
def create_app(config_class=Config, init_db_tables=False): 
    app = Flask(__name__)
    app.config.from_object(config_class)
    CORS(app)

    # 1. Tu Lógica de Inicialización de Firebase (lo que ya está correcto)
    # ...
    
    # 2. Inicializar Firebase y la DB
    initialize_app(cred)
    init_db(app) # <--- Vincula la instancia 'db' a 'app'

    # 3. Lógica para la creación de tablas (SOLUCIÓN PARA RENDER)
    if init_db_tables:
        # Asegura la importación del modelo dentro del contexto o justo antes
        from .database.models import Usuario # Asegúrate que la ruta relativa sea correcta
        
        with app.app_context():
            print("[INFO] Creando tablas desde la función create_app...")
            db.create_all() 
            print("[INFO] Tablas creadas exitosamente.")

    # 4. Registrar Blueprints (Módulos)
    app.register_blueprint(auth_bp, url_prefix='/api/v1/auth')

    return app