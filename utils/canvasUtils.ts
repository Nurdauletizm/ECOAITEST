import { DetectedObject } from '@tensorflow-models/coco-ssd';

export const drawPredictions = (
  predictions: DetectedObject[],
  ctx: CanvasRenderingContext2D
) => {
  // Clear previous drawings
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // Set default styles
  const font = "16px sans-serif";
  ctx.font = font;
  ctx.textBaseline = "top";

  predictions.forEach((prediction) => {
    // Filter confidence < 60%
    if (prediction.score < 0.6) return;

    const [x, y, width, height] = prediction.bbox;
    const isPerson = prediction.class === 'person';

    // Choose colors based on class
    const strokeColor = isPerson ? '#00FF00' : '#00FFFF'; // Green for person, Cyan for others
    const backgroundColor = isPerson ? 'rgba(0, 255, 0, 0.2)' : 'rgba(0, 255, 255, 0.2)';
    
    // Draw Bounding Box
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);

    // Draw Fill
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(x, y, width, height);

    // Draw Label Background
    const textString = `${prediction.class} ${Math.round(prediction.score * 100)}%`;
    const textWidth = ctx.measureText(textString).width;
    const textHeight = parseInt(font, 10);
    
    ctx.fillStyle = strokeColor;
    ctx.fillRect(x, y, textWidth + 8, textHeight + 8);

    // Draw Text
    ctx.fillStyle = '#000000';
    ctx.fillText(textString, x + 4, y + 4);
  });
};