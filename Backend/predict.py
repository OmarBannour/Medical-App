import os
from flask import Flask, request, jsonify
import torch
import torchvision.transforms as transforms
from PIL import Image
import io
import sys
import asyncio  # Fix for Windows asyncio issue

# Fix for Windows asyncio error
if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

app = Flask(__name__)

# Configuration
UPLOAD_FOLDER = 'temp'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'ecg_model_torchscript.pt')

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

        # Format results
        return jsonify({
            'success': True,
            'prediction': 'sick' if prediction.item() == 1 else 'healthy',
            'confidence': float(confidence.item()) * 100,
            'probabilities': {
                'healthy': float(probabilities[0][0].item()) * 100,
                'sick': float(probabilities[0][1].item()) * 100
            }
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Prediction failed: {str(e)}'
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'message': 'ECG Prediction API is running'
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
