from flask import Flask
from utils.database import init_db, db
from utils.routes import register_routes

def create_app():
    app = Flask(__name__)
    
    # Configuración
    app.config['SECRET_KEY'] = 'FIJ40$=$=eorFRKLrfk404'
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///vocab.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
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
            default_languages = ['Inglés', 'Alemán']  # CAMBIADO
            for lang in default_languages:
                new_lang = Language(language=lang, active=True)
                db.session.add(new_lang)
        
        # Crear características por defecto si no existen
        if not Feature.query.first():
            default_features = ['A1', 'A2', 'B1', 'B2', 'C1']  # CAMBIADO
            for feat in default_features:
                new_feat = Feature(feature=feat, active=True)
                db.session.add(new_feat)
        
        db.session.commit()
    
    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)