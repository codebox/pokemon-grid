import {staticData} from './data.js';
import {STATE_RUNNING, STATE_STOPPED, STATE_PAUSED, STATE_COMPLETED} from './model.js';
import {formatTime, hashString} from './utils.js';

export function buildView(model) {
    const elCanvasGrid = document.getElementById('grid'),
        elCanvasGraph = document.getElementById('graph'),
        elHoverInfo = document.getElementById('hoverInfo'),
        elInfoWeather = document.getElementById('infoWeather'),
        elInfoTime = document.getElementById('infoTime'),
        elInfoBattlesInProgress = document.getElementById('infoBattlesInProgress'),
        elInfoBattlesFinished = document.getElementById('infoBattlesFinished'),
        elInfoPokemonCount = document.getElementById('pokemonCount'),
        elMainContainer = document.getElementById('mainContainer'),
        elList = document.getElementById('list'),
        elStop = document.getElementById('stop'),
        elGo = document.getElementById('go'),
        elPauseGo = document.getElementById('pauseGo'),
        elPauseSymbol = document.getElementById('pauseSymbol'),
        elPlaySymbol = document.getElementById('playSymbol'),
        elRewindSymbol = document.getElementById('rewindSymbol'),
        elSettings = document.getElementById('settings'),
        elGridSizeList = document.getElementById('gridSizeList'),
        elWeatherList = document.getElementById('weatherList'),
        elPokemonFilter = document.getElementById('pokemonFilter'),
        elPokemonSelectionLinks = document.getElementById('pokemonSelectionLinks'),
        elSelectionList = document.getElementById('pokemonSelectionList'),
        elSelectNoPokemon = document.getElementById('selectNoPokemon'),
        elGameMasterDate = document.getElementById('gameMasterDate'),
        ctxGrid = elCanvasGrid.getContext('2d'),
        ctxGraph = elCanvasGraph.getContext('2d'),
        numFormat = Intl.NumberFormat();

    elGameMasterDate.innerHTML = `Game Master File: ${staticData.gameMasterDate}`;
    let cellWidth, cellHeight;

    const typeColours = {
        "Bug": [67, 75, 41],
        "Dark": [24,23,36],
        "Dragon": [257,97,60],
        "Electric": [48,93,57],
        "Fairy": [330,50,68],
        "Fighting": [2,66,46],
        "Fire": [26,85,56],
        "Flying": [256,81,76],
        "Ghost": [266,27,47],
        "Grass": [98,52,54],
        "Ground": [43,68,64],
        "Ice": [177,47,72],
        "Normal": [59,21,57],
        "Poison": [301,45,44],
        "Psychic": [342,93,65],
        "Rock": [50,54,46],
        "Steel": [240,19,76],
        "Water": [221,82,66]
    };

    elSelectNoPokemon.onclick = () => trigger('selectNoPokemon');
    [...elPokemonSelectionLinks.querySelectorAll('.selectRandom')].forEach(li => {
        const count = li.dataset.count;
        li.innerHTML = `${count} random`;
        li.onclick = () => trigger('selectRandomPokemon', count);
    })

    elGo.onclick = () => trigger('goClick');
    elStop.onclick = () => trigger('stopClick');
    elPauseGo.onclick = () => trigger('pauseGoClick');

    elGridSizeList.onclick = e => {
        [...elGridSizeList.children].forEach(el => {
           el.classList.toggle('selected', e.target === el);
        });
        trigger('gridSizeChanged', e.target.innerHTML);
    }
    elCanvasGrid.onmousemove = e => {
        const rect = elCanvasGrid.getBoundingClientRect(),
            x = e.clientX - rect.left,
            y = e.clientY - rect.top,
            px = Math.floor(x/cellWidth),
            py = Math.floor(y/cellHeight);
        if (px < model.grid.width && px >= 0 && py < model.grid.height && py >= 0){
            trigger('gridOnMouseMove', {x: px, y: py});
        }
    }
    elCanvasGrid.onmouseleave = () => trigger('gridOnMouseLeave');
    elPokemonFilter.onkeyup = e => {
        const filter = elPokemonFilter.value;
        [ ...elSelectionList.children].forEach(li => {
            li.style.display = li.dataset.pokemon.toLowerCase().indexOf(filter.toLowerCase()) >= 0 ? '' : 'none';
        });
    };
    elWeatherList.onclick = e => {
        if (e.target.nodeName === 'LI') {
            trigger('weatherSelected', e.target.innerHTML);
            [...elWeatherList.children].forEach(li => li.classList.toggle('selected', li === e.target));
        }
    }

    const getPokemonColour = (() => {
        const pokemonColours = {};
        const variation = 0.2;
        function ensureValidPercentage(v) {
            return Math.max(0, Math.min(100, v));
        }
        return (pokemon) => {
            const id = pokemon.id || pokemon.name;
            if (!pokemonColours[id]) {
                const [typeH, typeS, typeL] = typeColours[pokemon.types[0]],
                    name = pokemon.name,
                    moves = (pokemon.quickMove ? pokemon.quickMove.name : '') + (pokemon.chargeMove ? pokemon.chargeMove.name : ''),
                    nameHash = hashString(name) % 100,
                    adjustedL = ensureValidPercentage(typeL + (nameHash - 50) * variation);
                let colour;
                if (moves) {
                    const moveHash = hashString(moves) % 100,
                        adjustedS = ensureValidPercentage(typeS + (moveHash - 50)  * variation);
                    colour = `hsl(${typeH},${adjustedS}%,${adjustedL}%)`;
                } else {
                    colour = `hsl(${typeH},${typeS}%,${adjustedL}%)`;
                }
                pokemonColours[id] = colour;
            }
            return pokemonColours[id];
        };
    })();

    function getPokemonNameColour(name) {
        const pokemon = staticData.getPokemonByName(name);
        return getPokemonColour(pokemon);
    }

    function toggle(el, visible) {
        el.style.display = visible ? '' : 'none';
    }

    const eventTarget = new EventTarget();
    function trigger(eventName, eventData) {
        const event = new Event(eventName);
        event.data = eventData;
        eventTarget.dispatchEvent(event);
    }

    function buildPokemonSelectionListItem(pokemon) {
        const moveExclusions = model.moveExclusions[pokemon.name] || new Set();

        function buildCheckboxForMove(move) {
            const isChecked = !moveExclusions.has(move);
            return `<li><label><input type='checkbox' data-move="${move}" class="moveCheckbox" ${isChecked ? 'checked' : ''}>${move}</label></li>`;
        }
        const li = document.createElement('li');

        li.innerHTML = `
            <div class="pokemonListItemTop">                
                <label><input type="checkbox" class="pokemonCheckbox">${pokemon.name}</label>
                <div class="pokemonListItemMoveSummary"></div>
                <div class="pokemonListItemShowDetails triangle_down"></div>
            </div>
            <div class="pokemonListItemDetails">
                <h3>Quick Moves</h3>
                <ul class="pokemonListItemDetailsQuickMoves">
                    ${pokemon.moves.quick.map(buildCheckboxForMove).join("")}
                </ul>
                <h3>Charge Moves</h3>
                <ul class="pokemonListItemDetailsChargeMoves">
                    ${pokemon.moves.charge.map(buildCheckboxForMove).join("")}
                </ul>
            </div>
        `;

        li.querySelector('input').dataset.pokemon = pokemon.name;
        li.dataset.pokemon = pokemon.name;

        li.addEventListener('click', e => {
            if (e.target.classList.contains('pokemonListItemShowDetails')) {
                li.classList.toggle('expanded');
            } else if (e.target.tagName === 'INPUT') {
                if (e.target.classList.contains('pokemonCheckbox')) {
                    trigger(e.target.checked ? 'pokemonSelected' : 'pokemonDeselected', pokemon.name);
                } else if (e.target.classList.contains('moveCheckbox')) {
                    trigger(e.target.checked ? 'moveSelected' : 'moveDeselected', {'pokemon': pokemon.name, 'move': e.target.dataset.move});
                }
            }
        });

        return li;
    }

    function populateSettingsLists() {
        elSelectionList.innerHTML = '';
        staticData.getAllPokemon().forEach(pk => {
            const li = buildPokemonSelectionListItem(pk);
            elSelectionList.appendChild(li);
        });

        Object.keys(model.gridSizes).forEach(name => {
            const li = document.createElement('li');
            li.innerHTML = name;
            elGridSizeList.appendChild(li);
            li.addEventListener('click', () => {
                trigger('gridSizeSelected', name);
            });
        });
    }
    populateSettingsLists();

    return {
        on(eventName, handler) {
            eventTarget.addEventListener(eventName, handler);
        },
        setInfoText(text) {
            elHoverInfo.innerHTML = text;
        },
        updateGrid() {
            ctxGrid.clearRect(0,0, elCanvasGrid.width, elCanvasGrid.height);
            model.grid.forEachPokemon(pokemon => {
                ctxGrid.fillStyle = getPokemonColour(pokemon);
                ctxGrid.fillRect(pokemon.x * cellWidth, pokemon.y * cellHeight, cellWidth, cellHeight);
            });
        },
        updateList(pokemonCounts) {
            elList.innerHTML = '';
            const arr = Object.keys(pokemonCounts).sort(function(p1,p2){return pokemonCounts[p2]-pokemonCounts[p1]})
            elList.innerHTML = arr.map(name => `<li><div style="background-color: ${getPokemonNameColour(name)}" class="box"></div><span class="listName">${name}</span><span class="listCount">${numFormat.format(pokemonCounts[name])}</span></li>`).join('');
        },
        updateStats(weather, gameTimeMs, pokemonCount, battlesInProgress, battlesFinished) {
            elInfoWeather.innerHTML = weather;
            elInfoTime.innerHTML = formatTime(gameTimeMs);
            elInfoPokemonCount.innerHTML = numFormat.format(pokemonCount);
            elInfoBattlesInProgress.innerHTML = numFormat.format(battlesInProgress);
            elInfoBattlesFinished.innerHTML = numFormat.format(battlesFinished);
        },
        updateGraph(counters) {
            const graphPlots = {};
            Object.keys(counters[0]).forEach(pokemonName => graphPlots[pokemonName] = []);
            let maxValue = 0;
            counters.forEach(counter => {
                Object.entries(graphPlots).forEach(([pokemonName, counts]) => {
                    const count = counter[pokemonName] || 0;
                    counts.push(count);
                    maxValue = Math.max(maxValue, count);
                });
            });
            const graphTopMargin=10,
                xStep = Math.min(1, elCanvasGraph.width / counters.length);
            ctxGraph.clearRect(0, 0, elCanvasGraph.width, elCanvasGraph.height);
            Object.entries(graphPlots).forEach(([pokemonName, counts]) => {
                const colour = getPokemonNameColour(pokemonName);
                ctxGraph.strokeStyle = colour;
                ctxGraph.beginPath();
                for (let x=0; x<counts.length-1; x++) {
                    ctxGraph.moveTo(x * xStep, graphTopMargin + (elCanvasGraph.height - graphTopMargin) * (1 - counts[x] / maxValue));
                    ctxGraph.lineTo((x+1) * xStep, graphTopMargin + (elCanvasGraph.height - graphTopMargin) * (1 - counts[x+1] / maxValue));
                }
                ctxGraph.stroke();
            });
        },
        updateForState(state) {
            const isStopped = state === STATE_STOPPED;
            toggle(elSettings, isStopped);
            toggle(elGo, isStopped);
            // toggle(elCanvasGrid, !isStopped);
            // toggle(elCanvasGraph, !isStopped);
            // toggle(elList, !isStopped);
            // toggle(elInfo, !isStopped);
            toggle(elMainContainer, !isStopped);
            toggle(elHoverInfo, !isStopped);
            toggle(elStop, !isStopped);
            toggle(elPauseGo, !isStopped);
            toggle(elPauseSymbol, state === STATE_RUNNING);
            toggle(elPlaySymbol, state === STATE_PAUSED);
            toggle(elRewindSymbol, state === STATE_COMPLETED);

            if (state === STATE_RUNNING) {
                cellWidth = elCanvasGrid.width / model.grid.width;
                cellHeight = elCanvasGrid.height / model.grid.height;

            } else if (state === STATE_PAUSED) {

            } else if (state === STATE_STOPPED) {
                elList.innerHTML = '';
                ctxGrid.clearRect(0, 0, elCanvasGrid.width, elCanvasGrid.height);
                ctxGraph.clearRect(0, 0, elCanvasGraph.width, elCanvasGraph.height);
            }
        },
        updateSettings() {
            [...elSelectionList.children].forEach(li => {
                const pokemonName = li.dataset.pokemon,
                    elMoveSummary = li.querySelector('.pokemonListItemMoveSummary');
                li.querySelector('input.pokemonCheckbox').checked = model.selectedPokemon.has(pokemonName);
                let totalMoveCount = 0, selectedMoveCount = 0;
                [...li.querySelectorAll('input.moveCheckbox')].forEach(checkBox => {
                    const moveSelected = !(model.moveExclusions[pokemonName] || new Set()).has(checkBox.dataset.move);
                    checkBox.checked = moveSelected;
                    totalMoveCount++;
                    if (moveSelected) {
                        selectedMoveCount++;
                    }
                });
                if (totalMoveCount > selectedMoveCount) {
                    elMoveSummary.innerHTML = `${selectedMoveCount}/${totalMoveCount} moves`;
                } else {
                    elMoveSummary.innerHTML = '';
                }
            });

            [...elWeatherList.children].forEach(li => {
                const isSelected = li.innerHTML.toLowerCase() === model.weather.toLowerCase();
                li.classList.toggle('selected', isSelected);
            });

            [...elGridSizeList.children].forEach(li => {
                const isSelected = li.innerHTML.toLowerCase() === model.gridSize.toLowerCase();
                li.classList.toggle('selected', isSelected);
            });
        }
    };
}