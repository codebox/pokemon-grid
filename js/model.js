function buildModel(config) {
    const grid = buildGrid(config.grid.width, config.grid.height);
    grid.populate(() => buildPokemon(config));

    const battles = buildBattles();

    return {
        grid, battles
    };
}