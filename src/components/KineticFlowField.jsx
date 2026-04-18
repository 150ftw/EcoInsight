import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const ParticleField = ({ sentiment = 50, flowSpeed = 1, colorMode = 'market', performanceMode = 'high' }) => {
  const pointsRef = useRef();
  const { viewport } = useThree();
  
  const isLowPower = performanceMode === 'low' || performanceMode === 'minimum';
  const particleCount = isLowPower ? 1500 : 4000;
  
  const [positions, offsets, colors, sizes] = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const offsets = new Float32Array(particleCount);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    // Aesthetic Colors
    const saffron = new THREE.Color('#ff9933');
    const green = new THREE.Color('#128807');
    const white = new THREE.Color('#ffffff');
    const bullGreen = new THREE.Color('#22c55e');
    const bearRed = new THREE.Color('#ef4444');
    
    for (let i = 0; i < particleCount; i++) {
      // Random positions in a wide field
      positions[i * 3] = (Math.random() - 0.5) * 15;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 15;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
      
      offsets[i] = Math.random() * Math.PI * 2;
      sizes[i] = Math.random() * (isLowPower ? 0.08 : 0.05) + 0.02;
      
      // Initial Color mapping
      let color = white;
      if (colorMode === 'market') {
        color = sentiment > 50 ? bullGreen : bearRed;
      } else {
        const rand = Math.random();
        color = rand < 0.33 ? saffron : rand < 0.66 ? white : green;
      }
      
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    
    return [positions, offsets, colors, sizes];
  }, [particleCount, colorMode, sentiment, isLowPower]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const positions = pointsRef.current.geometry.attributes.position.array;
    
    // Dynamic Movement based on flowSpeed and sentiment
    const speedFactor = (sentiment / 50) * flowSpeed * 0.2;
    const animationSpeed = isLowPower ? 0.3 : 0.5;
    
    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const offset = offsets[i];
        
        // Harmonic orbital motion
        positions[i3] += Math.sin(time * animationSpeed + offset) * 0.002 * flowSpeed;
        positions[i3 + 1] += Math.cos(time * (animationSpeed - 0.1) + offset) * 0.002 * flowSpeed;
        
        // Vertical "Flow"
        positions[i3 + 1] -= 0.005 * speedFactor;
        
        // Reset if out of bounds
        if (positions[i3 + 1] < -8) positions[i3 + 1] = 8;
    }
    
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    
    // Subtle rotation of the whole field
    pointsRef.current.rotation.y = time * (isLowPower ? 0.02 : 0.05);
    pointsRef.current.rotation.z = time * 0.02;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={isLowPower ? 0.12 : 0.08}
        vertexColors
        transparent
        opacity={isLowPower ? 0.4 : 0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

const KineticFlowField = ({ 
  sentiment = 50, 
  active = true,
  performanceMode = 'high'
}) => {
  if (!active) return null;

  return (
    <div className="kinetic-flow-container">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        gl={{ 
            antialias: performanceMode === 'high', 
            alpha: true,
            powerPreference: 'high-performance' 
        }}
        dpr={performanceMode === 'high' ? [1, 2] : 1}
      >
        <color attach="background" args={['#05050a']} />
        <ambientLight intensity={0.5} />
        <ParticleField 
            sentiment={sentiment} 
            flowSpeed={performanceMode === 'high' ? 1.2 : 0.8} 
            performanceMode={performanceMode}
        />
      </Canvas>
      <style dangerouslySetInnerHTML={{ __html: `
        .kinetic-flow-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: -1;
          pointer-events: none;
          background: #05050a;
        }
        .kinetic-flow-container canvas {
          display: block;
        }
      `}} />
    </div>
  );
};

export default KineticFlowField;
