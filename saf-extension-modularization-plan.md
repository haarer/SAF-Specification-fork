# SAF Specification Modularization — Extension Mechanism (Fork Model)

## Context

Working directory: `/workspace/SAF-Specification-fork` (all paths below relative to it). This fork already contains the project-page adaptation (CI auto-injects `baseurl=/<repo>`, `is_fork`/`fork_repository` flags, fork callout in `index.md`, fork note in `nav_footer_custom.html`, `viewpoint.md`/`dev-viewpoint.md` scoped `examplegallery.js` to `site.baseurl`), and the fork's `index.md` links to this plan file.

**The model (simplified from the earlier SDK/localStorage draft, which is dropped in full):**

- A SAF extension **is a fork** of the main SAF-Specification repository. No separate extension repos, no template, no runtime fetching, no `localStorage`, no settings menu, no CORS.
- The fork adds one directory per extension: `src/_data/extensions/<name>/` containing a **manifest** and the extension's **JSON data files** (same schema as the core's `_data/*.json`).
- The fork's site **renders the core pages normally** plus **generated pages** built from the extension data: one overview page per extension and one page per extension viewpoint record, at the same URL scheme as core pages (`/userdoc/<Domain> Domain/<Name>.html`).
- Extension content is **visible**: every row an extension contributes carries a colored **badge** naming the extension (see "Marking extension content").
- The mechanism (merge + tagging + validation + page generation) lives in a single Jekyll generator in the repository. If the extension directory were populated in the core (saf.gfse.org), the core site would render the extensions the same way — **we do not populate the core, at least for now**.
- GFSE extensions are staged as normal forks in the `gfse` org; a fork may later be decided as **blessed**, which simply means moving its `src/_data/extensions/<name>/` directory (plus diagrams) into the core repo via PR.

**Demo/validation**: in this fork, the five core Security (C7) viewpoints are *extracted* from the core data into the `saf-security` extension directory — exactly the future blessed-extension end state, demonstrated without touching the core.

Verified facts driving the design:

