const cells = document.querySelectorAll(".cell");
const status = document.getElementById("status");
const resetButton = document.getElementById("reset");
const modeSelector = document.getElementById("mode");
const canvas = document.getElementById('confetti');
const ctx = canvas.getContext('2d');

let board = ["","","","","","","","",""];
let player = "X";
let bot = "O";
let gameActive = true;

const winningConditions = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
];

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let thinkingInterval;

// ----------------- Game -----------------
function handleCellClick(e){
    const idx = e.target.dataset.index;
    if(!gameActive || board[idx]!=="") return;

    makeMove(idx, player);
    if(checkResult(player)) return;

    botThinkingAnimation();
    setTimeout(botMove, 700); // bot thinking delay
}

function makeMove(idx, symbol){
    board[idx] = symbol;
    const cell = cells[idx];
    cell.dataset.symbol = symbol;
    cell.classList.add(symbol.toLowerCase());
}

function checkResult(current){
    let winner = null;
    for(let cond of winningConditions){
        const [a,b,c] = cond;
        if(board[a] && board[a] === board[b] && board[a] === board[c]){
            winner = board[a];
            cells[a].classList.add('winner');
            cells[b].classList.add('winner');
            cells[c].classList.add('winner');
            break;
        }
    }

    if(winner){
        stopThinking();
        if(winner===player) status.textContent="You win! 🎉";
        else status.textContent="Bot wins! 🤖";
        gameActive=false;
        launchConfetti();
        return true;
    } else if(!board.includes("")){
        stopThinking();
        status.textContent="It's a draw! 🤝";
        gameActive=false;
        return true;
    }

    if(current===player) status.textContent="Bot's turn...";
    else status.textContent="Your turn";
    return false;
}

// ----------------- Bot Logic -----------------
function botMove(){
    if(!gameActive) return;
    stopThinking();
    let idx;
    const mode = modeSelector.value;

    if(mode==='easy') idx = getRandomMove();
    else if(mode==='medium') idx = getMediumMove();
    else idx = getBestMove();

    makeMove(idx, bot);
    checkResult(bot);
}

// Easy: Random
function getRandomMove(){
    const empty = board.map((v,i)=>v===""?i:null).filter(v=>v!==null);
    return empty[Math.floor(Math.random()*empty.length)];
}

// Medium: Human-like
function getMediumMove(){
    const chance = Math.random();
    if(chance < 0.7){
        for(let i=0;i<9;i++){ if(board[i]===""){ board[i]=bot; if(checkWinnerSim(board,bot)){ board[i]=""; return i;} board[i]="";} }
        for(let i=0;i<9;i++){ if(board[i]===""){ board[i]=player; if(checkWinnerSim(board,player)){ board[i]=""; return i;} board[i]="";} }
    }
    return getRandomMove();
}

function checkWinnerSim(bd,sym){
    for(let c of winningConditions){
        const [a,b,c1] = c;
        if(bd[a]===sym && bd[b]===sym && bd[c1]===sym) return true;
    }
    return false;
}

// Hard: Perfect Minimax
function getBestMove(){
    let bestScore=-Infinity; let move;
    for(let i=0;i<9;i++){
        if(board[i]===""){
            board[i]=bot;
            let score=minimax(board,0,false);
            board[i]="";
            if(score>bestScore){ bestScore=score; move=i;}
        }
    }
    return move;
}

function minimax(bd,depth,isMax){
    if(checkWinnerSim(bd,bot)) return 10-depth;
    if(checkWinnerSim(bd,player)) return depth-10;
    if(!bd.includes("")) return 0;

    if(isMax){
        let best=-Infinity;
        for(let i=0;i<9;i++){ if(bd[i]===""){ bd[i]=bot; best=Math.max(best,minimax(bd,depth+1,false)); bd[i]="";} }
        return best;
    } else {
        let best=Infinity;
        for(let i=0;i<9;i++){ if(bd[i]===""){ bd[i]=player; best=Math.min(best,minimax(bd,depth+1,true)); bd[i]="";} }
        return best;
    }
}

// ----------------- Bot Thinking Animation -----------------
function botThinkingAnimation(){
    let dots = 0;
    status.textContent="Bot is thinking";
    thinkingInterval = setInterval(()=>{
        dots = (dots+1)%4;
        status.textContent="Bot is thinking"+'.'.repeat(dots);
    },500);
}
function stopThinking(){ clearInterval(thinkingInterval); }
cells.forEach(c=>c.addEventListener('click',()=>stopThinking()));

// ----------------- Confetti -----------------
function launchConfetti(){
    const confetti = [];
    const colors = ['#ff0','#f0f','#0ff','#f00','#0f0','#00f'];
    for(let i=0;i<150;i++){
        confetti.push({
            x:Math.random()*canvas.width,
            y:Math.random()*canvas.height-100,
            r:Math.random()*6+4,
            dx:(Math.random()-0.5)*5,
            dy:Math.random()*5+2,
            color: colors[Math.floor(Math.random()*colors.length)]
        });
    }

    function draw(){
        ctx.clearRect(0,0,canvas.width,canvas.height);
        confetti.forEach(p=>{
            ctx.beginPath();
            ctx.arc(p.x,p.y,p.r,0,2*Math.PI);
            ctx.fillStyle=p.color;
            ctx.fill();
            p.x+=p.dx;
            p.y+=p.dy;
            if(p.y>canvas.height){ p.y=-10; p.x=Math.random()*canvas.width; }
        });
        requestAnimationFrame(draw);
    }
    draw();
}

// ----------------- Reset -----------------
function resetGame(){
    board=["","","","","","","","",""];
    gameActive=true;
    status.textContent="Your turn";
    cells.forEach(c=>{
        c.textContent="";
        c.dataset.symbol="";
        c.classList.remove('x','o','winner');
    });
    ctx.clearRect(0,0,canvas.width,canvas.height);
}

cells.forEach(c=>c.addEventListener('click', handleCellClick));
resetButton.addEventListener('click', resetGame);
