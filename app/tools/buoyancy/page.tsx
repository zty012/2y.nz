"use client";

import {
  ArrowDown,
  ArrowUp,
  Pause,
  Play,
  RotateCcw,
  Waves,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

type Shape = "cube" | "sphere";

type Settings = {
  shape: Shape;
  size: number;
  width: number;
  height: number;
  depth: number;
  objectMass: number;
  liquidDensity: number;
  gravity: number;
  damping: number;
  startHeight: number;
};

type Telemetry = {
  position: number;
  velocity: number;
  acceleration: number;
  submergedDepth: number;
  submergedRatio: number;
  buoyancy: number;
  gravity: number;
  netForce: number;
  state: "上浮" | "悬浮" | "下沉";
};

const WATER_LEVEL = 0;
const TANK_BOTTOM = -2.2;
const TANK_WIDTH = 5.2;
const TANK_DEPTH = 3.2;
const WATER_HEIGHT = WATER_LEVEL - TANK_BOTTOM;
const MAX_SIM_STEP = 1 / 240;
const MAX_ACCELERATION = 35;
const MAX_VELOCITY = 3.5;
const INITIAL_SETTINGS: Settings = {
  shape: "cube",
  size: 1.15,
  width: 0.5,
  height: 0.5,
  depth: 0.5,
  objectMass: 77.5,
  liquidDensity: 1000,
  gravity: 9.81,
  damping: 1.8,
  startHeight: 1.2,
};

const PRESETS: Record<string, Partial<Settings>> = {
  木块: {
    shape: "cube",
    objectMass: 119.04,
    liquidDensity: 1000,
    width: 0.8,
    height: 0.4,
    depth: 0.6,
  },
  冰块: {
    shape: "cube",
    objectMass: 198.07,
    liquidDensity: 1000,
    width: 0.6,
    height: 0.6,
    depth: 0.6,
  },
  铁球: {
    shape: "sphere",
    objectMass: 3526.28,
    liquidDensity: 1000,
    size: 0.95,
  },
  盐水中空球: {
    shape: "sphere",
    objectMass: 683.29,
    liquidDensity: 1030,
    size: 1.1,
  },
};

const defaultTelemetry: Telemetry = {
  position: INITIAL_SETTINGS.startHeight,
  velocity: 0,
  acceleration: 0,
  submergedDepth: 0,
  submergedRatio: 0,
  buoyancy: 0,
  gravity: 0,
  netForce: 0,
  state: "悬浮",
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function format(value: number, digits = 2) {
  if (!Number.isFinite(value)) return "—";
  return value.toFixed(digits);
}

function getVerticalSize(settings: Settings) {
  return settings.shape === "sphere" ? settings.size : settings.height;
}

function getVolume(settings: Settings) {
  if (settings.shape === "sphere") {
    const radius = settings.size / 2;
    return (4 / 3) * Math.PI * radius ** 3;
  }
  return settings.width * settings.height * settings.depth;
}

function getObjectDensity(settings: Settings) {
  return settings.objectMass / Math.max(getVolume(settings), 0.000001);
}

function getSubmergedDepth(settings: Settings, centerY: number) {
  const height = getVerticalSize(settings);
  const bottom = centerY - height / 2;
  const top = centerY + height / 2;

  return clamp(WATER_LEVEL - bottom, 0, top - bottom);
}

function getSubmergedVolume(settings: Settings, centerY: number) {
  const submergedHeight = getSubmergedDepth(settings, centerY);

  if (settings.shape === "sphere") {
    const radius = settings.size / 2;
    return (
      (Math.PI * submergedHeight ** 2 * (3 * radius - submergedHeight)) / 3
    );
  }

  return settings.width * settings.depth * submergedHeight;
}

function computeTelemetry(
  settings: Settings,
  position: number,
  velocity: number,
) {
  const volume = getVolume(settings);
  const submergedVolume = getSubmergedVolume(settings, position);
  const submergedDepth = getSubmergedDepth(settings, position);
  const mass = settings.objectMass;
  const gravityForce = mass * settings.gravity;
  const buoyancyForce =
    settings.liquidDensity * submergedVolume * settings.gravity;
  const dampingForce = -settings.damping * mass * velocity;
  const netForce = buoyancyForce - gravityForce + dampingForce;
  const acceleration = netForce / Math.max(mass, 0.0001);
  const submergedRatio = clamp(submergedVolume / volume, 0, 1);
  const state =
    Math.abs(netForce) < gravityForce * 0.015 && Math.abs(velocity) < 0.03
      ? "悬浮"
      : netForce > 0
        ? "上浮"
        : "下沉";

  return {
    position,
    velocity,
    acceleration,
    submergedDepth,
    submergedRatio,
    buoyancy: buoyancyForce,
    gravity: gravityForce,
    netForce,
    state,
  } satisfies Telemetry;
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  unit,
  displayScale = 1,
  displayDigits,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  displayScale?: number;
  displayDigits?: number;
  onChange: (value: number) => void;
}) {
  const digits = displayDigits ?? (step * displayScale < 1 ? 2 : 1);
  const displayValue = value * displayScale;
  const displayMin = min * displayScale;
  const displayMax = max * displayScale;
  const displayStep = step * displayScale;

  return (
    <label className="grid gap-2 text-sm">
      <span className="flex items-baseline justify-between gap-4">
        <span className="font-medium opacity-70">{label}</span>
        <span className="font-mono text-xs opacity-45">
          {format(displayValue, digits)} {unit}
        </span>
      </span>
      <span className="grid grid-cols-[minmax(0,1fr)_5.5rem] items-center gap-3">
        <input
          className="h-2 cursor-pointer accent-(--color-accent)"
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
        />
        <input
          className="min-w-0 rounded-lg border border-white/10 bg-black/20 px-2 py-1.5 text-right font-mono text-xs transition outline-none focus:border-(--color-accent)"
          type="number"
          min={displayMin}
          max={displayMax}
          step={displayStep}
          value={format(displayValue, digits)}
          aria-label={`${label}输入框`}
          onChange={(event) => {
            const next = Number(event.target.value);
            if (Number.isFinite(next)) {
              onChange(clamp(next / displayScale, min, max));
            }
          }}
        />
      </span>
    </label>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/2.5 p-3">
      <p className="text-[0.65rem] tracking-[0.18em] uppercase opacity-35">
        {label}
      </p>
      <p className="mt-1 font-mono text-lg font-semibold">{value}</p>
      {hint && <p className="mt-1 text-xs opacity-35">{hint}</p>}
    </div>
  );
}

export default function BuoyancyToolPage() {
  const mountRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef(INITIAL_SETTINGS);
  const pausedRef = useRef(false);
  const positionRef = useRef(INITIAL_SETTINGS.startHeight);
  const velocityRef = useRef(0);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef(0);
  const lastTelemetryTimeRef = useRef(0);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const buoyancyArrowRef = useRef<THREE.ArrowHelper | null>(null);
  const gravityArrowRef = useRef<THREE.ArrowHelper | null>(null);
  const waterLineRef = useRef<THREE.LineSegments | null>(null);

  const [settings, setSettings] = useState<Settings>(INITIAL_SETTINGS);
  const [paused, setPaused] = useState(false);
  const [telemetry, setTelemetry] = useState<Telemetry>(defaultTelemetry);

  const objectDensity = useMemo(() => getObjectDensity(settings), [settings]);
  const densityRatio = useMemo(
    () => objectDensity / settings.liquidDensity,
    [objectDensity, settings.liquidDensity],
  );

  const resetSimulation = useCallback((nextSettings = settingsRef.current) => {
    positionRef.current = nextSettings.startHeight;
    velocityRef.current = 0;
    setTelemetry(computeTelemetry(nextSettings, positionRef.current, 0));
  }, []);

  const updateSetting = useCallback(
    <K extends keyof Settings>(key: K, value: Settings[K]) => {
      setSettings((previous) => {
        const next = { ...previous, [key]: value };
        settingsRef.current = next;
        return next;
      });
    },
    [],
  );

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x05070c, 7, 15);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(4.8, 3.2, 6.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(0, -0.2, 0);
    controls.minDistance = 4;
    controls.maxDistance = 12;
    controls.maxPolarAngle = Math.PI * 0.82;

    scene.add(new THREE.HemisphereLight(0x9fcfff, 0x101820, 1.8));
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
    keyLight.position.set(4, 6, 3);
    scene.add(keyLight);

    const grid = new THREE.GridHelper(7, 14, 0x657ad4, 0x223060);
    grid.position.y = TANK_BOTTOM;
    scene.add(grid);

    const tankEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(
        new THREE.BoxGeometry(TANK_WIDTH, 4.4, TANK_DEPTH),
      ),
      new THREE.LineBasicMaterial({
        color: 0x657ad4,
        transparent: true,
        opacity: 0.32,
      }),
    );
    tankEdges.position.y = 0;
    scene.add(tankEdges);

    const waterVolume = new THREE.Mesh(
      new THREE.BoxGeometry(TANK_WIDTH, WATER_HEIGHT, TANK_DEPTH),
      new THREE.MeshPhysicalMaterial({
        color: 0x2f9bff,
        transparent: true,
        opacity: 0.18,
        roughness: 0.08,
        transmission: 0.62,
        thickness: 1.6,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    );
    waterVolume.position.y = TANK_BOTTOM + WATER_HEIGHT / 2;
    scene.add(waterVolume);

    const waterSurface = new THREE.Mesh(
      new THREE.PlaneGeometry(TANK_WIDTH, TANK_DEPTH, 48, 28),
      new THREE.MeshPhysicalMaterial({
        color: 0x7dd3fc,
        transparent: true,
        opacity: 0.44,
        roughness: 0.12,
        metalness: 0,
        transmission: 0.25,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    );
    waterSurface.rotation.x = -Math.PI / 2;
    waterSurface.position.y = WATER_LEVEL + 0.025;
    scene.add(waterSurface);

    const waterBands = new THREE.Group();
    for (let index = 1; index <= 5; index += 1) {
      const y = TANK_BOTTOM + (WATER_HEIGHT * index) / 6;
      const band = new THREE.LineSegments(
        new THREE.EdgesGeometry(
          new THREE.BoxGeometry(TANK_WIDTH, 0.01, TANK_DEPTH),
        ),
        new THREE.LineBasicMaterial({
          color: 0x38bdf8,
          transparent: true,
          opacity: 0.08 + index * 0.018,
        }),
      );
      band.position.y = y;
      waterBands.add(band);
    }
    scene.add(waterBands);

    const waterLine = new THREE.LineSegments(
      new THREE.EdgesGeometry(
        new THREE.BoxGeometry(TANK_WIDTH, 0.02, TANK_DEPTH),
      ),
      new THREE.LineBasicMaterial({
        color: 0x8fd8ff,
        transparent: true,
        opacity: 0.75,
      }),
    );
    waterLine.position.y = WATER_LEVEL + 0.04;
    waterLineRef.current = waterLine;
    scene.add(waterLine);

    const gravityArrow = new THREE.ArrowHelper(
      new THREE.Vector3(0, -1, 0),
      new THREE.Vector3(1.65, 1.1, 0),
      1,
      0xff6b6b,
      0.18,
      0.1,
    );
    const buoyancyArrow = new THREE.ArrowHelper(
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(-1.65, -0.8, 0),
      1,
      0x5eead4,
      0.18,
      0.1,
    );
    gravityArrowRef.current = gravityArrow;
    buoyancyArrowRef.current = buoyancyArrow;
    scene.add(gravityArrow, buoyancyArrow);

    const resize = () => {
      const rect = mount.getBoundingClientRect();
      const width = Math.max(rect.width, 1);
      const height = Math.max(rect.height, 1);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);
    resize();

    const rebuildMesh = () => {
      if (meshRef.current) {
        scene.remove(meshRef.current);
        meshRef.current.geometry.dispose();
        if (Array.isArray(meshRef.current.material)) {
          meshRef.current.material.forEach((material) => material.dispose());
        } else {
          meshRef.current.material.dispose();
        }
      }

      const current = settingsRef.current;
      const geometry =
        current.shape === "sphere"
          ? new THREE.SphereGeometry(current.size / 2, 48, 32)
          : new THREE.BoxGeometry(current.width, current.height, current.depth);
      const currentDensity = getObjectDensity(current);
      const material = new THREE.MeshStandardMaterial({
        color: currentDensity > current.liquidDensity ? 0xf59e0b : 0x8bdda8,
        roughness: 0.42,
        metalness: currentDensity > 3000 ? 0.45 : 0.08,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.y = positionRef.current;
      materialRef.current = material;
      meshRef.current = mesh;
      scene.add(mesh);
    };

    rebuildMesh();
    const onRebuild = () => rebuildMesh();
    window.addEventListener("buoyancy:rebuild-object", onRebuild);

    const animate = (time: number) => {
      const current = settingsRef.current;
      const delta = Math.min((time - lastTimeRef.current) / 1000 || 0, 0.033);
      lastTimeRef.current = time;

      if (!pausedRef.current) {
        const steps = Math.max(1, Math.ceil(delta / MAX_SIM_STEP));
        const stepDelta = delta / steps;

        for (let step = 0; step < steps; step += 1) {
          const nextTelemetry = computeTelemetry(
            current,
            positionRef.current,
            velocityRef.current,
          );
          const acceleration = clamp(
            nextTelemetry.acceleration,
            -MAX_ACCELERATION,
            MAX_ACCELERATION,
          );

          velocityRef.current = clamp(
            velocityRef.current + acceleration * stepDelta,
            -MAX_VELOCITY,
            MAX_VELOCITY,
          );
          positionRef.current += velocityRef.current * stepDelta;

          const half = getVerticalSize(current) / 2;
          if (positionRef.current - half < TANK_BOTTOM) {
            positionRef.current = TANK_BOTTOM + half;
            velocityRef.current = Math.max(0, -velocityRef.current * 0.18);
          }
          if (positionRef.current + half > 2.2) {
            positionRef.current = 2.2 - half;
            velocityRef.current = Math.min(0, velocityRef.current * 0.2);
          }
        }
      }

      const nextTelemetry = computeTelemetry(
        current,
        positionRef.current,
        velocityRef.current,
      );

      const mesh = meshRef.current;
      if (mesh) {
        mesh.position.y = positionRef.current;
        mesh.rotation.x += delta * 0.22;
        mesh.rotation.y += delta * 0.16;
      }

      if (materialRef.current) {
        const currentDensity = getObjectDensity(current);
        const color =
          currentDensity > current.liquidDensity ? 0xf59e0b : 0x8bdda8;
        materialRef.current.color.lerp(new THREE.Color(color), 0.08);
        materialRef.current.metalness = currentDensity > 3000 ? 0.45 : 0.08;
      }

      const forceScale = Math.max(nextTelemetry.gravity, 1);
      gravityArrowRef.current?.position.set(
        1.65,
        positionRef.current + 0.45,
        0,
      );
      gravityArrowRef.current?.setLength(
        0.35 + Math.min(1.35, nextTelemetry.gravity / forceScale),
        0.18,
        0.1,
      );
      buoyancyArrowRef.current?.position.set(
        -1.65,
        positionRef.current - 0.45,
        0,
      );
      buoyancyArrowRef.current?.setLength(
        0.12 + Math.min(1.55, nextTelemetry.buoyancy / forceScale),
        0.18,
        0.1,
      );
      if (buoyancyArrowRef.current) {
        buoyancyArrowRef.current.visible = nextTelemetry.submergedRatio > 0.01;
      }
      if (waterLineRef.current) {
        waterLineRef.current.rotation.y += delta * 0.08;
      }

      controls.update();
      renderer.render(scene, camera);

      if (time - lastTelemetryTimeRef.current > 110) {
        lastTelemetryTimeRef.current = time;
        setTelemetry(nextTelemetry);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener("buoyancy:rebuild-object", onRebuild);
      resizeObserver.disconnect();
      controls.dispose();
      scene.traverse((object) => {
        if (
          object instanceof THREE.Mesh ||
          object instanceof THREE.LineSegments
        ) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach((material) => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  useEffect(() => {
    window.dispatchEvent(new Event("buoyancy:rebuild-object"));
    resetSimulation();
  }, [
    settings.shape,
    settings.size,
    settings.width,
    settings.height,
    settings.depth,
    settings.startHeight,
    resetSimulation,
  ]);

  const applyPreset = (name: string) => {
    setSettings((previous) => {
      const next = { ...previous, ...PRESETS[name] };
      settingsRef.current = next;
      resetSimulation(next);
      return next;
    });
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05070c] px-4 py-4 text-white sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,currentColor_1px,transparent_1px)] bg-size-[32px_32px] opacity-[0.035]" />
      <div className="bg-scanline pointer-events-none absolute inset-0 opacity-40" />
      <div className="bg-column-line bg-column-line-1" />
      <div className="bg-column-line bg-column-line-2" />
      <div className="bg-column-line bg-column-line-3" />
      <div className="bg-column-line bg-column-line-4" />
      <div className="bg-column-line bg-column-line-5" />
      <div className="bg-column-line bg-column-line-6" />
      <div className="bg-column-line bg-column-line-7" />
      <div className="bg-column-line bg-column-line-8" />
      <div className="bg-column-line bg-column-line-9" />
      <div className="bg-column-line bg-column-line-10" />
      <div className="bg-column-line bg-column-line-11" />
      <div className="pointer-events-none absolute -top-44 -right-32 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-44 -left-32 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />

      <section className="content-over-glass relative mx-auto flex min-h-[calc(100vh-2rem)] max-w-7xl flex-col gap-4">
        <header className="newspaper-masthead">
          <span className="newspaper-masthead-title">
            Buoyancy Lab · Three.js
          </span>
          <span className="newspaper-masthead-meta">
            interactive physics tool
          </span>
        </header>

        <div className="grid flex-1 gap-4 lg:grid-cols-[minmax(0,1fr)_390px]">
          <div className="glass-panel relative min-h-[54vh] overflow-hidden rounded-3xl lg:min-h-0">
            <div
              ref={mountRef}
              className="absolute inset-0"
              aria-label="浮力仿真三维视图"
            />

            <div className="pointer-events-none absolute top-4 left-4 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 backdrop-blur-xl">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Waves className="h-4 w-4 text-cyan-300" />
                水面高度 y = 0 cm
              </div>
              <p className="mt-1 max-w-xs text-xs leading-relaxed opacity-45">
                拖动画面旋转视角。物体按密度、浸没体积和阻尼实时更新。
              </p>
            </div>

            <div className="pointer-events-none absolute right-4 bottom-4 grid gap-2 text-xs">
              <div className="flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-emerald-200">
                <ArrowUp className="h-3.5 w-3.5" /> 浮力
              </div>
              <div className="flex items-center gap-2 rounded-full border border-red-300/20 bg-red-300/10 px-3 py-1.5 text-red-200">
                <ArrowDown className="h-3.5 w-3.5" /> 重力
              </div>
            </div>
          </div>

          <aside className="glass-panel flex flex-col gap-4 rounded-3xl p-4 sm:p-5">
            <div>
              <p className="text-xs tracking-[0.24em] uppercase opacity-35">
                controls
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight">
                浮力仿真工具
              </h1>
              <p className="mt-2 text-sm leading-relaxed opacity-50">
                基于阿基米德原理：物体受到的浮力等于其排开液体的重量。
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {Object.keys(PRESETS).map((name) => (
                <button
                  key={name}
                  type="button"
                  className="rounded-xl border border-white/10 bg-white/3 px-3 py-2 text-sm transition hover:border-(--color-accent) hover:bg-white/6"
                  onClick={() => applyPreset(name)}
                >
                  {name}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/4 px-3 py-2 text-sm font-semibold transition hover:border-(--color-accent)"
                onClick={() => setPaused((value) => !value)}
              >
                {paused ? (
                  <Play className="h-4 w-4" />
                ) : (
                  <Pause className="h-4 w-4" />
                )}
                {paused ? "继续" : "暂停"}
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/4 px-3 py-2 text-sm font-semibold transition hover:border-(--color-accent)"
                onClick={() => resetSimulation(settings)}
              >
                <RotateCcw className="h-4 w-4" />
                重置
              </button>
            </div>

            <div className="rounded-2xl border border-white/8 bg-black/10 p-3">
              <p className="mb-3 text-xs tracking-[0.18em] uppercase opacity-35">
                shape
              </p>
              <div className="grid grid-cols-2 gap-2">
                {(["cube", "sphere"] as const).map((shape) => (
                  <button
                    key={shape}
                    type="button"
                    className="rounded-xl border px-3 py-2 text-sm transition"
                    style={{
                      borderColor:
                        settings.shape === shape
                          ? "var(--color-accent)"
                          : "rgba(255,255,255,0.1)",
                      background:
                        settings.shape === shape
                          ? "var(--color-accent-glow)"
                          : "rgba(255,255,255,0.03)",
                    }}
                    onClick={() => updateSetting("shape", shape)}
                  >
                    {shape === "cube" ? "方块" : "球体"}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4">
              {settings.shape === "sphere" ? (
                <Slider
                  label="球体直径"
                  value={settings.size}
                  min={0.45}
                  max={1.8}
                  step={0.05}
                  unit="cm"
                  displayScale={100}
                  displayDigits={0}
                  onChange={(value) => updateSetting("size", value)}
                />
              ) : (
                <>
                  <Slider
                    label="方块长度"
                    value={settings.width}
                    min={0.01}
                    max={1}
                    step={0.01}
                    unit="cm"
                    displayScale={100}
                    displayDigits={0}
                    onChange={(value) => updateSetting("width", value)}
                  />
                  <Slider
                    label="方块高度"
                    value={settings.height}
                    min={0.01}
                    max={1}
                    step={0.01}
                    unit="cm"
                    displayScale={100}
                    displayDigits={0}
                    onChange={(value) => updateSetting("height", value)}
                  />
                  <Slider
                    label="方块宽度"
                    value={settings.depth}
                    min={0.01}
                    max={1}
                    step={0.01}
                    unit="cm"
                    displayScale={100}
                    displayDigits={0}
                    onChange={(value) => updateSetting("depth", value)}
                  />
                </>
              )}
              <Slider
                label="物体质量"
                value={settings.objectMass}
                min={0.001}
                max={5}
                step={0.001}
                unit="kg"
                displayDigits={3}
                onChange={(value) => updateSetting("objectMass", value)}
              />
              <Slider
                label="液体密度"
                value={settings.liquidDensity}
                min={500}
                max={1400}
                step={10}
                unit="kg/m³"
                onChange={(value) => updateSetting("liquidDensity", value)}
              />
              <Slider
                label="重力加速度"
                value={settings.gravity}
                min={1}
                max={20}
                step={0.1}
                unit="m/s²"
                onChange={(value) => updateSetting("gravity", value)}
              />
              <Slider
                label="流体阻尼"
                value={settings.damping}
                min={0.1}
                max={6}
                step={0.1}
                unit=""
                onChange={(value) => updateSetting("damping", value)}
              />
              <Slider
                label="重置高度"
                value={settings.startHeight}
                min={-0.6}
                max={1.8}
                step={0.05}
                unit="cm"
                displayScale={100}
                displayDigits={0}
                onChange={(value) => updateSetting("startHeight", value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <StatCard
                label="状态"
                value={telemetry.state}
                hint={`密度比 ${format(densityRatio, 2)}`}
              />
              <StatCard
                label="等效密度"
                value={`${format(objectDensity, 0)} kg/m³`}
              />
              <StatCard
                label="浸没深度"
                value={`${format(telemetry.submergedDepth * 100, 1)} cm`}
              />
              <StatCard
                label="浸没比例"
                value={`${format(telemetry.submergedRatio * 100, 1)}%`}
              />
              <StatCard
                label="速度"
                value={`${format(telemetry.velocity * 100)} cm/s`}
              />
              <StatCard
                label="加速度"
                value={`${format(telemetry.acceleration * 100)} cm/s²`}
              />
              <StatCard
                label="浮力"
                value={`${format(telemetry.buoyancy, 0)} N`}
              />
              <StatCard
                label="净力"
                value={`${format(telemetry.netForce, 0)} N`}
              />
            </div>

            <div className="rounded-2xl border border-white/8 bg-white/2.5 p-3 text-xs leading-relaxed opacity-55">
              工具会根据质量与体积计算等效密度。当等效密度小于液体密度时，物体最终会部分露出水面；反之会下沉。
            </div>
          </aside>
        </div>

        <footer className="newspaper-folio">
          <span>page / tools / buoyancy</span>
          <span>Archimedes principle simulator</span>
        </footer>
      </section>
    </main>
  );
}
