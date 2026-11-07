import * as T from 'three';
import {GLTFLoader} from './vendor/loaders/GLTFLoader.js';
import {MeshoptDecoder} from './vendor/libs/meshopt_decoder.module.js';
import {applyPhotoReskin} from './photo-reskins.js';
import {clone} from './vendor/SkeletonUtils.js';

const loader=new GLTFLoader().setMeshoptDecoder(MeshoptDecoder),cache=new Map(),references=new Map(),pending=new Map();
function trimCache(){for(const [index,promise] of cache){if(cache.size<=4)break;if((references.get(index)||0)>0||(pending.get(index)||0)>0)continue;cache.delete(index);promise.then(asset=>{const textures=new Set();asset.scene.traverse(o=>{if(!o.isMesh)return;o.geometry.dispose();for(const m of Array.isArray(o.material)?o.material:[o.material]){for(const v of Object.values(m))if(v?.isTexture)textures.add(v);m.dispose();}});for(const texture of textures){texture.dispose();texture.source?.data?.close?.();}}).catch(()=>{});}}

// Civilian source models: 0 hoodie, 1 sweater, 8 tee (men); 3 sweater, 6 blouse, 9 stripes (women).
// 2 clown, 4 demon, 5/10/11 zombies, 7 knight and 12 soldier stay available as alternate skins in Character Studio.
// tint recolours clothing only (faces, hands and hair keep their original texture).
export const looks=[
{model:8,width:1.14,height:1.02},                       // Bubba Miller — heavy hitter
{model:1,width:1.05,height:1.01},                       // Hank Miller
{model:0,width:.96,height:.98},                         // Charlie Smith
{model:3,width:1,height:1},                             // Lucy Smith
{model:9,tint:0x8a5c9e,strength:.7,width:1.04,height:1},// Debbie Miller
{model:6,width:1,height:1.01},                          // Karen Smith
{model:0,tint:0x2f6aa6,strength:.75,width:.95,height:.97},// Kevin Smith
{model:8,tint:0x6b7032,strength:.8,width:1.08,height:1},// Ricky Smith
{model:3,tint:0x2e8f88,strength:.75,width:.97,height:.98},// Becky Smith
{model:1,tint:0x6f705c,strength:.75,width:1.1,height:.97},// Mr. Ronnie Miller
{model:1,tint:0x7b5530,strength:.75,width:1.14,height:1.03},// Earl Miller
{model:9,tint:0xc8952e,strength:.75,width:1,height:1.02}  // Jolene Miller
];
const thugs=[0x2a2c2e,0x5b2626,0x2d3a2a,0x3a3048,0x4a3b28,0x23394a,0x5a4a2a];
const thugModels=[0,8,1,0,8,1,9,3,6];
let assignments={};try{assignments=JSON.parse(localStorage.getItem('porch-war-skins')||'{}');}catch{}
export function skinIndex(fighter){const i=assignments[fighter];return Number.isInteger(i)&&i>=0&&i<=12?i:looks[fighter].model;}
export function lookFor(fighter){return{...looks[fighter],model:skinIndex(fighter)};}
export function modelUrl(index){return `./models/rigged/character-${String(index).padStart(2,'0')}.glb`;}
export async function loadCharacter(index){if(!cache.has(index))cache.set(index,loader.loadAsync(modelUrl(index)).catch(e=>{cache.delete(index);throw e;}));return cache.get(index);}
export function preloadCharacters(indices){for(const i of new Set(indices))loadCharacter(i).catch(()=>{});}

