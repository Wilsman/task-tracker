
# Storyline Map Audit (Flow Map Screenshots vs Code)

**Scope**

- Files reviewed:
  - [src/components/storyline-map/storylineMapData.ts](cci:7://file:///f:/task-tracker/src/components/storyline-map/storylineMapData.ts:0:0-0:0)
  - [src/components/storyline-map/endingData.ts](cci:7://file:///f:/task-tracker/src/components/storyline-map/endingData.ts:0:0-0:0)
  - `src/components/storyline-map/EndingFlowView.tsx`
- Goal:
  - Compare the **visual flow map screenshots** to the **current node/edge graph** in code.
  - Identify what matches, what’s missing/mismatched, and what to update next.

---

## Key Code Facts (How the app currently derives “a path”)

### [findPathToNode()](cci:1://file:///f:/task-tracker/src/components/storyline-map/storylineMapData.ts:897:0-923:1) behavior (important limitation)

File: [src/components/storyline-map/storylineMapData.ts](cci:7://file:///f:/task-tracker/src/components/storyline-map/storylineMapData.ts:0:0-0:0)

- It builds `parentMap` as: `parentMap.set(edge.target, edge.source)`
- That means **only one parent per node** is retained.
- If a node has **multiple incoming edges**, the “path” is effectively whichever parent was assigned last during edge iteration.
- Result: the UI may show a path that doesn’t reflect the intended branching, even if the graph is correct.

### [getEndingPathData()](cci:1://file:///f:/task-tracker/src/components/storyline-map/endingData.ts:249:0-280:1) only uses the first ending node id

File: [src/components/storyline-map/endingData.ts](cci:7://file:///f:/task-tracker/src/components/storyline-map/endingData.ts:0:0-0:0)

- For an ending like Survivor which has `endingNodeIds: ["survivor-ending", "survivor-ending-2"]`,
- [getEndingPathData()](cci:1://file:///f:/task-tracker/src/components/storyline-map/endingData.ts:249:0-280:1) uses only:
  - `const endingNodeId = endingInfo.endingNodeIds[0];`
- Result: **only one variant path is shown** in the “Ending Flow View” unless this logic is extended.

### Timegates only count if modeled as nodes

File: [src/components/storyline-map/storylineMapData.ts](cci:7://file:///f:/task-tracker/src/components/storyline-map/storylineMapData.ts:0:0-0:0) ([getPathBreakdown()](cci:1://file:///f:/task-tracker/src/components/storyline-map/storylineMapData.ts:941:0-995:1))

Timegates are only included in totals if a node has:

- `isTimeGate: true`
- `timeGateHours: number`

If the flow map shows a timegate but there’s **no corresponding node**, the UI breakdown will under-report timegates.

---

# Ending-by-Ending Results

## 1) Survivor Ending

### Code ending nodes

- `survivor-ending`
- `survivor-ending-2`

Defined in [endingData.ts](cci:7://file:///f:/task-tracker/src/components/storyline-map/endingData.ts:0:0-0:0):

- `ENDING_NODE_IDS.survivor = ["survivor-ending", "survivor-ending-2"]`

### Variant A — Keep Case → Survivor (`survivor-ending`)

**Code path exists and matches major steps:**

- `start` → `case-decision` → `keep-case` → `1-open-case` → `1-craft-55h` → `1-case-open` → `Kerman-decision-1`
- `Kerman-decision-1` (solo) → `1a-shoreline-keycard` → `1a-keycard-fail` → `1a-pay-prapor` (**500M**)
- → `1a-find-folders` → `1a-craft-5h` → `1a-give-flash` → `1a-kill-50` → `1a-kill-4-pmcs`
- → `1a-get-note` → `1a-achievement-easy` → `1a-shoreline-escape` → `survivor-ending`

**Matches from screenshots:**

- **500M** payment for keep-case route (`1a-pay-prapor`, `cost: 500000000`)
- Escape failure note is present:
  - `1a-shoreline-escape` note: `If fail: 5M ₽ for new Note (limit 2)`

### Variant B — Give Case to Prapor → Survivor (`survivor-ending-2`)

**Code path exists and matches major steps:**

- `start` → `case-decision` → `give-prapor` → … → `Kerman-decision-2` (solo)
- → `2a-shoreline-keycard` → `2a-keycard-fail` → `2a-pay-prapor` (**300M**) → …
- → `2a-shoreline-escape` → `survivor-ending-2`

**Matches from screenshots:**

- **300M** payment for gave-case route (`2a-pay-prapor`, `cost: 300000000`)
- Escape failure note is present:
  - `2a-shoreline-escape` note: `If fail: 5M ₽ for new Note (limit 2)`

### Mismatches / missing vs flow map

- **48 hour timegate** shown in screenshots (between “Kill 4 PMCs” and “Get Note”) is **not modeled**
  - Code currently goes directly:
    - `1a-kill-4-pmcs` → `1a-get-note`
    - `2a-kill-4-pmcs` → `2a-get-note`
- “Armored Case is in your Hands” box exists in screenshots but **not as a node** in keep-case route
- “72h bonus / I am Speed” is only a **note** on:
  - `2a-give-flash` note: `72h bonus: 'I am Speed' achievement`
  - Missing the “if not done in 72h hand in Kappa secure container” logic/node

---

## 2) Savior Ending

### Code ending nodes

- `savior-ending`
- `savior-ending-2`

### Keep Case + Work with Kerman + Help Evidence → Savior (`savior-ending`)

**Code path exists and matches major steps:**

- `Kerman-decision-1` (work) → `1b-search-labs` → `1b-keycard-acquired`
- → `1b-pay-mechanic` (**40 BTC**) → `1b-get-rfid` → `1b-activate-rfid` → `1b-craft-50h`
- → `1b-shoreline-keycard` → `Kerman-evidence-decision` (help)
- → `1b1-help-evidence` → `1b1-complete-chapters` → `1b1-fence-contact` → `1b1-fence-rep`
- → `1b1-pvp-pve-task` → `1b1-btr-rep` → `1b1-solar-power` → `1b1-final-craft`
- → `1b1-shoreline-escape` → `savior-ending`

**Matches from screenshots:**

- Escape failure/reset note present:
  - `1b1-shoreline-escape` note: `If fail: 11H craft + new Blank RFID Card`

### Mismatches / missing vs flow map

- **24 hour timegate** shown between “Keycard acquired” and “Pay Mechanic 40 BTC” is **not modeled**
  - No `isTimeGate/timeGateHours` node between `1b-keycard-acquired` and `1b-pay-mechanic`
- **48 hour timegate** shown after “complete every other story chapter…” is **not modeled**
  - No timegate node between `1b1-complete-chapters` and `1b1-fence-contact`
- PvE vs PvP is shown as **two distinct branches** in screenshots, but code collapses into:
  - `1b1-pvp-pve-task` (single node with combined description)
- Solar Power shown as **mandatory + 72 hour build time** in screenshots, but in code:
  - `1b1-solar-power` has no `craftHours` and no timegate hours (just `isCraft: true`)
  - It is `type: "story"` rather than `type: "craft"` (if you want it to behave like a craft/time step in the UI breakdown)

---

## 3) Debtor Ending

### Code ending nodes

- `debtor-ending`
- `debtor-ending-2`

### Keep Case branch → Lightkeeper route → Debtor (`debtor-ending`)

**Code path exists and matches major steps:**

- From `Kerman-evidence-decision` → `1b3-no-help-lk` (edge label “Lightkeeper”)
- → `1b3-topo-recon` → `1b3-craft-6h` → `1b3-flash-drive`
- → `1b3-kill-30-pmcs` → `1b3-cultist-amulets` → `1b3-place-amulets`
- → `1b3-get-keycard` → `1b3-shoreline-escape` → `debtor-ending`

**Matches from screenshots:**

- Escape failure/reset note present:
  - `1b3-shoreline-escape` note: `If fail: Barter 1 Blue Folder from LK`

### Mismatches / missing vs flow map

- Screenshot shows “hand 2 major evidence to Kerman, then stop working with him”
  - Code jumps from `Kerman-evidence-decision` directly to `1b3-no-help-lk` (no node)
- Screenshot shows **48 hour timegate** between “place amulets” and “LK gives keycard”
  - Code has no timegate node between `1b3-place-amulets` and `1b3-get-keycard`
- “U Turn Achievement” is a screenshot node; code includes it only as a note on:
  - `1b3-no-help-lk` note: `🏆 Achievement: U Turn`

---

## 4) Fallen Ending

### Code ending node

- `fallen-ending`

### Keep Case + Work with Kerman + Don’t Help (Prapor hard mode) → Fallen

**Code path exists and matches major steps:**

- From `Kerman-evidence-decision` → `1b2-no-help-prapor`
- → `1b2-repair-kits` → `1b2-secure-container` → `1b2-mil-components`
- → `1b2-bio-weapon` → `1b2-pay-usd` (**1M USD**) → `1b2-get-usb-stick`
- → `1b2-final-keycard-craft` (**11h craft**) → `1b2-shoreline-escape` → `fallen-ending`

**Matches from screenshots:**

- Escape failure/reset note present:
  - `1b2-shoreline-escape` note: `If fail: 11H craft + new Blank RFID Card`
- 1M USD step exists (as a `cost: 1000000` node)

### Mismatches / missing vs flow map

- Screenshot shows a conditional shortcut (“if you handed the Case to Prapor earlier and got it back from Lightkeeper”)
  - Code does not model this branching; the Fallen route is linear
- Screenshot shows **48 hour timegate** near the achievement segment
  - No timegate node exists in Fallen path
- Screenshot shows **Build Solar Power (mandatory) + 72 hour build time**
  - Code does not include Solar Power anywhere in the Fallen route

---

# Consolidated “Needs Update” Checklist

## Timegates missing in code (from screenshots)

- **Savior**
  - 24h timegate before `Pay Mechanic 40 BTC`
  - 48h timegate after “complete chapters”
- **Debtor**
  - 48h timegate after “place amulets”
- **Survivor**
  - 48h timegate shown between “Kill 4 PMCs” and “Get Note”
- **Fallen**
  - 48h timegate shown near achievement segment
- **Solar Power build time**
  - 72h “build time” shown in screenshots for Savior & Fallen, not modeled in breakdown

## Steps shown as boxes in screenshots but not represented as nodes (or only as notes)

- “Armored Case is in your Hands” (Survivor/Savior pre-branch visual)
- “Hand 2 major evidence to Kerman, then stop working with him” (Debtor pivot)
- Achievement boxes (“U Turn”, “Enough of your Games!”, “Will it Blow”) are often *notes*, not nodes
- PvE vs PvP split (Savior) is not represented as branches

## UI/path computation issues to be aware of when updating

- [findPathToNode()](cci:1://file:///f:/task-tracker/src/components/storyline-map/storylineMapData.ts:897:0-923:1) is not truly BFS and does not support multi-parent graphs correctly (single `parentMap` overwrite).
- [getEndingPathData()](cci:1://file:///f:/task-tracker/src/components/storyline-map/endingData.ts:249:0-280:1) only uses the first ending node id, so multi-ending variants (Survivor, Savior, Debtor) won’t show alternate paths unless updated.

---

# Files to Update (when implementing fixes)

- **Graph data**
  - [src/components/storyline-map/storylineMapData.ts](cci:7://file:///f:/task-tracker/src/components/storyline-map/storylineMapData.ts:0:0-0:0)
    - Add missing nodes (timegates, solar power, evidence hand-in steps, etc.)
    - Add/adjust edges for branching where needed

- **Ending path view behavior**
  - [src/components/storyline-map/endingData.ts](cci:7://file:///f:/task-tracker/src/components/storyline-map/endingData.ts:0:0-0:0)
    - [getEndingPathData()](cci:1://file:///f:/task-tracker/src/components/storyline-map/endingData.ts:249:0-280:1) currently chooses `endingNodeIds[0]` only

- **Path finding correctness**
  - [src/components/storyline-map/storylineMapData.ts](cci:7://file:///f:/task-tracker/src/components/storyline-map/storylineMapData.ts:0:0-0:0)
    - [findPathToNode()](cci:1://file:///f:/task-tracker/src/components/storyline-map/storylineMapData.ts:897:0-923:1) currently overwrites parent relationships and cannot represent multiple incoming edges safely

---

## Status

- **All endings audited**: Survivor, Savior, Debtor, Fallen.
- This markdown captures **matches + mismatches + code hot spots** to update next.
