from functools import wraps
from flask import request, jsonify, g # 'g' es un objeto global para almacenar datos en el request
from firebase_admin import auth as firebase_admin_auth
from firebase_admin import exceptions
from ..database.models import Usuario, Role
from ..database.db_setup import db # Necesario para hacer consultas

# Importamos la instancia de auth que inicializamos
from .firebase_client import firebase_auth 

def firebase_auth_required(allowed_roles: list[Role]):
    """
    Decorador para proteger rutas.
    Verifica el token JWT de Firebase, busca el usuario en Neon DB 
    y verifica si tiene el rol permitido.
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # 1. Obtener el Token del encabezado
            auth_header = request.headers.get('Authorization')
            if not auth_header or not auth_header.startswith('Bearer '):
                return jsonify({"msg": "Token de autorización requerido"}), 401
            
            id_token = auth_header.split("Bearer ")[1]
            
            try:
                # 2. Verificar el Token con Firebase Admin SDK
                # Usamos la instancia de auth que inicializamos en firebase_client.py
                decoded_token = firebase_auth.verify_id_token(id_token)
                firebase_uid = decoded_token['uid']
                email = decoded_token.get('email') # Obtenemos el email para mayor seguridad

                # 3. Buscar al Usuario en Neon DB
                # Usamos el uid para encontrar al usuario en nuestra DB
                user = Usuario.query.filter_by(firebase_uid=firebase_uid).first()
                
                if not user:
                    # El token es válido, pero el usuario no ha completado el registro inicial en Neon
                    # Es necesario redirigir al endpoint de 'register-pyme'
                    return jsonify({"msg": "Usuario autenticado, requiere registro inicial"}), 403

                # 4. Verificar Roles
                if user.rol not in allowed_roles:
                    return jsonify({"msg": f"Acceso denegado. Rol {user.rol.value} no permitido."}), 403
                
                # Almacenar el objeto de usuario en 'g' para que la ruta pueda acceder a él
                g.current_user = user
                
                # Todo OK: ejecutar la función de la ruta
                return f(*args, **kwargs)

            except exceptions.FirebaseError as e:
                # Errores específicos de Firebase (Token expirado, inválido, etc.)
                print(f"Firebase Error: {e}")
                return jsonify({"msg": "Token inválido o expirado"}), 401
            except Exception as e:
                # Otros errores (DB, etc.)
                print(f"Error interno en decorador: {e}")
                return jsonify({"msg": "Error interno del servidor"}), 500

        return decorated_function
    return decorator