function clothMask(mesh){const g=mesh.geometry,count=g.attributes.position.count,mask=new Float32Array(count).fill(1);if(/hair|eyelash|eye|teeth|tongue/i.test(mesh.name+' '+[].concat(mesh.material).map(m=>m.name).join(' '))){mask.fill(0);}else if(g.attributes.skinIndex&&mesh.skeleton){const keep=mesh.skeleton.bones.map(b=>/Head|Neck|Hand|Eye|Jaw/.test(b.name)?1:0),idx=g.attributes.skinIndex,w=g.attributes.skinWeight;for(let i=0;i<count;i++){let s=0;for(let n=0;n<4;n++)s+=keep[idx.getComponent(i,n)]*w.getComponent(i,n);mask[i]=1-T.MathUtils.smoothstep(s,.25,.6);}}g.setAttribute('clothMask',new T.BufferAttribute(mask,1));}
function prepareMaterial(source,mesh,look,actor){const m=source.clone();m.roughness=Math.max(.45,m.roughness??.7);const name=(m.name+' '+mesh.name).toLowerCase();if(/hair|eyelash/.test(name)){m.transparent=false;m.alphaTest=.45;m.depthWrite=true;m.side=T.DoubleSide;}else{m.transparent=false;m.depthWrite=true;m.alphaTest=0;}
m.emissive=new T.Color(0);m.userData.flash=0;const tint=look.tint!==undefined&&look.strength>0?new T.Color(look.tint):null;if(tint){m.userData.tint=tint;m.onBeforeCompile=shader=>{shader.uniforms.uTint={value:tint};shader.uniforms.uTintStrength={value:look.strength};shader.vertexShader='attribute float clothMask;\nvarying float vClothMask;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvClothMask=clothMask;');shader.fragmentShader='uniform vec3 uTint;\nuniform float uTintStrength;\nvarying float vClothMask;\n'+shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
{vec3 c=diffuseColor.rgb;float mx=max(c.r,max(c.g,c.b)),mn=min(c.r,min(c.g,c.b)),sat=(mx-mn)/(mx+1e-4);
float skin=step(c.b,c.g)*step(c.g,c.r)*smoothstep(.1,.22,sat)*(1.-smoothstep(.62,.78,sat))*step(.06,mx);
float l=dot(c,vec3(.299,.587,.114));vec3 tinted=uTint*(.2+l*1.3);
diffuseColor.rgb=mix(c,tinted,clamp(vClothMask*(1.-skin)*uTintStrength,0.,1.));}`);};m.customProgramCacheKey=()=>'pw-tint';}actor.materials.push(m);return m;}

export async function attachCharacter(actor,choice=lookFor(actor.index),photoIndex=null){
const look=typeof choice==='number'?{...looks[actor.index]||{},model:choice,tint:undefined}:choice,model=look.model;
const token=actor.skinRequest=(actor.skinRequest||0)+1;actor.skinStatus='loading';pending.set(model,(pending.get(model)||0)+1);
try{const asset=await loadCharacter(model);if(actor.disposed||actor.skinRequest!==token)return;references.set(model,(references.get(model)||0)+1);detachCharacter(actor);actor.residentModel=model;actor.materials=[];const skin=clone(asset.scene);skin.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;o.frustumCulled=false;o.geometry=o.geometry.clone();if(look.tint!==undefined)clothMask(o);o.material=Array.isArray(o.material)?o.material.map(m=>prepareMaterial(m,o,look,actor)):prepareMaterial(o.material,o,look,actor);}});skin.scale.set(look.width||1,look.height||1,look.width||1);actor.g.add(skin);actor.skin=skin;
if(photoIndex!==null){try{await applyPhotoReskin(skin,photoIndex,actor);}catch(error){console.warn('Photo texture unavailable; original skin retained',error.message);}if(actor.disposed||actor.skinRequest!==token)return;}
actor.procedural.visible=false;actor.mixer=new T.AnimationMixer(skin);actor.skinActions=new Map(asset.animations.map(c=>[c.name,actor.mixer.clipAction(c)]));actor.skinStatus=`Imported model ${model}`;actor.skinModel=model;actor.skinState=null;trimCache();updateCharacter(actor,0,false);
}catch(error){detachCharacter(actor);actor.skinStatus='procedural fallback';console.warn(`Character ${model} unavailable; keeping procedural model.`,error.message);}finally{pending.set(model,Math.max(0,(pending.get(model)||1)-1));trimCache();}}

export function detachCharacter(actor){if(actor.residentModel!==undefined){references.set(actor.residentModel,Math.max(0,(references.get(actor.residentModel)||1)-1));actor.residentModel=undefined;}if(actor.mixer)actor.mixer.stopAllAction();if(actor.skin){actor.g.remove(actor.skin);actor.skin.traverse(o=>{if(o.isMesh){o.geometry.dispose();for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();}});}actor.skin=null;actor.mixer=null;actor.materials=[];actor.combatBones={};actor.procedural.visible=true;trimCache();}

// Brief emissive flash when a fighter is struck.
export function flashCharacter(actor,color=0xff5a2e,amount=1){actor.flash=amount;actor.flashColor=color;}
function updateFlash(actor,dt){if(!actor.materials?.length)return;const f=actor.flash=Math.max(0,(actor.flash||0)-dt*7);for(const m of actor.materials){m.emissive.setHex(actor.flashColor||0xff5a2e);m.emissiveIntensity=f*.9;}}

export function updateCharacter(actor,dt,moving){if(!actor.mixer)return;updateFlash(actor,dt);const desired=actor.hp<=0?'KO':actor.stun>0?'Hit':actor.anim>0?(actor.kind.includes('kick')?'Kick':actor.kind==='special'?'Special':actor.kind==='uppercut'?'Uppercut':actor.kind==='lowcut'?'Lowcut':'Punch'):actor.block?'Block':moving?'Walk':'Idle';if(desired!==actor.skinState||(actor.anim>0&&actor.playedAttack!==actor.attackSequence)){actor.playedAttack=actor.attackSequence;actor.skinTime=0;const next=actor.skinActions.get(desired)||actor.skinActions.get(['Uppercut','Lowcut'].includes(desired)?'Punch':desired)||actor.skinActions.get('Idle')||actor.skinActions.values().next().value;if(next){const previous=actor.skinActions.get(actor.skinState);next.reset().setEffectiveWeight(1).setEffectiveTimeScale(['Punch','Kick','Special'].includes(desired)?1.6:1);const looping=['Idle','Walk','Block'].includes(desired);next.setLoop(looping?T.LoopRepeat:T.LoopOnce,looping?Infinity:1);next.clampWhenFinished=!looping;next.play();if(previous&&previous!==next)previous.crossFadeTo(next,.12,false);}actor.skinState=desired;}actor.skinTime=(actor.skinTime||0)+dt;actor.idleTime=(actor.idleTime||Math.random()*5)+dt;actor.mixer.update(dt);poseHumanoid(actor.skin,actor.g.getWorldQuaternion(new T.Quaternion()),desired,actor.skinTime,actor.idleTime);}

const poseCache=new WeakMap(),_q=new T.Quaternion(),_q2=new T.Quaternion(),_v=new T.Vector3();
// Rotate a bone about a world-space axis, independent of each rig's local bone conventions.
// Bones the clip does not animate are restored to their pre-pose rotation first, so offsets never accumulate.
function turn(bone,...pairs){if(!bone)return;const u=bone.userData;if(u.posed&&bone.quaternion.equals(u.posed))bone.quaternion.copy(u.base);u.base=(u.base||new T.Quaternion()).copy(bone.quaternion);if(pairs.some(([,a])=>Math.abs(a)>1e-4)){const world=bone.getWorldQuaternion(new T.Quaternion());_q.identity();for(const [axis,angle] of pairs)_q.premultiply(new T.Quaternion().setFromAxisAngle(axis,angle));_q.multiply(world);_q2.copy(bone.parent.getWorldQuaternion(new T.Quaternion())).invert().multiply(_q);bone.quaternion.copy(_q2);bone.updateWorldMatrix(false,true);}u.posed=(u.posed||new T.Quaternion()).copy(bone.quaternion);}
export function poseHumanoid(root,orientation,state,time=0,clock=time){if(state==='KO')return;let bones=poseCache.get(root);if(!bones){bones=new Map();root.traverse(o=>{if(o.isBone){for(const n of ['LeftArm','RightArm','LeftForeArm','RightForeArm','LeftHand','RightHand','LeftUpLeg','RightUpLeg','LeftLeg','RightLeg','LeftFoot','RightFoot','Spine','Spine1','Spine2','Head'])if(o.name.endsWith(n)&&!(n==='Spine'&&/Spine\d$/.test(o.name)))bones.set(n,o);}});poseCache.set(root,bones);}root.updateWorldMatrix(true,true);
const up=_v.set(0,1,0).applyQuaternion(orientation).clone(),side=new T.Vector3(1,0,0).applyQuaternion(orientation);
const strike=['Punch','Special','Uppercut','Lowcut'].includes(state),kick=state==='Kick',span=state==='Special'?.46:kick?.34:state==='Uppercut'?.38:.24,pulse=Math.sin(Math.PI*Math.min(1,time/span)),breathe=Math.sin(clock*2.4);
// Torso: fighting lean, punch rotation, kick counter-lean, recoil when hit.
const twist=strike?(state==='Uppercut'?.35:.5)*pulse:state==='Walk'?Math.sin(clock*7.8)*.06:breathe*.025;
const lean=state==='Hit'?-.32*Math.max(0,1-time/.3):kick?-.2*pulse:state==='Block'?.22:state==='Uppercut'?(time<.12?.2:-.15*pulse):strike?.16*pulse+.06:.1+breathe*.015;
const spine=bones.get('Spine1')||bones.get('Spine'),chest=bones.get('Spine2');turn(spine,[up,twist*.6],[side,lean*.55]);turn(chest,[up,twist*.4],[side,lean*.45]);turn(bones.get('Head'),[up,-twist*.6]);
function align(name,childName,direction){const bone=bones.get(name),child=bones.get(childName);if(!bone||!child)return;const p=bone.getWorldPosition(new T.Vector3()),source=child.getWorldPosition(new T.Vector3()).sub(p).normalize(),target=new T.Vector3(...direction).applyQuaternion(orientation).normalize();if(source.lengthSq()<.5)return;const correction=new T.Quaternion().setFromUnitVectors(source,target),world=bone.getWorldQuaternion(new T.Quaternion());correction.multiply(world);const parent=bone.parent.getWorldQuaternion(new T.Quaternion()).invert();bone.quaternion.copy(parent.multiply(correction));bone.updateWorldMatrix(false,true);}
const bounce=state==='Idle'?Math.sin(clock*5.2)*.04:0;
for(const [s,sign] of [['Left',1],['Right',-1]]){const attacking=strike&&s==='Right',lead=s==='Left';
align(s+'Arm',s+'ForeArm',attacking?(state==='Uppercut'?[sign*.05,.6*pulse,.4]:state==='Lowcut'?[sign*.08,-.55,.6]:[sign*.06,-.2+.22*pulse,.7]):state==='Block'?[sign*.35,-.25,.5]:state==='Hit'?[sign*.5,-.7,-.1]:[sign*.28,-.58,lead?.42:.22]);
align(s+'ForeArm',s+'Hand',attacking?(state==='Uppercut'?[0,.9,.15]:[0,-.02,.65]):state==='Block'?[-sign*.18,.75,.12]:state==='Hit'?[sign*.1,-.4,.3]:[-sign*.1,.62+bounce,lead?.42:.3]);
const stride=state==='Walk'?Math.sin(clock*Math.PI*2/.8)*sign*.4:0,stance=state==='Walk'||kick&&s==='Right'?0:lead?.16:-.12;
align(s+'UpLeg',s+'Leg',kick&&s==='Right'?[0,-1+pulse*.85,pulse*.95]:[sign*.07,-1,stride+stance]);
align(s+'Leg',s+'Foot',kick&&s==='Right'?[0,-.7,.45*pulse]:[0,-1,Math.max(0,-stride)*.6+(state==='Idle'||state==='Block'?.06:0)]);}}

export function disposeCharacter(actor){actor.disposed=true;detachCharacter(actor);}
export function encounterSkin(round,wave){const boss=wave===2,n=round*2+wave;return{model:thugModels[n%thugModels.length],tint:thugs[n%thugs.length],strength:.85,width:boss?1.16:1.02,height:boss?1.04:1};}
