"use client";
import { useState, useRef, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useReactToPrint } from "react-to-print";

export default function Home() {
  const [image, setImage] = useState(null);
  const [filename, setFilename] = useState(null);
  const [coords, setCoords] = useState(null);
  const canvasRef = useRef(null);
  const overlayRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState({ x: 1, y: 1 });
  const [partID, setPartID] = useState("");
  const [isUniteGroup, setIsUnitGroup] = useState(false);
  const [unitsPerGroup, setUnitsPerGroup] = useState();
  const [numGroups, setNumGroups] = useState();
  const [measurementUnit, setMeasurementUnit] = useState("KG");
  const [location, setLocation] = useState();
  const [canvasSize, setCanvasSize] = useState({ width: 700, height: 500 });
  const [qrData, setQrData] = useState(null); // State to store QR code data
  const contentRef = useRef();

  const CANVAS_WIDTH = 700;
  const CANVAS_HEIGHT = 500;

  useEffect(() => {
    const updateCanvasSize = () => {
      const newWidth = window.innerWidth < 768 ? 450 : 700; // Adjust for mobile
      const newHeight = window.innerWidth < 768 ? 450 : 500; // Maintain aspect ratio
      setCanvasSize({ width: newWidth, height: newHeight });
    };

    updateCanvasSize(); // Initial setup
    window.addEventListener("resize", updateCanvasSize);

    return () => {
      window.removeEventListener("resize", updateCanvasSize);
    };
  }, []);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const imgURL = URL.createObjectURL(file);
    setImage(imgURL);
    setFilename(file.name);

    const img = new Image();
    let formData = new FormData();
    formData.append("image", file);

    fetch("/api/upload", {
      method: "POST",
      body: formData,
    })

    img.src = imgURL;
    img.onload = () => {
      const scaleX = img.naturalWidth / canvasSize.width;
      const scaleY = img.naturalHeight / canvasSize.height;
      setScale({ x: scaleX, y: scaleY });

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
      ctx.drawImage(img, 0, 0, canvasSize.width, canvasSize.height);
    };
  };


  const startDrawing = (event) => {
    const rect = overlayRef.current.getBoundingClientRect();
    const x = (event.touches ? event.touches[0].clientX : event.clientX) - rect.left;
    const y = (event.touches ? event.touches[0].clientY : event.clientY) - rect.top;

    setStartPoint({ x, y });
    setIsDrawing(true);
  };

  const draw = (event) => {
    if (!isDrawing || !overlayRef.current) return;

    const rect = overlayRef.current.getBoundingClientRect();
    const currentX = (event.touches ? event.touches[0].clientX : event.clientX) - rect.left;
    const currentY = (event.touches ? event.touches[0].clientY : event.clientY) - rect.top;

    const ctx = overlayRef.current.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.strokeRect(
      startPoint.x,
      startPoint.y,
      currentX - startPoint.x,
      currentY - startPoint.y
    );
  };


  const endDrawing = (event) => {
    setIsDrawing(false);
    if (!overlayRef.current) return;


    const rect = overlayRef.current.getBoundingClientRect();
    const endX = (event?.changedTouches ? event.changedTouches[0].clientX : event.clientX) - rect.left;
    const endY = (event?.changedTouches ? event.changedTouches[0].clientY : event.clientY) - rect.top;


    const adjustedCoords = {
      startX: Math.round(startPoint.x * scale.x),
      startY: Math.round(startPoint.y * scale.y),
      endX: Math.round(endX * scale.x),
      endY: Math.round(endY * scale.y),
    };

    setCoords([
      Math.min(adjustedCoords.startX, adjustedCoords.endX),
      Math.min(adjustedCoords.startY, adjustedCoords.endY),
      Math.max(adjustedCoords.startX, adjustedCoords.endX),
      Math.max(adjustedCoords.startY, adjustedCoords.endY),
    ]);
  };

  const extractText = () => {
    if (!filename || !coords) {
      alert("No image or selection made.");
      return;
    }

    fetch("/api/extracttext", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename, coords, isMobile: window.innerWidth < 768 ? true : false }),
    })
      .then((response) => response.json())
      .then((data) => {
        setPartID(data?.part_id);
        setIsUnitGroup(true);
      })
      .catch((error) => console.error("Error:", error));


  };


  const handleSubmit = async () => {
    const reqBody = {
      partID: partID,
      unitsPerGroup: unitsPerGroup,
      numGroups: numGroups,
      measurementUnit: measurementUnit,
      location: location,
      totalUnits: unitsPerGroup * numGroups
    }

    const response = await fetch('/api/submitdetails', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reqBody)
    })

    const responseBody = await response.json();
    setQrData(JSON.stringify(reqBody));
  }

  const handlePrint = useReactToPrint({ contentRef });

  return (
    <>
      <style>
        {`
          .container {
            text-align: center;
            font-family: Arial, sans-serif;
          }
          .file-input {
            margin: 10px;
            padding: 5px;
            border: 1px solid #ddd;
            border-radius: 5px;
          }
          .canvas-container {
            position: relative;
            width: ${CANVAS_WIDTH}px;
            height: ${CANVAS_HEIGHT}px;
            border: 2px solid #ddd;
            margin: auto;
          }
          canvas {
            position: absolute;
            top: 0;
            left: 0;
          }
          .overlay {
            cursor: crosshair;
          }
          .btn {
            margin-top: 10px;
            padding: 10px 20px;
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
          }
          .btn:hover {
            background-color: #0056b3;
          }
          .details-container {
            margin-top: 20px;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 10px;
            width: 50%;
            margin: auto;
          }
          input,
          select {
            display: block;
            width: 100%;
            padding: 5px;
            margin: 10px 0;
            border: 1px solid #ccc;
            border-radius: 5px;
          }

          @media print {
            .print-container {
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              width: 100%;
            }
          }
        `}
      </style>

      <div className="container">
        <h1>Upload an Image and Select Text</h1>
        <input type="file" onChange={handleImageUpload} className="file-input" />
        <div className="canvas-container">
          <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />
          <canvas
            ref={overlayRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="overlay"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={endDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={endDrawing}
          />
        </div>
        <button className="btn" onClick={extractText}>
          Extract Text
        </button>

        {isUniteGroup && (
          <div className="details-container" style={{ width: `${window.innerWidth < 768 ? '90%' : "50%"}` }}>
            <h2>Enter Details</h2>
            <label>Number of Units per Group:</label>
            <input type="number" onChange={(e) => setUnitsPerGroup(e.target.value)} defaultValue={1} />
            <label>Number of Groups:</label>
            <input type="number" onChange={(e) => setNumGroups(e.target.value)} defaultValue={1} />
            <label>Measurement Unit:</label>
            <select onChange={(e) => setMeasurementUnit(e.target.value)}>
              <option value="KG">KG</option>
              <option value="L">L</option>
              <option value="PCS">PCS</option>
            </select>
            <label>Location:</label>
            <input type="text" onChange={(e) => setLocation(e.target.value)} />
            <button className="btn" onClick={handleSubmit}>Submit</button>
          </div>
        )}

        {qrData && (
          <div style={{ marginTop: "20px", textAlign: "center" }}>
            <h2>QR Code:</h2>
            <div ref={contentRef} className="print-container">

              <QRCodeSVG value={qrData} size={200} />
            </div>
            <button onClick={() => handlePrint()}>Print QR Code</button>
          </div>
        )}

      </div>
    </>
  );
}
