import React, { useState } from "react";
import axios from "axios";

const QuestionForm = ({ onResponse }) => {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  const handleQuestionChange = (e) => {
    setQuestion(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:3003/api/v1/query", {
        question,
      });
      onResponse(response.data);
    } catch (error) {
      console.error("There was an error submitting the question!", error);
      onResponse({ error: "Error submitting the question." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h5>Ask a Question</h5>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", alignItems: "center" }}
      >
        <textarea
          value={question}
          onChange={handleQuestionChange}
          placeholder="Type your question here..."
          rows="4"
          cols="50"
          style={{ marginRight: "10px" }}
        />
        <button type="submit">Submit</button>
      </form>
      {loading && <p>Loading...</p>}
    </div>
  );
};

export default QuestionForm;
