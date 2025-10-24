# init_db.py

from Backend.src import create_app 
        
print("Iniciando la creación/verificación de tablas DENTRO de la app...")
# Llama a create_app con el argumento correcto
app = create_app(init_db_tables=True) 
print("Base de datos inicializada o tablas verificadas exitosamente. ¡Servidor listo!")