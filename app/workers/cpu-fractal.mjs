'use strict';



let IFS_DEFS = {};
let PALS = {};
let _lastPalFp = null; 


let IFS_GAMMA = 0.45;
let FRACTAL_VIEW_WIDTH = 4;


let hexRgb, _palCacheRgb, _palCacheAlpha, palRGB, palAlpha, palRGBA;
let _warpT, _fieldNoise01, _pixelAlphaField, mulberry32;




let colorT, newtonRGB, interiorRGB, _interiorOpacT, _newtonOpacT, _histEqInPlace;
let _IT_DISPATCH = {};





let IS_3D_ATTRACTORS = new Set();
let _deriv_lorenz, _deriv_rossler, _deriv_dadras, _deriv_aizawa;
let _deriv_halvorsen, _deriv_sprott_b, _deriv_thomas, _deriv_chen_lee, _deriv_duffing, _deriv_chua;
const _RK4_SCRATCH = new Float64Array(12);


let S = {}, W = 0, H = 0;

let VCX = 0, VTX = 0, VFW = 0;   









let _poolW = 0, _poolH = 0, _densityBuf = null, _colorBuf = null;
function _acquireAccum(){
  var n = W * H;
  if (W !== _poolW || H !== _poolH || !_densityBuf) {
    _densityBuf = new Float32Array(n);
    _colorBuf = new Float32Array(n);
    _poolW = W; _poolH = H;
  } else {
    
    _densityBuf.fill(0);
    _colorBuf.fill(0);
  }
  return [_densityBuf, _colorBuf];
}


function _renderIFS(oc){
  
  
  
  var def=(typeof self.getIFSDef==='function')?self.getIFSDef(S.fractalType):IFS_DEFS[S.fractalType];
  if(!def){oc.getContext('2d').fillRect(0,0,W,H);return;}
  
  
  
  
  var nIter=Math.min(8000000,S.ifsIter||200000),scale=FRACTAL_VIEW_WIDTH/(Math.min(W,H)*S.zoom),nT=def.tf.length;
  var _ac=_acquireAccum(),density=_ac[0],colorAcc=_ac[1],maxD=0;
  var cumP=[],ps=0;
  
  
  var _isPoly=S.fractalType==='ifs_polygon';
  var _rawPr=(S.ifsWeights&&S.ifsWeights.length===nT&&!_isPoly)?S.ifsWeights:def.pr;
  var _pSum=0;for(var ki=0;ki<_rawPr.length;ki++)_pSum+=_rawPr[ki];
  
  
  if(!(_pSum>0)){_rawPr=def.pr;_pSum=0;for(var kj=0;kj<_rawPr.length;kj++)_pSum+=_rawPr[kj];}
  cumP=new Array(_rawPr.length);for(var pi=0;pi<_rawPr.length;pi++){cumP[pi]=(ps+=_rawPr[pi]/_pSum);}   
  
  var _rawTf=(S.ifsCustomTf&&S.ifsCustomTf.length===nT&&!_isPoly)?S.ifsCustomTf:def.tf;
  var x=0.1,y=0.1;
  var rng=mulberry32(S.seed);
  
  
  var _cgRD=(_isPoly&&typeof self._cgRestrictDist==='function')?self._cgRestrictDist(S.cgRestrict,nT):-1;
  var _lastTi=-1;
  for(var i=0;i<nIter;i++){
    var r=rng(),ti=0;
    while(ti<cumP.length-1&&r>cumP[ti])ti++;
    if(_cgRD>=0){if(_lastTi>=0){var _g=0;while(_g++<12){var _o=((ti-_lastTi)%nT+nT)%nT;if(Math.min(_o,nT-_o)!==_cgRD)break;var _r2=rng();ti=0;while(ti<cumP.length-1&&_r2>cumP[ti])ti++;}}_lastTi=ti;}
    var tf=_rawTf[ti],a=tf[0],b=tf[1],c=tf[2],d=tf[3],e=tf[4],f=tf[5];
    var nx=a*x+b*y+e,ny=c*x+d*y+f;x=nx;y=ny;
    if(i<20)continue;
    var py_ifs=def.yup?-y:y;
    var px=Math.round((x-S.centerX)/scale+(VCX||W/2))|0;   
    var py=Math.round((py_ifs-S.centerY)/scale+H/2)|0;
    if(px>=0&&px<W&&py>=0&&py<H){
      var idx=py*W+px;density[idx]++;colorAcc[idx]+=ti/nT;
      if(density[idx]>maxD)maxD=density[idx];
    }
  }
  var c2d=oc.getContext('2d'),img=c2d.createImageData(W,H),dd=img.data;
  var bg=hexRgb(S.bgColor),logMax=Math.log(maxD+1);
  
  
  
  
  var _wp=S.colorWarp,_rep=Math.max(1,Math.min(8,S.colorRepeat||1)),_ph=S.colorPhase||0;
  var _opacField=S.opacityFieldStroke&&S.opacityFieldStroke!=='constant';
  for(var ii=0;ii<W*H;ii++){
    var cnt=density[ii];
    if(cnt===0){dd[ii*4]=bg[0];dd[ii*4+1]=bg[1];dd[ii*4+2]=bg[2];dd[ii*4+3]=255;continue;}
    var brt=Math.pow(Math.log(cnt+1)/logMax,IFS_GAMMA);
    var raw=colorAcc[ii]/cnt;
    
    
    var _t=((raw*S.colorCycle+S.colorOffset)%1+1)%1;
    if(_wp&&_wp!=='linear')_t=_warpT(_t,_wp,S.colorWarpAmt||1);
    if(_rep>1)_t=((_t*_rep)%1+1)%1;
    var tc=((_t+_ph)%1+1)%1;
    var rgba=palRGBA(tc),pa=rgba[3];
    var a=pa;
    if(_opacField){var px=ii%W,py=(ii/W)|0;a=pa*_pixelAlphaField(px,py,W,H,tc);}
    var nR=rgba[0]*brt|0,nG=rgba[1]*brt|0,nB=rgba[2]*brt|0;
    if(a<0.999){nR=bg[0]*(1-a)+nR*a|0;nG=bg[1]*(1-a)+nG*a|0;nB=bg[2]*(1-a)+nB*a|0;}
    dd[ii*4]=Math.min(255,nR);dd[ii*4+1]=Math.min(255,nG);dd[ii*4+2]=Math.min(255,nB);dd[ii*4+3]=255;
  }
  c2d.putImageData(img,0,0);
}


