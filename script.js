/*
 * Core game logic for the climbing game.
 *
 * This script implements a simple infinite climbing loop inspired by
 * classic reaction games. The player must match the side of the next
 * hold (left or right) in order to progress. A timer counts down
 * between moves, forcing the player to react quickly. When the timer
 * runs out or the wrong side is chosen, the game ends and the score
 * is displayed.
 */

(function() {
  // DOM element references. These are looked up once at the top of the
  // script to avoid repeated queries during gameplay.
  const rockContainer = document.getElementById('rockContainer');
  const scoreLabel = document.getElementById('score');
  const timeBar = document.getElementById('timeBar');
  const startScreen = document.getElementById('startScreen');
  const gameOverScreen = document.getElementById('gameOver');
  const finalScore = document.getElementById('finalScore');
  const startBtn = document.getElementById('startBtn');
  const restartBtn = document.getElementById('restartBtn');
  const leftBtn = document.getElementById('leftBtn');
  const rightBtn = document.getElementById('rightBtn');

  // Game state variables.
  let holds = [];        // Array storing the current holds (bottom first).
  let score = 0;         // Current player score.
  let timeBarWidth = 100; // Percentage width of the time bar.
  let gameRunning = false; // Whether the game is currently active.
  let lastFrameTime = null; // Timestamp of the last animation frame.

  // Configurable constant for how many milliseconds the timer should take
  // to empty completely when starting a new move. Smaller values make the
  // game faster and more difficult.
  const timeLimitMs = 3000; // 3 seconds per move by default.

  /**
   * Generate an array of random holds. The hold at index 0 represents
   * the bottommost hold the player interacts with first.
   * @param {number} count Number of holds to generate.
   * @returns {string[]} An array containing 'left' or 'right' strings.
   */
  function generateHolds(count) {
    const arr = [];
    for (let i = 0; i < count; i++) {
      arr.push(Math.random() < 0.5 ? 'left' : 'right');
    }
    return arr;
  }

  /**
   * Render the holds into the DOM. Clears the container and rebuilds
   * hold elements from the current state. Holds are displayed in
   * reverse order (highest index at top) because the container is
   * configured with `flex-direction: column-reverse`.
   */
  function renderHolds() {
    rockContainer.innerHTML = '';
    // Iterate from highest to lowest so the bottom hold appears last in the DOM
    for (let i = holds.length - 1; i >= 0; i--) {
      const el = document.createElement('div');
      el.className = 'rock ' + holds[i];
      rockContainer.appendChild(el);
    }
  }

  /**
   * Reset the game state and start a new play session. This function
   * hides overlays, initialises holds and variables, and kicks off
   * the animation loop.
   */
  function startGame() {
    score = 0;
    timeBarWidth = 100;
    holds = generateHolds(12);
    gameRunning = true;
    lastFrameTime = null;
    scoreLabel.textContent = 'Score: ' + score;
    updateTimeBar();
    renderHolds();
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    // Kick off the animation loop
    requestAnimationFrame(gameLoop);
  }

  /**
   * End the current game. Shows the game over overlay and stops
   * processing further input or animation frames.
   */
  function endGame() {
    gameRunning = false;
    finalScore.textContent = 'Your score: ' + score;
    gameOverScreen.classList.remove('hidden');
  }

  /**
   * Handle a player's move. This is called whenever the left or right
   * button is clicked or the corresponding arrow key is pressed.
   *
   * @param {string} side The side chosen by the player ('left' or 'right').
   */
  function handleMove(side) {
    if (!gameRunning) return;
    // Determine whether the player's choice matches the bottom hold.
    const currentHold = holds[0];
    if (side === currentHold) {
      // Correct choice: increment score, remove bottom hold and add a new one on top.
      score += 1;
      holds.shift();
      holds.push(Math.random() < 0.5 ? 'left' : 'right');
      scoreLabel.textContent = 'Score: ' + score;
      // Reset the timer for the next move.
      timeBarWidth = 100;
      // Re-render holds to reflect the updated list.
      renderHolds();
    } else {
      // Incorrect choice ends the game.
      endGame();
    }
  }

  /**
   * Update the time bar UI based on the current width percentage.
   */
  function updateTimeBar() {
    timeBar.style.width = timeBarWidth + '%';
    // Change colour as it depletes (green to red).
    if (timeBarWidth > 50) {
      timeBar.style.backgroundColor = '#4caf50'; // green
    } else if (timeBarWidth > 25) {
      timeBar.style.backgroundColor = '#ffc107'; // yellow
    } else {
      timeBar.style.backgroundColor = '#f44336'; // red
    }
  }

  /**
   * The main animation loop. Called via requestAnimationFrame. It
   * calculates the time delta between frames and reduces the
   * time bar accordingly. If the timer reaches zero, the game ends.
   *
   * @param {DOMHighResTimeStamp} timestamp The current time passed by
   *   requestAnimationFrame.
   */
  function gameLoop(timestamp) {
    if (!gameRunning) return;
    if (lastFrameTime === null) {
      lastFrameTime = timestamp;
    }
    const delta = timestamp - lastFrameTime;
    lastFrameTime = timestamp;
    // Reduce the time bar based on elapsed time. The amount reduced per
    // millisecond is 100 divided by the time limit.
    timeBarWidth -= (delta * 100) / timeLimitMs;
    if (timeBarWidth <= 0) {
      timeBarWidth = 0;
      updateTimeBar();
      endGame();
      return;
    }
    updateTimeBar();
    requestAnimationFrame(gameLoop);
  }

  // Event listeners for UI and keyboard.
  startBtn.addEventListener('click', startGame);
  restartBtn.addEventListener('click', startGame);
  leftBtn.addEventListener('click', () => handleMove('left'));
  rightBtn.addEventListener('click', () => handleMove('right'));

  // Listen for keyboard input so players can use the arrow keys instead of buttons.
  document.addEventListener('keydown', (event) => {
    if (!gameRunning) return;
    if (event.key === 'ArrowLeft') {
      handleMove('left');
    } else if (event.key === 'ArrowRight') {
      handleMove('right');
    }
  });
})();