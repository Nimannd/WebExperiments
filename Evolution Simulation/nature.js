class NatureSimulation extends Simulation {
    constructor(context, width, height) {
        super(context, width, height);
    }

    Setup() {
        for (let i = 0; i < 6; i++)
            this.AddAnimalFromGene("");
    }

    CalcPhysics() {
        if (this.timePassed % 1000 == 0) {
            this.entities.push(this.RandomFruit());
            this.entities.push(this.RandomFruit());
            this.entities.push(this.RandomFruit());
        }

        super.CalcPhysics();
    }

    RandomFruit() {
        let x = lerp(0, this.ScreenWidth, Math.random());
        let y = lerp(0, this.ScreenHeight, Math.random());
        let fruit = new Fruit(x, y, lerp(4, 10, Math.random()));
        return fruit;
    }

    AddAnimalFromGene(genes) {
        let genestring;
        if (genes == null || genes == "")
            genestring = GeneString.RandomGenes(9);
        else
            genestring = new GeneString(genes);

        let x = lerp(0, this.ScreenWidth, Math.random());
        let y = lerp(0, this.ScreenHeight, Math.random());
        let an = new Animal(x, y, genestring);
        this.AddAnimal(an)
        return an;
    }

    AddAnimal(animal) {
        animal.Nature = this;
        this.entities.push(animal);
    }
}

class Fruit extends Entity {
    constructor(x, y, size) {
        super(x, y);
        this.Size = size;
        this.HalfSize = size / 2;
    }

    calculationStep(timePassed, deltaTime) {
        super.calculationStep(timePassed, deltaTime);

        if (this.age == 30)
            this.Deleted = true;
    }

    draw(canvas) {
        canvas.fillStyle = `rgb(255,0,0)`;
        canvas.beginPath()
        canvas.ellipse(this.position.x + this.HalfSize * 0.8, this.position.y, this.Size * 0.8, this.Size, 0.1, 0, 2 * Math.PI)
        canvas.ellipse(this.position.x - this.HalfSize * 0.8, this.position.y, this.Size * 0.8, this.Size, -0.1, 0, 2 * Math.PI)
        canvas.fill()

        //drawCross(canvas, this.position.x, this.position.y);
    }
}

class Animal extends Entity {
    constructor(x, y, genes) {
        super(x, y);

        this.Genes = genes;
        if (this.Genes.Genes.length > 6)
            this.Genes.Genes = this.Genes.Genes.slice(0, 6);

        this.ColorR = this.Genes.pullDoubleValue(0);
        this.ColorG = this.Genes.pullDoubleValue(2);
        this.ColorB = this.Genes.pullDoubleValue(4);

        this.maxSpeed = this.Genes.pullDoubleValue(0);
        this.movability = Math.PI / this.Genes.pullValue(2);
        this.wanderFactor = this.Genes.pullValue(3) / 15;
        this.energyCapacity = 10 + this.Genes.pullValue(4);
        this.energy = this.energyCapacity;
        this.matingThreshold = this.Genes.pullValue(5) / 15;
        this.lastMating = 0;

        this.target = null;
        this.switchToWandering();

        this.percepetionalScan = new RadiusScan(this, 200);
        this.Scans.push(this.percepetionalScan);

        this.interactionScan = new RadiusScan(this, 10);
        this.Scans.push(this.interactionScan);
    }

