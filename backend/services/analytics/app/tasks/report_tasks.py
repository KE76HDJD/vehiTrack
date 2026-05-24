from .celery_app import celery_app
from app.utils.minio_client import minio_client
import io
from reportlab.pdfgen import canvas
from datetime import datetime

@celery_app.task(bind=True, max_retries=3)
def generate_pdf_report(self, report_id: str, zone_name: str, start_date: str, end_date: str):
    try:
        # 1. Create PDF in memory
        buffer = io.BytesIO()
        c = canvas.Canvas(buffer)
        c.drawString(100, 750, f"VehiTrack Pro - Report for {zone_name}")
        c.drawString(100, 730, f"Period: {start_date} to {end_date}")
        c.drawString(100, 710, f"Generated at: {datetime.utcnow().isoformat()}")
        # ... add more content ...
        c.save()
        
        buffer.seek(0)
        pdf_data = buffer.getvalue()
        
        # 2. Upload to MinIO
        file_name = f"report_{report_id}.pdf"
        minio_client.upload_file(
            "reports", 
            file_name, 
            io.BytesIO(pdf_data), 
            len(pdf_data), 
            "application/pdf"
        )
        
        # 3. Update DB (Note: Celery task doesn't have easy access to fastAPI DB session)
        # In real implementation, we'd use a synchronous SQLAlchemy engine here
        
        return {"status": "completed", "file": file_name}
        
    except Exception as exc:
        raise self.retry(exc=exc)
