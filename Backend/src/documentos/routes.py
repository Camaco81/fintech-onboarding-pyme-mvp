# src/Backend/src/documentos/routes.py (o donde definas tu endpoint)

from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
import cloudinary.uploader
from ..database.models import Documento, db # Asegúrate de importar esto
from ..utils.file_handlers import allowed_file
documentos_bp = Blueprint('documentos', __name__, url_prefix='/api/v1/documentos')

@documentos_bp.route('/upload', methods=['POST'])
# Asume que tienes un decorador para autenticar y obtener el objeto 'user'
# @token_required 
def upload_documento():
    # user = g.user  # Si usas g.user del decorador de token
  user_id_actual = get_jwt_identity()

    if 'file' not in request.files:
        return jsonify({"error": "No se encontró la parte del archivo (key 'file')"}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({"error": "No se seleccionó ningún archivo"}), 400

    if file and allowed_file(file.filename):
        nombre_original = secure_filename(file.filename)

        try:
            # 🔑 Subida a Cloudinary 🔑
            upload_result = cloudinary.uploader.upload(
                file.stream,
                resource_type="raw", # Crucial para documentos (pdf, docx, etc.)
                folder="documentos_pyme", 
                public_id=nombre_original.rsplit('.', 1)[0] # Usa el nombre de archivo sin extensión
            )

            # 💾 Guardar la URL en la Base de Datos (Neon DB) 💾
            nuevo_doc = Documento(
                url_segura=upload_result['secure_url'],
                nombre_original=nombre_original,
                user_id=user_id_actual 
            )

            db.session.add(nuevo_doc)
            db.session.commit()

            return jsonify({
                "message": "Documento subido y registrado con éxito",
                "documento_id": nuevo_doc.id,
                "url": nuevo_doc.url_segura
            }), 201

        except Exception as e:
            db.session.rollback()
            print(f"Error durante la subida o DB: {e}")
            return jsonify({"error": "Fallo interno al procesar la subida"}), 500

    return jsonify({"error": "Tipo de archivo no permitido o archivo inválido"}), 400