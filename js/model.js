var STATE_STOPPED = 'stopped',
    STATE_PAUSED = 'paused',
    STATE_RUNNING = 'running';

function buildModel(config, staticData) {

    const battles = buildBattles(staticData);

    return {
        populateGrid() {
            this.grid = buildGrid(config.grid.width, config.grid.height);
            this.grid.populate(() => buildPokemon(this.selectedPokemon, staticData));
        },
        tick(tMsDelta) {
            this.ts += tMsDelta;
            battles.tick(tMsDelta);
        },
        battles, ts: 0, finishedBattles: 0, selectedPokemon: new Set(['charmander', 'squirtle', 'bulbasaur'])
    };
}