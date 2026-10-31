# P1_PCXE — Physical Context Exchange (view)

**Grid cell:** Physical domain × Context & Exchange (aspect 1) · **Maturity:** released
**Presentation:** (A) per context, an IBD identifying the physical interfaces, the item
flows exchanged on them, and related documentation (a protocol-layer mapping may be
shown); (B) a table of all external interfaces + documentation (context element kind,
role name, port name + port type, context element type); (C) a table of applicable
standards/protocols/formats for the item flows.
**What a view gives you:** an IBD of one physical system context: the physical SoI and
the physical context elements, with the physical interfaces between them (the ports),
the connections, and the physical item exchanges — plus, where the model tracks layered
interfaces, the protocol-layer mapping (`over`).

> This is a recipe for a **modeler building a system model**: it tells you how to
> create one *view* of the Physical Context Exchange viewpoint in your own model,
> using the SAF profile. It does not add anything to the spec.

## Purpose / when to use

You use this view to specify, at the physical level, **the physical interfaces of your
system in a given context**: which external physical entities the system interacts with,
which kind of physical items (energy, material, information, …) are exchanged between
the system and the external entities, and which standards, protocols, and format
specifications apply to the interfaces. Make **one view per context** — it is built
directly on the context block of your **Physical Context Definition** view (P1_PCXD).

## Preconditions

- The **Physical Context Definition** view (P1_PCXD) **must** exist: the
  `SAF_PhysicalContext` block with the SoI part (`SAF_PhysicalContextRole_SoI`) and each
  external part (`SAF_PhysicalContextRole`) already placed as role parts. This view is
  the **internal structure** of that block — the role parts are its parts.
- **No per-viewpoint package** (Rule 2 in `AGENTS.md`). The ports, connections, and
  item flows live on / inside the existing context block and its package.

## Step 0 — Reuse check (always do this first)

The context block — and an exchange view (IBD) of it — may **already exist**. Look
before you create:

1. `find_elements_by_type(stereotype="SAF_PhysicalContext")` → existing context blocks.
2. `get_block_structure(<context>)` → the context's role parts (the
   `SAF_PhysicalContextRole*` parts) and the ports / connectors they already carry.
3. Find existing views of this viewpoint: an IBD marked `SAF_P1_PCXE`
   (`saf_get_viewpoint_views(domain="P")` or `find_elements_by_type(stereotype="SAF_P1_PCXE")`).

- **If a context block + IBD for the context you want already exists → extend it**: add
  the new interfaces (port pair + connection + item exchange) to the existing IBD,
  reusing the existing role parts.
- **If the context block exists but has no exchange view yet → build the IBD** (steps below).
- **If the context block itself is missing → do the P1_PCXD recipe first.** A second
  SOI / context / external element is a bug.

## Create the view

### Elements to model

