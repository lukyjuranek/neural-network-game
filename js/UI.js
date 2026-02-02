
function plotLoss(lossArray = [0], x, y, w = 300, h = 150) {
  push();
  translate(x, y);
  stroke(0);
  strokeWeight(2);
  noFill();
  rect(0, 0, w, h); // draw plot background

  // find min and max for scaling
  const minLoss = Math.min(...lossArray);
  const maxLoss = Math.max(...lossArray);

  // --- Calculate 30-moving average ---
  const windowSize = 30;
  let movingAvg = [];
  for (let i = 0; i < lossArray.length; i++) {
    let startIdx = Math.max(0, i - windowSize + 1);
    let window = lossArray.slice(startIdx, i + 1);
    let avg = window.reduce((a, b) => a + b, 0) / window.length;
    movingAvg.push(avg);
  }

  // Average of the last 30 losses for display
  const last30Losses = lossArray.slice(-windowSize);
  const smoothedLoss = last30Losses.reduce((a, b) => a + b, 0) / last30Losses.length;
  textSize(12);
  fill(0);
  strokeWeight(0);
  text(`Loss: ${lossArray[lossArray.length - 1]?.toFixed(2)}`, 10, h - 24);
  fill(0, 0, 200);
  text(`Loss (moving average): ${smoothedLoss.toFixed(2)}`, 10, h - 10);

  // --- Plot actual loss in light gray ---
  stroke(200); // light gray
  strokeWeight(1);
  noFill();
  beginShape();
  for (let i = 0; i < lossArray.length; i++) {
    let yPos = map(lossArray[i], minLoss, maxLoss, h, 0);
    let xPos = map(i, 0, lossArray.length - 1, 0, w);
    vertex(xPos, yPos);
  }
  endShape();

  // --- Plot moving average in blue ---
  stroke(0, 0, 200); // blue
  noFill();
  beginShape();
  for (let i = 0; i < movingAvg.length; i++) {
    let yPos = map(movingAvg[i], minLoss, maxLoss, h, 0);
    let xPos = map(i, 0, lossArray.length - 1, 0, w);
    vertex(xPos, yPos);
  }
  endShape();

  pop();
}


function drawClassBalance(x, y) {
  const nLeft = replayBuffer.filter(r => r.outputs.indexOf(1) === 0).length;
  const nRight = replayBuffer.filter(r => r.outputs.indexOf(1) === 1).length;
  const nStraight = replayBuffer.filter(r => r.outputs.indexOf(1) === 2).length;
  // Draw a "Class Balance" bar visualization
  const totalSamples = nLeft + nRight + nStraight;
  const barX = x;
  const barY = y;
  const barW = 220;
  const barH = 18;
  const pad = 2;
  // Calculate proportions
  const leftRatio = totalSamples > 0 ? nLeft / totalSamples : 0;
  const rightRatio = totalSamples > 0 ? nRight / totalSamples : 0;
  const straightRatio = totalSamples > 0 ? nStraight / totalSamples : 0;
  // Draw bar
  push();
  textAlign(LEFT, BOTTOM);
  fill(0);
  text("Collected Data Class Balance:", barX, barY - 18);
  // Bar background
  fill(230);
  rect(barX, barY, barW, barH, 4);
  // Left - blue
  fill(90, 155, 255);
  rect(barX, barY, barW * leftRatio, barH, leftRatio > 0 ? 4 : 0, 0, 0, leftRatio > 0 ? 4 : 0);
  // Right - orange
  fill(255, 180, 80);
  rect(barX + barW * leftRatio, barY, barW * rightRatio, barH, 0, 0, 0, 0);
  // Straight - gray
  fill(180);
  rect(barX + barW * (leftRatio + rightRatio), barY, barW * straightRatio, barH, 0, 4, 4, 0);

  // Draw counts overlayed on bars
  fill(0);
  textSize(11);
  let lTxt = `L (${nLeft})`;
  let rTxt = `R (${nRight})`;
  let sTxt = `S (${nStraight})`;

  // Only show ratio if there are samples
  let lRatioTxt = totalSamples ? ` ${(leftRatio * 100).toFixed(0)}%` : "";
  let rRatioTxt = totalSamples ? ` ${(rightRatio * 100).toFixed(0)}%` : "";
  let sRatioTxt = totalSamples ? ` ${(straightRatio * 100).toFixed(0)}%` : "";

  // Position text nicely above each section
  textAlign(CENTER, BOTTOM);

  // Left
  let lCenter = barX + barW * leftRatio / 2;
  if (nLeft > 0) {
    text(lTxt + lRatioTxt, lCenter, barY - 2);
  }
  // Right
  let rCenter = barX + barW * leftRatio + barW * rightRatio / 2;
  if (nRight > 0) {
    text(rTxt + rRatioTxt, rCenter, barY - 2);
  }
  // Straight
  let sCenter = barX + barW * (leftRatio + rightRatio) + barW * straightRatio / 2;
  if (nStraight > 0) {
    text(sTxt + sRatioTxt, sCenter, barY - 2);
  }

  // Write total number
  textAlign(LEFT, TOP);
  text(`Total: ${totalSamples}`, barX, barY + barH + 3);

  pop();
}


function draw_UI(x, y) {
  fill(0);
  textSize(12);

  // const hiddenActs = getAllActivations(car.inputs());
  // drawActivations(hiddenActs, x+100, y + 300, 300, 100);
  if (typeof car !== 'undefined' && car.inputs) {
    drawNetwork(740, 350, 300, 400, car.inputs());
  }

  text(`Input: ${car.inputs().map(x => x.toFixed(2)).join(', ')}`, x, y + 80);
  text(`Output: ${car.outputs()}`, x, y + 100);

  // On the green isladn. Left arrow/a - move left. Right arrow/d - move right. Up arrow/w - start moving
  push();
  translate(240, 250);
  fill(255);
  text(`W / Arrow UP - start moving`, 0, 0);
  text(`A / Arrow LEFT - steer left`, 0, 20);
  text(`D / Arrow RIGHT - steer right`, 0, 40);
  text(`SPACE - toggle mode`, 0, 60);
  text(`R - reset car`, 0, 80);
  text(`F - flip car`, 0, 100);
  pop();


  drawClassBalance(x, y);
  plotLoss(UI.lossHistory, x, y+110, 300, 150);


  // Training / learning text
  textSize(24);
  text(NN_MODE == "TRAIN" ? "Training Mode" : "Predicting Mode", 470, 520);
  textSize(12);
  text(NN_MODE == "TRAIN" ? "Drive to train the model" : "Let the model drive", 470, 540);

  textSize(14);
  text(`Car Speed: ${CAR_SPEED}`, 470,700);

}