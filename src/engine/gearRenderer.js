/**
 * Physical 2D Gear & Ring Visualizer
 * Draws realistic translucent plastic Spirograph gears with interlocking teeth and pen holes.
 */

export class GearRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.visible = true;
  }

  resize(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Draw physical gears
   * @param {Object} state - Current gear parameters & position
   * @param {number} scale - Canvas zoom scale factor
   */
  drawGears(state, scale = 1.0) {
    if (!this.visible) {
      this.clear();
      return;
    }

    const { R, r, dRatio, mode, wheelX, wheelY, wheelAngle, penX, penY } = state;
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    ctx.save();
    this.clear();
    ctx.translate(centerX, centerY);
    ctx.scale(scale, scale);

    // 1. Draw Outer/Fixed Ring (Stator)
    this.drawStatorRing(ctx, R, mode);

    // 2. Draw Moving Wheel (Rotor)
    this.drawRotorWheel(ctx, r, dRatio, wheelX, wheelY, wheelAngle, mode);

    // 3. Draw Pen Indicator / Alignment line
    this.drawPenIndicator(ctx, wheelX, wheelY, penX, penY);

    ctx.restore();
  }

  /**
   * Draw Stator Ring (Fixed Gear)
   */
  drawStatorRing(ctx, R, mode) {
    const toothCount = Math.round(R);
    const toothHeight = 6;
    const rimWidth = 18;

    ctx.save();

    // Outer acrylic body gradient
    const outerRadius = mode === 'hypo' ? R + rimWidth : R + toothHeight + rimWidth;
    const innerRadius = mode === 'hypo' ? R - toothHeight : R - rimWidth;

    ctx.beginPath();
    ctx.arc(0, 0, outerRadius, 0, Math.PI * 2);
    ctx.arc(0, 0, innerRadius, 0, Math.PI * 2, true);
    
    // Transparent blue acrylic plastic look
    ctx.fillStyle = 'rgba(58, 134, 255, 0.12)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(58, 134, 255, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Gear teeth on the ring boundary
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(58, 134, 255, 0.6)';
    ctx.lineWidth = 1.2;

    for (let i = 0; i < toothCount; i++) {
      const angle = (i / toothCount) * Math.PI * 2;
      const angleNext = ((i + 0.5) / toothCount) * Math.PI * 2;

      let rIn = R;
      let rOut = mode === 'hypo' ? R + toothHeight : R - toothHeight;

      const x1 = rIn * Math.cos(angle);
      const y1 = rIn * Math.sin(angle);
      const x2 = rOut * Math.cos(angleNext);
      const y2 = rOut * Math.sin(angleNext);

      if (i === 0) ctx.moveTo(x1, y1);
      else ctx.lineTo(x1, y1);
      ctx.lineTo(x2, y2);
    }
    ctx.closePath();
    ctx.stroke();

    // Stator tick marks
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.font = '9px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const labelRadius = mode === 'hypo' ? R + 10 : R - 12;
    for (let i = 0; i < toothCount; i += 15) {
      const angle = (i / toothCount) * Math.PI * 2;
      const lx = labelRadius * Math.cos(angle);
      const ly = labelRadius * Math.sin(angle);
      ctx.fillText(`${i}`, lx, ly);
    }

    ctx.restore();
  }

  /**
   * Draw Moving Rotor Wheel Gear
   */
  drawRotorWheel(ctx, r, dRatio, wheelX, wheelY, wheelAngle, mode) {
    const toothCount = Math.round(r);
    const toothHeight = 6;

    ctx.save();
    ctx.translate(wheelX, wheelY);
    ctx.rotate(wheelAngle);

    // Rotor wheel body (Transparent Pink / Magenta Acrylic look)
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 0, 110, 0.18)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 0, 110, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Teeth
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 0, 110, 0.8)';
    ctx.lineWidth = 1.2;

    for (let i = 0; i < toothCount; i++) {
      const angle = (i / toothCount) * Math.PI * 2;
      const angleNext = ((i + 0.5) / toothCount) * Math.PI * 2;

      const rBase = r;
      const rTip = r + toothHeight;

      const x1 = rBase * Math.cos(angle);
      const y1 = rBase * Math.sin(angle);
      const x2 = rTip * Math.cos(angleNext);
      const y2 = rTip * Math.sin(angleNext);

      if (i === 0) ctx.moveTo(x1, y1);
      else ctx.lineTo(x1, y1);
      ctx.lineTo(x2, y2);
    }
    ctx.closePath();
    ctx.stroke();

    // Center Crosshair / Hub
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fill();

    // Pen Holes along wheel radius
    const totalHoles = 10;
    const holeRadius = 2.5;

    for (let h = 1; h <= totalHoles; h++) {
      const hRatio = h / (totalHoles + 1);
      const hDist = r * hRatio;

      ctx.beginPath();
      ctx.arc(hDist, 0, holeRadius, 0, Math.PI * 2);

      if (Math.abs(hRatio - dRatio) < 0.05) {
        // Active selected hole
        ctx.fillStyle = '#00f5d4';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      } else {
        // Inactive hole
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  /**
   * Draw Pen Tip Marker & Joint Line
   */
  drawPenIndicator(ctx, wheelX, wheelY, penX, penY) {
    ctx.save();

    // Dotted line from wheel center to pen position
    ctx.beginPath();
    ctx.moveTo(wheelX, wheelY);
    ctx.lineTo(penX, penY);
    ctx.strokeStyle = 'rgba(0, 245, 212, 0.7)';
    ctx.setLineDash([2, 4]);
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Pen point tip glow
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.arc(penX, penY, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#00f5d4';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();
  }
}
