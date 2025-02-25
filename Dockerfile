FROM python:3.11

# Install system dependencies
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    libgl1-mesa-glx \
    && rm -rf /var/lib/apt/lists/*  # Clean up to reduce image size

# Set up a working directory
WORKDIR /app

# Copy project files
COPY . /app

# Upgrade pip and install dependencies
RUN pip3 install --upgrade pip && pip install -r requirements.txt

# Set the command to run your app
CMD ["python3", "textExtract.py"]
