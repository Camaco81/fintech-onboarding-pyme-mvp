# src/Backend/src/utils/file_handlers.py (o similar)
ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx', 'xlsx', 'png', 'jpg', 'jpeg'} 

def allowed_file(filename):
    # Valida que la extensión esté permitida
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS