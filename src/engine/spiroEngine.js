/**
 * Mathematical Engine for Spirograph Parametric Curves
 * (Hypotrochoids and Epitrochoids)
 */

export function gcd(a, b) {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

export function lcm(a, b) {
  return (a * b) / gcd(a, b);
}

/**
 * Calculates symmetry petal count and required full revolutions to complete the loop
 */
export function calculateSpirographStats(R, r) {
  const common = gcd(R, r);
  const revs = r / common; // Number of full revolutions around stator ring
  const petals = R / common; // Number of symmetry lobes / petals
  return {
    gcd: common,
    revolutions: revs,
    petals: petals,
    maxTheta: revs * 2 * Math.PI
  };
}

/**
 * Compute single point on the spirograph at parameter angle theta (in radians)
 * @param {number} theta - Angle around the fixed ring (radians)
 * @param {number} R - Fixed ring radius (teeth or px ratio)
 * @param {number} r - Moving wheel radius (teeth or px ratio)
 * @param {number} d - Distance from wheel center to pen hole (px ratio)
 * @param {string} mode - 'hypo' (inside ring) or 'epi' (outside ring)
 */
export function getSpirographPoint(theta, R, r, d, mode = 'hypo') {
  let x, y, wheelX, wheelY, wheelAngle;

  if (mode === 'hypo') {
    // Wheel inside ring
    const diff = R - r;
    const ratio = diff / r;
    
    wheelX = diff * Math.cos(theta);
    wheelY = diff * Math.sin(theta);
    
    // Pen position
    x = diff * Math.cos(theta) + d * Math.cos(ratio * theta);
    y = diff * Math.sin(theta) - d * Math.sin(ratio * theta);
    
    // Rotation of wheel around its own center
    wheelAngle = -ratio * theta;
  } else {
    // Epitrochoid: Wheel outside ring
    const sum = R + r;
    const ratio = sum / r;
    
    wheelX = sum * Math.cos(theta);
    wheelY = sum * Math.sin(theta);
    
    // Pen position
    x = sum * Math.cos(theta) - d * Math.cos(ratio * theta);
    y = sum * Math.sin(theta) - d * Math.sin(ratio * theta);
    
    // Rotation of wheel around its own center
    wheelAngle = (ratio - 1) * theta;
  }

  return { x, y, wheelX, wheelY, wheelAngle };
}

/**
 * Pre-generates all points for a complete spirograph loop
 */
export function generateSpirographPath(R, r, dRatio, mode = 'hypo', stepResolution = 0.015) {
  const d = r * dRatio;
  const stats = calculateSpirographStats(R, r);
  const maxTheta = stats.maxTheta;
  const points = [];

  for (let theta = 0; theta <= maxTheta + stepResolution; theta += stepResolution) {
    const pt = getSpirographPoint(theta, R, r, d, mode);
    points.push({
      theta: Math.min(theta, maxTheta),
      x: pt.x,
      y: pt.y,
      wheelX: pt.wheelX,
      wheelY: pt.wheelY,
      wheelAngle: pt.wheelAngle
    });
  }

  return {
    points,
    stats,
    maxTheta
  };
}
