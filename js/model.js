var STATE_STOPPED = 'stopped',
    STATE_PAUSED = 'paused',
    STATE_RUNNING = 'running';

function buildModel(staticData) {
    const model = {
        populateGrid() {
            const size = {
                'small': 50,
                'medium': 100,
                'large': 200,
                'maximum': 600
            }[this.gridSize.toLowerCase()];
            this.grid = buildGrid(size, size);
            this.grid.populate(() => buildPokemon(model, staticData));
            this.counters = [];
        },
        validate() {
            if (!model.selectedPokemon.size) {
                throw Error('No pokemon have been selected');
            }
            model.selectedPokemon.forEach(pokemonName => {
                const moveExclusions = model.moveExclusions[pokemonName];
                if (moveExclusions && moveExclusions.size) {
                    const pokemon = staticData.getPokemonByName(pokemonName),
                        quickMoveSet = new Set(pokemon.moves.quick),
                        chargeMoveSet = new Set(pokemon.moves.charge);
                    moveExclusions.forEach(mx => {
                        quickMoveSet.delete(mx);
                        chargeMoveSet.delete(mx);
                    });
                    if (!quickMoveSet.size) {
                        throw Error(`${pokemonName} has no quick moves selected`);
                    }
                    if (!chargeMoveSet.size) {
                        throw Error(`${pokemonName} has no charge moves selected`);
                    }
                }
            });
        },
        tick(tMsDelta) {
            this.ts += tMsDelta;
            this.battles.tick(tMsDelta);
        },
        ts: 0,
        selectedPokemon: new Set(['Charmander', 'Squirtle', 'Bulbasaur']),
        moveExclusions: {},
        weather: '',
        gridSize: 'small',
        counters: []
    };
    model.battles = buildBattles(model, staticData);
    return model;
}