from flask import Blueprint, request, jsonify
from firebase_admin import auth
import sys
import traceback
from sqlalchemy.orm.exc import NoResultFound

# Importaciones de Modelos y DB
from ..database.models import ProgresoFormulario, Usuario, db 
from ..utils.auth_helper import get_user_id_from_firebase_token # UNA FUNCIÓN DE AYUDA

formulario_bp = Blueprint('formulario', __name__, url_prefix='/api/v1/formulario')

# ----------------------------------------------------------------------
# 💡 RUTA DE AYUDA (Te la doy para evitar repetir código de autenticación)
# ----------------------------------------------------------------------
# Debes implementar esta lógica en un archivo como src/Backend/src/utils/auth_helper.py
def get_user_id_from_firebase_token(auth_header):
    if not auth_header or not auth_header.startswith('Bearer '):
        raise Exception("Falta el token Bearer.")
    
    id_token = auth_header.split(' ')[1]
    decoded_token = auth.verify_id_token(id_token)
    firebase_uid = decoded_token['uid']
    
    # Buscar el ID primario de Neon DB usando el UID de Firebase
    user = db.session.execute(
        db.select(Usuario.id).filter_by(firebase_uid=firebase_uid)
    ).scalar_one_or_none()
    
    if user is None:
        raise Exception("Usuario no encontrado en DB.")
        
    return user # Esto devuelve el ID entero (ej: 13)


# ----------------------------------------------------------------------
# 1. RUTA GET: RECUPERAR AVANCE (Cargar formulario)
# ----------------------------------------------------------------------
@formulario_bp.route('/paso/<paso_clave>', methods=['GET'])
def get_progress(paso_clave):
    try:
        auth_header = request.headers.get('Authorization')
        user_id_actual = get_user_id_from_firebase_token(auth_header)

        # Buscar el progreso del formulario
        registro = db.session.execute(
            db.select(ProgresoFormulario.datos).filter_by(
                user_id=user_id_actual, 
                paso_clave=paso_clave
            )
        ).scalar_one_or_none()
        
        # Si encuentra el registro, devuelve los datos; si no, devuelve un JSON vacío
        return jsonify(registro if registro else {}), 200

    except Exception as e:
        error_msg = str(e)
        if "Falta el token" in error_msg:
            return jsonify({"error": "Autorización requerida."}), 401
        if "Usuario no encontrado" in error_msg:
            return jsonify({"error": "Usuario autenticado pero no registrado."}), 404
            
        print(f"[ERROR GET PROGRESS]: {e}", file=sys.stderr)
        return jsonify({"error": "Fallo al cargar el avance."}), 500


# ----------------------------------------------------------------------
# 2. RUTA POST: GUARDAR/ACTUALIZAR AVANCE (Lógica de UPSERT)
# ----------------------------------------------------------------------
@formulario_bp.route('/paso/<paso_clave>', methods=['POST'])
def save_progress(paso_clave):
    try:
        auth_header = request.headers.get('Authorization')
        user_id_actual = get_user_id_from_firebase_token(auth_header)

        datos_a_guardar = request.get_json(silent=True)
        if not datos_a_guardar or not isinstance(datos_a_guardar, dict):
            return jsonify({"error": "Cuerpo de solicitud inválido o vacío. Se espera JSON."}), 400

        # 🔑 Lógica de UPSERT (Update o Insert)
        registro = db.session.execute(
            db.select(ProgresoFormulario).filter_by(
                user_id=user_id_actual, 
                paso_clave=paso_clave
            )
        ).scalar_one_or_none()
        
        if registro:
            # 2. Si existe -> ACTUALIZAR
            registro.datos = datos_a_guardar
            accion = "actualizado"
        else:
            # 3. Si NO existe -> INSERTAR
            nuevo_registro = ProgresoFormulario(
                user_id=user_id_actual,
                paso_clave=paso_clave,
                datos=datos_a_guardar
            )
            db.session.add(nuevo_registro)
            accion = "creado"

        db.session.commit()
        return jsonify({
            "message": f"Avance del paso '{paso_clave}' {accion} con éxito.",
            "paso_clave": paso_clave
        }), 200

    except Exception as e:
        db.session.rollback()
        error_msg = str(e)
        if "Falta el token" in error_msg:
            return jsonify({"error": "Autorización requerida."}), 401
        
        print(f"[ERROR POST PROGRESS]: {e}", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        return jsonify({"error": "Error interno al guardar el avance."}), 500