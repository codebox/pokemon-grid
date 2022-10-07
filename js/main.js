import {buildView} from './view.js';
import {buildModel, STATE_RUNNING, STATE_STOPPED, STATE_PAUSED, STATE_COMPLETED} from './model.js';
import {staticData} from './data.js';
import {pickOne, pickN} from './utils.js';

window.onload = start

const urlHandler = (() => {
    const PARAM_POKEMON_IDS = 'pokemon',
        PARAM_WEATHER = 'weather',
        PARAM_SIZE = 'size',
        POKEMON_ID_SEPARATOR = '_',
        MOVE_ID_SEPARATOR = '.';

    return {
        getModelValuesFromUrl(location) {
            const urlParams = new URLSearchParams(location.search),
                pokemonData = (urlParams.get(PARAM_POKEMON_IDS) || '').split(POKEMON_ID_SEPARATOR),
                weather = urlParams.get(PARAM_WEATHER),
                gridSize = urlParams.get(PARAM_SIZE),
                selectedPokemon = new Set(),
                moveExclusions = {};

            pokemonData.forEach(data => {
                const [pokemonId, ...excludedMoveIds] = data.split(MOVE_ID_SEPARATOR),
                    pokemon = staticData.getPokemonById(Number(pokemonId));
                if (pokemon) {
                    const moveNamesArray = [...pokemon.moves.quick, ...pokemon.moves.charge];
                    selectedPokemon.add(pokemon.name);
                    moveExclusions[pokemon.name] = new Set(excludedMoveIds.map(moveId => moveNamesArray[Number(moveId)]));
                }
            });

            return {
                selectedPokemon,
                moveExclusions,
                weather,
                gridSize
            }
        },
        buildUrlParamsFromModel(model) {
            const pokemons = Array.from(model.selectedPokemon).map(staticData.getPokemonByName),
                pokemonIdsWithMoveExclusions = pokemons.map(pokemon => {
                    const moves = [...pokemon.moves.quick, ...pokemon.moves.charge],
                        excludedMoveIds = (Array.from(model.moveExclusions[pokemon.name] || new Set())).map(name => moves.indexOf(name));
                        return [pokemon.id, ...excludedMoveIds].join(MOVE_ID_SEPARATOR);
                }).join(POKEMON_ID_SEPARATOR);
            return `${PARAM_POKEMON_IDS}=${encodeURIComponent(pokemonIdsWithMoveExclusions)}&${PARAM_WEATHER}=${encodeURIComponent(model.weather)}&${PARAM_SIZE}=${encodeURIComponent(model.gridSize)}`;
        }
    };
})();

