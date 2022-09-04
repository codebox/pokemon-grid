import requests, json
pokemon_datafile = 'https://raw.githubusercontent.com/pokemongo-dev-contrib/pokemongo-json-pokedex/master/output/pokemon.json'
moves_datafile = 'https://raw.githubusercontent.com/pokemongo-dev-contrib/pokemongo-json-pokedex/master/output/move.json'
type_datafile = 'https://raw.githubusercontent.com/pokemongo-dev-contrib/pokemongo-json-pokedex/master/output/type.json'

def filter_pokemon_props(p):
    return {
        'name': p['name'],
        'moves': {
            'charge': [v['name'] for v in p['cinematicMoves']],
            'quick': [v['name'] for v in p['quickMoves']]
        },
        'stats': p['stats'],
        'types': [v['name'] for v in p['types']]
    }

def filter_move_props(m):
    return {
        'name': m['name'],
        'power': m.get('power', 0),
        'durationMs': m['durationMs'],
        'energyDelta': m.get('energyDelta', 0),
        'type': m['pokemonType']['name']
    }

def process_types(arr):
    id_lookup = {item['id'] : item['name'] for item in arr}
    return {item['name']: {id_lookup[d['id']]: d['attackScalar'] for d in item['damage']} for item in arr}


pokemon = [filter_pokemon_props(pk) for pk in requests.get(pokemon_datafile).json()]
with open('../js/pokemon.js', 'w') as f:
    f.write('var pokemonData = {};'.format(json.dumps(pokemon, indent=4)))

moves = [filter_move_props(mv) for mv in requests.get(moves_datafile).json()]
with open('../js/moves.js', 'w') as f:
    f.write('var moveData = {};'.format(json.dumps(moves, indent=4)))

types = process_types(requests.get(type_datafile).json())
with open('../js/types.js', 'w') as f:
    f.write('var typeEffectiveness = {};'.format(json.dumps(types, indent=4)))

