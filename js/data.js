function buildStaticData() {
    return {
        getAllPokemon() {
            return pokemonData;
        },
        getPokemonByName(name) {
            return pokemonData.find(p => p.name.toLowerCase() === name.toLowerCase());
        },
        getMoveByName(name) {
            return moveData.find(p => p.name === name);
        },
        getTypeEffectivenessMultiplier(moveType, pokemonType) {
            return typeEffectiveness[moveType][pokemonType];
        },
        getCpmForLevel(level) {
            return cpmLookup[level];
        }
    };
}