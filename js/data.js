import {cpmLookup} from './data/cpm.js';
import {gameMasterDate} from './data/gmDate.js';
import {moveData} from './data/moves.js';
import {pokemonData} from './data/pokemon.js';
import {typeEffectiveness} from './data/types.js';
import {weatherBoost} from './data/weather.js';

const nameToPokemonLookup = {},
    nameToMoveLookup = {};

export const staticData = {
    getAllPokemon() {
        return pokemonData;
    },
    getPokemonByName(name) {
        if (!nameToPokemonLookup[name]) {
            nameToPokemonLookup[name] = pokemonData.find(p => p.name.toLowerCase() === name.toLowerCase());
        }
        return nameToPokemonLookup[name];
    },
    getMoveByName(name) {
        if (!nameToMoveLookup[name]) {
            nameToMoveLookup[name] = moveData.find(p => p.name === name);
        }
        return nameToMoveLookup[name];
    },
    getTypeEffectivenessMultiplier(moveType, pokemonType) {
        return typeEffectiveness[moveType][pokemonType];
    },
    getCpmForLevel(level) {
        return cpmLookup[level];
    },
    isWeatherBoosted(type, weather) {
        const types = weatherBoost[weather] || new Set();
        return types.has(type);
    },
    gameMasterDate
};