"use client";

import React, { useEffect, useRef } from "react";

export default function AvatarScene() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = 0;
    let height = 0;

    let targetMouseX = 0;
    let targetMouseY = 0;
    let mouseX = 0;
    let mouseY = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      width = canvas.width = parent ? parent.clientWidth : window.innerWidth;
      height = canvas.height = parent ? parent.clientHeight : 480;
    };
    resize();
    window.addEventListener("resize", resize);

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      targetMouseX = ((e.clientX - rect.left) / width - 0.5) * 120;
      targetMouseY = ((e.clientY - rect.top) / height - 0.5) * 120;
    };
    window.addEventListener("mousemove", onMouseMove);

    const STAR_COUNT = 750;
    const SPEED = 2.5; // Normal gentle travel speed (Pehle 16 thi)
    const DEPTH = 1200;

    const starPalette = [
      { r: 255, g: 255, b: 255 }, // White
      { r: 170, g: 220, b: 255 }, // Soft Cyan
      { r: 130, g: 180, b: 255 }, // Electric Blue
      { r: 215, g: 180, b: 255 }, // Lavender Violet
    ];

    interface Star {
      x: number;
      y: number;
      z: number;
      pz: number;
      color: { r: number; g: number; b: number };
      size: number;
    }

    const stars: Star[] = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: (Math.random() - 0.5) * width * 2.5,
        y: (Math.random() - 0.5) * height * 2.5,
        z: Math.random() * DEPTH,
        pz: DEPTH,
        color: starPalette[Math.floor(Math.random() * starPalette.length)],
        size: Math.random() * 1.5 + 0.8,
      });
    }

    let nebulaAngle = 0;

    const animate = () => {
      mouseX += (targetMouseX - mouseX) * 0.04;
      mouseY += (targetMouseY - mouseY) * 0.04;

      ctx.fillStyle = "rgba(4, 5, 12, 0.4)";
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2 + mouseX;
      const cy = height / 2 + mouseY;

      nebulaAngle += 0.001;
      const grad = ctx.createRadialGradient(
        cx + Math.cos(nebulaAngle) * 40,
        cy + Math.sin(nebulaAngle) * 30,
        20,
        cx,
        cy,
        Math.max(width, height) * 0.6
      );
      grad.addColorStop(0, "rgba(60, 30, 110, 0.15)");
      grad.addColorStop(0.5, "rgba(20, 50, 95, 0.1)");
      grad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < STAR_COUNT; i++) {
        const s = stars[i];
        s.pz = s.z;
        s.z -= SPEED;

        if (s.z <= 0) {
          s.z = DEPTH;
          s.pz = DEPTH;
          s.x = (Math.random() - 0.5) * width * 2.5;
          s.y = (Math.random() - 0.5) * height * 2.5;
        }

        const k = 280 / s.z;
        const px = s.x * k + cx;
        const py = s.y * k + cy;

        const pk = 280 / s.pz;
        const pxOld = s.x * pk + cx;
        const pyOld = s.y * pk + cy;

        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          const depthRatio = 1 - s.z / DEPTH;
          const alpha = Math.min(1, Math.max(0.15, depthRatio * 1.2));
          const currentSize = s.size * depthRatio * 1.8;

          // Subtle streak trail
          ctx.beginPath();
          ctx.moveTo(pxOld, pyOld);
          ctx.lineTo(px, py);
          ctx.strokeStyle = `rgba(${s.color.r}, ${s.color.g}, ${s.color.b}, ${alpha * 0.6})`;
          ctx.lineWidth = Math.max(0.5, currentSize * 0.8);
          ctx.stroke();

          // Star body
          ctx.beginPath();
          ctx.arc(px, py, Math.max(0.8, currentSize), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${s.color.r}, ${s.color.g}, ${s.color.b}, ${alpha})`;
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <div className="relative w-full h-[460px] overflow-hidden rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] bg-[#030308] flex items-center justify-center">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#030308] via-transparent to-[#030308]/60 pointer-events-none" />
    </div>
  );
}

export { AvatarScene };