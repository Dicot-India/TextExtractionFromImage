import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false, // Disable default body parsing
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

    const formData = new FormData();
    formData.append("image", fs.createReadStream(file.filepath));

    try {
      const response = await fetch("http://15.207.232.194:9999/upload", {
        method: "POST",
        body: formData,
        headers: {}, // Let FormData set the headers automatically
      });

      const data = await response.text();
      res.status(response.status).send(data);
    } catch (error) {
      console.error("Proxy error:", error);
      res.status(500).json({ error: "Failed to connect to backend" });
    }
  });
}
