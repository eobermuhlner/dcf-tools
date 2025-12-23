# DCF Viewer — Render Mapping Instructions (MVP)

## Audience

These instructions are written for **Claude Code** (or another agentic coding AI) to implement a **visual renderer** for a DCF viewer.

The viewer currently shows raw JSON fields. The goal is to map DCF elements to **visual UI elements** rendered using **HTML/CSS (DOM)**.

---

## Goal

Replace the JSON-only preview with a **visual layout preview**.

### Rendering pipeline

```
DCF JSON
  → Render AST (internal, render-friendly)
  → DOM elements (React + CSS)
```

This is a **read-only MVP**.

---

## Scope

### Supported (MVP)

* Containers / frames with children
* Text elements
* Optional: images
* Flex layout (row / column)
* Padding, margin
* Background color
* Border, border radius
* Box shadow
* Typography (font size, weight, color, alignment)

### Explicitly NOT included

* Editing / drag & drop
* Selection / inspector
* Absolute positioning
* Animations
* Pixel-perfect fidelity

Graceful degradation is required:

* Unknown elements must render as placeholder boxes
* Renderer must never crash

---

## Step 0 — Inspect existing code

Locate:

* Where the DCF JSON is loaded
* Where the viewer currently renders JSON fields
* How element **type**, **children**, **style**, and **layout** are represented

Avoid hardcoding assumptions unless unavoidable. Prefer heuristics.

---

## Step 1 — Render AST types

Create `src/render/RenderAst.ts`:

```ts
export type RenderNode =
  | { kind: "frame"; id: string; layout?: Layout; style?: Style; children: RenderNode[]; label?: string }
  | { kind: "text"; id: string; text: string; style?: TextStyle }
  | { kind: "image"; id: string; src: string; style?: Style }
  | { kind: "unknown"; id: string; label: string; rawType?: string; style?: Style; children?: RenderNode[]; raw?: any };

export type Layout =
  | { type: "flex"; direction: "row" | "column"; gap?: number; align?: Align; justify?: Justify; wrap?: boolean }
  | { type: "none" };

export type Align = "start" | "center" | "end" | "stretch";
export type Justify = "start" | "center" | "end" | "space-between" | "space-around" | "space-evenly";

export type Spacing = number | { top: number; right: number; bottom: number; left: number };

export type Shadow = { x: number; y: number; blur: number; spread?: number; color: string };

export type Style = {
  width?: number | "auto";
  height?: number | "auto";
  minWidth?: number; maxWidth?: number;
  minHeight?: number; maxHeight?: number;
  padding?: Spacing;
  margin?: Spacing;
  background?: string;
  borderColor?: string; borderWidth?: number; borderRadius?: number;
  opacity?: number;
  shadow?: Shadow;
};

export type TextStyle = Style & {
  color?: string;
  fontSize?: number;
  fontWeight?: number | string;
  fontFamily?: string;
  lineHeight?: number;
  textAlign?: "left" | "center" | "right";
};
```

---

## Step 2 — DCF → Render AST mapping

Create `src/render/dcfToRenderTree.ts`.

### Requirements

* Never throw on unknown structures
* Preserve hierarchy
* Use heuristics for field names
* Generate stable IDs

### Heuristic helpers

Implement:

* `getElementType(obj)` → `type | kind | element | elementType | name`
* `getChildren(obj)` → `children | elements | nodes | content[]`
* `getText(obj)` → `text | value | label | content (string)`
* `getImageSrc(obj)` → `src | url | image | assetUrl`
* `getStyle(obj)` → `style | styles | props.style`
* `getLayout(obj)` → `layout | props.layout`

IDs:

* Prefer `obj.id`
* Otherwise path-based (`node-root-0-1`)

### Mapping rules

1. Has children → `frame`
2. Has text → `text`
3. Has image source → `image`
4. Otherwise → `unknown`

Unknown nodes must:

* Render a placeholder
* Still render children

---

## Step 3 — Layout mapping (MVP)

* Direction:

    * row / horizontal → `flex row`
    * column / vertical → `flex column`
* Check fields:

    * `direction`, `orientation`, `axis`, `layoutDirection`
* Spacing:

    * `gap`, `spacing`, `itemSpacing`
* Alignment:

    * `align`, `alignItems`
    * `justify`, `justifyContent`

Default:

* Frames with children → `flex column`

---

## Step 4 — Style mapping (MVP)

Extract:

* padding / margin
* background color
* border (color + width)
* border radius
* shadow
* width / height (numbers only)
* opacity

Text-specific:

* fontSize
* fontWeight
* fontFamily
* lineHeight
* color
* textAlign

Ignore unsupported fields silently.

---

## Step 5 — Render AST → CSS

Create `src/render/renderNodeToCss.ts`.

Requirements:

* Output `React.CSSProperties`
* Convert spacing objects to CSS longhands
* Map layout → flexbox

Defaults:

* `boxSizing: "border-box"`
* Frames use `display: flex`
* Text uses `display: block`

---

## Step 6 — DOM renderer

Create `src/render/RenderNodeView.tsx`.

```tsx
export function RenderNodeView({ node }: { node: RenderNode }) {
  if (node.kind === "frame") {
    return (
      <div style={cssForNode(node)} data-nodeid={node.id}>
        {node.children.map(ch => (
          <RenderNodeView key={ch.id} node={ch} />
        ))}
      </div>
    );
  }

  if (node.kind === "text") {
    return <div style={cssForNode(node)}>{node.text}</div>;
  }

  if (node.kind === "image") {
    return <img style={cssForNode(node)} src={node.src} alt="" />;
  }

  return (
    <div style={cssForNode(node)}>
      <div style={{ fontSize: 12, opacity: 0.6, padding: 4 }}>
        [{node.label}]
      </div>
      {node.children?.map(ch => (
        <RenderNodeView key={ch.id} node={ch} />
      ))}
    </div>
  );
}
```

Unknown nodes should use:

* dashed border
* light background

---

## Step 7 — Viewer integration

1. Convert loaded DCF JSON using `dcfToRenderTree`
2. Render using `<RenderNodeView />`
3. Keep JSON view behind a toggle if possible

---

## Step 8 — Sample files

Add `samples/`:

* `basic.json` — container + padding + background + text
* `row.json` — row layout with gap
* `unknown.json` — unknown type with children

---

## Acceptance criteria

* Viewer shows visual boxes/text
* Layout changes affect preview
* Unknown nodes do not crash renderer
* Missing fields are tolerated
* Tree structure matches JSON

---

## Constraints

* No editing
* No absolute positioning
* No advanced layout engine
* No pixel-perfect fidelity
* No crashes

---

## Expected output

Claude Code should:

1. Add Render AST types
2. Implement DCF → Render AST mapper
3. Implement CSS mapping
4. Implement recursive DOM renderer
5. Wire into viewer
6. Add sample JSON files

---

End of instructions.
