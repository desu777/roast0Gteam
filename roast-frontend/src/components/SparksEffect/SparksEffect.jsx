import React, { useEffect, useRef, useState } from 'react';

const SparksEffect = ({ 
  active = true, 
  intensity = 1, 
  currentPhase = 'waiting',
  mousePosition = { x: 0, y: 0 }
}) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const sparksRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Cyber-punk color palette
  const colors = [
    '#00D2E9', // Neon cyan
    '#FF5CAA', // Neon pink  
    '#FFD700', // Gold
    '#9B59B6', // Purple
    '#E74C3C', // Red
    '#00F5FF', // Electric blue
    '#FF6B35', // Orange
  ];

  // Initialize sparks
  const initSparks = (canvas) => {
    const sparksCount = Math.floor(50 * intensity);
    const sparks = [];
    
    for (let i = 0; i < sparksCount; i++) {
      sparks.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        life: Math.random() * 100 + 50,
        maxLife: Math.random() * 100 + 50,
        size: Math.random() * 2 + 0.5, // Smaller sparks
        color: colors[Math.floor(Math.random() * colors.length)],
        angle: Math.random() * Math.PI * 2,
        angleSpeed: (Math.random() - 0.5) * 0.02,
        intensity: Math.random() * 0.8 + 0.2,
        flickerSpeed: Math.random() * 0.1 + 0.05,
        time: Math.random() * 1000
      });
    }
    
    sparksRef.current = sparks;
  };

  // Update spark position and movement
  const updateSpark = (spark, deltaTime, canvas, mouseInfluence = 0.1) => {
    spark.time += deltaTime;
    
    // Mouse attraction/repulsion
    const mouseX = mouseRef.current.x;
    const mouseY = mouseRef.current.y;
    const dx = mouseX - spark.x;
    const dy = mouseY - spark.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < 150) {
      const force = (150 - distance) / 150 * mouseInfluence;
      spark.vx += (dx / distance) * force * 0.5;
      spark.vy += (dy / distance) * force * 0.5;
    }

    // Trigonometric movement (inspired by Three.js code)
    const t = spark.time * 0.001;
    const waveX = Math.sin(t * 2 + spark.angle) * 0.5;
    const waveY = Math.cos(t * 1.5 + spark.angle) * 0.3;
    
    spark.vx += waveX * 0.1;
    spark.vy += waveY * 0.1;
    
    // Apply velocity
    spark.x += spark.vx;
    spark.y += spark.vy;
    
    // Update angle
    spark.angle += spark.angleSpeed;
    
    // Boundary wrapping
    if (spark.x < -10) spark.x = canvas.width + 10;
    if (spark.x > canvas.width + 10) spark.x = -10;
    if (spark.y < -10) spark.y = canvas.height + 10;
    if (spark.y > canvas.height + 10) spark.y = -10;
    
    // Decay velocity
    spark.vx *= 0.99;
    spark.vy *= 0.99;
    
    // Life cycle
    spark.life--;
    if (spark.life <= 0) {
      // Respawn spark
      spark.x = Math.random() * canvas.width;
      spark.y = Math.random() * canvas.height;
      spark.life = spark.maxLife;
      spark.vx = (Math.random() - 0.5) * 2;
      spark.vy = (Math.random() - 0.5) * 2;
      spark.color = colors[Math.floor(Math.random() * colors.length)];
    }
  };

  // Render spark as glowing dot
  const renderSpark = (ctx, spark) => {
    const alpha = Math.sin(spark.time * spark.flickerSpeed) * 0.3 + 0.7;
    const glowIntensity = spark.intensity * alpha;
    
    ctx.save();
    
    // Glow effect
    ctx.shadowColor = spark.color;
    ctx.shadowBlur = 10 * glowIntensity;
    
    // Render dot spark
    ctx.beginPath();
    ctx.fillStyle = spark.color;
    ctx.globalAlpha = glowIntensity;
    ctx.arc(spark.x, spark.y, spark.size, 0, Math.PI * 2);
    ctx.fill();
    
    // Extra glow layer for more intensity
    ctx.shadowBlur = 20 * glowIntensity;
    ctx.globalAlpha = 0.3 * glowIntensity;
    ctx.arc(spark.x, spark.y, spark.size * 1.5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  };

  // Animation loop
  const animate = (timestamp) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!canvas || !active) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Phase-based intensity
    let phaseIntensity = 1;
    let mouseInfluence = 0.1;
    
    switch (currentPhase) {
      case 'writing':
        phaseIntensity = 1.5;
        mouseInfluence = 0.2;
        break;
      case 'judging':
        phaseIntensity = 2;
        mouseInfluence = 0.1;
        break;
      case 'results':
        phaseIntensity = 2.5;
        mouseInfluence = 0.3;
        break;
      default:
        phaseIntensity = 1;
        mouseInfluence = 0.1;
    }
    
    // Update and render sparks
    sparksRef.current.forEach(spark => {
      spark.intensity = Math.min(spark.intensity * phaseIntensity, 1);
      updateSpark(spark, 16, canvas, mouseInfluence);
      renderSpark(ctx, spark);
    });
    
    animationRef.current = requestAnimationFrame(animate);
  };

  // Handle mouse movement
  useEffect(() => {
    mouseRef.current = mousePosition;
  }, [mousePosition]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize canvas and animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.width === 0) return;

    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    
    initSparks(canvas);
    
    if (active) {
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [dimensions, active, intensity]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
        opacity: 0.7, // Slightly more visible
        mixBlendMode: 'screen', // Blend mode for better integration
      }}
    />
  );
};

export default SparksEffect; 