function _renderAttractor(oc){
  
  
  var bbMinX=Infinity,bbMaxX=-Infinity,bbMinY=Infinity,bbMaxY=-Infinity;
  var nIter=S.chaosIter||500000,sc=FRACTAL_VIEW_WIDTH/(Math.min(W,H)*S.zoom);  
  var a=S.chaosA,b=S.chaosB,c=S.chaosC,d=S.chaosD;
  var _ac=_acquireAccum(),density=_ac[0],colorAcc=_ac[1],maxD=0;
  var proj=S.chaosProj||'xz';
  var ft=S.fractalType;
  
  var is3D=IS_3D_ATTRACTORS.has(ft);
  var x,y,z,dt;
  
  
  
  if(ft==='attractor_chen_lee'||ft==='attractor_pickover'){
    x=(S.chaosX0!=null)?+S.chaosX0:1;
    y=(S.chaosY0!=null)?+S.chaosY0:1;
    z=(S.chaosZ0!=null)?+S.chaosZ0:1;
    dt=0.005;
  } else if(ft==='attractor_dadras'){
    x=(S.chaosX0!=null)?+S.chaosX0:0.1;
    y=(S.chaosY0!=null&&S.chaosY0!==0)?+S.chaosY0:0.03;
    z=(S.chaosZ0!=null)?+S.chaosZ0:0;
    dt=0.005;
  } else if(ft==='attractor_duffing'){
    
    
    x=(S.chaosX0!=null)?+S.chaosX0:0.1;
    y=(S.chaosY0!=null)?+S.chaosY0:0;
    z=0;
    dt=0.01;
  } else if(is3D){
    x=(S.chaosX0!=null)?+S.chaosX0:0.1;
    y=(S.chaosY0!=null)?+S.chaosY0:0;
    z=(S.chaosZ0!=null)?+S.chaosZ0:0;
    dt=0.005;
  } else {
    x=(S.chaosX0!=null)?+S.chaosX0:0.1;
    y=(S.chaosY0!=null)?+S.chaosY0:0;
    z=(S.chaosZ0!=null)?+S.chaosZ0:0;
    dt=1;
  }
  
  function _wReseedICs(ft){
    if(ft==='attractor_chen_lee'||ft==='attractor_pickover')return[1,1,1];
    if(ft==='attractor_dadras')return[0.1,0.03,0];
    if(ft==='attractor_tinkerbell')return[-0.72,-0.64,0];
    return[0.1,0,0];
  }
  
  
  
  
  
  
  
  
  
  
  var _wDuffingOriginFixed=ft==='attractor_duffing'&&Math.abs(b)<1e-9;
  if((ft==='attractor_chen_lee'||ft==='attractor_lorenz'||ft==='attractor_halvorsen'||ft==='attractor_thomas'||ft==='attractor_chua'||ft==='attractor_tinkerbell'||ft==='attractor_gumowski_mira'||_wDuffingOriginFixed) && Math.abs(x)+Math.abs(y)+Math.abs(z)<1e-9){var _wr=_wReseedICs(ft);x=_wr[0];y=_wr[1];z=_wr[2];}
  var TAU=6.283185307;
  
  
  
  
  function _pickDeriv(ft){
    if(ft==='attractor_lorenz')return _deriv_lorenz;
    if(ft==='attractor_rossler')return _deriv_rossler;
    if(ft==='attractor_dadras')return _deriv_dadras;
    if(ft==='attractor_aizawa')return _deriv_aizawa;
    if(ft==='attractor_halvorsen')return _deriv_halvorsen;
    if(ft==='attractor_sprott_b')return _deriv_sprott_b;
    if(ft==='attractor_thomas')return _deriv_thomas;
    if(ft==='attractor_chen_lee')return _deriv_chen_lee;
    if(ft==='attractor_duffing')return _deriv_duffing;
    if(ft==='attractor_chua')return _deriv_chua;
    return null;
  }
  
  
  
  
  function _rk4(deriv, x, y, z, dt, a, b, c, d, out3){
    var s=_RK4_SCRATCH;
    deriv(x, y, z, a,b,c,d, s, 0);
    deriv(x+0.5*dt*s[0], y+0.5*dt*s[1], z+0.5*dt*s[2], a,b,c,d, s, 3);
    deriv(x+0.5*dt*s[3], y+0.5*dt*s[4], z+0.5*dt*s[5], a,b,c,d, s, 6);
    deriv(x+dt*s[6],     y+dt*s[7],     z+dt*s[8],     a,b,c,d, s, 9);
    out3[0]=x+dt*(s[0]+2*s[3]+2*s[6]+s[9])/6;
    out3[1]=y+dt*(s[1]+2*s[4]+2*s[7]+s[10])/6;
    out3[2]=z+dt*(s[2]+2*s[5]+2*s[8]+s[11])/6;
  }
  
  var _rkOut=new Float64Array(3);
  
  
  
  
  var _drv=_pickDeriv(ft);
  
  for(var i=0;i<1000;i++){
    if(_drv){_rk4(_drv,x,y,z,dt,a,b,c,d,_rkOut);x=_rkOut[0];y=_rkOut[1];z=_rkOut[2];}
    else if(ft==='attractor_clifford'){var nx=Math.sin(a*y)+c*Math.cos(a*x);var ny=Math.sin(b*x)+d*Math.cos(b*y);x=nx;y=ny;}
    else if(ft==='attractor_dejong'){var nx=Math.sin(a*y)-Math.cos(b*x);var ny=Math.sin(c*x)-Math.cos(d*y);x=nx;y=ny;}
    else if(ft==='attractor_hopalong'){var nx=y-Math.sign(x)*Math.sqrt(Math.abs(b*x-c));y=a-x;x=nx;}
    else if(ft==='attractor_henon'){var nx=1-a*x*x+y;y=b*x;x=nx;}
    else if(ft==='attractor_pickover'){
      
      
      var nx=Math.sin(a*y)-z*Math.cos(b*x);
      var ny=z*Math.sin(c*x)-Math.cos(d*y);
      var nz=Math.sin(x);
      x=nx;y=ny;z=nz;
    }
    else if(ft==='attractor_tinkerbell'){var nx=x*x-y*y+a*x+b*y;y=2*x*y+c*x+d*y;x=nx;}
    else if(ft==='attractor_ikeda'){var tt=0.4-6/(1+x*x+y*y),ct=Math.cos(tt),st=Math.sin(tt),nx=1+a*(x*ct-y*st);y=a*(x*st+y*ct);x=nx;}
    else if(ft==='attractor_gumowski_mira'){var gx=c*x+2*(1-c)*x*x/(1+x*x),nx=y+a*y*(1-b*y*y)+gx;y=-x+(c*nx+2*(1-c)*nx*nx/(1+nx*nx));x=nx;}
    else{self.postMessage({type:'error',msg:'Unknown attractor type: '+ft});return;}
    if(!isFinite(x)||!isFinite(y)||!isFinite(z)){var _r=_wReseedICs(ft);x=_r[0];y=_r[1];z=_r[2];}
  }
  
  var dbg=S._attrDbg?{nan:0,inBox:0,total:0,first:[],last:[],minX:Infinity,maxX:-Infinity,minY:Infinity,maxY:-Infinity,minZ:Infinity,maxZ:-Infinity}:null;
  
  
  
  var _r3x=(S._3dRotX||0)*0.01,_r3y=(S._3dRotY||0)*0.01;
  var _rot3D=is3D&&(_r3x||_r3y);
  var _cRX=Math.cos(_r3x),_sRX=Math.sin(_r3x),_cRY=Math.cos(_r3y),_sRY=Math.sin(_r3y);
  var _cX=S.centerX,_cY=S.centerY;  
  
  
  
  
  
  
  
  var _cwz=0;
  if(_rot3D && typeof S._attrCwz==='number' && isFinite(S._attrCwz)){
    
    
    _cwz=S._attrCwz;
  } else if(_rot3D){
    var _drv0=_pickDeriv(ft),_sz=0,_sn=0,_wx=x,_wy=y,_wz=z;
    for(var _k=0;_k<60000;_k++){
      if(_drv0){_rk4(_drv0,_wx,_wy,_wz,dt,a,b,c,d,_rkOut);_wx=_rkOut[0];_wy=_rkOut[1];_wz=_rkOut[2];}
      else{var _pnx=Math.sin(a*_wy)-_wz*Math.cos(b*_wx),_pny=_wz*Math.sin(c*_wx)-Math.cos(d*_wy),_pnz=Math.sin(_wx);_wx=_pnx;_wy=_pny;_wz=_pnz;}
      if(!isFinite(_wx)||!isFinite(_wy)||!isFinite(_wz)){var _r2=_wReseedICs(ft);_wx=_r2[0];_wy=_r2[1];_wz=_r2[2];continue;}
      _sz+=(proj==='xz')?_wy:(proj==='xy')?_wz:_wx;_sn++;
    }
    if(_sn)_cwz=_sz/_sn;
  }
  for(var i=0;i<nIter;i++){
    var px2d,py2d,colorT=0;
    if(_drv){_rk4(_drv,x,y,z,dt,a,b,c,d,_rkOut);x=_rkOut[0];y=_rkOut[1];z=_rkOut[2];if(ft==='attractor_duffing'){px2d=x;py2d=y;}else{var wx,wy,wz;if(proj==='xz'){wx=x;wy=z;wz=y;}else if(proj==='xy'){wx=x;wy=y;wz=z;}else{wx=y;wy=z;wz=x;}if(_rot3D){var _ax=wx-_cX,_az=wz-_cwz,_nx=_ax*_cRY+_az*_sRY,_nz=-_ax*_sRY+_az*_cRY;px2d=_nx+_cX;py2d=(wy-_cY)*_cRX-_nz*_sRX+_cY;}else{px2d=wx;py2d=wy;}}colorT=(Math.atan2(y,x)/TAU+0.5);}
    else if(ft==='attractor_clifford'){var nx=Math.sin(a*y)+c*Math.cos(a*x);var ny=Math.sin(b*x)+d*Math.cos(b*y);x=nx;y=ny;px2d=x;py2d=y;colorT=(Math.atan2(y,x)/TAU+0.5);}
    else if(ft==='attractor_dejong'){var nx=Math.sin(a*y)-Math.cos(b*x);var ny=Math.sin(c*x)-Math.cos(d*y);x=nx;y=ny;px2d=x;py2d=y;colorT=(Math.atan2(y,x)/TAU+0.5);}
    else if(ft==='attractor_hopalong'){var nx=y-Math.sign(x)*Math.sqrt(Math.abs(b*x-c));y=a-x;x=nx;px2d=x;py2d=y;colorT=(Math.atan2(y,x)/TAU+0.5);}
    else if(ft==='attractor_henon'){var nx=1-a*x*x+y;y=b*x;x=nx;px2d=x;py2d=y;colorT=(Math.atan2(y,x)/TAU+0.5);}
    else if(ft==='attractor_pickover'){
      var nx=Math.sin(a*y)-z*Math.cos(b*x);
      var ny=z*Math.sin(c*x)-Math.cos(d*y);
      var nz=Math.sin(x);
      x=nx;y=ny;z=nz;
      {var wx,wy,wz;if(proj==='xz'){wx=x;wy=z;wz=y;}else if(proj==='xy'){wx=x;wy=y;wz=z;}else{wx=y;wy=z;wz=x;}if(_rot3D){var _ax=wx-_cX,_az=wz-_cwz,_nx=_ax*_cRY+_az*_sRY,_nz=-_ax*_sRY+_az*_cRY;px2d=_nx+_cX;py2d=(wy-_cY)*_cRX-_nz*_sRX+_cY;}else{px2d=wx;py2d=wy;}}
      colorT=(Math.atan2(y,x)/TAU+0.5);
    }
    else if(ft==='attractor_tinkerbell'){var nx=x*x-y*y+a*x+b*y;y=2*x*y+c*x+d*y;x=nx;px2d=x;py2d=y;colorT=(Math.atan2(y,x)/TAU+0.5);}
    else if(ft==='attractor_ikeda'){var tt=0.4-6/(1+x*x+y*y),ct=Math.cos(tt),st=Math.sin(tt),nx=1+a*(x*ct-y*st);y=a*(x*st+y*ct);x=nx;px2d=x;py2d=y;colorT=(Math.atan2(y,x)/TAU+0.5);}
    else if(ft==='attractor_gumowski_mira'){var gx=c*x+2*(1-c)*x*x/(1+x*x),nx=y+a*y*(1-b*y*y)+gx;y=-x+(c*nx+2*(1-c)*nx*nx/(1+nx*nx));x=nx;px2d=x;py2d=y;colorT=(Math.atan2(y,x)/TAU+0.5);}
    else{self.postMessage({type:'error',msg:'Unknown attractor type (iteration): '+ft});return;}
    if(!isFinite(x)||!isFinite(y)||!isFinite(z)){
      if(dbg)dbg.nan++;
      var _r=_wReseedICs(ft);x=_r[0];y=_r[1];z=_r[2];continue;
    }
    if(dbg){
      dbg.total++;
      if(dbg.minX>x)dbg.minX=x;if(dbg.maxX<x)dbg.maxX=x;
      if(dbg.minY>y)dbg.minY=y;if(dbg.maxY<y)dbg.maxY=y;
      if(dbg.minZ>z)dbg.minZ=z;if(dbg.maxZ<z)dbg.maxZ=z;
    }
    
    if(i>nIter*0.01){
      if(px2d<bbMinX)bbMinX=px2d;
      if(px2d>bbMaxX)bbMaxX=px2d;
      if(py2d<bbMinY)bbMinY=py2d;
      if(py2d>bbMaxY)bbMaxY=py2d;
    }
    var ppx=Math.round((px2d-S.centerX)/sc+(VCX||W/2))|0;   
    var ppy=Math.round((py2d-S.centerY)/sc+H/2)|0;
    if(dbg){
      if(dbg.first.length<10)dbg.first.push([+x.toFixed(4),+y.toFixed(4),+z.toFixed(4),ppx,ppy]);
      if(dbg.last.length>=10)dbg.last.shift();
      dbg.last.push([+x.toFixed(4),+y.toFixed(4),+z.toFixed(4),ppx,ppy]);
    }
    if(ppx>=0&&ppx<W&&ppy>=0&&ppy<H){
      if(dbg)dbg.inBox++;
      var idx=ppy*W+ppx;density[idx]++;colorAcc[idx]+=colorT;if(density[idx]>maxD)maxD=density[idx];
    }
  }
  
  oc._bbox=isFinite(bbMinX)?{minX:bbMinX,maxX:bbMaxX,minY:bbMinY,maxY:bbMaxY}:null;
  oc._dbg=dbg?Object.assign(dbg,{ft:ft,sc:sc,centerX:S.centerX,centerY:S.centerY,zoom:S.zoom,proj:proj,W:W,H:H,maxD:maxD}):null;
  var c2d=oc.getContext('2d');
  if(maxD>0){
    var img=c2d.createImageData(W,H),dd=img.data,bg=hexRgb(S.bgColor),lm=Math.log(maxD+1);
    
    
    var _wp=S.colorWarp,_rep=Math.max(1,Math.min(8,S.colorRepeat||1)),_ph=S.colorPhase||0;
    var _opacField=S.opacityFieldStroke&&S.opacityFieldStroke!=='constant';
    for(var ii=0;ii<W*H;ii++){
      if(density[ii]===0){dd[ii*4]=bg[0];dd[ii*4+1]=bg[1];dd[ii*4+2]=bg[2];dd[ii*4+3]=255;continue;}
      
      var brt=Math.pow(Math.log(density[ii]+1)/lm,0.5);
      var raw=colorAcc[ii]/density[ii];
      
      var _t=((raw*S.colorCycle+S.colorOffset)%1+1)%1;
      if(_wp&&_wp!=='linear')_t=_warpT(_t,_wp,S.colorWarpAmt||1);
      if(_rep>1)_t=((_t*_rep)%1+1)%1;
      var tc=((_t+_ph)%1+1)%1;
      var rgba=palRGBA(tc),pa=rgba[3];
      var a=pa;
      if(_opacField){var px=ii%W,py=(ii/W)|0;a=pa*_pixelAlphaField(px,py,W,H,tc);}
      var nR=rgba[0]*brt|0,nG=rgba[1]*brt|0,nB=rgba[2]*brt|0;
      if(a<0.999){nR=bg[0]*(1-a)+nR*a|0;nG=bg[1]*(1-a)+nG*a|0;nB=bg[2]*(1-a)+nB*a|0;}
      dd[ii*4]=Math.min(255,nR);dd[ii*4+1]=Math.min(255,nG);dd[ii*4+2]=Math.min(255,nB);dd[ii*4+3]=255;
    }
    c2d.putImageData(img,0,0);
  }else{
    c2d.fillStyle=S.bgColor;c2d.fillRect(0,0,W,H);
  }
}















