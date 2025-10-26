from firebase_admin import auth
from flask import request, jsonify
# Asegúrate de que esta importación sea correcta para acceder a tus modelos y DB
from ..database.models import Usuario, db 


def get_user_id_from_firebase_token(auth_header):
    """
    Verifica el token de Firebase ID y devuelve el ID primario del usuario de Neon DB.
    
    :param auth_header: El encabezado 'Authorization' de la solicitud.
    :returns: El ID (entero) del usuario de Neon DB.
    :raises: Excepción si la autenticación falla o el usuario no existe.
    """
    if not auth_header or not auth_header.startswith('Bearer '):
        # Usamos Exception aquí para manejarlo en las rutas
        raise Exception("Falta el token Bearer en el encabezado Authorization.")
    
    id_token = auth_header.split(' ')[1]
    
    try:
        # 1. Verificar y decodificar el token con el SDK de Firebase
        decoded_token = auth.verify_id_token(id_token)
        firebase_uid = decoded_token['uid']
    except Exception as e:
        # Captura errores de Firebase (token expirado, inválido, etc.)
        raise Exception(f"Token de Firebase inválido o expirado. Detalle: {e}")

    # 2. Buscar el ID primario de Neon DB usando el UID de Firebase
    user_id = db.session.execute(
        db.select(Usuario.id).filter_by(firebase_uid=firebase_uid)
    ).scalar_one_or_none()
    
    if user_id is None:
        raise Exception("Usuario autenticado, pero no encontrado en la DB (Neon).")
        
    return user_id