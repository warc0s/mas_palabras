# mas_palabras

Aplicación Flask para gestionar vocabulario personal, practicarlo con quizzes y exponer una API.

## Instalación

```bash
python -m venv .venv
source .venv/bin/activate  # En Windows usa .venv\Scripts\activate
pip install -r requirements.txt
```

Crea un fichero `.env` o exporta las variables necesarias (`SECRET_KEY`, `SQLALCHEMY_DATABASE_URI`, etc.).

## Desarrollo local

```bash
export FLASK_CONFIG=development  # Ajusta según el entorno
flask --app app run
```

La factoría `create_app` aplica overrides de entorno, registra blueprints y configura logging estructurado.

## Tests y chequeo estático

```bash
pytest
mypy --config-file mypy.ini
```

Los tests incluyen validaciones de importaciones, duplicados, ordenaciones y flujo del quiz. El chequeo estático falla si se introducen funciones sin tipar en los módulos supervisados.

## Despliegue en producción

La aplicación está preparada para ejecutarse detrás de un reverse proxy con Gunicorn:

```bash
gunicorn -c gunicorn.conf.py wsgi:app
```

El fichero `gunicorn.conf.py` define `preload_app`, keep-alive y timeouts razonables. Asegúrate de configurar las variables de entorno de base de datos y el secreto antes de desplegar.
