'use strict';


const TAU = Math.PI * 2;
const DEG = Math.PI / 180;
const PHI = (1 + Math.sqrt(5)) / 2;
const PSI = 1 / PHI;
const GOLDEN_ANGLE_RAD = Math.PI * (3 - Math.sqrt(5));
let CANVAS_SIZE = 2000; 
let LAYER_CEIL = 24;    


let PALS = {};
let _lastPalFp = null; 
let SOLIDS = {};
let LSYS_PRESETS = {};
let GEO_3D_TYPES = new Set();



let _geoDispatch = new Map();


let S = {}, W = 0, H = 0, _dark = false;


var document = { createElement: function(t){ return t === 'canvas' ? new OffscreenCanvas(1, 1) : {}; } };







function isDark(){ return _dark; }
function _bgIsDark(){ return _dark; }


function isGeo3D(){ return GEO_3D_TYPES.has(S.pattern); }















self._glowLayer = null;
self._glowLayerCtx = null;
function dispatchGeometryDraw(c, bR){
  const e = _geoDispatch.get(S.pattern);
  
  
  const seq = c.__beatSeq;
  if (e) {
    const name = (e[1] && S[e[1]]) ? e[2] : e[0];
    if (self._glowSelfManaged(S.pattern)) { self[name](c, bR); return; }
    self._withCompositedGlow(c, (t) => self[name](t === c ? t : _beatingCtx(t, seq), bR)); return;
  }
  if (isGeo3D()) self._withCompositedGlow(c, (t) => self.drawPlatonic(t === c ? t : _beatingCtx(t, seq), bR));
}


function _renderGeoWorker(c){
  var w = W, h = H, bR = Math.min(w, h) * 0.15;
  c.fillStyle = S.bgColor; c.fillRect(0, 0, w, h); c.save(); c.translate(w / 2, h / 2);
  if (!isGeo3D()) c.rotate(S.geoRotation * DEG);
  c.scale(S.geoScale, S.geoScale);
  self.applyStrokeStyle(c, S.lineWeight * (Math.min(w, h) / CANVAS_SIZE)); self.wrapGeoFill(c);
  c.globalAlpha = S.strokeOpacity;
  var gi = S.glowIntensity;
  if (S.glow && gi > 0) { c.shadowBlur = S.lineWeight * 6 * gi * (Math.min(w, h) / CANVAS_SIZE); c.shadowColor = self.accentColor(); }
  else c.shadowBlur = 0;
  if (S.showGuides && !isGeo3D()) {
    c.save(); c.shadowBlur = 0;
    
    
    c.strokeStyle = _dark ? 'rgba(160,176,196,0.30)' : 'rgba(0,0,0,0.22)';
    c.lineWidth = 1.0;
    for (var i = 1; i <= 5; i++) { c.beginPath(); c.arc(0, 0, bR * i, 0, TAU); c.stroke(); }
    for (var i = 0; i < 12; i++) { var a = i * TAU / 12; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a) * bR * 5, Math.sin(a) * bR * 5); c.stroke(); }
    c.restore();
    if (S.glow && gi > 0) { c.shadowBlur = S.lineWeight * 6 * gi * (Math.min(w, h) / CANVAS_SIZE); c.shadowColor = self.accentColor(); }
  }
  self._drawGeomWithMirrors(c, bR);
  c.restore();
}






function _beatingCtx(c, seq){
  
  
  c.__beatSeq = seq;
  if (c.__beats) return c;
  c.__beats = true;
  var last = Date.now();
  ['stroke', 'fill', 'fillRect', 'strokeRect', 'clearRect', 'drawImage', 'putImageData', 'fillText', 'strokeText'].forEach(function(k){
    var f = c[k];
    if (typeof f !== 'function') return;
    c[k] = function(){
      var n = Date.now();
      if (n - last >= 1000) { last = n; self.postMessage({ type: 'progress', seq: c.__beatSeq }); }
      return f.apply(this, arguments);
    };
  });
  return c;
}


self.onmessage = function(e){
  var d = e.data;
  if (d.type === 'init') {
    
    
    try {
      (new Function('self', d.helperBundleStr))(self);
    } catch (err) {
      self.postMessage({ type: 'error', msg: 'init helper eval failed: ' + (err && err.message || err) });
      return;
    }
    
    PALS = d.pals || {};
    SOLIDS = d.solids || {};
    LSYS_PRESETS = d.lsysPresets || {};
    GEO_3D_TYPES = new Set(d.geo3dTypes || []);
    CANVAS_SIZE = (typeof d.canvasSize === 'number') ? d.canvasSize : 2000;
    LAYER_CEIL = (typeof d.layerCeil === 'number') ? d.layerCeil : 24;
    
    
    self.PALS = PALS;
    self.SOLIDS = SOLIDS;
    self.LSYS_PRESETS = LSYS_PRESETS;
    self.GEO_3D_TYPES = GEO_3D_TYPES;
    self.CANVAS_SIZE = CANVAS_SIZE;
    self.LAYER_CEIL = LAYER_CEIL;
    self.S = S; self.W = W; self.H = H; self._dark = _dark;
    self.TAU = TAU; self.DEG = DEG; self.PHI = PHI; self.PSI = PSI;
    
    
    self._pafW = -1; self._pafH = -1; self._pafCX = 0; self._pafCY = 0; self._pafMaxR = 1;
    self.GOLDEN_ANGLE_RAD = GOLDEN_ANGLE_RAD;
    self.isDark = isDark;
    self._bgIsDark = _bgIsDark;
    self.isGeo3D = isGeo3D;
    
    
    self.dispatchGeometryDraw = dispatchGeometryDraw;
    self.document = document;
    
    _geoDispatch = new Map((d.workerDispatch || []).map(function(e){ return [e[0], [e[1], e[2] || null, e[3] || null]]; }));
    self.postMessage({ type: 'init-ack' });
    return;
  }
  if (d.type !== 'render') return;
  S = d.S; W = d.W; H = d.H; _dark = d.dark;
  
  
  
  
  
  
  if (d.pal && d.pal.key && Array.isArray(d.pal.colors) && d.pal.colors.length >= 2) {
    
    
    
    const fp = d.pal.fp;
    let changed;
    if (fp != null) { changed = (fp !== _lastPalFp) || !Array.isArray(PALS[d.pal.key]); }
    else { const cur = PALS[d.pal.key]; changed = !Array.isArray(cur) || cur.length !== d.pal.colors.length || cur.join('\x01') !== d.pal.colors.join('\x01'); }
    if (changed) {
      PALS[d.pal.key] = d.pal.colors;   
      _lastPalFp = (fp != null) ? fp : null;
    }
  }
  
  self.S = S; self.W = W; self.H = H; self._dark = _dark;
  try {
    var oc = new OffscreenCanvas(W, H);
    _renderGeoWorker(_beatingCtx(oc.getContext('2d'), d.seq));
    createImageBitmap(oc).then(function(bmp){
      self.postMessage({ type: 'frame', seq: d.seq, bmp: bmp }, [bmp]);
    }).catch(function(err){
      self.postMessage({ type: 'error', seq: d.seq, msg: 'createImageBitmap: ' + (err && err.message || err) });
    });
  } catch (err) {
    self.postMessage({ type: 'error', seq: d.seq, msg: err.message });
  }
};
