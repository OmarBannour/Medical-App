from flask import Flask, request, jsonify
import requests
import socket
import json

app = Flask(__name__)

# Configuration
OLLAMA_HOST = "http://127.0.0.1:11434"
TEXT_MODEL = "llama3"
TIMEOUT = 60  # 1 minute timeout for text analysis

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

@app.route('/analyze', methods=['POST'])
def analyze_text():
    """Endpoint for text analysis from PDFs"""
    if not is_port_open("127.0.0.1", 11434):
        return jsonify({
            'error': 'Ollama service not running',
            'solution': 'Start Ollama with: ollama serve'
        }), 503

    if not request.is_json:
        return jsonify({'error': 'Request must be JSON'}), 400

    if 'text' not in request.json:
        return jsonify({'error': 'No text provided'}), 400

    try:
        payload = {
            "model": TEXT_MODEL,
            "prompt": f"""You are a skilled medical document analyst. Review the following medical document carefully and provide a comprehensive analysis.
INSTRUCTIONS:
1. analyse the document and say what the patient has as a sickness.
2. Identify and explain all critical medical terms, abbreviations, and values with their significance.
3. Recommend specific next steps, follow-up actions, or additional tests if needed.
4. Highlight any urgent concerns or red flags that require immediate attention.


Document content: {request.json['text']}

Return valid JSON format with keys : summary: ,  recommendations: , in single paragraphs.""",
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
            try:
                parsed_response = json.loads(result['response'])
                return jsonify(parsed_response)
            except json.JSONDecodeError:
                return jsonify({
                    'error': 'Invalid JSON response from model',
                    'raw_response': result['response']
                }), 500
        return jsonify(result)

    except requests.exceptions.ConnectionError:
        return jsonify({
            'error': 'Could not connect to Ollama service',
            'solution': 'Make sure Ollama is running at ' + OLLAMA_HOST
        }), 503
    except requests.exceptions.Timeout:
        return jsonify({
            'error': 'Request to Ollama timed out',
            'solution': 'Try again or increase the timeout setting'
        }), 504
    except Exception as e:
        return jsonify({
            'error': 'Text analysis failed',
            'details': str(e)
        }), 500

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)
