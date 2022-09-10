function buildModel(config) {
    const grid = buildGrid(config.grid.width, config.grid.height);
    grid.populate(() => buildPokemon(config));

    return {
        grid
    };
}