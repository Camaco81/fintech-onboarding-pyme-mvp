# init_db.py
# (Ubicado en la raíz del proyecto)

# 1. Importa la función de la app.
from Backend.src import create_app

# ----------------------------------------------------------------------
        
print("Iniciando la creación/verificación de tablas DENTRO de la app...")

# 2. 🔥 SOLUCIÓN FINAL: Llama a create_app, pasándole el flag para que ejecute db.create_all() internamente.
# Ya no necesitamos importar 'db' ni los modelos directamente aquí.
app = create_app(init_db=True) 

print("Base de datos inicializada o tablas verificadas exitosamente. ¡Servidor listo!")

# No se necesita el bloque 'with app.app_context()' ni 'db.create_all()' aquí, 
# ya que create_app() lo manejará.