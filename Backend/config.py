import os
from dotenv import load_dotenv

# Carga las variables de entorno desde .env
load_dotenv()

class Config:
  
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///dev.db'
    
    # ¡CRUCIAL! Cambiamos a 'prefer' para evitar el fallo de certificado/SSL local
    SQLALCHEMY_ENGINE_OPTIONS = {}
    if SQLALCHEMY_DATABASE_URI and SQLALCHEMY_DATABASE_URI.startswith('postgresql'):
        SQLALCHEMY_ENGINE_OPTIONS = {
            'connect_args': {
                'sslmode': 'prefer' 
            }
        }

    # ----------------------------------------------------------------------
    # Configuración de Firebase
    # ----------------------------------------------------------------------
    FIREBASE_CREDENTIALS_PATH = os.environ.get('FIREBASE_CREDENTIALS_PATH')
    
    # Manejo de error si la ruta de credenciales no está
    if not FIREBASE_CREDENTIALS_PATH:
        print("ADVERTENCIA: FIREBASE_CREDENTIALS_PATH no está configurado.")