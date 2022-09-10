function buildModel(width, height) {
    const allPokemon = [];

    function buildRandomPokemon(nameRegex = /.*/) {
        const selectedPokemonData = pickOne(pokemonData.filter(p => p.name.match(nameRegex))),
            quickMoveName = pickOne(selectedPokemonData.moves.quick),
            quickMove = moveData.find(m => m.name === quickMoveName),
            chargeMoveName = pickOne(selectedPokemonData.moves.charge),
            chargeMove = moveData.find(m => m.name === chargeMoveName);
        // console.assert(quickMove, 'quick move');
        // console.assert(chargeMove, 'charge move');

        return {
            name: selectedPokemonData.name,
            stats: selectedPokemonData.stats,
            types: selectedPokemonData.types,
            ivs: {'attack': 15, 'defence': 15, 'hp': 15},
            level: 40,
            quickMove: {...moveData.find(m => m.name === quickMoveName)},
            chargeMove: {...moveData.find(m => m.name === chargeMoveName)},
            id: `${selectedPokemonData.name}/${quickMoveName}/${chargeMoveName}`
        };
    }


    return {
        width, height,
        init() {
            for (let y=0; y<height; y++) {
                for (let x=0; x<width; x++) {
                    // allPokemon.push({...buildRandomPokemon(['Unown', 'Groudon']), free: true, x, y});
                    allPokemon.push({...buildRandomPokemon(new RegExp('Voltorb|Vaporeon|Reshiram|Regice|Snorlax')), free: true, x, y});
                    // allPokemon.push({...buildRandomPokemon(new RegExp('Eevee|Vaporeon|Jolteon|Flareon|Espeon|Umbreon|Leafeon|Glaceon|Sylveon')), free: true, x, y});
                    // allPokemon.push({...buildRandomPokemon(new RegExp('Regice|Regirock|Registeel')), free: true, x, y});
                    // allPokemon.push({...buildRandomPokemon(), free: true, x, y});
                }
            }
            // allPokemon.push({...buildRandomPokemon('Squirtle', 'Water Pulse', 'Water Pulse'), free: true, x:0, y:0});
            // allPokemon.push({...buildRandomPokemon('Charmander', 'Ember Fast', 'Flamethrower'), free: true, x:0, y:1});
            console.log('init',allPokemon)
        },
        forEachPokemon(fn, fnFilter = () => true){
            // shuffleArray(allPokemon);
            allPokemon.forEach(p => {
                if (fnFilter(p)) { //don't do array.filter here because fn() might modify the objects
                    fn(p);
                }
            });
        },
        getPokemon(x,y) {
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