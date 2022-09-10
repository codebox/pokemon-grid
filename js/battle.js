function buildBattle(p1, p2) {
    function buildState(p) {
        return {
            quickMoveCountdown: 0,
            chargeMoveCountdown: 0,
            energy: 0,
            health: (p.stats.baseStamina + p.ivs.hp) * cpmLookup[p.level]
        };
    }

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
                // console.log(`${t}: ${p1.name} uses charge move ${p1.chargeMove.name}`)
                change = true;
            } else if (p1State.quickMoveCountdown <= 0) {
                p2State.health -= p1QuickDamage;
                p1State.quickMoveCountdown = p1.quickMove.durationMs;
                p1State.energy += p1.quickMove.energyDelta;
                // console.log(`${t}: ${p1.name} uses quick move ${p1.quickMove.name}`)
                change = true;
            }

            p2State.quickMoveCountdown -= tMsDelta;
            p2State.chargeMoveCountdown -= tMsDelta;
            if (p2State.energy + p2.chargeMove.energyDelta >= 0) {
                p1State.health -= p2ChargeDamage;
                p2State.energy += p2.chargeMove.energyDelta;
                p2State.chargeMoveCountdown = p2.chargeMove.durationMs;
                // console.log(`${t}: ${p2.name} uses charge move ${p2.chargeMove.name}`)
                change = true;

            } else if (p2State.quickMoveCountdown <= 0) {
                p1State.health -= p2QuickDamage;
                p2State.quickMoveCountdown = p2.quickMove.durationMs;
                p2State.energy += p2.quickMove.energyDelta;
                // console.log(`${t}: ${p2.name} uses quick move ${p2.quickMove.name}`)
                change = true;
            }

            if (change) {
                // console.log(`${t}: ${p1.name} = ${p1State.health}, ${p2.name} = ${p2State.health}`)
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
}