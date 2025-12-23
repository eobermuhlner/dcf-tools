export type RenderNode =
  | { kind: "frame"; id: string; layout?: Layout; style?: Style; children: RenderNode[]; label?: string }
  | { kind: "text"; id: string; text: string; style?: TextStyle; label?: string }
  | { kind: "image"; id: string; src: string; style?: Style; label?: string }
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