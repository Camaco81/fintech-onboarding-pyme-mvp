# src/Backend/src/documentos/routes.py

from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
import cloudinary.uploader
# Importaciones de JWT para obtener el ID del usuario
from flask_jwt_extended import jwt_required, get_jwt_identity 
# Importaciones locales (asegúrate de que las rutas relativas son correctas)
from ..database.models import Documento, db 
from ..utils.file_handlers import allowed_file
from sqlalchemy.exc import IntegrityError # Para capturar errores de DB específicos


documentos_bp = Blueprint('documentos', __name__, url_prefix='/api/v1/documentos')


@documentos_bp.route('/upload', methods=['POST'])
@jwt_required() # Asegura que la petición tenga un token JWT válido
def upload_documento():
    # 🔑 1. Obtener ID del Usuario Autenticado 🔑
    # Esta función obtiene el 'identity' que pasaste al crear el token
    user_id_actual = get_jwt_identity() 

    # 2. Validación de Archivo en la Petición
    if 'file' not in request.files:
        return jsonify({"error": "No se encontró la parte del archivo (key 'file'). Asegúrate de usar form-data."}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({"error": "No se seleccionó ningún archivo"}), 400

    # 3. Validación de Tipo de Archivo
    if not allowed_file(file.filename):
        return jsonify({"error": "Tipo de archivo no permitido. Solo se aceptan documentos."}), 400
    
    # El archivo es válido y existe. Proceder con la subida.
    nombre_original = secure_filename(file.filename)

    try:
        # 4. 🔑 Subida a Cloudinary 🔑
        upload_result = cloudinary.uploader.upload(
            file.stream,
            resource_type="raw", # Crucial para documentos (pdf, docx, etc.)
            folder="documentos_pyme", 
            # Usa el nombre de archivo sin extensión como public_id (más limpio)
            public_id=nombre_original.rsplit('.', 1)[0] 
        )

        # 5. 💾 Guardar la URL en la Base de Datos (Neon DB) 💾
        nuevo_doc = Documento(
            url_segura=upload_result['secure_url'],
            nombre_original=nombre_original,
            user_id=user_id_actual # Usa el ID dinámico
        )

        db.session.add(nuevo_doc)
        db.session.commit()

        return jsonify({
            "message": "Documento subido y registrado con éxito",
            "documento_id": nuevo_doc.id,
            "url": nuevo_doc.url_segura
        }), 201

    except IntegrityError as e:
        # Maneja específicamente la Violación de Clave Foránea
        db.session.rollback()
        # Puedes buscar 'violates foreign key constraint' en el error 'e'
        print(f"Error de Integridad (DB): {e}") 
        return jsonify({
            "error": "Error de base de datos: El ID de usuario no existe o es inválido.", 
            "detail": "Violación de clave foránea."
        }), 409
        
    except Exception as e:
        # Captura cualquier otro error (Cloudinary, conexión, etc.)
        db.session.rollback()
        print(f"Error durante la subida o DB: {e}")
        return jsonify({"error": "Fallo interno al procesar la subida del documento."}), 500