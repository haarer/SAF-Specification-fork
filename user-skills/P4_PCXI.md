# P4_PCXI — Physical Context Interaction (view)

**Grid cell:** Physical domain × Interaction & Collaboration (aspect 4) · **Maturity:** proposed
**Presentation:** a sequence diagram — flow of control between SOI and Context Elements
Roles of a Physical Context; the lifelines' representatives are part properties typed
by Physical Context Elements.
**What a view gives you:** a UML sequence diagram of one scenario at the physical
level: the physical system (the SoI) and the physical context elements (external
physical systems, physical users, physical environment, in their context roles) as
lifelines, and the ordered messages between them that show how the physical elements
interact to provide the system function.

> This is a recipe for a **modeler building a system model**: it tells you how to
> create one *view* of the Physical Context Interaction viewpoint in your own
> model, using the SAF profile. It does not add anything to the spec.

## Purpose / when to use

You use this view to capture, in one **physical context**, the ordered sequence of
exchanges between the **physical system (SoI)** and the **physical context elements**
(physical external systems, physical users, physical environment) that shows **how the
physical elements interact to provide the system function**. Each view is **one
scenario** (`physical_context_interaction_scenario`, a UML *Interaction*) over the
context's role parts, with the messages
(`physical_context_chronological_message`, UML *Message*) in temporal order. Make
**one view per scenario/outcome** you care about.

## Preconditions

- The **Physical Context Definition** view (P1_PCXD) is **required**: the context block
  and its role part properties — the SoI role (`SAF_PhysicalContextRole_SoI`) and the
  context-element roles (`SAF_PhysicalContextRole`). Those **role parts are the
  lifeline representatives** of this view; a lifeline represents a Property/Port, never
  a block.
- The **Physical Internal Exchange Viewpoint** is **recommended** first — it frames
  the physical item exchanges the scenario's messages convey.
- **No per-viewpoint package** (Rule 2 in `AGENTS.md`). The Interaction is owned by a
  classifier — put it under the context block (or your existing package), never in a
  package created for the viewpoint.

## Step 0 — Reuse check (always do this first)

An Interaction — and a sequence diagram of it — may **already exist**. Look before you create:

1. Find existing views of this viewpoint: a sequence diagram marked `SAF_P4_PCXI`
   (`saf_get_viewpoint_views(domain="P")` or `find_elements_by_type(stereotype="SAF_P4_PCXI")`).
2. `find_elements_by_type(stereotype="SAF_PhysicalContext")` → your context block.
3. `get_block_structure(<context>)` → the role part properties (the lifeline
   representatives); `find_elements(name=…)` → any scenario Interactions already under
   the context.
- **If an Interaction + diagram for the scenario you want already exists → extend it**: add the
  missing lifelines / messages to the existing view.
- **Otherwise → create a new Interaction and a new view** (steps below).

## Create the view

### Elements to model

