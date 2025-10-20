# init_db.py

# Asegúrate de que las importaciones usen la ruta correcta a tu aplicación:
from Backend.src import create_app
from Backend.src.database.db_setup import db 

# 🔥 IMPORTANTE: Necesitas importar tus modelos para que SQLAlchemy los vea.
# AJUSTA LA RUTA DE IMPORTACIÓN DE TU MODELO 'Usuario' AQUÍ:
# Si el modelo está en Backend/src/auth/models.py, usa:
# from Backend.src.auth.models import Usuario

# Si no estás seguro de dónde está, usa la importación más probable
# y verifica tus archivos. Por ahora, asumiremos 'auth.models':
try:
    from Backend.src.auth.models import Usuario
except ImportError:
    # Intenta otra ruta común si la anterior falla
    print("No se encontró el modelo en Backend.src.auth.models. Intentando con otra ruta...")
    try:
        from Backend.src.database.models import Usuario
    except ImportError:
        print("Asegúrate de que la línea de importación del modelo sea correcta.")
        
# ----------------------------------------------------------------------
        
print("Iniciando la creación/verificación de tablas...")

app = create_app()

with app.app_context():
    # Intenta crear las tablas. Si ya existen, no hace nada (lo que queremos).
    db.create_all()
    print("Base de datos inicializada o tablas verificadas exitosamente.")