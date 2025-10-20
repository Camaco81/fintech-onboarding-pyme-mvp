from src import create_app
from src.database.db_setup import db # Importamos la instancia de DB

app = create_app()


if __name__ == '__main__':
    app.run(debug=True)