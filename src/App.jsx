import React from 'react';
import { useState, useEffect } from 'react'
import './App.css'
import ChessGame from './components/chessGame'
import ApiKeyInput from './components/ApiKeyInput'

function App() {
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('chessOpenAIApiKey') || '';
  });
  const [gameMode, setGameMode] = useState('human'); // 'human' or 'llm'
  

  useEffect(() => {
    if (apiKey) {
      localStorage.setItem('chessOpenAIApiKey', apiKey);
    }
  }, [apiKey]);
  
  const handleApiKeySubmit = (key) => {
    setApiKey(key);
    setGameMode('llm');
  };
  
  const toggleGameMode = () => {
    if (gameMode === 'human') {
      if (!apiKey) {
        alert('Please enter an OpenAI API key first to play against AI');
        return;
      }
      setGameMode('llm');
    } else {
      setGameMode('human');
    }
  };
  
  return (
    <div className="App">
      <header>
        <h1>Chess vs Language Model</h1>
        <p>Play chess against an AI powered by OpenAI's language model</p>
      </header>
      
      <div className="controls">
        <ApiKeyInput 
          onApiKeySubmit={handleApiKeySubmit} 
          initialValue={apiKey}
        />
        
        <button 
          onClick={toggleGameMode} 
          disabled={gameMode === 'llm' && !apiKey}
          className={`mode-toggle ${gameMode === 'llm' ? 'llm-mode' : 'human-mode'}`}
        >
          Current Mode: {gameMode === 'human' ? 'Human vs Human' : 'Human vs OpenAI'}
        </button>
      </div>
      
      <main>
        <ChessGame gameMode={gameMode} apiKey={apiKey} />
      </main>
      
      <footer>
        <p>
          Created for BharatX Tech Intern Task | {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  )
}

export default App