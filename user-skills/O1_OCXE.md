# O1_OCXE — Operational Context Exchange (view)

**Grid cell:** Operational domain × Context & Exchange (aspect 1) · **Maturity:** released
**Presentation:** an Internal Block Diagram (IBD) associated to the operational context,
featuring the interconnected operational performers in their roles and the operational
item exchange per operational connection — or a table.
**What a view gives you:** an IBD of one operational context: your operational performer
(the SoI) and the external performers, in their context roles, connected to each other
by operational connections, with the operational item exchanges flowing over each
connection.

> This is a recipe for a **modeler building a system model**: it tells you how to
> create one *view* of the Operational Context Exchange viewpoint in your own model,
> using the SAF profile. It does not add anything to the spec.

## Purpose / when to use

You use this view to specify, at the operational level, **what the performers of one
operational context exchange with each other**: which operational exchanges (data,
information, material, energy, …) each operational performer consumes or provides, and
over which operational connection. Make **one view per context** — it is built directly
on the context block of your **Operational Context Definition** view (O1_OCXD). The
conceptual-level **System Context Exchange** view (C1_SCXE) later realizes these
operational exchanges with actual interfaces.

## Preconditions

- The **Operational Context Definition** view (O1_OCXD) **must** exist: the
  `SAF_OperationalContext` block with the SoI performer part and each external performer
  part already placed as role parts. This view is the **internal structure** of that
  block — the role parts are its parts.
- The **Operational Process Viewpoint** is **recommended** — it frames the operational
  process activities that the exchanges support. It is not strictly required.
- **No per-viewpoint package** (Rule 2 in `AGENTS.md`). The ports, connections, and
  item flows live on / inside the existing context block and its package.

## Step 0 — Reuse check (always do this first)

The context block — and an exchange view (IBD) of it — may **already exist**. Look
before you create:

1. `find_elements_by_type(stereotype="SAF_OperationalContext")` → existing context blocks.
2. `get_block_structure(<context>)` → the context's role parts (stereotyped
   `SAF_OperationalContextRole`) and the ports / connectors they already carry.
3. Find existing views of this viewpoint: an IBD marked `SAF_O1_OCXE`
   (`saf_get_viewpoint_views(domain="O")` or `find_elements_by_type(stereotype="SAF_O1_OCXE")`).

- **If a context block + IBD for the context you want already exists → extend it**: add
  the new performer parts / connections / item exchanges to the existing IBD, reusing the
  existing role parts.
- **If the context block exists but has no exchange view yet → build the IBD** (steps below).
- **If the context block itself is missing → do the O1_OCXD recipe first.** A second
  SOI / context / performer element is a bug.

## Create the view

### Elements to model

