#!/usr/bin/env python

import asyncio
from websockets import serve, WebSocketException
from json import loads, dumps
from random import shuffle, choice


class Player:
    def __init__(self, ws, name):
        self.ws = ws
        self.name = name

    def send(self, t, **extra):
        extra['type'] = t
        return self.ws.send(dumps(extra))

    async def recv(self):
        s = await self.ws.recv()
        return loads(s)


def generate_maze(width, height, colours='rgby'):
    maze = []
    for l in range((2 * height) - 1):
        s = ''
        for c in range((2 * width) - 1):
            rchr = choice(colours)
            if l % 2 == 0 and c % 2 == 0:  # hex
                s += rchr.upper()
            else:
                s += rchr
        maze.append(s)
    return maze


class GameRoom:
    def __init__(self):
        self._players = []
        self._current_players = []
        self._game_id = 0

    def _lobby(self, player):
        return player.send('lobby')

    async def join(self, player):
        if player.name in (p.name for p in self._players):
            raise Exception("Implement name clash handling protocol")
        self._players.append(player)
        if self._current_players:
            await self._lobby(player)
        else:
            await self._start()

    async def leave(self, player):
        self._players.remove(player)
        if player in self._current_players:
            self._current_players.remove(player)
            await self._relay(None, "left", player=player.name)

    async def over(self, game_id):
        if game_id == self._game_id:
            self._current_players = []
            await self._start()

    def move(self, player, pos):
        return self._relay(player, "move", pos=pos)

    def impossible(self, player):
        # TODO: Which move was this guess actually made at? (To avoid guesses
        # that were wrong being marked right, though that'd require some luck
        # to profit from.)
        return self._relay(player, "impossible", player=player.name)

    async def _relay(self, originator, t, **extra):
        # FIXME: because we're sending to other websockets, if they fail here
        # we need to handle them appropriately instead of failing the
        # initiator:
        await asyncio.gather(*(
            p.send(t, **extra) for p in self._current_players if p is not originator))

    async def _start(self):
        if len(self._players) < 2:
            await self._lobby(self._players[0])
            return  # Not going to be that fun on your own
        self._game_id += 1
        self._current_players = list(self._players)  # snapshot for this round
        shuffle(self._current_players)
        await self._relay(
            None, "start", players=[p.name for p in self._current_players],
            game_id=self._game_id, **self._gen_maze())

    def _gen_maze(self):
        return {
            "mode":"shard",
            "maze": generate_maze(5, 5),
            "starts":[[1,1],[3,3]],
            "startColour":"g"}


room = GameRoom()  # TODO: rooms by URL


async def handle_player(ws):
    name = await ws.recv()
    p = Player(ws, name)
    await room.join(p)
    try:
        while True:
            msg = await p.recv()
            match msg['type']:
                case 'move':
                    await room.move(p, msg['pos'])
                case 'impossible':
                    await room.impossible(p)
                case 'over':
                    await room.over(msg['game_id'])
    except WebSocketException:
        pass
    await room.leave(p)

async def main():
    async with serve(handle_player, 'localhost', 9000):
        await asyncio.Future()


asyncio.run(main())

# TODO: Timeout if nothing happens for ages?
