function lerp(min, max, v) {
    return (max - min) * v + min
}

function drawCross(ctx, x, y) {
    ctx.beginPath();
    ctx.setLineDash([5, 5]);
    ctx.moveTo(x, y - 10);
    ctx.lineTo(x, y + 10);

    ctx.moveTo(x - 10, y);
    ctx.lineTo(x + 10, y);
    ctx.stroke();
}