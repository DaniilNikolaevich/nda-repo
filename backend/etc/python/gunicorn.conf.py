import multiprocessing


bind = "0.0.0.0:8000"
# workers = multiprocessing.cpu_count() * 2 + 1
workers = 2
wsgi_app = "settings.wsgi"
reload = True
max_requests = 1000
timeout = 120
