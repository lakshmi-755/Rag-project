import { useState } from "react";
import "./App.css";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "https://rag-project-k4hu.onrender.com";

function App() {
  const [files, setFiles] = useState([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState([]);
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState("info");

  const handleUpload = async () => {
    if (!files.length) {
      setStatus("Select at least one PDF before uploading.");
      setStatusType("warning");
      return;
    }

    const formData = new FormData();
    for (const file of files) {
      formData.append("files", file);
    }

    setStatus("Uploading and processing PDFs...");
    setStatusType("info");

    try {
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Upload failed");
      setStatus(data.message || "Uploaded successfully");
      setStatusType("success");
    } catch (error) {
      setStatus(error.message || "Upload failed");
      setStatusType("danger");
    }
  };

  const handleAsk = async () => {
    if (!question.trim()) {
      setStatus("Type a question first.");
      setStatusType("warning");
      return;
    }

    setStatus("Getting answer...");
    setStatusType("info");

    try {
      const response = await fetch(`${API_BASE_URL}/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      });
      const data = await response.json();
      if (!response.ok || data.error) throw new Error(data.error || "Ask failed");

      setAnswer(data.answer || "");
      setSources(data.sources || []);
      setStatus("Answer generated successfully.");
      setStatusType("success");
    } catch (error) {
      setStatus(error.message || "Ask failed");
      setStatusType("danger");
    }
  };

  return (
    <div className="app-shell py-5">
      <div className="container" style={{ maxWidth: "920px" }}>
        <div className="text-center mb-4">
          <h1 className="fw-bold mb-2">PDF Chat App</h1>
          <p className="text-secondary mb-0">
            Upload your PDF files and ask questions from the content.
          </p>
        </div>

        <div className="card shadow-sm border-0 mb-3">
          <div className="card-body p-4">
            <h5 className="card-title mb-3">1. Upload PDF files</h5>
            <input
              className="form-control"
              type="file"
              multiple
              accept=".pdf"
              onChange={(e) => setFiles(Array.from(e.target.files || []))}
            />
            <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2">
              <small className="text-muted">
                {files.length > 0 ? `${files.length} file(s) selected` : "No files selected"}
              </small>
              <button
                className="btn btn-primary px-4"
                onClick={handleUpload}
                disabled={files.length === 0}
              >
                Upload PDFs
              </button>
            </div>
          </div>
        </div>

        <div className="card shadow-sm border-0 mb-3">
          <div className="card-body p-4">
            <h5 className="card-title mb-3">2. Ask your question</h5>
            <div className="row g-2">
              <div className="col-12 col-md-9">
                <input
                  className="form-control"
                  type="text"
                  placeholder="Type your question here..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                />
              </div>
              <div className="col-12 col-md-3 d-grid">
                <button
                  className="btn btn-success"
                  onClick={handleAsk}
                  disabled={!question.trim()}
                >
                  Ask
                </button>
              </div>
            </div>
          </div>
        </div>

        {status && (
          <div className={`alert alert-${statusType}`} role="alert">
            {status}
          </div>
        )}

        <div className="card shadow-sm border-0 mb-3">
          <div className="card-body p-4">
            <h5 className="card-title mb-3">Answer</h5>
            <p className="mb-0 answer-text">
              {answer || "No answer yet. Upload PDFs and ask a question."}
            </p>
          </div>
        </div>

        {sources.length > 0 && (
          <div className="card shadow-sm border-0">
            <div className="card-body p-4">
              <h5 className="card-title mb-3">Sources</h5>
              <ul className="list-group list-group-flush">
                {sources.map((src, index) => (
                  <li className="list-group-item px-0" key={`${src}-${index}`}>
                    {src}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
