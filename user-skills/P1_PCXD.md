# P1_PCXD — Physical Context Definition (view)

**Grid cell:** Physical domain × Context & Exchange (aspect 1) · **Maturity:** released
**Presentation:** a Block Definition Diagram (BDD) per context featuring: one block =
the Physical System (the SoI), one block = the specific Physical System Context, and
several blocks = the Physical Context Elements (Physical User / Physical External
System / Physical Environment), with composition relationships attaching the elements
+ the system to the context block.
**What a view gives you:** a BDD of where your physical system sits in one concrete
physical setting — the system's boundary and the external physical entities (users,
external physical systems, environmental conditions) it interacts with in that context.

> This is a recipe for a **modeler building a system model**: it tells you how to
> create one *view* of the Physical Context Definition viewpoint in your own model,
> using the SAF profile. It does not add anything to the spec.

## Purpose / when to use

You use this view to define, at the physical level, how your system is embedded in a
**specific physical context**: the setting in which the system is placed and utilized,
and the external physical entities it interacts with there — physical users, external
physical systems (power grid, mobile network, fresh-water system, …), and
environmental conditions (air, dirt, sun, road, …). Make **one view per physical
context** you care about (e.g. "fire station context", "mobile deployment context").

## Preconditions

- A top-level **Physical System (SoI) block** for your system. (Reuse it; if it doesn't
  exist, create one.)
