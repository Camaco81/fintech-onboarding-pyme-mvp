# init_db.py
# (Ubicado en la raíz del proyecto, junto a run.py)

# 1. Importa la función de la app y la DB
from Backend.src import create_app
from Backend.src.database.db_setup import db 

# 2. 🔥 PASO CRÍTICO: Importa explícitamente el modelo Usuario
# La ruta correcta es: Backend/src/database/models.py
from Backend.src.database.models import Usuario # <-- ¡Ruta Confirmada!

# ----------------------------------------------------------------------
        
print("Iniciando la creación/verificación de tablas...")

# Crea la instancia de la aplicación
app = create_app()

# 3. 🚨 SOLUCIÓN AL RuntimeError: Vincula 'db' a la 'app'
db.init_app(app)

with app.app_context():
    # 4. Crea las tablas (si ya existen en Neon DB, no hace nada)
    db.create_all()
    print("Base de datos inicializada o tablas verificadas exitosamente. ¡Servidor listo!")