function _cpuOrbitTrapMin(px,py){
  var mode=S.trapMode|0;
  if(mode<=0 || !(S.trapMix>0)) return 1e10;
  var ft=S.fractalType, pw=(S.fractalPower==null?2:S.fractalPower);
  var zx,zy,cx,cy,kind;
  var sc = FRACTAL_VIEW_WIDTH / (Math.min(W, H) * S.zoom);   
  var px0=S.centerX+(px-(VCX||W/2))*sc, py0=S.centerY+(py-H/2)*sc;
  if(ft==='mandelbrot' && Math.abs(pw-2)<0.001){ zx=0;zy=0;cx=px0;cy=py0;kind=0; }
  else if(ft==='julia' && Math.abs(pw-2)<0.001){ zx=px0;zy=py0;cx=S.juliaReal;cy=S.juliaImag;kind=0; }
  else if(ft==='burningship'){ zx=0;zy=0;cx=px0;cy=py0;kind=1; }
  else if(ft==='tricorn'){ zx=0;zy=0;cx=px0;cy=py0;kind=2; }
  else return 1e10;
  var mi=S.maxIter, er2=S.escRad*S.escRad, sz=S.trapSize, tm=1e10;
  for(var i=0;i<mi;i++){
    var nx=zx*zx-zy*zy+cx;
    zy = kind===1 ? Math.abs(2*zx*zy)+cy : (kind===2 ? -2*zx*zy+cy : 2*zx*zy+cy);
    zx=nx;
    var d;
    if(mode===1||mode===4) d=Math.min(Math.abs(zx),Math.abs(zy));
    else if(mode===2) d=Math.abs(Math.sqrt(zx*zx+zy*zy)-sz);
    else { var ax=Math.abs(zx)*sz, ay=Math.abs(zy)*sz, tx=ax-Math.floor(ax), ty=ay-Math.floor(ay); d=Math.min(Math.min(tx,1-tx),Math.min(ty,1-ty)); }
    if(d<tm)tm=d;
    if(zx*zx+zy*zy>er2) break;
  }
  return tm;
}
function _cpuTrapMixRGB(r,g,b,trapMin){
  var mode=S.trapMode|0, mix=S.trapMix, cyc=S.colorCycle, off=S.colorOffset;
  if(mode<=0 || !(mix>0) || trapMin>=1e9) return [r,g,b];
  var td,t;
  if(mode===4){ td=Math.min(Math.max(trapMin/Math.max(S.trapSize*0.08,1e-4),0),1); var l=-Math.log(Math.max(trapMin,1e-6))*0.15*cyc+off+0.3; t=l-Math.floor(l); }
  else { td=Math.min(Math.max(trapMin*3,0),1); var u=trapMin*cyc+off+0.3; t=u-Math.floor(u); }
  var tc=palRGBA(t), f=mix*(1-td);
  return [ r+(tc[0]-r)*f|0, g+(tc[1]-g)*f|0, b+(tc[2]-b)*f|0 ];
}
function _renderEscapeTime(oc, seq){
  var c2d = oc.getContext('2d');
  var fn = _IT_DISPATCH[S.fractalType];
  var sc = FRACTAL_VIEW_WIDTH / (Math.min(W, H) * S.zoom);
  var mi = S.maxIter, er2 = S.escRad * S.escRad;
  var iterate = function(px, py){
    var cx = S.centerX + (px - (VCX || W / 2)) * sc;
    var cy = S.centerY + (py - H / 2) * sc;
    return fn(cx, cy, mi, er2);
  };
  var aa = S.aa, isNewton = S.fractalType.indexOf('newton') === 0;
  var img = c2d.createImageData(W, H), data = img.data;
  var CHUNK = aa > 1 ? 20 : 48;
  var bg = hexRgb(S.bgColor);
  
  
  var _opacField = S.opacityFieldStroke && S.opacityFieldStroke !== 'constant';
  for (var py = 0; py < H; py += CHUNK) {
    for (var row = py; row < Math.min(py + CHUNK, H); row++) {
      for (var px = 0; px < W; px++) {
        var rA = 0, gA = 0, bA = 0, lastT = 0;
        for (var sy = 0; sy < aa; sy++) for (var sx = 0; sx < aa; sx++) {
          var spx = px + (sx + .5) / aa - .5,
              spy = row + (sy + .5) / aa - .5,
              res = iterate(spx, spy),
              iter = res[0], zx = res[1], zy = res[2];
          var r, g, b;
          if (isNewton) {
            var nrgb = newtonRGB(iter, zx, zy); r = nrgb[0]; g = nrgb[1]; b = nrgb[2];
            lastT = _newtonOpacT(zx, zy, iter);   
          } else if (iter >= mi) {
            var irgb = interiorRGB(zx, zy, iter); r = irgb[0]; g = irgb[1]; b = irgb[2];
            lastT = _interiorOpacT(zx, zy);   
          } else {
            var tc = colorT(iter, zx, zy);
            lastT = tc;
            var rgba = palRGBA(tc);
            r = rgba[0]; g = rgba[1]; b = rgba[2];
            
            if (S.trapMode > 0 && S.trapMix > 0) { var _ttc = _cpuTrapMixRGB(r, g, b, _cpuOrbitTrapMin(spx, spy)); r = _ttc[0]; g = _ttc[1]; b = _ttc[2]; }
            var a = rgba[3];
            if (a < 0.999) {
              r = bg[0] * (1 - a) + r * a | 0;
              g = bg[1] * (1 - a) + g * a | 0;
              b = bg[2] * (1 - a) + b * a | 0;
            }
          }
          rA += r; gA += g; bA += b;
        }
        var nS = aa * aa, i4 = (row * W + px) * 4;
        var mr = rA / nS | 0, mg = gA / nS | 0, mb = bA / nS | 0;
        if (_opacField) {
          var fa = _pixelAlphaField(px + VTX, H - 1 - row, VFW || W, H, lastT);   
          if (fa < 0.999) {
            mr = bg[0] * (1 - fa) + mr * fa | 0;
            mg = bg[1] * (1 - fa) + mg * fa | 0;
            mb = bg[2] * (1 - fa) + mb * fa | 0;
          }
        }
        data[i4] = mr; data[i4 + 1] = mg; data[i4 + 2] = mb; data[i4 + 3] = 255;
      }
    }
    self.postMessage({type:'progress', seq: seq, pct: Math.min(99, Math.round(100 * py / H))});
  }
  
  
  if (S.colorAlgo === 'histogram') _histEqInPlace(data, W * H);
  c2d.putImageData(img, 0, 0);
}


