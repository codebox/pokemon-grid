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

    view.init();
    view.onStopGoClick(() => {
        if (model.state === STATE_RUNNING) {
            setState(STATE_PAUSED);
        } else {
            setState(STATE_RUNNING);
        }
    });

    let updateListInterval;
    function setState(state) {
        if (state !== model.state) {
            view.updateForState(model.state = state);
            if (state === STATE_RUNNING) {
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

    // let prevCount = 0;
    // setInterval(() => {
    //     console.log('Battles/sec: ' + (model.battles.counts.finished - prevCount));
    //     prevCount = model.battles.counts.finished;
    // }, 1000)


    function renderGrid() {
        view.updateGrid();
        if (model.state === STATE_RUNNING) {
            requestAnimationFrame(renderGrid);
        }
    }

    setState(STATE_STOPPED);


}