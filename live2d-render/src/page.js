// Browser side: load the model, take a full parameter vector per frame, run physics, render.
import * as PIXI from 'pixi.js';
import { Live2DModel } from 'pixi-live2d-display/cubism4';

window.PIXI = PIXI;

let app, model, core, pending = null;

window.setup = async ({ modelUrl, width, height }) => {
  app = new PIXI.Application({
    width, height,
    backgroundAlpha: 0,
    preserveDrawingBuffer: true,
    antialias: true,
    autoStart: false,
  });
  document.body.appendChild(app.view);

  model = await Live2DModel.from(modelUrl, { autoUpdate: false, autoInteract: false });
  app.stage.addChild(model);

  const im = model.internalModel;
  im.eyeBlink = undefined;  // blinking is scripted on the node side
  im.breath = undefined;
  core = im.coreModel;
  // Inputs are written after the (unused) motion manager and before physics/model update.
  im.on('afterMotionUpdate', () => {
    if (!pending) return;
    for (let i = 0; i < pending.params.length; i++) core.setParameterValueByIndex(i, pending.params[i]);
    if (pending.parts) for (const [i, v] of pending.parts) core.setPartOpacityByIndex(i, v);
  });
  // Live2DModel only simulates inside its render pass, so per-drawable hiding has to run right after the
  // core update (drawable opacities are outputs of it) and before drawing.
  const coreUpdate = core.update.bind(core);
  core.update = () => {
    coreUpdate();
    if (!pending?.hide) return;
    const op = core.getModel().drawables.opacities;
    for (const i of pending.hide) op[i] = 0;
  };

  const raw = core.getModel().parameters;
  const params = [...raw.ids].map((id, i) => ({
    id, def: raw.defaultValues[i], min: raw.minimumValues[i], max: raw.maximumValues[i],
  }));
  const parts = [...core.getModel().parts.ids];
  const drawables = [...core.getModel().drawables.ids];
  window.__core = core; // for probe.js
  return { params, parts, drawables, modelWidth: im.width, modelHeight: im.height };
};

// Bake a die-cut sticker border (+ soft shadow) around the rendered model on a 2D canvas.
let sticker, dilate;
function withOutline(src, width) {
  const { width: w, height: h } = src;
  if (!sticker) {
    sticker = Object.assign(document.createElement('canvas'), { width: w, height: h });
    dilate = Object.assign(document.createElement('canvas'), { width: w, height: h });
  }
  const d = dilate.getContext('2d');
  d.globalCompositeOperation = 'source-over';
  d.clearRect(0, 0, w, h);
  for (const r of [width, width * 0.5]) {
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      d.drawImage(src, Math.cos(a) * r, Math.sin(a) * r);
    }
  }
  d.globalCompositeOperation = 'source-in';
  d.fillStyle = '#fff';
  d.fillRect(0, 0, w, h);
  const o = sticker.getContext('2d');
  o.clearRect(0, 0, w, h);
  o.save();
  o.filter = `blur(${width * 0.8}px)`;
  o.globalAlpha = 0.28;
  o.drawImage(dilate, 0, width * 1.1);
  o.restore();
  // tint the shadow navy: it was drawn from the white silhouette
  o.globalCompositeOperation = 'source-atop';
  o.fillStyle = '#26305C';
  o.fillRect(0, 0, w, h);
  o.globalCompositeOperation = 'source-over';
  o.drawImage(dilate, 0, 0);
  o.drawImage(src, 0, 0);
  return sticker;
}

// t: { x, y, scale, rotation } in canvas pixels; render=false only advances simulation (warmup).
// outline: sticker border width in px (0 = none). hide: drawable indices forced invisible for this frame
// (finer than part opacity).
window.frame = ({ dt, params, parts, t, render, outline, hide }) => {
  pending = { params, parts, hide };
  model.anchor.set(0.5, 0.5);
  model.position.set(t.x, t.y);
  model.scale.set(t.scale);
  model.rotation = t.rotation || 0;
  model.update(dt);
  app.renderer.render(app.stage);
  if (!render) return null;
  return (outline ? withOutline(app.view, outline) : app.view).toDataURL('image/png');
};
