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
                setQrResult(decodedText);
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

    return (
        <div className="flex flex-col items-center justify-center p-4">
            <h2 className="text-xl font-bold mb-4">Scan QR Code</h2>
            <div id="qr-reader" className="border-2 border-gray-300 rounded-lg p-2"></div>
            {qrResult && (
                <div className="mt-4 p-2 bg-green-200 text-green-800 rounded-md">
                    <strong>Scanned QR:</strong> {qrResult}
                </div>
            )}
        </div>
    );
}