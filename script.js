let canvas = document.querySelector("#canvas")
let size;
if (window.innerWidth < 500) {
    canvas.width = window.innerWidth;
    canvas.height = 300
    size = 20
} else {

    canvas.width = 800;
    canvas.height = 800;
    size = 40
}


const arrowImgUpDom = document.querySelector("#arrowUpImg");
const arrowImgDownDom = document.querySelector("#arrowDownImg");
const arrowImgLeftDom = document.querySelector("#arrowLeftImg");
const arrowImgRightDom = document.querySelector("#arrowRightImg");


const moveUpDom = document.querySelector("#up");
const moveDownDom = document.querySelector("#down");
const moveRightDom = document.querySelector("#right");
const moveLeftDom = document.querySelector("#left");


const scoreDom = document.querySelector("#score");

const restartDom = document.querySelector('#restart');

let score = 0;
let ctx = canvas.getContext('2d');
let direction = "";

let fps, fpsInterval, startTime, now, then, elapsed, pause;
let firstMove = false;

const Snake = () => {
    let body = [];
    let _snakeWidth = size;
    let _snakeHeight = size;
    let _velocity = size;
    let _headColor = "#2A9D8F";
    let _bodyColor = "#E76F51";
    let _tailColor = "#E76F51"

    const init = () => {
        const organ = {
            x: Math.floor(Math.random() * (canvas.width / _snakeWidth)) * _snakeWidth,
            y: Math.floor(Math.random() * (canvas.height / _snakeHeight)) * _snakeHeight,
            width: _snakeWidth,
            height: _snakeHeight,
            color: _headColor,
            bodyPart: "head",
        }
        body.push(organ);



    }
    const draw = () => {
        let color;
        for (let i = 0; i < body.length; i++) {
            if (body[i].bodyPart !== "head") {
                if (i === body.length - 1) {
                    color = _tailColor
                } else {
                    color = body[i].color;
                }
            } else {
                color = body[i].color
            }
            drawRect(body[i].x, body[i].y, body[i].width, body[i].height, color);


        }

    }

    const move = () => {

        for (let i = body.length - 1; i >= 1; i--) {
            body[i].x = body[i - 1].x;
            body[i].y = body[i - 1].y;

        }

        if (direction === "right") {
            body[0].x += _velocity;

        } else if (direction === "left") {
            body[0].x += -_velocity;

        } else if (direction === "down") {
            body[0].y += _velocity;
        } else if (direction === "up") {
            body[0].y += -_velocity;
        }

    }


    const eat = (food) => {
        return collision(body, food);
    }

    const grow = (hasEaten) => {

        if (!hasEaten) return;
        const newOrgan = {
            x: body[body.length - 1].x,
            y: body[body.length - 1].y,
            width: _snakeWidth,
            height: _snakeHeight,
            color: _bodyColor,
            bodyPart: "tail"
        }
        body.push(newOrgan);
        score += 10;
        scoreDom.textContent = `Score : ${score}`;
    }

    const boderLimiter = () => {
        let gameOver = false;
        if (body[0].x >= canvas.width) {
            body[0].x = canvas.width - _snakeWidth;
            gameOver = true;
        }
        if (body[0].x + _snakeWidth <= 0) {
            body[0].x = 0;
            gameOver = true;
        }
        if (body[0].y >= canvas.height) {
            body[0].y = canvas.height - _snakeHeight;
            gameOver = true;
        }
        if (body[0].y + _snakeHeight <= 0) {
            body[0].y = 0;
            gameOver = true;
        }
        return gameOver;

    }
    const dead = () => {
        for (let i = 2; i < body.length; i++) {
            if (collision(body, body[i])) {
                return true;
            }
        }
        return false
    }

    const getBody = () => {
        return body
    }

    const setBody = (any) => {
        body = any;
    }
    return { draw, move, init, eat, grow, boderLimiter, dead, getBody, setBody }
}

const food = () => {
    let foodColor = "#d90429"
    let width = size;
    let x = Math.floor(Math.random() * (canvas.width / width)) * width;
    let y = Math.floor(Math.random() * (canvas.height / width)) * width;

    const draw = () => {
        return drawRect(x, y, width, width, foodColor);

    }

    const regenrate = (hasEaten) => {
        if (!hasEaten) return;
        ctx.clearRect(x, y, width, width)
        x = Math.floor(Math.random() * (canvas.width / width)) * width;
        y = Math.floor(Math.random() * (canvas.height / width)) * width;
    }

    return { draw, regenrate };
}

