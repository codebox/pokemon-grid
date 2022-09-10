var STATE_STOPPED = 'stopped',
    STATE_PAUSED = 'paused',
    STATE_RUNNING = 'running';

function buildModel(config) {
    const grid = buildGrid(config.grid.width, config.grid.height);
    grid.populate(() => buildPokemon(config));

    const battles = buildBattles();

    return {
        tick(tMsDelta) {
            this.ts += tMsDelta;
            battles.tick(tMsDelta);
        },
        grid, battles, ts: 0, finishedBattles: 0,
        state: STATE_STOPPED
    };
}