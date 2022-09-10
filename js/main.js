window.onload = start

function start() {
    const
        config = {
            grid: {
                width: 100,
                height: 100
            }
        },
        model = buildModel(config),
        view = buildView(model);

    view.on('stopGoClick', () => {
        if (model.state === STATE_RUNNING) {
            setState(STATE_PAUSED);
        } else {
            setState(STATE_RUNNING);
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
    view.on('newGridClick', event => {
        setState(STATE_STOPPED);
    });

    let updateListInterval;
    function setState(state) {
        if (state !== model.state) {
            view.updateForState(model.state = state);
            if (state === STATE_RUNNING) {
                model.battles.clear();
                model.populateGrid();
                runTimeStep();
                renderGrid();
                updateListInterval = setInterval(view.updateList, 1000);
            } else {
                clearInterval(updateListInterval);
            }
        }
    }

    deepFreeze(pokemonData);
    deepFreeze(moveData);

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

    view.populatePokemonSelectionList(pokemonData);
    setState(STATE_STOPPED);

}