# src/auth/routes.py (VERSIÓN OPTIMIZADA)

from flask import Blueprint, request, jsonify
from firebase_admin import auth
import sys
import traceback

# Importaciones de JWT, DB y Modelos
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.database.db_setup import db
from src.database.models import Usuario 

# Importaciones de Servicios
from .services import create_pyme_user # Asumo que esta función existe


auth_bp = Blueprint('auth', __name__, url_prefix='/api/v1/auth')

# ---------------------------------------------------------------
# RUTA DE REGISTRO
# ---------------------------------------------------------------
@auth_bp.route('/setup-user', methods=['POST'])
def setup_user():
    data = request.get_json(silent=True)

    if data is None:
        return jsonify({"mensaje": "Falta el cuerpo de la solicitud (JSON)."}), 400

    email = data.get('email')
    password = data.get('password')
    # Usar get() con fallback a '' es la forma más limpia
    nombre_completo = data.get('nombre_completo', '')
    telefono = data.get('telefono', '')
    rol = 'PYME'
    
    if not email or not password:
        return jsonify({"mensaje": "Faltan campos requeridos (email y password)."}), 400

    firebase_uid = None
    try:
        # 1. Crear usuario en Firebase
        user = auth.create_user(email=email, password=password)
        firebase_uid = user.uid

        # 2. Insertar en DB 
        db_success_message, db_error = create_pyme_user(
            firebase_uid,
            email,
            nombre_completo,
            telefono,
            rol
        )

        if db_error:
            # 🚨 Si la inserción en DB falla, BORRAR el usuario de Firebase.
            try:
                auth.delete_user(firebase_uid)
                print(f"[INFO] Usuario {email} ELIMINADO de Firebase (DB Fallida).", file=sys.stderr)
            except Exception as e:
                print(f"[ERROR] No se pudo eliminar el usuario {email} de Firebase: {e}", file=sys.stderr)
                
            return jsonify({
                "mensaje": f"Registro fallido. Error en base de datos. DETALLE: {db_error}"
            }), 500

        # 3. Éxito Final
        return jsonify({
            "mensaje": f"🎉 Registro exitoso. Tu cuenta fue creada. Ahora puedes iniciar sesión.",
            "usuario": {"email": email, "rol": rol}
        }), 200 

    except auth.EmailAlreadyExistsError:
        return jsonify({"mensaje": "El email ya está registrado. Por favor, inicia sesión."}), 409
    
    except Exception as e:
        # 🚨 Bloque general de fallo, incluyendo el rollback de Firebase
        print(f"\n[ERROR CRÍTICO] Fallo Inesperado en la Ruta /setup-user: {e}", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        
        if firebase_uid:
            try:
                auth.delete_user(firebase_uid)
                print(f"[INFO] Usuario {email} ELIMINADO de Firebase tras fallo crítico.", file=sys.stderr)
            except:
                pass

        return jsonify({"mensaje": f"Error interno desconocido. Contacte a soporte."}), 500


# src/auth/routes.py (VERSIÓN FINAL CORREGIDA)

# ... (Imports) ...

# ---------------------------------------------------------------
# RUTA DE PERFIL DE USUARIO LOGEADO (Verifica Token de Firebase)
# ---------------------------------------------------------------
@auth_bp.route('/profile', methods=['GET'])
def get_user_profile():
    # 1. Obtener el Token del Header de Autorización
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({"msg": "Autorización requerida. Falta el token Bearer de Firebase."}), 401
    
    id_token = auth_header.split(' ')[1]
    
    try:
        # 2. Verificar el ID Token con el SDK de Firebase
        decoded_token = auth.verify_id_token(id_token)
        firebase_uid = decoded_token['uid'] # <-- ESTE ES EL UID QUE USAMOS PARA BUSCAR
        
    except Exception as e:
        return jsonify({"msg": f"Token de Firebase inválido o expirado. Detalle: {e}"}), 401

    # 3. 🔑 CORRECCIÓN CRÍTICA: Buscar usando el campo 'firebase_uid' de la tabla, 
    #    NO el campo 'id' (bigserial).
    user = db.session.execute(
        # Filtramos por la columna que almacena el UID de Firebase
        db.select(Usuario).filter_by(firebase_uid=firebase_uid) 
    ).scalar_one_or_none()
    
    if user is None:
        # Esto ocurre si el usuario está en Firebase pero la inserción en Neon falló.
        return jsonify({"msg": "Usuario no encontrado en la base de datos."}), 404
    
    # 4. Preparar la respuesta JSON (incluimos el UID de Firebase explícitamente)
    return jsonify({
        # id de Neon (bigserial)
        "db_id": user.id, 
        # ID de Firebase (clave de login)
        "firebase_uid": user.firebase_uid, 
        "email": user.email,
        "nombre_completo": user.nombre_completo, 
        "rol": user.rol.value,
        "fecha_creacion": user.fecha_creacion.isoformat() if user.fecha_creacion else None,
    }), 200