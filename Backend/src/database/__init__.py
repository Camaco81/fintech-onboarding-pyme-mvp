# src/database/__init__.py

# 1. Traer la instancia de SQLAlchemy desde db_setup.py
from .db_setup import db 

# 2. Exponer los modelos (Usuario y Role)
from .models import Usuario, Role