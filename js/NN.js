
let NN = {
  model: null,
  response: null,
  reset: function () {
    this.model.dispose();
    this.createModel();
  },
  createModel: function () {
    this.model = tf.sequential();

    this.model.add(tf.layers.dense({
      inputShape: [7],
      units: 32,
      activation: 'relu',
      // useBias: false,              
      kernelInitializer: 'heNormal'
    }));

    this.model.add(tf.layers.dense({
      units: 32,
      // useBias: false,              
      activation: 'relu',
      kernelInitializer: 'heNormal'
    }));

    this.model.add(tf.layers.dense({
      units: 3,
      activation: 'softmax'
    }));

    this.model.compile({
      optimizer: tf.train.adam(1e-3),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });
  }
}

function getAllActivations(inputArray) {
  const inputTensor = tf.tensor([inputArray]);
  let current = inputTensor;
  const allActivations = [];

  // First "layer" is the raw input (7 values)
  allActivations.push([...inputArray]);

  for (const layer of NN.model.layers) {
    current = layer.apply(current);
    allActivations.push(Array.from(current.dataSync()));
  }

  inputTensor.dispose();
  return allActivations;  // [[7 inputs], [14 hidden], [3 outputs]]
}

function getLayerSizes() {
  const sizes = [];
  const layers = NN.model.layers;
  // Input size from first layer's inputShape
  sizes.push(layers[0].inputShape[layers[0].inputShape.length - 1]);  // 7
  for (const layer of layers) {
    sizes.push(layer.units);  // 32, 32, 3
  }
  return sizes;  // [7, 32, 32, 3]
}

function getNodeY(layerIdx, nodeIdx, layerSizes, nodeSpacing, h) {
  const n = layerSizes[layerIdx];
  const totalHeight = (n + 1) * nodeSpacing;
  const startY = (h - totalHeight) / 2 + nodeSpacing;
  return startY + nodeIdx * nodeSpacing;
}

function getWeightsAndBiases() {
  const result = [];  // no weights into input layer
  for (const layer of NN.model.layers) {
    const weights = layer.getWeights();  // [kernel, bias]
    if (weights.length === 0) continue;
    const kernel = weights[0];   // shape [inputDim, units]
    const bias = weights[1];     // shape [units]
    result.push({
      weights: Array.from(kernel.dataSync()),
      weightsShape: kernel.shape,  // [7, 14] or [14, 3]
      bias: Array.from(bias.dataSync())
    });
  }
  return result;
}

function getNetworkDrawData(inputArray) {
  const activations = getAllActivations(inputArray);
  const layerSizes = activations.map(a => a.length);   // [7, 14, 3]
  const weightsAndBiases = getWeightsAndBiases();
  return { activations, layerSizes, weightsAndBiases };
}

// const { activations, layerSizes, weightsAndBiases } = getNetworkDrawData(car.inputs());

function drawNetwork(x, y, w, h, inputArray) {
  if (!inputArray || !NN.model) return;
  const { activations, layerSizes, weightsAndBiases } = getNetworkDrawData(inputArray);

  const numLayers = layerSizes.length;
  const layerSpacing = w / (numLayers - 1);
  const maxNodes = Math.max(...layerSizes);
  const nodeSpacing = h / (maxNodes + 1);
  const pad = 24;
  const panelX = x - pad;
  const panelY = y - pad;
  const panelW = w + pad * 2;
  const panelH = h + pad * 2;

  push();
  translate(panelX, panelY);
  // Background only, no border
  fill(248, 248, 252, 230);
  noStroke();
  translate(pad, pad);

  // ---- draw connections (behind nodes), color by sign ----
  for (let layerIdx = 0; layerIdx < numLayers - 1; layerIdx++) {
    const nFrom = layerSizes[layerIdx];
    const nTo = layerSizes[layerIdx + 1];
    const xFrom = layerIdx * layerSpacing;
    const xTo = (layerIdx + 1) * layerSpacing;
    const weights = weightsAndBiases[layerIdx].weights;
    const [rows, cols] = weightsAndBiases[layerIdx].weightsShape;

    for (let i = 0; i < nFrom; i++) {
      const yFrom = getNodeY(layerIdx, i, layerSizes, nodeSpacing, h);
      for (let j = 0; j < nTo; j++) {
        const yTo = getNodeY(layerIdx + 1, j, layerSizes, nodeSpacing, h);
        const weight = weights[i * cols + j];
        const alpha = 80 + Math.min(150, Math.abs(weight) * 80);
        if (weight >= 0) {
          stroke(50, 120, 220, alpha);
        } else {
          stroke(220, 90, 70, alpha);
        }
        const thickness = 0.2 + Math.min(2.3, Math.abs(weight) * 1.2);
        strokeWeight(thickness);
        line(xFrom, yFrom, xTo, yTo);
      }
    }
  }

  // ---- draw nodes ----
  const OUTPUT_LABELS = ["Steer LEFT", "Steer RIGHT", "Do nothing"];
  const maxIdx = activations[activations.length - 1].indexOf(
    Math.max(...activations[activations.length - 1])
  );

  for (let layerIdx = 0; layerIdx < numLayers; layerIdx++) {
    const n = layerSizes[layerIdx];
    const acts = activations[layerIdx];
    const cx = layerIdx * layerSpacing;
    for (let i = 0; i < n; i++) {
      const cy = getNodeY(layerIdx, i, layerSizes, nodeSpacing, h);
      const a = acts[i];
      const radius = 10;
      const isActiveOutput = layerIdx === numLayers - 1 && i === maxIdx;

      if (isActiveOutput && drawingContext.shadowBlur !== undefined) {
        drawingContext.shadowColor = 'rgba(210, 140, 30, 0.8)';
        drawingContext.shadowBlur = 12;
      }
      fill(255 - a * 255);
      stroke(60);
      strokeWeight(1);
      circle(cx, cy, radius);
      if (drawingContext.shadowBlur !== undefined) {
        drawingContext.shadowBlur = 0;
      }

      if (layerIdx === 0) {
        let inputVal = (inputArray && inputArray[i] !== undefined)
          ? inputArray[i].toFixed(2) : '';
        noStroke();
        fill(40);
        textSize(11);
        textAlign(RIGHT, CENTER);
        text(`Ray${i+1}: ${inputVal}`, cx - 15, cy);
      }

      if (layerIdx === numLayers - 1) {
        noStroke();
        if (i === maxIdx) {
          fill(210, 140, 30);
        } else {
          fill(80);
        }
        textSize(11);
        textAlign(LEFT, CENTER);
        text(`${a.toFixed(2)} ${OUTPUT_LABELS[i]}`, cx + 14, cy);
      }
    }
  }

  pop();
}
