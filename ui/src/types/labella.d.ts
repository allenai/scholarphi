declare module "labella" {
  export class Node {
    constructor(idealPos: number, width: Number, data?: any);
    idealPos: number;
    currentPos: number;
    width: number;
    data?: any;
    getLayerIndex(): number;
  }

  export class Renderer {
    constructor(options: RenderOptions);
    generatePath(node: Node): string;
    getWaypoints(node: Node): [number, number][];
    layout(nodes: Node[]): Node[];
  }

  interface RenderOptions {
    layerGap?: number;
    nodeHeight?: number;
    direction?: "up" | "down" | "left" | "right";
  }

  export class Force {
    constructor(options?: ForceOptions);
    nodes(nodes: Node[]): Force;
    options(options: ForceOptions);
    compute(): Force;
  }

  interface ForceOptions {
    minPos?: number | null;
    maxPos?: number | null;
    lineSpacing?: number;
    nodeSpacing?: number;
    algorithm?: "overlap" | "simple" | "none";
    density?: number;
    stubWidth?: number;
  }
}
