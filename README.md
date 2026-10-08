# Canine Breed Predictor (Flask frontend)

This simple Flask app lets you upload an image and returns a predicted canine breed using your `canine_breed.h5` model.

## Setup

1. Create a virtual env (recommended):
   - python -m venv venv
   - venv\Scripts\activate
2. Install requirements:
   - pip install -r requirements.txt
3. Ensure `canine_breed.h5` is in the project root (same folder as `app.py`).

## Run

- python app.py
- Open http://127.0.0.1:5000 and upload an image.

## Frontend features
- Modern Bootstrap UI with drag-and-drop upload, image preview, and AJAX prediction.
- Shows top-3 predictions with probabilities and progress bars.

## Notes
- Preprocessing uses 256x256 RGB and scales pixels to [0,1].
- Uploaded files are stored in `static/uploads`.
- For large TensorFlow installs, consider a CPU-only wheel or testing with a small model.
