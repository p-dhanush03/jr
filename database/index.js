const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// 📓 database notebook
const db = new sqlite3.Database("history.db");

// 📄 table (created only once)
db.run(`
  CREATE TABLE IF NOT EXISTS history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mood TEXT,
    place TEXT,
    time TEXT
  )
`);

// ✍️ STEP 7 — SAVE HISTORY
app.post("/save", (req, res) => {
  const { mood, place } = req.body;
  const time = new Date().toLocaleString();

  db.run(
    "INSERT INTO history (mood, place, time) VALUES (?, ?, ?)",
    [mood, place, time],
    () => {
      res.send({ success: true });
    }
  );
});
// 📖 STEP 8 - READ HISTORY
app.get("/history", (req, res) => {
  db.all("SELECT * FROM history ORDER BY id DESC", (err, rows) => {
    res.send(rows);
  });
});


// 📖 READ HISTORY
app.get("/history", (req, res) => {
  db.all("SELECT * FROM history ORDER BY id DESC", (err, rows) => {
    res.send(rows);
  });
});

app.listen(3001, () => {
  console.log("✅ Server running on http://localhost:3001");
});
