window.onload = start

function start() {
    const
        config = {
            grid: {
                width: 50,
                height: 50
            }
        },
        model = buildModel(config),
        view = buildView(model);

    view.init();

    deepFreeze(pokemonData);
    deepFreeze(moveData);

    let tMs = 0;
    const tMsDelta = 100,
        stepDelayMillis = 0;

    let battles = [];
    let battleCount = 0;

    function runTimeStep() {
        // try to pair up free pokemon into new battles
        model.grid.forEachPokemon(freePokemon => {
            const freeNeighbours = model.grid.getNeighbours(freePokemon).filter(p => p.free).filter(p => p.id !== freePokemon.id);
            if (freeNeighbours.length) {
                const randomFreeNeighbour = pickOne(freeNeighbours);
                freePokemon.free = false;
                randomFreeNeighbour.free = false;
                battles.push(buildBattle(freePokemon, randomFreeNeighbour));
            }
        }, pokemon => pokemon.free);

        // move each battle on by tMsDelta
        battles.forEach(battle => battle.tick(tMsDelta));
        tMs += tMsDelta

        battles.filter(b => b.finished).forEach(finishedBattle => {
            const winner = finishedBattle.winner;
            if (winner) {
                winner.free = true;
                const loser = finishedBattle.loser;
                model.grid.replacePokemon(loser, winner);
                // updateList();
            } else {
                finishedBattle.p1.free = true;
                finishedBattle.p2.free = true;
            }
            battleCount++;
        });
        battles = battles.filter(b => !b.finished);

        setTimeout(runTimeStep, stepDelayMillis);
    }

    let seconds = 0;
    setInterval(() => {
        seconds++;
        console.log('Battles/sec: ' + battleCount / seconds)
    }, 1000)

    setInterval(view.updateList, 1000);

    function renderGrid() {
        view.updateGrid();
        requestAnimationFrame(renderGrid);
    }

    runTimeStep();
    renderGrid();
}