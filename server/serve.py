#!/usr/bin/env python

import asyncio
from websockets import serve, WebSocketException
from json import loads, dumps
from random import shuffle, choice
from collections import deque
from time import monotonic


class InvalidMsg(Exception):
    pass


class Handler:
    async def leave(self, player):
        raise NotImplementedError()

    async def rx(self, player, msg):
        raise NotImplementedError()


class Lobby(Handler):
    def __init__(self):
        self._players = []

    async def join(self, *players):
        for p in players:
            p.handler = self
        self._players += players
        if len(self._players) == 1:
            await p.send('lobby')
            return
        shuffle(self._players)
        while len(self._players) > 3:  # Pair up as many as we can
            players = self._players[:2]
            self._players = self._players[2:]
            await Game(players).play()
        if self._players:  # Remaining 2 or 3
            players = self._players
            self._players = []
            await Game(players).play()

    async def leave(self, player):
        self._players.remove(player)

    async def rx(self, player, msg):
        if player.id is None:  # Hasn't played any games yet
            raise InvalidMsg('Attempted to send message out of game')
        elif msg['type'] in ('over', 'impossible', 'move', 'timeout'):
            return  # Could be a late message, just drop it
        raise InvalidMsg('Bad message type {msg["type"]}')


lobby = Lobby()


class Player:
    def __init__(self, ws):
        self.ws = ws
        self.game_id = 0
        self.id = None  # index in the current game
        self.handler = None

    async def send(self, t, **extra):
        extra['type'] = t
        try:
            await self.ws.send(dumps(extra))
        except WebSocketException:
            pass    # will come out in the rx loop and cause a disconnect there

    async def recv_loop(self):
        rx_times = deque()
        while True:
            try:
                s = await self.ws.recv()
                now = monotonic()
                rx_times.append(now)
                if len(rx_times) == 5:
                    if now - rx_times.popleft() < 5:
                        print('Hit rate limit')
                        break  # rate limited
            except WebSocketException:
                break  # disconnected
            await self.handler.rx(self, loads(s))


def generate_maze(width, height, colours):
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


class Game:
    def __init__(self, players):
        self._players = players
        self._over = asyncio.Future()

    async def _play(self):
        await self._over
        await lobby.join(*self._players)

    async def play(self):
        for p in self._players:
            p.handler = self
        asyncio.Task(self._play())  # Task intentionally left unreferenced to avoid infinite recursion
        await self._start()

    async def leave(self, player):
        self._players.remove(player)
        await self._relay(None, 'left', player=player.id)
        if len(self._players) == 1 and not self._over.done():
            self._over.set_result(None)

    def _move(self, player, pos):
        return self._relay(player, 'move', pos=pos)

    def _impossible(self, player, state):
        return self._relay(None, 'impossible', player=player.id, state=state)

    def _timeout(self, player):
        return self._relay(player, 'left', player=player.id)

    def _relay(self, originator, t, **extra):
        # Could potentially optimise using websockets.broadcast()
        return asyncio.gather(*(
            p.send(t, **extra) for p in self._players if p is not originator))

    async def _start(self):
        maze = self._gen_maze()
        coros = []
        for i, p in enumerate(self._players):
            p.id = i
            p.game_id += 1
            coros.append(p.send('start', game_id=p.game_id, players=len(self._players), own_id=p.id, **maze))
        await asyncio.gather(*coros)

    def _gen_maze(self):
        return {
            'mode':'shard',
            'maze': generate_maze(5, 5, 'rgby'),
            'starts':choice(([[1,1],[3,3]], [[1,3],[3,1]])),
            'startColour':choice('rgby')}

    async def rx(self, player, msg):
        # TODO: Validation
        if msg['game_id'] != player.game_id:
            return
        match msg['type']:
            case 'move':
                await self._move(player, msg['pos'])
            case 'impossible':
                await self._impossible(player, msg['state'])
            case 'timeout':
                await self._timeout(player)
            case 'over':
                if not self._over.done():
                    self._over.set_result(None)
            case _:
                raise InvalidMsg('Unexpected type: {msg["type"]}')


async def handle_player(ws):
    if ws.path != '/mph':
        return
    p = Player(ws)
    try:
        await lobby.join(p)
        await p.recv_loop()
    finally:
        await p.handler.leave(p)


async def main():
    async with serve(handle_player, '0.0.0.0', 9783, max_size=256, max_queue=4):
        await asyncio.Future()


asyncio.run(main())
