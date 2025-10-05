"""Gunicorn configuration for running the mas_palabras application in production."""

import multiprocessing

bind = "0.0.0.0:8000"
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "gthread"
threads = 2
preload_app = True
keepalive = 5
timeout = 30
graceful_timeout = 30
loglevel = "info"
accesslog = "-"
errorlog = "-"
