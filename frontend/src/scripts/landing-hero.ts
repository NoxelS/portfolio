/**
 * Landing Hero — client-side halftone mesh animation.
 *
 * Progressive enhancement: initialises OGL (WebGL2) instanced rendering with
 * a Canvas 2D fallback on any context / shader failure.  All deformation,
 * intensity, and colour math are preserved verbatim from the original
 * single-script `LandingHero.astro` implementation.
 *
 * Entry point: call `init(landingEl, frameEl, canvasEl)` with the outer
 * 100 vh landing section, the #mesh-frame div, and the canvas element.
 */

import { Renderer, Program, InstancedMesh } from 'ogl';

// ---------------------------------------------------------------------------
// Constants (identical to the original implementation)
// ---------------------------------------------------------------------------

const LOGICAL_WIDTH = 1600;
const LOGICAL_HEIGHT = 760;
const SPACING = 9;
const VERTS_PER_QUAD = 4;

// ---------------------------------------------------------------------------
// Animation knobs — adjust these values to tune the mesh's feel.
// ---------------------------------------------------------------------------

// Idle wobble: strength of the slow ambient movement when the pointer is still.
const IDLE_WOBBLE_X_PRIMARY = 0.44;
const IDLE_WOBBLE_X_SECONDARY = 0.45;
const IDLE_WOBBLE_Y_PRIMARY = 0.41;
const IDLE_WOBBLE_Y_SECONDARY = 0.44;

// Idle wobble: oscillation speeds in radians-per-second units (lower is slower).
const IDLE_WOBBLE_X_PRIMARY_SPEED = 0.25;
const IDLE_WOBBLE_X_SECONDARY_SPEED = 0.21;
const IDLE_WOBBLE_Y_PRIMARY_SPEED = 0.20;
const IDLE_WOBBLE_Y_SECONDARY_SPEED = 0.23;

// Pointer response: how strongly pointer movement adds momentum to the mesh.
const POINTER_IMPULSE = 50;
const MAX_POINTER_VELOCITY = 0.25;

// Pointer inertia: friction affects only pointer velocity; the spring controls
// how quickly the pointer-induced offset returns to the idle wobble.
const POINTER_VELOCITY_DAMPING = 1.35;
const POINTER_RETURN_SPRING = 0.7;

// Rendering: cap large timing jumps and draw at roughly 30 frames per second.
const MAX_DELTA_SECONDS = 0.05;
const DRAW_INTERVAL_MS = 33;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MeshPoint {
    sourceX: number;
    sourceY: number;
    layer: 0 | 1;
    radius: number;
    color: string;
    alpha: number;
    // Cached RGB — pre-computed once at init to avoid per-frame hslToRgb regex
    _r: number;
    _g: number;
    _b: number;
}

// ---------------------------------------------------------------------------
// WebGL shaders — deformation + projection all in the vertex shader
// ---------------------------------------------------------------------------

