'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';

// ─── Types ───────────────────────────────────────────────────
interface Milestone {
  id: number;
  x: number;
  title: string;
  year: string;
  description: string;
  tech: string[];
  color: string;
  icon: string;
  link?: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface Star {
  x: number;
  y: number;
  size: number;
  brightness: number;
  twinkleSpeed: number;
  twinkleOffset: number;
}

interface Cloud {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  opacity: number;
}

interface SpeedLine {
  x: number;
  y: number;
  length: number;
  opacity: number;
  speed: number;
}

// ─── Constants ───────────────────────────────────────────────
const WORLD_WIDTH = 12000;
const GROUND_Y = 0.72;
const CAR_WIDTH = 120;
const CAR_HEIGHT = 50;
const MAX_SPEED = 9;
const ACCELERATION = 0.35;
const DECELERATION = 0.15;
const BOOST_MULTIPLIER = 1.8;
const MILESTONE_TRIGGER_DISTANCE = 100;

const MILESTONES: Milestone[] = [
  {
    id: 0,
    x: 800,
    title: 'Started Coding',
    year: '2016',
    description: 'Wrote my first "Hello World" and fell in love with programming. Built simple HTML pages and learned the fundamentals of web development.',
    tech: ['HTML', 'CSS', 'JavaScript'],
    color: '#4ade80',
    icon: '🌱',
  },
  {
    id: 1,
    x: 2200,
    title: 'University & CS Degree',
    year: '2017',
    description: 'Pursued Computer Science, diving deep into algorithms, data structures, and software engineering principles.',
    tech: ['Python', 'Java', 'C++', 'SQL'],
    color: '#60a5fa',
    icon: '🎓',
  },
  {
    id: 2,
    x: 3600,
    title: 'First Internship',
    year: '2018',
    description: 'Joined a startup as a frontend intern. Built real products used by thousands of users and learned agile development.',
    tech: ['React', 'Redux', 'Node.js', 'Git'],
    color: '#c084fc',
    icon: '💼',
  },
  {
    id: 3,
    x: 5000,
    title: 'Full-Stack Developer',
    year: '2019',
    description: 'Landed first full-time role. Led development of a SaaS platform serving 50K+ users with microservices architecture.',
    tech: ['TypeScript', 'Next.js', 'PostgreSQL', 'Docker', 'AWS'],
    color: '#f472b6',
    icon: '🚀',
  },
  {
    id: 4,
    x: 6600,
    title: 'Open Source Contributor',
    year: '2020',
    description: 'Started contributing to major open source projects. Built tools used by thousands of developers worldwide.',
    tech: ['Rust', 'WebAssembly', 'GraphQL', 'Kubernetes'],
    color: '#fb923c',
    icon: '⭐',
  },
  {
    id: 5,
    x: 8200,
    title: 'Tech Lead',
    year: '2021',
    description: 'Promoted to Tech Lead. Managed a team of 8 engineers, established coding standards, and mentored junior developers.',
    tech: ['System Design', 'CI/CD', 'Terraform', 'Team Leadership'],
    color: '#facc15',
    icon: '👑',
  },
  {
    id: 6,
    x: 9800,
    title: 'Indie Hacker & Creator',
    year: '2023',
    description: 'Launched my own products. Building the future with AI-powered tools and creative interactive experiences like this one.',
    tech: ['AI/ML', 'Three.js', 'Svelte', 'Edge Computing'],
    color: '#e879f9',
    icon: '✨',
  },
  {
    id: 7,
    x: 11200,
    title: 'The Journey Continues...',
    year: '2025',
    description: 'Always learning, always building. The road ahead is full of possibilities. What will we create together?',
    tech: ['Your Stack Here', '∞ Possibilities'],
    color: '#22d3ee',
    icon: '🌟',
  },
];

// ─── Helper Functions ────────────────────────────────────────
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function getDayNightProgress(carX: number): number {
  return clamp(carX / WORLD_WIDTH, 0, 1);
}

function getSkyColors(progress: number): { top: string; bottom: string; sunY: number; sunOpacity: number; moonOpacity: number } {
  if (progress < 0.15) {
    return {
      top: lerpColor('#87CEEB', '#FFB347', progress / 0.15),
      bottom: lerpColor('#E0F7FA', '#FFE0B2', progress / 0.15),
      sunY: lerp(0.9, 0.3, progress / 0.15),
      sunOpacity: lerp(0.3, 1, progress / 0.15),
      moonOpacity: 0,
    };
  } else if (progress < 0.45) {
    return {
      top: lerpColor('#4A90D9', '#87CEEB', (progress - 0.15) / 0.3),
      bottom: lerpColor('#FFE0B2', '#B3E5FC', (progress - 0.15) / 0.3),
      sunY: lerp(0.3, 0.15, (progress - 0.15) / 0.3),
      sunOpacity: 1,
      moonOpacity: 0,
    };
  } else if (progress < 0.6) {
    return {
      top: lerpColor('#87CEEB', '#FF6B6B', (progress - 0.45) / 0.15),
      bottom: lerpColor('#B3E5FC', '#FFB347', (progress - 0.45) / 0.15),
      sunY: lerp(0.15, 0.7, (progress - 0.45) / 0.15),
      sunOpacity: lerp(1, 0.8, (progress - 0.45) / 0.15),
      moonOpacity: 0,
    };
  } else if (progress < 0.75) {
    return {
      top: lerpColor('#FF6B6B', '#1a1a3e', (progress - 0.6) / 0.15),
      bottom: lerpColor('#FFB347', '#2d1b69', (progress - 0.6) / 0.15),
      sunY: lerp(0.7, 1.1, (progress - 0.6) / 0.15),
      sunOpacity: lerp(0.8, 0, (progress - 0.6) / 0.15),
      moonOpacity: lerp(0, 1, (progress - 0.6) / 0.15),
    };
  } else {
    return {
      top: lerpColor('#1a1a3e', '#0d0d2b', (progress - 0.75) / 0.25),
      bottom: lerpColor('#2d1b69', '#1a0a3e', (progress - 0.75) / 0.25),
      sunY: 1.2,
      sunOpacity: 0,
      moonOpacity: 1,
    };
  }
}

function lerpColor(a: string, b: string, t: number): string {
  const ah = parseInt(a.replace('#', ''), 16);
  const bh = parseInt(b.replace('#', ''), 16);
  const ar = (ah >> 16) & 0xff, ag = (ah >> 8) & 0xff, ab = ah & 0xff;
  const br = (bh >> 16) & 0xff, bg = (bh >> 8) & 0xff, bb = bh & 0xff;
  const rr = Math.round(lerp(ar, br, t));
  const rg = Math.round(lerp(ag, bg, t));
  const rb = Math.round(lerp(ab, bb, t));
  return `#${((rr << 16) | (rg << 8) | rb).toString(16).padStart(6, '0')}`;
}

// ─── Main Component ──────────────────────────────────────────
export default function CarTimelinePortfolio() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef({
    carX: 200,
    carSpeed: 0,
    cameraX: 0,
    targetCameraX: 0,
    wheelRotation: 0,
    carBob: 0,
    keys: {} as Record<string, boolean>,
    particles: [] as Particle[],
    stars: [] as Star[],
    clouds: [] as Cloud[],
    speedLines: [] as SpeedLine[],
    activeMilestone: null as Milestone | null,
    visitedMilestones: new Set<number>(),
    milestoneAnimations: new Map<number, number>(),
    showCard: false,
    cardOpacity: 0,
    cardTargetOpacity: 0,
    time: 0,
    isBoosting: false,
    boostTimer: 0,
    tiltAngle: 0,
    headlightIntensity: 0,
    initialized: false,
    shakeX: 0,
    shakeY: 0,
    lastMilestoneId: -1,
    introComplete: false,
    introTimer: 0,
    touchStartX: 0,
    touchActive: false,
    touchDirection: 0,
  });

