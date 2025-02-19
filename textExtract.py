import os
import cv2
import json
import numpy as np
import pytesseract
from flask import Flask, render_template, request, jsonify, redirect, url_for, send_from_directory
from datetime import datetime
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"
DATA_FILE = "data.json"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER


def load_data():
    """Load stored data from JSON file."""
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, "r") as file:
            return json.load(file)
    return []


def save_data(new_entry):
    """Save new entry to JSON file."""
    data = load_data()
    data.append(new_entry)
    with open(DATA_FILE, "w") as file:
        json.dump(data, file, indent=4)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/upload", methods=["POST"])
def upload_file():
    if "image" not in request.files:
        return jsonify({"error": "No file uploaded"})

    file = request.files["image"]
    print(file.filename)
    if file.filename == "":
        return jsonify({"error": "No selected file"})

    filepath = os.path.join(app.config["UPLOAD_FOLDER"], file.filename)
    file.save(filepath)

    return jsonify({"filename": file.filename})


@app.route("/extract_text", methods=["POST"])
def extract_text():
    data = request.json
    print("Received Data:", data)  # Debugging output

    # Validate received data
    if not data or "filename" not in data or "coords" not in data:
        return jsonify({"error": "Missing filename or coordinates"}), 400

    filename = data["filename"]
    coords = data["coords"]
    isMobile = data["isMobile"]

    if not isinstance(coords, list) or len(coords) != 4:
        return jsonify({"error": "Invalid coordinates format"}), 400


    try:
        x1, y1, x2, y2 = map(int, coords)
    except ValueError:
        return jsonify({"error": "Coordinates must be integers"}), 400

    filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    if not os.path.exists(filepath):
        return jsonify({"error": "File not found"}), 404

    # Read the image            
    image = cv2.imread(filepath)
    if image is None:
        return jsonify({"error": "Image could not be read"}), 500

    # Scale coordinates to match the original image size
    display_width = 450 if isMobile else 700  # Width of canvas in frontend
    display_height = 450 if isMobile else 500  # Height of canvas in frontend

    height_ratio = image.shape[0] / display_height
    width_ratio = image.shape[1] / display_width



    height, width, _ = image.shape
    x1, y1, x2, y2 = max(0, x1), max(0, y1), min(width, x2), min(height, y2)


    print(x1, y1, x2, y2)

    # Extract the selected region
    roi = image[y1:y2, x1:x2]

    # Convert to grayscale & apply thresholding for better OCR
    gray = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
    gray = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]

    # Extract text using OCR
    text = pytesseract.image_to_string(gray).strip()
    print(text) 
    if text:
        return jsonify({"part_id": text})
    else:
        return jsonify({"error": "No text found"}), 400


@app.route("/enter_details/<part_id>", methods=["GET", "POST"])
def enter_details(part_id):
    if request.method == "POST":
        units_per_group = int(request.form["units_per_group"])
        num_groups = int(request.form["num_groups"])
        measurement_unit = request.form["measurement_unit"]
        location = request.form["location"]

        total_amount = units_per_group * num_groups

        new_entry = {
            "part_id": part_id,
            "units_per_group": units_per_group,
            "num_groups": num_groups,
            "measurement_unit": measurement_unit,
            "location": location,
            "total_amount": total_amount
        }

        save_data(new_entry)
        return redirect(url_for("view_data"))

    return render_template("enter_details.html", part_id=part_id)


DATA_FOLDER = "submitted_data"
if not os.path.exists(DATA_FOLDER):
    os.makedirs(DATA_FOLDER)  # Ensure the folder exists



@app.route("/submit_details", methods=["POST"])
def submit_details():
    """Append new data to the existing JSON file."""
    data = request.json  
    data["timestamp"] = datetime.now().isoformat()  # Add timestamp

    # Check if the file exists and read existing data
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, "r") as file:
            try:
                existing_data = json.load(file)
            except json.JSONDecodeError:
                existing_data = []
    else:
        existing_data = []

    existing_data.append(data)  # Append new data

    # Write back to the JSON file
    with open(DATA_FILE, "w") as file:
        json.dump(existing_data, file, indent=4)

    return jsonify({"message": "Data submitted successfully"}), 200

@app.route("/get_all_data", methods=["GET"])
def get_all_data():
    """Retrieve all stored JSON data."""
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, "r") as file:
            try:
                data = json.load(file)
                return jsonify(data)
            except json.JSONDecodeError:
                return jsonify([])  # Return empty if file is corrupt
    return jsonify([])  # Return empty if file does not exist



@app.route("/submitted_data/<filename>")
def get_json_file(filename):
    filepath = os.path.join(DATA_FOLDER, filename)
    if os.path.exists(filepath):
        with open(filepath, "r") as json_file:
            return jsonify(json.load(json_file))  # Return JSON content
    else:
        return jsonify({"error": "File not found"}), 404


@app.route("/view_data")
def view_data():
    data = load_data()
    return render_template("view_data.html", data=data)


@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