const VERTEX_SHADER = /* glsl */ `#version 300 es
    precision highp float;

    // Per-quad-vertex base position (the quad corners).
    in vec2 aPosition;

    // Per-point index, repeated 4x for the quad vertices.
    in float aPointIndex;

    // Source position (x, y), repeated 4x per point.
    in vec2 aSourcePos;

    // Radius, repeated 4x per point.
    in float aRadius;

    // Colour (rgba), repeated 4x per point.
    in vec4 aColor;

    uniform mat4 uProjectionMatrix;
    uniform vec2 uMeshDimensions;
    uniform float uTime;
    uniform vec2 uMouse;

    out vec4 vColor;
    out vec2 vLocalPos;

    vec2 vortex(vec2 p, vec2 centre, float radius, float strength) {
        vec2 d  = p - centre;
        float dist = length(d);
        float falloff = exp(-(dist * dist) / (radius * radius));
        return vec2(-d.y, d.x) * strength * falloff;
    }

    void main() {
        // Which point this vertex belongs to.
        int idx = int(aPointIndex);

        // Normalised source position.
        vec2 uv = aSourcePos / uMeshDimensions;
        float layerF = aSourcePos.x > 800.0 ? 1.0 : 0.0;

        float wave1 = sin(uv.x * 12.0 + uv.y * 7.0 + layerF * 0.7 + uMouse.x * 1.8);
        float wave2 = sin(uv.x * 5.0  - uv.y * 13.0 - layerF * 0.45 + uMouse.y * 1.5);
        float wave3 = cos(uv.x * 18.0 + uv.y * 4.5 + (uMouse.x - uMouse.y) * 1.2);

        float dx = 24.0 * wave1 + 11.0 * wave2 + 6.0 * wave3
                 + 4.0 * sin(uv.x * 42.0 - uv.y * 31.0 + uMouse.x * 1.6);
        float dy = 18.0 * sin(uv.x * 8.2 - uv.y * 5.5 + uMouse.y * 1.4)
                 + 10.0 * cos(uv.x * 4.0 + uv.y * 12.5 + uMouse.x * 1.1)
                 + 4.0 * cos(uv.x * 34.0 + uv.y * 39.0 + uMouse.y * 1.5);

        vec2 lv = vortex(aSourcePos,
            vec2(425.0 + uMouse.x * 80.0, 350.0 + uMouse.y * 50.0),
            410.0, layerF == 0.0 ? 0.13 : -0.08);
        vec2 rv = vortex(aSourcePos,
            vec2(1290.0 - uMouse.x * 70.0, 400.0 - uMouse.y * 55.0),
            460.0, layerF == 0.0 ? -0.12 : 0.075);

        vec2 centre = vec2(880.0 + uMouse.x * 45.0, 330.0 + uMouse.y * 35.0);
        vec2 cd   = aSourcePos - centre;
        float cf  = exp(-(cd.x * cd.x + cd.y * cd.y) / (350.0 * 350.0));

        vec2 warped = aSourcePos
                    + vec2(dx, dy)
                    + lv + rv
                    + cd * 0.13 * cf;

        vec2 scale = vec2(aRadius * 2.0);
        vec2 finalPos = warped + aPosition * scale;

        gl_Position = uProjectionMatrix * vec4(finalPos, 0.0, 1.0);

        vColor      = aColor;
        vLocalPos   = aPosition * scale;
    }
`;

const FRAGMENT_SHADER = /* glsl */ `#version 300 es
    precision highp float;

    in vec4 vColor;
    in vec2 vLocalPos;
    out vec4 fragColor;

    float sdTeardrop(vec2 p) {
        float dCircle = length(p) - 1.0;
        float dTri    = max(length(p - vec2(0.0, 0.15)) - 1.15, -p.y);
        float k       = clamp(0.5 + 0.5 * (dCircle - dTri) / 0.3, 0.0, 1.0);
        return mix(dTri, dCircle, k) - 0.3 * k * (1.0 - k);
    }

    void main() {
        float d  = sdTeardrop(vLocalPos);
        float alpha = 1.0 - smoothstep(0.0, 0.04, d);
        fragColor = vec4(vColor.rgb, vColor.a * alpha);
    }
`;

// ---------------------------------------------------------------------------
// Quad base geometry (TRIANGLE_STRIP: 4 vertices)
// ---------------------------------------------------------------------------

const QUAD_POSITIONS = new Float32Array([-1, -1,  1, -1,  1,  1,  -1,  1]);

// ---------------------------------------------------------------------------
// Math helpers (identical to the original implementation)
// ---------------------------------------------------------------------------

