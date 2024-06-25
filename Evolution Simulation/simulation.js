class Simulation {
    constructor(canvas, width, height) {
        this.ScreenHeight = height;
        this.ScreenWidth = width;
        canvas.width = this.ScreenWidth;
        canvas.height = this.ScreenHeight;
        this.canvas = canvas.getContext("2d");;
        this.deltaTime = 20;
        this.deltaTimeFraction = this.deltaTime / 1000;
        this.timePassed = 0;

        this.entities = [];

        this.DebugEvent = null;
    }

    Setup() {
        console.log("Empty Setup called");
    }

    Start() {
        setInterval(this.SimulationStep.bind(this), this.deltaTime)
    }

    SimulationStep() {
        this.CalcScans();
        this.CalcPhysics();
        this.ProceedPhysics();
        this.Draw();
        if (this.DebugEvent)
            this.DebugEvent();
    }

    CalcScans() {
        this.entities.forEach(element => {
            let scans = element.Scans;
            if (scans) {
                scans.forEach(scan => {
                    scan.Reset();
                    this.entities.forEach(scanee => {
                        if (scanee != element)
                            scan.ScanObject(scanee);
                    });
                });
            }
        });
    }

    CalcPhysics() {
        this.entities.forEach(element => {
            element.calculationStep(this.timePassed, this.deltaTime, this.deltaTimeFraction);
            element.checkEdgeBounce(this.ScreenWidth, this.ScreenHeight);
        });
    }

    ProceedPhysics() {
        this.entities.forEach(element => {
            element.position.add(element.velocity.times(this.deltaTime / 1000));
        });

        if (this.entities.some(o => o.Deleted))
            this.entities = this.entities.filter(o => !o.Deleted);

        this.timePassed += this.deltaTime;
    }

    Draw() {
        this.canvas.clearRect(0, 0, this.ScreenWidth, this.ScreenHeight);

        this.entities.forEach(element => {
            element.draw(this.canvas);
        });
    }
}

class Entity {
    constructor(x = 0, y = 0) {
        this.position = V(x, y);
        this.velocity = V(0, 0);
        this.Scans = [];
        this.Deleted = false;
        this.age = 0;
    }

    setPosition(x, y) {
        this.x = x
        this.y = y
        return this
    }

    draw(canvas) {
        canvas.fillStyle = `rgb(255,0,0)`;
        canvas.beginPath()
        canvas.arc(this.position.x, this.position.y, 5, 0, 2 * Math.PI)
        canvas.fill()
    }

    calculationStep(timePassed, deltaTime, delaTimeFraction) {
        if (timePassed % 1000 == 0) {
            this.age++;
        }
    }

    getScans() {

    }

    checkEdgeBounce(width, height) {
        if (this.position.y >= height) {
            this.velocity.y = -Math.abs(this.velocity.y);
        }
        if (this.position.x >= width) {
            this.velocity.x = -Math.abs(this.velocity.x);
        }
        if (this.position.y <= 0) {
            this.velocity.y = Math.abs(this.velocity.y);
        }
        if (this.position.x <= 0) {
            // left wall
            this.velocity.x = Math.abs(this.velocity.x);
        }
    }
}

// More an interface than a class
class EntityScan {
    constructor(scanningEntity) {
        this.scanner = scanningEntity;
        this.Scanned = [];
    }

    ScanObject(scanee) {

    }

    Reset() {
        this.Scanned.length = 0;
    }

    GetFirstTarget(condition) {
        if (condition)
            return this.Scanned.find(condition);
        else
        if (this.Scanned.length > 0) {
            return this.Scanned[0];
        }
    }

    GetRandomTarget(condition) {
        let array = this.Scanned;

        if (condition)
            array = array.filter(condition);

        if (array.length == 0)
            return null;

        let i = Math.round(lerp(0, array.length, Math.random()));
        return array[i];
    }
}

class RadiusScan extends EntityScan {
    constructor(scanningEntity, radius) {
        super(scanningEntity);
        this.Radius = radius;
    }

    ScanObject(scanee) {
        let dif = this.scanner.position.minus(scanee.position);
        let distance = dif.norm();

        if (distance <= this.Radius) {
            this.Scanned.push(scanee);
        }
    }
}