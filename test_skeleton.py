import cv2
import numpy as np
import base64
from skimage.morphology import skeletonize

def test():
    # Create a dummy image with a thick cross (intersection)
    img = np.zeros((100, 100), dtype=np.uint8)
    cv2.line(img, (20, 50), (80, 50), 255, 10)
    cv2.line(img, (50, 20), (50, 80), 255, 10)
    
    # Skeletonize
    bool_img = img > 127
    skeleton = skeletonize(bool_img).astype(np.uint8) * 255
    
    # Find contours of skeleton
    contours, _ = cv2.findContours(skeleton, cv2.RETR_LIST, cv2.CHAIN_APPROX_NONE)
    print(f"Found {len(contours)} contours in skeleton.")
    for c in contours:
        print(f"Contour length: {len(c)}")
        
if __name__ == "__main__":
    test()
