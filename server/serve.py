#!/usr/bin/env python

import asyncio
from websockets import serve, WebSocketException
from json import loads, dumps
from random import shuffle


class Player:
    def __init__(self, ws, name):
        self.ws = ws
        self.name = name

    def send(self, t, **extra):
        extra['type'] = t
        print(f'sending {extra}')
        return self.ws.send(dumps(extra))

    async def recv(self):
        s = await self.ws.recv()
        return loads(s)


class GameRoom:
    def __init__(self):
        self._players = []
        self._current_players = None
        self._game_id = 0

    async def join(self, player):
        if player.name in (p.name for p in self._players):
            raise Exception("Implement name clash handling protocol")
        self._players.append(player)
        if not self._current_players:
            await self._start()

    async def leave(self, player):
        self._players.remove(player)
        if player in self._current_players:
            self._current_players.remove(player)
            await self._relay(None, "left", player=player.name)

    async def over(self, game_id):
        if game_id == self._game_id:
            await self._start()

    def move(self, player, pos):
        return self._relay(player, "move", pos=pos)

    def impossible(self, player):
        # TODO: Which move was this guess actually made at? (To avoid guesses
        # that were wrong being marked right, though that'd require some luck
        # to profit from.)
        return self._relay(player, "impossible", guesser=player.name)

    async def _relay(self, originator, t, **extra):
        # TODO: I know *something* will happen on disconnection/timeout, but
        # come back to that.
        print(f"cur {self._current_players}")
        await asyncio.gather(*(
            p.send(t, **extra) for p in self._current_players if p is not originator))

    async def _start(self):
        if len(self._players) < 2:
            return  # Not going to be that fun on your own
        self._game_id += 1
        self._current_players = list(self._players)  # snapshot for this round
        shuffle(self._current_players)
        await self._relay(
            None, "start", players=[p.name for p in self._current_players],
            game_id=self._game_id, **self._gen_maze())

    def _gen_maze(self):
        # TODO: Actual generator, not just a single example I copied in
        return {
            "mode":"shard",
            "maze":[
                "YbYgYyRgY","bbgyrggyy","RrRbYyBgR","rggybgbby",
                "YbRgRgGrG","gbyrbyygy","YgRyGbRbR","grybyyyrb",
                "RyGgYgYrG"],
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
            print(f'rxed {msg}')
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
