"""
ASGI entrypoint for running the Django backend using Uvicorn:
    uvicorn main:app --reload
    uv run uvicorn main:app --reload
"""
import os
import django
from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

# ASGI application exposed as `app` for uvicorn main:app
app = get_asgi_application()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
