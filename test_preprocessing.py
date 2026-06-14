import cv2
import numpy as np
from skimage.morphology import skeletonize
from scipy.interpolate import splprep, splev

def create_synthetic_kolam():
    # White background
    img = np.ones((400, 400), dtype=np.uint8) * 255
    # Draw dark grid dots
    for i in range(3):
        for j in range(3):
            cv2.circle(img, (100 + i*100, 100 + j*100), 5, 0, -1)
    
    # Draw a dark looping line
    # Simple infinity loop around dots
    cv2.ellipse(img, (150, 150), (80, 40), 45, 0, 360, 0, 8)
    cv2.ellipse(img, (250, 250), (80, 40), 45, 0, 360, 0, 8)
    
    # Add an edge artifact
    cv2.line(img, (5, 0), (5, 400), 0, 4)
    
    return img

def process_kolam(img):
    blurred = cv2.GaussianBlur(img, (5, 5), 0)
    
    corners = [blurred[0,0], blurred[0,-1], blurred[-1,0], blurred[-1,-1]]
    bg_color = sum(corners) / 4.0
    
    if bg_color > 127:
        thresh = cv2.adaptiveThreshold(blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 15, 5)
    else:
        thresh = cv2.adaptiveThreshold(blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 15, 5)
        
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
    thresh = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel, iterations=1)
    thresh = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel, iterations=2)
    
    # Crop and Pad
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if contours:
        valid_contours = [c for c in contours if cv2.contourArea(c) > 50]
        if valid_contours:
            all_points = np.vstack(valid_contours)
            x, y, w, h = cv2.boundingRect(all_points)
            cropped = thresh[y:y+h, x:x+w]
            padding = 20
            thresh = cv2.copyMakeBorder(cropped, padding, padding, padding, padding, cv2.BORDER_CONSTANT, value=0)
            
    # Dot detection
    contours_orig, _ = cv2.findContours(thresh, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
    dots = []
    for c in contours_orig:
        area = cv2.contourArea(c)
        if area < 10 or area > 1000: continue
            
        perimeter = cv2.arcLength(c, True)
        if perimeter == 0: continue
        circularity = 4 * np.pi * area / (perimeter * perimeter)
        
        x, y, wc, hc = cv2.boundingRect(c)
        aspect_ratio = float(wc)/hc if hc > 0 else 0
        
        # Dots are typically small, solid, circular objects.
        # But wait! If the image is a solid line, sometimes small loops are detected.
        # A true dot is usually filled. In our threshold, dots are solid white.
        if 0.5 < aspect_ratio < 2.0 and circularity > 0.6:
            # We can also check solidity
            hull = cv2.convexHull(c)
            hull_area = cv2.contourArea(hull)
            solidity = float(area)/hull_area if hull_area > 0 else 0
            if solidity > 0.8:
                M = cv2.moments(c)
                if M['m00'] != 0:
                    cx = (M['m10'] / M['m00']) / thresh.shape[1] * 100
                    cy = (M['m01'] / M['m00']) / thresh.shape[0] * 100
                    dots.append({"cx": cx, "cy": cy})
                    cv2.drawContours(thresh, [c], -1, 0, -1)
                    
    # Skeletonize
    bool_img = thresh > 127
    skeleton = skeletonize(bool_img).astype(np.uint8) * 255
    contours, _ = cv2.findContours(skeleton, cv2.RETR_LIST, cv2.CHAIN_APPROX_NONE)
    
    paths = []
    for c in contours:
        if len(c) < 50: continue
        c = c.squeeze()
        if len(c.shape) != 2: continue
            
        path_x = c[:, 0]
        path_y = c[:, 1]
        
        uniq_x, uniq_y = [path_x[0]], [path_y[0]]
        for px, py in zip(path_x[1:], path_y[1:]):
            if px != uniq_x[-1] or py != uniq_y[-1]:
                uniq_x.append(px)
                uniq_y.append(py)
                
        if len(uniq_x) > 10:
            try:
                # To prevent splprep from crashing on self-intersecting complex graphs,
                # we can use a higher smoothing factor and lower degree if needed.
                tck, u = splprep([uniq_x, uniq_y], s=15.0, per=True) 
                u_new = np.linspace(u.min(), u.max(), len(uniq_x))
                smooth_x, smooth_y = splev(u_new, tck)
                paths.append(len(smooth_x))
            except Exception as e:
                print(f"Spline error: {e}")
                
    print(f"Dots: {len(dots)}, Paths: {len(paths)}")
    # cv2.imwrite("test_thresh.png", thresh)
    # cv2.imwrite("test_skeleton.png", skeleton)

if __name__ == "__main__":
    img = create_synthetic_kolam()
    process_kolam(img)
