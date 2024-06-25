class GeneString {

    static GeneLoad = 16;
    static MutationFactor = 0.5;
    static MutationChance = 0.01;

    static RandomGenes(length) {

        let gene = new GeneString();
        for (let i = 0; i < length; i++) {
            let value = Math.round(lerp(0, GeneString.GeneLoad, Math.random()));
            gene.Genes.push(value)
        }

        return gene;
    }

    static Meiosis(gene1, gene2) {
        if (gene1.Genes.length != gene2.Genes.length)
            throw `Genes must be the same length for meiosis. (${gene1.Genes.length}, ${gene2.Genes.length})`
        let length = gene1.Genes.length;

        let gene3 = new GeneString();
        for (let i = 0; i < length; i++) {
            // 50% chance to select parent gene.
            let geneSelector = Math.random();
            if (geneSelector < 0.5)
                gene3.Genes.push(gene1.Genes[i])
            else
                gene3.Genes.push(gene2.Genes[i])

            // Mutation by chance
            let mutation = Math.random();
            if (mutation < GeneString.MutationChance) {
                let mutationValue = Math.random() + GeneString.MutationFactor;
                gene3.Genes[i] = Math.round(gene3.Genes[i] * mutationValue);

                if (gene3.Genes[i] > GeneString.GeneLoad - 1) {
                    gene3.Genes[i] = GeneString.GeneLoad - 1;
                }
            }
        }

        return gene3;
    }

    constructor(str) {
        if (str != null)
            this.Genes = str.split('').map(o => parseInt(o, GeneString.GeneLoad));
        else
            this.Genes = [];
    }

    toString() {
        return this.Genes.map(o => o.toString(GeneString.GeneLoad)).join('');
    }

    pullValue(index) {
        return this.Genes[index];
    }

    pullDoubleValue(index) {
        return (this.Genes[index] << 4) + this.Genes[index + 1];
    }

    pullTripleValue(index) {
        return (this.Genes[index] << 8) + (this.Genes[index + 1] << 4) + this.Genes[index + 2];
    }
}