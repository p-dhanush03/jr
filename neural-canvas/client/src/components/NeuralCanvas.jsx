import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Wand2, Palette, Download, Trash2, Loader2, Image, Brush, Layers, Zap } from 'lucide-react';

export default function NeuralCanvas() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('generate');
  const [style, setStyle] = useState('realistic');
  const [apiResponse, setApiResponse] = useState('');
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(5);
  const [brushColor, setBrushColor] = useState('#ffffff');
    const COLORS = [
  // Neutrals
  '#ffffff', '#000000', '#808080', '#c0c0c0',

  // Reds
  '#ff0000', '#ff6b6b', '#b91c1c',

  // Oranges & Yellows
  '#ffa500', '#ffb703', '#ffff00',

  // Greens
  '#00ff00', '#10b981', '#166534',

  // Blues
  '#0000ff', '#3b82f6', '#0ea5e9',

  // Purples & Pinks
  '#8b5cf6', '#a855f7', '#ec4899',

  // Browns
  '#8b4513', '#a16207'
];


  useEffect(() => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;

  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;

  ctx.scale(dpr, dpr);

  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, rect.width, rect.height);
}, []);


  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      const hint = document.querySelector('.fullscreen-hint');
      if (hint) hint.style.display = 'none';
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
  fetch("http://localhost:3001/history")
    .then(res => res.json())
    .then(data => {
      setChatHistory(data);
    });
}, []);


  const generateArtDescription = async () => {
  if (!prompt.trim()) return;

  setLoading(true);
  setApiResponse("");
  setGeneratedImage(null);

  try {
    // 1️⃣ TEXT GENERATION
    const textResponse = await fetch(
      "http://localhost:3002/api/generate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          style,
        }),
      }
    );

    if (!textResponse.ok) {
      throw new Error(`Text generation failed: ${textResponse.status}`);
    }

    const textData = await textResponse.json();
    const enhancedPrompt = textData.text || prompt;
    setApiResponse(enhancedPrompt);

    // 2️⃣ IMAGE GENERATION (HIGH QUALITY)
    const imageResponse = await fetch(
      "http://localhost:3002/api/generate/image",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: enhancedPrompt,
        }),
      }
    );

    if (!imageResponse.ok) {
      throw new Error(`Image generation failed: ${imageResponse.status}`);
    }

    const imageData = await imageResponse.json();
    
    if (imageData.image) {
      setGeneratedImage(imageData.image);
      saveToHistory("ai-art", prompt);
    } else {
      throw new Error("No image data received");
    }

    setLoading(false);

  } catch (error) {
    console.error("Generation failed:", error);
    setApiResponse(`Error: ${error.message}`);
    setLoading(false);
  }
};



  const getCanvasPoint = (e) => {
  const canvas = canvasRef.current;
  const rect = canvas.getBoundingClientRect();

  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY
  };
};


 const startDrawing = (e) => {
  setIsDrawing(true);
  const ctx = canvasRef.current.getContext('2d');
  const { x, y } = getCanvasPoint(e);
  ctx.beginPath();
  ctx.moveTo(x, y);
};

  const draw = (e) => {
  if (!isDrawing) return;

  const ctx = canvasRef.current.getContext('2d');
  const { x, y } = getCanvasPoint(e);

  ctx.strokeStyle = brushColor;
  ctx.lineWidth = brushSize;
  ctx.lineCap = 'round';
  ctx.lineTo(x, y);
  ctx.stroke();
};


  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  const saveToHistory = (mood, place) => {
  fetch("http://localhost:3001/save", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      mood: mood,
      place: place
    })
  });
};


  const downloadImage = () => {
    if (activeTab === 'draw') {
      const canvas = canvasRef.current;
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'neural-canvas-drawing.png';
      link.href = url;
      link.click();
    } else if (generatedImage) {
      const link = document.createElement('a');
      link.download = 'neural-canvas-art.png';
      link.href = generatedImage;
      link.click();
    }
  };

  const enhancePrompt = async () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [
            { 
              role: "user", 
              content: `Enhance this art prompt with more vivid details and artistic language: "${prompt}". Keep it concise but impactful.` 
            }
          ],
        })
      });

      const data = await response.json();
      setPrompt(data.content[0].text);
      setLoading(false);
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
    }
  };

  return (
    <div className="nc-root">
      <div className="nc-container">
        {/* Header */}
        <div className="nc-header">
          <div className="nc-title-row">
            <Sparkles className="title-icon" />
            <h1 className="nc-title">
              Neural Canvas
            </h1>
            <Sparkles className="title-icon title-icon--pink" />
          </div>
          <p className="nc-subtitle">AI-Powered Interactive Art Studio</p>
        </div>

        {/* Tab Navigation */}
        <div className="nc-tabs">
          <button
            onClick={() => setActiveTab('generate')}
            className={`tab-button ${activeTab === 'generate' ? 'active' : ''}`}
          >
            <Wand2 className="w-5 h-5" />
            AI Generator
          </button>
          <button
            onClick={() => setActiveTab('draw')}
            className={`tab-button ${activeTab === 'draw' ? 'active' : ''}`}
          >
            <Brush className="w-5 h-5" />
            Draw Canvas
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
          >
            <Layers className="w-5 h-5" />
            History
          </button>
        </div>

        {/* AI Generator Tab */}
        {activeTab === 'generate' && (
          <div className="generator-layout">
            {/* Control Panel */}
            <div className="panel">
              <h2 className="panel-heading">
                <Palette className="w-6 h-6 text-purple-400" />
                Creation Studio
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="label">Art Style</label>
                  <select
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    className="select"
                  >
                    <option value="realistic">Photorealistic</option>
                    <option value="anime">Anime/Manga</option>
                    <option value="oil-painting">Oil Painting</option>
                    <option value="watercolor">Watercolor</option>
                    <option value="digital-art">Digital Art</option>
                    <option value="cyberpunk">Cyberpunk</option>
                    <option value="fantasy">Fantasy</option>
                    <option value="abstract">Abstract</option>
                  </select>
                </div>

                <div>
                  <label className="label">Your Vision</label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe your artistic vision... (e.g., 'A mystical forest at twilight with glowing mushrooms')"
                    className="textarea"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={enhancePrompt}
                    disabled={loading || !prompt.trim()}
                    className="btn btn-secondary"
                  >
                    <Zap className="w-5 h-5" />
                    Enhance
                  </button>
                  <button
                    onClick={generateArtDescription}
                    disabled={loading || !prompt.trim()}
                    className="btn btn-primary"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-5 h-5" />
                        Generate
                      </>
                    )}
                  </button>
                </div>

                {apiResponse && (
                  <div className="api-response">
                    <h3 className="label small">AI Art Direction:</h3>
                    <p className="text-sm text-gray-300 leading-relaxed">{apiResponse}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Preview Panel */}
            <div className="panel artwork-panel">
              <h2 className="panel-heading">
                <Image className="w-6 h-6 text-pink-400" />
                Generated Artwork
              </h2>
              
              <div className="preview-area">
                {loading ? (
                  <div className="text-center">
                    <Loader2 className="w-16 h-16 animate-spin text-purple-400 mx-auto mb-4" />
                    <p className="text-purple-300">Generating masterpiece...</p>
                  </div>
                ) : generatedImage ? (
                  <img src={generatedImage} alt="Generated art" className="preview-img" />
                ) : (
                  <div className="text-center text-gray-500">
                    <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p>Your artwork will appear here</p>
                  </div>
                )}
              </div>

              {generatedImage && (
                <button
                  onClick={downloadImage}
                  className="btn btn-success full-width"
                >
                  <Download className="w-5 h-5" />
                  Download Artwork
                </button>
              )}
            </div>
          </div>
        )}

        {/* Draw Canvas Tab */}
{activeTab === 'draw' && (
  <div className="generator-layout">

    {/* LEFT — Drawing Tools (same size as Creation Studio) */}
    <div className="panel">
      <h2 className="panel-heading">
        <Brush className="w-6 h-6 text-purple-400" />
        Drawing Tools
      </h2>

      <div className="space-y-4">
        {/* Brush Size */}
        <div>
          <label className="label">
            Brush Size: {brushSize}px
          </label>
          <input
            type="range"
            min="1"
            max="50"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="range"
          />
        </div>

        {/* Color Palette */}
        <div>
          <label className="label">Brush Color</label>
          <div className="color-palette">
            {COLORS.map(color => (
    <button
      key={color}
      onClick={() => setBrushColor(color)}
      className={`color-button ${brushColor === color ? 'selected' : ''}`}
      style={{ backgroundColor: color }}
    />
  ))}
</div>
<label className="label">Custom Color</label>
<input
  type="color"
  value={brushColor}
  onChange={(e) => setBrushColor(e.target.value)}
  style={{
    width: '100%',
    height: '44px',
    borderRadius: '12px',
    cursor: 'pointer'
  }}
/>

        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={clearCanvas}
            className="btn btn-danger"
          >
            <Trash2 className="w-5 h-5" />
            Clear
          </button>

          <button
            onClick={downloadImage}
            className="btn btn-success"
          >
            <Download className="w-5 h-5" />
            Save
          </button>
        </div>
      </div>
    </div>

    {/* RIGHT — Canvas (same size as Generated Artwork) */}
    <div className="panel canvas-panel">
      <h2 className="panel-heading">
        <Palette className="w-6 h-6 text-pink-400" />
        Canvas
      </h2>

      <canvas
        ref={canvasRef}
        width={512}
        height={512}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        className="canvas"
      />
    </div>

  </div>
)}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="history-layout">
            <div className="history-panel panel">
              <h2 className="panel-heading">
                <Layers className="w-6 h-6 text-purple-400" />
                Creation History
              </h2>

              {chatHistory.length === 0 ? (
                <div className="history-empty text-center small">
                  <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>No creations yet. Start generating art!</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {chatHistory.map((item, idx) => (
                    <div key={idx} className="history-item">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-purple-300">Prompt #{idx + 1}</h3>
                        <span className="text-xs text-gray-500">
                           {item.time}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mb-2"><strong>Type:</strong> {item.mood}</p>
                      <p className="text-sm text-gray-300 leading-relaxed">{item.place}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}