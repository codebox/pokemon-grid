var STATE_STOPPED = 'stopped',
    STATE_PAUSED = 'paused',
    STATE_RUNNING = 'running';

function buildModel(staticData) {
    const model = {
        populateGrid() {
            const size = {
                'small': 50,
                'medium': 100,
                'large': 200
            }[this.gridSize.toLowerCase()];
            this.grid = buildGrid(size, size);
            this.grid.populate(() => buildPokemon(this.selectedPokemon, staticData));
            this.counters = [];
        },
        tick(tMsDelta) {
            this.ts += tMsDelta;
            this.battles.tick(tMsDelta);
        },
        ts: 0,
        finishedBattles: 0,
        selectedPokemon: new Set(['charmander', 'squirtle', 'bulbasaur']),
        weather: '',
        gridSize: 'small',
        counters: []
    };
    model.battles = buildBattles(model, staticData);
    return model;
}