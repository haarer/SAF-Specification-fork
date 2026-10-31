# C1_SCXE — System Context Exchange (view)

**Grid cell:** Conceptual domain × Context & Exchange (aspect 1) · **Maturity:** released
**Presentation:** an Internal Block Diagram (IBD) associated to a system context,
featuring the SOI, the system context elements, and the connectors for each identified
interface from the SOI to the respective context elements; an item flow is defined for
each exchange on the identified interface. Ports may be structured; connectors/ports may
reference interface documents. A table is an alternate form.
**What a view gives you:** an IBD of one system context: the SOI part and the external
context-element parts, with the conceptual interfaces between them (the ports), the
connections, and the item exchanges flowing over each connection.

> This is a recipe for a **modeler building a system model**: it tells you how to
> create one *view* of the System Context Exchange viewpoint in your own model,
> using the SAF profile. It does not add anything to the spec.

## Purpose / when to use

You use this view to specify, at the conceptual level, **how your system interacts with
the external entities of a given context**: which conceptual interfaces the system has,
which external conceptual entities it interacts with in that context, and which kind of
conceptual items (energy, material, information, …) are exchanged on each interface —
together with the interface requirements imposed on the system. Make **one view per
context** — it is built directly on the context block of your **System Context
Definition** view (C1_SCXD). It realizes the exchanges sketched at the operational
level in the **Operational Context Exchange** view (O1_OCXE).

## Preconditions

- The **System Context Definition** view (C1_SCXD) **must** exist: the
  `SAF_ConceptualContext` block with the SoI part (`SAF_ConceptualContextRole_SoI`) and
  each external part (`SAF_ConceptualContextRole`) already placed as role parts. This
  view is the **internal structure** of that block — the role parts are its parts.
- The **Operational Context Exchange** view (O1_OCXE) is **recommended** first — it
  frames the operational exchanges that this view realizes. It is not strictly required.
- **No per-viewpoint package** (Rule 2 in `AGENTS.md`). The ports, connections, and
  item flows live on / inside the existing context block and its package.

## Step 0 — Reuse check (always do this first)

The context block — and an exchange view (IBD) of it — may **already exist**. Look
before you create:

1. `find_elements_by_type(stereotype="SAF_ConceptualContext")` → existing context blocks.
2. `get_block_structure(<context>)` → the context's role parts (the
   `SAF_ConceptualContextRole*` parts) and the ports / connectors they already carry.
3. Find existing views of this viewpoint: an IBD marked `SAF_C1_SCXE`
   (`saf_get_viewpoint_views(domain="C")` or `find_elements_by_type(stereotype="SAF_C1_SCXE")`).

- **If a context block + IBD for the context you want already exists → extend it**: add
  the new interfaces (port pair + connection + item exchange) to the existing IBD,
  reusing the existing role parts.
- **If the context block exists but has no exchange view yet → build the IBD** (steps below).
- **If the context block itself is missing → do the C1_SCXD recipe first.** A second
  SOI / context / external element is a bug.

## Create the view

### Elements to model

