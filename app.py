from flask import Flask, render_template, request, jsonify
import os
from werkzeug.utils import secure_filename
import cv2
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import load_model
from PIL import Image
from tensorflow.keras.applications.efficientnet import preprocess_input

app = Flask(__name__)

# Configuration
UPLOAD_FOLDER = 'static/uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'mp4', 'mov'}
IMG_SIZE = 380  # Should match your model's expected input size

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB limit
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Load your pre-trained model
model = load_model('best_model_b4.h5')  # Make sure to put your model file in the project folder

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def preprocess_image(image_path):
    img = Image.open(image_path)
    img = img.convert('RGB')
    img = img.resize((IMG_SIZE, IMG_SIZE))
    img_array = np.array(img)
    img_array = preprocess_input(img_array)  # EfficientNet preprocessing
    img_array = np.expand_dims(img_array, axis=0)
    return img_array

def preprocess_video(video_path, num_frames=5):
    cap = cv2.VideoCapture(video_path)
    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    predictions = []
    
    for i in range(num_frames):
        frame_idx = int(i * (frame_count / num_frames))
        cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
        ret, frame = cap.read()
        if ret:
            frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            frame = cv2.resize(frame, (IMG_SIZE, IMG_SIZE))
            frame = preprocess_input(frame)  # EfficientNet preprocessing
            frame = np.expand_dims(frame, axis=0)
            pred = model.predict(frame)[0][0]
            predictions.append(pred)
    
    cap.release()
    return np.mean(predictions)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        file_ext = filename.rsplit('.', 1)[1].lower()
        
        try:
            if file_ext in {'png', 'jpg', 'jpeg'}:
                processed_img = preprocess_image(filepath)
                prediction = model.predict(processed_img)[0][0]
                print("Image Prediction raw value:", prediction)  # Debugging raw value
            else:
                prediction = preprocess_video(filepath)
                print("Video Prediction raw value:", prediction)  # Debugging raw value
            
            # Adjusting result based on confidence threshold for REAL
            if prediction >= 0.7:
                result = "FAKE"
                confidence = float(prediction)  # FAKE confidence
            elif prediction <= 0.3:
                result = "REAL"
                confidence = float(1 - prediction)  # REAL confidence
            else:
                # If prediction is uncertain, apply confidence threshold logic
                if 1 - prediction < 0.8:  # If confidence for REAL is below 80%
                    result = "FAKE"
                    confidence = float(prediction)  # FAKE confidence
                else:
                    result = "REAL"
                    confidence = float(1 - prediction)  # REAL confidence

            return jsonify({
                'result': result,
                'confidence': round(confidence * 100, 2),  # Confidence as a float
                'filename': filename
            })
        except Exception as e:
            return jsonify({'error': f'Error processing file: {str(e)}'}), 500
    
    return jsonify({'error': 'File type not allowed'}), 400

if __name__ == '__main__':
    app.run(debug=True)
