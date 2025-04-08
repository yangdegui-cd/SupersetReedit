function rgbaToCssColor(rgba: { r: number; g: number; b: number; a?: number }): string {
  // Extract alpha if it exists, otherwise default to 1 (fully opaque)
  let alpha = rgba.a !== undefined ? rgba.a : 1;

  // Ensure alpha is within the 0-1 range
  if (alpha < 0) alpha = 0;
  if (alpha > 1) alpha = 1;

  // Return the CSS RGBA color string
  return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${alpha})`;
}


export default function lerpColor(baseColor: {
  r: number;
  g: number;
  b: number;
  a?: number
} = PRIMARY_COLOR, percentage: number): string {
  const whiteRGB = {r: 255, g: 255, b: 255};
  if (percentage > 100 && percentage !== Infinity) {
    return rgbaToCssColor(baseColor);
  }

  if (percentage < 0) {
    return rgbaToCssColor(whiteRGB);
  }

  // 计算新的 RGB 值
  const newColorRGB = {
    r: Math.round(whiteRGB.r + (baseColor.r - whiteRGB.r) * (percentage / 100)),
    g: Math.round(whiteRGB.g + (baseColor.g - whiteRGB.g) * (percentage / 100)),
    b: Math.round(whiteRGB.b + (baseColor.b - whiteRGB.b) * (percentage / 100)),
    a: baseColor.a ?? 1 // Alpha 值不参与插值计算，直接使用原始值
  };


  return rgbaToCssColor(newColorRGB);
}

export const PRIMARY_COLOR = {r: 0, g: 122, b: 135, a: 1};
