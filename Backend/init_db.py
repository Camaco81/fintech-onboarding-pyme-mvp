# init_db.py
# (Ubicado en la raíz del proyecto)

# 1. Importa la función de la app y la DB
from Backend.src import create_app
from Backend.src.database.db_setup import db 

# 2. 🔥 PASO CRÍTICO: Importa explícitamente el modelo Usuario.
# Esto asegura que la clase 'Usuario' esté cargada en la memoria para db.create_all()
from Backend.src.database.models import Usuario 

# ----------------------------------------------------------------------
        
print("Iniciando la creación/verificación de tablas...")

# Crea la instancia de la aplicación.
# **Tu función create_app() ya está haciendo db.init_app(app)**
app = create_app()

# 🚨 ELIMINADA: La línea db.init_app(app) que causaba el RuntimeError.
# Si el objeto 'db' es global y fue inicializado con la app, 
# podemos pasar directamente a usar el contexto.

with app.app_context():
    # 3. Crea las tablas. SQLAlchemy ahora tiene el modelo 'Usuario' cargado.
    db.create_all()
    print("Base de datos inicializada o tablas verificadas exitosamente. ¡Servidor listo!")