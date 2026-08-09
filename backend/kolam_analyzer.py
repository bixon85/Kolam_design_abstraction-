import sys
import json
import base64
import urllib.request
import urllib.error
import argparse
import os

def analyze_kolam(image_path: str, prompt_path: str):
    api_key = "AIzaSyCd7fjcbJU0vV3pC5dvAq0llxx8bKUTOtQ"
    
    # Load the prompt
    try:
        with open(prompt_path, 'r', encoding='utf-8') as f:
            system_prompt = f.read()
    except Exception as e:
        print(f"Error reading prompt file: {e}", file=sys.stderr)
        sys.exit(1)
        
    # Read and encode image
    if not os.path.exists(image_path):
        print(f"Error: Image not found at {image_path}", file=sys.stderr)
        sys.exit(1)
        
    try:
        with open(image_path, "rb") as f:
            image_data = f.read()
            # Determine mime type naively
            mime_type = "image/png"
            if image_path.lower().endswith((".jpg", ".jpeg")):
                mime_type = "image/jpeg"
            b64_image = base64.b64encode(image_data).decode("utf-8")
    except Exception as e:
        print(f"Error reading image: {e}", file=sys.stderr)
        sys.exit(1)

    print(f"Analyzing image: {image_path}...")
    print("This may take a few seconds...")
    
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
    
    payload = {
        "contents": [{
            "parts": [
                {"text": system_prompt},
                {"inline_data": {
                    "mime_type": mime_type,
                    "data": b64_image
                }}
            ]
        }],
        "generationConfig": {
            "responseMimeType": "application/json"
        }
    }
    
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
    
    try:
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode('utf-8'))
            try:
                text_content = result["candidates"][0]["content"]["parts"][0]["text"]
                parsed_json = json.loads(text_content)
                print("\n--- ANALYSIS RESULT ---")
                print(json.dumps(parsed_json, indent=2))
            except Exception as e:
                print("\n--- ANALYSIS RESULT (Raw output) ---")
                print(result)
    except urllib.error.HTTPError as e:
        print(f"HTTP Error: {e.code} - {e.read().decode('utf-8')}", file=sys.stderr)
    except Exception as e:
        print(f"Error making request: {e}", file=sys.stderr)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Kolam & Rangoli Analysis System")
    parser.add_argument("image_path", help="Path to the Kolam image to analyze")
    parser.add_argument("--prompt", default="kolam_agent_prompt.md", help="Path to the agent prompt markdown file")
    
    args = parser.parse_args()
    analyze_kolam(args.image_path, args.prompt)
