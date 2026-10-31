# SAF Context Modeling — pick the right viewpoint

You are helping model a **SAF context view of a system of interest (SOI)** in a
Cameo/SysML model, using the SAF profile. There are nine SAF *context*
viewpoints — 3 fidelity domains × 3 kinds of context information. This skill
routes you to the right one; then you follow that viewpoint's user recipe.

> **User side only.** Building a view of *your* system. Maintaining the SAF
> **specification** (the spec model, SCM/SPM, viewpoint packages, rules) is a
> separate concern: `../../saf-spec-expert/AGENTS.md`, with per-viewpoint
> spec-focused drafts in `../spec-recipes/`.

## The context grid

| Domain (fidelity) | Definition — where it sits | Exchange — what flows | Interaction — how it behaves |
|---|---|---|---|
| **Operational** (O) | `O1_OCXD` | `O1_OCXE` | `O4_OCXI` |
| **Conceptual** (C) | `C1_SCXD` | `C1_SCXE` | `C4_SCXI` |
| **Physical** (P) | `P1_PCXD` | `P1_PCXE` | `P4_PCXI` |

Each cell is one user recipe, deployed as an OMP skill `saf-<vp>`
(e.g. `C1_SCXD` → `saf-c1-scxd`).

**All nine context recipes are available.** Every grid cell above is deployed as
its own OMP skill (`saf-<vp>`). Pick the cell, open that recipe, and follow it —
each starts with the same reuse-first Step 0.

## How to pick

Two independent questions — answer both, then read the cell.

**1. Which domain?** (the fidelity layer of the SOI you are capturing)
- **Operational (O)** — what the system *does*: use cases, operational roles,
  operational scenarios.
- **Conceptual (C)** — the system's *conceptual* context: the conceptual SOI
  and the external conceptual systems / users / environmental conditions it
  interacts with.
- **Physical (P)** — the *realized / deployed* context: the physical SOI block
  and the deployed / physical external entities.

If the domain is not clear from the request, **ask** — do not guess the
fidelity layer.

**2. Which kind of context?** (what you need to state about it)
- **Definition (XD)** — *where* the SOI sits and the external entities it
  interacts with: the SOI's boundary and its role parts.
- **Exchange (XE)** — *what information / data* crosses the boundary between
  the SOI and its context.
- **Interaction (XI)** — *how* the SOI and its context behave together: the
  interactions and scenarios.

## Then follow the recipe

Open the matching `<VP_ID>.md` (deployed as `saf-<vp>`). Every context recipe
follows the same shape:

1. **Reuse check** — locate existing elements of the same kind before creating
   anything (a second SOI / context / external system is a bug).
2. **Create the elements** — the kind decides what:
   - **Definition** — the context block, the SOI element, the external elements,
     and the role parts that tie them to the context.
   - **Exchange** — on the Definition view's context, an interface definition
     carrying flow properties, an interaction point (port) on the SOI and each
     external (typed by the interface), a connector between them, and the item
     exchange flowing over it (conveying the exchange item type, not the interface).
   - **Interaction** — an Interaction under the context, with a lifeline per
     participating role and the ordered messages between them.
3. **Draw the diagram** — Definition: BDD (composition context→SOI/external);
   Exchange: IBD of the context (parts + connectors + item exchanges);
   Interaction: sequence diagram under the Interaction.
4. **Validate** — `get_stereotype_tags` / `get_block_structure` /
   `get_interaction_structure` show the expected elements, the diagram is marked
   `SAF_<vp>`, and `saf_check_consistency` is clean.

### The IBD exchange pattern (shared by every Exchange view)

Every Exchange view (context or internal) draws an IBD with the same pattern:

- **Interface definition** (e.g. `SAF_ConceptualInterfaceDefinition`,
  `SAF_PhysicalInterfaceDefinition`) — a block that carries **flow properties**.
  Each flow property is typed by the exchange item type and has a direction
  (`out`/`in`/`inout`); together they are the interface's **exchange capabilities**
  (what it *can* exchange, and in which direction).
- **Interaction point (port)** — where a part meets the outside for one identified
  interface; **typed by the interface definition** (`set_type`), so the part
  "exposes" that interface.
- **Connection (Connector)** — joins the SOI's interaction point to the external's.
- **Item exchange (ItemFlow)** — states what is **actually exchanged in this
  scope**. Its **conveyed item is the exchange item type** (the flow property's
  type) — **not the interface definition**. Conveying the item flow with the
  interface definition is conceptually wrong.

The **exchange item type** is a plain type (a Class/Block): the kind of item
exchanged. Create one interface definition per *kind* of interface (not per port).
If the model does not track interface definitions, plain `Port`s with an item flow
are the minimal form. The **operational domain has no interface-definition
concept**: its exchange conveys the `SAF_OperationalExchangeType` directly.

### Two rules you must not break

- **Reuse before creating.** Locate existing SOI / context / external-system
  elements first; never create a duplicate.
- **No package per viewpoint.** Place elements in an existing package (your
  system's or context's package). Viewpoint membership is expressed by the SAF
  stereotype/tag, never by a dedicated package.
