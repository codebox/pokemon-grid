var STATE_STOPPED = 'stopped',
    STATE_PAUSED = 'paused',
    STATE_RUNNING = 'running';

function buildModel(config) {

    const battles = buildBattles();

    return {
        populateGrid() {
            this.grid = buildGrid(config.grid.width, config.grid.height);
            this.grid.populate(() => buildPokemon(this.selectedPokemon));
        },
        tick(tMsDelta) {
            this.ts += tMsDelta;
            battles.tick(tMsDelta);
        },
        grid, battles, ts: 0, finishedBattles: 0, selectedPokemon: new Set()
    };
}