function start() {
    const
        model = buildModel(staticData),
        view = buildView(model);

    view.on('stopClick', () => {
        if (model.state !== STATE_STOPPED) {
            setState(STATE_STOPPED);
        }
    });
    view.on('pauseGoClick', () => {
        if (model.state === STATE_PAUSED) {
            setState(STATE_RUNNING);
        } else if (model.state === STATE_RUNNING) {
            setState(STATE_PAUSED);
        }
    });
    view.on('goClick', () => {
        if (model.state === STATE_STOPPED) {
            try {
                initialiseGrid();
                const queryParams = urlHandler.buildUrlParamsFromModel(model);
                window.history.pushState({}, '', '?' + queryParams)
                setState(STATE_RUNNING);
            } catch (err) {
                alert(err);
            }
        }
    });

    function initialiseGrid() {
        model.validate();
        model.battles.clear();
        model.populateGrid();
    }

    view.on('gridOnMouseMove', event => {
        const {x,y} = event.data,
            pokemon = model.grid.getPokemon(x, y);
        view.setInfoText(`${pokemon.name}: ${pokemon.quickMove.name}/${pokemon.chargeMove.name}`);
    });
    view.on('gridOnMouseLeave', () => {
        view.setInfoText('');
    });
    view.on('pokemonSelected', event => {
        model.selectedPokemon.add(event.data);
    });
    view.on('pokemonDeselected', event => {
        model.selectedPokemon.delete(event.data);
    });
    view.on('selectAllPokemon', event => {
        model.moveExclusions = {};
        model.selectedPokemon = new Set(staticData.getAllPokemon().map(p => p.name));
        view.updateSettings();
    });
    view.on('selectNoPokemon', event => {
        model.moveExclusions = {};
        model.selectedPokemon = new Set();
        view.updateSettings();
    });
    view.on('selectRandomPokemon', event => {
        model.moveExclusions = {};
        model.selectedPokemon = new Set(pickN(staticData.getAllPokemon().map(p => p.name), event.data));
        view.updateSettings();
    });
    view.on('moveSelected', event => {
        const {pokemon, move} = event.data;
        if (model.moveExclusions[pokemon]) {
            model.moveExclusions[pokemon].delete(move);
        }
        view.updateSettings();
    });
    view.on('moveDeselected', event => {
        const {pokemon, move} = event.data;
        if (!model.moveExclusions[pokemon]) {
            model.moveExclusions[pokemon] = new Set();
        }
        model.moveExclusions[pokemon].add(move);
        view.updateSettings();
    });
    view.on('gridSizeSelected', event => {
        model.gridSize = event.data;
    });
    view.on('weatherSelected', event => {
        model.weather = event.data;
    });

    function refreshCounters() {
        const pokemonCounts = {};
        model.grid.forEachPokemon(p => {
            if (!(p.name in pokemonCounts)) {
                pokemonCounts[p.name] = 0;
            }
            pokemonCounts[p.name]++;
        });
        view.updateList(pokemonCounts);
        model.counters.push(pokemonCounts);
        view.updateGraph(model.counters);
    }

    function refreshStats() {
        view.updateStats(model.weather, model.ts, model.grid.height * model.grid.width, model.battles.counts.started - model.battles.counts.finished, model.battles.counts.finished);
    }

    let updateListInterval, updateStatsInterval;
    function setState(newState) {
        if (newState !== model.state) {
            if (newState === STATE_RUNNING) {
                view.updateForState(model.state = newState);
                runTimeStep();
                renderGrid();
                refreshCounters();
                updateListInterval = setInterval(refreshCounters, 1000);
                refreshStats();
                updateStatsInterval = setInterval(refreshStats, 1000);
            } else {
                clearInterval(updateListInterval);
                clearInterval(updateStatsInterval);
                view.updateForState(model.state = newState);
            }
        }
    }

    const tMsDelta = 100,
        stepDelayMillis = 0;

    function runTimeStep() {
        // try to pair up free pokemon into new battles
        model.grid.forEachPokemon(freePokemon => {
            const freeNeighbours = model.grid.getNeighbours(freePokemon, model.includeDiagonalNeighbours).filter(p => p.free).filter(p => p.id !== freePokemon.id);
            if (freeNeighbours.length) {
                const randomFreeNeighbour = pickOne(freeNeighbours);
                freePokemon.free = false;
                randomFreeNeighbour.free = false;
                model.battles.add(freePokemon, randomFreeNeighbour);
            }
        }, pokemon => pokemon.free);

        if (model.battles.counts.started === model.battles.counts.finished) {
            setState(STATE_COMPLETED);
        }

        model.tick(tMsDelta);

        model.battles.forEach(finishedBattle => {
            const winner = finishedBattle.winner;
            if (winner) {
                winner.free = true;
                const loser = finishedBattle.loser;
                model.grid.replacePokemon(loser, winner);
            } else {
                finishedBattle.p1.free = true;
                finishedBattle.p2.free = true;
            }
        }, b => b.finished);
        model.battles.removeFinished();

        if (model.state === STATE_RUNNING) {
            setTimeout(runTimeStep, stepDelayMillis);
        }
    }

    function renderGrid() {
        view.updateGrid();
        if (model.state === STATE_RUNNING) {
            requestAnimationFrame(renderGrid);
        }
    }

    const modelValues = urlHandler.getModelValuesFromUrl(window.location);

    model.moveExclusions = modelValues.moveExclusions || model.moveExclusions;
    model.weather = modelValues.weather || model.weather;
    model.gridSize = modelValues.gridSize || model.gridSize;
    if (modelValues.selectedPokemon.size) {
        model.selectedPokemon = modelValues.selectedPokemon;
        initialiseGrid();
        view.updateSettings();
        setState(STATE_RUNNING);
    } else {
        view.updateSettings();
        setState(STATE_STOPPED);
    }

}