- **No per-viewpoint package** (Rule 2 in `AGENTS.md`). Put the elements in an
  existing package (your system's package, or a context package you already use).

## Step 0 — Reuse check (always do this first)

A context block — and a BDD view of it — may **already exist**. Look before you create:

1. `find_elements_by_type(stereotype="SAF_PhysicalContext")` → existing context blocks.
2. Find existing views of this viewpoint: a BDD marked `SAF_P1_PCXD`
   (`saf_get_viewpoint_views(domain="P")` or `find_elements_by_type(stereotype="SAF_P1_PCXD")`).
3. `find_elements_by_type(stereotype="SAF_PhysicalSystem")` → your SoI block (and any
   external physical systems already typed this way — they carry the same stereotype).

- **If a context block + BDD for the context you want already exists → extend it**: add the
  new context elements / roles to the existing view.
- **Otherwise → create a new context block and a new view** (steps below).

## Create the view

### Elements to model

| Element | Create via | SAF stereotype | Meaning in your model |
|---|---|---|---|
| Your system of interest (SoI) | `saf_create_element(kind="physical_system")` — or reuse an existing block | `SAF_PhysicalSystem` | the abstract physical structure of the system you are modeling |
| The addressed context | `saf_create_element(kind="physical_system_context")` | `SAF_PhysicalContext` | the specific physical setting the system is embedded and utilized in (one per context) |
| Each external physical system | `saf_create_element(kind="physical_external_system")` | `SAF_PhysicalSystem` | a physical system outside the SoI that the system interacts with (power grid, mobile network, fresh-water system, …) |
| Each human actor | `saf_create_element(kind="physical_user")` | `SAF_PhysicalUser` | a human outside the SOI scope who interacts with the physical system |
| Each environmental condition | `saf_create_element(kind="physical_environment")` | `SAF_PhysicalEnvironment` | air, dirt, sun, road, … |
| SoI's membership in the context | part (Property) of the context block | `SAF_PhysicalContextRole_SoI` (+ `PartProperty`) | the composition that places the physical system in the context |
| Each context element's membership | part (Property) of the context block | `SAF_PhysicalContextRole` (+ `PartProperty`) | the composition that places a context element in the context |

### Build steps

1. **SoI block** — reuse the existing physical-system block; if it lacks the
   stereotype,
   `apply_stereotype(elementId=<soi>, name="SAF_PhysicalSystem")`. If none
   exists, `saf_create_element(kind="physical_system", name="<System>", parentId=<pkg>)`.
2. **Context block** — `saf_create_element(kind="physical_system_context", name="<Context> Context", parentId=<existing package>)`.
3. **Context element blocks** — create only the ones that apply:
   - external physical system → `saf_create_element(kind="physical_external_system", name="PowerGrid", parentId=<pkg>)`
   - human actor → `saf_create_element(kind="physical_user", name="Firefighter", parentId=<pkg>)`
   - environmental condition → `saf_create_element(kind="physical_environment", name="Road", parentId=<pkg>)`
4. **Place them in the context (composition)** — make the SoI and each element a *part*
   of the context block:
   - `create_part(wholeBlockId=<context>, name="soi", partTypeBlockId=<soi>, roleStereotype="SAF_PhysicalContextRole_SoI")`
   - `create_part(wholeBlockId=<context>, name="powerGrid", partTypeBlockId=<powerGrid>, roleStereotype="SAF_PhysicalContextRole")`
   - … one per context element.
   `create_part` (default `aggregation="composite"`) applies `PartProperty` and
   auto-creates the companion composition Association — the BDD line with the
   diamond on the context's end ("the SoI is identified by the part stereotype").
   Do **not** also call `create_relationship(type="composition")` for the same pair.
5. **Draw the BDD** — `saf_create_diagram(name="<Context> Physical Context Definition", parentId=<pkg>, viewpoint="P1_PCXD", elementIds=[<context>, <soi>, <each element>])`.
   The `viewpoint` fixes the diagram kind (BDD) and marks the diagram with the view
   stereotype `SAF_P1_PCXD`. Pass the blocks (classifiers) in `elementIds`; the role
   parts are internal structure and are not BDD shapes.
6. **Draw the composition lines** — `saf_add_relationship_paths(diagramId=<diagram>, relationshipIds=<the relationshipsSkipped returned by step 5>)`.

## How it looks when done

A BDD with the context block, the SoI physical system block, and the context-element
blocks (users, external physical systems, environments), and composition edges (diamond
on the context side) from the context to the SoI and to each element. Reference diagram:

- Worked example: `../src/diagrams/examples_md/exa_2021x_2_8710274_1695638583390_640589_60728.svg` (FFDS_POC System Physical Context Definition).

## Tool-call sketch (copy this; resolve every ID by name in-session)

```text
# 0. reuse
find_elements_by_type(stereotype="SAF_PhysicalContext")    # existing context blocks
find_elements_by_type(stereotype="SAF_PhysicalSystem")      # SoI + external physical systems

# 2. context block
saf_create_element(kind="physical_system_context", name="Fire Station Context", parentId=<pkg>)

# 3. context elements (only those that apply)
saf_create_element(kind="physical_external_system", name="PowerGrid",   parentId=<pkg>)
saf_create_element(kind="physical_user",            name="Firefighter", parentId=<pkg>)
saf_create_element(kind="physical_environment",     name="Road",        parentId=<pkg>)

# 4. roles = composition (parts of the context)
create_part(wholeBlockId=<context>, name="soi",         partTypeBlockId=<soi>,         roleStereotype="SAF_PhysicalContextRole_SoI")
create_part(wholeBlockId=<context>, name="powerGrid",   partTypeBlockId=<powerGrid>,   roleStereotype="SAF_PhysicalContextRole")
create_part(wholeBlockId=<context>, name="firefighter", partTypeBlockId=<firefighter>, roleStereotype="SAF_PhysicalContextRole")
create_part(wholeBlockId=<context>, name="road",        partTypeBlockId=<road>,        roleStereotype="SAF_PhysicalContextRole")

# 5. diagram (BDD, marked SAF_P1_PCXD)
saf_create_diagram(name="Fire Station Physical Context Definition", parentId=<pkg>, viewpoint="P1_PCXD",
                  elementIds=[<context>, <soi>, <powerGrid>, <firefighter>, <road>])
#    -> returns { diagramId, relationshipsSkipped }

# 6. composition lines
saf_add_relationship_paths(diagramId=<diagramId>, relationshipIds=<relationshipsSkipped>)
```

## Verify

- `get_block_structure(<context>)` → the context's parts (the roles) with their types and the
  `SAF_PhysicalContextRole*` stereotypes are present.
- `get_stereotype_tags(<context>)` → has `SAF_PhysicalContext`; the SoI and external-system
  blocks have `SAF_PhysicalSystem`, users have `SAF_PhysicalUser`, environments
  `SAF_PhysicalEnvironment`.
- The BDD is marked `SAF_P1_PCXD` (a view of this viewpoint) and shows the composition lines.
- `saf_check_consistency` → no orphan concepts / broken chains.

## Who it's for / what it answers

- **Stakeholders:** Acquirer, Customer, IV&V Engineer, Safety Expert, Security Expert,
  Supplier, System Architect.
- **Answers:** Which external physical entities does the system interact with in the
  given context? Which are the contexts the system is embedded and utilized in? Which
  interface partners does the system have?
