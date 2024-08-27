import React from "react";

const ResponseDisplay = ({ response }) => {
  if (!response) return null;
  console.log(response);

  return (
    <div>
      <h5>LLM Response</h5>
      {response.error ? (
        <p className="answer-message" style={{ color: "red" }}>
          {response.error}
        </p>
      ) : (
        <div>
          {/* <p>
            <strong>Message:</strong> {response.message}
          </p> */}
          <p className="answer-message">
            <strong>Answer:</strong> {response.res.text}
          </p>
        </div>
      )}
    </div>
  );
};

export default ResponseDisplay;
