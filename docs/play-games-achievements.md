# Play Games achievements

Thirty standard (unlock-once) achievements. The Play Console ids below are the
real ones. The game reports an unlock only after the player is signed in to
Play Games. If they aren't, it keeps the unlock in a local queue and sends it
the next time sign-in works. A call that doesn't answer within 15 seconds is
dropped for that try and retried later. Nothing in the queue blocks the game.

Once an unlock is queued or sent, it stays. A later build can add eras,
history cards, or specialties without taking an achievement back from someone
who already earned it against the list in the build they played.

"Reach an era" means that business has been owned at least once. Prestige
clears the current count, but the furthest era reached is remembered.
"Unlock every era" and "Fill the Museum" use the eras and history cards in
this build. "Fill every research specialty" uses the specialties in this
build.

Two save fields were added for totals the game did not keep. `maxOwned` is
the most copies of any one business ever held. An older save starts that
from whatever is on the board now. `labFinished` counts finished lab
projects. An older save starts at 1 if the install crew is already hired,
and at 0 otherwise.

| Id in the game | Name | Description | Unlock | Points | Play id |
| --- | --- | --- | --- | --- | --- |
| first-business | Open for business | Buy your first business. | Buy any business (the free starter Timber Camp doesn't count). | 25 | `CgkI7-b2jZ8bEAIQAg` |
| first-manager | Hired help | Hire your first manager. | Hire any manager. | 25 | `CgkI7-b2jZ8bEAIQAw` |
| era-punchcards | Holes in the card | Reach the Punch Cards era. | Own at least one Punch Cards business, now or in an earlier run. | 25 | `CgkI7-b2jZ8bEAIQBA` |
| era-tubes | Warm glass | Reach the Vacuum Tubes era. | Own at least one Vacuum Tubes business, now or in an earlier run. | 25 | `CgkI7-b2jZ8bEAIQBQ` |
| era-transistors | Solid state | Reach the Transistors era. | Own at least one Transistors business, now or in an earlier run. | 25 | `CgkI7-b2jZ8bEAIQBg` |
| era-cpu | On one chip | Reach the Microprocessors era. | Own at least one Microprocessors business, now or in an earlier run. | 25 | `CgkI7-b2jZ8bEAIQBw` |
| era-quantum | Both at once | Reach the Quantum era. | Own at least one Quantum Servers business, now or in an earlier run. | 25 | `CgkI7-b2jZ8bEAIQCA` |
| first-prestige | Backers | Prestige for the first time. | Prestige once (investors on the board also counts). | 25 | `CgkI7-b2jZ8bEAIQCQ` |
| first-investor | Head start | Reach your first investor milestone. | Reach 10 investors at any point (the Head Start milestone). | 25 | `CgkI7-b2jZ8bEAIQCg` |
| first-challenge | House rules | Win your first challenge. | Finish any challenge. | 25 | `CgkI7-b2jZ8bEAIQCw` |
| era-loom | Woven code | Reach the Jacquard Loom era. | Own at least one Jacquard Loom, now or in an earlier run. | 10 | `CgkI7-b2jZ8bEAIQDA` |
| era-ics | Many on one | Reach the Integrated Circuits era. | Own at least one Integrated Circuits business, now or in an earlier run. | 10 | `CgkI7-b2jZ8bEAIQDQ` |
| era-homepc | A computer on every desk | Reach the Home Computers era. | Own at least one Home Computers business, now or in an earlier run. | 10 | `CgkI7-b2jZ8bEAIQDg` |
| era-gpu | Pixel pusher | Reach the Graphics Cards era. | Own at least one Graphics Cards business, now or in an earlier run. | 10 | `CgkI7-b2jZ8bEAIQDw` |
| every-era | Full history | Unlock every era. | Reach every business era in this build. A new era added later does not lock it again once it has been queued. | 100 | `CgkI7-b2jZ8bEAIQEA` |
| own-100 | Mass production | Own 100 of one business. | Hold 100 copies of any one business at once. The peak is kept across prestige. | 10 | `CgkI7-b2jZ8bEAIQEQ` |
| own-200 | Industrial scale | Own 200 of one business. | Hold 200 copies of any one business at once. The peak is kept across prestige. | 45 | `CgkI7-b2jZ8bEAIQEg` |
| every-manager | Full staff | Hire every manager. | Every business in this build has its manager hired. Once queued, a later prestige does not take it back. | 45 | `CgkI7-b2jZ8bEAIQEw` |
| earn-billion | Billion-dollar startup | Earn your first $1 billion. | Career earnings reach $1 billion, across every run. | 10 | `CgkI7-b2jZ8bEAIQFA` |
| earn-trillion | Trillionaire | Earn your first $1 trillion. | Career earnings reach $1 trillion, across every run. | 45 | `CgkI7-b2jZ8bEAIQFQ` |
| prestige-10 | Serial founder | Prestige 10 times. | The prestige counter reaches 10. | 45 | `CgkI7-b2jZ8bEAIQFg` |
| investors-1000 | Board of directors | Hold 1,000 investors. | The most investors ever held reaches 1,000, including investors already spent on forks. | 45 | `CgkI7-b2jZ8bEAIQFw` |
| fork-1 | Spin-off | Fork for the first time. | Fork the timeline once. | 45 | `CgkI7-b2jZ8bEAIQGA` |
| fork-5 | Conglomerate | Fork 5 times. | Fork the timeline 5 times. | 100 | `CgkI7-b2jZ8bEAIQGQ` |
| bubble | Bubble survivor | Live through the Dot-com Bubble. | The Dot-com Bubble has appeared and is no longer on screen (it popped, or the stock was cashed out). | 10 | `CgkI7-b2jZ8bEAIQGg` |
| y2k | Midnight, 2000 | Survive Y2K. | The one-time Millennium Bug dilemma has appeared. This is not the Y2K Patch project. | 10 | `CgkI7-b2jZ8bEAIQGw` |
| museum | Curator | Fill the Museum. | Every history card in this build is in the Museum. A card added later does not lock it again once it has been queued. | 100 | `CgkI7-b2jZ8bEAIQHA` |
| specialties | Lab coat | Fill every research specialty. | Every research specialty in this build has been chosen. | 45 | `CgkI7-b2jZ8bEAIQHQ` |
| lab-10 | Side projects | Finish 10 lab projects. | Finish 10 lab projects (Overclock, Patent Filing, or Install Crew). | 10 | `CgkI7-b2jZ8bEAIQHg` |
| challenges-5 | House champion | Win 5 challenges. | Finish 5 challenges. The current build has 3 challenges, each winnable once, so this waits for more challenges. | 45 | `CgkI7-b2jZ8bEAIQHw` |

In the game: More > Settings > Account shows ACHIEVEMENTS once Play Games is
part of the build. It opens the Play Games achievements list. If the player
isn't signed in, it starts sign-in first and gives up if that doesn't finish.
