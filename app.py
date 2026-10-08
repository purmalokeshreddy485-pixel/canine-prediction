gitfrom flask import Flask, request, render_template, redirect, url_for, jsonify
import os
import numpy as np
from PIL import Image
import tensorflow as tf
from werkzeug.utils import secure_filename

UPLOAD_FOLDER = 'static/uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Load your trained model (ensure `canine_breed.h5` is in the same folder)
model = tf.keras.models.load_model('canine_breed.h5')
classnames = ["Bedlington_terrier","Bernese_mountain_dog","Dandie_Dinmont","Gordon_setter","Ibizan_hound","Norwegian_elkhound"]
localbreed=["Bedlington_terrier","Bernese_mountain_dog","Dandie_Dinmont"]
forignbreed=["Gordon_setter","Ibizan_hound","Norwegian_elkhound"]

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def preprocess_image(path):
    img = Image.open(path).convert('RGB')
    img = img.resize((256, 256))
    arr = np.array(img).astype('float32') / 255.0
    return np.expand_dims(arr, 0)


@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')


@app.route('/predict', methods=['POST'])
def predict_api():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        save_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(save_path)
        x = preprocess_image(save_path)
        preds = model.predict(x)[0]
        top_k = min(1, len(preds))
        idxs = preds.argsort()[-top_k:][::-1]
        result = []
        breed=0
        for i in idxs:
            if i<3:
                breed=1
            if breed==1:
                result.append({'label': classnames[i], 'prob': float(preds[i]),"breed":"local"})
            else:
                result.append({'label': classnames[i], 'prob': float(preds[i]),"breed":"forign"})
                
        return jsonify({'predictions': result, 'filename': filename})
    return jsonify({'error': 'Invalid file'}), 400


@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return redirect(url_for('static', filename=f'uploads/{filename}'), code=301)


if __name__ == '__main__':
    app.run(debug=True)
