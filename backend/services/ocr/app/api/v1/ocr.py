from fastapi import APIRouter, UploadFile, File, HTTPException
import cv2
import numpy as np
import pytesseract
import time
import logging
from backend.common.app.schemas.common import APIResponse

router = APIRouter()
logger = logging.getLogger(__name__)

def preprocess_image(img):
    """Preprocess image for better OCR results."""
    # Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Bilateral filter to remove noise while keeping edges sharp
    gray = cv2.bilateralFilter(gray, 11, 17, 17)
    
    # Canny edge detection
    edged = cv2.Canny(gray, 30, 200)
    
    return gray, edged

def find_plate_contour(edged):
    """Find the potential contour of the license plate."""
    contours, _ = cv2.findContours(edged.copy(), cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
    contours = sorted(contours, key=cv2.contourArea, reverse=True)[:10]
    
    screen_cnt = None
    for c in contours:
        # Approximate the contour
        peri = cv2.arcLength(c, True)
        approx = cv2.approxPolyDP(c, 0.018 * peri, True)
        
        # License plates are rectangular (4 points)
        if len(approx) == 4:
            screen_cnt = approx
            break
            
    return screen_cnt

@router.post("/extract", response_model=APIResponse[dict])
async def extract_plate(file: UploadFile = File(...)):
    start_time = time.time()
    
    # Load image
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if img is None:
        return APIResponse(
            success=False,
            error_code="INVALID_IMAGE",
            message="Impossible de décoder l'image fournie."
        )

    try:
        # Step 1: Preprocessing
        gray, edged = preprocess_image(img)
        
        # Step 2: Detection (Optional: can just use full image if detection fails)
        screen_cnt = find_plate_contour(edged)
        
        if screen_cnt is not None:
            # Masking everything except the plate
            mask = np.zeros(gray.shape, np.uint8)
            cv2.drawContours(mask, [screen_cnt], 0, 255, -1)
            (x, y) = np.where(mask == 255)
            (topx, topy) = (np.min(x), np.min(y))
            (bottomx, bottomy) = (np.max(x), np.max(y))
            cropped = gray[topx:bottomx+1, topy:bottomy+1]
        else:
            cropped = gray # Fallback to full image (grayscale)

        # Step 3: OCR
        # --psm 7: Treat the image as a single text line.
        config = '--psm 7 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-'
        text = pytesseract.image_to_string(cropped, config=config)
        plate_number = text.strip()
        
        processing_time = int((time.time() - start_time) * 1000)
        
        return APIResponse(
            success=True,
            data={
                "plate_number": plate_number,
                "confidence": 0.85 if plate_number else 0.0,
                "raw_text": text,
                "processing_time_ms": processing_time
            }
        )
    except Exception as e:
        logger.error(f"OCR Error: {e}")
        return APIResponse(
            success=False,
            error_code="OCR_PROCESSING_FAILED",
            message=f"Erreur lors du traitement OCR : {str(e)}"
        )
