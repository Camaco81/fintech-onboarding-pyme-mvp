# src/database/models.py

import enum
from datetime import datetime
from .db_setup import db # Importamos la instancia 'db' de SQLAlchemy
from sqlalchemy.dialects.postgresql import JSONB

# 1. Definición del Enumerado de Roles
# Usamos un enum para asegurar que los roles solo sean valores predefinidos.
class Role(enum.Enum):
    ADMIN = 'ADMIN'
    PYME = 'PYME'
    OPERADOR = 'OPERADOR'

# 2. Definición del Modelo de Usuario (Tabla 'usuarios')
class Usuario(db.Model):
    # Nombre de la tabla en la base de datos
    __tablename__ = 'usuarios'

    # Clave Primaria (Autoincremental)
    id = db.Column(db.Integer, primary_key=True)
    
    # UID de Firebase (Clave Única, NO NULA)
    # Este es el ID principal para la autenticación
    firebase_uid = db.Column(db.String(128), unique=True, nullable=False, index=True)
    
    # Email del usuario (Clave Única, NO NULA)
    email = db.Column(db.String(120), unique=True, nullable=False)

    nombre_completo = db.Column(db.String(120), nullable=True) # Ajusta el tamaño y nullable según tu DB
    
    # Rol del usuario (Usamos el enum definido arriba)
    # Usamos native_enum=False para mejor compatibilidad con el soporte de ENUM de SQLAlchemy/PostgreSQL.
    rol = db.Column(db.Enum(Role, name='user_roles', native_enum=False), 
                    nullable=False, default=Role.PYME)
    
    # Marca de tiempo de la creación del registro
    fecha_creacion = db.Column(db.DateTime, default=datetime.utcnow)

    # Representación útil para debug
    def __repr__(self):
        return f"<Usuario {self.email} | Rol: {self.rol.value}>"

# src/database/models.py

class Documento(db.Model):
    __tablename__ = 'documentos'
    id = db.Column(db.Integer, primary_key=True)

    # URL donde se puede acceder al documento subido en Cloudinary
    url_segura = db.Column(db.String(500), nullable=False)

    # Opcional: Nombre original del archivo para mostrar al usuario
    nombre_original = db.Column(db.String(255), nullable=True)

    # Relación con el usuario (Clave foránea)
    user_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=False)
    usuario = db.relationship('Usuario', backref=db.backref('documentos', lazy=True))

    fecha_subida = db.Column(db.DateTime, default=datetime.utcnow)

class ProgresoFormulario(db.Model):
    __tablename__ = 'progreso_formulario'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=False)
    paso_clave = db.Column(db.String(100), nullable=False)
    
    # El tipo de datos que coincidirá con JSONB en PostgreSQL
    datos = db.Column(JSONB, nullable=False, default={}) 
    
    fecha_creacion = db.Column(db.DateTime, default=db.func.now())
    fecha_actualizacion = db.Column(db.DateTime, default=db.func.now(), onupdate=db.func.now())

    __table_args__ = (db.UniqueConstraint('user_id', 'paso_clave', name='_user_paso_uc'),)
    
    # Define la relación con el Usuario
    usuario = db.relationship('Usuario', backref=db.backref('progresos', lazy=True))
    
    def __repr__(self):
        return f"<ProgresoFormulario {self.user_id} - {self.paso_clave}>"