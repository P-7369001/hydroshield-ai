
import { Suspense, useMemo, useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  OrbitControls,
  useGLTF,
  Center,
  Bounds,
  Html,
} from "@react-three/drei";

function SensorMarkers({
  onSelectSensor,
  rainfall,
  selectedSensor,
}: {
  onSelectSensor: (index: number) => void;
  rainfall: number;
  selectedSensor: number | null;
}) {
  const positions = [
    [-15, -8.8, -15],
    [-5, -8.8, -15],
    [5, -8.8, -15],
    [15, -8.8, -15],
    [-15, -8.8, -5],
    [-5, -8.8, -5],
    [5, -8.8, -5],
    [15, -8.8, -5],
    [-15, -8.8, 5],
    [-5, -8.8, 5],
    [5, -8.8, 5],
    [15, -8.8, 5],
  ];

  const markerRefs = useRef<(THREE.Mesh | null)[]>([]);
const sensorColor =
  rainfall <= 30 ? "#22c55e" :
  rainfall <= 80 ? "#eab308" :
  rainfall <= 140 ? "#f97316" :
  "#ef4444";
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();

    markerRefs.current.forEach((marker, index) => {
      if (!marker) return;

      const pulse = 1 + Math.sin(time * 3 + index) * 0.3;
const selectedBoost = index === selectedSensor ? 1.8 : 1;

marker.scale.setScalar(pulse * selectedBoost);
    });
  });

  return (
    <group>
      {positions.map((position, index) => (
        <group
  key={index}
  position={position as [number, number, number]}
  onClick={(event) => {
    event.stopPropagation();
    onSelectSensor(index);
  }}
>
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.035, 0.035, 1, 8]} />
            <meshStandardMaterial
              color="#38bdf8"
              emissive="#0284c7"
              emissiveIntensity={2}
            />
          </mesh>

          <mesh
            ref={(mesh) => {
              markerRefs.current[index] = mesh;
            }}
            position={[0, 1.05, 0]}
          >
            <sphereGeometry args={[0.18, 16, 16]} />
            <meshStandardMaterial
  color={sensorColor}
  emissive={sensorColor}
  emissiveIntensity={index === selectedSensor ? 3 : 0.8}
  toneMapped={false}
/>
          </mesh>
          <Html
  position={[0, 1.5, 0]}
  center
  distanceFactor={18}
  style={{
    color: "white",
    background: "rgba(3, 15, 35, 0.85)",
    padding: "3px 7px",
    borderRadius: "5px",
    fontSize: "10px",
    fontWeight: "bold",
    whiteSpace: "nowrap",
    pointerEvents: "none",
  }}
>
  {`SN-${String(index + 1).padStart(2, "0")}`}
</Html>
        </group>
      ))}
    </group>
  );
}


function CityModel() {
  const { scene } = useGLTF("/models/city.glb");
  return <primitive object={scene} />;
}

// Shared water height calculation
function getWaterHeight(rainfall: number) {
  const intensity = THREE.MathUtils.clamp(rainfall / 200, 0, 1);
  return -8.5 + intensity * 3.2;
}