| Element | Create via | SAF stereotype | Meaning in your model |
|---|---|---|---|
| The addressed context (the IBD's owner) | reuse the C1_SCXD context block | `SAF_ConceptualContext` | the whole block whose internal structure this view draws |
| The SOI part | reuse the C1_SCXD SoI part | `SAF_ConceptualContextRole_SoI` | your system in its role in the context |
| Each context element part | reuse the C1_SCXD role parts | `SAF_ConceptualContextRole` | a user / external system / environment in its role in the context |
| Each exchange item type | `saf_create_element(kind="conceptual_exchange_type", …)` | `SAF_ConceptualExchangeType` | the kind of conceptual item exchanged on an interface — what the flow property and the item flow are typed by |
| Each interface definition | `saf_create_element(kind="conceptual_interaction_point_definition", …)` | `SAF_ConceptualInterfaceDefinition` | the interface between two interaction points — it carries the **flow properties** (the exchange capabilities) |
| Each flow property on an interface | `create_flow_property(blockId=<iface>, typeId=<exchangeItem>, direction=…)` | **FlowProperty** (realizes Conceptual Interaction Point Property) | one exchange capability of the interface: the item type it carries, in a direction |
| Each conceptual interaction point | `create_element(type="Port", name=…, parentId=<block>, stereotype="ProxyPort")` | **Port** with SysML `ProxyPort` (realizes Conceptual Interaction Point) | where a part meets the outside for one identified interface — typed by the interface definition |
| Conceptual connection | `create_connector(wholeBlockId=<context>, …)` | **Connector** (realizes Conceptual Connection) | the connection between a SoI interaction point and an external interaction point |
| Conceptual item exchange | `create_information_flow(…, conveyedItemId=<exchangeItem>, realizingConnectorId=<connection>)` | **ItemFlow** (realizes Conceptual Item Exchange) | the exchange that actually takes place on the connection — conveys the exchange item type |

> **The IBD exchange pattern — interface, flow properties, item flows:**
> - The **interface definition** (`SAF_ConceptualInterfaceDefinition`) is a block that
>   carries **flow properties**. Each flow property is typed by the exchange item type
>   and has a direction (`out`/`in`/`inout`); together they describe the interface's
>   **exchange capabilities** — what it *can* exchange, and in which direction.
> - The **interaction point (port)** is **typed by the interface definition** with
>   `set_type(elementId=<port>, typeId=<interfaceDef>)`, so the part "exposes" that
>   interface.
> - The **item exchange (ItemFlow)** states what is **actually exchanged in this scope
>   (the context)**. Its **conveyed item** is the **exchange item type** — the type of
>   the flow property — **not** the interface definition. Conveying the item flow with
>   the interface definition is conceptually wrong.
>
> Create one interface definition per *kind* of interface (not per port). If the model
> does not track interface definitions, plain `Port`s with an item flow are the minimal
> form. This pattern is shared by every Exchange IBD (context and internal) — see
> `SAF_MODELING.md`.
>
> **ProxyPort:** the spec's Conceptual Interaction Point is realized by a ProxyPort.
> Create the port as a `Port` carrying the SysML `ProxyPort` stereotype:
> `create_element(type="Port", name=..., parentId=<partType>, stereotype="ProxyPort")`.
> `ProxyPort` comes from the SysML profile (like `Block`); the MCP surface resolves
> it by name, so the single call creates the port and applies the stereotype.

### Build steps

1. **Get the context** — from Step 0: the context block, its SoI part, and the external
   context-element parts (`get_block_structure(<context>)` lists the role parts).
2. **Model the exchange** — create the elements the IBD draws (reuse what Step 1 provides):
   - **The exchange item type** — `saf_create_element(kind="conceptual_exchange_type", name="<ExchangeItem>", parentId=<pkg>, documentation=...)`. **Reuse before creating:** exchange types are shared vocabulary — first check whether an existing one fits (read the documentation of the exchange types already in the model, and check what they type); if one exactly fits the item, reuse it. Don't reinvent the wheel.
   - **The interface definition (optional)** — if the model tracks interface definitions: `saf_create_element(kind="conceptual_interaction_point_definition", name="<Interface>", parentId=<pkg>)`, then **its flow property** — `create_flow_property(blockId=<interfaceDef>, typeId=<exchangeItem>, direction="inout")` (one per exchange capability; `out`/`in` for one-way, `inout` for two-way).
   - **The SoI's interaction point** — `create_element(type="Port", name="<soiPort>", parentId=<soiBlock>, stereotype="ProxyPort")`; if there is an interface definition, type it by it: `set_type(elementId=<soiPort>, typeId=<interfaceDef>)`.
   - **The external's interaction point** — `create_element(type="Port", name="<extPort>", parentId=<extBlock>, stereotype="ProxyPort")`; type it by the same interface definition.
   - **The connection** — `create_connector(wholeBlockId=<context>, end1PartId=<soiPart>, end1PortId=<soiPort>, end2PartId=<extPart>, end2PortId=<extPort>)` → the Connector between the two ports.
   - **The item exchange** — `create_information_flow(name="<exchange>", parentId=<pkg>, sourceId=<soiPort>, targetId=<extPort>, conveyedItemId=<exchangeItem>, realizingConnectorId=<connection>)`. The conveyed item is the **exchange item type** (the flow property's type) — never the interface definition. Set `sourceId` to the port of the side that **provides** the item.
3. **Draw the IBD** — `saf_create_diagram(name="<Context> Context Exchange", parentId=<context>, viewpoint="C1_SCXE", elementIds=[<soiPart>, <extPart>, …])`.
   The `viewpoint` fixes the diagram kind (IBD) and marks the diagram with the view
   stereotype `SAF_C1_SCXE`. `parentId` is the context block (it owns the parts) and
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

An IBD of the context block with the SOI part and the context-element parts inside it: a
port on each part for every identified interface, and a connector joining the SOI's port
to the external's port. Each connector carries its item-exchange arrow (the item flow
that realizes it) — no separate item-flow line is drawn. The ports may be structured
(sub-ports) and may be typed by / reference their interface definitions.

- Worked example: `../src/diagrams/examples_md/exa_18_4_3c00182_1480313818211_298959_31400.svg` (FFDS Context Exchange).

A tabular form is also acceptable: a table listing, per interface, the context element,
the port(s), the exchanged item, and the requirements applied to the interface.

## Tool-call sketch (copy this; resolve every ID by name in-session)

```text
# 0. reuse
find_elements_by_type(stereotype="SAF_ConceptualContext")   # existing context blocks
find_elements_by_type(stereotype="SAF_ConceptualExchangeType")   # existing exchange types — read docs; reuse if one fits
get_block_structure(<context>)                              # role parts + existing ports/connectors
saf_get_viewpoint_views(domain="C")                          # existing SAF_C1_SCXE views

# 2. per identified interface (SoI <-> one context element)
saf_create_element(kind="conceptual_exchange_type", name="<ExchangeItem>", parentId=<pkg>)
saf_create_element(kind="conceptual_interaction_point_definition", name="<Interface>", parentId=<pkg>)   # optional
create_flow_property(blockId=<interfaceDef>, typeId=<exchangeItem>, direction="inout")   # optional: needs the interface def
create_element(type="Port", name="soi.<iface>", parentId=<soiBlock>, stereotype="ProxyPort")
create_element(type="Port", name="ext.<iface>", parentId=<extBlock>, stereotype="ProxyPort")
set_type(elementId=<soiPort>, typeId=<interfaceDef>)   # optional: type the port(s) by the interface
set_type(elementId=<extPort>, typeId=<interfaceDef>)
create_connector(wholeBlockId=<context>, end1PartId=<soiPart>, end1PortId=<soiPort>,
                 end2PartId=<extPart>, end2PortId=<extPort>)                    # -> <connection>
create_information_flow(name="<exchange>", parentId=<pkg>, sourceId=<soiPort>, targetId=<extPort>,
                        conveyedItemId=<exchangeItem>, realizingConnectorId=<connection>)
#   conveyedItemId = the exchange item type (the flow property's type) — NOT the interface def

# 3. diagram (IBD, marked SAF_C1_SCXE)
saf_create_diagram(name="Factory Context Exchange", parentId=<context>, viewpoint="C1_SCXE",
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
- `get_stereotype_tags(<context>)` → has `SAF_ConceptualContext`; the SoI part has
  `SAF_ConceptualContextRole_SoI`, the external parts have `SAF_ConceptualContextRole`;
  each interface definition has `SAF_ConceptualInterfaceDefinition`.
- `get_block_structure(<interfaceDef>)` → the flow properties are present (typed by
  the exchange item type, with a direction). Each port is typed by the interface
  definition, and each item flow's conveyed item is the exchange item type — not the
  interface definition.
- The IBD is marked `SAF_C1_SCXE` (a view of this viewpoint) and shows the ports, the
  connectors, and the item exchanges.
- `saf_check_consistency` → no orphan concepts / broken chains.

## Who it's for / what it answers

- **Stakeholders:** Acquirer, Customer, Hardware Developer, IV&V Engineer, Maintainer,
  Safety Expert, Security Expert, Software Developer, System Architect.
- **Answers:** How is the system interacting with the identified external entities?
  Which are the conceptual interfaces of the system? Which are the external conceptual
  entities the system interacts with in the given context? Which are the interface
  requirements imposed on the system? Which kind of conceptual items (energy, material,
  information, etc.) are exchanged? Which requirements apply to a conceptual interface?
