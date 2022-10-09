# Pokémon Go Battle Simulator
This is a [Pokémon Go Battle Simulator cellular automaton](https://codebox.net/raw/pokemon-grid/index.html) that runs in your web browser. 
The simulation populates a square grid with random Pokémon, each represented by a different colour. The Pokémon
in the grid battle their neighbours, and at the end of each battle the losing Pokémon is removed from the
grid and replaced with a copy of the winner.

Over the course of a simulation Pokémon of the same kind cluster together and spread into areas occupied by weaker opponents.
Because of the game's [type effectiveness rules](https://bulbapedia.bulbagarden.net/wiki/Type), Pokémon that are strong against
one opponent may be weak against another, and so most simulations that start off with a good variety of different Pokémon end in
some form of dynamic equilibrium, with territory constantly changing hands but without a single winner dominating the grid:

<img src="https://codebox.net/assets/images/pokemon-grid/gridProgress1.png" alt="Pokemon Go cellular automata stage 1" width="200"> <img src="https://codebox.net/assets/images/pokemon-grid/gridProgress2.png" alt="Pokemon Go cellular automata stage 2" width="200"> <img src="https://codebox.net/assets/images/pokemon-grid/gridProgress3.png" alt="Pokemon Go cellular automata stage 3" width="200"> <img src="https://codebox.net/assets/images/pokemon-grid/gridProgress4.png" alt="Pokemon Go cellular automata stage 4" width="200">

The following timelapse video shows how a simulation initialised with 40,000 Pokémon progressed over the course of 2 hours:

<a href="https://codebox.net/assets/video/pokemon-grid/grid.mp4"><img src="https://codebox.net/assets/video/pokemon-grid/grid_poster.png" width="400" height="400"></a>

The simulation allows you to select which Pokémon should appear in the grid, and what moves they should have. You can also
select the weather conditions and the number of squares in the grid. As the simulation progresses a graph is generated showing
how the numbers of each Pokémon change over time.

<a href="https://codebox.net/assets/video/pokemon-grid/graph.mp4"><img src="https://codebox.net/assets/video/pokemon-grid/graph_poster.png" width="600" ></a>

The combat algorithm is based on Pokémon Go's PVE battle mechanics.
The data relating to Pokémon and their moves has been extracted from the latest
[Game Master file](https://github.com/PokeMiners/game_masters) using this
[Python script](https://github.com/codebox/pokemon-grid/blob/main/scripts/update_data.py).

This was project inspired by a [Pokémon type cellular automaton](https://twitter.com/matthen2/status/1543226572592783362)
created by Matt Henderson.

