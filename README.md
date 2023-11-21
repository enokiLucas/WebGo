# WebGo

## Status: in development.
---
Application to play the game of Go inside a browser, built using Web Components (HTML, CSS and JavaScript) and Ruby on Rails (not yet implemented).


3beb957

Last commit before switching to the Web Components Format: fb4cfe5
app.js deprecated.
---
go-game/
│
├── index.html           # Entry point of your application
│
├── assets/              # Static files like images, fonts, etc.
│   ├── images/
│   └── styles/
│       ├── main.css    # Global styles
│       └── ...
│
├── components/         # Web Components (custom elements)
│   ├── GoBoard.js      # Component for the Go board
│   ├── ScoreTracker.js # Component for tracking the score
│   ├── GameControls.js # Component for game controls like start, stop
│   ├── GameChat.js     # Component for the in-game chat
│   └── ...             # Other components
│
├── services/           # Services like API calls
│   ├── GameService.js  # Service for handling game logic
│   └── ...
│
├── utils/              # Utility functions and helpers
│   ├── constants.js    # Constants used across the project
│   ├── utils.js        # Utility functions
│   └── ...
│
└── lib/                # Any libraries or third-party scripts
    └── ...
