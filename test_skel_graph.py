import numpy as np
from scipy.interpolate import splprep, splev

def extract_kolam_paths_from_skeleton(bool_img, w, h):
    y_coords, x_coords = np.where(bool_img)
    pixels = set(zip(y_coords, x_coords))
    
    adj = {p: [] for p in pixels}
    for y, x in pixels:
        for dy in [-1, 0, 1]:
            for dx in [-1, 0, 1]:
                if dy == 0 and dx == 0: continue
                ny, nx = y + dy, x + dx
                if (ny, nx) in pixels:
                    adj[(y, x)].append((ny, nx))
                    
    visited_edges = set()
    paths = []
    
    def get_most_collinear_neighbor(curr, prev, neighbors):
        if not prev:
            unvisited = [n for n in neighbors if tuple(sorted([curr, n])) not in visited_edges]
            return unvisited[0] if unvisited else None
            
        v1 = (curr[0] - prev[0], curr[1] - prev[1])
        best_n = None
        best_dot = -float('inf')
        for n in neighbors:
            if n == prev: continue
            edge = tuple(sorted([curr, n]))
            if edge in visited_edges: continue
            
            v2 = (n[0] - curr[0], n[1] - curr[1])
            dot = v1[0]*v2[0] + v1[1]*v2[1]
            if dot > best_dot:
                best_dot = dot
                best_n = n
        return best_n

    for start_p in list(pixels):
        unvisited_neighbors = [n for n in adj[start_p] if tuple(sorted([start_p, n])) not in visited_edges]
        if not unvisited_neighbors:
            continue
            
        curr_path = [start_p]
        curr = start_p
        prev = None
        
        while True:
            neighbors = adj[curr]
            next_p = get_most_collinear_neighbor(curr, prev, neighbors)
            
            if not next_p:
                break
                
            visited_edges.add(tuple(sorted([curr, next_p])))
            curr_path.append(next_p)
            prev = curr
            curr = next_p
            
            if curr == curr_path[0] and len(curr_path) > 2:
                break
                
        if len(curr_path) > 10:
            path_x = [p[1] for p in curr_path]
            path_y = [p[0] for p in curr_path]
            
            uniq_x, uniq_y = [path_x[0]], [path_y[0]]
            for px, py in zip(path_x[1:], path_y[1:]):
                if px != uniq_x[-1] or py != uniq_y[-1]:
                    uniq_x.append(px)
                    uniq_y.append(py)
                    
            if len(uniq_x) > 5:
                try:
                    tck, u = splprep([uniq_x, uniq_y], s=5.0, per=(curr_path[0] == curr_path[-1]))
                    u_new = np.linspace(u.min(), u.max(), len(uniq_x))
                    smooth_x, smooth_y = splev(u_new, tck)
                    
                    path_str = ""
                    for i, (px, py) in enumerate(zip(smooth_x, smooth_y)):
                        vx = px / w * 100
                        vy = py / h * 100
                        if i == 0:
                            path_str += f"M {vx:.2f} {vy:.2f} "
                        else:
                            path_str += f"L {vx:.2f} {vy:.2f} "
                    paths.append(path_str)
                except Exception as e:
                    print(f"Spline error: {e}")
                    
    return paths

# dummy test
img = np.zeros((10, 10), dtype=bool)
img[2:8, 5] = True
img[5, 2:8] = True
res = extract_kolam_paths_from_skeleton(img, 10, 10)
print(f"Extracted {len(res)} paths")
