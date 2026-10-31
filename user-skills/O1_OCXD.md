# O1_OCXD — Operational Context Definition (view)

**Grid cell:** Operational domain × Context & Exchange (aspect 1) · **Maturity:** released
**Presentation:** a Block Definition Diagram (BDD) featuring the identified Operational
Performers playing a role in the Operational Context.
**What a view gives you:** a BDD of one specific operational context — the performer your
system realizes, and the other performers (people, organizations, other systems) that must
take part to operate the solution in that scenario.

> This is a recipe for a **modeler building a system model**: it tells you how to
> create one *view* of the Operational Context Definition viewpoint in your own model,
> using the SAF profile. It does not add anything to the spec.

## Purpose / when to use

You use this view to define, at the operational level, **a specific operational context**
in which your system is used: a separate usage scenario with a specific configuration of
Operational Performers exhibiting a specific identified Operational Capability. It makes
explicit the performer your system realizes (the SoI performer) and every external
performer needed to operate the solution in that scenario — the people, organizational
units, and other systems involved. Make **one view per operational context** you care
about (e.g. a "fire response" scenario, a "maintenance" scenario).

## Preconditions

- A top-level **block for your SoI's performer** (the performer your system realizes).
  (Reuse it; if it doesn't exist, create one.)
- An **Operational Performer Definition** view is **required** first (a separate
  viewpoint, not a context view) — it defines the operational performers (the SoI
  performer + the external performers) that this view places in the context. This view
  references those performer blocks; it does not recreate the performers' definitions.
- **No per-viewpoint package** (Rule 2 in `AGENTS.md`). Put the elements in an
  existing package (your system's package, or a context package you already use).

## Step 0 — Reuse check (always do this first)

A context block — and a BDD view of it — may **already exist**. Look before you create:

1. `find_elements_by_type(stereotype="SAF_OperationalContext")` → existing context blocks.
2. Find existing views of this viewpoint: a BDD marked `SAF_O1_OCXD`
   (`saf_get_viewpoint_views(domain="O")` or `find_elements_by_type(stereotype="SAF_O1_OCXD")`).
3. `find_elements_by_type(stereotype="SAF_OperationalPerformer")` → your SoI's performer
   block (and any external performers already typed this way).

- **If a context block + BDD for the context you want already exists → extend it**: add the
  new performers / roles to the existing view.
- **Otherwise → create a new context block and a new view** (steps below).

## Create the view

### Elements to model

| Element | Create via | SAF stereotype | Meaning in your model |
|---|---|---|---|
| Your SoI's performer | `saf_create_element(kind="operational_performer")` — or reuse an existing block | `SAF_OperationalPerformer` | the performer your system realizes — the one this view is about; name it after the addressed performer/system |
| The addressed context | `saf_create_element(kind="operational_context")` | `SAF_OperationalContext` | a separate usage scenario with a specific configuration of performers exhibiting a specific identified capability (one per context) |
| Each external performer | `saf_create_element(kind="operational_performer")` | `SAF_OperationalPerformer` | any org unit / person / system outside the SoI capable of performing operational process activities in the scenario (crew, monitoring station, other system, …) |
| SoI performer's membership in the context | part (Property) of the context block | `SAF_OperationalContextRole` (+ `PartProperty`) | the composition that places the SoI performer in the context |
| Each external performer's membership | part (Property) of the context block | `SAF_OperationalContextRole` (+ `PartProperty`) | the composition that places an external performer in the context |

> **One role concept for all roles (unlike the Conceptual/Physical domains):** the
> Operational domain has a *single* role concept — the **Operational Context Role**.
> Every role part in the context — the SoI performer's part AND each external
> performer's part — carries `roleStereotype="SAF_OperationalContextRole"`. There is
> **no** separate `…_SoI` role stereotype here. Distinguish the SoI part by **name**:
> name it after the addressed performer/system (e.g. `fireDetectionSystem`), not
> `soi`.

### Build steps

1. **SoI performer block** — reuse the existing performer block for the system you
   model; if it lacks the stereotype,
   `apply_stereotype(elementId=<soiPerformer>, name="SAF_OperationalPerformer")`. If
   none exists, `saf_create_element(kind="operational_performer", name="<System>", parentId=<pkg>)`.
2. **Context block** — `saf_create_element(kind="operational_context", name="<Context>", parentId=<existing package>)`.
3. **External performer blocks** — create only the ones that apply:
   `saf_create_element(kind="operational_performer", name="MaintenanceCrew", parentId=<pkg>)`,
   … one per external performer.
4. **Place them in the context (composition)** — make the SoI performer and each
   external performer a *part* of the context block:
   - `create_part(wholeBlockId=<context>, name="<soiPerformer>", partTypeBlockId=<soiPerformer>, roleStereotype="SAF_OperationalContextRole")`
   - `create_part(wholeBlockId=<context>, name="maintenanceCrew", partTypeBlockId=<maintenanceCrew>, roleStereotype="SAF_OperationalContextRole")`
   - … one per performer.
   `create_part` (default `aggregation="composite"`) applies `PartProperty` and
   auto-creates the companion composition Association — the BDD line with the
   diamond on the context's end ("the performer plays the role in the context").
   Do **not** also call `create_relationship(type="composition")` for the same pair.
5. **Draw the BDD** — `saf_create_diagram(name="<Context> Context Definition", parentId=<pkg>, viewpoint="O1_OCXD", elementIds=[<context>, <soiPerformer>, <each performer>])`.
   The `viewpoint` fixes the diagram kind (BDD) and marks the diagram with the view
   stereotype `SAF_O1_OCXD`. Pass the blocks (classifiers) in `elementIds`; the role
   parts are internal structure and are not BDD shapes.
6. **Draw the composition lines** — `saf_add_relationship_paths(diagramId=<diagram>, relationshipIds=<the relationshipsSkipped returned by step 5>)`.

## How it looks when done

A BDD with the context block, the SoI performer block, and the external performer
blocks, and composition edges (diamond on the context side) from the context to the
SoI performer and to each external performer. Reference diagram:

- Worked example: `../src/diagrams/examples_md/exa_19_0_3_6d8019d_1600338266852_212206_17675.svg` (FDN Context Definition).

## Tool-call sketch (copy this; resolve every ID by name in-session)

```text
# 0. reuse
find_elements_by_type(stereotype="SAF_OperationalContext")    # existing context blocks
find_elements_by_type(stereotype="SAF_OperationalPerformer")  # SoI + external performers

# 2. context block
saf_create_element(kind="operational_context", name="Fire Detection & Notification Context", parentId=<pkg>)

# 3. external performers (only those that apply)
saf_create_element(kind="operational_performer", name="MaintenanceCrew",  parentId=<pkg>)
saf_create_element(kind="operational_performer", name="MonitoringStation", parentId=<pkg>)

# 4. roles = composition (parts of the context) — ONE role stereotype for every role
create_part(wholeBlockId=<context>, name="fireDetectionSystem", partTypeBlockId=<fireDetectionSystem>, roleStereotype="SAF_OperationalContextRole")
create_part(wholeBlockId=<context>, name="maintenanceCrew",     partTypeBlockId=<maintenanceCrew>,     roleStereotype="SAF_OperationalContextRole")
create_part(wholeBlockId=<context>, name="monitoringStation",   partTypeBlockId=<monitoringStation>,   roleStereotype="SAF_OperationalContextRole")

# 5. diagram (BDD, marked SAF_O1_OCXD)
saf_create_diagram(name="Fire Detection & Notification Context Definition", parentId=<pkg>, viewpoint="O1_OCXD",
                  elementIds=[<context>, <fireDetectionSystem>, <maintenanceCrew>, <monitoringStation>])
#    -> returns { diagramId, relationshipsSkipped }

# 6. composition lines
saf_add_relationship_paths(diagramId=<diagramId>, relationshipIds=<relationshipsSkipped>)
```

## Verify

- `get_block_structure(<context>)` → the context's parts (the roles) with their types and the
  `SAF_OperationalContextRole` stereotype are present on every part.
- `get_stereotype_tags(<context>)` → has `SAF_OperationalContext`; the SoI performer and each
  external performer block have `SAF_OperationalPerformer`.
- The BDD is marked `SAF_O1_OCXD` (a view of this viewpoint) and shows the composition lines.
- `saf_check_consistency` → no orphan concepts / broken chains.

## Who it's for / what it answers

- **Stakeholders:** Acquirer, Customer, Supplier, System Architect.
- **Answers:** Which operational environment to support? Which operational context to
  achieve the operational story? Which performers/resources are necessary to operate
  the solution? Who are the (major) stakeholders involved?
