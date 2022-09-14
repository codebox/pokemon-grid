window.onload = start

function start() {
    const
        staticData = buildStaticData(),
        model = buildModel(staticData),
        view = buildView(model, staticData);

    view.on('stopGoClick', () => {
        if (model.state === STATE_RUNNING) {
            setState(STATE_STOPPED);
        } else {
            try {
                model.validate();
                setState(STATE_RUNNING);
            } catch (err) {
                alert(err);
            }
        }
    });

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
    view.on('moveSelected', event => {
        const {pokemon, move} = event.data;
        if (model.moveExclusions[pokemon]) {
            model.moveExclusions[pokemon].delete(move);
        }
    });
    view.on('moveDeselected', event => {
        const {pokemon, move} = event.data;
        if (!model.moveExclusions[pokemon]) {
            model.moveExclusions[pokemon] = new Set();
        }
        model.moveExclusions[pokemon].add(move);
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
        view.updateStats(model.ts, model.battles.counts.started - model.battles.counts.finished, model.battles.counts.finished, model.battles.counts.drawn);
    }

    let updateListInterval, updateStatsInterval;
    function setState(state) {
        if (state !== model.state) {
            if (state === STATE_RUNNING) {
                model.battles.clear();
                model.populateGrid();
                view.updateForState(model.state = state);
                runTimeStep();
                renderGrid();
                updateListInterval = setInterval(refreshCounters, 1000);
                updateStatsInterval = setInterval(refreshStats, 1000);
            } else {
                clearInterval(updateListInterval);
                clearInterval(updateStatsInterval);
                view.updateForState(model.state = state);
            }
        }
    }

    const tMsDelta = 100,
        stepDelayMillis = 0;

    function runTimeStep() {
        // try to pair up free pokemon into new battles
        model.grid.forEachPokemon(freePokemon => {
            const freeNeighbours = model.grid.getNeighbours(freePokemon).filter(p => p.free).filter(p => p.id !== freePokemon.id);
            if (freeNeighbours.length) {
                const randomFreeNeighbour = pickOne(freeNeighbours);
                freePokemon.free = false;
                randomFreeNeighbour.free = false;
                model.battles.add(freePokemon, randomFreeNeighbour);
            }
        }, pokemon => pokemon.free);

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

    setState(STATE_STOPPED);

}