function hslToRgb(hsl: string): [number, number, number] {
    const m = hsl.match(/(\d+)[°%]?\s*(\d+)[%]?\s*(\d+)[%]?/);
    if (!m) return [0.5, 0.5, 0.5];
    const h = (+m[1] / 360) | 0, s = (+m[2] / 100) | 0, l = (+m[3] / 100) | 0;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h * 6) % 2 - 1));
    const m1 = l - c / 2;
    let r = 0, g = 0, b = 0;
    if (h < 1 / 6)      { r = c; g = x; }
    else if (h < 2 / 6) { r = x; g = c; }
    else if (h < 3 / 6) { g = c; b = x; }
    else if (h < 4 / 6) { g = x; b = c; }
    else if (h < 5 / 6) { r = x; b = c; }
    else                { r = c; b = x; }
    return [r + m1, g + m1, b + m1];
}

function intensity(x: number, y: number, layer = 0) {
    const nx = x / LOGICAL_WIDTH, ny = y / LOGICAL_HEIGHT;
    const ls = layer * 0.035;
    const field =
        heatRegion(nx, ny, 0.1 + ls, 0.18, 0.17, 0.14, 0.82) +
        heatRegion(nx, ny, 0.18 - ls, 0.48, 0.1, 0.12, 0.36) +
        heatRegion(nx, ny, 0.28 - ls, 0.7, 0.15, 0.16, 0.72) +
        heatRegion(nx, ny, 0.48 + ls, 0.34, 0.18, 0.13, 0.66) +
        heatRegion(nx, ny, 0.54 - ls, 0.58, 0.11, 0.1, 0.34) +
        heatRegion(nx, ny, 0.66 - ls, 0.78, 0.16, 0.15, 0.7) +
        heatRegion(nx, ny, 0.84 + ls, 0.26, 0.14, 0.13, 0.76) +
        heatRegion(nx, ny, 0.93 - ls, 0.66, 0.12, 0.15, 0.52) -
        heatRegion(nx, ny, 0.38, 0.48, 0.22, 0.24, 0.22) -
        heatRegion(nx, ny, 0.74, 0.48, 0.2, 0.22, 0.18) +
        0.07 * (Math.sin(nx * 18 + ny * 8 + layer) + Math.cos(nx * 11 - ny * 20)) +
        0.035 * Math.sin(nx * 38 - ny * 29 + layer * 1.7);
    const ambient = 0.08 + 0.08 * (1 - ny) + 0.04 * (1 - nx);
    return Math.max(0, Math.min(1, field + ambient));
}

function heatRegion(
    nx: number, ny: number,
    cx: number, cy: number,
    rx: number, ry: number, strength: number,
) {
    const dx = (nx - cx) / rx, dy = (ny - cy) / ry;
    return Math.exp(-(dx * dx + dy * dy)) * strength;
}

function colourAt(x: number, y: number, brightness: number, layer: number) {
    const nx = x / LOGICAL_WIDTH, ny = y / LOGICAL_HEIGHT;
    return `hsl(${181 + nx * 9} ${18 + (1 - nx) * 13}% ${45 + brightness * 39 + (1 - ny) * 5 - layer * 7}%)`;
}

function createPoints(layer: 0 | 1): MeshPoint[] {
    const pts: MeshPoint[] = [];
    const off = layer === 0 ? 0 : SPACING / 2;
    for (let y = -40; y <= LOGICAL_HEIGHT + 40; y += SPACING) {
        for (let x = -40; x <= LOGICAL_WIDTH + 40; x += SPACING) {
            const sx = x + off, sy = y + off;
            const v = intensity(sx, sy, layer);
            if (v < (layer === 0 ? 0.08 : 0.19)) continue;
            const c = colourAt(sx, sy, v, layer);
            const [cr, cg, cb] = hslToRgb(c);
            pts.push({
                sourceX: sx,
                sourceY: sy,
                layer,
                radius: layer === 0
                    ? 2 + Math.pow(v, 1.45) * 5.8
                    : 1.55 + Math.pow(v, 0.2) * 3.9,
                color: c,
                alpha: layer === 0
                    ? 0.2 + v * 0.72
                    : 0.08 + v * 0.3,
                _r: cr, _g: cg, _b: cb,
            });
        }
    }
    return pts;
}

