export async function getOpenAIMove(apiKey, fen, history, legalMoves, retryCount = 0) {
  const API_URL = "https://api.openai.com/v1/chat/completions";
  const MAX_RETRIES = 2;
  
 
  const formattedHistory = history.length > 0 
    ? history.map((move, i) => {
        const moveNumber = Math.floor(i/2) + 1;
        return i % 2 === 0 
          ? `${moveNumber}. ${move}` 
          : `${moveNumber}... ${move}`;
      }).join(' ')
    : "No moves played yet.";
  
const prompt = `
You are playing a chess game as Black against a human who plays White.
You must choose the best move for Black in the current position.

Current board state (FEN): ${fen}

Previous moves: ${formattedHistory}

Legal moves available (in algebraic notation): ${legalMoves.join(', ')}

CRITICAL INSTRUCTIONS:
1. Return ONLY the exact chess move in standard algebraic notation (e.g., "e5", "Nf6", "Bxd7", "O-O")
2. Your move MUST be one of the legal moves listed above - EXACTLY as written
3. Do not include any explanations, analysis, or additional text
4. Do not use backticks, quotation marks or other formatting

Your move (just the move notation):`;

  try {
    console.log("Sending request to OpenAI API...");
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo", 
        messages: [
          {
            role: "system",
            content: "You are an expert chess engine. Provide only the chess move in algebraic notation without any explanation."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.2, 
        max_tokens: 10   
      })
    });

    const data = await response.json();
    
    if (data.error) {
      console.error("API Error:", data.error);
      throw new Error(`OpenAI API error: ${data.error.message}`);
    }
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error("Invalid response format from OpenAI API");
    }
    
    const fullResponse = data.choices[0].message.content;
    console.log("Raw LLM response:", fullResponse);
    
    const move = extractMoveFromResponse(fullResponse);

    if (!legalMoves.some(m => m.replace(/\+|#/g, '') === move.replace(/\+|#/g, ''))) {
      console.warn(`LLM suggested move "${move}" not found in legal moves. Legal moves: ${legalMoves.join(', ')}`);
      
      if (retryCount < MAX_RETRIES) {
        console.log(`Retrying... (${retryCount + 1}/${MAX_RETRIES})`);
        return getOpenAIMove(apiKey, fen, history, legalMoves, retryCount + 1);
      }
      
      console.log("Falling back to random legal move");
      return legalMoves[Math.floor(Math.random() * legalMoves.length)];
    }
    
    return move;
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    
    if (retryCount < MAX_RETRIES) {
      console.log(`Retrying after error... (${retryCount + 1}/${MAX_RETRIES})`);
      return getOpenAIMove(apiKey, fen, history, legalMoves, retryCount + 1);
    }
    

    throw error;
  }
}

function extractMoveFromResponse(response) {

  let cleaned = response.trim()
    .replace(/^```.*$/gm, '') 
    .replace(/^`|`$/g, '')    
    .replace(/["']/g, '')     
    .replace(/\n/g, ' ')      
    .trim();
  

  const moveRegex = /^([KQRBN]?[a-h]?[1-8]?x?[a-h][1-8](?:=[QRBN])?|O-O(?:-O)?)(?:\+|#)?$/;
  

  const words = cleaned.split(/\s+/);
  for (const word of words) {
    if (moveRegex.test(word)) {
      return word;
    }
  }
  
  return cleaned.match(/\S+/)?.[0] || "";
}