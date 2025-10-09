from flask_sqlalchemy import SQLAlchemy

# Inicializamos el objeto SQLAlchemy
# Se inicializará completamente en src/__init__.py con la app de Flask
db = SQLAlchemy()

def init_db(app):
    """Inicializa la extensión SQLAlchemy con la aplicación Flask."""
    db.init_app(app)