  const [activeCard, setActiveCard] = useState<Milestone | null>(null);
  const [cardVisible, setCardVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [visitedCount, setVisitedCount] = useState(0);
  const [isBoosting, setIsBoosting] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [currentSpeed, setCurrentSpeed] = useState(0);

  // Initialize stars and clouds
  const initWorld = useCallback((canvas: HTMLCanvasElement) => {
    const gs = gameStateRef.current;
    if (gs.initialized) return;
    gs.initialized = true;

    gs.stars = Array.from({ length: 200 }, () => ({
      x: Math.random() * WORLD_WIDTH,
      y: Math.random() * canvas.height * 0.6,
      size: Math.random() * 2.5 + 0.5,
      brightness: Math.random(),
      twinkleSpeed: Math.random() * 3 + 1,
      twinkleOffset: Math.random() * Math.PI * 2,
    }));

    gs.clouds = Array.from({ length: 15 }, () => ({
      x: Math.random() * WORLD_WIDTH,
      y: Math.random() * canvas.height * 0.3 + 30,
      width: Math.random() * 200 + 100,
      height: Math.random() * 40 + 20,
      speed: Math.random() * 0.3 + 0.1,
      opacity: Math.random() * 0.4 + 0.2,
    }));
  }, []);

  // ─── Drawing Functions ───────────────────────────────────
  const drawSky = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, dayProgress: number) => {
    const sky = getSkyColors(dayProgress);
    const grad = ctx.createLinearGradient(0, 0, 0, h * GROUND_Y);
    grad.addColorStop(0, sky.top);
    grad.addColorStop(1, sky.bottom);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h * GROUND_Y);

