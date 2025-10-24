from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
import cloudinary.uploader
import sys
import traceback
import datetime # Necesario para la fecha de subida

# Importaciones de Autenticación de Firebase
from firebase_admin import auth 

# Importaciones de DB y Modelos (Asegúrate que la ruta relativa es correcta)
from ..database.models import Documento, Usuario, db 
from ..utils.file_handlers import allowed_file
from sqlalchemy.exc import IntegrityError 

documentos_bp = Blueprint('documentos', __name__, url_prefix='/api/v1/documentos')


@documentos_bp.route('/upload', methods=['POST'])
# ❌ Se eliminó el @jwt_required() para usar la verificación de Firebase ID Token
def upload_documento():
    # ----------------------------------------------------
    # 🔑 1. AUTENTICACIÓN: Verificar Token de Firebase ID 🔑
    # ----------------------------------------------------
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({"error": "Autorización requerida. Falta el token Bearer."}), 401
    
    id_token = auth_header.split(' ')[1]
    
    try:
        # Verifica el token con el SDK de Firebase
        decoded_token = auth.verify_id_token(id_token)
        firebase_uid = decoded_token['uid']
    except Exception as e:
        # Captura errores de token inválido o expirado
        return jsonify({"error": f"Token de Firebase inválido o expirado. Detalle: {e}"}), 401

    # ----------------------------------------------------
    # 2. 🔍 Obtener el user_id de Neon DB (ID Primario)
    # ----------------------------------------------------
    user = db.session.execute(
        # Busca por la columna que guarda el UID de Firebase
        db.select(Usuario).filter_by(firebase_uid=firebase_uid)
    ).scalar_one_or_none()
    
    if user is None:
        # Esto ocurre si el token es válido, pero el usuario no está en la DB de Neon
        return jsonify({"error": "Usuario autenticado, pero no registrado en la base de datos (Neon DB)."}), 404
    
    # ❗ ID PRIMARIO que se necesita para la Clave Foránea
    user_id_actual = user.id 

    # ----------------------------------------------------
    # 3. Validación y Procesamiento de Archivo
    # ----------------------------------------------------
    if 'file' not in request.files or request.files['file'].filename == '':
        return jsonify({"error": "No se seleccionó o encontró el archivo (key 'file')."}), 400
        
    file = request.files['file']
    nombre_original = secure_filename(file.filename)

    if not allowed_file(nombre_original):
        return jsonify({"error": "Tipo de archivo no permitido. Solo se aceptan documentos."}), 400
    
    # ----------------------------------------------------
    # 4. 🔑 Subida a Cloudinary y Registro en DB 💾
    # ----------------------------------------------------
    try:
        # A. Subida a Cloudinary
        upload_result = cloudinary.uploader.upload(
            file.stream,
            resource_type="raw", 
            folder="documentos_pyme", 
            # public_id basado en el nombre del archivo (optimización)
            public_id=f"{user_id_actual}-{nombre_original.rsplit('.', 1)[0]}",
            overwrite=False # Opcional: evita que se reescriba un archivo con el mismo nombre
        )

        # B. Guardar la URL en la Base de Datos (Neon DB)
        nuevo_doc = Documento(
            url_segura=upload_result['secure_url'],
            nombre_original=nombre_original,
            user_id=user_id_actual, # ❗ Usando el ID de Neon DB
            fecha_subida=datetime.datetime.now()
        )

        db.session.add(nuevo_doc)
        db.session.commit()

        return jsonify({
            "message": "Documento subido y registrado con éxito.",
            "documento_id": nuevo_doc.id,
            "url": nuevo_doc.url_segura
        }), 201

    except IntegrityError as e:
        db.session.rollback()
        # Este error es improbable ahora si el user_id existe, pero se mantiene el manejo
        print(f"[ERROR DB] Integridad de datos fallida: {e}", file=sys.stderr)
        return jsonify({"error": "Error de base de datos: Clave foránea o dato inválido."}), 409
        
    except Exception as e:
        db.session.rollback()
        # Captura errores de Cloudinary, conexión, etc.
        print(f"[ERROR CRÍTICO] Fallo interno al procesar la subida: {e}", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        return jsonify({"error": "Fallo interno al procesar la subida del documento."}), 500