const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 8000;

// Configurare director pentru fișierele încărcate
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configurare Multer pentru încărcarea fișierelor
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Salvează fișierele în directorul "uploads"
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Prefixăm numele fișierului
  },
});
const upload = multer({ storage });

// Servire fișiere statice (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, "public")));

// Endpoint pentru încărcarea fișierelor
app.post("/upload", upload.single("file"), (req, res) => {
  res.redirect("/"); // Redirecționează utilizatorul înapoi la pagina principală
});

// Endpoint pentru listarea fișierelor
app.get("/files", (req, res) => {
  const files = fs.readdirSync(uploadDir);
  res.json(files);
});

// Endpoint pentru descărcarea fișierelor
app.use("/files", express.static(uploadDir));

// Pornirea serverului
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
const bodyParser = require("body-parser"); // Necesită pentru a analiza corpul cererii POST
app.use(bodyParser.json());

app.delete("/files/:filename", (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(uploadDir, filename);

  // Log pentru a verifica exact ce fișier încercăm să ștergem și calea completă
  console.log(`Received request to delete: ${filename}`);
  console.log(`Full file path: ${filepath}`);

  if (fs.existsSync(filepath)) {
    console.log(`File found: ${filename}`); // Confirmă că fișierul există
    fs.unlinkSync(filepath); // Șterge fișierul
    res.json({ success: true, message: `File '${filename}' deleted.` });
  } else {
    console.log(`File not found: ${filename}`); // Log pentru eroare
    res.status(404).json({ success: false, message: "File not found." });
  }
});
