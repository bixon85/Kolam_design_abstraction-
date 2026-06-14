import cv2
import numpy as np
from skimage.morphology import skeletonize
from scipy.interpolate import splprep, splev

def extract_paths_v2(thresh):
    h, w = thresh.shape
    
    # 1. Detect Dots
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
        
        if 0.5 < aspect_ratio < 2.0 and circularity > 0.5:
            M = cv2.moments(c)
            if M['m00'] != 0:
                cx = (M['m10'] / M['m00']) / w * 100
                cy = (M['m01'] / M['m00']) / h * 100
                dots.append({"cx": cx, "cy": cy})
                cv2.drawContours(thresh, [c], -1, 0, -1)

    # 2. Skeletonize and extract paths
    bool_img = thresh > 127
    skeleton = skeletonize(bool_img).astype(np.uint8) * 255
    contours, _ = cv2.findContours(skeleton, cv2.RETR_LIST, cv2.CHAIN_APPROX_NONE)
    
    paths = []
    for c in contours:
        if len(c) < 50: continue
        c = c.squeeze()
        if len(c.shape) != 2: continue
            
        x = c[:, 0]
        y = c[:, 1]
        
        uniq_x, uniq_y = [x[0]], [y[0]]
        for px, py in zip(x[1:], y[1:]):
            if px != uniq_x[-1] or py != uniq_y[-1]:
                uniq_x.append(px)
                uniq_y.append(py)
                
        if len(uniq_x) > 10:
            try:
                tck, u = splprep([uniq_x, uniq_y], s=5.0, per=True) 
                u_new = np.linspace(u.min(), u.max(), len(uniq_x))
                smooth_x, smooth_y = splev(u_new, tck)
                
                path_str = ""
                for i, (px, py) in enumerate(zip(smooth_x, smooth_y)):
                    vx = px / w * 100
                    vy = py / h * 100
                    if i == 0: path_str += f"M {vx:.2f} {vy:.2f} "
                    else: path_str += f"L {vx:.2f} {vy:.2f} "
                path_str += "Z"
                paths.append(path_str)
            except Exception as e:
                print(f"Spline error: {e}")
                
    print(f"Dots: {len(dots)}, Paths: {len(paths)}")
    return dots, paths

if __name__ == "__main__":
    img = np.zeros((200, 200), dtype=np.uint8)
    cv2.circle(img, (100, 100), 10, 255, -1)
    cv2.line(img, (20, 20), (180, 180), 255, 5)
    cv2.line(img, (20, 180), (180, 20), 255, 5)
    extract_paths_v2(img)
