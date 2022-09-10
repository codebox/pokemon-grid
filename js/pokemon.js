function buildPokemon(pokemonNames) {
    const selectedPokemonData = pickOne(pokemonData.filter(p => pokemonNames.has(p.name))),
        quickMoveName = pickOne(selectedPokemonData.moves.quick),
        quickMove = moveData.find(m => m.name === quickMoveName),
        chargeMoveName = pickOne(selectedPokemonData.moves.charge),
        chargeMove = moveData.find(m => m.name === chargeMoveName);

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