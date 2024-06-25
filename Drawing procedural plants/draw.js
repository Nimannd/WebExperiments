const width = 800
const height = 800
const canvas = document.getElementById('screen')
var ctx = canvas.getContext("2d");
canvas.width = width
canvas.height = height

const minAngle = 0;
const maxnAngle = 30;
const minlength = 50;
const maxlength = 100;

function drawLine(p1, p2, color) {
    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(p1.x, p1.y)
    ctx.lineTo(p2.x, p2.y)
    ctx.stroke()
}

function drawTree(origin, maxDepth, angle = 0, current = 0) {
    let progress = current / maxDepth;

    let lineV = V(0, lerp(minlength, maxlength, Math.random()));
    lineV.rotateBy(toRad(angle));
    lineV = origin.plus(lineV);

    drawLine(origin, lineV, `rgb(${lerp(64, 166, 1 - progress)}, ${lerp(64, 166, progress)}, 0)`)

    if (current < maxDepth) {
        let count = Math.round(lerp(1, 5, Math.random()))
        for (let i = 0; i < count; i++) {
            drawTree(lineV, maxDepth, angle + lerp(-maxnAngle, maxnAngle, Math.random()), current + 1);
        }
    }
}

drawTree(V(400, 600), 5, 180);