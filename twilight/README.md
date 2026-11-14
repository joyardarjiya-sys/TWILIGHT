# Twilight

Twilight is a 2D co-op vampire hunt for one to four players. Chase humans through Blackthorn, leap across vintage cars, and dodge torchbearers before the timer runs out.

## Start on your computer

Use Node.js 20 or later. Extract the ZIP, open a terminal in the `twilight` folder, and run:

```sh
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser. Keep the terminal running while you play. Press Ctrl+C to stop it. The game has no package dependencies, so you can skip `npm install`.

## Play together

1. Enter a vampire name, select a difficulty, and choose **Begin the hunt**.
2. On the same computer, open the game in a second tab. Enter another name and join with the six-character room code.
3. On the same Wi-Fi, friends open `http://<host-computer-local-ip>:3000` and enter the room code. On Windows, run `ipconfig` and look for the Wi-Fi adapter's IPv4 address. If your firewall prompts you, allow Node.js on your private network.
4. Copying an invite from a page opened at the Wi-Fi address gives other players on that network a link with the room code filled in. The host's localhost address only works on the host computer.

Rooms and scores are held in memory. Restarting the server clears them. This package is configured for local and Wi-Fi play.

## Controls

| Action | Keyboard | Touch |
| --- | --- | --- |
| Move | Left / Right or A / D | Left and Right |
| Jump | Space, Up, or W | Jump |
| Run | Hold Shift while moving | Hold Run while moving |
| Attack | F or X | Attack |

Attacks land in front of your vampire. Torchbearers take two hits and can damage you at close range. Cars can be used as platforms. Human captures count toward one shared goal.

| Difficulty | Prey | Torchbearers | Time |
| --- | ---: | ---: | ---: |
| Easy | 6 | 1 | 2 min 30 sec |
| Hard | 9 | 4 | 2 min |
| Disaster | 12 | 8 | 1 min 35 sec |

The difficulty changes the hunt on the same town map. The daylight ring is part of the vampire design. Light and Dark modes change the palette and are saved in your browser.
