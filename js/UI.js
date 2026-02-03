// Panel styling constants
const PANEL_PADDING = 12;
const PANEL_RADIUS = 8;
const PANEL_FILL = [248, 248, 252];
const PANEL_STROKE = [220, 220, 230];
const ACCENT_BLUE = [50, 120, 220];

const DATA_COL_W = 240;
const CTRL_W = 260;
const CTRL_H = 200;
const GAP = 20;
const NN_W = 260;

function drawPanel(x, y, w, h) {
  fill(PANEL_FILL[0], PANEL_FILL[1], PANEL_FILL[2], 230);
  stroke(PANEL_STROKE[0], PANEL_STROKE[1], PANEL_STROKE[2]);
  strokeWeight(1);
  rect(x, y, w, h, PANEL_RADIUS);
  noStroke();
}

function plotLoss(lossArray = [], x, y, w = 300, h = 150) {
  push();
  translate(x, y);

  drawPanel(0, 0, w, h);

  const hasData = lossArray.length > 0;
  const lastLoss = lossArray[lossArray.length - 1];
  const validLast = hasData && typeof lastLoss === 'number' && !isNaN(lastLoss);

  const windowSize = 30;
  let movingAvg = [];
  let smoothedLoss = NaN;
  let minLoss = 0;
  let maxLoss = 1;

  if (hasData) {
    for (let i = 0; i < lossArray.length; i++) {
      let startIdx = Math.max(0, i - windowSize + 1);
      let window = lossArray.slice(startIdx, i + 1);
      let avg = window.reduce((a, b) => a + b, 0) / window.length;
      movingAvg.push(avg);
    }
    const last30Losses = lossArray.slice(-windowSize);
    smoothedLoss = last30Losses.reduce((a, b) => a + b, 0) / last30Losses.length;
    minLoss = Math.min(...lossArray);
    maxLoss = Math.max(...lossArray);
    if (maxLoss === minLoss) maxLoss = minLoss + 0.01;
  }

  textSize(12);
  fill(40);
  strokeWeight(0);
  // text(`Loss: ${validLast ? lastLoss.toFixed(2) : '—'}`, PANEL_PADDING, 22);
  fill(ACCENT_BLUE[0], ACCENT_BLUE[1], ACCENT_BLUE[2]);
  text(`Loss (moving average): ${!isNaN(smoothedLoss) ? smoothedLoss.toFixed(2) : '—'}`, PANEL_PADDING, 22);

  if (hasData && lossArray.length >= 2) {
    const pad = PANEL_PADDING;
    const plotX = pad;
    const plotY = 44;
    const plotW = w - pad * 2;
    const plotH = h - 58;
    // Grid lines at 25%, 50%, 75% within plot area
    stroke(230);
    strokeWeight(1);
    for (let p of [0.25, 0.5, 0.75]) {
      const gy = plotY + plotH * (1 - p);
      line(plotX, gy, plotX + plotW, gy);
    }
    for (let p of [0.33, 0.66]) {
      line(plotX + plotW * p, plotY, plotX + plotW * p, plotY + plotH);
    }
    noStroke();

    // Fill under moving average curve
    fill(ACCENT_BLUE[0], ACCENT_BLUE[1], ACCENT_BLUE[2], 35);
    noStroke();
    beginShape();
    vertex(plotX, plotY + plotH);
    for (let i = 0; i < movingAvg.length; i++) {
      let yPos = plotY + map(movingAvg[i], minLoss, maxLoss, plotH, 0);
      let xPos = plotX + map(i, 0, lossArray.length - 1, 0, plotW);
      vertex(xPos, yPos);
    }
    vertex(plotX + plotW, plotY + plotH);
    endShape(CLOSE);

    // Raw loss in light gray
    stroke(180);
    strokeWeight(1);
    noFill();
    beginShape();
    for (let i = 0; i < lossArray.length; i++) {
      let yPos = plotY + map(lossArray[i], minLoss, maxLoss, plotH, 0);
      let xPos = plotX + map(i, 0, lossArray.length - 1, 0, plotW);
      vertex(xPos, yPos);
    }
    endShape();

    // Moving average in blue
    stroke(ACCENT_BLUE[0], ACCENT_BLUE[1], ACCENT_BLUE[2]);
    strokeWeight(2);
    noFill();
    beginShape();
    for (let i = 0; i < movingAvg.length; i++) {
      let yPos = plotY + map(movingAvg[i], minLoss, maxLoss, plotH, 0);
      let xPos = plotX + map(i, 0, lossArray.length - 1, 0, plotW);
      vertex(xPos, yPos);
    }
    endShape();
  }

  pop();
}


