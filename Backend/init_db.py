# init_db.py

# 1. Importa la función de la app y la DB usando las rutas del run.py
from Backend.src import create_app 
from Backend.src.database.db_setup import db 

# 2. 🔥 Importa explícitamente el modelo. ¡Esta importación es CRUCIAL!
from Backend.src.database.models import Usuario 

# ----------------------------------------------------------------------
        
print("Iniciando la creación/verificación de tablas...")

# 3. Crea la instancia de la aplicación
app = create_app()

# 4. 🔥 SOLUCIÓN FINAL: Usa la configuración que genera el error de doble registro.
# Este error solo ocurre en el entorno local. En Render, por la forma en que 
# se importan los módulos, ESTA LÍNEA ES NECESARIA para que 'db' se registre 
# en la 'app' del script de inicialización.
try:
    db.init_app(app)
except RuntimeError as e:
    # Si da el error de 'ya registrado', lo ignoramos y continuamos
    if "has already been registered" in str(e):
        print("db ya estaba vinculado (Ignorando RuntimeError)...")
    else:
        raise # Si es otro error, lo mostramos

with app.app_context():
    # 5. Crea las tablas
    db.create_all()
    print("Base de datos inicializada o tablas verificadas exitosamente. ¡Servidor listo!")