// ---------------------------------------------------------------------------
// Canvas 2D fallback (pixel-identical to original)
// ---------------------------------------------------------------------------

// Pre-built teardrop Path2D — reused for every dot in the Canvas 2D fallback.
const TEARDROP_PATH = new Path2D(
    'M 0 -1 C 0.18 -0.74 0.28 -0.46 0.48 -0.48 C 0.7 -0.5 0.9 -0.34 1 0 C 0.9 0.34 0.7 0.5 0.48 0.48 C 0.28 0.46 0.18 0.74 0 1 C -0.18 0.74 -0.28 0.46 -0.48 0.48 C -0.7 0.5 -0.9 0.34 -1 0 C -0.9 -0.34 -0.7 -0.5 -0.48 -0.48 C -0.28 -0.46 -0.18 0.74 0 -1 Z',
);

function drawFallback(ctx: CanvasRenderingContext2D | null, points: MeshPoint[], mouseX = 0, mouseY = 0) {
    if (!ctx) return;
    const canvas = ctx.canvas;
    const bounds = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const pw = Math.max(1, Math.round(bounds.width * dpr));
    const ph = Math.max(1, Math.round(bounds.height * dpr));

    if (canvas.width !== pw || canvas.height !== ph) {
        canvas.width = pw;
        canvas.height = ph;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, pw, ph);
    }

    ctx.clearRect(0, 0, pw, ph);

    const scale = Math.max(pw / LOGICAL_WIDTH, ph / LOGICAL_HEIGHT);
    const ox = (pw - LOGICAL_WIDTH * scale) / 2;
    const oy = (ph - LOGICAL_HEIGHT * scale) / 2;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;

    for (const pt of points) {
        const warped = deform(pt.sourceX, pt.sourceY, pt.layer, mouseX, mouseY);
        ctx.setTransform(
            scale * pt.radius, 0,
            0, scale * pt.radius,
            ox + warped.x * scale,
            oy + warped.y * scale,
        );
        ctx.fillStyle = pt.color;
        ctx.globalAlpha = pt.alpha;
        ctx.fill(TEARDROP_PATH);
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
}

// Deformation logic (for Canvas 2D fallback).
function deform(
    x: number, y: number,
    layer = 0, mouseX = 0, mouseY = 0,
) {
    const nx = x / LOGICAL_WIDTH, ny = y / LOGICAL_HEIGHT;
    const wave1 = Math.sin(nx * 12 + ny * 7 + layer * 0.7 + mouseX * 1.8);
    const wave2 = Math.sin(nx * 5 - ny * 13 - layer * 0.45 + mouseY * 1.5);
    const wave3 = Math.cos(nx * 18 + ny * 4.5 + (mouseX - mouseY) * 1.2);
    let dx = 24 * wave1 + 11 * wave2 + 6 * wave3
        + 4 * Math.sin(nx * 42 - ny * 31 + mouseX * 1.6);
    let dy = 18 * Math.sin(nx * 8.2 - ny * 5.5 + mouseY * 1.4)
        + 10 * Math.cos(nx * 4 + ny * 12.5 + mouseX * 1.1)
        + 4 * Math.cos(nx * 34 + ny * 39 + mouseY * 1.5);

    const lv = vortex(x, y, 425 + mouseX * 80, 350 + mouseY * 50, 410,
        layer === 0 ? 0.13 : -0.08);
    const rv = vortex(x, y, 1290 - mouseX * 70, 400 - mouseY * 55, 460,
        layer === 0 ? -0.12 : 0.075);
    dx += lv.x + rv.x; dy += lv.y + rv.y;

    const cx = 880 + mouseX * 45, cy = 330 + mouseY * 35;
    const cdx = x - cx, cdy = y - cy;
    const cf = Math.exp(-(cdx * cdx + cdy * cdy) / (350 * 350));

    return { x: x + dx + cdx * 0.13 * cf, y: y + dy + cdy * 0.08 * cf };
}