| Element | Create via | SAF stereotype | Meaning in your model |
|---|---|---|---|
| The interaction scenario | `create_element(type="interaction", name="<Scenario>", parentId=<context>)` | — none | one scenario: an ordered sequence of exchanges between participants (`physical_context_interaction_scenario`, realized as a UML *Interaction*) |
| Each participant (lifeline) | created automatically by `set_sequence_message_ends` — `represents` a role part property of the context | — none | a physical context role participates in the scenario (`physical_context_scenario_participation`, realized as a UML *Lifeline*) |
| Each message | one `set_sequence_message_ends` call per message | — none | an ordered exchange between two participants (`physical_context_chronological_message`, realized as a UML *Message*) |
| The SoI's role (lifeline representative) | **reuse** — the SoI role part already created in the P1_PCXD view (`create_part(…, roleStereotype="SAF_PhysicalContextRole_SoI")`) | `SAF_PhysicalContextRole_SoI` (+ `PartProperty`) | the physical system's participation in the scenario — a Property/Port of the context, never a block |
| Each context element's role (lifeline representative) | **reuse** — the element role parts already created in the P1_PCXD view (`create_part(…, roleStereotype="SAF_PhysicalContextRole")`) | `SAF_PhysicalContextRole` (+ `PartProperty`) | a physical context element's (external system / user / environment's) participation in the scenario |

> **Why no `apply_stereotype` on scenario / lifeline / message:** for this viewpoint
> the UML metaclasses (`Interaction`, `Lifeline`, `Message`) **are** the realization of
> the SAF concepts — no SAF stereotype is stamped on them. The viewpoint stereotype
> appears **only on the diagram** (`SAF_P4_PCXI`, applied by
> `saf_create_diagram(viewpoint=…)`).

### Build steps

1. **Role parts (lifeline representatives)** — reuse them from the P1_PCXD view:
   `get_block_structure(<context>)` lists the context's role part properties — the SoI
   role (`SAF_PhysicalContextRole_SoI`) and each context-element role
   (`SAF_PhysicalContextRole`); these are the only things a lifeline may represent.
   If a context element that takes part in your scenario is missing from the context,
   add it there first
   (`create_part(wholeBlockId=<context>, name="<role>", partTypeBlockId=<element>, roleStereotype="SAF_PhysicalContextRole")`)
   and extend the P1_PCXD view.
2. **The Interaction** — `create_element(type="interaction", name="<Scenario>", parentId=<context>)`
   (the parent may be the context Block or a Package, **never another Interaction**).
3. **Wire the messages** — one call per message, in temporal order:
   `set_sequence_message_ends(interactionId=<interaction>, name="<msg>", sendParticipantId=<partPropId>, receiveParticipantId=<partPropId>)`
   — this creates the Message, the Lifelines (with `represents` set to the role parts)
   and both event ends, **wired, in one write**. Do **not** pass a `messageId`; capture
   the returned one.
4. **Verify the structure** — `get_interaction_structure(interactionId=<interaction>)` →
   every lifeline's `represents` is a role part of the context; every message has both
   ends wired.
5. **Draw the sequence diagram** —
   `saf_create_diagram(name="<Scenario>", parentId=<interaction>, viewpoint="P4_PCXI", elementIds=[<interaction>, <each lifeline>])`.
   The diagram sits **under the Interaction**; `elementIds` = the Interaction + each
   Lifeline — do **not** pass the Messages. The `viewpoint` fixes the diagram kind
   (sequence) and marks the diagram `SAF_P4_PCXI`.
6. **Draw the message arrows** —
   `diagram_add_sequence_message(diagramId=<diagram>, messages=[{messageId=<m1>, sort="synchcall"}, {messageId=<m2>, sort="synchcall", insertAfter=<m1>}, …])`
   — the full temporal chain; every entry after the first carries `insertAfter` = the
   previous message's id. `sort` ∈ `asynchcall | synchcall | asynchsignal | reply | createmessage | deletemessage`.

## How it looks when done

**There is no reference SVG for this viewpoint yet** (it is maturity `proposed`). The
structure is the same as the two released sequence viewpoints — one lifeline per
context role part, numbered message arrows in temporal order, `alt` fragments for
alternative branches — so use these worked examples as the closest analogs:

- C4_SCXI: `../src/diagrams/examples_md/exa_19_0_3_6d8019d_1588607783346_352662_350.svg`
  (FFDS Context Interaction)
- O4_OCXI: `../src/diagrams/examples_md/exa_2024x_1_26f0132_1722258766618_9302_15524.svg`
  (Fire Detection and Notification)

## Tool-call sketch (copy this; resolve every ID by name in-session)

```text
# 0. reuse
saf_get_viewpoint_views(domain="P")                          # existing views of this viewpoint
find_elements_by_type(stereotype="SAF_PhysicalContext")      # the physical context block
get_block_structure(<context>)                               # soi part + element parts = lifeline representatives

# 1. interaction (under the context block)
create_element(type="interaction", name="FFDS Physical Context Interaction", parentId=<context>)
#    -> <interaction>

# 2. messages (one call each; lifelines are created when a part is first used)
set_sequence_message_ends(interactionId=<interaction>, name="Power request",
                          sendParticipantId=<soiPart>, receiveParticipantId=<powerGridPart>)
set_sequence_message_ends(interactionId=<interaction>, name="Power delivery",
                          sendParticipantId=<powerGridPart>, receiveParticipantId=<soiPart>)
set_sequence_message_ends(interactionId=<interaction>, name="Telemetry uplink",
                          sendParticipantId=<soiPart>, receiveParticipantId=<mobileNetworkPart>)
#    -> each call returns the created message id (m1, m2, m3) and the lifelines it created

# 3. verify
get_interaction_structure(interactionId=<interaction>)       # lifelines represents + messages wired

# 4. diagram (sequence, marked SAF_P4_PCXI; under the Interaction)
saf_create_diagram(name="FFDS Physical Context Interaction", parentId=<interaction>, viewpoint="P4_PCXI",
                  elementIds=[<interaction>, <lifelineSoi>, <lifelinePowerGrid>,
                              <lifelineMobileNetwork>])
#    -> returns { diagramId, relationshipsSkipped, shapesSkipped }

# 5. message arrows (full temporal chain)
diagram_add_sequence_message(diagramId=<diagramId>,
  messages=[{messageId=<m1>, sort="synchcall"},
            {messageId=<m2>, sort="synchcall", insertAfter=<m1>},
            {messageId=<m3>, sort="synchcall", insertAfter=<m2>}])
```

## Verify

- `get_interaction_structure(<interaction>)` → every lifeline's `represents` points at a
  role part property of the context (a Property/Port, never a block), and every message
  has its send + receive ends wired.
- `get_stereotype_tags(<interaction>)` / the lifelines / the messages → **no SAF
  stereotype** (the UML metaclasses are the realization); the diagram is the element
  marked `SAF_P4_PCXI` (a view of this viewpoint).
- `get_block_structure(<context>)` → the SoI role carries `SAF_PhysicalContextRole_SoI`
  and the element roles carry `SAF_PhysicalContextRole`.
- `saf_check_consistency` → no orphan concepts / broken chains.

## Who it's for / what it answers

- **Stakeholders:** Acquirer, Customer, Hardware Developer, IV&V Engineer, Operator,
  Safety Expert, Security Expert, Software Developer, System Architect, User.
- **Answers:** How do the physical system elements interact to provide the system
  function? What is the sequence of interactions among the system and context elements
  on physical level?