    // Sun
    if (sky.sunOpacity > 0) {
      const sunX = w * 0.8 - (dayProgress * w * 0.6);
      const sunY = h * sky.sunY;
      ctx.save();
      ctx.globalAlpha = sky.sunOpacity;
      const sunGrad = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 60);
      sunGrad.addColorStop(0, '#FFF7AE');
      sunGrad.addColorStop(0.3, '#FFD93D');
      sunGrad.addColorStop(0.7, 'rgba(255,180,50,0.3)');
      sunGrad.addColorStop(1, 'rgba(255,150,50,0)');
      ctx.fillStyle = sunGrad;
      ctx.fillRect(sunX - 80, sunY - 80, 160, 160);
      ctx.beginPath();
      ctx.arc(sunX, sunY, 30, 0, Math.PI * 2);
      ctx.fillStyle = '#FFE066';
      ctx.fill();
      ctx.restore();
    }

    // Moon
    if (sky.moonOpacity > 0) {
      const moonX = w * 0.75;
      const moonY = h * 0.15;
      ctx.save();
      ctx.globalAlpha = sky.moonOpacity;
      const moonGrad = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, 50);
      moonGrad.addColorStop(0, '#F0F0FF');
      moonGrad.addColorStop(0.5, 'rgba(200,200,255,0.3)');
      moonGrad.addColorStop(1, 'rgba(200,200,255,0)');
      ctx.fillStyle = moonGrad;
      ctx.fillRect(moonX - 60, moonY - 60, 120, 120);
      ctx.beginPath();
      ctx.arc(moonX, moonY, 22, 0, Math.PI * 2);
      ctx.fillStyle = '#E8E8FF';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(moonX + 8, moonY - 5, 18, 0, Math.PI * 2);
      ctx.fillStyle = sky.top;
      ctx.fill();
      ctx.restore();
    }
  }, []);

  const drawStars = useCallback((ctx: CanvasRenderingContext2D, cameraX: number, time: number, dayProgress: number) => {
    const gs = gameStateRef.current;
    if (dayProgress < 0.55) return;
    const starAlpha = clamp((dayProgress - 0.55) / 0.2, 0, 1);
    ctx.save();
    ctx.globalAlpha = starAlpha;
    gs.stars.forEach(star => {
      const sx = star.x - cameraX * 0.05;
      const twinkle = 0.5 + 0.5 * Math.sin(time * star.twinkleSpeed + star.twinkleOffset);
      ctx.globalAlpha = starAlpha * twinkle * star.brightness;
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(sx % (ctx.canvas.width + 100), star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }, []);

  const drawParallaxMountains = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, cameraX: number, dayProgress: number) => {
    const groundY = h * GROUND_Y;
    const darkFactor = clamp(dayProgress > 0.6 ? (dayProgress - 0.6) / 0.3 : 0, 0, 1);

    // Far mountains (layer 1)
    ctx.save();
    const farOffset = cameraX * 0.1;
    const farColor = lerpColor('#B8C9E0', '#2a1a4e', darkFactor);
    ctx.fillStyle = farColor;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    for (let x = 0; x <= w + 50; x += 50) {
      const wx = x + farOffset;
      const mh = Math.sin(wx * 0.003) * 80 + Math.sin(wx * 0.007) * 40 + Math.cos(wx * 0.001) * 60;
      ctx.lineTo(x, groundY - 120 - mh);
    }
    ctx.lineTo(w, groundY);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Mid mountains (layer 2)
    ctx.save();
    const midOffset = cameraX * 0.25;
    const midColor = lerpColor('#8FA8C8', '#1f1045', darkFactor);
    ctx.fillStyle = midColor;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    for (let x = 0; x <= w + 50; x += 40) {
      const wx = x + midOffset;
      const mh = Math.sin(wx * 0.005) * 60 + Math.sin(wx * 0.012) * 30 + Math.cos(wx * 0.002) * 45;
      ctx.lineTo(x, groundY - 70 - mh);
    }
    ctx.lineTo(w, groundY);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Near hills (layer 3)
    ctx.save();
    const nearOffset = cameraX * 0.45;
    const nearColor = lerpColor('#6B8DB5', '#150d35', darkFactor);
    ctx.fillStyle = nearColor;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    for (let x = 0; x <= w + 30; x += 30) {
      const wx = x + nearOffset;
      const mh = Math.sin(wx * 0.008) * 35 + Math.sin(wx * 0.02) * 20;
      ctx.lineTo(x, groundY - 30 - mh);
    }
    ctx.lineTo(w, groundY);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }, []);

  const drawClouds = useCallback((ctx: CanvasRenderingContext2D, cameraX: number, dayProgress: number) => {
    const gs = gameStateRef.current;
    const cloudAlpha = dayProgress > 0.7 ? lerp(0.5, 0.1, (dayProgress - 0.7) / 0.3) : 0.5;
    ctx.save();
    gs.clouds.forEach(cloud => {
      const cx = ((cloud.x - cameraX * 0.15) % (ctx.canvas.width + 400)) - 200;
      ctx.globalAlpha = cloud.opacity * cloudAlpha;
      ctx.fillStyle = dayProgress > 0.6 ? '#2a2060' : '#FFFFFF';
      ctx.beginPath();
      ctx.ellipse(cx, cloud.y, cloud.width / 2, cloud.height / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx - cloud.width * 0.25, cloud.y + 5, cloud.width * 0.3, cloud.height * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx + cloud.width * 0.25, cloud.y + 3, cloud.width * 0.35, cloud.height * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }, []);

  const drawGround = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, cameraX: number, dayProgress: number) => {
    const groundY = h * GROUND_Y;
    const darkFactor = clamp(dayProgress > 0.6 ? (dayProgress - 0.6) / 0.3 : 0, 0, 1);

    // Main ground
    const groundGrad = ctx.createLinearGradient(0, groundY, 0, h);
    const topColor = lerpColor('#4A7C59', '#1a2a15', darkFactor);
    const botColor = lerpColor('#3D5A40', '#0d1a0a', darkFactor);
    groundGrad.addColorStop(0, topColor);
    groundGrad.addColorStop(1, botColor);
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, groundY, w, h - groundY);

    // Road
    const roadY = groundY + 30;
    const roadH = 50;
    const roadColor = lerpColor('#555555', '#222222', darkFactor);
    ctx.fillStyle = roadColor;
    ctx.fillRect(0, roadY, w, roadH);

    // Road lines (dashed)
    ctx.strokeStyle = lerpColor('#FFDD44', '#AA8800', darkFactor);
    ctx.lineWidth = 3;
    ctx.setLineDash([30, 25]);
    ctx.lineDashOffset = -cameraX;
    ctx.beginPath();
    ctx.moveTo(0, roadY + roadH / 2);
    ctx.lineTo(w, roadY + roadH / 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Road edges
    ctx.strokeStyle = lerpColor('#FFFFFF', '#666666', darkFactor);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, roadY);
    ctx.lineTo(w, roadY);
    ctx.moveTo(0, roadY + roadH);
    ctx.lineTo(w, roadY + roadH);
    ctx.stroke();
  }, []);

  const drawCar = useCallback((ctx: CanvasRenderingContext2D, h: number, gs: typeof gameStateRef.current, dayProgress: number) => {
    const groundY = h * GROUND_Y;
    const roadY = groundY + 30;
    const carDrawX = gs.carX - gs.cameraX;
    const carY = roadY + 2 + Math.sin(gs.carBob) * 2;
    const wheelR = 12;

    ctx.save();
    ctx.translate(carDrawX + CAR_WIDTH / 2, carY + CAR_HEIGHT / 2);
    ctx.rotate(gs.tiltAngle);
    ctx.translate(-(carDrawX + CAR_WIDTH / 2), -(carY + CAR_HEIGHT / 2));

    // Shadow
    ctx.save();
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(carDrawX + CAR_WIDTH / 2, carY + CAR_HEIGHT + 5, CAR_WIDTH / 2 + 5, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Headlights glow
    if (dayProgress > 0.5) {
      const glowIntensity = clamp((dayProgress - 0.5) / 0.2, 0, 1);
      ctx.save();
      ctx.globalAlpha = glowIntensity * 0.4;
      const hlGrad = ctx.createRadialGradient(carDrawX + CAR_WIDTH + 10, carY + CAR_HEIGHT - 15, 0, carDrawX + CAR_WIDTH + 80, carY + CAR_HEIGHT, 120);
      hlGrad.addColorStop(0, 'rgba(255,255,200,0.8)');
      hlGrad.addColorStop(1, 'rgba(255,255,200,0)');
      ctx.fillStyle = hlGrad;
      ctx.beginPath();
      ctx.moveTo(carDrawX + CAR_WIDTH, carY + CAR_HEIGHT - 25);
      ctx.lineTo(carDrawX + CAR_WIDTH + 200, carY + CAR_HEIGHT - 40);
      ctx.lineTo(carDrawX + CAR_WIDTH + 200, carY + CAR_HEIGHT + 20);
      ctx.lineTo(carDrawX + CAR_WIDTH, carY + CAR_HEIGHT - 5);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // Car body
    const bodyGrad = ctx.createLinearGradient(carDrawX, carY, carDrawX, carY + CAR_HEIGHT);
    bodyGrad.addColorStop(0, '#FF4444');
    bodyGrad.addColorStop(0.5, '#CC2222');
    bodyGrad.addColorStop(1, '#991111');
    ctx.fillStyle = bodyGrad;

    // Main body shape
    ctx.beginPath();
    ctx.moveTo(carDrawX + 10, carY + CAR_HEIGHT);
    ctx.lineTo(carDrawX + 5, carY + CAR_HEIGHT - 15);
    ctx.lineTo(carDrawX + 15, carY + CAR_HEIGHT - 25);
    ctx.lineTo(carDrawX + 30, carY + CAR_HEIGHT - 25);
    ctx.lineTo(carDrawX + 35, carY + CAR_HEIGHT - 42);
    ctx.lineTo(carDrawX + 80, carY + CAR_HEIGHT - 42);
    ctx.lineTo(carDrawX + 95, carY + CAR_HEIGHT - 25);
    ctx.lineTo(carDrawX + CAR_WIDTH - 5, carY + CAR_HEIGHT - 25);
    ctx.lineTo(carDrawX + CAR_WIDTH, carY + CAR_HEIGHT - 15);
    ctx.lineTo(carDrawX + CAR_WIDTH - 5, carY + CAR_HEIGHT);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#880000';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Windows
    const winGrad = ctx.createLinearGradient(carDrawX + 38, carY, carDrawX + 38, carY + CAR_HEIGHT - 28);
    winGrad.addColorStop(0, '#AAD4FF');
    winGrad.addColorStop(1, '#6BB3FF');
    ctx.fillStyle = winGrad;
    ctx.beginPath();
    ctx.moveTo(carDrawX + 38, carY + CAR_HEIGHT - 28);
    ctx.lineTo(carDrawX + 42, carY + CAR_HEIGHT - 40);
    ctx.lineTo(carDrawX + 58, carY + CAR_HEIGHT - 40);
    ctx.lineTo(carDrawX + 58, carY + CAR_HEIGHT - 28);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(carDrawX + 62, carY + CAR_HEIGHT - 28);
    ctx.lineTo(carDrawX + 62, carY + CAR_HEIGHT - 40);
    ctx.lineTo(carDrawX + 77, carY + CAR_HEIGHT - 40);
    ctx.lineTo(carDrawX + 85, carY + CAR_HEIGHT - 28);
    ctx.closePath();
    ctx.fill();

    // Headlights
    ctx.fillStyle = dayProgress > 0.5 ? '#FFFFAA' : '#FFEECC';
    ctx.fillRect(carDrawX + CAR_WIDTH - 8, carY + CAR_HEIGHT - 22, 6, 8);

    // Taillights
    ctx.fillStyle = Math.abs(gs.carSpeed) < 0.5 && gs.keys['ArrowLeft'] ? '#FF0000' : '#CC4444';
    ctx.fillRect(carDrawX + 4, carY + CAR_HEIGHT - 22, 5, 8);

    // Wheels
    const drawWheel = (wx: number, wy: number) => {
      ctx.beginPath();
      ctx.arc(wx, wy, wheelR, 0, Math.PI * 2);
      ctx.fillStyle = '#1a1a1a';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(wx, wy, wheelR - 3, 0, Math.PI * 2);
      ctx.fillStyle = '#333';
      ctx.fill();
      // Spokes
      ctx.save();
      ctx.translate(wx, wy);
      ctx.rotate(gs.wheelRotation);
      ctx.strokeStyle = '#666';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        const angle = (i * Math.PI) / 2;
        ctx.lineTo(Math.cos(angle) * (wheelR - 4), Math.sin(angle) * (wheelR - 4));
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#888';
      ctx.fill();
      ctx.restore();
    };

    drawWheel(carDrawX + 25, carY + CAR_HEIGHT + 2);
    drawWheel(carDrawX + CAR_WIDTH - 25, carY + CAR_HEIGHT + 2);

    ctx.restore();
  }, []);

  const drawMilestones = useCallback((ctx: CanvasRenderingContext2D, h: number, cameraX: number, time: number, dayProgress: number) => {
    const gs = gameStateRef.current;
    const groundY = h * GROUND_Y;
    const w = ctx.canvas.width;
    const darkFactor = clamp(dayProgress > 0.6 ? (dayProgress - 0.6) / 0.3 : 0, 0, 1);

    MILESTONES.forEach(ms => {
      const sx = ms.x - cameraX;
      if (sx < -100 || sx > w + 100) return;

      const visited = gs.visitedMilestones.has(ms.id);
      const signY = groundY - 10;

      // Sign post
      ctx.fillStyle = lerpColor('#8B7355', '#4a3a25', darkFactor);
      ctx.fillRect(sx - 3, signY - 80, 6, 80);

      // Sign board
      const boardW = 70;
      const boardH = 45;
      ctx.fillStyle = visited ? ms.color : lerpColor('#D4A574', '#6a5040', darkFactor);
      ctx.strokeStyle = lerpColor('#8B7355', '#4a3a25', darkFactor);
      ctx.lineWidth = 2;

      // Rounded rect
      const bx = sx - boardW / 2;
      const by = signY - 80 - boardH;
      const br = 6;
      ctx.beginPath();
      ctx.moveTo(bx + br, by);
      ctx.lineTo(bx + boardW - br, by);
      ctx.quadraticCurveTo(bx + boardW, by, bx + boardW, by + br);
      ctx.lineTo(bx + boardW, by + boardH - br);
      ctx.quadraticCurveTo(bx + boardW, by + boardH, bx + boardW - br, by + boardH);
      ctx.lineTo(bx + br, by + boardH);
      ctx.quadraticCurveTo(bx, by + boardH, bx, by + boardH - br);
      ctx.lineTo(bx, by + br);
      ctx.quadraticCurveTo(bx, by, bx + br, by);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Icon
      ctx.font = '22px serif';
      ctx.textAlign = 'center';
      ctx.fillText(ms.icon, sx, by + 28);

      // Year label
      ctx.font = 'bold 10px monospace';
      ctx.fillStyle = visited ? '#FFFFFF' : lerpColor('#8B7355', '#aa9070', darkFactor);
      ctx.fillText(ms.year, sx, by + 42);

      // Beacon animation for unvisited
      if (!visited) {
        const pulse = 0.5 + 0.5 * Math.sin(time * 3 + ms.id);
        ctx.save();
        ctx.globalAlpha = pulse * 0.5;
        ctx.beginPath();
        ctx.arc(sx, signY - 80 - boardH / 2, 40 + pulse * 15, 0, Math.PI * 2);
        ctx.strokeStyle = ms.color;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      }

      // Visit animation
      const animProgress = gs.milestoneAnimations.get(ms.id);
      if (animProgress !== undefined && animProgress < 1) {
        ctx.save();
        ctx.globalAlpha = 1 - animProgress;
        const burstR = animProgress * 80;
        ctx.beginPath();
        ctx.arc(sx, signY - 50, burstR, 0, Math.PI * 2);
        ctx.strokeStyle = ms.color;
        ctx.lineWidth = 3 * (1 - animProgress);
        ctx.stroke();
        // Sparkles
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2 + time * 2;
          const sparkR = burstR * 0.8;
          const sparkX = sx + Math.cos(angle) * sparkR;
          const sparkY = signY - 50 + Math.sin(angle) * sparkR;
          ctx.beginPath();
          ctx.arc(sparkX, sparkY, 3 * (1 - animProgress), 0, Math.PI * 2);
          ctx.fillStyle = ms.color;
          ctx.fill();
        }
        ctx.restore();
      }
    });
  }, []);

  const drawParticles = useCallback((ctx: CanvasRenderingContext2D, cameraX: number) => {
    const gs = gameStateRef.current;
    gs.particles.forEach(p => {
      const alpha = p.life / p.maxLife;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x - cameraX, p.y, p.size * alpha, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }, []);

  const drawSpeedLines = useCallback((ctx: CanvasRenderingContext2D, h: number) => {
    const gs = gameStateRef.current;
    if (Math.abs(gs.carSpeed) < 5) return;
    gs.speedLines.forEach(sl => {
      ctx.save();
      ctx.globalAlpha = sl.opacity;
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(sl.x, sl.y);
      ctx.lineTo(sl.x - sl.length, sl.y);
      ctx.stroke();
      ctx.restore();
    });
  }, []);

  const drawHUD = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, gs: typeof gameStateRef.current) => {
    // Speedometer (bottom-right)
    const smX = w - 80;
    const smY = h - 70;
    const smR = 40;
    ctx.save();
    ctx.globalAlpha = 0.8;
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.beginPath();
    ctx.arc(smX, smY, smR + 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Speed arc
    const speedFrac = Math.abs(gs.carSpeed) / MAX_SPEED;
    const startAngle = Math.PI * 0.75;
    const endAngle = Math.PI * 2.25;
    const currentAngle = startAngle + (endAngle - startAngle) * speedFrac;

    ctx.beginPath();
    ctx.arc(smX, smY, smR - 5, startAngle, endAngle);
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(smX, smY, smR - 5, startAngle, currentAngle);
    const spdGrad = ctx.createLinearGradient(smX - smR, smY, smX + smR, smY);
    spdGrad.addColorStop(0, '#4ade80');
    spdGrad.addColorStop(0.5, '#facc15');
    spdGrad.addColorStop(1, '#ef4444');
    ctx.strokeStyle = spdGrad;
    ctx.lineWidth = 4;
    ctx.stroke();

    // Speed text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(Math.round(Math.abs(gs.carSpeed) * 20).toString(), smX, smY + 4);
    ctx.font = '8px monospace';
    ctx.fillStyle = '#AAA';
    ctx.fillText('km/h', smX, smY + 16);
    ctx.restore();

    // Minimap (top area)
    const mmW = Math.min(w * 0.6, 500);
    const mmH = 6;
    const mmX = (w - mmW) / 2;
    const mmY = 20;

    ctx.save();
    ctx.globalAlpha = 0.8;
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.roundRect(mmX - 10, mmY - 10, mmW + 20, mmH + 50, 12);
    ctx.fill();

    // Track
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.beginPath();
    ctx.roundRect(mmX, mmY, mmW, mmH, 3);
    ctx.fill();

    // Milestones on minimap
    MILESTONES.forEach(ms => {
      const mx = mmX + (ms.x / WORLD_WIDTH) * mmW;
      const visited = gs.visitedMilestones.has(ms.id);
      ctx.fillStyle = visited ? ms.color : 'rgba(255,255,255,0.3)';
      ctx.beginPath();
      ctx.arc(mx, mmY + mmH / 2, visited ? 5 : 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // Car position on minimap
    const carMmX = mmX + (gs.carX / WORLD_WIDTH) * mmW;
    ctx.fillStyle = '#FF4444';
    ctx.beginPath();
    ctx.moveTo(carMmX - 6, mmY + mmH + 4);
    ctx.lineTo(carMmX + 6, mmY + mmH + 4);
    ctx.lineTo(carMmX, mmY + mmH - 2);
    ctx.closePath();
    ctx.fill();

    // Progress text
    const pct = Math.round((gs.visitedMilestones.size / MILESTONES.length) * 100);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${gs.visitedMilestones.size}/${MILESTONES.length} milestones · ${pct}%`, w / 2, mmY + mmH + 28);

    // Boost indicator
    if (gs.isBoosting) {
      ctx.fillStyle = '#FF8800';
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('🔥 BOOST', 20, h - 20);
    }

    ctx.restore();
  }, []);

  // ─── Game Loop ──────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    initWorld(canvas);

    const gs = gameStateRef.current;

    // Input handlers
    const onKeyDown = (e: KeyboardEvent) => {
      gs.keys[e.key] = true;
      if (e.key === ' ' || e.key === 'Escape') {
        e.preventDefault();
        if (gs.showCard) {
          gs.showCard = false;
          gs.cardTargetOpacity = 0;
          gs.activeMilestone = null;
          setCardVisible(false);
          setActiveCard(null);
        }
      }
      if (e.key === 'Enter' && !gs.introComplete) {
        gs.introComplete = true;
        setShowIntro(false);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      gs.keys[e.key] = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.deltaY > 0 || e.deltaX > 0) {
        gs.keys['ScrollRight'] = true;
        gs.keys['ScrollLeft'] = false;
      } else {
        gs.keys['ScrollLeft'] = true;
        gs.keys['ScrollRight'] = false;
      }
      setTimeout(() => {
        gs.keys['ScrollRight'] = false;
        gs.keys['ScrollLeft'] = false;
      }, 150);
    };

    const onTouchStart = (e: TouchEvent) => {
      gs.touchStartX = e.touches[0].clientX;
      gs.touchActive = true;
      if (!gs.introComplete) {
        gs.introComplete = true;
        setShowIntro(false);
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!gs.touchActive) return;
      const dx = e.touches[0].clientX - gs.touchStartX;
      gs.touchDirection = dx > 20 ? 1 : dx < -20 ? -1 : 0;
    };
    const onTouchEnd = () => {
      gs.touchActive = false;
      gs.touchDirection = 0;
    };

    const onClick = () => {
      if (!gs.introComplete) {
        gs.introComplete = true;
        setShowIntro(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('touchstart', onTouchStart);
    canvas.addEventListener('touchmove', onTouchMove);
    canvas.addEventListener('touchend', onTouchEnd);
    canvas.addEventListener('click', onClick);

    const gameLoop = () => {
      const w = canvas.width;
      const h = canvas.height;
      gs.time += 0.016;

      // Intro
      if (!gs.introComplete) {
        gs.introTimer += 0.016;
        ctx.clearRect(0, 0, w, h);

        const introGrad = ctx.createLinearGradient(0, 0, 0, h);
        introGrad.addColorStop(0, '#0d0d2b');
        introGrad.addColorStop(1, '#1a0a3e');
        ctx.fillStyle = introGrad;
        ctx.fillRect(0, 0, w, h);

        // Animated stars in intro
        ctx.save();
        for (let i = 0; i < 80; i++) {
          const sx = (Math.sin(i * 127.1 + gs.introTimer * 0.2) * 0.5 + 0.5) * w;
          const sy = (Math.cos(i * 311.7) * 0.5 + 0.5) * h;
          const twinkle = 0.3 + 0.7 * Math.sin(gs.introTimer * (1 + i * 0.05) + i);
          ctx.globalAlpha = twinkle;
          ctx.fillStyle = '#FFF';
          ctx.beginPath();
          ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        // Title
        ctx.save();
        ctx.textAlign = 'center';
        const titleBounce = Math.sin(gs.introTimer * 2) * 5;
        ctx.fillStyle = '#FF4444';
        ctx.font = `bold ${Math.min(w * 0.08, 60)}px monospace`;
        ctx.fillText('🚗 Career Drive', w / 2, h * 0.35 + titleBounce);

        ctx.fillStyle = '#AAA';
        ctx.font = `${Math.min(w * 0.025, 18)}px monospace`;
        ctx.fillText('An interactive journey through my career', w / 2, h * 0.45);

        ctx.fillStyle = '#FFF';
        ctx.font = `${Math.min(w * 0.025, 16)}px monospace`;
        ctx.fillText('← → Arrow Keys to Drive  |  Hold for Boost', w / 2, h * 0.55);
        ctx.fillText('Scroll or Swipe also works!', w / 2, h * 0.6);

        const blink = Math.sin(gs.introTimer * 3) > 0;
        if (blink) {
          ctx.fillStyle = '#FFD700';
          ctx.font = `bold ${Math.min(w * 0.03, 20)}px monospace`;
          ctx.fillText('Press ENTER or Click to Start', w / 2, h * 0.72);
        }

        // Draw small car
        const previewCarX = w / 2 - 40 + Math.sin(gs.introTimer) * 30;
        ctx.fillStyle = '#FF4444';
        ctx.beginPath();
        ctx.roundRect(previewCarX, h * 0.8, 80, 25, 4);
        ctx.fill();
        ctx.fillStyle = '#AAD4FF';
        ctx.fillRect(previewCarX + 20, h * 0.8 - 12, 35, 14);
        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath();
        ctx.arc(previewCarX + 15, h * 0.8 + 27, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(previewCarX + 65, h * 0.8 + 27, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        animId = requestAnimationFrame(gameLoop);
        return;
      }

      // ── Physics ───────────────────────────────────
      const rightPressed = gs.keys['ArrowRight'] || gs.keys['d'] || gs.keys['D'] || gs.keys['ScrollRight'] || gs.touchDirection > 0;
      const leftPressed = gs.keys['ArrowLeft'] || gs.keys['a'] || gs.keys['A'] || gs.keys['ScrollLeft'] || gs.touchDirection < 0;

      // Boost detection (hold key for > 0.5s)
      if (rightPressed || leftPressed) {
        gs.boostTimer += 0.016;
        gs.isBoosting = gs.boostTimer > 0.5;
      } else {
        gs.boostTimer = 0;
        gs.isBoosting = false;
      }
      setIsBoosting(gs.isBoosting);

      const speedMult = gs.isBoosting ? BOOST_MULTIPLIER : 1;
      const maxSpd = MAX_SPEED * speedMult;

      if (rightPressed) {
        gs.carSpeed = Math.min(gs.carSpeed + ACCELERATION * speedMult, maxSpd);
      } else if (leftPressed) {
        gs.carSpeed = Math.max(gs.carSpeed - ACCELERATION * speedMult, -maxSpd * 0.6);
      } else {
        if (gs.carSpeed > 0) gs.carSpeed = Math.max(0, gs.carSpeed - DECELERATION);
        else if (gs.carSpeed < 0) gs.carSpeed = Math.min(0, gs.carSpeed + DECELERATION);
      }

      gs.carX = clamp(gs.carX + gs.carSpeed, 50, WORLD_WIDTH - 50);
      gs.wheelRotation += gs.carSpeed * 0.15;
      gs.carBob += Math.abs(gs.carSpeed) * 0.08;
      gs.tiltAngle = lerp(gs.tiltAngle, gs.carSpeed * 0.008, 0.1);
      setCurrentSpeed(Math.abs(gs.carSpeed));

      // Camera
      gs.targetCameraX = gs.carX - w * 0.35;
      gs.cameraX = lerp(gs.cameraX, gs.targetCameraX, 0.06);

      // Screen shake during boost
      if (gs.isBoosting) {
        gs.shakeX = (Math.random() - 0.5) * 3;
        gs.shakeY = (Math.random() - 0.5) * 2;
      } else {
        gs.shakeX = lerp(gs.shakeX, 0, 0.2);
        gs.shakeY = lerp(gs.shakeY, 0, 0.2);
      }

      // Particles
      if (Math.abs(gs.carSpeed) > 1) {
        const groundY = h * GROUND_Y + CAR_HEIGHT + 32;
        const pCount = gs.isBoosting ? 3 : 1;
        for (let i = 0; i < pCount; i++) {
          gs.particles.push({
            x: gs.carX + (gs.carSpeed > 0 ? 10 : CAR_WIDTH - 10) + Math.random() * 10,
            y: groundY + Math.random() * 5,
            vx: -gs.carSpeed * 0.3 + (Math.random() - 0.5) * 2,
            vy: -(Math.random() * 3 + 1),
            life: 1,
            maxLife: 1,
            color: gs.isBoosting ? `hsl(${Math.random() * 40 + 10}, 100%, 60%)` : '#AAA',
            size: Math.random() * 4 + 2,
          });
        }
      }

      gs.particles = gs.particles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05;
        p.life -= 0.025;
        return p.life > 0;
      });

      // Speed lines
      if (Math.abs(gs.carSpeed) > 5) {
        gs.speedLines.push({
          x: Math.random() * w,
          y: Math.random() * h * GROUND_Y,
          length: Math.random() * 50 + 30,
          opacity: Math.random() * 0.3 + 0.1,
          speed: Math.abs(gs.carSpeed) * 2,
        });
      }
      gs.speedLines = gs.speedLines.filter(sl => {
        sl.x -= sl.speed;
        sl.opacity -= 0.02;
        return sl.opacity > 0 && sl.x > -sl.length;
      });

      // Milestone detection
      let nearestMilestone: Milestone | null = null;
      let nearestDist = Infinity;

      MILESTONES.forEach(ms => {
        const dist = Math.abs(gs.carX + CAR_WIDTH / 2 - ms.x);
        if (dist < MILESTONE_TRIGGER_DISTANCE && dist < nearestDist) {
          nearestDist = dist;
          nearestMilestone = ms;
        }
      });

      if (nearestMilestone) {
        const ms = nearestMilestone as Milestone;
        if (!gs.visitedMilestones.has(ms.id)) {
          gs.visitedMilestones.add(ms.id);
          gs.milestoneAnimations.set(ms.id, 0);
          setVisitedCount(gs.visitedMilestones.size);

          // Burst particles
          for (let i = 0; i < 30; i++) {
            const angle = (i / 30) * Math.PI * 2;
            gs.particles.push({
              x: ms.x,
              y: h * GROUND_Y - 40,
              vx: Math.cos(angle) * (Math.random() * 5 + 2),
              vy: Math.sin(angle) * (Math.random() * 5 + 2),
              life: 1.5,
              maxLife: 1.5,
              color: ms.color,
              size: Math.random() * 5 + 2,
            });
          }
        }

        if (gs.lastMilestoneId !== ms.id) {
          gs.lastMilestoneId = ms.id;
          gs.showCard = true;
          gs.cardTargetOpacity = 1;
          gs.activeMilestone = ms;
          setActiveCard(ms);
          setCardVisible(true);
        }
      } else {
        if (gs.showCard && Math.abs(gs.carSpeed) > 2) {
          gs.showCard = false;
          gs.cardTargetOpacity = 0;
          setTimeout(() => {
            if (!gs.showCard) {
              setCardVisible(false);
              setActiveCard(null);
              gs.lastMilestoneId = -1;
            }
          }, 300);
        }
      }

      // Milestone animations
      gs.milestoneAnimations.forEach((val, key) => {
        if (val < 1) {
          gs.milestoneAnimations.set(key, val + 0.02);
        }
      });

      gs.cardOpacity = lerp(gs.cardOpacity, gs.cardTargetOpacity, 0.1);

      const dayProgress = getDayNightProgress(gs.carX);
      setProgress(dayProgress);

      // ── Render ────────────────────────────────────
      ctx.save();
      ctx.translate(gs.shakeX, gs.shakeY);
      ctx.clearRect(-10, -10, w + 20, h + 20);

      drawSky(ctx, w, h, dayProgress);
      drawStars(ctx, gs.cameraX, gs.time, dayProgress);
      drawClouds(ctx, gs.cameraX, dayProgress);
      drawParallaxMountains(ctx, w, h, gs.cameraX, dayProgress);
      drawGround(ctx, w, h, gs.cameraX, dayProgress);
      drawMilestones(ctx, h, gs.cameraX, gs.time, dayProgress);
      drawParticles(ctx, gs.cameraX);
      drawSpeedLines(ctx, h);
      drawCar(ctx, h, gs, dayProgress);
      drawHUD(ctx, w, h, gs);

      ctx.restore();

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
      canvas.removeEventListener('click', onClick);
    };
  }, [initWorld, drawSky, drawStars, drawClouds, drawParallaxMountains, drawGround, drawMilestones, drawParticles, drawSpeedLines, drawCar, drawHUD]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black" style={{ cursor: 'default' }}>
      <canvas ref={canvasRef} className="block w-full h-full" />

      {/* Milestone Card Overlay */}
      {cardVisible && activeCard && (
        <div
          className={`absolute left-1/2 bottom-8 -translate-x-1/2 z-50 ${cardVisible ? 'card-enter' : 'card-exit'}`}
          style={{ maxWidth: '440px', width: '90%' }}
        >
          <div
            className="relative rounded-2xl overflow-hidden backdrop-blur-xl shadow-2xl border border-white/10"
            style={{
              background: `linear-gradient(135deg, rgba(0,0,0,0.85), rgba(0,0,0,0.7))`,
            }}
          >
            {/* Top color bar */}
            <div
              className="h-1.5"
              style={{ background: `linear-gradient(90deg, ${activeCard.color}, ${activeCard.color}88)` }}
            />

            <div className="p-5">
              {/* Header */}
              <div className="flex items-start gap-3 mb-3">
                <span className="text-3xl">{activeCard.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ background: activeCard.color, color: '#000' }}
                    >
                      {activeCard.year}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-1 leading-tight">{activeCard.title}</h3>
                </div>
                <button
                  onClick={() => {
                    const gs = gameStateRef.current;
                    gs.showCard = false;
                    gs.cardTargetOpacity = 0;
                    gs.activeMilestone = null;
                    gs.lastMilestoneId = -1;
                    setCardVisible(false);
                    setActiveCard(null);
                  }}
                  className="text-white/40 hover:text-white transition-colors text-xl leading-none mt-0.5"
                >
                  ×
                </button>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-300 leading-relaxed mb-4">{activeCard.description}</p>

              {/* Tech tags */}
              <div className="flex flex-wrap gap-1.5">
                {activeCard.tech.map((t) => (
                  <span
                    key={t}
                    className="text-xs px-2.5 py-1 rounded-full font-medium"
                    style={{
                      background: `${activeCard.color}20`,
                      color: activeCard.color,
                      border: `1px solid ${activeCard.color}40`,
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Hint */}
            <div className="px-5 pb-3">
              <p className="text-[10px] text-gray-500 text-center">Press Space to dismiss · Keep driving to explore →</p>
            </div>
          </div>
        </div>
      )}

      {/* Intro Overlay */}
      {showIntro && (
        <div className="absolute inset-0 z-40 pointer-events-none" />
      )}

      {/* Side indicators */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-30">
        {MILESTONES.map((ms) => (
          <div
            key={ms.id}
            className="flex items-center gap-2 transition-all duration-300"
            style={{ opacity: visitedCount > ms.id ? 1 : 0.3 }}
          >
            <div
              className="w-2.5 h-2.5 rounded-full transition-all duration-500"
              style={{
                background: visitedCount > ms.id ? ms.color : '#555',
                boxShadow: visitedCount > ms.id ? `0 0 8px ${ms.color}` : 'none',
              }}
            />
            <span
              className="text-[10px] font-mono transition-colors duration-300 hidden sm:inline"
              style={{ color: visitedCount > ms.id ? ms.color : '#666' }}
            >
              {ms.year}
            </span>
          </div>
        ))}
      </div>

      {/* Mobile controls hint */}
      <div className="absolute bottom-4 left-4 sm:hidden z-30">
        <p className="text-[10px] text-white/30 font-mono">Swipe to drive</p>
      </div>

      {/* Boost flame effect overlay */}
      {isBoosting && (
        <div
          className="absolute inset-0 pointer-events-none z-20"
          style={{
            background: 'radial-gradient(ellipse at 35% 72%, rgba(255,100,0,0.08) 0%, transparent 50%)',
          }}
        />
      )}
    </div>
  );
}