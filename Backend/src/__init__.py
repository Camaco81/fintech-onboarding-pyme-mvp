# Backend/src/__init__.py

import os
from flask import Flask
from config import Config
# Asumo que esta función init_db IMPORTA la instancia 'db' y la vincula
from src.database.db_setup import init_db, db # 🚨 NECESITAS EXPORTAR/IMPORTAR 'db' AQUÍ
from flask_cors import CORS

# Importaciones adicionales necesarias
# ... (otras imports)
# ---------------------------------------------------------------

# Asegúrate de que init_db se actualice para aceptar este flag
def create_app(config_class=Config, init_db_tables=False): # Añadir el nuevo flag
    app = Flask(__name__)
    app.config.from_object(config_class)
    CORS(app)

    # ... (Tu lógica de Firebase, que se ve correcta) ...
    # ---------------------------------------------------------------
    # ... inicialización de Firebase y
    init_db(app) # <--- Vincula la instancia 'db' a 'app'
    # ---------------------------------------------------------------

    # Lógica para la creación de tablas (SOLUCIÓN PARA RENDER)
    if init_db_tables:
        from .database.models import Usuario # Asegura que el modelo esté cargado
        
        with app.app_context():
            print("[INFO] Creando tablas desde la función create_app...")
            # Aquí usamos el 'db' que fue vinculado por init_db(app)
            db.create_all() 
            print("[INFO] Tablas creadas exitosamente.")

    # 3. Registrar Blueprints (Módulos)
    app.register_blueprint(auth_bp, url_prefix='/api/v1/auth')

    return app