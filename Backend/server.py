from flask import Flask, request, jsonify
import requests
import base64
import tempfile
import os
import socket
import json

app = Flask(__name__)

# Configuration
OLLAMA_HOST = "http://127.0.0.1:11434"
VISION_MODEL = "llama3.2-vision"
TEXT_MODEL = "llama3"
TIMEOUT = 300  # 5 minutes timeout

def is_port_open(host, port):
    try:
        with socket.create_connection((host, port), timeout=2):
            return True
    except:
        return False

@app.after_request
def add_cors_headers(response):
    response.headers.update({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    })
    return response

@app.route('/analyze-image', methods=['POST'])
def analyze_image():
    """Endpoint for image analysis (kept exactly as before)"""
    if not is_port_open("127.0.0.1", 11434):
        return jsonify({
            'error': 'Ollama service not running',
            'solution': 'Start Ollama with: ollama serve'
        }), 503

    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']
    if not file or file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    try:
        with tempfile.NamedTemporaryFile(delete=False) as temp_file:
            file.save(temp_file.name)
            with open(temp_file.name, "rb") as f:
                image_data = base64.b64encode(f.read()).decode('utf-8')

        payload = {
            "model": VISION_MODEL,
            "prompt": """Analyze this medical image. Provide:
- Detailed description
- 3 potential diagnoses
- Recommended next steps

Return valid JSON format with keys: description, diagnoses[], recommendations[]""",
            "images": [image_data],
            "stream": False,
            "format": "json"
        }

        response = requests.post(
            f"{OLLAMA_HOST}/api/generate",
            json=payload,
            timeout=TIMEOUT
        )
        response.raise_for_status()
        result = response.json()

        if 'response' in result:
            return jsonify(json.loads(result['response']))
        return jsonify(result)

    except Exception as e:
        return jsonify({
            'error': 'Image processing failed',
            'details': str(e)
        }), 500
    finally:
        if 'temp_file' in locals():
            os.unlink(temp_file.name)

@app.route('/analyze', methods=['POST'])
def analyze_text():
    """New endpoint for text analysis from PDFs"""
    if not is_port_open("127.0.0.1", 11434):
        return jsonify({
            'error': 'Ollama service not running',
            'solution': 'Start Ollama with: ollama serve'
        }), 503

    if 'text' not in request.json:
        return jsonify({'error': 'No text provided'}), 400

    try:
        payload = {
            "model": TEXT_MODEL,
            "prompt": f"""Analyze this medical document. Provide:
- Key findings and summary
- Important medical terms
- Potential diagnoses
- Recommended actions

Document content:
{request.json['text']}

Return valid JSON format with keys: summary, terms[], diagnoses[], recommendations[]""",
            "stream": False,
            "format": "json"
        }

        response = requests.post(
            f"{OLLAMA_HOST}/api/generate",
            json=payload,
            timeout=60  # Shorter timeout for text analysis
        )
        response.raise_for_status()
        result = response.json()

        if 'response' in result:
            return jsonify(json.loads(result['response']))
        return jsonify(result)

    except Exception as e:
        return jsonify({
            'error': 'Text analysis failed',
            'details': str(e)
        }), 500

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)
