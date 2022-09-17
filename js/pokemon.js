import {staticData} from './data.js';
import {pickOne} from './utils.js';

export function buildPokemon(model) {
    function filterMoves(pokemonName, allMoves) {
        return allMoves.filter(m => !(model.moveExclusions[pokemonName] || new Set()).has(m));
    }
    const selectedPokemonData = pickOne([...model.selectedPokemon].map(name => staticData.getPokemonByName(name))),
        quickMoveName = pickOne(filterMoves(selectedPokemonData.name, selectedPokemonData.moves.quick)),
        quickMove = staticData.getMoveByName(quickMoveName),
        chargeMoveName = pickOne(filterMoves(selectedPokemonData.name, selectedPokemonData.moves.charge)),
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