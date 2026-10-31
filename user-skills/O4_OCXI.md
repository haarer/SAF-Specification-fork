# O4_OCXI — Operational Context Interaction (view)

**Grid cell:** Operational domain × Interaction & Collaboration (aspect 4) · **Maturity:** released
**Presentation:** a sequence diagram — flow of control between Operational Performers of an
Operational Context to achieve one outcome of an Operational Story; the lifelines'
representatives are part properties typed by Operational Performers. The scenario may
refine an Operational Story.
**What a view gives you:** a UML sequence diagram of one scenario: the operational
performers (the SoI and the external performers, in their context roles) as lifelines,
and the ordered messages (item/signal exchanges) between them that achieve one outcome
of an operational story — including the alternative threads.

> This is a recipe for a **modeler building a system model**: it tells you how to
> create one *view* of the Operational Context Interaction viewpoint in your own
> model, using the SAF profile. It does not add anything to the spec.

## Purpose / when to use

You use this view to capture, in one **operational context**, the ordered sequence of
exchanges between the operational performers that carries out **one outcome of an
operational story** — the threads of operational process activities (main goal and
alternative threads) that have to be carried out. Each view is **one scenario**
(`operational_interaction_scenario`, a UML *Interaction*) over the context's performer
roles, with the messages (`operational_chronological_message`, UML *Message*) in
temporal order. Make **one view per scenario/outcome** you care about; a scenario may
refine an Operational Story.

## Preconditions

- The **Operational Context Definition** view (O1_OCXD) is **required**: the context
  block and its role part properties (one per operational performer — SoI and
  externals). Those **role parts are the lifeline representatives** of this view; a
  lifeline represents a Property/Port, never a block.
- The **Operational Process Viewpoint** is **recommended** first — it frames the
  process activities the scenario's messages realize.
- **No per-viewpoint package** (Rule 2 in `AGENTS.md`). The Interaction is owned by a
  classifier — put it under the context block (or your existing package), never in a
  package created for the viewpoint.

## Step 0 — Reuse check (always do this first)

An Interaction — and a sequence diagram of it — may **already exist**. Look before you create:

1. Find existing views of this viewpoint: a sequence diagram marked `SAF_O4_OCXI`
   (`saf_get_viewpoint_views(domain="O")` or `find_elements_by_type(stereotype="SAF_O4_OCXI")`).
2. `find_elements_by_type(stereotype="SAF_OperationalContext")` → your context block.
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
| The interaction scenario | `create_element(type="interaction", name="<Scenario>", parentId=<context>)` | — none | one scenario: an ordered sequence of exchanges between participants to achieve one outcome of an operational story (`operational_interaction_scenario`, realized as a UML *Interaction*) |
| Each participant (lifeline) | created automatically by `set_sequence_message_ends` — `represents` a role part property of the context | — none | a context role participates in the scenario (`operational_scenario_participation`, realized as a UML *Lifeline*) |
| Each message | one `set_sequence_message_ends` call per message | — none | an ordered exchange between two participants (`operational_chronological_message`, realized as a UML *Message*) |
| The performers' roles (lifeline representatives) | **reuse** — the role parts already created in the O1_OCXD view (`create_part(…, roleStereotype="SAF_OperationalContextRole")`) | `SAF_OperationalContextRole` (+ `PartProperty`) | the operational performers taking part in the scenario — a Property/Port of the context, never a block |

> **Why no `apply_stereotype` on scenario / lifeline / message:** for this viewpoint
> the UML metaclasses (`Interaction`, `Lifeline`, `Message`) **are** the realization of
> the SAF concepts — no SAF stereotype is stamped on them. The viewpoint stereotype
> appears **only on the diagram** (`SAF_O4_OCXI`, applied by
> `saf_create_diagram(viewpoint=…)`).

### Build steps

1. **Role parts (lifeline representatives)** — reuse them from the O1_OCXD view:
   `get_block_structure(<context>)` lists the context's role part properties; these are
   the only things a lifeline may represent. If a performer that takes part in your
   scenario is missing from the context, add it there first
   (`create_part(wholeBlockId=<context>, name="<role>", partTypeBlockId=<performer>, roleStereotype="SAF_OperationalContextRole")`)
   and extend the O1_OCXD view.
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
   `saf_create_diagram(name="<Scenario>", parentId=<interaction>, viewpoint="O4_OCXI", elementIds=[<interaction>, <each lifeline>])`.
   The diagram sits **under the Interaction**; `elementIds` = the Interaction + each
   Lifeline — do **not** pass the Messages. The `viewpoint` fixes the diagram kind
   (sequence) and marks the diagram `SAF_O4_OCXI`.
6. **Draw the message arrows** —
   `diagram_add_sequence_message(diagramId=<diagram>, messages=[{messageId=<m1>, sort="synchcall"}, {messageId=<m2>, sort="synchcall", insertAfter=<m1>}, …])`
   — the full temporal chain; every entry after the first carries `insertAfter` = the
   previous message's id. `sort` ∈ `asynchcall | synchcall | asynchsignal | reply | createmessage | deletemessage`.

## How it looks when done

A sequence diagram owned by the Interaction: one lifeline per participating performer
role, the performer types shown as `«SAF_OperationalPerformer»` boxes, and numbered
message arrows in temporal order (items/signals exchanged between the roles), with
`alt` fragments for alternative threads of the scenario. Reference diagram (worked
example):

- `../src/diagrams/examples_md/exa_2024x_1_26f0132_1722258766618_9302_15524.svg`
  (Fire Detection and Notification — four performer lifelines, three messages,
  an `alt [true alarm] / [false alarm]` fragment).

## Tool-call sketch (copy this; resolve every ID by name in-session)

```text
# 0. reuse
saf_get_viewpoint_views(domain="O")                          # existing views of this viewpoint
find_elements_by_type(stereotype="SAF_OperationalContext")   # the context block
get_block_structure(<context>)                               # role parts = lifeline representatives

# 1. interaction (under the context block)
create_element(type="interaction", name="Fire Detection and Notification", parentId=<context>)
#    -> <interaction>

# 2. messages (one call each; lifelines are created when a part is first used)
set_sequence_message_ends(interactionId=<interaction>, name="Fire Spark",
                          sendParticipantId=<backpackersPart>, receiveParticipantId=<forestPart>)
set_sequence_message_ends(interactionId=<interaction>, name="Heat & Smoke",
                          sendParticipantId=<forestPart>, receiveParticipantId=<monitoringPart>)
set_sequence_message_ends(interactionId=<interaction>, name="Fire Alert Report",
                          sendParticipantId=<monitoringPart>, receiveParticipantId=<coordinationPart>)
#    -> each call returns the created message id (m1, m2, m3) and the lifelines it created

# 3. verify
get_interaction_structure(interactionId=<interaction>)       # lifelines represents + messages wired

# 4. diagram (sequence, marked SAF_O4_OCXI; under the Interaction)
saf_create_diagram(name="Fire Detection and Notification", parentId=<interaction>, viewpoint="O4_OCXI",
                  elementIds=[<interaction>, <lifelineBackpackers>, <lifelineForest>,
                              <lifelineMonitoring>, <lifelineCoordination>])
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
  marked `SAF_O4_OCXI` (a view of this viewpoint).
- `get_block_structure(<context>)` → the role parts still carry `SAF_OperationalContextRole`.
- `saf_check_consistency` → no orphan concepts / broken chains.

## Who it's for / what it answers

- **Stakeholders:** Acquirer, Customer, System Architect.
- **Answers:** What possible threads of operational process activities have to be
  carried out to achieve the operational story's main and alternative goals?
