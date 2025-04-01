//chessGame.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { getOpenAIMove } from '../services/llmService';

function ChessGame({ gameMode, apiKey }) {
  const [game, setGame] = useState(new Chess());
  const [moveHistory, setMoveHistory] = useState([]);
  const [status, setStatus] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState('');
  const [lastMove, setLastMove] = useState(null); // For highlighting the last move
  
  // Update game status when game state changes
  useEffect(() => {
    updateGameStatus();
  }, [game]);
  
  // Handle LLM moves
  useEffect(() => {
    // Only make LLM move if:
    // 1. We're in LLM mode
    // 2. It's black's turn
    // 3. Game is not over
    // 4. We have an API key
    // 5. We're not already thinking
    if (
      gameMode === 'llm' && 
      game.turn() === 'b' && 
      !game.isGameOver() && 
      apiKey && 
      !isThinking
    ) {
      makeLLMMove();
    }
  }, [game, gameMode, apiKey]);
  
  // Function to make an LLM move
  // const makeLLMMove = useCallback(async () => {
  //   setIsThinking(true);
  //   setError('');
    
  //   try {
  //     // Get all legal moves
  //     const legalMoves = game.moves();
      
  //     // Call OpenAI API to get a move
  //     const llmMove = await getOpenAIMove(
  //       apiKey, 
  //       game.fen(), 
  //       moveHistory,
  //       legalMoves
  //     );
      
  //     console.log("LLM suggested move:", llmMove);
      
  //     // Make the move
  //     const move = makeAMove({ san: llmMove });
  //     if (!move) {
  //       throw new Error(`Failed to make LLM move: ${llmMove}`);
  //     }
  //   } catch (err) {
  //     console.error('Error making LLM move:', err);
  //     setError(`LLM error: ${err.message}`);
  //   } finally {
  //     setIsThinking(false);
  //   }
  // }, [game, apiKey, moveHistory]);
  









  // const makeLLMMove = useCallback(async () => {
  //   setIsThinking(true);
  //   setError('');
    
  //   try {
  //     // Get all legal moves
  //     const legalMoves = game.moves();
  //     console.log("Legal moves before API call:", legalMoves);
      
  //     // Call OpenAI API to get a move
  //     const llmMove = await getOpenAIMove(
  //       apiKey, 
  //       game.fen(), 
  //       moveHistory,
  //       legalMoves
  //     );
      
  //     console.log("LLM suggested move:", llmMove);
      
  //     // Make sure the move is exactly in the right format
  //     const exactMatch = legalMoves.find(m => 
  //       m.replace(/\+|#/g, '') === llmMove.replace(/\+|#/g, '')
  //     );
      
  //     if (!exactMatch) {
  //       throw new Error(`Move "${llmMove}" not found in legal moves`);
  //     }
      
  //     // Make the move using the exact format from legal moves
  //     const move = makeAMove({ san: exactMatch });
  //     if (!move) {
  //       throw new Error(`Failed to make LLM move: ${exactMatch}`);
  //     }
  //   } catch (err) {
  //     console.error('Error making LLM move:', err);
      
  //     // Fall back to a random legal move
  //     const legalMoves = game.moves();
  //     if (legalMoves.length > 0) {
  //       const randomMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
  //       console.log("Falling back to random move:", randomMove);
        
  //       const move = makeAMove({ san: randomMove });
  //       if (!move) {
  //         setError(`Could not make move. Please reset the game.`);
  //       }
  //     } else {
  //       setError(`Game appears to be over. No legal moves available.`);
  //     }
  //   } finally {
  //     setIsThinking(false);
  //   }
  // }, [game, apiKey, moveHistory]);

















  const makeLLMMove = useCallback(async () => {
    setIsThinking(true);
    setError('');
    
    try {
      // Get all legal moves
      const legalMoves = game.moves({ verbose: true });
      const legalMovesAlgebraic = game.moves();
      console.log("Legal moves before API call:", legalMovesAlgebraic);
      
      // Call OpenAI API to get a move
      const llmMove = await getOpenAIMove(
        apiKey, 
        game.fen(), 
        moveHistory,
        legalMovesAlgebraic
      );
      
      console.log("LLM suggested move:", llmMove);
      
      // First try exact match
      if (legalMovesAlgebraic.includes(llmMove)) {
        const move = makeAMove({ san: llmMove });
        if (move) return;
      }
      
      // Try without check/mate symbols
      const cleanedMove = llmMove.replace(/[+#]/g, '');
      const matchingMove = legalMovesAlgebraic.find(m => 
        m.replace(/[+#]/g, '') === cleanedMove
      );
      
      if (matchingMove) {
        const move = makeAMove({ san: matchingMove });
        if (move) return;
      }
      
      // If we got here, we need to try a random move as fallback
      throw new Error(`Move "${llmMove}" not found in legal moves`);
      
    } catch (err) {
      console.error('Error making LLM move:', err);
      
      // Fall back to a random legal move
      const legalMoves = game.moves();
      if (legalMoves.length > 0) {
        const randomMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
        console.log("Falling back to random move:", randomMove);
        
        const move = makeAMove({ san: randomMove });
        if (!move) {
          setError(`Could not make move. Please reset the game.`);
        }
      } else {
        setError(`Game appears to be over. No legal moves available.`);
      }
    } finally {
      setIsThinking(false);
    }
  }, [game, apiKey, moveHistory]);












  // Function to update the game status
  function updateGameStatus() {
    let newStatus = '';
    
    if (game.isGameOver()) {
      if (game.isCheckmate()) {
        newStatus = `Checkmate! ${game.turn() === 'w' ? 'Black' : 'White'} wins!`;
      } else if (game.isDraw()) {
        if (game.isStalemate()) {
          newStatus = 'Game over - Draw by stalemate';
        } else if (game.isThreefoldRepetition()) {
          newStatus = 'Game over - Draw by repetition';
        } else if (game.isInsufficientMaterial()) {
          newStatus = 'Game over - Draw by insufficient material';
        } else {
          newStatus = 'Game over - Draw';
        }
      }
    } else {
      if (game.isCheck()) {
        newStatus = `Check! ${game.turn() === 'w' ? 'White' : 'Black'} to move`;
      } else {
        newStatus = `${game.turn() === 'w' ? 'White' : 'Black'} to move`;
      }
    }
    
    setStatus(newStatus);
  }
  
  // // Function to handle piece movement
  // function makeAMove(move) {
  //   const gameCopy = new Chess(game.fen());
    
  //   // See if the move is legal
  //   const result = gameCopy.move(move);
    
  //   // If illegal, return false
  //   if (result === null) return false;
    
  //   // Store the move for highlighting
  //   setLastMove({
  //     from: result.from,
  //     to: result.to,
  //   });
    
  //   setGame(gameCopy);
    
  //   // Update move history
  //   setMoveHistory(prev => [...prev, result.san]);
    
  //   return true;
  // }









  // function makeAMove(move) {
  //   const gameCopy = new Chess(game.fen());
    
  //   console.log("Attempting to make move:", move);
  //   console.log("Current FEN:", gameCopy.fen());
  //   console.log("Legal moves:", gameCopy.moves());
    
  //   // See if the move is legal
  //   try {
  //     const result = gameCopy.move(move);
      
  //     // If illegal, return false
  //     if (result === null) {
  //       console.error("Move rejected by chess.js:", move);
  //       return false;
  //     }
      
  //     // Store the move for highlighting
  //     setLastMove({
  //       from: result.from,
  //       to: result.to,
  //     });
      
  //     setGame(gameCopy);
      
  //     // Update move history
  //     setMoveHistory(prev => [...prev, result.san]);
      
  //     return true;
  //   } catch (error) {
  //     console.error("Error making move:", error, "Move:", move);
  //     return false;
  //   }
  // }














  // function makeAMove(move) {
  //   try {
  //     const gameCopy = new Chess(game.fen());
      
  //     console.log("Attempting to make move:", move);
  //     console.log("Current FEN:", gameCopy.fen());
      
  //     // See if the move is legal
  //     const result = gameCopy.move(move);
      
  //     // If illegal, return false
  //     if (result === null) {
  //       console.error("Move rejected by chess.js as illegal:", move);
  //       return false;
  //     }
      
  //     // Store the move for highlighting
  //     setLastMove({
  //       from: result.from,
  //       to: result.to,
  //     });
      
  //     setGame(gameCopy);
      
  //     // Update move history
  //     setMoveHistory(prev => [...prev, result.san]);
      
  //     return true;
  //   } catch (error) {
  //     console.error("Error in makeAMove:", error, "Move:", move);
  //     return false;
  //   }
  // }








  function makeAMove(move) {
    try {
      const gameCopy = new Chess(game.fen());
      
      console.log("Attempting to make move:", move);
      console.log("Current FEN:", gameCopy.fen());
      
      // Handle both types of move inputs
      let result;
      if (move.san) {
        // For LLM moves that come as {san: "Nc6"}
        result = gameCopy.move(move.san);
      } else {
        // For human moves that come as {from: "a2", to: "a3"}
        result = gameCopy.move(move);
      }
      
      // If illegal, return false
      if (result === null) {
        console.error("Move rejected by chess.js as illegal:", move);
        return false;
      }
      
      // Store the move for highlighting
      setLastMove({
        from: result.from,
        to: result.to,
      });
      
      setGame(gameCopy);
      
      // Update move history
      setMoveHistory(prev => [...prev, result.san]);
      
      return true;
    } catch (error) {
      console.error("Error in makeAMove:", error, "Move:", move);
      return false;
    }
  }


  



  // Function to handle pieces being dragged by human
  function onDrop(sourceSquare, targetSquare) {
    // Don't allow moves when:
    // 1. It's LLM mode and it's Black's turn
    // 2. The game is over
    // 3. The LLM is thinking
    if (
      (gameMode === 'llm' && game.turn() === 'b') || 
      game.isGameOver() || 
      isThinking
    ) {
      return false;
    }
    
    // Attempt the move
    const move = makeAMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q' // Default to queen for pawn promotion
    });
    
    return move;
  }
  
  // Function to reset the game
  function resetGame() {
    setGame(new Chess());
    setMoveHistory([]);
    setError('');
    setLastMove(null);
  }
  
  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '10px' }}>
        <h3>You Play as White</h3>
        {isThinking && (
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '8px 16px', 
            borderRadius: '4px',
            marginBottom: '10px'
          }}>
            OpenAI is thinking...
          </div>
        )}
        {error && (
          <div style={{ 
            backgroundColor: '#f8d7da', 
            color: '#721c24', 
            padding: '8px 16px', 
            borderRadius: '4px',
            marginBottom: '10px'
          }}>
            {error}
          </div>
        )}
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ flex: '0 0 500px' }}>
          <Chessboard 
            position={game.fen()} 
            onPieceDrop={onDrop} 
            boardWidth={500}
            customSquareStyles={
              lastMove ? {
                [lastMove.from]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' },
                [lastMove.to]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' },
              } : {}
            }
          />
        </div>
        
        <div style={{ 
          flex: '1 0 300px', 
          padding: '15px', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '8px',
          minHeight: '400px'
        }}>
          <h2 style={{ borderBottom: '1px solid #dee2e6', paddingBottom: '10px' }}>Game Info</h2>
          
          <div style={{ marginBottom: '15px' }}>
            <strong>Mode:</strong> {gameMode === 'human' ? 'Human vs Human' : 'Human vs OpenAI'}
          </div>
          
          <div style={{ 
            marginBottom: '15px', 
            padding: '10px', 
            backgroundColor: game.isGameOver() ? '#d4edda' : '#e2e3e5',
            borderRadius: '4px',
            fontWeight: 'bold'
          }}>
            {status}
          </div>
          
          <div>
            <h3>Move History</h3>
            <div style={{ 
              maxHeight: '200px', 
              overflowY: 'auto', 
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              padding: '10px'
            }}>
              {moveHistory.length === 0 ? (
                <div style={{ color: '#6c757d', fontStyle: 'italic' }}>No moves yet</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'center', padding: '5px' }}>Move</th>
                      <th style={{ textAlign: 'left', padding: '5px' }}>White</th>
                      <th style={{ textAlign: 'left', padding: '5px' }}>Black</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: Math.ceil(moveHistory.length / 2) }).map((_, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #dee2e6' }}>
                        <td style={{ textAlign: 'center', padding: '5px' }}>{i + 1}</td>
                        <td style={{ padding: '5px' }}>{moveHistory[i * 2]}</td>
                        <td style={{ padding: '5px' }}>{moveHistory[i * 2 + 1] || ''}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
          
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
            <button 
              onClick={resetGame}
              style={{ 
                padding: '10px 20px', 
                fontSize: '16px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              New Game
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChessGame;