"use client";
import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function QRCodeScanner() {
    const [qrResult, setQrResult] = useState(null);
    const scannerRef = useRef(null);

    useEffect(() => {
        const scanner = new Html5QrcodeScanner("qr-reader", {
            fps: 10,
            qrbox: { width: 250, height: 250 },
        });

        scanner.render(
            (decodedText) => {
                try {
                    const jsonData = JSON.parse(decodedText);
                    setQrResult(jsonData);
                } catch (error) {
                    console.error("Invalid JSON format", error);
                    setQrResult({ error: "Invalid JSON data" });
                }
                scanner.clear();
            },
            (errorMessage) => {
                console.warn("QR scan error:", errorMessage);
            }
        );

        scannerRef.current = scanner;

        return () => {
            scanner.clear();
        };
    }, []);

    const handleSubmit = async () => {
        if (!qrResult) return;
        try {
            const response = await fetch('/api/submitdetails', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(qrResult)
            });
            if (response.ok) {
                alert("Data submitted successfully");
                window.location.reload();
            } else {
                alert("Failed to submit data");
            }
        } catch (error) {
            alert("Error submitting data:", error);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center p-4">
            <h2 className="text-xl font-bold mb-4">Scan QR Code</h2>
            <div id="qr-reader" className="border-2 border-gray-300 rounded-lg p-2"></div>
            {qrResult && (
                <div className="mt-4 p-4 bg-green-200 text-green-800 rounded-md w-full max-w-md">
                    <strong>Scanned QR:</strong>
                    <pre className="bg-gray-100 p-2 rounded-md overflow-x-auto text-sm">
                        {JSON.stringify(qrResult, null, 2)}
                    </pre>
                    <button
                        onClick={handleSubmit}
                        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                        Submit Data
                    </button>
                </div>
            )}
        </div>
    );
}