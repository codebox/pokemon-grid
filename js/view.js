function buildView(model, staticData) {
    const elCanvasGrid = document.getElementById('grid'),
        elCanvasGraph = document.getElementById('graph'),
        elInfo = document.getElementById('info'),
        elStats = document.getElementById('stats'),
        elList = document.getElementById('list'),
        elStopGo = document.getElementById('stopGo'),
        elSettings = document.getElementById('settings'),
        elGridSizeList = document.getElementById('gridSizeList'),
        elWeatherList = document.getElementById('weatherList'),
        elNoWeather = document.getElementById('noWeather'),
        elPokemonFilter = document.getElementById('pokemonFilter'),
        elSelectionList = document.getElementById('pokemonSelectionList'),
        elSelectedList = document.getElementById('pokemonSelectedList'),
        ctxGrid = elCanvasGrid.getContext('2d'),
        ctxGraph = elCanvasGraph.getContext('2d'),
        rect = elCanvasGrid.getBoundingClientRect();

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

    elStopGo.onclick = () => trigger('stopGoClick');
    elGridSizeList.onclick = e => {
        [...elGridSizeList.children].forEach(el => {
           el.classList.toggle('selected', e.target === el);
        });
        trigger('gridSizeChanged', e.target.innerHTML);
    }
    elCanvasGrid.onmousemove = e => {
        const x = e.clientX - rect.left,
            y = e.clientY - rect.top,
            px = Math.floor(x/cellWidth),
            py = Math.floor(y/cellHeight);
        trigger('gridOnMouseMove', {x: px, y: py});
    }
    elCanvasGrid.onmouseleave = () => trigger('gridOnMouseLeave');
    elSelectionList.onclick = e => {
        if (e.target.nodeName === 'LI') {
            trigger('pokemonSelected', e.target.innerHTML);
            elSelectionList.removeChild(e.target);
            elSelectedList.insertBefore(e.target, elSelectedList.firstChild);
        }
    }
    elSelectedList.onclick = e => {
        if (e.target.nodeName === 'LI') {
            trigger('pokemonDeselected', e.target.innerHTML);
            elSelectedList.removeChild(e.target);
            elSelectionList.insertBefore(e.target, elSelectionList.firstChild);
        }
    }
    elPokemonFilter.onkeyup = e => {
        const filter = elPokemonFilter.value;
        [ ...elSelectionList.children].forEach(li => {
            li.style.display = li.innerHTML.toLowerCase().indexOf(filter.toLowerCase()) >= 0 ? '' : 'none';
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

    function initialiseSettings() {
        const pokemonNames = [];
        staticData.getAllPokemon().forEach(pk => {
            pokemonNames.push(pk.name);
        });
        elSelectionList.innerHTML = pokemonNames.map(name => `<li>${name}</li>`).join('');
        model.selectedPokemon.forEach(pk => {
            const li = [...elSelectionList.children].find(el => el.innerHTML.toLowerCase() === pk.toLowerCase());
            elSelectionList.removeChild(li);
            elSelectedList.insertBefore(li, elSelectedList.firstChild);
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

            if (state === STATE_RUNNING) {
                cellWidth = elCanvasGrid.width / model.grid.width;
                cellHeight = elCanvasGrid.height / model.grid.height;
                elStopGo.innerHTML = 'Stop';
            } else {
                elStopGo.innerHTML = 'Go';
            }
        }
    };
}