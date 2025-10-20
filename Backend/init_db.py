# init_db.py

# 1. Importa la función de la app y la DB
from Backend.src import create_app
from Backend.src.database.db_setup import db 

# 2. Importa el modelo para que 'db.create_all()' lo vea
from Backend.src.database.models import Usuario 

# ----------------------------------------------------------------------
        
print("Iniciando la creación/verificación de tablas...")

# 3. Crea la instancia de la aplicación
app = create_app()

# 4. 🔥 Forzar la vinculación de db a la app (SOLUCIÓN al RuntimeError)
# Esto asegura que db se registre con la aplicación que acabas de crear.
db.init_app(app) 

with app.app_context():
    # 5. Crea las tablas
    db.create_all()
    print("Base de datos inicializada o tablas verificadas exitosamente. ¡Servidor listo!")