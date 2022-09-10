function buildBattles() {
    let allBattles = [],
        completedBattleCount = 0;

    function getTypeEffectivenessMultiplier(moveType, pokemonTypes) {
        return pokemonTypes.map(pokemonType => typeEffectiveness[moveType][pokemonType]).reduce((p, c) => p * c, 1);
    }

    function buildState(p) {
        return {
            quickMoveCountdown: 0,
            chargeMoveCountdown: 0,
            energy: 0,
            health: (p.stats.baseStamina + p.ivs.hp) * cpmLookup[p.level],
            singleMove: p.quickMove.name === p.chargeMove.name,
            pokemon: p
        };
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

    const battles = {
        counts: {
            started: 0,
            finished: 0
        },
        forEach(fn, fnFilter = () => true){
            allBattles.forEach(b => {
                if (fnFilter(b)) { //don't do array.filter here because fn() might modify the objects
                    fn(b);
                }
            });
        },
        removeFinished() {
            allBattles = allBattles.filter(b => ! b.finished);
        },
        tick(tMsDelta) {
            this.forEach(battle => battle.tick(tMsDelta));
        },
        add(p1, p2) {
            const p1State = buildState(p1),
                p2State = buildState(p2),
                p1QuickDamage = damageCalculator.damage(p1, p2, p1.quickMove),
                p1ChargeDamage = damageCalculator.damage(p1, p2, p1.chargeMove),
                p2QuickDamage = damageCalculator.damage(p2, p1, p2.quickMove),
                p2ChargeDamage = damageCalculator.damage(p2, p1, p2.chargeMove);

            battles.counts.started++;

            let t = 0;
            const battle = {
                p1, p2,
                tick(tMsDelta) {
                    p1State.quickMoveCountdown -= tMsDelta;
                    p1State.chargeMoveCountdown -= tMsDelta;

                    if (p1State.energy + p1.chargeMove.energyDelta >= 0 && p1State.chargeMoveCountdown <= 0) {
                        p2State.health -= p1ChargeDamage;
                        p1State.energy += p1.chargeMove.energyDelta;
                        p1State.chargeMoveCountdown = p1.chargeMove.durationMs;
                        if (p1State.singleMove) {
                            p1State.quickMoveCountdown = p1.quickMove.durationMs;
                        }
                        // console.log(`${t}: ${p1.name} CHARGE [${p1.chargeMove.name}/${p1ChargeDamage}] -> ${p2.name} [${p2State.health}]`)
                    } else if (p1State.quickMoveCountdown <= 0) {
                        p2State.health -= p1QuickDamage;
                        p1State.energy += p1.quickMove.energyDelta;
                        p1State.quickMoveCountdown = p1.quickMove.durationMs;
                        // console.log(`${t}: ${p1.name} QUICK [${p1.quickMove.name}/${p1QuickDamage}] -> ${p2.name} [${p2State.health}]`)
                    }

                    p2State.quickMoveCountdown -= tMsDelta;
                    p2State.chargeMoveCountdown -= tMsDelta;
                    if (p2State.energy + p2.chargeMove.energyDelta >= 0 && p2State.chargeMoveCountdown <= 0) {
                        p1State.health -= p2ChargeDamage;
                        p2State.energy += p2.chargeMove.energyDelta;
                        p2State.chargeMoveCountdown = p2.chargeMove.durationMs;
                        if (p2State.singleMove) {
                            p2State.quickMoveCountdown = p2.quickMove.durationMs;
                        }
                        // console.log(`${t}: ${p2.name} CHARGE [${p2.chargeMove.name}/${p2ChargeDamage}] -> ${p1.name} [${p1State.health}]`)
                    } else if (p2State.quickMoveCountdown <= 0) {
                        p1State.health -= p2QuickDamage;
                        p2State.energy += p2.quickMove.energyDelta;
                        p2State.quickMoveCountdown = p2.quickMove.durationMs;
                        // console.log(`${t}: ${p2.name} QUICK [${p2.quickMove.name}/${p2QuickDamage}] -> ${p1.name} [${p1State.health}]`)
                    }

                    if (p1State.health <= 0) {
                        battles.counts.finished++;
                        this.finished = true;
                        if (p2State.health > 0) {
                            this.winner = p2;
                            this.loser = p1;
                        }

                    } else if (p2State.health <= 0) {
                        battles.counts.finished++;
                        this.finished = true;
                        this.winner = p1;
                        this.loser = p2;
                    }
                    t += tMsDelta;
                },
                finished: false,
                winner: null,
                loser: null
            };
            allBattles.push(battle);
        }
    };
    return battles;
}