- `_includes/viewpoint.md` **self-derives the record**: line 1 `{% assign vp_tmp = site.data.viewpoints | where: "Name", page.title %}`. Wrapper pages are thin (`title` + `{% include viewpoint.md %}`); the include does all data lookups. Tables it references: `viewpoints`, `mdexamples`, `rhyexamples`, `eaexamples`, `stakeholders`, `concerns`, `exposes`, `realizeconcept`, `scmstereotypes`, `stereotypes`, `special-implementations` (11 tables, 13 references).
- `_includes/grid.html` looks up `site.data.viewpoints` per domain (1 reference) and renders 4 tooltip anchor loops (blackbox / whitebox / both / not-applicable).
- `userdoc/stakeholders.md` loops `site.data.stakeholders` (H2 per stakeholder + `<A id=ID>` anchor). `userdoc/stereotypes.md` loops `site.data.stereotypes`, `site.data.special-implementations`, `site.data.scmstereotypes` and looks up `realizeconcept`/`concepts` (5 references). `devdoc/concepts.html` loops `site.data.concepts` (data-driven table with anchors) and looks up `site.data.viewpoints` for `InViewpoint`.
- `userdoc/concerns.html` is **hand-written static HTML** (not data-driven); it also reads `site.data.rationales` for tooltip content. Concern anchors exist only for the 146 core concerns listed there.
- `_includes/dev-viewpoint.md` + `userdoc/standard-traceability.md` additionally require `standard-mapping`, `concept-viewpointdiags`, `profile-viewpointdiags`, `concept-diags` → devdoc ("SAF Development" domain) extensions are **out of v1 scope**.
- Row shapes: `exposes.json` rows carry `Viewpoint: {ID, Name}` and `ExposedConcept: {ID, Name}`; example rows carry `ExampleForVPID` (e.g. `"A2_CSTD"`); `concepts.json` rows are ontology triples (`AssociationEnds[0..1]`, `InheritsFrom`, `IsGeneralFor`, `InViewpoint`).
- Grid structure: `domains.json` (5 rows: `Name`, `ID`, `DomainID` A/C/O/P/D, `Documentation`), `aspects.json` (8 rows: `Name`, `ID`, `AspectID` 1–8, `Documentation`), `domaincolors.json` (5 rows: `{DomainID, Color}` — hex **without** `#`). Grid row colors are **hard-coded CSS** per domain in `_sass/custom/custom.scss` (`tr.SAF_Domain_<ID> td { background-color: #<Color>; color: #000000; }`) — `domaincolors.json` is the color source of truth, the CSS is a hand-synced copy. Core rows therefore keep their CSS class; **extension domain rows get inline styles** (tagged rows only).
- `userdoc/domains.md` and `userdoc/aspects.md` are data-driven loops with `<H2 id={{ element.ID }}>` (SysML-ID anchors, matching the grid's link style). The per-domain pages (`conceptual.md`, `operational.md`, …) and `devdoc/icons/readme.md` are hand-written/core-only.
- Known core defect (pre-existing, out of scope): `viewpoint.md` builds domain/aspect links as `domains.html#<name>-domain` / `aspects.html#<name>-aspect` (name-based), but the anchors are SysML IDs → those two links are broken in the core site too. Extension VPs behave exactly like core VPs here.
- Diagrams: `src/diagrams/` has 4 subdirectories — `concept/`, `examples_md/`, `examples_rhy/`, `examples_ea/` (331 SVGs); example rows reference them via `File` relative to `/diagrams/`.
- Stakeholder rows carry `Rationales: [{Concern: <concern name string>, Rationale}]` — that array **is** the stakeholder's concern list, rendered in the "## Concern" section of `stakeholders.md`. There is no other surface to attach a concern to a stakeholder; extending a core stakeholder's list would require redeclaring the row with the same `ID` (duplicate H2 under append-only merging) → forbidden in v1 (uniform collision rule).
- `realizeconcept.json` rows = `{RealizedConcept: {ID, Name}, RealizationOfConcept: {ID, Name}}` (concept realized by stereotype). Two render sites, both derived lookups: the VP page Profile Model Reference (`where: "RealizedConcept.ID", <exposed concept ID>` → appears on **every** VP page exposing that concept) and the Stereotypes page realized-concepts cell (`where: "RealizationOfConcept.ID", <row ID>` → appears in the row of **every** stereotype). A row touching a core record on either side therefore modifies core page rendering → v1 own-namespace rule (own concept **and** own stereotype only).
- Jekyll loads nested `_data` folders: `src/_data/extensions/<name>/manifest.json` → `site.data.extensions.<name>.manifest`.
- A Jekyll **generator runs before rendering**; mutating `site.data` in `generate()` is visible to all Liquid templates in the same build (JTD only reads `site.data.releases`, untouched). One code path in Ruby therefore replaces a Liquid merge include: it can tag rows, validate, and log warnings — Liquid can do none of that.
- CI (`.github/workflows/pages.yml`) builds with `bundle exec jekyll build --destination build` → local `src/_plugins/` are loaded (no Gemfile change needed).
- C7 extraction is clean: 5 C7 records in `viewpoints.json` (domain `Conceptual` → userdoc), 7 C7 rows in `mdexamples.json` (all Cameo, 0 in rhy/ea), 39 C7 rows in `exposes.json` (`Viewpoint.Name` = the five C7 names), **no** non-C7 VP has a C7 in `RequiredVP`/`RecommendedVP`. C7's two stakeholders ("Security Expert", "System Architect") are shared by ~45 non-C7 VPs and the 11 C7 concerns are anchored in the hand-written `concerns.html` → both stay in the core.

## What an extension can extend (data surface enumeration)

Every file in `src/_data/` was checked for content an extension could plausibly contribute and for where it renders. Result:

**Extended + rendered in v1 — 15 tables (the generator's merge list):**

| File | Rows | Content | Where extension rows render |
|---|---|---|---|
| `viewpoints.json` | 58 | Viewpoint records | generated VP page (heading, maturity table, purpose, …), grid cell, sidebar |
| `mdexamples.json` | 94 | Cameo example models per VP | VP page example gallery |
| `rhyexamples.json` | 70 | Rhapsody example models per VP | VP page example gallery |
| `eaexamples.json` | 2 | EA example models per VP | VP page example gallery |
| `stakeholders.json` | 21 | Stakeholder roles + rationales (concern list) | Stakeholders page (H2 + anchor), VP page stakeholder list — **new stakeholders only** (v1 collision rule: core stakeholders cannot be redeclared/extended) |
| `concerns.json` | 146 | Concern records | VP page concern list; **no own page** (concerns.html is hand-written) |
| `exposes.json` | 419 | "VP exposes concept X" rows | VP page Profile Model Reference list |
| `realizeconcept.json` | 398 | "concept realized by stereotype Y" rows | VP page Profile Model Reference, Stereotypes page — **only own concepts + own stereotypes** (v1 own-namespace rule) |
| `stereotypes.json` | 238 | SAF/SysML profile stereotypes | Stereotypes page table (anchor), VP page reference list |
| `scmstereotypes.json` | 21 | SCM (development) stereotypes | Stereotypes page table (anchor), VP page reference list |
| `special-implementations.json` | 45 | SCM patterns (TypedBy/ContainedIn/Attribute) | Stereotypes page table (anchor), VP page reference list |
| `concepts.json` | 377 | SAF ontology concepts (triples) | devdoc/concepts.html table (anchor), Stereotypes "Realized Concepts" |
| `domains.json` | 5 | Grid domain rows (`Name`, `ID`, `DomainID`, `Documentation`) | new grid row (inline color), Domains page H2 (badge) |
| `aspects.json` | 8 | Grid aspect columns (`Name`, `ID`, `AspectID` 1–8, `Documentation`) | new grid column, Aspects page H2 (badge) |
| `domaincolors.json` | 5 | Grid row colors per `DomainID` (hex without `#`) | inline row color for extension domains (auto-filled from the extension's color if omitted) |

**Not extended in v1 — 7 files:**

| File | Why not |
|---|---|
| `standard-mapping.json` (303) | Devdoc machinery (ISO mapping of SAF objects) — dev scope |
| `concept-diags.json` (62), `concept-viewpointdiags.json` (58), `profile-viewpointdiags.json` (58) | Devdoc diagram associations — dev scope |
| `rationales.json` (513) | Concern↔stakeholder rationales, rendered only via hand-written concerns.html (core concerns only) |
| `changes.json` (42) | Core release changelog |
| `releases.yml` | Version menu entries |

The hand-written per-domain pages (`userdoc/conceptual.md`, `operational.md`, …) and `devdoc/icons/readme.md` also stay core-only; extension domains/aspects render on the data-driven `domains.md` / `aspects.md` pages and in the grid.

**Not rendered at all — 3 files (no surface, nothing to mark):** `ffds.json` (1 row, no `site.data` usage anywhere), `sysmlstereotypes.json` (93), `umlmetaclasses.json` (250). The Stereotypes page has a `{: .todo }` section "Used SysML Stereotypes" — when that is implemented, extension entries there would need badges; no v1 work.

## Marking extension content (badge concept)

**Origin is tagged at merge time, once, in the generator.** Every extension row is copied with three extra keys:

```
ext_name   "saf-security"          (directory name)
ext_title  "SAF Security Extension" (manifest.title — the human-facing label)
ext_color  "#0d6efd"               (manifest.color or palette fallback)
```

Core rows carry no tag. Renderers test `row.ext_title` — one check, works for every table, no per-renderer lookup of "which extension does this row come from".

**Colors** — `color` (hex string) is optional in the manifest. Without it, a fixed 8-color palette is assigned by the extension's position when directory names are sorted alphabetically (same order in the Ruby generator and in the Liquid index loop, so colors are deterministic per build). Explicit `color` always wins.

**Badge markup** — new include `_includes/ext_badge.html`, inline-styled (no theme CSS needed):
- normal (pill): rounded colored chip with the extension title, white text, 11px, `title=` tooltip "Provided by the … extension"
- `compact=true` (dot): 8px colored circle, same tooltip — for dense surfaces (grid, index list)

**Render points (v1):**

| Surface | Markup | Badge |
|---|---|---|
| Generated VP page heading (`viewpoint.md`: `**{{ vp.VP_ID }} {{ vp.Name }}`) | pill | yes |
| VP page Concern list — extension concerns render as **text + pill, no link** (no anchor exists); core concerns stay linked | pill | yes |
| Stakeholders page H2 per stakeholder | pill | yes |
| Stereotypes page, Name cell — all 3 loops (SAF, patterns, SCM) | pill | yes |
| devdoc/concepts.html, concept cell | pill | yes |
| Grid tooltip anchors (4 loops) — colored dot after the VP_ID text | dot | yes |
| Grid row for an extension domain — inline `background-color: #<Color>` (its `domaincolors` row, auto-filled with the extension's color if omitted); core rows keep their CSS class | row color | yes |
| Domains page H2 per extension domain / Aspects page H2 per extension aspect | pill | yes |
| Index Extensions list bullets | dot | yes |
| Sidebar (JTD static nav) | — | **no** — the section is named after the extension; per-entry dots would need theme hacks |
| VP page Profile Model Reference list items | — | **no** — the row's origin is lost through the `exposes → realizeconcept` chain; the badge lives on the Stereotypes page row the link points to |
| VP page example gallery items | — | **no** — per-item badges need `examplegallery.js` changes; a VP page's own gallery is fully covered by the page heading badge |

**Consequence for core pages:** extension rows appear on the shared reference pages (Stakeholders, Stereotypes, devdoc/concepts) *with a badge* — that is the point: an extension's stakeholders/stereotypes/concepts are discoverable in one place. The core **grid** gains rows/columns for extension domains/aspects (colored row, dot-marked cells, badge-marked page entries) — additive growth, core cells untouched. In v1, core **viewpoint** pages are never modified by extensions (cross-reference rule below).

**v1 reference & collision rules (open decision, see grill Q1):**
- **Uniform collision rule (no redeclaration)** — extensions are additive: a row that redeclares an existing record (core or an earlier extension) is skipped with a build warning. Identity keys: viewpoints `Name` + `VP_ID`, stakeholders `ID`, concerns `ID`, stereotypes & scmstereotypes `Name`, special-implementations the (Stereotype, Client, Supplier) triple, concepts `ID`, domains `DomainID`, aspects `AspectID`.
- **Own-namespace rules** — example rows must reference the extension's own VPs (`ExampleForVPID` ∈ extension VP IDs); expose rows must reference the extension's own VPs (`Viewpoint.Name` ∈ extension VP names; the exposed concept may be core or own — it renders only on the extension VP pages); realizeconcept rows must reference the extension's own concepts (`RealizedConcept`) **and** its own stereotypes (`RealizationOfConcept`) — a row touching a core record on either side would appear on core VP pages or in core stereotype rows.
- **Consequence — stakeholders:** an extension cannot extend a core stakeholder's concern list (`Rationales`): a new extension concern renders on the extension's VP pages (name + badge) but does **not** appear under existing core stakeholders on the Stakeholders page. If the extension needs a stakeholder role carrying those concerns, it declares a new stakeholder (new `ID`) and references it from its VPs.
- **Consequence — realizeconcept:** an extension cannot add realizations for core concepts nor realize its own concepts with core stereotypes; such rows are skipped with a build warning (the link may be noted in the concept's `Documentation`).

Together these keep core VP pages content-identical to the core site (only nav/grid/index/sidebar may differ) and keep core rows on the shared reference pages free of extension data.

## Design summary

| Piece | Where | Effect |
|---|---|---|
| Extension data | `src/_data/extensions/<name>/` (manifest + JSON tables) | Jekyll data, no runtime |
| Merge + tagging + validation + page generation | one generator, `_plugins/saf_extensions_generator.rb` | publishes `site.data.ext_<table>` = core rows + tagged extension rows; creates overview + VP pages |
| Template edits | `viewpoint.md`, `grid.html`, `domains.md`, `aspects.md`, `stakeholders.md`, `stereotypes.md`, `devdoc/concepts.html` | read `ext_*` keys instead of core keys; render badges |
| Badge | `_includes/ext_badge.html` (pill + compact dot) | inline-styled, no theme changes |
| Sidebar | JTD `parent` per extension | one section per extension, sorted after core sections |
| Index | guarded `# Extensions` section in `index.md` | lists extensions with color dots; renders nothing in the core |
| Search | JTD default | generated pages (`layout: default`) are indexed automatically |

When `src/_data/extensions/` does not exist, the generator publishes identity copies (`ext_*` = core data), creates no pages, and every template renders exactly as today: the built site is byte-identical to the baseline (Validation step 2).

## Step 1 — Generator: `src/_plugins/saf_extensions_generator.rb` (new)

The `_plugins/` directory does not exist yet — create it. Runs after the page reader (collision detection sees all hand-written pages), before rendering (merged `ext_*` data is visible to every template).

```ruby
# SAF extension mechanism.
#
# For every extension directory src/_data/extensions/<name>/:
#   1. merges its JSON data tables into the core _data tables, validates the
#      v1 reference & collision rules (violating rows are skipped with a
#      build warning), tags every kept row with its origin (ext_name /
#      ext_title / ext_color) and publishes the merged result under
#      site.data["ext_<table>"] (templates read those keys; identity when
#      no extension exists),
#   2. generates one overview page (extensions/<name>.html) and one page per
#      viewpoint record (userdoc/<Domain> Domain/<Name>.html — same URL
#      scheme as core pages).
# Loaded automatically by `bundle exec jekyll build` (local _plugins).
# See userdoc/extensions.html for the data contract.

class SafExtensionsGenerator < Jekyll::Generator
  DEV_DOMAIN = "SAF Development"
  PALETTE    = %w[#0d6efd #6f42c1 #d63384 #198754 #fd7e14 #dc3545 #0dcaf0 #6c757d]
  TABLES     = %w[
    viewpoints mdexamples rhyexamples eaexamples stakeholders concerns exposes
    realizeconcept scmstereotypes stereotypes special-implementations concepts
    domains aspects domaincolors
  ]
  EXAMPLES   = %w[mdexamples rhyexamples eaexamples]

  def generate(site)
    # Always publish the merged keys (identity copies when no extension
    # exists) so templates have a single reference point.
    TABLES.each { |t| site.data["ext_#{t}"] = Array(site.data[t]) }

    exts = site.data["extensions"]
    return if exts.nil? || exts.empty?

    existing_urls = site.pages.map { |p| p.url.to_s }
    ext_index = 0

    exts.sort_by { |name, _| name.to_s }.each do |name, files|
      manifest = files["manifest"]
      unless manifest.is_a?(Hash)
        Jekyll.logger.warn("saf-extensions", "extension '#{name}': missing or invalid manifest.json - skipped")
        next
      end
      if (manifest["name"] || "").to_s != name.to_s
        Jekyll.logger.warn("saf-extensions", "extension '#{name}': manifest.name ('#{manifest['name']}') does not match the directory name - skipped")
        next
      end
      title = manifest["title"].to_s
      if title.empty?
        Jekyll.logger.warn("saf-extensions", "extension '#{name}': manifest.title missing - skipped")
        next
      end
      color = manifest["color"].to_s
      color = PALETTE[ext_index % PALETTE.size] if color.empty?
      ext_index += 1
      base = 200 + (ext_index - 1) * 1000
      tag  = { "ext_name" => name.to_s, "ext_title" => title, "ext_color" => color }

      vps = files["viewpoints"]
      vps = [] unless vps.is_a?(Array)
      ext_vp_ids   = vps.map { |vp| vp["VP_ID"].to_s if vp.is_a?(Hash) }.compact.reject(&:empty?)
      ext_vp_names = vps.map { |vp| vp["Name"].to_s  if vp.is_a?(Hash) }.compact.reject(&:empty?)
      if vps.empty?
        Jekyll.logger.warn("saf-extensions", "extension '#{name}': no viewpoints.json entries - overview page only")
      end

      # ---- v1 reference & collision rules (see userdoc/extensions.html):
      #      - uniform collision rule: a row that redeclares an existing
      #        record (core + earlier extensions) is skipped with a warning
      #      - own-namespace rules: examples/exposes -> own VPs,
      #        realizeconcept -> own concepts + own stereotypes
      identity_keys = { "viewpoints" => %w[Name VP_ID], "stakeholders" => %w[ID],
                        "concerns" => %w[ID], "stereotypes" => %w[Name],
                        "scmstereotypes" => %w[Name], "concepts" => %w[ID],
                        "domains" => %w[DomainID], "aspects" => %w[AspectID] }
      taken = {}
      identity_keys.each do |t, keys|
        taken[t] = site.data["ext_#{t}"].flat_map do |row|
          next unless row.is_a?(Hash)
          keys.map { |k| row[k].to_s }.reject(&:empty?)
        end
      end
      taken["special-implementations"] = site.data["ext_special-implementations"].map do |row|
        next unless row.is_a?(Hash)
        [row["Stereotype"].to_s, (row["Client"] || {})["Name"].to_s,
         (row["Supplier"] || {})["Name"].to_s]
      end.compact
      own_concept_ids = Array(files["concepts"]).select { |r| r.is_a?(Hash) }
                                .map { |r| r["ID"].to_s }.reject(&:empty?)
      own_stereo_ids  = %w[stereotypes scmstereotypes special-implementations].flat_map do |t|
        Array(files[t]).select { |r| r.is_a?(Hash) }.map { |r| r["ID"].to_s }
      end.reject(&:empty?)
      new_domain_ids = []
      skipped_vp_rows = []
      hex_color      = color.delete_prefix("#")

      # ---- data merge: validate v1 rules, tag rows
      TABLES.each do |t|
        rows = files[t]
        next unless rows.is_a?(Array)
        rows.each_with_index do |row, i|
          unless row.is_a?(Hash)
            Jekyll.logger.warn("saf-extensions", "extension '#{name}': #{t}.json record #{i} is not an object - skipped")
            next
          end
          if (keys = identity_keys[t])
            row_keys = keys.map { |k| row[k].to_s }.reject(&:empty?)
            if row_keys.any? { |v| taken[t].include?(v) }
              Jekyll.logger.warn("saf-extensions", "extension '#{name}': #{t}.json record #{i} redeclares an existing record (#{keys.map { |k| k + '=' + row[k].to_s }.join(', ')}) - skipped (v1 collision rule)")
              skipped_vp_rows << row if t == "viewpoints"
              next
            end
            row_keys.each { |v| taken[t] << v }
            new_domain_ids << row["DomainID"].to_s if t == "domains"
          end
          if t == "special-implementations"
            triple = [row["Stereotype"].to_s, (row["Client"] || {})["Name"].to_s,
                      (row["Supplier"] || {})["Name"].to_s]
            if taken["special-implementations"].include?(triple)
              Jekyll.logger.warn("saf-extensions", "extension '#{name}': special-implementations.json record #{i} redeclares an existing implementation - skipped (v1 collision rule)")
              next
            end
            taken["special-implementations"] << triple
          end
          if EXAMPLES.include?(t) && !ext_vp_ids.include?(row["ExampleForVPID"].to_s)
            Jekyll.logger.warn("saf-extensions", "extension '#{name}': #{t}.json record #{i} references '#{row['ExampleForVPID']}' - not a viewpoint of this extension, skipped (v1 rule)")
            next
          end
          if t == "exposes"
            vname = row["Viewpoint"].is_a?(Hash) ? row["Viewpoint"]["Name"].to_s : ""
            unless ext_vp_names.include?(vname)
              Jekyll.logger.warn("saf-extensions", "extension '#{name}': exposes.json record #{i} references '#{vname}' - not a viewpoint of this extension, skipped (v1 rule)")
              next
            end
          end
          if t == "realizeconcept"
            rc = (row["RealizedConcept"] || {})["ID"].to_s
            ro = (row["RealizationOfConcept"] || {})["ID"].to_s
            unless own_concept_ids.include?(rc) && own_stereo_ids.include?(ro)
              Jekyll.logger.warn("saf-extensions", "extension '#{name}': realizeconcept.json record #{i} must reference this extension's own concept and own stereotype - skipped (v1 rule)")
              next
            end
          end
          site.data["ext_#{t}"] << row.merge(tag)
        end
      end

      # ---- grid structure: every extension domain gets a grid row color
      #      (extension-provided domaincolors rows already merged above;
      #      missing rows fall back to the extension's color, core format
      #      = hex without '#')
      merged_dc_ids = site.data["ext_domaincolors"].map { |d| d["DomainID"].to_s }
      new_domain_ids.each do |did|
        next if did.empty? || merged_dc_ids.include?(did)
        site.data["ext_domaincolors"] << { "DomainID" => did, "Color" => hex_color }.merge(tag)
      end

      # ---- overview page: extensions/<name>.html
      ov_url = "/extensions/#{name}.html"
      unless existing_urls.include?(ov_url)
        rows = vps.map do |vp|
          next unless vp.is_a?(Hash)
          next if vp["Name"].to_s.empty? || vp["Domain"].to_s.empty?
          next if vp["Domain"] == DEV_DOMAIN
          "| #{vp['VP_ID']} | [#{vp['Name']}](../userdoc/#{vp['Domain']} Domain/#{vp['Name']}.html) | #{vp['Exposure']} |"
        end.compact
        content = <<~MD
          # #{title}

          #{manifest['description'].to_s}

          | **Version** | **Author** | **Tracks spec** |
          | --- | --- | --- |
          | #{manifest['version'].to_s} | #{manifest['author'].to_s} | #{manifest['specVersion'].to_s} |

          ## Viewpoints

          | VP ID | Name | Exposure |
          | --- | --- | --- |
          #{rows.join("\n")}
        MD
        add_page(site, "extensions", "#{name}.html",
                 { "title" => title, "parent" => title, "layout" => "default", "nav_order" => base },
                 content)
        existing_urls << ov_url
      end

      # ---- viewpoint pages: userdoc/<Domain>/<Name>.html (same scheme as core)
      vps.each_with_index do |vp, i|
        next unless vp.is_a?(Hash)
        next if skipped_vp_rows.include?(vp)
        vp_name = vp["Name"].to_s
        domain = vp["Domain"].to_s
        if vp_name.empty? || domain.empty?
          Jekyll.logger.warn("saf-extensions", "extension '#{name}': viewpoints.json record #{i} missing Name/Domain - skipped")
          next
        end
        if domain == DEV_DOMAIN
          Jekyll.logger.warn("saf-extensions", "extension '#{name}': '#{vp_name}' is in the '#{DEV_DOMAIN}' domain - not supported in v1, skipped")
          next
        end
        url = "/userdoc/#{domain} Domain/#{vp_name}.html"
        if existing_urls.include?(url)
          Jekyll.logger.warn("saf-extensions", "extension '#{name}': skipping '#{vp_name}': #{url} is already taken by an existing page")
          next
        end
        add_page(site, "userdoc/#{domain}", "#{vp_name}.html",
                 { "title" => vp_name, "parent" => title, "layout" => "default", "nav_order" => base + 10 + i * 10 },
                 "{% include viewpoint.md %}")
        existing_urls << url
      end
    end
  end

  def add_page(site, dir, name, data, content)
    page = Jekyll::Page.new(site.source, site.source, dir, name, data)
    page.instance_variable_set(:@content, content)
    site.pages << page
  end
end
```

Behavior notes:

- **Collision**: two levels. (1) Merge phase: a row whose identity collides with an existing record (viewpoints `Name`/`VP_ID`, stakeholders/concepts `ID`, stereotypes/scmstereotypes `Name`, special-implementations triple, domains `DomainID`, aspects `AspectID`) is skipped with a warning before any page is generated (v1 collision rule). (2) Page phase: a generated page whose URL already exists (core wrapper or another extension's page) is skipped with a warning; the existing page wins. Overriding a core viewpoint in your fork = delete the core wrapper file in your fork (explicit, visible in the fork diff) — the extension record then generates the page at the same URL.
- **Nav**: all pages of one extension share `parent` = `manifest.title` → one JTD sidebar section per extension. `nav_order` base `200 + (ext_index-1)*1000` sorts extension sections after the core sections (core sections start at nav_order 0–90).
- **Merged keys**: `site.data.ext_viewpoints`, …, `site.data.ext_concepts`. The dashed key is read in Liquid as `site.data['ext_special-implementations']` (bracket syntax).
- **`instance_variable_set(:@content, …)`**: generator-created pages have no file on disk; works regardless of `Page#content` writer visibility (Jekyll 4.x per the fork Gemfile). Validation step 3 proves the pages render end-to-end.

## Step 2 — Badge include: `src/_includes/ext_badge.html` (new)

```liquid
{%- if include.row.ext_title -%}
{%- if include.compact -%}
<span class="saf-ext-dot" title="Provided by the {{ include.row.ext_title }} extension" style="display:inline-block;width:8px;height:8px;border-radius:50%;background-color:{{ include.row.ext_color | default: '#6c757d' }};vertical-align:middle;margin-left:4px;"></span>
{%- else -%}
<span class="saf-ext-badge" title="Provided by the {{ include.row.ext_title }} extension" style="display:inline-block;background-color:{{ include.row.ext_color | default: '#6c757d' }};color:#fff;border-radius:9px;padding:1px 8px;font-size:11px;line-height:16px;vertical-align:middle;white-space:nowrap;margin-left:6px;">{{ include.row.ext_title }}</span>
{%- endif -%}
{%- endif -%}
```

Usage: `{% include ext_badge.html row=<hash> %}` (pill) or `{% include ext_badge.html row=<hash> compact=true %}` (dot). No-op for core rows (no `ext_title`).

## Step 3 — `src/_includes/viewpoint.md` (edit)

1. Rename data references to the merged keys (11 tables, 13 occurrences): `site.data.viewpoints` → `site.data.ext_viewpoints` (3×), and the other 10 tables likewise; `site.data.special-implementations` → `site.data['ext_special-implementations']`.
2. Heading badge: the line `**{{ vp.VP_ID }}** {{ vp.Name }}` becomes `**{{ vp.VP_ID }}** {{ vp.Name }}{% include ext_badge.html row=vp %}`.
3. Concern list — extension concerns have no anchor in the hand-written `concerns.html`, so they render as text + badge; core concerns stay linked:

```liquid
{% for concern_id in vp.Concern %}
{% assign concern = site.data.ext_concerns | where: "ID", concern_id %}
{% if concern.first.ext_title %}
<li>{{ concern.first.Name }} {% include ext_badge.html row=concern.first %}</li>
{% else %}
<li><A href="../concerns.html#{{ concern_id }}"> {{ concern.first.Name }} </A></li>
{% endif %}
{% endfor %}
```

Nothing else changes (the include keeps deriving `vp` from `page.title`; generated pages simply have the extension record's `Name` as `title`, and `vp` then carries the tag keys).

## Step 4 — `src/_includes/grid.html`, `src/userdoc/domains.md`, `src/userdoc/aspects.md` (edit)

`grid.html`:
1. Rename data references to the merged keys (5 occurrences): `site.data.viewpoints` → `site.data.ext_viewpoints` (the `dom_vp` line), `site.data.domaincolors` → `site.data.ext_domaincolors` (row loop), `site.data.domains` → `site.data.ext_domains` (domain lookup), `site.data.aspects` → `site.data.ext_aspects` (column-header loop and cell loop — keep each loop's existing sort behavior as-is). Extension VPs then appear in their domain/aspect cell with the existing Exposure logic; extension domains/aspects add new grid rows (appended after the core rows, file order) and columns (sorted by `AspectID` — use IDs that sort after the core's 1–8, e.g. `9`) automatically.
2. Extension domain rows carry their color inline (core rows keep their hard-coded CSS class, so the core grid is untouched):

```liquid
<tr class="SAF_Domain_{{ dc.DomainID }}"{% if dc.ext_title %} style="background-color: #{{ dc.Color }}; color: #000000;"{% endif %}>
```

(`domaincolors.Color` is hex without `#`, as in the core file; the generator auto-fills a missing extension row with the extension's color.)
3. In each of the 4 tooltip anchor loops (blackbox, whitebox, both, not-applicable), insert the dot after the VP_ID text: `{{vp.VP_ID}}{% include ext_badge.html row=vp compact=true %}`.

`domains.md`:
- Loop: `site.data.domains` → `site.data.ext_domains`.
- Badge: `<H2 id={{ element.ID }}> {{ element.Name }} Domain</H2>` → `<H2 id={{ element.ID }}> {{ element.Name }} Domain {% include ext_badge.html row=element %}</H2>`.

`aspects.md`:
- Loop: `site.data.aspects` → `site.data.ext_aspects`; badge in the H2 likewise.

The hand-written per-domain pages (`conceptual.md`, `operational.md`, …) and `devdoc/icons/readme.md` stay core-only.

## Step 5 — `src/userdoc/stakeholders.md` (edit)

- Loop: `site.data.stakeholders` → `site.data.ext_stakeholders`.
- Badge: `# {{ element.Name }}` → `# {{ element.Name }}{% include ext_badge.html row=element %}`.

## Step 6 — `src/userdoc/stereotypes.md` and `src/devdoc/concepts.html` (edit)

`stereotypes.md`:
- Rename 5 references: `site.data.stereotypes` → `site.data.ext_stereotypes`, `site.data.special-implementations` → `site.data['ext_special-implementations']`, `site.data.scmstereotypes` → `site.data.ext_scmstereotypes`, `site.data.realizeconcept` → `site.data.ext_realizeconcept`, `site.data.concepts` → `site.data.ext_concepts`.
- Badge in the Name cell of all 3 loops: after `{{ element.Name }}` (SAF + SCM loops) and after `{{ specialtext }}` (patterns loop) — inside the existing `<A id=…>` cell.

`devdoc/concepts.html`:
- Rename: `site.data.concepts` → `site.data.ext_concepts` (loop), `site.data.viewpoints` → `site.data.ext_viewpoints` (`InViewpoint` lookup — so extension concepts list their extension VPs).
- Badge at the end of the concept cell (after the triple's object link).

## Step 7 — `src/index.md` (edit)

Insert after the `{% include grid.html %}` line (end of the `# SAF Grid` section):

```liquid
{% if site.data.extensions %}
# Extensions

This site extends the SAF specification with the following extension(s):

{% assign ext_palette = "#0d6efd #6f42c1 #d63384 #198754 #fd7e14 #dc3545 #0dcaf0 #6c757d" | split: " " %}
{% for ext in site.data.extensions | sort %}
{% assign ext_color = ext[1].manifest.color | default: ext_palette[forloop.index0 | modulo: ext_palette.size] %}
{% assign badge_row = {"ext_title": ext[1].manifest.title, "ext_color": ext_color} %}
* {% include ext_badge.html row=badge_row compact=true %} **{{ ext[1].manifest.title }}** ({{ ext[1].manifest.version }}) — {{ ext[1].manifest.description }} [Overview]({{ site.baseurl }}/extensions/{{ ext[0] }}.html)
{% endfor %}
{% endif %}
```

The palette expression mirrors the generator's `PALETTE` (same 8 colors, same sorted order) so the index dot always matches the badges. Renders nothing in the core repo.

## Step 8 — Documentation: `src/userdoc/extensions.md` (new)

Front matter: `title: Extensions`, `layout: default`, `nav_order: 87` (between Contributing 85 and Standard Traceability 90). Content sections (write as normal JTD markdown, links relative as in neighboring pages):

1. **What is a SAF extension** — a fork of this repository plus one data directory `src/_data/extensions/<name>/`; the fork's site renders the core spec plus generated, badge-marked extension pages. No runtime loading; everything is built at deploy time.
2. **Quick start** — fork the repository (the forked site renders out of the box on GitHub Pages, see README "Publishing your fork"); create `src/_data/extensions/<name>/` with `manifest.json` + `viewpoints.json`; add example SVGs under `src/diagrams/extensions/<name>/`; push; Pages deploys.
3. **Manifest** (`manifest.json`): `name*` (must equal the directory name), `title*` (sidebar section + overview heading + badge label), `version`, `author`, `description` (index list + overview), `color` (optional hex; default = 8-color palette assigned by alphabetical position), `specVersion` (informational: which core release the fork tracks, e.g. `"latest"` or a release id).
4. **Data files** (same schemas as the core's `src/_data/` files; all optional except `viewpoints.json`): the 15 tables from the "What an extension can extend" table of this plan's source document — `viewpoints.json`, `mdexamples.json` / `rhyexamples.json` / `eaexamples.json` (`File` relative to `/diagrams/`, use `extensions/<name>/<subdir>/<file>.svg`), `stakeholders.json`, `concerns.json`, `exposes.json`, `realizeconcept.json`, `stereotypes.json`, `scmstereotypes.json`, `special-implementations.json`, `concepts.json`, and the grid-structure tables `domains.json` / `aspects.json` / `domaincolors.json` (see "Grid structure" below).
4b. **Grid structure (domains and aspects)** — an extension may add new grid rows (domains) and columns (aspects):
   - `domains.json` row: `Name`, `ID` (any unique SysML-style ID), `DomainID` (unique single code — must not collide with the core's A/C/O/P/D or other extensions, otherwise the row is skipped with a build warning), `Documentation` (renders on the Domains page).
   - `aspects.json` row: `Name`, `ID`, `AspectID` (must not collide; the grid sorts columns by `AspectID`, so use a value that sorts after the core's 1–8, e.g. `9`), `Documentation` (renders on the Aspects page).
   - `domaincolors.json` row: `{DomainID, Color}` — hex **without** `#` (core file format); the new grid row is colored with it via inline style. Omit it and the generator auto-fills the extension's color.
   - Extension viewpoints then use `Domain: <your domain Name>` / `Aspect: <your aspect Name>` and get their generated page, sidebar entry, and grid cell in the new row/column. New domains/aspects render badge-marked on the data-driven Domains/Aspects pages; core rows/columns are untouched.
5. **Diagrams** — the core keeps `src/diagrams/{concept,examples_md,examples_rhy,examples_ea}/`; an extension mirrors that structure under `src/diagrams/extensions/<name>/` (e.g. `extensions/<name>/examples_md/foo.svg`).
6. **Marking** — every extension contribution renders with a colored badge naming the extension (page heading, reference-table rows, grid dots, index dots, colored grid row for new domains). Choose a distinctive `color` in the manifest; the default palette is assigned automatically.
7. **Rendering** — one page per VP record at `/userdoc/<Domain> Domain/<Name>.html` (same URL scheme as core pages, so existing relative links keep working); one overview page per extension at `/extensions/<name>.html`; a sidebar section per extension; extension VPs appear in the SAF grid cell of their domain/aspect (marked with a dot); the index lists the extensions; generated pages are included in site search.
8. **Rules & limitations (v1)** —
   - **Collision rule (no redeclaration)**: extensions are additive. A row that redeclares an existing record (core or an earlier extension) is skipped with a build warning. Identity keys: viewpoints `Name` + `VP_ID`, stakeholders `ID`, concerns `ID`, stereotypes & scmstereotypes `Name`, special-implementations the (Stereotype, Client, Supplier) triple, concepts `ID`, domains `DomainID`, aspects `AspectID`. In particular, a core stakeholder cannot be redeclared to extend its concern list — a new extension concern appears on the extension's VP pages (badge) but not under an existing core stakeholder on the Stakeholders page; if the extension needs a stakeholder role carrying those concerns, it declares a new stakeholder (new `ID`) and references it from its VPs.
   - **Own-namespace rule**: example rows must reference the extension's own VPs; expose rows must reference the extension's own VPs (the exposed concept may be core — it renders only on the extension's VP pages); realizeconcept rows must reference the extension's own concept **and** its own stereotype — a row touching a core record on either side would otherwise appear on core VP pages or in core stereotype rows. Violations are skipped with a build warning. (Extension stakeholders/stereotypes/concepts referenced *by* extension VPs are fine — they render on the shared reference pages with badges.)
   - VP page paths: a record whose page path collides with an existing page is skipped with a build warning (override a core VP by deleting its wrapper file in your fork).
   - Only userdoc domains are supported — records with `Domain: "SAF Development"` are skipped (dev VPs need `standard-mapping`/concept-diagram data, future work).
   - The hand-written per-domain pages (`conceptual.md` etc.) and the icon guide stay core-only; extension domains render on the data-driven Domains page.
   - Extensions are additive — they never modify core content in v1; core viewpoint pages render exactly as on saf.gfse.org.
   - New stakeholders render on the Stakeholders page (with badge); new concerns render by name + badge in VP pages but have no anchor page (`concerns.html` is hand-written) — reference existing core concerns where possible.
9. **Blessed extensions** — a GfSE extension staged as a fork may be adopted by the core: move its `src/_data/extensions/<name>/` directory and `src/diagrams/extensions/<name>/` into the core repository via PR; it then renders on saf.gfse.org with the same mechanism (the core is not populated this way yet).

## Step 9 — `README.md` (edit, fork only)

Append to the "Publishing your fork on GitHub Pages" section: one paragraph — this fork demonstrates the extension mechanism: the five security (C7) viewpoints are provided as the badge-marked `saf-security` extension instead of core pages; see the built site's [Extensions](/userdoc/extensions.html) page for how to write your own.

## Step 10 — Demo: extract C7 into the `saf-security` extension (fork only)

Programmatic extraction (python or jq) so records are verbatim copies:

1. Read `src/_data/viewpoints.json`, `src/_data/mdexamples.json`, `src/_data/exposes.json`.
2. Write `src/_data/extensions/saf-security/viewpoints.json` = the 5 records with `VP_ID` starting `C7_`; `mdexamples.json` = the 7 rows with `ExampleForVPID` starting `C7_`; `exposes.json` = the 39 rows whose `Viewpoint.Name` is one of the five C7 names.
2b. Move the 7 C7 example SVGs from `src/diagrams/examples_md/` to `src/diagrams/extensions/saf-security/examples_md/` and rewrite their `File` fields in the extension `mdexamples.json` to `extensions/saf-security/examples_md/<file>.svg` (same programmatic step).
3. Write `src/_data/extensions/saf-security/manifest.json` (no `color` — exercises the palette default; `saf-security` sorts first → `#0d6efd`):

```json
{
  "name": "saf-security",
  "title": "SAF Security Extension",
  "version": "0.1.0",
  "author": "GfSE SAF Working Group",
  "description": "The five security viewpoints (C7) of the SAF, provided as an extension to demonstrate the SAF extension mechanism.",
  "specVersion": "latest"
}
```

4. Delete the 5 core wrapper pages: `src/userdoc/Conceptual Domain/{Asset Identification,Impact Analysis,Security Context,Security Risk Analysis,Threat Szenario} Viewpoint.md`.
5. Delete the moved rows from the core `viewpoints.json` (5), `mdexamples.json` (7), `exposes.json` (39).
6. Keep in the core (shared/anchored): `stakeholders.json` (Security Expert and System Architect are referenced by ~45 non-C7 VPs), `concerns.json` (the 11 C7 concerns; anchors live in the hand-written `concerns.html`), `realizeconcept.json`, `stereotypes.json`, `scmstereotypes.json`, `special-implementations.json`, `concepts.json`.

Result: the five C7 pages render at their existing URLs, generated and badge-marked; their sidebar entry moves from "Conceptual Domain" to the "SAF Security Extension" section; grid cells show the 5 C7 dots; the example galleries load their SVGs from `diagrams/extensions/saf-security/examples_md/` (the diagrams structure the user-facing docs describe); all C7 concerns are core concerns → they stay normal links (no badges), proving the concern-list branch works both ways.

## Step 11 — Cleanup of stale plan files

- Delete `SAF_EXTENSION_MECHANISM_PLAN.md` in this fork (stale duplicate of the dropped SDK design; unreferenced — the fork's `index.md` links to `saf-extension-modularization-plan.md`, this file).

## Validation

All builds run in the fork (`bundle install` first if gems are missing).

1. **Baseline**: `bundle exec jekyll build --destination build-baseline` on the fork *before* applying steps 1–9. Keep the output.
2. **Mechanism inertness**: apply steps 1–9 only (no extension data). `bundle exec jekyll build --destination build-mech` and `diff -r build-baseline build-mech` → **no differences** (identity merge, no pages, index section guarded).
3. **Demo build**: apply step 10. `bundle exec jekyll build --destination build-demo` and check:
   - Build log: no errors, no warnings (all C7 rows pass the cross-reference rule; names are free after the wrapper deletion).
   - The 5 C7 pages exist at their old URLs. Security Context page: contains `**C7_SECT** Security Context Viewpoint` **followed by a pill badge** (`saf-ext-badge`, background `#0d6efd`, text "SAF Security Extension"), the Domain/Aspect/Maturity table, Purpose, non-empty Profile Model Reference list, Stakeholder links (Security Expert, System Architect), the Concern list (core concerns → plain links, no badges), example gallery loading the C7_SECT SVG from `diagrams/extensions/saf-security/examples_md/`.
   - Grid: the 5 C7 tooltip anchors contain a `saf-ext-dot` with `title="Provided by the SAF Security Extension extension"`.
   - Index: `# Extensions` section with a dot + `**SAF Security Extension** (0.1.0)` + overview link.
   - `build-demo/extensions/saf-security.html` renders with manifest table and 5 VP links.
   - Core reference pages: Stakeholders/Stereotypes/devdoc-concepts rows carry **no** badge (all core rows untagged); page content otherwise unchanged.
   - All other pages byte-identical to `build-baseline` (differences only: the 5 C7 pages, `index.html`, new `extensions/` files).
   - Cross-link anchors resolve: `stakeholders.html` has the Security Expert / System Architect IDs; `concerns.html` has the C7 concern IDs; `stereotypes.html` has the IDs referenced by the C7 expose rows.
   - **Collision policy**: temporarily add `src/_data/extensions/scratch/` (manifest `name: scratch`, `title: Scratch`; one viewpoints record `Name: "Security Context Viewpoint"`, `Domain: "Conceptual"`) → build → log has the merge-phase redeclaration warning (viewpoints `Name` collision); no scratch page is generated; the C7 pages unchanged. Keep the scratch directory for the next two tests.
   - **Cross-reference rule**: extend the same scratch extension with an `exposes.json` row referencing a core VP name and an `mdexamples.json` row with a core `ExampleForVPID` → build → both rows warned + absent from `ext_*` merges (core VP page content unchanged).
   - **Collision & own-namespace rules**: extend the scratch extension with (a) a `stakeholders.json` row reusing the `ID` of a core stakeholder, (b) a `concepts.json` row reusing a core concept `ID`, (c) a `realizeconcept.json` row with a core `RealizedConcept` and the extension's own `RealizationOfConcept`, (d) a `realizeconcept.json` row with the extension's own new concept but a core `RealizationOfConcept` → build → all four rows warned + absent from the `ext_*` merges; the Stakeholders page has no duplicate H2; the Profile Model Reference on core VP pages and the realized-concepts cell of core stereotype rows are unchanged → delete the scratch directory.
   - **Grid structure**: temporarily add `src/_data/extensions/gridtest/` (manifest `name: gridtest`, `title: Grid Test`, `color: "#123456"`; `domains.json` one row — DomainID `X`, unique `ID`, `Documentation`; `aspects.json` one row — AspectID `9`; `domaincolors.json` one row — `{DomainID: "X", Color: "123456"}`; `viewpoints.json` one row — `Domain`/`Aspect` = the new names, Exposure `BlackBox`, no concerns) → build → the grid has a new `X` row with inline `background-color: #123456` and a new last column; the new VP page renders badge-marked at `userdoc/<Domain> Domain/<Name>.html`; `domains.html` / `aspects.html` have the badge-marked H2 entries → delete the scratch directory. Then add a second scratch extension `gridtest2` with a `domains.json` row but **no** `domaincolors.json` row → its grid row falls back to its palette color (auto-fill) → delete.
4. **Serve**: `bundle exec jekyll serve --port 4000` → in a browser: open `/` (Extensions section with dot, grid dots hover); open `/extensions/saf-security.html`; open the Security Context page — badge visible next to the heading, nav section, maturity badge image, example gallery, stakeholder/concern links resolve, `examplegallery.js` loads from the baseurl-scoped path.

## Porting to the core (follow-up, not part of this plan)

- PR to `GfSE/SAF-Specification`: steps 1–9 only (generator + badge include + template renames + `extensions.md` doc + index section). In the core the mechanism is inert (no `src/_data/extensions/`); the core's `index.md` has no fork callout — only the guarded Extensions section is added.
- Blessing a GfSE extension = a follow-up PR adding its `src/_data/extensions/<name>/` + `src/diagrams/extensions/<name>/` to the core → it renders badge-marked on saf.gfse.org.
- Staging: GfSE forks (e.g. `GfSE/SAF-Specification-security`) each render their extension on their own project page, no core change needed.

## Assumptions & limitations

- **v1 reference & collision rules (open — grill Q1)**: extension rows are additive — no redeclaration of existing records (identity keys per table), examples/exposes reference only the extension's own VPs, realizeconcept rows only the extension's own concepts + own stereotypes; violations are skipped with a build warning. If the decision goes the other way (allow annotating core records), the generator's filter blocks go away — but then core VP pages gain content (badges on profile-model-reference items and gallery items would also need adding, currently out of scope), core stakeholder rows gain concern entries, and core stereotype rows gain realized-concept entries.
- v1 is **additive**: extensions add pages and reference-table rows (badge-marked); core viewpoint pages stay content-identical. Overriding a core VP in a fork is possible (delete its wrapper) but is a fork-local decision.
- v1 supports **userdoc domains only**; `Domain: "SAF Development"` records are skipped with a warning (dev VPs need `standard-mapping`/concept-diagram tables — future work, would also merge those 4 tables and badge `dev-viewpoint.md`).
- Extension VPs may use **new** domains/aspects defined by the extension: unique `DomainID`/`AspectID` (collision → skipped with a build warning), grid row colored from the extension's `domaincolors.json` row (auto-filled with the extension's color if omitted), badge-marked entries on the data-driven Domains/Aspects pages. Core domain rows/columns stay untouched (hard-coded CSS classes, no inline styles).
- New **concerns** render by name + badge but have no anchor page (hand-written `concerns.html`); making it data-driven is a v2 candidate.
- Unrendered core tables (`ffds.json`, `sysmlstereotypes.json`, `umlmetaclasses.json`) have no extension surface until they get a rendering page (the "Used SysML Stereotypes" TODO on the Stereotypes page).
- Forks track the core's `main`; `specVersion` is informational. Merging upstream changes is the fork author's job.
- Sidebar section order: extension sections sort after all core sections (`nav_order` base ≥ 200); multiple extensions sort alphabetically by directory name (= palette order).
- Badge colors: default palette (8 colors, alphabetical assignment) unless `color` is set; two extensions may share a color — the title disambiguates.
- Generated pages have no file on disk; they are invisible to tools that read the source tree. JTD search indexes the rendered site, so search still covers them.
- The generator relies on `Jekyll::Page.new(source, base, dir, name, data)` + `instance_variable_set(:@content, …)` and on `site.data` mutation being visible to the render phase (Jekyll 4.x per the fork Gemfile); Validation steps 2–3 are the proof.