| Element | Create via | SAF stereotype | Meaning in your model |
|---|---|---|---|
| The addressed context (the IBD's owner) | reuse the O1_OCXD context block | `SAF_OperationalContext` | the whole block whose internal structure this view draws |
| Each performer part (SoI + external) | reuse the O1_OCXD role parts | `SAF_OperationalContextRole` | an operational performer in its role in the context — a part of the IBD |
| Each interaction point on a performer | `create_element(type="Port", name=…, parentId=<performer block>, stereotype="ProxyPort")` | `ProxyPort` | where that performer offers or takes an exchange in this context |
| Operational connection | `create_connector(wholeBlockId=<context>, …)` | **Connector** (realizes Operational Connection) | the connection between two context roles that allows item exchange |
| The type of the exchange | `saf_create_element(kind="operational_exchange_type")` | `SAF_OperationalExchangeType` | what is exchanged between the two roles (data, material, energy, …) |
| Operational item exchange | `create_information_flow(conveyedItemId=<exchangeType>, realizingConnectorId=<connection>)` | **ItemFlow** (realizes Operational Item Exchange) | the exchange that takes place on the connection |

> **ProxyPort:** the spec's interaction point is realized by a ProxyPort. Create the
> port as a `Port` carrying the SysML `ProxyPort` stereotype:
> `create_element(type="Port", name=…, parentId=<partType>, stereotype="ProxyPort")`.
> `ProxyPort` comes from the SysML profile (like `Block`); the MCP surface resolves it
> by name, so the single call creates the port and applies the stereotype.

### Build steps

1. **Get the context** — from Step 0: the context block, its SoI performer part, and the
   external performer parts (`get_block_structure(<context>)` lists the role parts).
2. **Per interface** (SoI ↔ one external performer):
   - **The SoI's interaction point** — `create_element(type="Port", name="<soiPort>", parentId=<soiBlock>, stereotype="ProxyPort")`.
   - **The external performer's interaction point** — `create_element(type="Port", name="<extPort>", parentId=<extBlock>, stereotype="ProxyPort")`.
   - **The connection** — `create_connector(wholeBlockId=<context>, end1PartId=<soiPart>, end1PortId=<soiPort>, end2PartId=<extPart>, end2PortId=<extPort>)` → the Connector between the two role parts' ports.
   - **The exchange type** — `saf_create_element(kind="operational_exchange_type", name="<Exchange>", parentId=<pkg>, documentation=...)`. **Reuse before creating:** exchange types are shared vocabulary — first check whether an existing one fits (read the documentation of the exchange types already in the model, and check what they type); if one exactly fits the item, reuse it. Don't reinvent the wheel.
   - **The item exchange** — `create_information_flow(name="<exchange>", parentId=<pkg>, sourceId=<soiPort>, targetId=<extPort>, conveyedItemId=<exchangeType>, realizingConnectorId=<connection>)`. Set `sourceId` to the port of the performer that **provides** the item.
3. **Draw the IBD** — `saf_create_diagram(name="<Context> Context Exchange", parentId=<context>, viewpoint="O1_OCXE", elementIds=[<soiPart>, <extPart>, …])`.
   The `viewpoint` fixes the diagram kind (IBD) and marks the diagram with the view
   stereotype `SAF_O1_OCXE`. `parentId` is the context block (it owns the parts) and
   `elementIds` are the role part properties to show. In selective mode (`elementIds`
   given) only the named parts become shapes: the connectors are neither drawn nor
   reported in `relationshipsSkipped`, so draw them explicitly in step 4. (The item
   exchanges need no diagram symbol of their own — they show on their connectors.)
4. **Draw the connectors** — `saf_add_relationship_paths(diagramId=<diagram>, relationshipIds=[<connection1>, <connection2>, …])`.
   Pass **every** Connector created in step 2. This draws each connector path on the IBD.
   Do **not** add the item exchanges (InformationFlow) as separate symbols: an item flow
   that realizes a connector is shown *on* that connector (SysML draws the item-exchange
   arrow on the connector itself), so a separate item-flow line would be redundant.
   (Do not rely on `relationshipsSkipped` here — in selective mode it is empty.)

## How it looks when done

An IBD of the context block with the SoI performer part and the external performer parts
inside it: a small port on each part for every interface, and a connector joining a SoI
port to an external port. Each connector carries its item-exchange arrow (the item flow
that realizes it) — no separate item-flow line is drawn.

- Worked example: `../src/diagrams/examples_md/exa_19_0_4_6d8019d_1629636631575_609870_17878.svg` (FDN Context Exchange).

A tabular form is also acceptable: a table listing the exchanged item, the two performers
(in their roles) that exchange it, and the operational connection it takes place on.

## Tool-call sketch (copy this; resolve every ID by name in-session)

```text
# 0. reuse
find_elements_by_type(stereotype="SAF_OperationalContext")   # existing context blocks
find_elements_by_type(stereotype="SAF_OperationalExchangeType")   # existing exchange types — read docs; reuse if one fits
get_block_structure(<context>)                               # role parts + existing ports/connectors
saf_get_viewpoint_views(domain="O")                           # existing SAF_O1_OCXE views

# 2. per interface (SoI <-> one external performer)
create_element(type="Port", name="soi.<exchange>", parentId=<soiBlock>, stereotype="ProxyPort")
create_element(type="Port", name="ext.<exchange>", parentId=<extBlock>, stereotype="ProxyPort")
create_connector(wholeBlockId=<context>, end1PartId=<soiPart>, end1PortId=<soiPort>,
                 end2PartId=<extPart>, end2PortId=<extPort>)                    # -> <connection>
saf_create_element(kind="operational_exchange_type", name="<Exchange>", parentId=<pkg>)
create_information_flow(name="<exchange>", parentId=<pkg>, sourceId=<soiPort>, targetId=<extPort>,
                        conveyedItemId=<exchangeType>, realizingConnectorId=<connection>)
#   ... repeat for every interface

# 3. diagram (IBD, marked SAF_O1_OCXE)
saf_create_diagram(name="Factory Context Exchange", parentId=<context>, viewpoint="O1_OCXE",
                  elementIds=[<soiPart>, <extPart>, …])
#    -> returns { diagramId }
#    In selective mode the connectors are NOT drawn here,
#    and relationshipsSkipped is empty -> draw them explicitly in step 4.

# 4. draw every connector (item flows show on their connectors — no separate symbol)
saf_add_relationship_paths(diagramId=<diagramId>,
                           relationshipIds=[<connection1>, <connection2>, …])
```

## Verify

- `get_block_structure(<context>)` → the role parts, each part's ports, and the
  connectors (with directions) are present.
- `get_stereotype_tags(<context>)` → has `SAF_OperationalContext`; each role part has
  `SAF_OperationalContextRole`; each exchange type has `SAF_OperationalExchangeType`.
- The IBD is marked `SAF_O1_OCXE` (a view of this viewpoint) and shows the ports, the
  connectors, and the item exchanges.
- `saf_check_consistency` → no orphan concepts / broken chains.

## Who it's for / what it answers

- **Stakeholders:** Acquirer, Customer, Safety Expert, Security Expert, System Architect.
- **Answers:** Which operational exchanges do operational performers need to consume or
  provide?
