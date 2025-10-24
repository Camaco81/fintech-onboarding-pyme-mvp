import os
from dotenv import load_dotenv

# Carga las variables de entorno desde .env
load_dotenv()

class Config:
    
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///dev.db'
    
    # 🔑 NUEVAS LÍNEAS DE CONFIGURACIÓN DE ESTABILIDAD DE CONEXIÓN
    # Recicla las conexiones inactivas cada 5 minutos (300 segundos) para evitar "closed unexpectedly"
    SQLALCHEMY_POOL_RECYCLE = 300 
    # Comprueba si la conexión está viva antes de usarla, recreándola si es necesario
    SQLALCHEMY_POOL_PRE_PING = True 
    JWT_SECRET_KEY = "tu_clave_secreta_aqui" # Asegúrate de que esto también esté configurado (¡usa una variable de entorno!)
    JWT_TOKEN_LOCATION = ["headers"]
    # ----------------------------------------------------------------------
    
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