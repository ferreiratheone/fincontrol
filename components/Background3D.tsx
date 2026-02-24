import React, { useEffect, useRef } from 'react';

const Background3D: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current || !window.THREE) return;

    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }

    const THREE = window.THREE;
    const scene = new THREE.Scene();
    
    // Add a very subtle fog for depth
    scene.fog = new THREE.FogExp2(0x020617, 0.001);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(0, 150, 400);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // optimize performance
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    
    mountRef.current.appendChild(renderer.domElement);

    // --- CYBER FINTECH MESH FIELD ---
    const gridHelper = new THREE.GridHelper(2000, 50, 0x4f46e5, 0x1e293b);
    gridHelper.position.y = -100;
    scene.add(gridHelper);

    // --- GLOWING PARTICLES (DATA NODES) ---
    const particlesGeom = new THREE.BufferGeometry();
    const particleCount = 2000;
    const posArray = new Float32Array(particleCount * 3);
    const colorsArray = new Float32Array(particleCount * 3);
    
    // Violet and Cyan theme
    const color1 = new THREE.Color(0x8b5cf6); // violet
    const color2 = new THREE.Color(0x06b6d4); // cyan

    for(let i = 0; i < particleCount * 3; i+=3) {
      // Create a massive vortex structure
      const r = 800 * Math.sqrt(Math.random());
      const theta = Math.random() * 2 * Math.PI;
      const y = (Math.random() - 0.5) * 500;
      
      posArray[i] = r * Math.cos(theta);
      posArray[i+1] = y;
      posArray[i+2] = r * Math.sin(theta);
      
      // Mix colors
      const mixedColor = color1.clone().lerp(color2, Math.random());
      colorsArray[i] = mixedColor.r;
      colorsArray[i+1] = mixedColor.g;
      colorsArray[i+2] = mixedColor.b;
    }

    particlesGeom.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeom.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));

    // Custom shader material for glowing dots
    const particlesMat = new THREE.PointsMaterial({
      size: 4,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true
    });

    const particleSystem = new THREE.Points(particlesGeom, particlesMat);
    scene.add(particleSystem);

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const onMouseMove = (event: MouseEvent) => {
      // Normalize mouse coordinates to -1 to 1
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('resize', handleResize);

    // Animation Loop
    const clock = new THREE.Clock();
    let animationId: number;

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();
      
      // Smooth mouse follow (easing)
      targetX = mouseX * 200;
      targetY = mouseY * 200;
      camera.position.x += (targetX - camera.position.x) * 0.05;
      camera.position.y += (150 + targetY - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);

      // Rotate particle system slowly
      particleSystem.rotation.y = elapsedTime * 0.05;
      
      // Make particles wave algorithmically
      const positions = particleSystem.geometry.attributes.position.array as Float32Array;
      for(let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const x = positions[i3];
        const z = positions[i3+2];
        // Sine wave based on position and time
        positions[i3+1] += Math.sin(elapsedTime * 2 + x * 0.01 + z * 0.01) * 0.5;
      }
      particleSystem.geometry.attributes.position.needsUpdate = true;
      
      // Move grid to simulate forward motion
      gridHelper.position.z = (elapsedTime * 50) % 100;

      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      
      if (mountRef.current && renderer.domElement && mountRef.current.contains(renderer.domElement)) {
          mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      particlesGeom.dispose();
      particlesMat.dispose();
    };
  }, []);

  return (
    <>
      <div ref={mountRef} className="fixed inset-0 z-0 bg-[#020617]" />
      {/* VIGNETTE GRADIENT OVERLAY FOR AESTHETICS */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,#020617_100%)] opacity-80" />
    </>
  );
};

export default Background3D;