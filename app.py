from flask import Flask
from utils.database import init_db, db
from utils.routes import register_routes
import os

def create_app():
    app = Flask(__name__)
    
    # Configuración
    app.config['SECRET_KEY'] = '***REMOVED***'
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///vocab.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # CONFIGURACIÓN PARA ARCHIVOS
    app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024  # 10MB máximo
    app.config['UPLOAD_FOLDER'] = 'uploads'
    
    # Crear carpeta de uploads si no existe
    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        os.makedirs(app.config['UPLOAD_FOLDER'])
    
    # Inicializar base de datos
    init_db(app)
    
    # Registrar rutas
    register_routes(app)
    
    # Crear tablas si no existen
    with app.app_context():
        db.create_all()
        
        # Migrar datos existentes (añadir campo active si no existe)
        from utils.models import Language, Feature
        
        # Actualizar idiomas existentes para que sean activos
        existing_languages = Language.query.all()
        for lang in existing_languages:
            if not hasattr(lang, 'active') or lang.active is None:
                lang.active = True
        
        # Actualizar características existentes para que sean activas
        existing_features = Feature.query.all()
        for feat in existing_features:
            if not hasattr(feat, 'active') or feat.active is None:
                feat.active = True
        
        # Crear idiomas por defecto si no existen
        if not Language.query.first():
            default_languages = ['Inglés', 'Alemán']
            for lang in default_languages:
                new_lang = Language(language=lang, active=True)
                db.session.add(new_lang)
        
        # Crear características por defecto si no existen
        if not Feature.query.first():
            default_features = ['A1', 'A2', 'B1', 'B2', 'C1']
            for feat in default_features:
                new_feat = Feature(feature=feat, active=True)
                db.session.add(new_feat)
        
        db.session.commit()
    
    # MANEJO DE ERRORES MEJORADO
    @app.errorhandler(404)
    def not_found_error(error):
        flash('Página no encontrada.', 'error')
        return redirect(url_for('index'))

    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        flash('Error interno del servidor.', 'error')
        return redirect(url_for('index'))
    
    @app.errorhandler(413)
    def too_large(error):
        flash('El archivo es demasiado grande. Máximo 10MB.', 'error')
        return redirect(request.url)
    
    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)