from celery import Celery
from app.config import settings

celery_app = Celery(
    "vehitrack_tasks",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.REDIS_URL
)

celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
)

# Autodiscover tasks from app.tasks
celery_app.autodiscover_tasks(['app.tasks'])
