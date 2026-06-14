This project is a hybrid computer vision and generative AI platform designed to analyze, reconstruct, and teach traditional Indian Kolam and Rangoli floor art. It extracts drawing paths from photos and generates interactive, step-by-step drawing tutorials

⚙️ Backend ArchitectureThe backend consists of a Flask application integrating python-based computer vision (OpenCV, SciPy, scikit-image) and the LangChain orchestrator.1. backend/app.pyProvides HTTP endpoints for the React frontend:*/api/analyze (POST): Receives a multi-part form containing a Kolam image file, converts it into a Base64 string, and forwards it to the Multi-Agent orchestrator (run_orchestrator).*/api/chat (POST): Powers the Kolam Guru interactive chat. It constructs a system prompt that gives the model context about the current drawing step, the pattern's symmetry, and history. It makes direct requests to the Gemini API (gemini-2.5-flash or gemini-1.5-flash), with a fallback request to OpenAI's gpt-4o-mini.2. backend/kolam_orchestrator.pyDefines a structured, step-by-step execution chain using LangChain RunnableLambda units. It pipelines raw images into mathematical arrays and outputs structured JSON data.2. backend/kolam_orchestrator.py


Defines a structured, step-by-step execution chain using LangChain RunnableLambda units. It pipeli raw images into mathematical arrays and outputs structured JSON data.

kolam chain = (
preprocess_runnable
math extract runnable
generative_runnable
mongodb runnable
final_runnable)

The Five Agents:

1. Agent 1: Preprocessing (agent_preprocessing):

Takes the uploaded base64 image and decodes it using OpenCV.

o Analyzes corner pixels to determine if the background is light or dark.

o Performs adaptive thresholding: THRESH BINARY_INV for light backgrounds and THRESH BINARY for dark backgrounds.

Cleans noise using morphological operations (MORPH_OPEN, MORPH_CLOSE).Crops to bounds based on contours and pads with a black border to prevent skeletonization artifacts.

2.

Agent 2: Mathematical Extraction (agent_math_extraction):

Dot Detection: Detects the dot matrix grid (pulli grid) using circularity, solidity, and aspect ratio filters. Circular dots are mapped to coordinate space, and then drawn in black so they do not interfere with line detection.

Skeletonization: Computes a 1-pixel wide skeleton using

skimage.morphology.skeletonize.

B-Spline Fitting: Traces contours from the skeleton, de-duplicates adjacent points, applies SciPy B-Spline interpolation (splprep, splev) to output smooth, fluid SVG strings (M... L... Z).

3. Agent 3: Generative Reconstruction (agent generative reconstruction):

Uses Gemini to map the mathematical SVG paths back into a human-friendly drawi sequence.

The model maps pre-extracted path indices (path_0, path 1, etc.) into drawing ste based on kolam agent prompt.md.

Falls back to a local Ollama gwen-v1 model if the Gemini API fails or returns incomp steps.

4. Agent 4: Database Storage (agent_mongodb):

Logs analysis metadata, symmetry results, and tutorial steps to MongoDB database 5. Agent 5: Final Aggregator (agent_final_aggregator):

Combines calculations into a final payload (complexity, symmetry score, grid size, suggestions, drawing strategy, step sequence).

Frontend Architecture

The frontend is a single-page React app bundled with Vite and styled using clean, modern CSS.

Pages & Routing
Landing (Landing. jsx): The home page. Displays key features and an interactive rotating background vector Kolam.

Dashboard (Dashboard. jsx): Features a drag-and-drop zone to upload images. Once anal it shows the original image alongside the reconstructed SVG, complexity indicators, detecte dimensions, symmetry metrics, quality metrics, and issues.

Generator (Generator. jsx): A mathematical playground allowing users to dynamically des custom patterns. Users select:
Grid Dimension (3x3, 5x5, 7x7Kolam Style: Padi (concentric lines/squares), Pulli (symmetric floral stars), or Sikku (interwoven waves weaving around dots).
The generator calculates and renders SVGs instantly and configures a tutorial seque
Tutorial (Tutorial. jsx):
)
Interactive Canvas: Renders the dots and animates paths for the active step using animations. Users can step forward/backward or toggle Auto-Play.
SVG Downloader: Allows downloading individual steps as vectors.

Al Chat Sidebar: Connects to the Kolam Guru endpoint, enabling students to ask questions about traditional significance, drawing techniques, or mathematical properties.
Explore (Explore. jsx): Provides pre-configured designs (Lotus Pond Star, Infinite Knot, Sir Diya).
Auth (Auth. jsx): Mock login system using localStorage states.
Computer Vision & Path Extraction Algorithms
The centerline extraction pipeline is key to producing smooth vector graphics:

1. Grid Isolation

To prevent the skeletonizer from fusing dots to lines, dots must be removed. The system filters con based on geometric parameters: $$\text{Circularity} = \frac{4\pi \times \text{Area}}{\text{Perimete > 0.6 \quad \text{and} \quad \text(Solidity} = \frac{\text(Area}}{\text{Convex Hull Area}} > 0.8$$ Af locating dots, their coordinate centroids are saved, and the dots are masked (colored black) in the image.

2. Line Skeletonization

The binary image is thinned down to 1-pixel centerlines using Scikit-Image's morphological skeletonization.

3. Spline Interpolation

Raw skeleton coordinates can be jagged. The system uses SciPy B-Spline interpolation:

Traces paths using OpenCV's findContours.

Filters out small segments (under 50 coordinates).

Fits a parametric spline curve using scipy. interpolate. splprep with a smoothing factor 15.0$ and periodic configuration per=True (forcing closed loops).

Re-evaluates points with scipy. interpolate. splev to generate fluid curves.Configuration & Env Setup



Environment variables are located in backend/. env:

MONGODB URI: Connection string to the MongoDB cluster.

OPENAI_API_KEY: Key used for the GPT-4o-mini chatbot fallback.

GEMINI API KEY: Key used for the Gemini
