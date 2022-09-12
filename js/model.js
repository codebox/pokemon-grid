var STATE_STOPPED = 'stopped',
    STATE_PAUSED = 'paused',
    STATE_RUNNING = 'running';

function buildModel(staticData) {

    const model = {
        populateGrid() {
            const size = {
                'Small': 50,
                'Medium': 100,
                'Large': 200
            }[this.gridSize];
            this.grid = buildGrid(size, size);
            this.grid.populate(() => buildPokemon(this.selectedPokemon, staticData));
        },
        tick(tMsDelta) {
            this.ts += tMsDelta;
            this.battles.tick(tMsDelta);
        },
        ts: 0,
        finishedBattles: 0,
        selectedPokemon: new Set(['charmander', 'squirtle', 'bulbasaur']),
        weather: '',
        gridSize: 'small'
    };
    model.battles = buildBattles(model, staticData);
    return model;
}