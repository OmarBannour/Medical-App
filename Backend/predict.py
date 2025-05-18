import os
from flask import Flask, request, jsonify
import torch
import torchvision.transforms as transforms
from PIL import Image
import io
import sys
import asyncio
import requests

# Fix for Windows asyncio issue
# Fix for Windows asyncio error
if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

app = Flask(__name__)

# Configuration
UPLOAD_FOLDER = 'temp'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'ecg_model_torchscript.pt')
OLLAMA_HOST = "http://127.0.0.1:11434"
TEXT_MODEL = "llama3"
TIMEOUT = 30  # 30 seconds timeout for LLM inference

def transform_image(image_bytes):
    """Process image for model input"""
    try:
        image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])
        return transform(image).unsqueeze(0)
    except Exception as e:
        raise ValueError(f"Image processing failed: {str(e)}")

def get_interpretation(prediction_data):
    """Get natural language interpretation of ECG results using Ollama"""
    try:
        # Create a natural language prompt for the model
        prompt = f"""You are a cardiologist interpreting ECG results. Here are the findings:

- Prediction: {prediction_data['prediction']}
- Confidence: {prediction_data['confidence']:.2f}%
- Probability healthy: {prediction_data['probabilities']['healthy']:.2f}%
- Probability abnormal/sick: {prediction_data['probabilities']['sick']:.2f}%

Please provide a brief, human-friendly interpretation of these results in 2-3 sentences. Explain what these results might mean for the patient in simple terms. If the prediction is 'sick', suggest what might be the concern based on the confidence level. If the prediction is 'healthy', indicate if there are any caveats based on the confidence level."""

        payload = {
            "model": TEXT_MODEL,
            "prompt": prompt,
            "stream": False
        }

        response = requests.post(
            f"{OLLAMA_HOST}/api/generate",
            json=payload,
            timeout=TIMEOUT
        )

        if response.status_code == 200:
            result = response.json()
            return result['response'].strip()
        else:
            return "Unable to generate interpretation. Please review the prediction values."

    except Exception as e:
        print(f"Interpretation error: {str(e)}")
        return "Unable to generate interpretation due to an error. Please review the prediction values."

@app.route('/predict', methods=['POST'])
def predict():
    # Validate request
    if 'file' not in request.files:
        return jsonify({'success': False, 'error': 'No file uploaded'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'success': False, 'error': 'Empty filename'}), 400

    try:
        # Verify model exists
        if not os.path.exists(MODEL_PATH):
            return jsonify({
                'success': False,
                'error': f'Model not found at {MODEL_PATH}'
            }), 500

        # Load image
        img_bytes = file.read()
        input_tensor = transform_image(img_bytes)

        # Load model
        model = torch.jit.load(MODEL_PATH)
        model.eval()

        # Run prediction
        with torch.no_grad():
            outputs = model(input_tensor)
            probabilities = torch.nn.functional.softmax(outputs, dim=1)
            confidence, prediction = torch.max(probabilities, 1)

        # Format prediction results
        prediction_data = {
            'prediction': 'sick' if prediction.item() == 1 else 'healthy',
            'confidence': float(confidence.item()) * 100,
            'probabilities': {
                'healthy': float(probabilities[0][0].item()) * 100,
                'sick': float(probabilities[0][1].item()) * 100
            }
        }

        # Get interpretation from LLM if requested
        interpretation = None
        use_llm = request.args.get('interpret', 'true').lower() == 'true'

        if use_llm:
            try:
                interpretation = get_interpretation(prediction_data)
            except Exception as e:
                print(f"Failed to get interpretation: {str(e)}")
                # Continue without interpretation

        # Create response with all data
        response_data = {
            'success': True,
            **prediction_data
        }

        if interpretation:
            response_data['interpretation'] = interpretation

        return jsonify(response_data)

    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Prediction failed: {str(e)}'
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    # Check if Ollama service is available
    ollama_available = False
    try:
        response = requests.get(f"{OLLAMA_HOST}/api/version", timeout=2)
        ollama_available = response.status_code == 200
    except:
        ollama_available = False

    # Check if model file exists
    model_available = os.path.exists(MODEL_PATH)

    return jsonify({
        'status': 'healthy',
        'message': 'ECG Prediction API is running',
        'components': {
            'ollama_service': 'available' if ollama_available else 'unavailable',
            'ecg_model': 'available' if model_available else 'not found'
        }
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