    calculationStep(timePassed, deltaTime, delaTimeFraction) {
        this.energy -= 0.01 + (this.velocity.norm() / 100) * delaTimeFraction;
        if (this.energy < 0 && this.currentBehavior != BEHAVIOR.DEAD)
            this.switchToDead();

        switch (this.currentBehavior) {
            case BEHAVIOR.WANDERING:
                this.velocity.rotateBy(lerp(-this.movability, this.movability, Math.random()));

                if (this.energy > this.energyCapacity * this.matingThreshold && this.isMatable()) {
                    let matingTarget = this.percepetionalScan.GetRandomTarget(o => o instanceof Animal && o.isMatable());
                    if (matingTarget != null)
                        this.switchToMating(matingTarget);
                } else {
                    let huntTarget = this.percepetionalScan.GetRandomTarget(o => o instanceof Fruit);
                    if (huntTarget != null)
                        this.switchToHunt(huntTarget);
                }

                break;
            case BEHAVIOR.HUNT:
                {
                    if (this.target == null || this.target.Deleted) {
                        this.switchToWandering();
                        break;
                    }

                    let huntDir = this.target.position.minus(this.position);
                    this.velocity = huntDir.setNorm(this.maxSpeed);

                    let interactionTarget = this.interactionScan.GetFirstTarget(o => o == this.target);
                    if (interactionTarget != null) {
                        interactionTarget.Deleted = true;
                        this.energy += interactionTarget.Size;
                        if (this.energy > this.energyCapacity)
                            this.energy = this.energyCapacity;
                        this.switchToWandering();
                    }
                }
                break;
            case BEHAVIOR.MATING:
                {
                    if (this.target == null || this.target.Deleted || !this.isMatable() || !this.target.isMatable()) {
                        this.switchToWandering();
                        break;
                    }

                    let dir = this.target.position.minus(this.position);
                    this.velocity = dir.setNorm(this.maxSpeed);

                    let interactionTarget = this.interactionScan.GetFirstTarget(o => o == this.target);
                    if (interactionTarget != null) {
                        // Create child
                        let childGene = GeneString.Meiosis(this.Genes, interactionTarget.Genes);
                        let child = new Animal(this.position.x, this.position.y, childGene);
                        this.energy = child.energy = this.energy / 2;
                        this.Nature.AddAnimal(child);

                        // Mark as mated.
                        this.matingHappened();
                        interactionTarget.matingHappened();
                        child.matingHappened();

                        // Switch State
                        this.switchToWandering();
                    }
                }
                break;
            case BEHAVIOR.DEAD:
                if (this.age == 10)
                    this.Deleted = true;
                break;
        }

        super.calculationStep(timePassed, deltaTime, delaTimeFraction);
    }

    switchToWandering() {
        this.currentBehavior = BEHAVIOR.WANDERING;
        this.velocity.randomize(this.maxSpeed * this.wanderFactor);
        this.target = null;
    }

    switchToHunt(target) {
        this.currentBehavior = BEHAVIOR.HUNT;
        this.target = target;
    }

    switchToMating(target) {
        this.currentBehavior = BEHAVIOR.MATING;
        this.target = target;
    }

    switchToDead() {
        this.currentBehavior = BEHAVIOR.DEAD;
        this.velocity = V(0, 0);
        this.age = 0;
    }

    matingHappened() {
        this.lastMating = this.age;
    }

    isMatable() {
        return this.currentBehavior != BEHAVIOR.DEAD && this.lastMating < this.age - 5;
    }

    draw(canvas) {
        //Debug scan circle
        // canvas.fillStyle = `rgb(0,0,0)`;
        // canvas.beginPath()
        // canvas.ellipse(this.position.x, this.position.y, 10, 10, 0.1, 0, 2 * Math.PI)
        // canvas.fill()

        if (this.currentBehavior != BEHAVIOR.DEAD)
            canvas.fillStyle = `rgb(${this.ColorR},${this.ColorG},${this.ColorB})`;
        else
            canvas.fillStyle = `rgb(0,0,0)`;
        canvas.beginPath()
        canvas.ellipse(this.position.x, this.position.y, 5, 5, 0.1, 0, 2 * Math.PI)
        canvas.fill();

        //drawCross(canvas, this.position.x, this.position.y);
    }

    toJSON() {
        return {
            behavior: this.currentBehavior,
            speed: this.velocity.norm(),
            color: `(${this.ColorR}, ${this.ColorG}, ${this.ColorG})`,
            maxSpeed: this.maxSpeed,
            movability: this.movability,
            wanderFactor: this.wanderFactor,
            energy: this.energy,
            energyCap: this.energyCapacity,
            matingThreshold: this.matingThreshold,
            age: this.age,
            genes: this.Genes.toString(),
        }
    }
}

const BEHAVIOR = {
    WANDERING: 0,
    HUNT: 1,
    MATING: 2,
    DEAD: 10
};