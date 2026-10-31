# C4_SCXI — System Context Interaction (view)

**Grid cell:** Conceptual domain × Interaction & Collaboration (aspect 4) · **Maturity:** released
**Presentation:** a sequence diagram — flow of control between SOI and Context Elements
Roles of a System Context to achieve one outcome of a System Use Case; the lifelines'
representatives are part properties typed by System Context Elements. The scenario may
refine a System Use Case.
**What a view gives you:** a UML sequence diagram of one scenario at the conceptual
level: the SOI and the context elements (in their context roles) as lifelines, and the
ordered messages (signals + the items conveyed) between them that achieve one outcome
of a system use case.

> This is a recipe for a **modeler building a system model**: it tells you how to
> create one *view* of the System Context Interaction viewpoint in your own
> model, using the SAF profile. It does not add anything to the spec.

## Purpose / when to use

You use this view to capture, in one **system context**, the ordered sequence of
exchanges between the **SOI** and the **context elements** (users, external systems,
environmental conditions) that achieves **one outcome of a system use case** — how the
system is used and interacts with the other external systems to satisfy user needs, and
what the necessary response time for an interface or a service is. Each view is **one
scenario** (`system_context_interaction_scenario`, a UML *Interaction*) over the
context's role parts, with the messages
(`system_context_chronological_message`, UML *Message*) in temporal order. Make
**one view per scenario/outcome** you care about; a scenario may refine a System
Use Case.

## Preconditions

- The **System Context Definition** view (C1_SCXD) is **required**: the context block
  and its role part properties — the SOI role (`SAF_ConceptualContextRole_SoI`) and
  the context-element roles (`SAF_ConceptualContextRole`). Those **role parts are the
  lifeline representatives** of this view; a lifeline represents a Property/Port, never
  a block.
- The **System Process Viewpoint** is **recommended** first — it frames the process
  the scenario's messages realize.
- **No per-viewpoint package** (Rule 2 in `AGENTS.md`). The Interaction is owned by a
  classifier — put it under the context block (or your existing package), never in a
  package created for the viewpoint.

## Step 0 — Reuse check (always do this first)

An Interaction — and a sequence diagram of it — may **already exist**. Look before you create:

1. Find existing views of this viewpoint: a sequence diagram marked `SAF_C4_SCXI`
   (`saf_get_viewpoint_views(domain="C")` or `find_elements_by_type(stereotype="SAF_C4_SCXI")`).
