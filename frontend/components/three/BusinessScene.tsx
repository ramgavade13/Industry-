"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const BAR_COUNT = 14;

/**
 * Full-screen business background: a 3D bar chart that grows in, a gold trend
 * line that draws itself across the bar tops, a slow wireframe globe and
 * drifting data particles. Mouse movement gives a light parallax.
 */
export default function BusinessScene() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const w = () => mount.clientWidth || window.innerWidth;
    const h = () => mount.clientHeight || window.innerHeight;

    // ---- scene / camera / renderer ----
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020617, 0.03);

    const camera = new THREE.PerspectiveCamera(55, w() / h(), 0.1, 100);
    camera.position.set(0, 1.5, 14);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w(), h());
    mount.appendChild(renderer.domElement);

    // ---- lights ----
    scene.add(new THREE.AmbientLight(0x93c5fd, 0.7));
    const sun = new THREE.DirectionalLight(0xffffff, 1.1);
    sun.position.set(5, 10, 7);
    scene.add(sun);
    const goldLight = new THREE.PointLight(0xf59e0b, 80, 40);
    goldLight.position.set(6, 4, 4);
    scene.add(goldLight);

    // ---- bar chart + trend line ----
    const chart = new THREE.Group();
    chart.position.set(4.5, -3.5, -3);
    chart.rotation.y = -0.4;
    scene.add(chart);

    const targets = Array.from(
      { length: BAR_COUNT },
      (_, i) => 1 + i * 0.42 + Math.sin(i * 1.9) * 0.5
    );
    const barGeo = new THREE.BoxGeometry(0.55, 1, 0.55);
    const barMats: THREE.MeshStandardMaterial[] = [];
    const bars = targets.map((_, i) => {
      const mat = new THREE.MeshStandardMaterial({
        color: 0x2563eb,
        emissive: 0x1e40af,
        emissiveIntensity: 0.4,
        metalness: 0.5,
        roughness: 0.35,
        transparent: true,
        opacity: 0.85,
      });
      barMats.push(mat);
      const bar = new THREE.Mesh(barGeo, mat);
      bar.position.x = (i - (BAR_COUNT - 1) / 2) * 0.85;
      bar.scale.y = 0.001;
      chart.add(bar);
      return bar;
    });

    const curve = new THREE.CatmullRomCurve3(
      targets.map((t, i) => new THREE.Vector3((i - (BAR_COUNT - 1) / 2) * 0.85, t + 0.5, 0))
    );
    const lineGeo = new THREE.TubeGeometry(curve, 120, 0.05, 8, false);
    const lineMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.9,
    });
    chart.add(new THREE.Mesh(lineGeo, lineMat));
    const lineIndexCount = lineGeo.index ? lineGeo.index.count : 0;

    // ---- wireframe globe ----
    const globeGeo = new THREE.IcosahedronGeometry(2.4, 1);
    const globeMat = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
      wireframe: true,
      transparent: true,
      opacity: 0.22,
    });
    const globe = new THREE.Mesh(globeGeo, globeMat);
    globe.position.set(-7, 3, -8);
    scene.add(globe);

    // ---- particles ----
    const COUNT = 700;
    const pos = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 24;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30 - 6;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const pMat = new THREE.PointsMaterial({
      size: 0.06,
      color: 0x60a5fa,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // ---- floor grid ----
    const grid = new THREE.GridHelper(60, 60, 0x1e3a8a, 0x1e293b);
    grid.position.y = -3.5;
    const gridMat = grid.material as THREE.Material;
    gridMat.transparent = true;
    gridMat.opacity = 0.35;
    scene.add(grid);

    // ---- animation ----
    const mouse = { x: 0, y: 0 };
    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX / window.innerWidth - 0.5;
      mouse.y = e.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener("mousemove", onMove);

    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

    const update = (elapsed: number) => {
      const progress = reduceMotion ? 1 : Math.min(elapsed / 2.8, 1);
      const eased = easeOut(progress);
      bars.forEach((bar, i) => {
        const pulse = reduceMotion ? 1 : 1 + 0.04 * Math.sin(elapsed * 1.3 + i * 0.6);
        const height = Math.max(targets[i] * eased * pulse, 0.001);
        bar.scale.y = height;
        bar.position.y = height / 2;
      });
      lineGeo.setDrawRange(0, Math.floor(lineIndexCount * eased));
    };

    const clock = new THREE.Clock();
    let raf = 0;
    const animate = () => {
      const t = clock.getElapsedTime();
      update(t);
      particles.rotation.y = t * 0.02;
      globe.rotation.y = t * 0.08;
      globe.rotation.x = t * 0.03;
      camera.position.x += (mouse.x * 2 - camera.position.x) * 0.03;
      camera.position.y += (1.5 - mouse.y * 1.2 - camera.position.y) * 0.03;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };

    if (reduceMotion) {
      update(0);
      renderer.render(scene, camera);
    } else {
      animate();
    }

    const onResize = () => {
      camera.aspect = w() / h();
      camera.updateProjectionMatrix();
      renderer.setSize(w(), h());
      if (reduceMotion) renderer.render(scene, camera);
    };
    window.addEventListener("resize", onResize);

    // ---- cleanup ----
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", onResize);
      barGeo.dispose();
      barMats.forEach((m) => m.dispose());
      lineGeo.dispose();
      lineMat.dispose();
      globeGeo.dispose();
      globeMat.dispose();
      pGeo.dispose();
      pMat.dispose();
      grid.geometry.dispose();
      gridMat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0"
      style={{
        background:
          "radial-gradient(ellipse at 75% 60%, #0f2a5c 0%, #071226 45%, #020617 100%)",
      }}
    >
      <div ref={mountRef} className="h-full w-full" />
    </div>
  );
}