export interface MvpPixel {
  x: number;
  y: number;
  color: string;
}

export interface MvpComponent {
  layer_order: number;
  anchor: { x: number; y: number };
  pixels: MvpPixel[];
}

export interface MvpAnimFrame {
  [componentName: string]: MvpComponent;
}

export interface MvpAnimDef {
  fps: number;
  loop: boolean;
  frameCount: number;
  frames: (MvpAnimFrame | null)[];
}

export interface MvpSpriteDef {
  meta: {
    name: string;
    type: string;
    base_grid: string;
    scale_factor: number;
    global_anchor: { x: number; y: number };
  };
  palette: Record<string, string>;
  components: Record<string, MvpComponent>;
  animations: Record<string, MvpAnimDef>;
}

const mvpSpriteCache = new Map<string, MvpSpriteDef>();

export async function loadMvpSprite(path: string): Promise<MvpSpriteDef> {
  const cached = mvpSpriteCache.get(path);
  if (cached) return cached;

  const response = await fetch(path);
  const def: MvpSpriteDef = await response.json();
  mvpSpriteCache.set(path, def);
  return def;
}

export function extractAnimManifest(
  def: MvpSpriteDef
): Record<string, { fps: number; loop: boolean; frameCount: number; startCol: number; row: number }> {
  const manifest: Record<string, { fps: number; loop: boolean; frameCount: number; startCol: number; row: number }> = {};
  for (const [name, anim] of Object.entries(def.animations)) {
    manifest[name] = {
      fps: anim.fps,
      loop: anim.loop,
      frameCount: anim.frameCount,
      startCol: 0,
      row: 0,
    };
  }
  return manifest;
}

function resolveColor(color: string, palette: Record<string, string>): string {
  if (color.startsWith('rgba') || color.startsWith('rgb') || color.startsWith('#')) {
    return color;
  }
  return palette[color] || color;
}

export function drawMvpFrame(
  ctx: CanvasRenderingContext2D,
  def: MvpSpriteDef,
  animName: string,
  frameIndex: number,
  dx: number,
  dy: number,
  scale: number,
  flipX: boolean
): void {
  const animDef = def.animations[animName];
  if (!animDef) return;

  const clampedIndex = Math.max(0, Math.min(frameIndex, animDef.frameCount - 1));
  const frameOverride = animDef.frames[clampedIndex];

  const resolvedComponents: Record<string, MvpComponent> = {};
  for (const [name, baseComponent] of Object.entries(def.components)) {
    if (frameOverride && frameOverride[name]) {
      resolvedComponents[name] = frameOverride[name];
    } else {
      resolvedComponents[name] = baseComponent;
    }
  }

  const sortedNames = Object.keys(resolvedComponents).sort(
    (a, b) => resolvedComponents[a].layer_order - resolvedComponents[b].layer_order
  );

  ctx.imageSmoothingEnabled = false;
  ctx.save();

  if (flipX) {
    ctx.translate(dx + scale * 16, dy);
    ctx.scale(-1, 1);
  } else {
    ctx.translate(dx, dy);
  }

  for (const name of sortedNames) {
    const component = resolvedComponents[name];
    for (const pixel of component.pixels) {
      const color = resolveColor(pixel.color, def.palette);
      ctx.fillStyle = color;
      ctx.fillRect(pixel.x * scale, pixel.y * scale, scale, scale);
    }
  }

  ctx.restore();
}
