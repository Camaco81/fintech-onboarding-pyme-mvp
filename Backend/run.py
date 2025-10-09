from src import create_app
from src.database.db_setup import db # Importamos la instancia de DB

app = create_app()

# Tarea de desarrollo: Crear las tablas en Neon DB al iniciar
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True)