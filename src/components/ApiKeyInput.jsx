import React, { useState, useEffect } from 'react';

function ApiKeyInput({ onApiKeySubmit, initialValue = '' }) {
  const [apiKey, setApiKey] = useState(initialValue);
  const [isSubmitted, setIsSubmitted] = useState(!!initialValue);
  
  useEffect(() => {
    // Update isSubmitted state if initialValue changes
    if (initialValue) {
      setIsSubmitted(true);
      setApiKey(initialValue);
    }
  }, [initialValue]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (apiKey.trim()) {
      onApiKeySubmit(apiKey.trim());
      setIsSubmitted(true);
    }
  };
  
  return (
    <div className="api-key-input">
      <h2>OpenAI API Key</h2>
      {isSubmitted ? (
        <div className="api-key-set">
          <span className="success-icon">✓</span>
          <span>API Key set successfully</span>
          <button
            onClick={() => setIsSubmitted(false)}
            className="change-key-btn"
          >
            Change
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your OpenAI API key"
            required
          />
          <button type="submit" className="submit-key-btn">
            Set API Key
          </button>
          <div className="api-help-text">
            Get your OpenAI API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">OpenAI Dashboard</a>
          </div>
        </form>
      )}
    </div>
  );
}

export default ApiKeyInput;