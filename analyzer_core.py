import sys
import json
import base64
import urllib.request
import urllib.error
import os

def analyze_kolam_data(b64_image: str, mime_type: str, prompt_path: str = "../kolam_agent_prompt.md"):
    api_key = "AIzaSyCd7fjcbJU0vV3pC5dvAq0llxx8bKUTOtQ"
    
    # Load the prompt
    try:
        with open(prompt_path, 'r', encoding='utf-8') as f:
            system_prompt = f.read()
    except Exception as e:
        return {"error": f"Error reading prompt file: {str(e)}"}

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
                return {"success": True, "data": parsed_json}
            except Exception as e:
                return {"error": f"Failed to parse AI response: {str(e)}", "raw": result}
    except urllib.error.HTTPError as e:
        return {"error": f"HTTP Error: {e.code} - {e.read().decode('utf-8')}"}
    except Exception as e:
        return {"error": f"Error making request: {str(e)}"}
