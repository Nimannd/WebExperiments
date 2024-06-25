const width = 800
const height = 800
const canvas = document.getElementById('canvas1')
var ctx = canvas.getContext("2d");
canvas.width = width
canvas.height = height

const middle = V(width / 2, height / 2)
const G = 1

const dt = 20

const dots = []
const relations = []
let nextId = 0;

class Relation{
    constructor(a, b, s = 0.0001) {
        this.a = a;
        this.b = b;
        this.strength = s;
    }

    applyPull(){
        this.a.addPull(this.b.position, -this.strength);
        this.b.addPull(this.a.position, -this.strength);
    }

    draw()
    {
        drawConnection(this.a, this.b)
    }
}

class Doti {
    constructor(x = 0, y = 0) {
        this.position = V(x, y)
        this.velocity = V(0.1, 0.3)
        this.color = 'rgb(199, 56, 56)'
        this.radius = 5
        this.relations = []
    }

    setPosition(x, y) {
        this.x = x
        this.y = y
        return this
    }

    draw() {
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI)
        ctx.fill()
    }

    checkEdgeBounce() {
        if (this.position.y >= height - this.radius) {
            this.velocity.y = -this.velocity.y
        }
        if (this.position.x >= width - this.radius) {
            // right wall
            this.velocity.x = -this.velocity.x
        }
        if (this.position.y <= this.radius) {
            this.velocity.y = -this.velocity.y
        }
        if (this.position.x <= this.radius) {
            // left wall
            this.velocity.x = -this.velocity.x
        }
    }

    addGravity(origin, strength) {
        let distance = this.position.minus(origin)
        let force = G * (strength / distance.normSq())

        this.velocity.add(distance.normalize().multiply(force * dt))
    }

    addPull(origin, strength) {
        let distance = this.position.minus(origin)
        this.velocity.add(distance.normalize().multiply(strength * dt))
    }
}

function lerp(min, max, v) {
    return (max - min) * v + min
}

function setup() {
    for (let i = 0; i < 10; i++) {
        let node = new Doti(30, 30)
        node.position.randomize(lerp(0, width / 2, Math.random())).add(middle)
        node.velocity.randomize(lerp(0.05, 0.2, Math.random()))
        dots.push(node)
    }

    for (let i = 0; i < 5; i++) {
        relations.push(new Relation(dots[i], dots[5+i]))
    }

    relations.push(new Relation(dots[0], dots[1], 0.001))
    relations.push(new Relation(dots[2], dots[3], 0.001))
    relations.push(new Relation(dots[4], dots[5], 0.001))

    // dots[0].velocity.set(0.2, 0)
    // dots.push(new Doti(700, 400))
    // dots[1].velocity.set(-0.1, 0)
}

function calcPhysics() {
    dots.forEach(element => {
        element.checkEdgeBounce();
        element.velocity.multiply(0.99)

        dots.forEach(d => {
            if (d != element){
                element.addGravity(d.position, 1);
                element.addPull(d.position, -0.000001);
            }
        })

        //element.addGravity(middle, -0.1);
        element.addPull(middle, -0.0001);
    });

    relations.forEach(element => {
       element.applyPull()
    });
}

function physicsStep() {
    dots.forEach(element => {
        element.position.add(element.velocity.times(dt))
    });
}

function clearCanvas() {
    ctx.clearRect(0, 0, width, height)
}

function drawLine(p1, p2, color){
    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(p1.x, p1.y)
    ctx.lineTo(p2.x, p2.y)
    ctx.stroke()
  }

function drawConnection(node1, node2){
    let displacement = node2.position.minus(node1.position)
    let distance = displacement.norm()
   // if (distance >= maxDistance){ return }
  
    let alpha = 1//rescale(maxDistance, minDistance, distance)
  
    let color = `hsla(180, 90%, 60%, ${alpha})`
    // displacement.debugDraw(ctx, node1.position, 1, false, color)
    drawLine(node2.position, node1.position, color)
}

function draw() {
    clearCanvas()

    relations.forEach(element => {
        element.draw();
    });

    dots.forEach(element => {
        element.draw();
    });
}

function frame() {

    calcPhysics()
    physicsStep()
    draw()
}

function animate() {
    setTimeout(animate, dt)
    frame()
}

setup()
animate()