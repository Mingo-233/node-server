export const LAYER_KNIFE = 1 << 0; // 0001
export const LAYER_MARK = 1 << 1; // 0010
export const LAYER_DESIGN = 1 << 2; // 0100
export const LAYER_INSIDE_DESIGN = 1 << 3; // 1000

export const TYPE_MARK = LAYER_MARK; // 0010 (存在标注层)
export const TYPE_OUTSIDE_DESIGN = LAYER_DESIGN; // 0100 (存在设计层)
export const TYPE_INSIDE_DESIGN = LAYER_INSIDE_DESIGN; // 1000 (存在内部设计层)
