import React, { useEffect, useRef } from 'react';

const Background3D: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current || !window.THREE) return;

    // CLEANUP: Force clear any existing canvas to prevent "double globe"
    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }

    const THREE = window.THREE;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 200;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Explicitly set canvas style
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    
    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement);
    }

    const globe = new THREE.Group();
    scene.add(globe);

    // 1. Core Sphere (The inner "solid" look with grid)
    const sphereGeom = new THREE.SphereGeometry(100, 48, 48);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: 0x9333ea, // Purple-600
      wireframe: true,
      transparent: true,
      opacity: 0.1,
    });
    const mainSphere = new THREE.Mesh(sphereGeom, sphereMat);
    globe.add(mainSphere);

    // 2. Latitude/Longitude Lines (The sharp globe lines)
    const ringGeom = new THREE.SphereGeometry(100.5, 24, 24);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xa855f7, // Purple-500
      wireframe: true,
      transparent: true,
      opacity: 0.2,
    });
    const ringSphere = new THREE.Mesh(ringGeom, ringMat);
    globe.add(ringSphere);

    // 3. Glowing Points on vertices
    const pointsGeom = new THREE.SphereGeometry(102, 32, 32);
    const pointsMat = new THREE.PointsMaterial({
      color: 0xd8b4fe, // Purple-300
      size: 1.5,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true
    });
    const globePoints = new THREE.Points(pointsGeom, pointsMat);
    globe.add(globePoints);

    // 4. Background Starfield
    const starsGeom = new THREE.BufferGeometry();
    const starsVertices = [];
    for (let i = 0; i < 2000; i++) {
      const x = (Math.random() - 0.5) * 2000;
      const y = (Math.random() - 0.5) * 2000;
      const z = (Math.random() - 0.5) * 2000;
      starsVertices.push(x, y, z);
    }
    starsGeom.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    const starsMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1,
      transparent: true,
      opacity: 0.4,
    });
    const starField = new THREE.Points(starsGeom, starsMat);
    scene.add(starField);

    // Interaction State
    let mouseX = 0;
    let mouseY = 0;

    const onMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX - window.innerWidth / 2) * 0.05;
      mouseY = (event.clientY - window.innerHeight / 2) * 0.05;
    };

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('resize', onResize);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      
      // Autonomous rotations
      globe.rotation.y += 0.0015;
      globe.rotation.x += 0.0005;
      
      starField.rotation.y += 0.0002;
      
      // Mouse interaction influence
      if (globe) {
        globe.rotation.x += (mouseY * 0.005 - globe.rotation.x) * 0.02;
        globe.rotation.y += (mouseX * 0.005 - globe.rotation.y) * 0.02;
      }
      
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(animationId);
      
      if (mountRef.current && renderer.domElement && mountRef.current.contains(renderer.domElement)) {
          mountRef.current.removeChild(renderer.domElement);
      }
      
      // Safety disposal
      renderer.dispose();
      try {
        sphereGeom.dispose(); sphereMat.dispose();
        ringGeom.dispose(); ringMat.dispose();
        pointsGeom.dispose(); pointsMat.dispose();
        starsGeom.dispose(); starsMat.dispose();
      } catch (e) { /* ignore */ }
    };
  }, []);

  return <div ref={mountRef} className="fixed inset-0 z-0 bg-slate-950" />;
};

export default Background3D;