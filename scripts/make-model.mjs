// Builds the hero's "core" model and writes it out as a real .glb.
//   node scripts/make-model.mjs  →  public/models/core.glb
//
// Procedural rather than hand-modelled: an icosahedral shell with an inner
// crystal and an orbiting ring, which reads as a compute/neural core and
// stays tiny (a few KB) compared with any downloaded asset.
import * as THREE from "three";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

// GLTFExporter is written for the browser; give it the few globals it reaches
// for before importing it.
const { Blob, resolveObjectURL } = await import("node:buffer");
globalThis.Blob ??= Blob;
globalThis.FileReader ??= class FileReader {
  readAsArrayBuffer(blob) {
    blob
      .arrayBuffer()
      .then((buf) => {
        this.result = buf;
        this.onloadend?.();
      })
      .catch((err) => this.onerror?.(err));
  }
};
globalThis.URL.createObjectURL ??= () => "";
globalThis.URL.revokeObjectURL ??= () => {};

const { GLTFExporter } = await import("three/examples/jsm/exporters/GLTFExporter.js");

const OUT = path.resolve(import.meta.dirname, "..", "public", "models");

const SIGNAL = 0x6ee7f2;
const EMBER = 0xf2b263;

const root = new THREE.Group();
root.name = "core";

// 1. Outer shell — faceted, semi-transparent
const shell = new THREE.Mesh(
  new THREE.IcosahedronGeometry(1, 1),
  new THREE.MeshStandardMaterial({
    color: SIGNAL,
    metalness: 0.1,
    roughness: 0.35,
    transparent: true,
    opacity: 0.14,
    side: THREE.DoubleSide,
    flatShading: true,
  })
);
shell.name = "shell";
root.add(shell);

// 2. Wireframe over the shell's edges
const edges = new THREE.LineSegments(
  new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.001, 1)),
  new THREE.LineBasicMaterial({ color: SIGNAL, transparent: true, opacity: 0.75 })
);
edges.name = "wire";
root.add(edges);

// 3. Inner crystal — the bright centre
const crystal = new THREE.Mesh(
  new THREE.OctahedronGeometry(0.42, 0),
  new THREE.MeshStandardMaterial({
    color: EMBER,
    emissive: EMBER,
    emissiveIntensity: 0.55,
    metalness: 0.4,
    roughness: 0.25,
    flatShading: true,
  })
);
crystal.name = "crystal";
root.add(crystal);

// 4. Orbiting ring, tilted off-axis
const ring = new THREE.Mesh(
  new THREE.TorusGeometry(1.45, 0.012, 8, 96),
  new THREE.MeshStandardMaterial({
    color: SIGNAL,
    emissive: SIGNAL,
    emissiveIntensity: 0.35,
    metalness: 0.6,
    roughness: 0.4,
  })
);
ring.name = "ring";
ring.rotation.set(Math.PI / 2.6, 0, Math.PI / 7);
root.add(ring);

// 5. Node points on the shell's vertices
const ico = new THREE.IcosahedronGeometry(1, 1);
const pos = ico.getAttribute("position");
const seen = new Set();
const nodeGeo = new THREE.SphereGeometry(0.032, 8, 8);
const nodeMat = new THREE.MeshStandardMaterial({
  color: SIGNAL,
  emissive: SIGNAL,
  emissiveIntensity: 0.8,
  roughness: 0.3,
});
for (let i = 0; i < pos.count; i++) {
  const v = new THREE.Vector3().fromBufferAttribute(pos, i);
  const key = `${v.x.toFixed(3)},${v.y.toFixed(3)},${v.z.toFixed(3)}`;
  if (seen.has(key)) continue;
  seen.add(key);
  const n = new THREE.Mesh(nodeGeo, nodeMat);
  n.position.copy(v);
  root.add(n);
}

const scene = new THREE.Scene();
scene.add(root);

await mkdir(OUT, { recursive: true });
const exporter = new GLTFExporter();
const glb = await new Promise((resolve, reject) =>
  exporter.parse(scene, resolve, reject, { binary: true })
);
await writeFile(path.join(OUT, "core.glb"), Buffer.from(glb));
console.log(`wrote public/models/core.glb (${(glb.byteLength / 1024).toFixed(1)} KB, ${seen.size} nodes)`);
