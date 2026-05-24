import cv2
import pytesseract
import numpy as np
from pydantic import BaseModel

class OCRResult(BaseModel):
    plate: str
    confidence: float
    needs_manual_review: bool

class OCRService:
    @staticmethod
    async def extract_plate(image_bytes: bytes) -> OCRResult:
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # 1. Grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # 2. Thresholding
        thresh = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
        
        # 3. OCR via Tesseract
        config = '--psm 8 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
        data = pytesseract.image_to_data(thresh, config=config, output_type=pytesseract.Output.DICT)
        
        # Simple extraction logic (first significant word usually)
        plate_text = ""
        confidences = []
        for i, text in enumerate(data['text']):
            if len(text.strip()) > 3:
                plate_text = text.strip().upper()
                confidences.append(float(data['conf'][i]))
                break
        
        avg_conf = sum(confidences) / len(confidences) if confidences else 0
        
        return OCRResult(
            plate=plate_text,
            confidence=avg_conf,
            needs_manual_review=avg_conf < 60
        )

ocr_service = OCRService()
