function buildGrid(width, height) {
    let allPokemon;

    return {
        width, height,
        populate(buildPokemon) {
            allPokemon = [];
            for (let y=0; y<height; y++) {
                for (let x=0; x<width; x++) {
                    allPokemon.push({...buildPokemon(), free: true, x, y});
                }
            }
        },
        forEachPokemon(fn, fnFilter = () => true){
            allPokemon.forEach(p => {
                if (fnFilter(p)) { //don't do array.filter here because fn() might modify the objects
                    fn(p);
                }
            });
        },
        getPokemon(x, y) {
            return allPokemon[y*width + x];
        },
        getNeighbours(pokemon) {
            const {x,y} = pokemon;
            // return [[x-1,y], [x+1,y], [x,y-1], [x,y+1]]
            return [[x-1,y-1], [x-1,y], [x-1,y+1], [x,y-1], [x,y+1], [x+1,y-1], [x+1,y], [x+1,y+1]]
                .filter(([x,y]) => x>=0 && y>=0 && x<width && y<height)
                .map(([x,y]) => this.getPokemon(x, y));
        },
        replacePokemon(oldPokemon, newPokemon) {
            const {x,y} = oldPokemon,
                index = y * width + x;
            allPokemon[index] = {...newPokemon, x, y};
        }
    };
}