function drawClassBalance(x, y) {
  const nLeft = replayBuffer.filter(r => r.outputs.indexOf(1) === 0).length;
  const nRight = replayBuffer.filter(r => r.outputs.indexOf(1) === 1).length;
  const nStraight = replayBuffer.filter(r => r.outputs.indexOf(1) === 2).length;
  const totalSamples = nLeft + nRight + nStraight;
  const barX = x;
  const barY = y;
  const barW = 220;
  const barH = 18;
  const leftRatio = totalSamples > 0 ? nLeft / totalSamples : 0;
  const rightRatio = totalSamples > 0 ? nRight / totalSamples : 0;
  const straightRatio = totalSamples > 0 ? nStraight / totalSamples : 0;

  push();
  textAlign(LEFT, BOTTOM);
  fill(40);
  textSize(12);
  text("Collected Data Class Balance:", barX, barY - 18);
  fill(235);
  noStroke();
  rect(barX, barY, barW, barH, 4);
  fill(90, 155, 255);
  rect(barX, barY, barW * leftRatio, barH, leftRatio > 0 ? 4 : 0, 0, 0, leftRatio > 0 ? 4 : 0);
  fill(255, 180, 80);
  rect(barX + barW * leftRatio, barY, barW * rightRatio, barH, 0, 0, 0, 0);
  fill(160, 160, 170);
  rect(barX + barW * (leftRatio + rightRatio), barY, barW * straightRatio, barH, 0, 4, 4, 0);

  fill(40);
  textSize(11);
  let lTxt = `L (${nLeft})`;
  let rTxt = `R (${nRight})`;
  let sTxt = `S (${nStraight})`;
  let lRatioTxt = totalSamples ? ` ${(leftRatio * 100).toFixed(0)}%` : "";
  let rRatioTxt = totalSamples ? ` ${(rightRatio * 100).toFixed(0)}%` : "";
  let sRatioTxt = totalSamples ? ` ${(straightRatio * 100).toFixed(0)}%` : "";
  textAlign(CENTER, BOTTOM);
  let lCenter = barX + barW * leftRatio / 2;
  if (nLeft > 0) text(lTxt + lRatioTxt, lCenter, barY - 2);
  let rCenter = barX + barW * leftRatio + barW * rightRatio / 2;
  if (nRight > 0) text(rTxt + rRatioTxt, rCenter, barY - 2);
  let sCenter = barX + barW * (leftRatio + rightRatio) + barW * straightRatio / 2;
  if (nStraight > 0) text(sTxt + sRatioTxt, sCenter, barY - 2);
  textAlign(LEFT, TOP);
  text(`Total: ${totalSamples}`, barX, barY + barH + 3);
  pop();
}


function draw_UI(x, y) {
  // Mode + buttons panel
  drawPanel(x, y, DATA_COL_W, 200);
  textSize(18);
  fill(0);
  textAlign(LEFT, TOP);
  text(NN_MODE == "TRAIN" ? "Mode: Training" : "Mode: Predicting", x + PANEL_PADDING, y + PANEL_PADDING);
  textSize(11);
  fill(80);
  text(NN_MODE == "TRAIN" ? "Drive to train" : "Model drives", x + PANEL_PADDING, y + PANEL_PADDING + 22);
  fill(40);
  textSize(12);
  textAlign(LEFT, CENTER);
  text(`Car Speed: ${CAR_SPEED}`, x + PANEL_PADDING, y + 152 + 14);
  textAlign(LEFT, TOP);

  // Controls panel (right of buttons)
  const ctrlX = x + DATA_COL_W + GAP;
  push();
  translate(ctrlX, y);
  drawPanel(0, 0, CTRL_W, CTRL_H);
  fill(40);
  textSize(14);
  textAlign(LEFT, TOP);
  text('Controls', PANEL_PADDING, PANEL_PADDING);
  textSize(12);
  fill(60);
  text('W / Arrow UP — start moving', PANEL_PADDING, PANEL_PADDING + 26);
  text('A / Arrow LEFT — steer left', PANEL_PADDING, PANEL_PADDING + 44);
  text('D / Arrow RIGHT — steer right', PANEL_PADDING, PANEL_PADDING + 62);
  text('SPACE — toggle mode', PANEL_PADDING, PANEL_PADDING + 80);
  text('R — reset car', PANEL_PADDING, PANEL_PADDING + 98);
  text('F — flip car', PANEL_PADDING, PANEL_PADDING + 116);
  pop();

  // Loss right below Controls
  const lossY = y + CTRL_H + GAP;
  plotLoss(UI.lossHistory, ctrlX, lossY, CTRL_W, 150);

  // Class balance below Buttons (same row as loss), in a panel
  const classBalanceH = 90;
  drawPanel(x, lossY, DATA_COL_W, classBalanceH);
  drawClassBalance(x + PANEL_PADDING, lossY+45);

  // NN below class balance and loss row (loss height 150)
  const nnY = lossY + 100 + GAP;
  if (typeof car !== 'undefined' && car.inputs) {
    drawNetwork(x, nnY, NN_W, 340, car.inputs());
  }

  // Input/Output below NN
  fill(40);
  textSize(11);
  text(`Input: ${car.inputs().map(inp => inp.toFixed(2)).join(', ')}`, x, nnY + 400 + 20);
  text(`Output: ${car.outputs()}`, x, nnY + 400 + 36);
}