function vortex(
    x: number, y: number, cx: number, cy: number,
    radius: number, strength: number,
) {
    const dx = x - cx, dy = y - cy;
    const dist = Math.hypot(dx, dy);
    const falloff = Math.exp(-(dist * dist) / (radius * radius));
    return { x: -dy * strength * falloff, y: dx * strength * falloff };
}

// ---------------------------------------------------------------------------
// OGL WebGL renderer
// ---------------------------------------------------------------------------

interface OglHandle {
    draw: (points: MeshPoint[], mouseX: number, mouseY: number, time: number) => void;
    resize: () => void;
    dispose: () => void;
}

/** Build an orthographic projection matrix: mesh logical coords → NDC with letterboxing. */
function buildProjectionMatrix(canvasW: number, canvasH: number): Float32Array {
    const aspect = canvasW / canvasH;
    const meshAspect = LOGICAL_WIDTH / LOGICAL_HEIGHT;

    // Uniform scale to fit the mesh to the smaller canvas dimension,
    // preserving aspect ratio (letterboxing).
    const scale = aspect > meshAspect
        ? canvasH * meshAspect / canvasW   // canvas is wider → letterbox sides
        : canvasW / (canvasH * meshAspect); // canvas is taller → letterbox top/bottom

    const l = -LOGICAL_WIDTH * scale / 2;
    const r =  LOGICAL_WIDTH * scale / 2;
    const t =  LOGICAL_HEIGHT * scale / 2;
    const b = -LOGICAL_HEIGHT * scale / 2;

    // Orthographic projection (column-major).
    const m = new Float32Array(16);
    m[0]  = 2 / (r - l);        m[2]  = 0;                  m[8]  = -(r + l) / (r - l); m[12] = 0;
    m[1]  = 0;                  m[5]  = 2 / (t - b);        m[9]  = -(t + b) / (t - b); m[13] = 0;
    m[3]  = 0;                  m[7]  = 0;                  m[11] = -1;                 m[15] = 1;
    m[4]  = 0;                  m[6]  = 0;                  m[10] = 0;                 m[14] = 0;
    return m;
}

