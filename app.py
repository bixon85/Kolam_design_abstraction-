from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
from kolam_orchestrator import run_orchestrator
import os
import urllib.request
import json
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

app = Flask(__name__)
CORS(app)

@app.route('/api/analyze', methods=['POST'])
def analyze():
    if 'image' not in request.files:
        return jsonify({"error": "No image part in the request"}), 400
        
    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
        
    if file:
        image_data = file.read()
        b64_image = base64.b64encode(image_data).decode("utf-8")
        
        # Analyze using LangGraph Multi-Agent Orchestrator
        result = run_orchestrator(b64_image)
        
        if "error" in result:
            return jsonify(result), 500
            
        return jsonify(result)

@app.route('/api/chat', methods=['POST'])
def chat():
    gemini_key = os.environ.get("GEMINI_API_KEY")
    openai_key = os.environ.get("OPENAI_API_KEY")
    
    if not gemini_key and not openai_key:
        return jsonify({"error": "Neither GEMINI_API_KEY nor OPENAI_API_KEY is configured on the server"}), 400
        
    data = request.json or {}
    message = data.get("message")
    history = data.get("history", [])
    context = data.get("context", {})
    
    if not message:
        return jsonify({"error": "No message provided"}), 400
        
    # Construct System prompt
    system_prompt = (
        "You are the 'Kolam Guru', a warm, encouraging, and highly knowledgeable guide specializing in traditional Indian Kolam and Rangoli art.\n"
        "Your role is to teach the user how to draw Kolams, explain their mathematical symmetry, and share their cultural/historical significance.\n"
        "Keep your responses relatively concise, friendly, and structured. Use bullet points where appropriate.\n\n"
        "Current Context of the active Kolam drawing session:\n"
        f"- Pattern Style: {context.get('pattern_type', 'Traditional Kolam')}\n"
        f"- Total Steps: {context.get('total_steps', 'Unknown')}\n"
        f"- Active Step: Step {context.get('current_step', 1)}: \"{context.get('step_title', '')}\"\n"
        f"- Active Step Instruction: {context.get('step_instruction', 'No active instruction.')}\n\n"
        "Instructions:\n"
        "1. If the user asks about the history/significance, tell them the traditional lore or significance of the pattern or Kolam in general.\n"
        "2. If they ask for drawing tips, give specific advice relative to the active step instruction or basic Kolam practices (e.g. maintaining grid spacing, smooth curves).\n"
        "3. If they ask about mathematical concepts, explain dot-grids, symmetry types, or closed loop topology (like Euler paths in Sikku Kolams) in an approachable way."
    )
    
    if gemini_key:
        # Use Gemini 2.5 Flash
        gemini_contents = []
        for msg in history:
            role = "user" if msg.get("sender") == "user" else "model"
            gemini_contents.append({
                "role": role,
                "parts": [{"text": msg.get("text", "")}]
            })
        gemini_contents.append({
            "role": "user",
            "parts": [{"text": message}]
        })
        
        payload = {
            "systemInstruction": {
                "parts": [{"text": system_prompt}]
            },
            "contents": gemini_contents
        }
        
        models_to_try = ["gemini-2.5-flash", "gemini-1.5-flash"]
        reply = None
        last_err = None
        
        for model_name in models_to_try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={gemini_key}"
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode('utf-8'),
                headers={'Content-Type': 'application/json'}
            )
            try:
                with urllib.request.urlopen(req) as response:
                    res = json.loads(response.read().decode('utf-8'))
                    reply = res["candidates"][0]["content"]["parts"][0]["text"]
                    break
            except Exception as e:
                print(f"Gemini API Error with {model_name}: {e}")
                last_err = e
                
        if reply:
            return jsonify({"reply": reply})
        else:
            return jsonify({"error": f"Failed to get response from Gemini AI: {str(last_err)}"}), 500
            
    else:
        # Fallback to OpenAI gpt-4o-mini
        openai_messages = [{"role": "system", "content": system_prompt}]
        for msg in history:
            role = "user" if msg.get("sender") == "user" else "assistant"
            openai_messages.append({"role": role, "content": msg.get("text", "")})
        openai_messages.append({"role": "user", "content": message})
        
        payload = {
            "model": "gpt-4o-mini",
            "messages": openai_messages,
            "temperature": 0.7
        }
        
        req = urllib.request.Request(
            "https://api.openai.com/v1/chat/completions",
            data=json.dumps(payload).encode('utf-8'),
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {openai_key}'
            }
        )
        
        try:
            with urllib.request.urlopen(req) as response:
                res = json.loads(response.read().decode('utf-8'))
                reply = res["choices"][0]["message"]["content"]
                return jsonify({"reply": reply})
        except Exception as e:
            print(f"OpenAI API Error: {e}")
            return jsonify({"error": f"Failed to get response from OpenAI AI: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=False, port=5000)
