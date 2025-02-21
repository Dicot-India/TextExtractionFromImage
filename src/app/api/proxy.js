import { parse } from "url";
import http from "http";
import https from "https";
import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false, // Disable Next.js default body parsing
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Error parsing form:", err);
      return res.status(500).json({ error: "Failed to parse form data" });
    }

    const file = files.image[0];

    const backendUrl = "http://15.207.232.194:9999/upload";
    const parsedUrl = parse(backendUrl);
    const protocol = parsedUrl.protocol === "https:" ? https : http;

    const options = {
      method: "POST",
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.path,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };

    const proxyReq = protocol.request(options, (backendRes) => {
      let data = "";
      backendRes.on("data", (chunk) => {
        data += chunk;
      });
      backendRes.on("end", () => {
        res.status(backendRes.statusCode).send(data);
      });
    });

    proxyReq.on("error", (error) => {
      console.error("Proxy error:", error);
      res.status(500).json({ error: "Failed to connect to backend" });
    });

    const readStream = fs.createReadStream(file.filepath);
    readStream.pipe(proxyReq);
  });
}