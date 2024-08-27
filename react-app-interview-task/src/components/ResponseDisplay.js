import React from "react";

const ResponseDisplay = ({ response }) => {
  if (!response) return null;

  return (
    <div>
      <h4>Server Response</h4>
      {response.error ? (
        <p style={{ color: "red" }}>{response.error}</p>
      ) : (
        <div>
          <p>
            <strong>Message:</strong> {response.message}
          </p>
          <p>
            <strong>Answer:</strong> {response.answer}
          </p>
        </div>
      )}
    </div>
  );
};

export default ResponseDisplay;
