import React, { useState } from "react";
import "./App.css";
import FileUpload from "./components/FileUpload";
import QuestionForm from "./components/QuestionForm";
import ResponseDisplay from "./components/ResponseDisplay";

function App() {
  const [response, setResponse] = useState(null);

  const handleResponse = (data) => {
    setResponse(data);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h2>File Upload & RAG QA system</h2>
        <FileUpload />
        <QuestionForm onResponse={handleResponse} />
        <ResponseDisplay response={response} />
      </header>
    </div>
  );
}

export default App;
