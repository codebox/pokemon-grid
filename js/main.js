window.onload = start

function deepFreeze(obj) {
    Object.getOwnPropertyNames(obj).forEach(propName => {
        const value = obj[propName];
        if (value && typeof value === "object") {
            deepFreeze(value);
        }
    });
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
const typeColours = {
    "Bug": "A6B91A",
    "Dark": "705746",
    "Dragon": "6F35FC",
    "Electric": "F7D02C",
    "Fairy": "D685AD",
    "Fighting": "C22E28",
    "Fire": "EE8130",
    "Flying": "A98FF3",
    "Ghost": "735797",
    "Grass": "7AC74C",
    "Ground": "E2BF65",
    "Ice": "96D9D6",
    "Normal": "A8A77A",
    "Poison": "A33EA1",
    "Psychic": "F95587",
    "Rock": "B6A136",
    "Steel": "B7B7CE",
    "Water": "6390F0"
}
const cpmLookup = {
    1: 0.094,
    1.5: 0.1351374318,
    2: 0.16639787,
    2.5: 0.192650919,
    3: 0.21573247,
    3.5: 0.2365726613,
    4: 0.25572005,
    4.5: 0.2735303812,
    5: 0.29024988,
    5.5: 0.3060573775,
    6: 0.3210876,
    6.5: 0.3354450362,
    7: 0.34921268,
    7.5: 0.3624577511,
    8: 0.3752356,
    8.5: 0.387592416,
    9: 0.39956728,
    9.5: 0.4111935514,
    10: 0.4225,
    10.5: 0.4329264091,
    11: 0.44310755,
    11.5: 0.4530599591,
    12: 0.4627984,
    12.5: 0.472336093,
    13: 0.48168495,
    13.5: 0.4908558003,
    14: 0.49985844,
    14.5: 0.508701765,
    15: 0.51739395,
    15.5: 0.5259425113,
    16: 0.5343543,
    16.5: 0.5426357375,
    17: 0.5507927,
    17.5: 0.5588305862,
    18: 0.5667545,
    18.5: 0.5745691333,
    19: 0.5822789,
    19.5: 0.5898879072,
    20: 0.5974,
    20.5: 0.6048236651,
    21: 0.6121573,
    21.5: 0.6194041216,
    22: 0.6265671,
    22.5: 0.6336491432,
    23: 0.64065295,
    23.5: 0.6475809666,
    24: 0.65443563,
    24.5: 0.6612192524,
    25: 0.667934,
    25.5: 0.6745818959,
    26: 0.6811649,
    26.5: 0.6876849038,
    27: 0.69414365,
    27.5: 0.70054287,
    28: 0.7068842,
    28.5: 0.7131691091,
    29: 0.7193991,
    29.5: 0.7255756136,
    30: 0.7317,
    30.5: 0.7347410093,
    31: 0.7377695,
    31.5: 0.7407855938,
    32: 0.74378943,
    32.5: 0.7467812109,
    33: 0.74976104,
    33.5: 0.7527290867,
    34: 0.7556855,
    34.5: 0.7586303683,
    35: 0.76156384,
    35.5: 0.7644860647,
    36: 0.76739717,
    36.5: 0.7702972656,
    37: 0.7731865,
    37.5: 0.7760649616,
    38: 0.77893275,
    38.5: 0.7817900548,
    39: 0.784637,
    39.5: 0.7874736075,
    40: 0.7903,
    40.5: 0.792803968,
    41: 0.79530001,
    41.5: 0.797800015,
    42: 0.8003,
    42.5: 0.802799995,
    43: 0.8053,
    43.5: 0.8078,
    44: 0.81029999,
    44.5: 0.812799985,
    45: 0.81529999,
    45.5: 0.81779999,
    46: 0.82029999,
    46.5: 0.82279999,
    47: 0.82529999,
    47.5: 0.82779999,
    48: 0.83029999,
    48.5: 0.83279999,
    49: 0.83529999,
    49.5: 0.83779999,
    50: 0.84029999,
    50.5: 0.84279999,
    51: 0.84529999
}

function start() {
    deepFreeze(pokemonData);
    deepFreeze(moveData);

    let tMs = 0;
    const tMsDelta = 100,
        stepDelayMillis = 0,
        gridWidth = 50,
        gridHeight = 50;

    let battles = [];

    function pickOne(arr) {
        return arr[Math.floor(arr.length * Math.random())];
    }

    function buildRandomPokemon(names= []) {
        const selectedPokemonData = pickOne(pokemonData.filter(p => names.length === 0 || names.includes(p.name))),
            quickMoveName = pickOne(selectedPokemonData.moves.quick),
            quickMove = moveData.find(m => m.name === quickMoveName),
            chargeMoveName = pickOne(selectedPokemonData.moves.charge),
            chargeMove = moveData.find(m => m.name === chargeMoveName);
            console.assert(quickMove, 'quick move');
            console.assert(chargeMove, 'charge move');

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

    // function buildRandomPokemon(name='', qm = '', cm = '') {
    //     const selectedPokemonData = pickOne(pokemonData.filter(p=> name === '' || p.name === name)),
    //         quickMoveName = pickOne(selectedPokemonData.moves.quick.filter(m => qm === '' || m === qm)),
    //         quickMove = moveData.find(m => m.name === quickMoveName),
    //         chargeMoveName = pickOne(selectedPokemonData.moves.charge.filter(m => cm === '' || m === cm)),
    //         chargeMove = moveData.find(m => m.name === chargeMoveName);
    //     console.assert(quickMove, 'quick move');
    //     console.assert(chargeMove, 'charge move');
    //
    //     return {
    //         name: selectedPokemonData.name,
    //         stats: selectedPokemonData.stats,
    //         types: selectedPokemonData.types,
    //         ivs: {'attack': 15, 'defence': 15, 'hp': 15},
    //         level: 40,
    //         quickMove: {...moveData.find(m => m.name === quickMoveName)},
    //         chargeMove: {...moveData.find(m => m.name === chargeMoveName)},
    //         id: `${selectedPokemonData.name}/${quickMoveName}/${chargeMoveName}`
    //     };
    // }

    function getTypeEffectivenessMultiplier(moveType, pokemonTypes) {
        return pokemonTypes.map(pokemonType => typeEffectiveness[moveType][pokemonType]).reduce((p, c) => p * c, 1);
    }

    const damageCalculator = (function(){
        return {
            damage(attacker, defender, move) {
                const power = move.power,
                    attack = (attacker.stats.baseAttack + attacker.ivs.attack) * cpmLookup[attacker.level],
                    defence = (defender.stats.baseDefense + defender.ivs.defence) * cpmLookup[defender.level],
                    hasStab = move.type in attacker.types,
                    hasWeatherBoost = true, //TODO
                    typeEffectiveness = getTypeEffectivenessMultiplier(move.type, defender.types),
                    multipliers = (hasStab ? 1.2 : 1) * (hasWeatherBoost ? 1.2 : 1) * typeEffectiveness;

                return Math.floor(power * attack * multipliers / (2 * defence)) + 1;
            }
        }
    }());

    const buildBattle = (function(){
        function buildState(p) {
            return {
                quickMoveCountdown: 0,
                chargeMoveCountdown: 0,
                energy: 0,
                health: (p.stats.baseStamina + p.ivs.hp) * cpmLookup[p.level]
            };
        }

        return (p1, p2) => {
            const p1State = buildState(p1),
                p2State = buildState(p2),
                p1QuickDamage = damageCalculator.damage(p1, p2, p1.quickMove),
                p1ChargeDamage = damageCalculator.damage(p1, p2, p1.chargeMove),
                p2QuickDamage = damageCalculator.damage(p2, p1, p2.quickMove),
                p2ChargeDamage = damageCalculator.damage(p2, p1, p2.chargeMove);
let t = 0;
            return {
                p1, p2,
                tick(tMsDelta) {

                    let change = false;
                    p1State.quickMoveCountdown -= tMsDelta;
                    p1State.chargeMoveCountdown -= tMsDelta;
                    if (p1State.energy + p1.chargeMove.energyDelta >= 0 && p1State.chargeMoveCountdown <= 0) {
                        p2State.health -= p1ChargeDamage;
                        p1State.energy += p1.chargeMove.energyDelta;
                        p1State.chargeMoveCountdown = p1.chargeMove.durationMs;
                        console.log(`${t}: ${p1.name} uses charge move ${p1.chargeMove.name}`)
                        change = true;
                    } else if (p1State.quickMoveCountdown <= 0) {
                        p2State.health -= p1QuickDamage;
                        p1State.quickMoveCountdown = p1.quickMove.durationMs;
                        p1State.energy += p1.quickMove.energyDelta;
                        console.log(`${t}: ${p1.name} uses quick move ${p1.quickMove.name}`)
                        change = true;
                    }

                    p2State.quickMoveCountdown -= tMsDelta;
                    p2State.chargeMoveCountdown -= tMsDelta;
                    if (p2State.energy + p2.chargeMove.energyDelta >= 0) {
                        p1State.health -= p2ChargeDamage;
                        p2State.energy += p2.chargeMove.energyDelta;
                        p2State.chargeMoveCountdown = p2.chargeMove.durationMs;
                        console.log(`${t}: ${p2.name} uses charge move ${p2.chargeMove.name}`)
                        change = true;

                    } else if (p2State.quickMoveCountdown <= 0) {
                        p1State.health -= p2QuickDamage;
                        p2State.quickMoveCountdown = p2.quickMove.durationMs;
                        p2State.energy += p2.quickMove.energyDelta;
                        console.log(`${t}: ${p2.name} uses quick move ${p2.quickMove.name}`)
                        change = true;
                    }

                    if (change) {
                        console.log(`${t}: ${p1.name} = ${p1State.health}, ${p2.name} = ${p2State.health}`)
                    }
                    if (p1State.health <= 0) {
                        this.finished = true;
                        if (p2State.health > 0) {
                            this.winner = p2;
                            this.loser = p1;
                            // console.log(`${p2.name} beat ${p1.name}`)
                        } else {
                            // console.log(`${p1.name} vs ${p2.name} - DRAW`)
                        }
                    } else if (p2State.health <= 0) {
                        this.finished = true;
                        this.winner = p1;
                        this.loser = p2;
                        // console.log(`${p1.name} beat ${p2.name}`)
                    } else {
                        // console.log(`${p1.name} [${p1State.health}] - ${p2.name} [${p2State.health}]`)
                    }
                    t += tMsDelta;
                },
                finished: false,
                winner: null,
                loser: null
            };
        };
    }());

    const grid = (function(width, height){
        const allPokemon = [];
        return {
            width, height,
            init() {
                for (let y=0; y<height; y++) {
                    for (let x=0; x<width; x++) {
                        // allPokemon.push({...buildRandomPokemon(['Unown', 'Groudon']), free: true, x, y});
                        allPokemon.push({...buildRandomPokemon(), free: true, x, y});
                    }
                }
                // allPokemon.push({...buildRandomPokemon('Squirtle', 'Water Pulse', 'Water Pulse'), free: true, x:0, y:0});
                // allPokemon.push({...buildRandomPokemon('Charmander', 'Ember Fast', 'Flamethrower'), free: true, x:0, y:1});
                console.log('init',allPokemon)
            },
            forEachPokemon(fn, fnFilter = () => true){
                // shuffleArray(allPokemon);
                allPokemon.forEach(p => {
                    if (fnFilter(p)) { //don't do array.filter here because fn() might modify the objects
                        fn(p);
                    }
                });
            },
            getNeighbours(pokemon) {
                //TODO slow
                const {x,y} = pokemon;
                return [[-1,0], [1, 0], [0, -1], [0, 1]].map(deltas => {
                    const [xDelta, yDelta] = deltas,
                        neighbourX = x + xDelta,
                        neighbourY = y + yDelta;
                    return allPokemon.find(p => p.x === neighbourX && p.y === neighbourY);
                }).filter(p => p);
            },
            replacePokemon(oldPokemon, newPokemon) {
                console.log(`replacing ${oldPokemon.name} with ${newPokemon.name}`)
                const {x,y} = oldPokemon,
                    index = y * grid.width + x;
                allPokemon[index] = {...newPokemon, x, y};
                // console.log('grid is now', allPokemon)
            }
        };
    }(gridWidth, gridHeight));

    function runTimeStep() {
        // try to pair up free pokemon into new battles
        grid.forEachPokemon(freePokemon => {
            const freeNeighbours = grid.getNeighbours(freePokemon).filter(p => p.free).filter(p => p.id !== freePokemon.id);
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
                grid.replacePokemon(loser, winner);
                updateList();
            } else {
                finishedBattle.p1.free = true;
                finishedBattle.p2.free = true;
            }
        });
        battles = battles.filter(b => !b.finished);

        setTimeout(runTimeStep, stepDelayMillis);
    }

    const canvas = document.getElementById('grid'),
        ctx = canvas.getContext('2d');

    function getPokemonColour(pokemon) {
        return typeColours[pokemon.types[0]];
    }
    function getPokemonNameColour(name) {
        const pokemon = pokemonData.find(p => p.name === name)
        return getPokemonColour(pokemon);
    }
    function renderGrid() {
        const cellWidth = canvas.width / grid.width,
            cellHeight = canvas.height /grid.height;
        ctx.clearRect(0,0, canvas.width, canvas.height);
        grid.forEachPokemon(pokemon => {
            ctx.fillStyle = `#${getPokemonColour(pokemon)}`;
            ctx.fillRect(pokemon.x * cellWidth, pokemon.y * cellHeight, cellWidth, cellHeight);
        });

        requestAnimationFrame(renderGrid);
    }

    const list = document.getElementById('list');
    function updateList() {
        const pokemonCounts = {};
        grid.forEachPokemon(p => {
            if (!(p.name in pokemonCounts)) {
                pokemonCounts[p.name] = 0;
            }
            pokemonCounts[p.name]++;
        })
        list.innerHTML = '';

        const arr = Object.keys(pokemonCounts).sort(function(p1,p2){return pokemonCounts[p2]-pokemonCounts[p1]})
        list.innerHTML = arr.map(name => `<li><div style="background-color: #${getPokemonNameColour(name)}" class="box"></div> ${name} - ${pokemonCounts[name]}</li>`).join('');

    }

    grid.init();
    updateList();
    runTimeStep();
    renderGrid();
}