// RAIN PARTICLES
function Rain({ rainfall }: { rainfall: number }) {
  const rainRef = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const count = 2500;
    const array = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      array[i * 3] = (Math.random() - 0.5) * 48;
      array[i * 3 + 1] = -5 + Math.random() * 25;
      array[i * 3 + 2] = (Math.random() - 0.5) * 48;
    }

    return array;
  }, []);

  useFrame((_, delta) => {
    if (!rainRef.current) return;

    const intensity = THREE.MathUtils.clamp(rainfall / 200, 0, 1);
    const material = rainRef.current.material as THREE.PointsMaterial;

    material.opacity = intensity;

    if (intensity === 0) return;

    const attribute = rainRef.current.geometry.attributes
      .position as THREE.BufferAttribute;

    const array = attribute.array as Float32Array;

    for (let i = 0; i < array.length; i += 3) {
      array[i + 1] -= delta * (8 + intensity * 18);

      if (array[i + 1] < -9.3) {
        array[i + 1] = 15 + Math.random() * 10;
      }
    }

    attribute.needsUpdate = true;
  });

  return (
    <points ref={rainRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>

      <pointsMaterial
        color="#b8e8ff"
        size={0.20}
        transparent
        opacity={1}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

// DYNAMIC FLOOD WATER
function FloodWater({ rainfall }: { rainfall: number }) {
  const waterRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (!waterRef.current) return;

    const intensity = THREE.MathUtils.clamp(rainfall / 200, 0, 1);
    const material = waterRef.current.material as THREE.MeshPhysicalMaterial;

   const targetY = getWaterHeight(rainfall);

waterRef.current.position.y = THREE.MathUtils.damp(
  waterRef.current.position.y,
  targetY,
  3,
  delta
);

material.opacity = THREE.MathUtils.damp(
  material.opacity,
  intensity === 0 ? 0 : 0.68,
  4,
  delta
);
  });

  return (
    <mesh
      ref={waterRef}
      position={[0, -8.5, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <planeGeometry args={[42, 42, 100, 100]} />

      <meshPhysicalMaterial
        color="#159bd0"
        transparent
        opacity={0.68}
        roughness={0.15}
        metalness={0.05}
        clearcoat={1}
        clearcoatRoughness={0.08}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// ANIMATED WATER CAUSTICS
function WaterPatterns({ rainfall }: { rainfall: number }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,

        uniforms: {
          uTime: { value: 0 },
          uIntensity: { value: 0 },
        },

        vertexShader: `
          varying vec2 vUv;

          void main() {
            vUv = uv;

            gl_Position = projectionMatrix *
              modelViewMatrix * vec4(position, 1.0);
          }
        `,

        fragmentShader: `
          uniform float uTime;
          uniform float uIntensity;

          varying vec2 vUv;

          vec2 randomPoint(vec2 p) {
            return fract(sin(vec2(
              dot(p, vec2(127.1, 311.7)),
              dot(p, vec2(269.5, 183.3))
            )) * 43758.5453);
          }

          float caustics(vec2 uv, float time) {
            vec2 p = uv * 22.0;

            p += vec2(
              sin(p.y * 0.7 + time),
              cos(p.x * 0.7 - time * 0.8)
            ) * 0.55;

            vec2 cell = floor(p);
            vec2 local = fract(p);

            float d1 = 10.0;
            float d2 = 10.0;

            for (int x = -1; x <= 1; x++) {
              for (int y = -1; y <= 1; y++) {
                vec2 neighbor = vec2(float(x), float(y));

                vec2 point = randomPoint(cell + neighbor);

                point = 0.5 + 0.35 *
                  sin(time * 0.65 + 6.2831 * point);

                vec2 diff = neighbor + point - local;

                float d = length(diff);

                if (d < d1) {
                  d2 = d1;
                  d1 = d;
                } else if (d < d2) {
                  d2 = d;
                }
              }
            }

            float lines = 1.0 - smoothstep(
              0.012, 0.11, d2 - d1
            );

            return pow(lines, 2.0);
          }

          void main() {
            float pattern = caustics(vUv, uTime);

            vec3 color = vec3(0.48, 0.82, 0.91);

            // No patterns when intensity is zero
            float alpha = pattern * uIntensity * 0.20;

            gl_FragColor = vec4(color, alpha);
          }
        `,
      }),
    []
  );

  useFrame((state, delta) => {
    if (!materialRef.current || !meshRef.current) return;

    const intensity = THREE.MathUtils.clamp(rainfall / 200, 0, 1);

    materialRef.current.uniforms.uTime.value =
      state.clock.elapsedTime;

    if (intensity === 0) {
      materialRef.current.uniforms.uIntensity.value = 0;

      meshRef.current.visible = false;
      meshRef.current.position.y = -30;
      return;
    }

    meshRef.current.visible = true;

    meshRef.current.position.y =
      getWaterHeight(rainfall) + 0.025;

    materialRef.current.uniforms.uIntensity.value =
      THREE.MathUtils.damp(
        materialRef.current.uniforms.uIntensity.value,
        intensity,
        4,
        delta
      );
  });

  return (
    <mesh
      ref={meshRef}
      position={[0, -7.675, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <planeGeometry args={[41.5, 41.5]} />

      <primitive
        object={material}
        ref={materialRef}
        attach="material"
      />
    </mesh>
  );
}

// WATER RIPPLE ANIMATION
function WaterRipples({ rainfall }: { rainfall: number }) {
  const rippleRefs = useRef<(THREE.Mesh | null)[]>([]);

  const ripples = useMemo(
    () =>
      Array.from({ length: 35 }, () => ({
        x: (Math.random() - 0.5) * 40,
        z: (Math.random() - 0.5) * 40,
        offset: Math.random() * Math.PI * 2,
      })),
    []
  );

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    const intensity = THREE.MathUtils.clamp(rainfall / 200, 0, 1);

    rippleRefs.current.forEach((ripple, i) => {
      if (!ripple) return;

      const material = ripple.material as THREE.MeshBasicMaterial;

      if (intensity === 0) {
        ripple.visible = false;
        material.opacity = 0;
        ripple.position.y = -30;
        return;
      }

      ripple.visible = true;

      const phase =
        (time * (0.5 + intensity * 1.5) +
          ripples[i].offset) % 1;

      const scale = 0.5 + phase * 3;

      ripple.scale.set(scale, scale, scale);

      ripple.position.y =
        getWaterHeight(rainfall) + 0.06;

      material.opacity =
        0.65 * (1 - phase) * intensity;
    });
  });

  return (
    <group>
      {ripples.map((ripple, i) => (
        <mesh
          key={i}
          ref={(element) => {
            rippleRefs.current[i] = element;
          }}
          position={[ripple.x, -7.64, ripple.z]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <torusGeometry args={[0.2, 0.025, 8, 32]} />

          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={0}
            depthWrite={false}
            side={THREE.DoubleSide}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    window.innerWidth <= 650
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 650);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return isMobile;
}
// MAIN CITY SCENE
export default function CityScene({
  rainfall,
  onSelectSensor,
  selectedSensor,
}: {
  rainfall: number;
  onSelectSensor: (index: number) => void;
  selectedSensor: number | null;
}) {
  const isMobile = useIsMobile();

  return (
    <Canvas
      camera={{
  position: isMobile ? [24, 22, 24] : [20, 20, 20],
  fov: isMobile ? 55 : 45,
}}
      shadows
    >
      <color attach="background" args={["#092653"]} />

      <ambientLight intensity={1.5} />

      <directionalLight
        position={[10, 20, 10]}
        intensity={2}
        castShadow
      />

      <Rain rainfall={rainfall} />

      <SensorMarkers
  onSelectSensor={onSelectSensor}
  rainfall={rainfall}
  selectedSensor={selectedSensor}
/>

      <FloodWater rainfall={rainfall} />

      <WaterPatterns rainfall={rainfall} />

      <WaterRipples rainfall={rainfall} />

      <Suspense fallback={null}>
        <Bounds fit clip observe margin={1.3}>
          <Center>
            <CityModel />
          </Center>
        </Bounds>
      </Suspense>

      <OrbitControls
        makeDefault
        enableDamping
        minDistance={5}
        maxDistance={100}
        maxPolarAngle={Math.PI / 2}
      />
    </Canvas>
  );
}

useGLTF.preload("/models/city.glb");
