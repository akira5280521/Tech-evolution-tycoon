# Play Games achievements

Ten standard (unlock-once) achievements. The game only reports one after the
player is signed in to Play Games. If they aren't, it keeps the unlock in a
local queue and sends it the next time sign-in works. A call that doesn't
answer within 15 seconds is dropped for that try and retried later. Nothing
in the queue blocks the game.

The ids below are placeholders. Create each achievement in Play Console, then
paste its id over the matching `playId` in `src/lib/achievements.js`. Until
you do, the game keeps the unlock queued and does not call Play Games with a
placeholder.

Play Console: Grow users > Play Games Services > Achievements > Create
achievement. Type: Standard. The icon is a 512×512 PNG.

| Id in the game | Name | Description | Unlock | Suggested icon | Placeholder id |
| --- | --- | --- | --- | --- | --- |
| first-business | Open for business | Buy your first business. | Buy any business (the free starter Timber Camp doesn't count). | A timber camp with a coin on the sign. | `REPLACE_IN_PLAY_CONSOLE_first_business` |
| first-manager | Hired help | Hire your first manager. | Hire any manager. | A clipboard and a hard hat. | `REPLACE_IN_PLAY_CONSOLE_first_manager` |
| era-punchcards | Holes in the card | Reach the Punch Cards era. | Own at least one Punch Cards business. | A stiff card with a grid of holes. | `REPLACE_IN_PLAY_CONSOLE_era_punchcards` |
| era-tubes | Warm glass | Reach the Vacuum Tubes era. | Own at least one Vacuum Tubes business. | A glowing vacuum tube. | `REPLACE_IN_PLAY_CONSOLE_era_tubes` |
| era-transistors | Solid state | Reach the Transistors era. | Own at least one Transistors business. | A metal-can transistor with three leads. | `REPLACE_IN_PLAY_CONSOLE_era_transistors` |
| era-cpu | On one chip | Reach the Microprocessors era. | Own at least one Microprocessors business. | A black chip with gold pins. | `REPLACE_IN_PLAY_CONSOLE_era_cpu` |
| era-quantum | Both at once | Reach the Quantum era. | Own at least one Quantum Servers business. | A golden chandelier of wires. | `REPLACE_IN_PLAY_CONSOLE_era_quantum` |
| first-prestige | Backers | Prestige for the first time. | Prestige once (investors on the board also counts). | A small crowd with briefcases. | `REPLACE_IN_PLAY_CONSOLE_first_prestige` |
| first-investor | Head start | Reach your first investor milestone. | Reach 10 investors at any point (the Head Start milestone). | A ribbon on a stack of contracts. | `REPLACE_IN_PLAY_CONSOLE_first_investor` |
| first-challenge | House rules | Win your first challenge. | Finish any challenge. | A checkered flag over a factory. | `REPLACE_IN_PLAY_CONSOLE_first_challenge` |

In the game: More > Settings > Account shows ACHIEVEMENTS once Play Games is
part of the build. It opens the Play Games achievements list. If the player
isn't signed in, it starts sign-in first and gives up if that doesn't finish.
