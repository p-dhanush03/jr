import NeuralCanvas from "./components/NeuralCanvas";

function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        {/* Logo + Title (kept minimal; main content handles internal headings) */}
      </header>

      <nav className="app-nav">
        {/* Navigation — NeuralCanvas includes internal tabs; keep nav for layout */}
      </nav>

      <main className="app-main">
        <NeuralCanvas />
      </main>
    </div>
  );
}

export default App;
