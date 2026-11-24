# Quantum pacing: design numbers, bottleneck, and balance options

24 November 2026, morning America/Chicago (CT). Local work on `feature/core-history`. No option below is the default on that branch.

The pacing bot is a reasonable active player (or, for casual, 45-minute sessions then 8 hours away at half speed). It buys the six starter research machines and does the TECH projects that unlock GPU, RGB, and Quantum. It does not research the later server hardware (Irwell Mark 1 and up), so R&D stays at the starter-machine rate.

## 1. Changing the history-event design numbers barely moves Quantum

Current design numbers (already on `feature/core-history`):

- Moore's Law: 15% off buy costs of eras dated 1965 or later
- 1947 moth: +4 R&D or a 5-minute income boost
- Transcontinental Cable $5.00M, National Mainframe $100.00M

| Profile | First prestige | Quantum | First fork |
|---|---|---|---|
| Nonstop | 6h 28m | **15d 6h** | — (not in 21 days) |
| Casual | 1d 11h | **28d 10h** (misses the 21-day window) | — |

A more generous set was also run, to see how far those three knobs can move it: Moore at 50% off, moth at +20 R&D / 30-minute boost, cable $1.00M, mainframe $10.00M.

| Profile | First prestige | Quantum | First fork |
|---|---|---|---|
| Nonstop | 1d 14h (later: the cheaper later eras kept the first run going) | **15d 5h** (−1 hour) | — |
| Casual | 1d 2h | **28d 2h** (−8 hours) | — |

Even an 80% Moore discount, or +100 R&D from the moth, would not matter here. The moth's 100 points would be about 4.6 hours of starter-machine output. Quantum is a days-long TECH wait, not a buy-cost or early-project-bonus problem. Pushing those three numbers further will not make casual reach Quantum in 21 days.

## 2. Where the time goes after the first prestige

The wall is late TECH research, paid at **0.006 R&D/s** (six Inland 601 starter machines at 0.001/s each). Better research servers stay locked behind their own TECH projects, which this bot — and a player who never leaves the starter machines — never starts.

Income and the era earnings gates are not the Quantum bottleneck. When the last required project finishes, Quantum is already payable and opens immediately.

Nonstop, after the first prestige at 6h 28m:

| Stretch | Time | What was actually waiting |
|---|---|---|
| First prestige → Graphics Cards | 6h 28m → 1d 15h | Climb back through the mid eras, then the GPU TECH chain (gpu-2d 323 + gpu-3d 532 = 855 R&D) |
| Graphics Cards → RGB / AI | 1d 15h → 7d | The SSD chain: tape → HDD → floppy → SCSI → SATA → SSD, **2,780 R&D** at 0.006/s (~5.4 days) |
| AI → Quantum | 7d → 15d 6h | Tensor cards: Raster 1080 (1,072) then Tensor P100 (3,217), **4,289 R&D** at 0.006/s (~8.3 days) |

Casual is the same wall, stretched by 8-hour away gaps at half rate (starters still bank, but at the away rate). After 21 days the Tensor P100 is still unfinished; it completes at **28d 10h** if the window is extended. By then casual has only 2d 10h of active play.

Prestige multipliers and the soft income ceiling are not what hold Quantum. After the RGB-era prestige the nonstop bot already has 2,787 investors and more than enough run earnings. It never takes a later prestige (and never forks) because it refuses to prestige while the next era, VR, is still waiting on its own TECH chain. First fork needs 8,500 investors. That is a separate issue; none of the options below change it.

## 3. Balance options

Each option only changes one config number: the starter machine's R&D rate (`tab601.rd` in `src/lib/facilities.js`). Earnings gates, prestige math, Moore, the moth, and mega-project costs stay as they are. The three options live on local branches, not as the default on `feature/core-history`.

| Option | Branch | What changes | Nonstop prestige | Nonstop Quantum | Nonstop fork | Casual prestige | Casual Quantum | Casual fork |
|---|---|---|---|---|---|---|---|---|
| Current | `feature/core-history` | Starter 0.001/s each (0.006/s for six) | 6h 28m | 15d 6h | — | 1d 11h | 28d 10h | — |
| A. Gentle | `balance/starter-rd-gentle` | Starter **0.0025/s** each (2.5×, 0.015/s for six) | 6h 28m | **6d 2h** | — | 1d 11h | **11d 7h** | — |
| B. Medium | `balance/starter-rd-medium` | Starter **0.005/s** each (5×, 0.030/s for six) | 6h 28m | **3d 1h** | — | 1d 11h | **7d 7h** | — |
| C. Strong | `balance/starter-rd-strong` | Starter **0.01/s** each (10×, 0.060/s for six) | 6h 28m | **1d 17h** | — | 1d 11h | **7d 7h** | — |

Every option gets casual to Quantum inside three weeks. First prestige does not move. First fork is still not reached.

Strong does not beat medium for casual (both 7d 7h) because, once the starter machines are this fast, casual is waiting on when AI Accelerators (2016) open so the Tensor P100 project can start, and then on the next 45-minute session after the 8-hour away gaps. More R&D past that point just finishes in the same wake-up.

A player who researches a real 1951 Irwell Mark 1 (and later racks) would already be faster than this starter-only bot. These options are the guarantee that someone who mostly uses the punch-card machines still reaches Quantum.

## 4. Recommendation

**Option B, medium (starter 0.005/s).** Casual is sure to reach Quantum in about a week. Nonstop lands at about 3 days — later than the old 0.0.22 “Quantum ~6h” note, which is fine given how many eras and TECH gates were added after that tune, without turning the late game into a one-day rush. If you want nonstop under two days, take C; casual stays about a week either way. If you want the lightest touch that still makes Quantum achievable, take A (6 days nonstop, 11 days casual).

To try one: `git checkout balance/starter-rd-medium` (or `-gentle` / `-strong`). Nothing has been pushed, and `feature/core-history` still has the current 0.001/s rate.
