import { useState } from "react";
import "./App.css";

export default function App() {
  const [prompt, setPrompt] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);

  const generateImage = async () => {
    setLoading(true);

    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });

    const data = await res.json();
    setImage(data.image);
    setLoading(false);
  };

  return (
    <div style={{ textAlign: "center", padding: "40px" }}>
      <h1>Neural Canvas 🎨</h1>

      <input
        style={{ width: "60%", padding: "10px", fontSize: "16px" }}
        placeholder="Describe your image..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />

      <br /><br />

      <button onClick={generateImage} style={{ padding: "10px 30px" }}>
        {loading ? "Generating..." : "Generate"}
      </button>

      <br /><br />

      {image && <img src={image} style={{ maxWidth: "90%" }} />}
    </div>
  );
}

