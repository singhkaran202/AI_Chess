# AI Chess App

A web-based chess application that allows users to play chess against OpenAI's language model. This project explores how generative language models can interpret chess board positions and make intelligent moves.


## Features

- **Human vs Human Mode**: Play chess against another person on the same device
- **Human vs AI Mode**: Play chess against OpenAI's language model
- **Interactive Chess Board**: Fully functional chess board with all standard chess rules implemented
- **Move Validation**: Prevents illegal moves according to official chess rules
- **Move History**: Track and display the history of moves during the game
- **Game Status**: Real-time updates of the game status (check, checkmate, stalemate, etc.)
- **Highlight Last Move**: Visual indication of the last move made
- **New Game Option**: Easily reset the board and start a new game

## Technologies Used

- React 19
- Vite
- [chess.js](https://github.com/jhlywa/chess.js) - Chess logic implementation
- [react-chessboard](https://github.com/Clariity/react-chessboard) - Chessboard UI component
- OpenAI API

## Getting Started

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/singhkaran202/ai_chess.git
   cd singhkaran202-ai_chess
   ```
2.  Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to the URL shown in your terminal (typically http://localhost:5173/)

## Usage

1. When you first open the app, you'll be in "Human vs Human" mode by default.

2. To play against the AI:
   - Enter your OpenAI API key in the input field at the top of the page
   - Click "Set API Key"
   - Click the "Current Mode" button to switch to "Human vs OpenAI" mode

3. Playing the game:
   - You always play as White
   - In AI mode, the OpenAI model will automatically make moves as Black
   - Drag and drop pieces to make your moves
   - The game status and move history are displayed on the right side
   - Use the "New Game" button to reset the board at any time

4. AI Performance:
   - The AI uses OpenAI's language model to interpret the board and make moves
   - The model receives the current board state in FEN notation, move history, and a list of legal moves
   - If the AI suggests an invalid move, the app will automatically fallback to a random legal move


## Development

### Key Components

- **App.jsx**: Main application component that manages the game mode and API key
- **chessGame.jsx**: Chess game logic and UI implementation
- **ApiKeyInput.jsx**: Component for handling API key input and storage
- **llmService.js**: Service for communicating with the OpenAI API
