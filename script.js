window.focus;
let canvas = document.getElementById("myCanvas");
let c = canvas.getContext("2d");
canvas.height = innerHeight * 0.8
canvas.width = canvas.height * 1.5

let tilesize = canvas.width * 0.01

let blob = {x: 5*tilesize,
    y: 5*tilesize,
    size: tilesize,
    movingUp: false,
    movingDown: false,
    movingLeft: false,
    movingRight: false,
}

document.addEventListener("keydown", (e) => {
    if(e.key == "w"){blob.movingUp = true}
    if(e.key == "a"){blob.movingLeft = true}
    if(e.key == "s"){blob.movingDown = true}
    if(e.key == "d"){blob.movingRight = true}
});
document.addEventListener("keyup", (e) => {
    if(e.key == "w"){blob.movingUp = false}
    if(e.key == "a"){blob.movingLeft = false}
    if(e.key == "s"){blob.movingDown = false}
    if(e.key == "d"){blob.movingRight = false}
});

function animate() {
    requestAnimationFrame(animate);

    c.clearRect(0,0, canvas.width, canvas.height)
    c.fillRect(blob.x - blob.size/2,blob.y - blob.size/2,blob.x + blob.size/2,blob.y + blob.size/2)

    
}

animate()