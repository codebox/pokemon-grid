function buildBattles() {
    let battles = [],
        completedBattleCount = 0;

    function getTypeEffectivenessMultiplier(moveType, pokemonTypes) {
        return pokemonTypes.map(pokemonType => typeEffectiveness[moveType][pokemonType]).reduce((p, c) => p * c, 1);
    }

    function buildState(p) {
        return {
            quickMoveCountdown: 0,
            chargeMoveCountdown: 0,
            energy: 0,
            health: (p.stats.baseStamina + p.ivs.hp) * cpmLookup[p.level]
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

    return {
        forEach(fn, fnFilter = () => true){
            battles.forEach(b => {
                if (fnFilter(b)) { //don't do array.filter here because fn() might modify the objects
                    fn(b);
                }
            });
        },
        removeFinished() {
            battles = battles.filter(b => ! b.finished);
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

            let t = 0;
            const battle = {
                p1, p2,
                tick(tMsDelta) {
                    let change = false;
                    p1State.quickMoveCountdown -= tMsDelta;
                    p1State.chargeMoveCountdown -= tMsDelta;

                    if (p1State.energy + p1.chargeMove.energyDelta >= 0 && p1State.chargeMoveCountdown <= 0) {
                        p2State.health -= p1ChargeDamage;
                        p1State.energy += p1.chargeMove.energyDelta;
                        p1State.chargeMoveCountdown = p1.chargeMove.durationMs;
                    } else if (p1State.quickMoveCountdown <= 0) {
                        p2State.health -= p1QuickDamage;
                        p1State.quickMoveCountdown = p1.quickMove.durationMs;
                        p1State.energy += p1.quickMove.energyDelta;
                    }

                    p2State.quickMoveCountdown -= tMsDelta;
                    p2State.chargeMoveCountdown -= tMsDelta;
                    if (p2State.energy + p2.chargeMove.energyDelta >= 0) {
                        p1State.health -= p2ChargeDamage;
                        p2State.energy += p2.chargeMove.energyDelta;
                        p2State.chargeMoveCountdown = p2.chargeMove.durationMs;
                    } else if (p2State.quickMoveCountdown <= 0) {
                        p1State.health -= p2QuickDamage;
                        p2State.quickMoveCountdown = p2.quickMove.durationMs;
                        p2State.energy += p2.quickMove.energyDelta;
                    }

                    if (p1State.health <= 0) {
                        this.finished = true;
                        if (p2State.health > 0) {
                            this.winner = p2;
                            this.loser = p1;
                        }
                    } else if (p2State.health <= 0) {
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
            battles.push(battle);
        }
    };
}