| Element | Create via | SAF stereotype | Meaning in your model |
|---|---|---|---|
| The addressed context (the IBD's owner) | reuse the P1_PCXD context block | `SAF_PhysicalContext` | the whole block whose internal structure this view draws |
| The SoI part | reuse the P1_PCXD SoI part | `SAF_PhysicalContextRole_SoI` | your physical system in its role in the context |
| Each context element part | reuse the P1_PCXD role parts | `SAF_PhysicalContextRole` | an external physical system / user / environment in its role in the context |
| Each exchange item type | `saf_create_element(kind="physical_exchange_type", …)` | `SAF_PhysicalExchangeType` | the kind of physical item exchanged on an interface - what the flow property and the item flow are typed by |
| Each physical interface definition | `saf_create_element(kind="physical_interaction_point_definition", …)` | `SAF_PhysicalInterfaceDefinition` | the interface between two interaction points - it carries the **flow properties** (the exchange capabilities) |
| Each flow property on an interface | `create_flow_property(blockId=<iface>, typeId=<exchangeItem>, direction=…)` | **FlowProperty** (realizes Physical Interaction Point Property) | one exchange capability of the interface: the item type it carries, in a direction |
| Each physical interaction point | `create_element(type="Port", name=…, parentId=<block>, stereotype="ProxyPort")` | **Port** with SysML `ProxyPort` (realizes Physical Interaction Point) | where a part meets the outside for one identified interface - typed by the interface definition |
| Physical connection | `create_connector(wholeBlockId=<context>, …)` | **Connector** (realizes Physical Connection) | the connection between a SoI interaction point and an external interaction point |
| Physical item exchange | `create_information_flow(…, conveyedItemId=<exchangeItem>, realizingConnectorId=<connection>)` | **ItemFlow** (realizes Physical Item Exchange) | the exchange that actually takes place on the connection - conveys the exchange item type |
| Layered interface (optional) | a Connector between the two interaction points + `apply_stereotype(name="SAF_InterfaceLayerRelationship")` | `SAF_InterfaceLayerRelationship` (`over`) | one physical interaction point communicates over another (the protocol-layer mapping) |

> **The IBD exchange pattern - interface, flow properties, item flows:**
> - The **physical interface definition** (`SAF_PhysicalInterfaceDefinition`) is a
> block that carries **flow properties**. Each flow property is typed by the exchange
> item type and has a direction (`out`/`in`/`inout`); together they describe the
> interface's **exchange capabilities** - what it *can* exchange, and in which
> direction.
> - The **interaction point (port)** is **typed by the interface definition** with
> `set_type(elementId=<port>, typeId=<interfaceDef>)`, so the part "exposes" that
> interface.
> - The **item exchange (ItemFlow)** states what is **actually exchanged in this scope
> (the context)**. Its **conveyed item** is the **exchange item type** - the type of
> the flow property - **not** the interface definition. Conveying the item flow with
> the interface definition is conceptually wrong.
>
> Create one interface definition per *kind* of interface (not per port). If the model
> does not track interface definitions, plain `Port`s with an item flow are the minimal
> form. See `SAF_MODELING.md` - this pattern is shared by every Exchange IBD (context
> and internal).
>
> **`over` (layered interfaces):** `SAF_InterfaceLayerRelationship` is a Connector —
> model it as a Connector between the upper and the lower interaction point (both ends
> are often ports of the *same* part, e.g. "signal layer over electrical layer") and
> apply the stereotype to it. Only track this when the model distinguishes protocol
> layers on an interface.
>
> **ProxyPort:** the spec's Physical Interaction Point is realized by a ProxyPort.
> Create the port as a `Port` carrying the SysML `ProxyPort` stereotype:
> `create_element(type="Port", name=…, parentId=<partType>, stereotype="ProxyPort")`.
> `ProxyPort` comes from the SysML profile (like `Block`); the MCP surface resolves it
> by name, so the single call creates the port and applies the stereotype.

### Build steps

1. **Get the context** — from Step 0: the context block, its SoI part, and the external
   context-element parts (`get_block_structure(<context>)` lists the role parts).
2. **Per physical interface** (SoI ↔ one context element):
   - **The exchange item type** — `saf_create_element(kind="physical_exchange_type", name="<ExchangeItem>", parentId=<pkg>, documentation=...)`. **Reuse before creating:** exchange types are shared vocabulary — first check whether an existing one fits (read the documentation of the exchange types already in the model, and check what they type); if one exactly fits the item, reuse it. Don't reinvent the wheel.
   - **The interface definition (optional)** — if the model tracks interface definitions: `saf_create_element(kind="physical_interaction_point_definition", name="<Interface>", parentId=<pkg>)`, then **its flow property** — `create_flow_property(blockId=<interfaceDef>, typeId=<exchangeItem>, direction="inout")` (one per exchange capability; use `out`/`in` for one-way, `inout` for two-way).
   - **The SoI's interaction point** — `create_element(type="Port", name="<soiPort>", parentId=<soiBlock>, stereotype="ProxyPort")`; if there is an interface definition, type it by it: `set_type(elementId=<soiPort>, typeId=<interfaceDef>)`.
   - **The external's interaction point** — `create_element(type="Port", name="<extPort>", parentId=<extBlock>, stereotype="ProxyPort")`; type it by the same interface definition.
   - **The connection** — `create_connector(wholeBlockId=<context>, end1PartId=<soiPart>, end1PortId=<soiPort>, end2PartId=<extPart>, end2PortId=<extPort>)` → the Connector between the two ports.
   - **The item exchange** — `create_information_flow(name="<exchange>", parentId=<pkg>, sourceId=<soiPort>, targetId=<extPort>, conveyedItemId=<exchangeItem>, realizingConnectorId=<connection>)`. The conveyed item is the **exchange item type** (the flow property's type) — never the interface definition. Set `sourceId` to the port of the side that **provides** the item.
   - **The layer mapping (optional)** — for layered / protocol interfaces: a Connector between the upper and lower interaction point (`create_connector(wholeBlockId=<context>, end1PartId=<soiPart>, end1PortId=<upperPort>, end2PartId=<soiPart>, end2PortId=<lowerPort>)`) with `apply_stereotype(elementId=<overConnector>, name="SAF_InterfaceLayerRelationship")`.
3. **Draw the IBD** — `saf_create_diagram(name="<Context> Physical Context Exchange", parentId=<context>, viewpoint="P1_PCXE", elementIds=[<soiPart>, <extPart>, …])`.
   The `viewpoint` fixes the diagram kind (IBD) and marks the diagram with the view
   stereotype `SAF_P1_PCXE`. `parentId` is the context block (it owns the parts) and
   `elementIds` are the role part properties to show. In selective mode (`elementIds`
   given) only the named parts become shapes: the connectors are neither drawn nor
   reported in `relationshipsSkipped`, so draw them explicitly in step 4. (The item
   exchanges need no diagram symbol of their own — they show on their connectors.)
4. **Draw the connectors and `over` mappings** — `saf_add_relationship_paths(diagramId=<diagram>, relationshipIds=[<connection1>, <connection2>, …, <overConnector1>, …])`.
   Pass **every** Connector and `over` (`SAF_InterfaceLayerRelationship`) Connector
   created in step 2. This draws each connector path on the IBD. Do **not** add the item
   exchanges (InformationFlow) as separate symbols: an item flow that realizes a connector
   is shown *on* that connector (SysML draws the item-exchange arrow on the connector
   itself), so a separate item-flow line would be redundant. (Do not rely on
   `relationshipsSkipped` here — in selective mode it is empty.)

## How it looks when done

An IBD of the context block with the SoI part and the context-element parts inside it: a
port on each part for every physical interface, and a connector joining the SoI's port to
the external's port. Each connector carries its item-exchange arrow (the item flow that
realizes it) — no separate item-flow line is drawn. Where the model tracks layered /
protocol interfaces, an `over` (`SAF_InterfaceLayerRelationship`) line shows the
protocol-layer mapping between the interaction points.

- Worked examples: `../src/diagrams/examples_md/exa_2021x_2_8710274_1695648690450_521977_32967.svg` (FFDS POC System Context) and `exa_2024x_8710274_1717757970886_981437_15535.svg` (POC FFDS Interfaces).

Tabular forms are also acceptable: (B) a table of all external interfaces +
documentation (context element kind, role name, port name + port type, context element
type), and (C) a table of the applicable standards, protocols, and format specifications
for the item flows.

## Tool-call sketch (copy this; resolve every ID by name in-session)

```text
# 0. reuse
find_elements_by_type(stereotype="SAF_PhysicalContext")   # existing context blocks
find_elements_by_type(stereotype="SAF_PhysicalExchangeType")   # existing exchange types — read docs; reuse if one fits
get_block_structure(<context>)                             # role parts + existing ports/connectors
saf_get_viewpoint_views(domain="P")                         # existing SAF_P1_PCXE views

# 2. per physical interface (SoI <-> one context element)
saf_create_element(kind="physical_exchange_type", name="<ExchangeItem>", parentId=<pkg>)
saf_create_element(kind="physical_interaction_point_definition", name="<Interface>", parentId=<pkg>) # optional
create_flow_property(blockId=<interfaceDef>, typeId=<exchangeItem>, direction="inout") # optional: needs the interface def
create_element(type="Port", name="soi.<iface>", parentId=<soiBlock>, stereotype="ProxyPort")
create_element(type="Port", name="ext.<iface>", parentId=<extBlock>, stereotype="ProxyPort")
set_type(elementId=<soiPort>, typeId=<interfaceDef>) # optional: type the port(s) by the interface
set_type(elementId=<extPort>, typeId=<interfaceDef>)
create_connector(wholeBlockId=<context>, end1PartId=<soiPart>, end1PortId=<soiPort>,
                 end2PartId=<extPart>, end2PortId=<extPort>)                    # -> <connection>
create_information_flow(name="<exchange>", parentId=<pkg>, sourceId=<soiPort>, targetId=<extPort>,
                        conveyedItemId=<exchangeItem>, realizingConnectorId=<connection>)
#   conveyedItemId = the exchange item type (the flow property's type) - NOT the interface def
#   optional, layered / protocol interface: the upper point communicates over the lower
create_connector(wholeBlockId=<context>, end1PartId=<soiPart>, end1PortId=<upperPort>,
                 end2PartId=<soiPart>, end2PortId=<lowerPort>)                  # -> <overConnector>
apply_stereotype(elementId=<overConnector>, name="SAF_InterfaceLayerRelationship")
#   ... repeat for every interface

# 3. diagram (IBD, marked SAF_P1_PCXE)
saf_create_diagram(name="Fire Station Physical Context Exchange", parentId=<context>, viewpoint="P1_PCXE",
                  elementIds=[<soiPart>, <extPart>, …])
#    -> returns { diagramId }
#    In selective mode the connectors are NOT drawn here,
#    and relationshipsSkipped is empty -> draw them explicitly in step 4.

# 4. draw every connector and `over` mapping (item flows show on their connectors — no separate symbol)
saf_add_relationship_paths(diagramId=<diagramId>,
                           relationshipIds=[<connection1>, <connection2>, …, <overConnector1>, …])
```

## Verify

- `get_block_structure(<context>)` → the role parts, each part's ports, and the
  connectors (with directions) are present.
- `get_stereotype_tags(<context>)` → has `SAF_PhysicalContext`; the SoI part has
  `SAF_PhysicalContextRole_SoI`, the external parts have `SAF_PhysicalContextRole`;
  each layer mapping has `SAF_InterfaceLayerRelationship`.
- `get_block_structure(<interfaceDef>)` → the flow properties are present (typed by
  the exchange item type, with a direction). Each port is typed by the interface
  definition, and each item flow's conveyed item is the exchange item type - not the
  interface definition.
- The IBD is marked `SAF_P1_PCXE` (a view of this viewpoint) and shows the ports, the
  connectors, the item exchanges, and (where tracked) the `over` layer mappings.
- `saf_check_consistency` → no orphan concepts / broken chains.

## Who it's for / what it answers

- **Stakeholders:** Acquirer, Customer, Hardware Developer, IV&V Engineer, Mechanic
  Developer, Safety Expert, Security Expert, Software Developer, Supplier, System Architect.
- **Answers:** Which external physical entities does the system interact with? Which
  kind of physical items (energy, material, information, etc.) are exchanged between
  the system and external entities? Which kind of physical items are used on an
  interface of a physical architecture element? Which requirements apply to a physical
  interface? Which standards, protocols, and format specifications apply to a physical
  interface?