const collision = (body, food) => {
    if (body[0].x >= food.x && body[0].x + body[0].width <= food.x + food.width) {
        if (body[0].y >= food.y && body[0].y + body[0].width <= food.y + food.width) {
            return true;
        } else {
            return false;
        }
    }
}

const drawRect = (x, y, width, height, color = "green") => {
    const body = {
        x, y, width, height, color,

    }
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
    return body;
}

const gameOverAnimation = () => {
    drawRect(0, canvas.height / 2 - size * 2, canvas.width, size * 2, "white");
    ctx.fillStyle = "#E76F51"
    ctx.font = `${size}px Times New Roman`;
    ctx.fillText("Game Over!! Click Restart To Play Again!!", 25, canvas.height / 2 - size + 5);
}


const gameOver = (dead, boderLimiter) => {
    if (dead || boderLimiter) {
        pause = true;
        direction = "";
        score = 0;
        gameOverAnimation()

    }
}

const renderImage = (image, x, y, width, height) => {
    ctx.drawImage(image, x, y, width, height);

}

const makeGrid = () => {
    const width = size;
    let hX = size;
    let vY = size;
    for (let i = 0; i < canvas.width / width; i++) {
        ctx.beginPath();
        ctx.moveTo(hX, 0);
        ctx.lineTo(hX, canvas.height);
        ctx.stroke()

        hX += size;

    }

    for (let i = 0; i < canvas.height / width; i++) {
        ctx.beginPath();
        ctx.moveTo(0, vY);
        ctx.lineTo(canvas.width, vY);
        ctx.stroke()

        vY += size;
    }



}


function start(fps) {
    fpsInterval = 1000 / fps;
    then = Date.now();
    startTime = then;
    gameLoop();
}


const update = () => {
    snake.draw();
    let food = apple.draw();
    snake.move();
    let hasEaten = snake.eat(food)
    snake.grow(hasEaten);
    apple.regenrate(hasEaten);
    if (firstMove) {
        gameOver(snake.dead(), snake.boderLimiter());
    } else {

        renderImage(arrowImgUpDom, snake.getBody()[0].x, snake.getBody()[0].y - size, size, size)
        renderImage(arrowImgDownDom, snake.getBody()[0].x, snake.getBody()[0].y + size, size, size)
        renderImage(arrowImgRightDom, snake.getBody()[0].x + size, snake.getBody()[0].y, size, size)
        renderImage(arrowImgLeftDom, snake.getBody()[0].x - size, snake.getBody()[0].y, size, size)
    }

}

const gameLoop = () => {
    requestAnimationFrame(gameLoop);
    now = Date.now();
    elapsed = now - then;
    if (pause) return;
    if (elapsed > fpsInterval) {
        then = now - (elapsed % fpsInterval);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        update();
        if (pause) return;
        makeGrid();
    }


}

const restartGame = () => {
    snake.setBody([]);
    direction = "";
    firstMove = false;
    pause = false;
    score = 0;
    scoreDom.textContent = `Score : ${score}`;
    snake.init();
    apple.regenrate(true);

}

let snake = Snake();
let apple = food()
snake.init();
if (canvas.width === 800) {
    start(12);
} else {
    start(6)
}


document.addEventListener("keydown", (e) => {

    firstMove = true;
    if (e.code === "ArrowRight" && direction !== "left" ||
        direction === "" && e.code === "ArrowRight") {
        direction = "right";
    }
    if (e.code === "ArrowLeft" && direction !== "right" ||
        direction === "" && e.code === "ArrowLeft") {
        direction = "left";

    }
    if (e.code === "ArrowUp" && direction !== "down" ||
        direction === "" && e.code === "ArrowUp") {
        direction = "up";

    }
    if (e.code === "ArrowDown" && direction !== "up" ||
        direction === "" && e.code === "ArrowDown") {
        direction = "down";

    }

})

restartDom.addEventListener("click", () => {
    restartGame();
})

window.addEventListener("resize", () => {
    if (window.innerWidth < 500) {
        canvas.width = 300;
        canvas.height = 300
        size = 20
    } else {

        canvas.width = 800;
        canvas.height = 800;
        size = 40
    }
})

moveUpDom.addEventListener("touchstart", () => {
    firstMove = true;
    if (direction !== "down") {
        direction = "up"
    }
})
moveDownDom.addEventListener("touchstart", () => {
    firstMove = true;
    if (direction !== "up") {
        direction = "down"
    }
})
moveLeftDom.addEventListener("touchstart", () => {
    firstMove = true;
    if (direction !== "right") {
        direction = "left"
    }
})
moveRightDom.addEventListener("touchstart", () => {
    firstMove = true;
    if (direction !== "left") {
        direction = "right"
    }
})