2. `find_elements_by_type(stereotype="SAF_ConceptualContext")` → your context block.
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
| The interaction scenario | `create_element(type="interaction", name="<Scenario>", parentId=<context>)` | — none | one scenario: an ordered sequence of exchanges between participants to achieve one outcome of a system use case (`system_context_interaction_scenario`, realized as a UML *Interaction*) |
| Each participant (lifeline) | created automatically by `set_sequence_message_ends` — `represents` a role part property of the context | — none | a system context role participates in the scenario (`system_context_scenario_participation`, realized as a UML *Lifeline*) |
| Each message | one `set_sequence_message_ends` call per message | — none | an ordered exchange between two participants (`system_context_chronological_message`, realized as a UML *Message*) |
| The SOI's role (lifeline representative) | **reuse** — the SOI role part already created in the C1_SCXD view (`create_part(…, roleStereotype="SAF_ConceptualContextRole_SoI")`) | `SAF_ConceptualContextRole_SoI` (+ `PartProperty`) | the SOI's participation in the scenario — a Property/Port of the context, never a block |
| Each context element's role (lifeline representative) | **reuse** — the element role parts already created in the C1_SCXD view (`create_part(…, roleStereotype="SAF_ConceptualContextRole")`) | `SAF_ConceptualContextRole` (+ `PartProperty`) | a context element's (user / external system / environment's) participation in the scenario |

> **Why no `apply_stereotype` on scenario / lifeline / message:** for this viewpoint
> the UML metaclasses (`Interaction`, `Lifeline`, `Message`) **are** the realization of
> the SAF concepts — no SAF stereotype is stamped on them. The viewpoint stereotype
> appears **only on the diagram** (`SAF_C4_SCXI`, applied by
> `saf_create_diagram(viewpoint=…)`).

### Build steps

1. **Role parts (lifeline representatives)** — reuse them from the C1_SCXD view:
   `get_block_structure(<context>)` lists the context's role part properties — the SOI
   role (`SAF_ConceptualContextRole_SoI`) and each context-element role
   (`SAF_ConceptualContextRole`); these are the only things a lifeline may represent.
   If a context element that takes part in your scenario is missing from the context,
   add it there first
   (`create_part(wholeBlockId=<context>, name="<role>", partTypeBlockId=<element>, roleStereotype="SAF_ConceptualContextRole")`)
   and extend the C1_SCXD view.
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
   `saf_create_diagram(name="<Scenario>", parentId=<interaction>, viewpoint="C4_SCXI", elementIds=[<interaction>, <each lifeline>])`.
   The diagram sits **under the Interaction**; `elementIds` = the Interaction + each
   Lifeline — do **not** pass the Messages. The `viewpoint` fixes the diagram kind
   (sequence) and marks the diagram `SAF_C4_SCXI`.
6. **Draw the message arrows** —
   `diagram_add_sequence_message(diagramId=<diagram>, messages=[{messageId=<m1>, sort="synchcall"}, {messageId=<m2>, sort="synchcall", insertAfter=<m1>}, …])`
   — the full temporal chain; every entry after the first carries `insertAfter` = the
   previous message's id. `sort` ∈ `asynchcall | synchcall | asynchsignal | reply | createmessage | deletemessage`.

## How it looks when done

A sequence diagram owned by the Interaction: one lifeline per participating role, the
representatives shown as named part properties (`op : Operator`, `SoI : FFDS`,
`fds : Fire Department System`, …), and numbered message arrows in temporal order —
signals between the roles, each with the items it conveys annotated — plus `alt`
fragments for the alternative branches of the scenario. Reference diagram (worked
example):

- `../src/diagrams/examples_md/exa_19_0_3_6d8019d_1588607783346_352662_350.svg`
  (FFDS Context Interaction — SOI + operator/maintainer/external-system lifelines,
  ten messages, `alt [confirmed fire] / [danger of fire] / [else]`).

## Tool-call sketch (copy this; resolve every ID by name in-session)

```text
# 0. reuse
saf_get_viewpoint_views(domain="C")                          # existing views of this viewpoint
find_elements_by_type(stereotype="SAF_ConceptualContext")    # the system context block
get_block_structure(<context>)                               # soi part + element parts = lifeline representatives

# 1. interaction (under the context block)
create_element(type="interaction", name="FFDS Context Interaction", parentId=<context>)
#    -> <interaction>

# 2. messages (one call each; lifelines are created when a part is first used)
set_sequence_message_ends(interactionId=<interaction>, name="Sig StartTheSystem",
                          sendParticipantId=<operatorPart>, receiveParticipantId=<soiPart>)
set_sequence_message_ends(interactionId=<interaction>, name="Fire alert",
                          sendParticipantId=<soiPart>, receiveParticipantId=<fdsPart>)
set_sequence_message_ends(interactionId=<interaction>, name="Fire warning",
                          sendParticipantId=<soiPart>, receiveParticipantId=<operatorPart>)
#    -> each call returns the created message id (m1, m2, m3) and the lifelines it created

# 3. verify
get_interaction_structure(interactionId=<interaction>)       # lifelines represents + messages wired

# 4. diagram (sequence, marked SAF_C4_SCXI; under the Interaction)
saf_create_diagram(name="FFDS Context Interaction", parentId=<interaction>, viewpoint="C4_SCXI",
                  elementIds=[<interaction>, <lifelineOperator>, <lifelineSoi>,
                              <lifelineFds>])
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
  marked `SAF_C4_SCXI` (a view of this viewpoint).
- `get_block_structure(<context>)` → the SOI role carries `SAF_ConceptualContextRole_SoI`
  and the element roles carry `SAF_ConceptualContextRole`.
- `saf_check_consistency` → no orphan concepts / broken chains.

## Who it's for / what it answers

- **Stakeholders:** Acquirer, Customer, Hardware Developer, IV&V Engineer, Operator,
  Safety Expert, Security Expert, Software Developer, System Architect, User.
- **Answers:** How is the system being used / utilized and interacting with other
  external systems to satisfy user needs? What is the necessary response time for an
  interface or a service? What is the sequence of interactions among the system and
  context elements on conceptual level?
