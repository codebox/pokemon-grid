function buildPokemon(pokemonNames, staticData) {
    const selectedPokemonData = pickOne([...pokemonNames].map(name => staticData.getPokemonByName(name))),
        quickMoveName = pickOne(selectedPokemonData.moves.quick),
        quickMove = staticData.getMoveByName(quickMoveName),
        chargeMoveName = pickOne(selectedPokemonData.moves.charge),
        chargeMove = staticData.getMoveByName(chargeMoveName);

    return {
        id: `${selectedPokemonData.name}/${quickMoveName}/${chargeMoveName}`,
        name: selectedPokemonData.name,
        stats: selectedPokemonData.stats,
        types: selectedPokemonData.types,
        ivs: {'attack': 15, 'defence': 15, 'hp': 15},
        level: 40,
        quickMove,
        chargeMove
    };
}