function initOgl(
    canvas: HTMLCanvasElement,
    points: MeshPoint[],
): OglHandle | null {
    try {
        // ── WebGL context & renderer ────────────────────────────────────
        const gl = canvas.getContext('webgl2', { alpha: true, depth: false });
        if (!gl) return null;

        const renderer = new Renderer({ canvas, alpha: true, depth: false, antialias: false });
        renderer.gl.clearColor(0, 0, 0, 0);

        // ── Shader program ──────────────────────────────────────────────
        const program = new Program(gl, {
            vertex: VERTEX_SHADER,
            fragment: FRAGMENT_SHADER,
            transparent: true,
            cullFace: false,
            depthTest: false,
            depthWrite: false,
            uniforms: {
                uProjectionMatrix: { value: new Float32Array(16) },
                uMeshDimensions:   { value: new Float32Array([LOGICAL_WIDTH, LOGICAL_HEIGHT]) },
                uTime:             { value: 0 },
                uMouse:            { value: new Float32Array([0, 0]) },
            },
        });

        // ── Base quad geometry (non-instanced, 4 vertices) ──────────────
        const baseGeom = new Geometry(gl, {
            position: { data: QUAD_POSITIONS, size: 2 },
        });

        // ── Per-vertex data buffers (duplicated 4× for TRIANGLE_STRIP)
        //     Each point contributes 4 vertices; per-point data is repeated
        //     for all 4 vertices. This avoids relying on gl_InstanceID or
        //     instanced attribute divisors, making it compatible with all
        //     OGL rendering paths.
        const totalVerts = points.length * VERTS_PER_QUAD;

        // aPointIndex: [0,0,0,0, 1,1,1,1, 2,2,2,2, …]
        const pointIndexData = new Float32Array(totalVerts);
        // aSourcePos: [sx,sy, sx,sy, sx,sy, sx,sy, …]  (8 floats per point)
        const sourcePosData = new Float32Array(totalVerts * 2);
        // aRadius: [r,r,r,r, r,r,r,r, …]  (4 floats per point)
        const radiusData = new Float32Array(totalVerts);
        // aColor: [r,g,b,a, r,g,b,a, …]  (16 floats per point)
        const colorData = new Float32Array(totalVerts * 4);

        // Pre-fill all per-vertex data (static — uploaded once).
        for (let i = 0; i < points.length; i++) {
            const pt = points[i];
            const o = i * VERTS_PER_QUAD;

            // Point index (same for all 4 vertices).
            for (let v = 0; v < VERTS_PER_QUAD; v++) {
                pointIndexData[o + v] = i;
            }

            // Source position (repeated 4×).
            const so = o * 2;
            sourcePosData[so]     = pt.sourceX;
            sourcePosData[so + 1] = pt.sourceY;
            sourcePosData[so + 2] = pt.sourceX;
            sourcePosData[so + 3] = pt.sourceY;
            sourcePosData[so + 4] = pt.sourceX;
            sourcePosData[so + 5] = pt.sourceY;
            sourcePosData[so + 6] = pt.sourceX;
            sourcePosData[so + 7] = pt.sourceY;

            // Radius (repeated 4×).
            for (let v = 0; v < VERTS_PER_QUAD; v++) {
                radiusData[o + v] = pt.radius;
            }

            // Colour (static).
            const r = pt._r, g = pt._g, b = pt._b, a = pt.alpha;
            const co = o * 4;
            for (let v = 0; v < VERTS_PER_QUAD; v++) {
                const vo = co + v * 4;
                colorData[vo]     = r;
                colorData[vo + 1] = g;
                colorData[vo + 2] = b;
                colorData[vo + 3] = a;
            }
        }

        // ── Instanced geometry (all attributes flat per-vertex) ─────────
        //     All attributes are per-vertex (non-instanced). The geometry's
        //     instancedCount is set to points.length each frame so that
        //     InstancedMesh.draw() calls drawArraysInstanced(…, count, N).
        const instGeom = new Geometry(gl, {
            position:   { data: QUAD_POSITIONS,      size: 2 },
            pointIndex: { data: pointIndexData,       size: 1 },
            sourcePos:  { data: sourcePosData,        size: 2 },
            radius:     { data: radiusData,           size: 1 },
            color:      { data: colorData,            size: 4 },
        });

        const mesh = new InstancedMesh(instGeom, program);
        mesh.frustumCulled = false;

        const scene = {
            children: [mesh],
            traverse: (cb: (n: any) => void) => { for (const c of scene.children) cb(c); },
            updateMatrixWorld: () => {},
        };

        // ── Projection matrix (updated on resize) ───────────────────────
        let cw = renderer.width, ch = renderer.height;
        let projectionMatrix = buildProjectionMatrix(cw, ch);

        function resize() {
            const b = canvas.getBoundingClientRect();
            const nw = Math.max(1, Math.round(b.width));
            const nh = Math.max(1, Math.round(b.height));
            if (nw === cw && nh === ch) return;
            cw = nw; ch = nh;
            renderer.setSize(nw, nh);
            projectionMatrix = buildProjectionMatrix(nw, nh);
        }

        resize();

        // ── Draw (uniforms only; buffer data is static) ─────────────────
        function draw(_points: MeshPoint[], mouseX: number, mouseY: number, time: number) {
            program.uniforms.uTime.value = time;
            program.uniforms.uMouse.value[0] = mouseX;
            program.uniforms.uMouse.value[1] = mouseY;
            program.uniforms.uProjectionMatrix.value = projectionMatrix;

            instGeom.instancedCount = points.length;

            renderer.render({ scene, camera: null, clear: true, sort: false, frustumCull: false });
        }

        // ── Disposal ────────────────────────────────────────────────────
        function dispose() {
            try { program.remove(); baseGeom.remove(); instGeom.remove(); } catch { /* noop */ }
        }

        return { draw, resize, dispose };
    } catch {
        return null;
    }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Initialises the landing-hero animation.
 *
 * @param landingEl - The outer full-viewport `#landing-page` <section>
 *                    (pointer tracking covers the full 100 vh section).
 * @param frameEl   - The inner `#mesh-frame` <div> (resize / intersection
 *                    observers).
 * @param canvasEl  - The `<canvas id="mesh-canvas">` inside the frame.
 */
export function init(landingEl: HTMLElement, frameEl: HTMLElement, canvasEl: HTMLCanvasElement) {
    const ctx = canvasEl.getContext('2d', { alpha: true, desynchronized: true });

    // Build the full point grid (both layers, secondary first so primary on top).
    const points: MeshPoint[] = [...createPoints(1), ...createPoints(0)];

    // Animation state
    // Ambient movement never stops; pointer movement only adds a subtle,
    // temporary drift on top of it.
    let driftX = 0, driftY = 0;
    let velocityX = 0, velocityY = 0;
    let lastPointerX: number | null = null;
    let lastPointerY: number | null = null;
    let rafId: number | null = null;
    let lastDraw = 0;
    let lastFrame = 0;
    let animTime = 0;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let visible = true;
    let pageVisible = document.visibilityState === 'visible';

    function canAnimate() {
        return visible && pageVisible && !reducedMotion.matches;
    }

    function meshMotion() {
        // Two slow waves prevent a recognisable, mechanical loop. The idle
        // movement is just noticeable at rest while the cursor contribution
        // remains a subtle nudge on top of the existing warp.
        const idleX = Math.sin(animTime * IDLE_WOBBLE_X_PRIMARY_SPEED) * IDLE_WOBBLE_X_PRIMARY
            + Math.cos(animTime * IDLE_WOBBLE_X_SECONDARY_SPEED) * IDLE_WOBBLE_X_SECONDARY;
        const idleY = Math.cos(animTime * IDLE_WOBBLE_Y_PRIMARY_SPEED) * IDLE_WOBBLE_Y_PRIMARY
            + Math.sin(animTime * IDLE_WOBBLE_Y_SECONDARY_SPEED) * IDLE_WOBBLE_Y_SECONDARY;
        return { x: idleX + driftX, y: idleY + driftY };
    }

    function startLoop() {
        if (canAnimate() && rafId === null) {
            rafId = requestAnimationFrame(loop);
        }
    }

    function stopLoop() {
        if (rafId !== null) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }
    }

    // --- OGL handle (optional) ----------------------------------------
    const ogl = initOgl(canvasEl, points);
    if (ogl) ogl.resize();

    // --- Canvas 2D first frame (instant) ------------------------------
    drawFallback(ctx, points);

    // --- ResizeObserver (observe the mesh frame, not the full landing) --
    const resizeObs = new ResizeObserver(() => {
        if (ogl) ogl.resize();
        if (canAnimate()) {
            const motion = meshMotion();
            drawFallback(ctx, points, motion.x, motion.y);
        }
    });
    resizeObs.observe(frameEl);

    // --- IntersectionObserver (observe the mesh frame) ----------------
    const visObs = new IntersectionObserver(
        ([entry]) => {
            visible = entry.isIntersecting;
            if (canAnimate()) {
                if (ogl) ogl.resize();
                const motion = meshMotion();
                drawFallback(ctx, points, motion.x, motion.y);
                startLoop();
            } else {
                stopLoop();
            }
        },
        { threshold: 0 },
    );
    visObs.observe(frameEl);

    // --- Page visibility ----------------------------------------------
    document.addEventListener('visibilitychange', () => {
        pageVisible = document.visibilityState === 'visible';
        if (canAnimate()) {
            if (ogl) ogl.resize();
            const motion = meshMotion();
            drawFallback(ctx, points, motion.x, motion.y);
            startLoop();
        } else {
            stopLoop();
        }
    });

    // --- prefers-reduced-motion toggle --------------------------------
    reducedMotion.addEventListener('change', () => {
        if (canAnimate()) {
            if (ogl) ogl.resize();
            const motion = meshMotion();
            drawFallback(ctx, points, motion.x, motion.y);
        } else {
            stopLoop();
        }
    });

    // --- Pointer events on the ENTIRE landing section (100 vh) ----------
    landingEl.addEventListener('pointermove', (ev) => {
        const fB = frameEl.getBoundingClientRect();
        const pointerX = (ev.clientX - fB.left) / fB.width;
        const pointerY = (ev.clientY - fB.top) / fB.height;

        // A pointer movement gives the mesh a directional nudge instead of
        // placing it under the cursor. It can therefore coast after the mouse
        // stops, rather than snapping to a target (or back to the origin).
        if (lastPointerX !== null && lastPointerY !== null) {
            velocityX = Math.max(-MAX_POINTER_VELOCITY, Math.min(MAX_POINTER_VELOCITY,
                velocityX + (pointerX - lastPointerX) * POINTER_IMPULSE));
            velocityY = Math.max(-MAX_POINTER_VELOCITY, Math.min(MAX_POINTER_VELOCITY,
                velocityY + (pointerY - lastPointerY) * POINTER_IMPULSE));
        }
        lastPointerX = pointerX;
        lastPointerY = pointerY;
        startLoop();
    }, { passive: true });

    landingEl.addEventListener('pointerleave', () => {
        // Preserve momentum when the pointer leaves; the loop stops once the
        // remaining motion has naturally dissipated.
        lastPointerX = null;
        lastPointerY = null;
    }, { passive: true });

    // --- Animation loop (one persistent RAF while visible, ≥ 30 fps draw) ---
    function loop(now: number) {
        if (!canAnimate()) { rafId = null; return; }

        // Time-based integration keeps the effect equally restrained on
        // 60 Hz and high-refresh-rate displays.
        const deltaSeconds = Math.min(MAX_DELTA_SECONDS, Math.max(0, (now - (lastFrame || now)) / 1000));
        lastFrame = now;
        animTime += deltaSeconds;

        driftX = Math.max(-MAX_POINTER_VELOCITY, Math.min(MAX_POINTER_VELOCITY,
            driftX + velocityX * deltaSeconds));
        driftY = Math.max(-MAX_POINTER_VELOCITY, Math.min(MAX_POINTER_VELOCITY,
            driftY + velocityY * deltaSeconds));
        // The spring returns only the pointer-induced offset to zero; idle
        // wobble is calculated separately and is never damped by this motion.
        velocityX -= driftX * POINTER_RETURN_SPRING * deltaSeconds;
        velocityY -= driftY * POINTER_RETURN_SPRING * deltaSeconds;
        velocityX *= Math.exp(-POINTER_VELOCITY_DAMPING * deltaSeconds);
        velocityY *= Math.exp(-POINTER_VELOCITY_DAMPING * deltaSeconds);

        if (now - lastDraw >= DRAW_INTERVAL_MS) {
            const motion = meshMotion();

            if (ogl) {
                ogl.draw(points, motion.x, motion.y, animTime);
            } else {
                drawFallback(ctx, points, motion.x, motion.y);
            }
            lastDraw = now;
        }

        rafId = requestAnimationFrame(loop);
    }

    // Kick off — 2D fallback renders immediately; OGL takes over on first frame.
    startLoop();
}
