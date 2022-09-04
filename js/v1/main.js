function main() {
    const model = buildModel(),
        view = buildView();

    function initialiseModelWithRandomData() {
        model.pokemon = {};
        for (let y=0; y<model.gridSize; y++) {
            model.pokemon[y] = {};
            for (let x=0; x<model.gridSize; x++) {
                model.pokemon[y][x] = buildRandomPokemon();
            }
        }
    }

    function rndInt(n) {
        return Math.floor(Math.random() * n);
    }
    function isOnGrid(c) {
        return c>=0 && c<model.gridSize;
    }
    function pickRandomPokemonPair() {
        const x1 = rndInt(model.gridSize),
            y1 = rndInt(model.gridSize),
            neighbours = [[x1+1,y1],[x1-1,y1],[x1,y1+1],[x1,y1-1]].filter(p => isOnGrid(p[0]) && isOnGrid(p[1])),
            [x2,y2] = neighbours[rndInt(neighbours.length)];
        return [[x1,y1], [x2,y2]];
    }

    function battle(p1, p2) {
        if (p1 === p2) {
            return p1;
        }
    }

    initialiseModelWithRandomData();
    for(let n=0;n<10;n++) {
        const [[x1,y1], [x2,y2]] = pickRandomPokemonPair(),
            pokemon1 = model.pokemon[y1][x1],
            pokemon2 = model.pokemon[y2][x2],
            winner = battle(pokemon1, pokemon2);
        if (winner == pokemon1) {
            model.pokemon[y2][x2] = pokemon1; // no need to clone?
        } else {
            model.pokemon[y1][x1] = pokemon2;
        }
    }
}
window.onload = main