self.onmessage = function(e){
  var d = e.data;
  if (d.type === 'init') {
    
    
    try {
      (new Function('self', d.helperBundleStr))(self);
    } catch (err) {
      self.postMessage({type:'error', msg:'init helper eval failed: ' + (err && err.message || err)});
      return;
    }
    
    hexRgb = self.hexRgb;
    _palCacheRgb = self._palCacheRgb;
    _palCacheAlpha = self._palCacheAlpha;
    palRGB = self.palRGB;
    palAlpha = self.palAlpha;
    palRGBA = self.palRGBA;
    _warpT = self._warpT;
    _fieldNoise01 = self._fieldNoise01;
    _pixelAlphaField = self._pixelAlphaField;
    mulberry32 = self.mulberry32;
    colorT = self.colorT;
    newtonRGB = self.newtonRGB;
    interiorRGB = self.interiorRGB;
    _interiorOpacT = self._interiorOpacT;
    _newtonOpacT = self._newtonOpacT;
    _histEqInPlace = self._histEqInPlace;
    
    _IT_DISPATCH = {};
    if (d.itDispatchSrc) {
      for (var k in d.itDispatchSrc) {
        try { _IT_DISPATCH[k] = (new Function('return (' + d.itDispatchSrc[k] + ')'))(); }
        catch (err) { self.postMessage({type:'error', msg:'itDispatch rebuild failed for ' + k + ': ' + (err && err.message || err)}); }
      }
    }
    
    self.NEWTON_EPS = (typeof d.newtonEps === 'number') ? d.newtonEps : 1e-12;
    self.NEWTON_DENOM_MIN = (typeof d.newtonDenomMin === 'number') ? d.newtonDenomMin : 1e-28;
    
    
    _deriv_lorenz = self._deriv_lorenz;
    _deriv_rossler = self._deriv_rossler;
    _deriv_dadras = self._deriv_dadras;
    _deriv_aizawa = self._deriv_aizawa;
    _deriv_halvorsen = self._deriv_halvorsen;
    _deriv_sprott_b = self._deriv_sprott_b;
    _deriv_thomas = self._deriv_thomas;
    _deriv_chen_lee = self._deriv_chen_lee;
    _deriv_duffing = self._deriv_duffing;
    _deriv_chua = self._deriv_chua;
    
    IFS_DEFS = d.ifsDefs || {};
    PALS = d.pals || {};
    IFS_GAMMA = (typeof d.ifsGamma === 'number') ? d.ifsGamma : 0.45;
    FRACTAL_VIEW_WIDTH = (typeof d.fractalViewWidth === 'number') ? d.fractalViewWidth : 4;
    
    
    IS_3D_ATTRACTORS = new Set(Array.isArray(d.is3DAttractors) ? d.is3DAttractors : []);
    
    
    
    
    self.PALS = PALS;
    self.IFS_DEFS = IFS_DEFS;
    self.IFS_GAMMA = IFS_GAMMA;
    self.FRACTAL_VIEW_WIDTH = FRACTAL_VIEW_WIDTH;
    self.IS_3D_ATTRACTORS = IS_3D_ATTRACTORS;
    self.S = S; self.W = W; self.H = H;
    
    
    
    
    self.TAU = Math.PI * 2; self.DEG = Math.PI / 180;
    
    
    
    self._pafW = -1; self._pafH = -1; self._pafCX = 0; self._pafCY = 0; self._pafMaxR = 1;
    self.postMessage({type:'init-ack'});
    return;
  }
  if (d.type !== 'render') return;
  try {
    S = d.S; W = d.W; H = d.H; VCX = (typeof d.VCX === 'number') ? d.VCX : W / 2; VTX = d.VTX || 0; VFW = d.VFW || W;
    
    
    
    
    
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
    
    self.S = S; self.W = W; self.H = H;
    var oc = new OffscreenCanvas(W, H);
    var c2d = oc.getContext('2d'); c2d.fillStyle = S.bgColor; c2d.fillRect(0, 0, W, H);
    if (S.fractalType.startsWith('ifs_')) _renderIFS(oc);
    else if (_IT_DISPATCH[S.fractalType]) _renderEscapeTime(oc, d.seq);
    else _renderAttractor(oc);
    
    var _bbox = oc._bbox || null;
    var _dbg = oc._dbg || null;
    createImageBitmap(oc).then(function(bmp){
      
      
      
      
      
      
      self.postMessage({type:'frame', seq:d.seq, fractalType:d.S.fractalType, bmp:bmp, bbox:_bbox, dbg:_dbg}, [bmp]);
    }).catch(function(err){
      self.postMessage({type:'error', seq:d.seq, msg:'createImageBitmap: ' + (err && err.message || err)});
    });
  } catch (err) {
    self.postMessage({type:'error', seq:d.seq, msg:err.message});
  }
};
