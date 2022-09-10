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

def filter_pokemon_props(p):
    if 'cinematicMoves' in p and 'stats' in p and p['stats'] and 'form' not in p:
        return {
            'name': format_name(p['pokemonId']),
            'moves': {
                'charge': [format_move(m) for m in p['cinematicMoves']],
                'quick': [format_move(m) for m in p['quickMoves']]
            },
            'stats': p['stats'],
            'types': [format_type(t) for t in [p['type']] + ([p['type2']] if 'type2' in p else [])]
        }
    else:
        print('skipping', p['pokemonId'])

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

pokemon = [p for p in[filter_pokemon_props(pk) for pk in filter_json(data, 'pokemonSettings')] if p]
with open('../js/data/pokemon.js', 'w') as f:
    f.write('var pokemonData = {};'.format(json.dumps(pokemon, indent=4)))

moves = [filter_move_props(mv) for mv in filter_json(data, 'moveSettings')]
with open('../js/data/moves.js', 'w') as f:
    f.write('var moveData = {};'.format(json.dumps(moves, indent=4)))

types = {format_type(tp['attackType']): process_types(tp) for tp in filter_json(data, 'typeEffective')}
with open('../js/data/types.js', 'w') as f:
    f.write('var typeEffectiveness = {};'.format(json.dumps(types, indent=4)))
