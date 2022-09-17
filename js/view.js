import {staticData} from './data.js';
import {STATE_RUNNING, STATE_STOPPED} from './model.js';
import {pickN, formatTime} from './utils.js';

export function buildView(model) {
    const elCanvasGrid = document.getElementById('grid'),
        elCanvasGraph = document.getElementById('graph'),
        elInfo = document.getElementById('info'),
        elStats = document.getElementById('stats'),
        elList = document.getElementById('list'),
        elStop = document.getElementById('stop'),
        elGo = document.getElementById('go'),
        elSettings = document.getElementById('settings'),
        elGridSizeList = document.getElementById('gridSizeList'),
        elWeatherList = document.getElementById('weatherList'),
        elNoWeather = document.getElementById('noWeather'),
        elPokemonFilter = document.getElementById('pokemonFilter'),
        elPokemonSelectionLinks = document.getElementById('pokemonSelectionLinks'),
        elSelectionList = document.getElementById('pokemonSelectionList'),
        elSelectAllPokemon = document.getElementById('selectAllPokemon'),
        elSelectNoPokemon = document.getElementById('selectNoPokemon'),
        elGameMasterDate = document.getElementById('gameMasterDate'),
        ctxGrid = elCanvasGrid.getContext('2d'),
        ctxGraph = elCanvasGraph.getContext('2d'),
        rect = elCanvasGrid.getBoundingClientRect();

    elGameMasterDate.innerHTML = `Game Master File: ${staticData.gameMasterDate}`;
    let cellWidth, cellHeight;

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
    };

    function doSelection(fnSelection) {
        const visiblePokemon = [ ...elSelectionList.children].filter(li => li.style.display !== 'none').map(li => li.dataset.pokemon),
            selected = fnSelection(visiblePokemon);
        trigger('pokemonReselected', selected);
    }
    elSelectAllPokemon.onclick = () => doSelection(a => a);
    elSelectNoPokemon.onclick = () => doSelection(_ => []);
    [...elPokemonSelectionLinks.querySelectorAll('.selectRandom')].forEach(li => {
        const count = li.dataset.count;
        li.innerHTML = `${count} random`;
        li.onclick = () => doSelection(a => pickN(a, count));
    })

    elGo.onclick = () => trigger('goClick');
    elStop.onclick = () => trigger('stopClick');

    elGridSizeList.onclick = e => {
        [...elGridSizeList.children].forEach(el => {
           el.classList.toggle('selected', e.target === el);
        });
        trigger('gridSizeChanged', e.target.innerHTML);
    }
    elCanvasGrid.onmousemove = e => {
        const x = e.pageX - rect.left,
            y = e.pageY - rect.top,
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
    elGridSizeList.onclick = e => {
        if (e.target.nodeName === 'LI') {
            trigger('gridSizeSelected', e.target.innerHTML);
            [...elGridSizeList.children].forEach(li => li.classList.toggle('selected', li === e.target));
        }
    }

    function getPokemonColour(pokemon) {
        return typeColours[pokemon.types[0]];
    }
    const getPokemonNameColour = (() => {
        const nameColours = {};
        return name => {
            if (!nameColours[name]) {
                const pokemon = staticData.getPokemonByName(name);
                nameColours[name] = getPokemonColour(pokemon);
            }
            return nameColours[name];
        };
    })();

    function toggle(el, visible) {
        el.style.display = visible ? '' : 'none';
    }

    const eventTarget = new EventTarget();
    function trigger(eventName, eventData) {
        const event = new Event(eventName);
        event.data = eventData;
        eventTarget.dispatchEvent(event);
    }

    const pokemonToCheckboxLookup = {};
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

    function initialiseSettings() {
        elSelectionList.innerHTML = '';
        staticData.getAllPokemon().forEach(pk => {
            const li = buildPokemonSelectionListItem(pk);
            elSelectionList.appendChild(li);
        });
        [...elSelectionList.children].forEach(li => {
            li.querySelector('input').checked = model.selectedPokemon.has(li.dataset.pokemon);
        });

        const liSelectedWeather = [...elWeatherList.children].find(li => li.innerHTML.toLowerCase() === model.weather.toLowerCase());
        if (liSelectedWeather) {
            liSelectedWeather.classList.add('selected');
        } else {
            elNoWeather.classList.add('selected');
        }

        const liSelectedGridSize = [...elGridSizeList.children].find(li => li.innerHTML.toLowerCase() === model.gridSize.toLowerCase());
        liSelectedGridSize.classList.add('selected');
    }
    initialiseSettings();

    return {
        on(eventName, handler) {
            eventTarget.addEventListener(eventName, handler);
        },
        setInfoText(text) {
            elInfo.innerHTML = text;
        },
        updateGrid() {
            ctxGrid.clearRect(0,0, elCanvasGrid.width, elCanvasGrid.height);
            model.grid.forEachPokemon(pokemon => {
                ctxGrid.fillStyle = `#${getPokemonColour(pokemon)}`;
                ctxGrid.fillRect(pokemon.x * cellWidth, pokemon.y * cellHeight, cellWidth, cellHeight);
            });
        },
        updateList(pokemonCounts) {
            elList.innerHTML = '';
            const arr = Object.keys(pokemonCounts).sort(function(p1,p2){return pokemonCounts[p2]-pokemonCounts[p1]})
            elList.innerHTML = arr.map(name => `<li><div style="background-color: #${getPokemonNameColour(name)}" class="box"></div><span class="listName">${name}</span><span class="listCount">${pokemonCounts[name]}</span></li>`).join('');
        },
        updateStats(gameTimeMs, battlesInProgress, battlesFinished, battlesDrawn) {
            elStats.innerHTML = `Time: ${formatTime(gameTimeMs)} Battles: ${battlesInProgress} in progress, ${battlesFinished} finished, ${battlesDrawn} drawn`;
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
            const graphTopMargin=10;
            ctxGraph.clearRect(0, 0, elCanvasGraph.width, elCanvasGraph.height);
            Object.entries(graphPlots).forEach(([pokemonName, counts]) => {
                const colour = getPokemonNameColour(pokemonName);
                ctxGraph.strokeStyle = `#${colour}`;
                ctxGraph.beginPath();
                for (let x=0; x<counts.length-1; x++) {
                    ctxGraph.moveTo(x, graphTopMargin + (elCanvasGraph.height - graphTopMargin) * (1 - counts[x] / maxValue));
                    ctxGraph.lineTo(x+1, graphTopMargin + (elCanvasGraph.height - graphTopMargin) * (1 - counts[x+1] / maxValue));
                }
                ctxGraph.stroke();
            });
        },
        updateForState(state) {
            toggle(elSettings, state === STATE_STOPPED);
            toggle(elCanvasGrid, state !== STATE_STOPPED);
            toggle(elCanvasGraph, state !== STATE_STOPPED);
            toggle(elList, state !== STATE_STOPPED);
            toggle(elStats, state !== STATE_STOPPED);
            toggle(elInfo, state !== STATE_STOPPED);
            toggle(elStop, state !== STATE_STOPPED);
            toggle(elGo, state !== STATE_RUNNING);

            if (state === STATE_RUNNING) {
                cellWidth = elCanvasGrid.width / model.grid.width;
                cellHeight = elCanvasGrid.height / model.grid.height;
            } else {
                elList.innerHTML = '';
                ctxGrid.clearRect(0, 0, elCanvasGrid.width, elCanvasGrid.height);
                ctxGraph.clearRect(0, 0, elCanvasGraph.width, elCanvasGraph.height);
            }
        },
        updateSelection() {
            [...elSelectionList.querySelectorAll('input')].forEach(chk => chk.checked = model.selectedPokemon.has(chk.dataset.pokemon));
        }
    };



}