const candies = [
  "bombka",
  "choinka",
  "laska_cukrowa",
  "pierniczek",
  "prezent",
  "sniezynka",
  "swiateczny_ostrokrzew",
];

let board = [];

const rows = 5;
const columns = 6;
let score = 0;
let record = localStorage.getItem("record") || 0;

let grid;

let currTile;
let otherTile;

let backdrop;
let welcomeScreen;
let startGameBtn;
let finalScreen;
let endGameBtn;
let startOverBtn;

let zamianaImg;
let czasImg;

let intervalId;

let timerInterval;
let seconds = 0;
let minutes = 0; // Zaczynamy od 02:00 minut

function isMobile() {
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) || window.innerWidth <= 768
  );
}

function init() {
  grid = document.getElementById("grid");
  backdrop = document.getElementById("backdrop");

  welcomeScreen = document.getElementById("welcome-screen");
  startGameBtn = document.getElementById("start-game-btn");

  startGameBtn.addEventListener("click", function () {
    startGame();
  });

  finalScreen = document.getElementById("final-screen");
  endGameBtn = document.getElementById("end-game-btn");
  startOverBtn = document.getElementById("start-over-btn");

  endGameBtn.addEventListener("click", function () {
    window.open("https://www.stokrotka.com.pl", "_blank");
  });

  function restartGame() {
    board = [];
    while (grid.firstChild) {
      grid.removeChild(grid.firstChild);
    }
    initGame();
    startGame();
  }

  startOverBtn.addEventListener("click", function () {
    restartGame();
  });

  zamianaImg = document.getElementById("zamiana-img");
  czasImg = document.getElementById("czas-img");

  const imgPath = "./img/assets/";
  zamianaImg.src = imgPath + (isMobile() ? "zamiana-mobi" : "zamiana") + ".svg";
  czasImg.src = imgPath + (isMobile() ? "czas-mobi" : "czas") + ".png";

  localStorage.setItem("record", record);
  document.getElementById("record").innerText = record;
}

window.onload = () => {
  init();
  initGame();
};

function startGame() {
  score = 0;
  backdrop.classList.add("invisible");
  welcomeScreen.classList.add("invisible");
  if (!finalScreen.classList.contains("invisible")) {
    finalScreen.classList.add("invisible");
  }

  minutes = 2;
  startTimer();

  intervalId = window.setInterval(function () {
    crushCandy();
    slideCandy();
    generateCandy();
  }, 100);
}

function randomCandy() {
  return candies[Math.floor(Math.random() * candies.length)];
}

function initGame() {
  for (let r = 0; r < rows; r++) {
    let row = [];

    for (let c = 0; c < columns; c++) {
      const id = r.toString() + "-" + c.toString();
      const tile = document.createElement("div");
      tile.classList.add("tile");
      tile.id = id;

      tile.classList.add("dark-blue-bg");
      const tileIcon = document.createElement("img");
      tile.append(tileIcon);
      tileIcon.src = "./img/icons/" + randomCandy() + ".png";
      tileIcon.classList.add("tile-icon");

      tile.addEventListener("dragstart", dragStart);
      tile.addEventListener("dragover", dragOver);
      tile.addEventListener("dragenter", dragEnter);
      tile.addEventListener("dragleave", dragLeave);
      tile.addEventListener("drop", dragDrop);
      tile.addEventListener("dragend", dragEnd);

      grid.append(tile);
      row.push(tile);
    }
    board.push(row);
  }

  console.log(board);
}

function dragStart() {
  currTile = this;
}

function dragOver(e) {
  e.preventDefault();
}

function dragEnter(e) {
  e.preventDefault();
}

function dragLeave(e) {
  // e.preventDefault();
}
function dragDrop() {
  otherTile = this;
}

function dragEnd() {
  let currTileEl = document.getElementById(currTile.id);
  const curCoords = currTileEl.id.split("-");
  let r = parseInt(curCoords[0]);
  let c = parseInt(curCoords[1]);
  const currTileImgEl = currTileEl.firstChild;

  let otherTileEl = document.getElementById(otherTile.id);
  const otherCoords = otherTileEl.id.split("-");
  let r2 = parseInt(otherCoords[0]);
  let c2 = parseInt(otherCoords[1]);
  const otherTileImgEl = otherTileEl.firstChild;

  if (
    currTileImgEl.src.includes("blank") ||
    otherTileImgEl.src.includes("blank")
  ) {
    return;
  }

  const moveLeft = c2 === c - 1 && r === r2;
  const moveRight = c2 === c + 1 && r == r2;
  const moveUp = r2 === r - 1 && c === c2;
  const moveDown = r2 === r + 1 && c === c2;

  const isAdjacent = moveDown || moveLeft || moveUp || moveRight;

  if (isAdjacent) {
    let currImgSrc = currTileImgEl.src;
    let otherImgSrc = otherTileImgEl.src;

    currTileImgEl.src = otherImgSrc;
    otherTileImgEl.src = currImgSrc;

    const validMove = checkValid();
    if (!validMove) {
      let currImgSrc = currTileImgEl.src;
      let otherImgSrc = otherTileImgEl.src;

      currTileImgEl.src = otherImgSrc;
      otherTileImgEl.src = currImgSrc;
    }
  }
}

