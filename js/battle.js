import {staticData} from './data.js';

export function buildBattles(model) {
    let allBattles = [];

    function getTypeEffectivenessMultiplier(moveType, pokemonTypes) {
        return pokemonTypes.map(pokemonType => staticData.getTypeEffectivenessMultiplier(moveType, pokemonType)).reduce((p, c) => p * c, 1);
    }

    function buildState(p) {
        return {
            quickMoveCountdown: 0,
            chargeMoveCountdown: 0,
            energy: 0,
            health: (p.stats.baseStamina + p.ivs.hp) * staticData.getCpmForLevel(p.level),
            singleMove: p.quickMove.name === p.chargeMove.name,
            pokemon: p
        };
    }

    const damageCalculator = (function(){
        return {
            damage(attacker, defender, move) {
                const power = move.power,
                    attack = (attacker.stats.baseAttack + attacker.ivs.attack) * staticData.getCpmForLevel(attacker.level),
                    defence = (defender.stats.baseDefense + defender.ivs.defence) * staticData.getCpmForLevel(defender.level),
                    hasStab = move.type in attacker.types,
                    hasWeatherBoost = staticData.isWeatherBoosted(move.type, model.weather),
                    typeEffectiveness = getTypeEffectivenessMultiplier(move.type, defender.types),
                    multipliers = (hasStab ? 1.2 : 1) * (hasWeatherBoost ? 1.2 : 1) * typeEffectiveness;

                return Math.floor(power * attack * multipliers / (2 * defence)) + 1;
            }
        }
    }());

    const battles = {
        counts: {
            started: 0,
            finished: 0,
            drawn: 0
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
        clear() {
            allBattles = [];
            this.counts.started = 0;
            this.counts.finished = 0;
        },
        add(p1, p2) {
            const p1State = buildState(p1),
                p2State = buildState(p2),
                p1QuickDamage = damageCalculator.damage(p1, p2, p1.quickMove),
                p1ChargeDamage = damageCalculator.damage(p1, p2, p1.chargeMove),
                p2QuickDamage = damageCalculator.damage(p2, p1, p2.quickMove),
                p2ChargeDamage = damageCalculator.damage(p2, p1, p2.chargeMove);

            function updateStates(attackerState, defenderState, quickDamage, chargeDamage, tMsDelta) {
                attackerState.quickMoveCountdown -= tMsDelta;
                attackerState.chargeMoveCountdown -= tMsDelta;

                if (attackerState.energy + attackerState.pokemon.chargeMove.energyDelta >= 0 && attackerState.chargeMoveCountdown <= 0) {
                    defenderState.health -= chargeDamage;
                    attackerState.energy += attackerState.pokemon.chargeMove.energyDelta;
                    attackerState.chargeMoveCountdown = attackerState.pokemon.chargeMove.durationMs;
                    if (attackerState.singleMove) {
                        attackerState.quickMoveCountdown = attackerState.pokemon.quickMove.durationMs;
                    }

                } else if (attackerState.quickMoveCountdown <= 0) {
                    defenderState.health -= quickDamage;
                    attackerState.energy += attackerState.pokemon.quickMove.energyDelta;
                    attackerState.quickMoveCountdown = attackerState.pokemon.quickMove.durationMs;
                }
            }

            battles.counts.started++;

            let t = 0;
            const battle = {
                p1, p2,
                tick(tMsDelta) {
                    updateStates(p1State, p2State, p1QuickDamage, p1ChargeDamage, tMsDelta);
                    updateStates(p2State, p1State, p2QuickDamage, p2ChargeDamage, tMsDelta);

                    if (p1State.health <= 0) {
                        battles.counts.finished++;
                        this.finished = true;
                        if (p2State.health > 0) {
                            this.winner = p2;
                            this.loser = p1;
                        } else {
                            battles.counts.drawn++;
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
