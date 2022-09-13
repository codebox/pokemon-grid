import requests, json
datafile = 'https://raw.githubusercontent.com/PokeMiners/game_masters/master/latest/latest.json'

def format_name(name):
    return name.replace('_', ' ').title()

def format_move(name):
    return format_name(name)

def format_type(name):
    return name.removeprefix('POKEMON_TYPE_').title()

def filter_json(data, prop_name):
    return [obj['data'][prop_name] for obj in data if prop_name in obj['data']]

def build_mega_pokemon(regular_pokemon, mega_overrides):
    return {
       'name': 'Mega {}'.format(regular_pokemon['name']),
       'form': 'NORMAL',
       'moves': regular_pokemon['moves'],
       'stats': mega_overrides['stats'],
       'types': [format_type(t) for t in [mega_overrides['typeOverride1']] + ([mega_overrides['typeOverride2']] if 'typeOverride2' in mega_overrides else [])]
    }

def filter_pokemon_props(p):
    pokemon_list = []
    if 'cinematicMoves' in p and 'stats' in p and p['stats']:
        name = format_name(p['pokemonId'])
        regular_pokemon = {
            'name': name,
            'form': p['form'][len(name) + 1:] if 'form' in p else 'NORMAL',
            'moves': {
              'charge': [format_move(m) for m in p['cinematicMoves']],
              'quick': [format_move(m) for m in p['quickMoves']]
            },
            'stats': p['stats'],
            'types': [format_type(t) for t in [p['type']] + ([p['type2']] if 'type2' in p else [])]
        }
        pokemon_list.append(regular_pokemon)

        if 'tempEvoOverrides' in p:
            mega_overrides = [ovr for ovr in p['tempEvoOverrides'] if ovr.get('tempEvoId') == 'TEMP_EVOLUTION_MEGA']
            if mega_overrides:
                pokemon_list.append(build_mega_pokemon(regular_pokemon, mega_overrides[0]))

        if 'shadow' in p:
            shadow_pokemon = {
                'name': 'Shadow {}'.format(name),
                'form': regular_pokemon['form'],
                'moves': regular_pokemon['moves'],
                'stats': {
                    'baseStamina': regular_pokemon['stats']['baseStamina'],
                    'baseAttack': regular_pokemon['stats']['baseAttack'] * 1.2,
                    'baseDefense': regular_pokemon['stats']['baseDefense'] * 0.8
                },
                'types': regular_pokemon['types']
            }
            pokemon_list.append(shadow_pokemon)

    return pokemon_list

def dedupe_forms(all_pokemon):
    def equivalent(p1, p2):
        return p1['stats'] == p2['stats'] and set(p1['moves']['charge']) == set(p2['moves']['charge']) and set(p1['moves']['quick']) == set(p2['moves']['quick']) and set(p1['types']) == set(p2['types'])

    pokemon_groups = {}
    for p in all_pokemon:
        name = p['name']
        if name not in pokemon_groups:
            pokemon_groups[name] = []
        pokemon_groups[name].append(p)

    for pokemon_name, pokemon_list in pokemon_groups.items():
        normal_form = next((p for p in pokemon_list if p['form'] == 'NORMAL'), None)
        if normal_form:
            for pokemon in pokemon_list:
                if pokemon is not normal_form and equivalent(pokemon, normal_form):
                    all_pokemon.remove(pokemon)

    for p in all_pokemon:
        form = p['form']
        del p['form']
        if form != 'NORMAL':
            p['name'] = '{} ({} form)'.format(p['name'], form)

    return all_pokemon

def filter_move_props(m):
    return {
        'name': format_move(m['movementId']),
        'power': m.get('power', 0),
        'durationMs': m['durationMs'],
        'energyDelta': m.get('energyDelta', 0),
        'type': format_type(m['pokemonType'])
    }

def process_types(t):
    return dict(zip([format_type(t) for t in ['POKEMON_TYPE_NORMAL', 'POKEMON_TYPE_FIGHTING', 'POKEMON_TYPE_FLYING', 'POKEMON_TYPE_POISON', 'POKEMON_TYPE_GROUND', 'POKEMON_TYPE_ROCK', 'POKEMON_TYPE_BUG', 'POKEMON_TYPE_GHOST', 'POKEMON_TYPE_STEEL', 'POKEMON_TYPE_FIRE', 'POKEMON_TYPE_WATER', 'POKEMON_TYPE_GRASS', 'POKEMON_TYPE_ELECTRIC', 'POKEMON_TYPE_PSYCHIC', 'POKEMON_TYPE_ICE', 'POKEMON_TYPE_DRAGON', 'POKEMON_TYPE_DARK', 'POKEMON_TYPE_FAIRY']], t['attackScalar']))

data = requests.get(datafile).json()

pokemon_settings = filter_json(data, 'pokemonSettings')
pokemon_lists = [filter_pokemon_props(pks) for pks in pokemon_settings]
pokemon = [p for pokemon_list in pokemon_lists if pokemon_list for p in pokemon_list]
unique_pokemon = dedupe_forms(pokemon)

with open('../js/data/pokemon.js', 'w') as f:
    f.write('var pokemonData = {};'.format(json.dumps(unique_pokemon, indent=4)))

moves = [filter_move_props(mv) for mv in filter_json(data, 'moveSettings')]
with open('../js/data/moves.js', 'w') as f:
    f.write('var moveData = {};'.format(json.dumps(moves, indent=4)))

types = {format_type(tp['attackType']): process_types(tp) for tp in filter_json(data, 'typeEffective')}
with open('../js/data/types.js', 'w') as f:
    f.write('var typeEffectiveness = {};'.format(json.dumps(types, indent=4)))
