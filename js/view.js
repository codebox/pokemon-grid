function buildView(model, staticData) {
    const elCanvas = document.getElementById('grid'),
        elInfo = document.getElementById('info'),
        elList = document.getElementById('list'),
        elStopGo = document.getElementById('stopGo'),
        elNewGrid = document.getElementById('newGrid'),
        elSettings = document.getElementById('settings'),
        elGridSizeList = document.getElementById('gridSize'),
        elWeatherList = document.getElementById('weatherList'),
        elNoWeather = document.getElementById('noWeather'),
        elPokemonFilter = document.getElementById('pokemonFilter'),
        elSelectionList = document.getElementById('pokemonSelectionList'),
        elSelectedList = document.getElementById('pokemonSelectedList'),
        ctx = elCanvas.getContext('2d'),
        rect = elCanvas.getBoundingClientRect();

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
    elNewGrid.onclick = () => trigger('newGridClick');
    elGridSizeList.onclick = e => {
        [...elGridSizeList.children].forEach(el => {
           el.classList.toggle('selected', e.target === el);
        });
        trigger('gridSizeChanged', e.target.innerHTML);
    }
    elCanvas.onmousemove = e => {
        const x = e.clientX - rect.left,
            y = e.clientY - rect.top,
            px = Math.floor(x/cellWidth),
            py = Math.floor(y/cellHeight);
        trigger('gridOnMouseMove', {x: px, y: py});
    }
    elCanvas.onmouseleave = () => trigger('gridOnMouseLeave');
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

    function getPokemonColour(pokemon) {
        return typeColours[pokemon.types[0]];
    }
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

    function initialiseSettings() {
        const pokemonNames = [];
        staticData.getAllPokemon().forEach(pk => {
            pokemonNames.push(pk.name);
        });
        elSelectionList.innerHTML = pokemonNames.map(name => `<li>${name}</li>`).join('');
        model.selectedPokemon.forEach(pk => {
            const li = [...elSelectionList.children].find(el => el.innerHTML.toLowerCase() === pk);
            elSelectionList.removeChild(li);
            elSelectedList.insertBefore(li, elSelectedList.firstChild);
        });

        const liSelectedWeather = [...elWeatherList.children].find(li => li.innerHTML.toLowerCase() === model.weather.toLowerCase());
        if (liSelectedWeather) {
            liSelectedWeather.classList.add('selected');
        } else {
            elNoWeather.classList.add('selected');
        }
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
            ctx.clearRect(0,0, elCanvas.width, elCanvas.height);
            model.grid.forEachPokemon(pokemon => {
                ctx.fillStyle = `#${getPokemonColour(pokemon)}`;
                ctx.fillRect(pokemon.x * cellWidth, pokemon.y * cellHeight, cellWidth, cellHeight);
            });
        },
        updateList() {
            const pokemonCounts = {};
            model.grid.forEachPokemon(p => {
                if (!(p.name in pokemonCounts)) {
                    pokemonCounts[p.name] = 0;
                }
                pokemonCounts[p.name]++;
            });
            elList.innerHTML = '';

            const arr = Object.keys(pokemonCounts).sort(function(p1,p2){return pokemonCounts[p2]-pokemonCounts[p1]})
            elList.innerHTML = arr.map(name => `<li><div style="background-color: #${getPokemonNameColour(name)}" class="box"></div><span class="listName">${name}</span><span class="listCount">${pokemonCounts[name]}</span></li>`).join('');
        },
        updateForState(state) {
            toggle(elSettings, state === STATE_STOPPED);
            toggle(elCanvas, state !== STATE_STOPPED);
            toggle(elList, state !== STATE_STOPPED);
            toggle(elNewGrid, state !== STATE_STOPPED);

            if (state === STATE_RUNNING) {
                cellWidth = elCanvas.width / model.grid.width;
                cellHeight = elCanvas.height / model.grid.height;
                elStopGo.innerHTML = 'Pause';
            } else if (state === STATE_PAUSED) {
                elStopGo.innerHTML = 'Run';
            } else if (state === STATE_STOPPED) {
                elStopGo.innerHTML = 'Run';
            }
        }
    };
}