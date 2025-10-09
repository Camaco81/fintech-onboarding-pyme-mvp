# src/auth/routes.py (VERSIÓN FINAL Y BIEN INDENTADA)

from flask import Blueprint, request, jsonify
from firebase_admin import auth 
from .services import create_pyme_user
# Importamos sys y traceback aquí para que estén disponibles en el bloque except
import sys
import traceback

auth_bp = Blueprint('auth', __name__, url_prefix='/api/v1/auth')

@auth_bp.route('/setup-user', methods=['POST'])
def setup_user():
    data = request.get_json(silent=True)

    if data is None:
        return jsonify({"mensaje": "Falta el cuerpo de la solicitud (JSON)."}), 400

    email = data.get('email')
    password = data.get('password')
    rol = 'PYME'
    
    if not email or not password:
        return jsonify({"mensaje": "Faltan campos requeridos (email y password)."}), 400

    firebase_uid = None
    try:
        # 1. Crear usuario en Firebase
        user = auth.create_user(email=email, password=password)
        firebase_uid = user.uid

        # 2. Insertar en DB (esta función tiene el conn.commit())
        db_success_message, db_error = create_pyme_user(firebase_uid, email, rol) 

        if db_error:
            # 🚨 Si la inserción en DB falla, BORRAR el usuario de Firebase.
            try:
                auth.delete_user(firebase_uid)
                print(f"[INFO] Usuario {email} ELIMINADO de Firebase (DB Fallida).")
            except Exception as e:
                print(f"[ERROR] No se pudo eliminar el usuario {email} de Firebase: {e}")
                
            # Luego, reportar el error 500 con el detalle de Neon
            return jsonify({
                "mensaje": f"Registro fallido: El usuario se creó en Firebase, pero falló al guardar en Neon DB. DETALLE: {db_error}"
            }), 500

        # 3. Éxito Final
        # La línea de send_email_verification está comentada o eliminada para evitar el AttributeError.
        
        return jsonify({
            "mensaje": f"🎉 Registro exitoso. Tu cuenta fue creada. Ahora puedes iniciar sesión.",
            "usuario": {"email": email, "rol": rol}
        }), 200
        
    except auth.EmailAlreadyExistsError:
        # Error específico de Firebase si el email ya existe
        return jsonify({"mensaje": "El email ya está registrado en Firebase."}), 409
    
    except Exception as e:
        # 🚨 Bloque general, ahora con impresión de traceback para diagnóstico
        print(f"\n[ERROR CRÍTICO] Fallo Inesperado en la Ruta /setup-user: {e}", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        
        # Eliminar usuario de Firebase en caso de fallo crítico
        if firebase_uid:
            try:
                auth.delete_user(firebase_uid)
                print(f"[INFO] Usuario {email} ELIMINADO de Firebase tras fallo crítico.")
            except:
                pass

        return jsonify({"mensaje": f"Error interno desconocido. Ver logs para detalles."}), 500