var STATE_STOPPED = 'stopped',
    STATE_PAUSED = 'paused',
    STATE_RUNNING = 'running';

function buildModel(config, staticData) {

    const model = {
        populateGrid() {
            this.grid = buildGrid(config.grid.width, config.grid.height);
            this.grid.populate(() => buildPokemon(this.selectedPokemon, staticData));
        },
        tick(tMsDelta) {
            this.ts += tMsDelta;
            this.battles.tick(tMsDelta);
        },
        ts: 0,
        finishedBattles: 0,
        selectedPokemon: new Set(['charmander', 'squirtle', 'bulbasaur']),
        weather: ''
    };
    model.battles = buildBattles(model, staticData);
    return model;
}