function updateRecord() {
  if (score > record) {
    record = score;
    localStorage.setItem("record", record);
  }

  document.getElementById("record").innerText = record;
}

function crushCandy() {
  crushThree();
  document.getElementById("score").innerText = score;
}

function crushThree() {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns - 2; c++) {
      let candy1 = board[r][c].firstChild;
      let candy2 = board[r][c + 1].firstChild;
      let candy3 = board[r][c + 2].firstChild;

      if (
        candy1.src === candy2.src &&
        candy2.src === candy3.src &&
        !candy1.src.includes("blank")
      ) {
        candy1.src = "./img/icons/blank.png";
        candy2.src = "./img/icons/blank.png";
        candy3.src = "./img/icons/blank.png";
        score += 30;
        updateRecord();
      }
    }
  }

  for (let c = 0; c < columns; c++) {
    for (let r = 0; r < rows - 2; r++) {
      let candy1 = board[r][c].firstChild;
      let candy2 = board[r + 1][c].firstChild;
      let candy3 = board[r + 2][c].firstChild;

      if (
        candy1.src === candy2.src &&
        candy2.src === candy3.src &&
        !candy1.src.includes("blank")
      ) {
        candy1.src = "./img/icons/blank.png";
        candy2.src = "./img/icons/blank.png";
        candy3.src = "./img/icons/blank.png";
        score += 30;
        updateRecord();
      }
    }
  }
}

function checkValid() {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns - 2; c++) {
      let candy1 = board[r][c].firstChild;
      let candy2 = board[r][c + 1].firstChild;
      let candy3 = board[r][c + 2].firstChild;

      if (
        candy1.src === candy2.src &&
        candy2.src === candy3.src &&
        !candy1.src.includes("blank")
      ) {
        return true;
      }
    }
  }

  for (let c = 0; c < columns; c++) {
    for (let r = 0; r < rows - 2; r++) {
      let candy1 = board[r][c].firstChild;
      let candy2 = board[r + 1][c].firstChild;
      let candy3 = board[r + 2][c].firstChild;

      if (
        candy1.src === candy2.src &&
        candy2.src === candy3.src &&
        !candy1.src.includes("blank")
      ) {
        return true;
      }
    }
  }

  return false;
}

function slideCandy() {
  for (let c = 0; c < columns; c++) {
    let ind = rows - 1;
    for (let r = columns - 2; r >= 0; r--) {
      if (!board[r][c].firstChild.src.includes("blank")) {
        board[ind][c].firstChild.src = board[r][c].firstChild.src;
        ind -= 1;
      }
    }

    for (let r = ind; r >= 0; r--) {
      board[r][c].firstChild.src = "img/icons/blank.png";
    }
  }
}

function generateCandy() {
  for (let c = 0; c < columns; c++) {
    if (board[0][c].firstChild.src.includes("blank")) {
      board[0][c].firstChild.src = "./img/icons/" + randomCandy() + ".png";
    }
  }
}

function endGame() {
  clearInterval(intervalId);
  backdrop.classList.remove("invisible");
  finalScreen.classList.remove("invisible");
  document.getElementById("result").innerText = score;
}

// TIMER

function startTimer() {
  if (!timerInterval) {
    timerInterval = setInterval(updateTimer, 1000);
  }
}

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = undefined;
}

function resetTimer() {
  stopTimer();
  seconds = 0;
  minutes = 2;
  updateTimerDisplay();
}

function updateTimer() {
  if (minutes === 0 && seconds === 0) {
    stopTimer();
    endGame();
  } else {
    if (seconds === 0) {
      seconds = 59;
      minutes--;
    } else {
      seconds--;
    }
    updateTimerDisplay();
  }
}

function updateTimerDisplay() {
  const formattedTime = pad(minutes) + ":" + pad(seconds);
  const timer = document.getElementById("timer");
  timer.textContent = formattedTime;
}

function pad(value) {
  return value < 10 ? "0" + value : value;
}
