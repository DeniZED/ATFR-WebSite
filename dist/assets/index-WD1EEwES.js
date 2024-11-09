import{r as x,a as Ll,u as Fl,L as De,b as co,d as ho,e as se,N as Ul,B as Wl}from"./vendor-DPg5b-u4.js";import{c as Dn}from"./utils-ZqTYg5GA.js";import{R as Hl,L as Vl,C as Bl,X as $l,Y as ql,T as zl,a as Gl}from"./charts-DQY9H18f.js";(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))s(i);new MutationObserver(i=>{for(const r of i)if(r.type==="childList")for(const o of r.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&s(o)}).observe(document,{childList:!0,subtree:!0});function t(i){const r={};return i.integrity&&(r.integrity=i.integrity),i.referrerPolicy&&(r.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?r.credentials="include":i.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function s(i){if(i.ep)return;i.ep=!0;const r=t(i);fetch(i.href,r)}})();var uo={exports:{}},jn={};/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Kl=x,Yl=Symbol.for("react.element"),Ql=Symbol.for("react.fragment"),Jl=Object.prototype.hasOwnProperty,Xl=Kl.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,Zl={key:!0,ref:!0,__self:!0,__source:!0};function fo(n,e,t){var s,i={},r=null,o=null;t!==void 0&&(r=""+t),e.key!==void 0&&(r=""+e.key),e.ref!==void 0&&(o=e.ref);for(s in e)Jl.call(e,s)&&!Zl.hasOwnProperty(s)&&(i[s]=e[s]);if(n&&n.defaultProps)for(s in e=n.defaultProps,e)i[s]===void 0&&(i[s]=e[s]);return{$$typeof:Yl,type:n,key:r,ref:o,props:i,_owner:Xl.current}}jn.Fragment=Ql;jn.jsx=fo;jn.jsxs=fo;uo.exports=jn;var a=uo.exports,po,Bi=Ll;po=Bi.createRoot,Bi.hydrateRoot;/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var ec={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const tc=n=>n.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase().trim(),E=(n,e)=>{const t=x.forwardRef(({color:s="currentColor",size:i=24,strokeWidth:r=2,absoluteStrokeWidth:o,className:l="",children:c,...d},u)=>x.createElement("svg",{ref:u,...ec,width:i,height:i,stroke:s,strokeWidth:o?Number(r)*24/Number(i):r,className:["lucide",`lucide-${tc(n)}`,l].join(" "),...d},[...e.map(([h,f])=>x.createElement(h,f)),...Array.isArray(c)?c:[c]]));return t.displayName=`${n}`,t};/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Hs=E("AlertCircle",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"12",x2:"12",y1:"8",y2:"12",key:"1pkeuh"}],["line",{x1:"12",x2:"12.01",y1:"16",y2:"16",key:"4dfq90"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const mo=E("ArrowRight",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"m12 5 7 7-7 7",key:"xquz4c"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const $i=E("ArrowUpNarrowWide",[["path",{d:"m3 8 4-4 4 4",key:"11wl7u"}],["path",{d:"M7 4v16",key:"1glfcx"}],["path",{d:"M11 12h4",key:"q8tih4"}],["path",{d:"M11 16h7",key:"uosisv"}],["path",{d:"M11 20h10",key:"jvxblo"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const nc=E("Award",[["circle",{cx:"12",cy:"8",r:"6",key:"1vp47v"}],["path",{d:"M15.477 12.89 17 22l-5-3-5 3 1.523-9.11",key:"em7aur"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const sc=E("BarChart3",[["path",{d:"M3 3v18h18",key:"1s2lah"}],["path",{d:"M18 17V9",key:"2bz60n"}],["path",{d:"M13 17V5",key:"1frdt8"}],["path",{d:"M8 17v-3",key:"17ska0"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ic=E("CalendarDays",[["path",{d:"M8 2v4",key:"1cmpym"}],["path",{d:"M16 2v4",key:"4m81vk"}],["rect",{width:"18",height:"18",x:"3",y:"4",rx:"2",key:"1hopcy"}],["path",{d:"M3 10h18",key:"8toen8"}],["path",{d:"M8 14h.01",key:"6423bh"}],["path",{d:"M12 14h.01",key:"1etili"}],["path",{d:"M16 14h.01",key:"1gbofw"}],["path",{d:"M8 18h.01",key:"lrp35t"}],["path",{d:"M12 18h.01",key:"mhygvu"}],["path",{d:"M16 18h.01",key:"kzsmim"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const St=E("Calendar",[["path",{d:"M8 2v4",key:"1cmpym"}],["path",{d:"M16 2v4",key:"4m81vk"}],["rect",{width:"18",height:"18",x:"3",y:"4",rx:"2",key:"1hopcy"}],["path",{d:"M3 10h18",key:"8toen8"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const rc=E("Castle",[["path",{d:"M22 20v-9H2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2Z",key:"109fe4"}],["path",{d:"M18 11V4H6v7",key:"mon5oj"}],["path",{d:"M15 22v-4a3 3 0 0 0-3-3v0a3 3 0 0 0-3 3v4",key:"jdggr9"}],["path",{d:"M22 11V9",key:"3zbp94"}],["path",{d:"M2 11V9",key:"1x5rnq"}],["path",{d:"M6 4V2",key:"1rsq15"}],["path",{d:"M18 4V2",key:"1jsdo1"}],["path",{d:"M10 4V2",key:"75d9ly"}],["path",{d:"M14 4V2",key:"8nj3z6"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Vs=E("CheckCircle",[["path",{d:"M22 11.08V12a10 10 0 1 1-5.93-9.14",key:"g774vq"}],["path",{d:"m9 11 3 3L22 4",key:"1pflzl"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const go=E("Clock",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["polyline",{points:"12 6 12 12 16 14",key:"68esgv"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _o=E("ExternalLink",[["path",{d:"M15 3h6v6",key:"1q9fwt"}],["path",{d:"M10 14 21 3",key:"gplh6r"}],["path",{d:"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",key:"a6xqqp"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const oc=E("EyeOff",[["path",{d:"M9.88 9.88a3 3 0 1 0 4.24 4.24",key:"1jxqfv"}],["path",{d:"M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68",key:"9wicm4"}],["path",{d:"M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61",key:"1jreej"}],["line",{x1:"2",x2:"22",y1:"2",y2:"22",key:"a6p6uj"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ac=E("Eye",[["path",{d:"M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z",key:"rwhkz3"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const lc=E("FileText",[["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",key:"1rqfz7"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"M10 9H8",key:"b1mrlr"}],["path",{d:"M16 13H8",key:"t4e002"}],["path",{d:"M16 17H8",key:"z1uh3a"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const cc=E("Github",[["path",{d:"M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4",key:"tonef"}],["path",{d:"M9 18c-4.51 2-5-2-7-2",key:"9comsn"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const dc=E("History",[["path",{d:"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8",key:"1357e3"}],["path",{d:"M3 3v5h5",key:"1xhq8a"}],["path",{d:"M12 7v5l4 2",key:"1fdv2h"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ys=E("Loader2",[["path",{d:"M21 12a9 9 0 1 1-6.219-8.56",key:"13zald"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const hc=E("Lock",[["rect",{width:"18",height:"11",x:"3",y:"11",rx:"2",ry:"2",key:"1w4ew1"}],["path",{d:"M7 11V7a5 5 0 0 1 10 0v4",key:"fwvmzm"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const uc=E("LogOut",[["path",{d:"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4",key:"1uf3rs"}],["polyline",{points:"16 17 21 12 16 7",key:"1gabdz"}],["line",{x1:"21",x2:"9",y1:"12",y2:"12",key:"1uyos4"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const vo=E("MapPin",[["path",{d:"M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z",key:"2oe9fu"}],["circle",{cx:"12",cy:"10",r:"3",key:"ilqhr7"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const yo=E("Menu",[["line",{x1:"4",x2:"20",y1:"12",y2:"12",key:"1e0a9i"}],["line",{x1:"4",x2:"20",y1:"6",y2:"6",key:"1owob3"}],["line",{x1:"4",x2:"20",y1:"18",y2:"18",key:"yk5zj1"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Bs=E("MessageCircle",[["path",{d:"M7.9 20A9 9 0 1 0 4 16.1L2 22Z",key:"vv11sd"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const fc=E("Plus",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const qi=E("RefreshCw",[["path",{d:"M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8",key:"v9h5vc"}],["path",{d:"M21 3v5h-5",key:"1q7to0"}],["path",{d:"M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16",key:"3uifl3"}],["path",{d:"M8 16H3v5",key:"1cv678"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const pc=E("Save",[["path",{d:"M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z",key:"1owoqh"}],["polyline",{points:"17 21 17 13 7 13 7 21",key:"1md35c"}],["polyline",{points:"7 3 7 8 15 8",key:"8nz8an"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Mn=E("Search",[["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}],["path",{d:"m21 21-4.3-4.3",key:"1qie3q"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const mc=E("Settings",[["path",{d:"M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z",key:"1qme2f"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ee=E("Shield",[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const zi=E("Star",[["polygon",{points:"12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2",key:"8f66p6"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const $s=E("Swords",[["polyline",{points:"14.5 17.5 3 6 3 3 6 3 17.5 14.5",key:"1hfsw2"}],["line",{x1:"13",x2:"19",y1:"19",y2:"13",key:"1vrmhu"}],["line",{x1:"16",x2:"20",y1:"16",y2:"20",key:"1bron3"}],["line",{x1:"19",x2:"21",y1:"21",y2:"19",key:"13pww6"}],["polyline",{points:"14.5 6.5 18 3 21 3 21 6 17.5 9.5",key:"hbey2j"}],["line",{x1:"5",x2:"9",y1:"14",y2:"18",key:"1hf58s"}],["line",{x1:"7",x2:"4",y1:"17",y2:"20",key:"pidxm4"}],["line",{x1:"3",x2:"5",y1:"19",y2:"21",key:"1pehsh"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ln=E("Target",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["circle",{cx:"12",cy:"12",r:"6",key:"1vlfrh"}],["circle",{cx:"12",cy:"12",r:"2",key:"1c9p78"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const wo=E("Timer",[["line",{x1:"10",x2:"14",y1:"2",y2:"2",key:"14vaq8"}],["line",{x1:"12",x2:"15",y1:"14",y2:"11",key:"17fdiu"}],["circle",{cx:"12",cy:"14",r:"8",key:"1e1u0o"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const qs=E("Trash2",[["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6",key:"4alrt4"}],["path",{d:"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2",key:"v07s0e"}],["line",{x1:"10",x2:"10",y1:"11",y2:"17",key:"1uufr5"}],["line",{x1:"14",x2:"14",y1:"11",y2:"17",key:"xtxkd"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Le=E("Trophy",[["path",{d:"M6 9H4.5a2.5 2.5 0 0 1 0-5H6",key:"17hqa7"}],["path",{d:"M18 9h1.5a2.5 2.5 0 0 0 0-5H18",key:"lmptdp"}],["path",{d:"M4 22h16",key:"57wxv0"}],["path",{d:"M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22",key:"1nw9bq"}],["path",{d:"M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22",key:"1np0yb"}],["path",{d:"M18 2H6v7a6 6 0 0 0 12 0V2Z",key:"u46fv3"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const gc=E("UserMinus",[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["line",{x1:"22",x2:"16",y1:"11",y2:"11",key:"1shjgl"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _c=E("UserPlus",[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["line",{x1:"19",x2:"19",y1:"8",y2:"14",key:"1bvyxn"}],["line",{x1:"22",x2:"16",y1:"11",y2:"11",key:"1shjgl"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Fn=E("Users",[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["path",{d:"M22 21v-2a4 4 0 0 0-3-3.87",key:"kshegd"}],["path",{d:"M16 3.13a4 4 0 0 1 0 7.75",key:"1da9ce"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const vc=E("XCircle",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m15 9-6 6",key:"1uzhvr"}],["path",{d:"m9 9 6 6",key:"z0biqf"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Un=E("X",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const yc=E("Youtube",[["path",{d:"M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17",key:"1q2vi4"}],["path",{d:"m10 15 5-3-5-3z",key:"1jp15x"}]]);function wc({videoUrl:n,children:e}){return a.jsxs("div",{className:"relative min-h-screen",children:[a.jsx("video",{autoPlay:!0,loop:!0,muted:!0,playsInline:!0,className:"absolute inset-0 w-full h-full object-cover",children:a.jsx("source",{src:n,type:"video/webm"})}),a.jsx("div",{className:"absolute inset-0 bg-black bg-opacity-60"}),a.jsx("div",{className:"relative z-10 text-white",children:e})]})}function bc(){return a.jsx(wc,{videoUrl:"https://wgsw-eu.gcdn.co/wgsw_media/video/wot/wmcs-50835_wot_discover_an_army_of_war_machines_out.mp4",children:a.jsx("div",{className:"min-h-screen flex items-center justify-center text-center px-4",children:a.jsxs("div",{className:"max-w-4xl bg-wot-darker/80 backdrop-blur-sm p-12 border border-wot-gold/20",children:[a.jsxs("div",{className:"flex flex-col items-center justify-center mb-8",children:[a.jsx("img",{src:"https://eu.wargaming.net/clans/media/clans/emblems/cl_501/500191501/emblem_195x195.png",alt:"ATFR Clan Logo",className:"w-48 h-48 mb-6 drop-shadow-[0_0_15px_rgba(244,178,35,0.3)]"}),a.jsx("h1",{className:"text-8xl font-bold text-wot-gold text-shadow-gold tracking-wider",children:"ATFR"})]}),a.jsxs("div",{className:"flex items-center justify-center gap-3 mb-8",children:[a.jsx(zi,{className:"h-5 w-5 text-wot-goldLight",strokeWidth:1.5}),a.jsx("p",{className:"text-2xl text-wot-white uppercase tracking-widest",children:"Clan World Of Tanks"}),a.jsx(zi,{className:"h-5 w-5 text-wot-goldLight",strokeWidth:1.5})]}),a.jsx("p",{className:"text-xl mb-12 text-wot-light/90 max-w-2xl mx-auto",children:"Clan français parmi les plus actifs du moment"}),a.jsxs("div",{className:"flex justify-center gap-6",children:[a.jsxs("a",{href:"#about",className:"btn-primary clip-diagonal",children:["Découvrir",a.jsx(mo,{className:"ml-2 h-5 w-5",strokeWidth:1.5})]}),a.jsx("a",{href:"#join",className:"btn-secondary",children:"Nous Rejoindre"})]})]})})})}var Gi={};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const bo={NODE_CLIENT:!1,NODE_ADMIN:!1,SDK_VERSION:"${JSCORE_VERSION}"};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const m=function(n,e){if(!n)throw ct(e)},ct=function(n){return new Error("Firebase Database ("+bo.SDK_VERSION+") INTERNAL ASSERT FAILED: "+n)};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const xo=function(n){const e=[];let t=0;for(let s=0;s<n.length;s++){let i=n.charCodeAt(s);i<128?e[t++]=i:i<2048?(e[t++]=i>>6|192,e[t++]=i&63|128):(i&64512)===55296&&s+1<n.length&&(n.charCodeAt(s+1)&64512)===56320?(i=65536+((i&1023)<<10)+(n.charCodeAt(++s)&1023),e[t++]=i>>18|240,e[t++]=i>>12&63|128,e[t++]=i>>6&63|128,e[t++]=i&63|128):(e[t++]=i>>12|224,e[t++]=i>>6&63|128,e[t++]=i&63|128)}return e},xc=function(n){const e=[];let t=0,s=0;for(;t<n.length;){const i=n[t++];if(i<128)e[s++]=String.fromCharCode(i);else if(i>191&&i<224){const r=n[t++];e[s++]=String.fromCharCode((i&31)<<6|r&63)}else if(i>239&&i<365){const r=n[t++],o=n[t++],l=n[t++],c=((i&7)<<18|(r&63)<<12|(o&63)<<6|l&63)-65536;e[s++]=String.fromCharCode(55296+(c>>10)),e[s++]=String.fromCharCode(56320+(c&1023))}else{const r=n[t++],o=n[t++];e[s++]=String.fromCharCode((i&15)<<12|(r&63)<<6|o&63)}}return e.join("")},zs={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(n,e){if(!Array.isArray(n))throw Error("encodeByteArray takes an array as a parameter");this.init_();const t=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,s=[];for(let i=0;i<n.length;i+=3){const r=n[i],o=i+1<n.length,l=o?n[i+1]:0,c=i+2<n.length,d=c?n[i+2]:0,u=r>>2,h=(r&3)<<4|l>>4;let f=(l&15)<<2|d>>6,g=d&63;c||(g=64,o||(f=64)),s.push(t[u],t[h],t[f],t[g])}return s.join("")},encodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(n):this.encodeByteArray(xo(n),e)},decodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(n):xc(this.decodeStringToByteArray(n,e))},decodeStringToByteArray(n,e){this.init_();const t=e?this.charToByteMapWebSafe_:this.charToByteMap_,s=[];for(let i=0;i<n.length;){const r=t[n.charAt(i++)],l=i<n.length?t[n.charAt(i)]:0;++i;const d=i<n.length?t[n.charAt(i)]:64;++i;const h=i<n.length?t[n.charAt(i)]:64;if(++i,r==null||l==null||d==null||h==null)throw new Ec;const f=r<<2|l>>4;if(s.push(f),d!==64){const g=l<<4&240|d>>2;if(s.push(g),h!==64){const _=d<<6&192|h;s.push(_)}}}return s},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let n=0;n<this.ENCODED_VALS.length;n++)this.byteToCharMap_[n]=this.ENCODED_VALS.charAt(n),this.charToByteMap_[this.byteToCharMap_[n]]=n,this.byteToCharMapWebSafe_[n]=this.ENCODED_VALS_WEBSAFE.charAt(n),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[n]]=n,n>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(n)]=n,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(n)]=n)}}};class Ec extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const Eo=function(n){const e=xo(n);return zs.encodeByteArray(e,!0)},hn=function(n){return Eo(n).replace(/\./g,"")},un=function(n){try{return zs.decodeString(n,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ic(n){return Io(void 0,n)}function Io(n,e){if(!(e instanceof Object))return e;switch(e.constructor){case Date:const t=e;return new Date(t.getTime());case Object:n===void 0&&(n={});break;case Array:n=[];break;default:return e}for(const t in e)!e.hasOwnProperty(t)||!Cc(t)||(n[t]=Io(n[t],e[t]));return n}function Cc(n){return n!=="__proto__"}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Nc(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const kc=()=>Nc().__FIREBASE_DEFAULTS__,Tc=()=>{if(typeof process>"u"||typeof Gi>"u")return;const n=Gi.__FIREBASE_DEFAULTS__;if(n)return JSON.parse(n)},Sc=()=>{if(typeof document>"u")return;let n;try{n=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=n&&un(n[1]);return e&&JSON.parse(e)},Gs=()=>{try{return kc()||Tc()||Sc()}catch(n){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${n}`);return}},Co=n=>{var e,t;return(t=(e=Gs())===null||e===void 0?void 0:e.emulatorHosts)===null||t===void 0?void 0:t[n]},Rc=n=>{const e=Co(n);if(!e)return;const t=e.lastIndexOf(":");if(t<=0||t+1===e.length)throw new Error(`Invalid host ${e} with no separate hostname and port!`);const s=parseInt(e.substring(t+1),10);return e[0]==="["?[e.substring(1,t-1),s]:[e.substring(0,t),s]},No=()=>{var n;return(n=Gs())===null||n===void 0?void 0:n.config},ko=n=>{var e;return(e=Gs())===null||e===void 0?void 0:e[`_${n}`]};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Wn{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}wrapCallback(e){return(t,s)=>{t?this.reject(t):this.resolve(s),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(t):e(t,s))}}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ac(n,e){if(n.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const t={alg:"none",type:"JWT"},s=e||"demo-project",i=n.iat||0,r=n.sub||n.user_id;if(!r)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const o=Object.assign({iss:`https://securetoken.google.com/${s}`,aud:s,iat:i,exp:i+3600,auth_time:i,sub:r,user_id:r,firebase:{sign_in_provider:"custom",identities:{}}},n);return[hn(JSON.stringify(t)),hn(JSON.stringify(o)),""].join(".")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function z(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function Ks(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(z())}function Pc(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function Oc(){const n=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof n=="object"&&n.id!==void 0}function To(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function Dc(){const n=z();return n.indexOf("MSIE ")>=0||n.indexOf("Trident/")>=0}function So(){return bo.NODE_ADMIN===!0}function jc(){try{return typeof indexedDB=="object"}catch{return!1}}function Mc(){return new Promise((n,e)=>{try{let t=!0;const s="validate-browser-context-for-indexeddb-analytics-module",i=self.indexedDB.open(s);i.onsuccess=()=>{i.result.close(),t||self.indexedDB.deleteDatabase(s),n(!0)},i.onupgradeneeded=()=>{t=!1},i.onerror=()=>{var r;e(((r=i.error)===null||r===void 0?void 0:r.message)||"")}}catch(t){e(t)}})}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Lc="FirebaseError";class Ae extends Error{constructor(e,t,s){super(t),this.code=e,this.customData=s,this.name=Lc,Object.setPrototypeOf(this,Ae.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,Vt.prototype.create)}}class Vt{constructor(e,t,s){this.service=e,this.serviceName=t,this.errors=s}create(e,...t){const s=t[0]||{},i=`${this.service}/${e}`,r=this.errors[e],o=r?Fc(r,s):"Error",l=`${this.serviceName}: ${o} (${i}).`;return new Ae(i,l,s)}}function Fc(n,e){return n.replace(Uc,(t,s)=>{const i=e[s];return i!=null?String(i):`<${s}?>`})}const Uc=/\{\$([^}]+)}/g;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Rt(n){return JSON.parse(n)}function H(n){return JSON.stringify(n)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ro=function(n){let e={},t={},s={},i="";try{const r=n.split(".");e=Rt(un(r[0])||""),t=Rt(un(r[1])||""),i=r[2],s=t.d||{},delete t.d}catch{}return{header:e,claims:t,data:s,signature:i}},Wc=function(n){const e=Ro(n),t=e.claims;return!!t&&typeof t=="object"&&t.hasOwnProperty("iat")},Hc=function(n){const e=Ro(n).claims;return typeof e=="object"&&e.admin===!0};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function _e(n,e){return Object.prototype.hasOwnProperty.call(n,e)}function st(n,e){if(Object.prototype.hasOwnProperty.call(n,e))return n[e]}function ws(n){for(const e in n)if(Object.prototype.hasOwnProperty.call(n,e))return!1;return!0}function fn(n,e,t){const s={};for(const i in n)Object.prototype.hasOwnProperty.call(n,i)&&(s[i]=e.call(t,n[i],i,n));return s}function pn(n,e){if(n===e)return!0;const t=Object.keys(n),s=Object.keys(e);for(const i of t){if(!s.includes(i))return!1;const r=n[i],o=e[i];if(Ki(r)&&Ki(o)){if(!pn(r,o))return!1}else if(r!==o)return!1}for(const i of s)if(!t.includes(i))return!1;return!0}function Ki(n){return n!==null&&typeof n=="object"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function dt(n){const e=[];for(const[t,s]of Object.entries(n))Array.isArray(s)?s.forEach(i=>{e.push(encodeURIComponent(t)+"="+encodeURIComponent(i))}):e.push(encodeURIComponent(t)+"="+encodeURIComponent(s));return e.length?"&"+e.join("&"):""}function bt(n){const e={};return n.replace(/^\?/,"").split("&").forEach(s=>{if(s){const[i,r]=s.split("=");e[decodeURIComponent(i)]=decodeURIComponent(r)}}),e}function xt(n){const e=n.indexOf("?");if(!e)return"";const t=n.indexOf("#",e);return n.substring(e,t>0?t:void 0)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Vc{constructor(){this.chain_=[],this.buf_=[],this.W_=[],this.pad_=[],this.inbuf_=0,this.total_=0,this.blockSize=512/8,this.pad_[0]=128;for(let e=1;e<this.blockSize;++e)this.pad_[e]=0;this.reset()}reset(){this.chain_[0]=1732584193,this.chain_[1]=4023233417,this.chain_[2]=2562383102,this.chain_[3]=271733878,this.chain_[4]=3285377520,this.inbuf_=0,this.total_=0}compress_(e,t){t||(t=0);const s=this.W_;if(typeof e=="string")for(let h=0;h<16;h++)s[h]=e.charCodeAt(t)<<24|e.charCodeAt(t+1)<<16|e.charCodeAt(t+2)<<8|e.charCodeAt(t+3),t+=4;else for(let h=0;h<16;h++)s[h]=e[t]<<24|e[t+1]<<16|e[t+2]<<8|e[t+3],t+=4;for(let h=16;h<80;h++){const f=s[h-3]^s[h-8]^s[h-14]^s[h-16];s[h]=(f<<1|f>>>31)&4294967295}let i=this.chain_[0],r=this.chain_[1],o=this.chain_[2],l=this.chain_[3],c=this.chain_[4],d,u;for(let h=0;h<80;h++){h<40?h<20?(d=l^r&(o^l),u=1518500249):(d=r^o^l,u=1859775393):h<60?(d=r&o|l&(r|o),u=2400959708):(d=r^o^l,u=3395469782);const f=(i<<5|i>>>27)+d+c+u+s[h]&4294967295;c=l,l=o,o=(r<<30|r>>>2)&4294967295,r=i,i=f}this.chain_[0]=this.chain_[0]+i&4294967295,this.chain_[1]=this.chain_[1]+r&4294967295,this.chain_[2]=this.chain_[2]+o&4294967295,this.chain_[3]=this.chain_[3]+l&4294967295,this.chain_[4]=this.chain_[4]+c&4294967295}update(e,t){if(e==null)return;t===void 0&&(t=e.length);const s=t-this.blockSize;let i=0;const r=this.buf_;let o=this.inbuf_;for(;i<t;){if(o===0)for(;i<=s;)this.compress_(e,i),i+=this.blockSize;if(typeof e=="string"){for(;i<t;)if(r[o]=e.charCodeAt(i),++o,++i,o===this.blockSize){this.compress_(r),o=0;break}}else for(;i<t;)if(r[o]=e[i],++o,++i,o===this.blockSize){this.compress_(r),o=0;break}}this.inbuf_=o,this.total_+=t}digest(){const e=[];let t=this.total_*8;this.inbuf_<56?this.update(this.pad_,56-this.inbuf_):this.update(this.pad_,this.blockSize-(this.inbuf_-56));for(let i=this.blockSize-1;i>=56;i--)this.buf_[i]=t&255,t/=256;this.compress_(this.buf_);let s=0;for(let i=0;i<5;i++)for(let r=24;r>=0;r-=8)e[s]=this.chain_[i]>>r&255,++s;return e}}function Bc(n,e){const t=new $c(n,e);return t.subscribe.bind(t)}class $c{constructor(e,t){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=t,this.task.then(()=>{e(this)}).catch(s=>{this.error(s)})}next(e){this.forEachObserver(t=>{t.next(e)})}error(e){this.forEachObserver(t=>{t.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,t,s){let i;if(e===void 0&&t===void 0&&s===void 0)throw new Error("Missing Observer.");qc(e,["next","error","complete"])?i=e:i={next:e,error:t,complete:s},i.next===void 0&&(i.next=ts),i.error===void 0&&(i.error=ts),i.complete===void 0&&(i.complete=ts);const r=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?i.error(this.finalError):i.complete()}catch{}}),this.observers.push(i),r}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let t=0;t<this.observers.length;t++)this.sendOne(t,e)}sendOne(e,t){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{t(this.observers[e])}catch(s){typeof console<"u"&&console.error&&console.error(s)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function qc(n,e){if(typeof n!="object"||n===null)return!1;for(const t of e)if(t in n&&typeof n[t]=="function")return!0;return!1}function ts(){}function Ys(n,e){return`${n} failed: ${e} argument `}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const zc=function(n){const e=[];let t=0;for(let s=0;s<n.length;s++){let i=n.charCodeAt(s);if(i>=55296&&i<=56319){const r=i-55296;s++,m(s<n.length,"Surrogate pair missing trail surrogate.");const o=n.charCodeAt(s)-56320;i=65536+(r<<10)+o}i<128?e[t++]=i:i<2048?(e[t++]=i>>6|192,e[t++]=i&63|128):i<65536?(e[t++]=i>>12|224,e[t++]=i>>6&63|128,e[t++]=i&63|128):(e[t++]=i>>18|240,e[t++]=i>>12&63|128,e[t++]=i>>6&63|128,e[t++]=i&63|128)}return e},Hn=function(n){let e=0;for(let t=0;t<n.length;t++){const s=n.charCodeAt(t);s<128?e++:s<2048?e+=2:s>=55296&&s<=56319?(e+=4,t++):e+=3}return e};/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function G(n){return n&&n._delegate?n._delegate:n}class We{constructor(e,t,s){this.name=e,this.instanceFactory=t,this.type=s,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const je="[DEFAULT]";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Gc{constructor(e,t){this.name=e,this.container=t,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const t=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(t)){const s=new Wn;if(this.instancesDeferred.set(t,s),this.isInitialized(t)||this.shouldAutoInitialize())try{const i=this.getOrInitializeService({instanceIdentifier:t});i&&s.resolve(i)}catch{}}return this.instancesDeferred.get(t).promise}getImmediate(e){var t;const s=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),i=(t=e==null?void 0:e.optional)!==null&&t!==void 0?t:!1;if(this.isInitialized(s)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:s})}catch(r){if(i)return null;throw r}else{if(i)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(Yc(e))try{this.getOrInitializeService({instanceIdentifier:je})}catch{}for(const[t,s]of this.instancesDeferred.entries()){const i=this.normalizeInstanceIdentifier(t);try{const r=this.getOrInitializeService({instanceIdentifier:i});s.resolve(r)}catch{}}}}clearInstance(e=je){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(t=>"INTERNAL"in t).map(t=>t.INTERNAL.delete()),...e.filter(t=>"_delete"in t).map(t=>t._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=je){return this.instances.has(e)}getOptions(e=je){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:t={}}=e,s=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(s))throw Error(`${this.name}(${s}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const i=this.getOrInitializeService({instanceIdentifier:s,options:t});for(const[r,o]of this.instancesDeferred.entries()){const l=this.normalizeInstanceIdentifier(r);s===l&&o.resolve(i)}return i}onInit(e,t){var s;const i=this.normalizeInstanceIdentifier(t),r=(s=this.onInitCallbacks.get(i))!==null&&s!==void 0?s:new Set;r.add(e),this.onInitCallbacks.set(i,r);const o=this.instances.get(i);return o&&e(o,i),()=>{r.delete(e)}}invokeOnInitCallbacks(e,t){const s=this.onInitCallbacks.get(t);if(s)for(const i of s)try{i(e,t)}catch{}}getOrInitializeService({instanceIdentifier:e,options:t={}}){let s=this.instances.get(e);if(!s&&this.component&&(s=this.component.instanceFactory(this.container,{instanceIdentifier:Kc(e),options:t}),this.instances.set(e,s),this.instancesOptions.set(e,t),this.invokeOnInitCallbacks(s,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,s)}catch{}return s||null}normalizeInstanceIdentifier(e=je){return this.component?this.component.multipleInstances?e:je:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function Kc(n){return n===je?void 0:n}function Yc(n){return n.instantiationMode==="EAGER"}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qc{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const t=this.getProvider(e.name);if(t.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);t.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const t=new Gc(e,this);return this.providers.set(e,t),t}getProviders(){return Array.from(this.providers.values())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var R;(function(n){n[n.DEBUG=0]="DEBUG",n[n.VERBOSE=1]="VERBOSE",n[n.INFO=2]="INFO",n[n.WARN=3]="WARN",n[n.ERROR=4]="ERROR",n[n.SILENT=5]="SILENT"})(R||(R={}));const Jc={debug:R.DEBUG,verbose:R.VERBOSE,info:R.INFO,warn:R.WARN,error:R.ERROR,silent:R.SILENT},Xc=R.INFO,Zc={[R.DEBUG]:"log",[R.VERBOSE]:"log",[R.INFO]:"info",[R.WARN]:"warn",[R.ERROR]:"error"},ed=(n,e,...t)=>{if(e<n.logLevel)return;const s=new Date().toISOString(),i=Zc[e];if(i)console[i](`[${s}]  ${n.name}:`,...t);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class Qs{constructor(e){this.name=e,this._logLevel=Xc,this._logHandler=ed,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in R))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?Jc[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,R.DEBUG,...e),this._logHandler(this,R.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,R.VERBOSE,...e),this._logHandler(this,R.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,R.INFO,...e),this._logHandler(this,R.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,R.WARN,...e),this._logHandler(this,R.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,R.ERROR,...e),this._logHandler(this,R.ERROR,...e)}}const td=(n,e)=>e.some(t=>n instanceof t);let Yi,Qi;function nd(){return Yi||(Yi=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function sd(){return Qi||(Qi=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const Ao=new WeakMap,bs=new WeakMap,Po=new WeakMap,ns=new WeakMap,Js=new WeakMap;function id(n){const e=new Promise((t,s)=>{const i=()=>{n.removeEventListener("success",r),n.removeEventListener("error",o)},r=()=>{t(Ie(n.result)),i()},o=()=>{s(n.error),i()};n.addEventListener("success",r),n.addEventListener("error",o)});return e.then(t=>{t instanceof IDBCursor&&Ao.set(t,n)}).catch(()=>{}),Js.set(e,n),e}function rd(n){if(bs.has(n))return;const e=new Promise((t,s)=>{const i=()=>{n.removeEventListener("complete",r),n.removeEventListener("error",o),n.removeEventListener("abort",o)},r=()=>{t(),i()},o=()=>{s(n.error||new DOMException("AbortError","AbortError")),i()};n.addEventListener("complete",r),n.addEventListener("error",o),n.addEventListener("abort",o)});bs.set(n,e)}let xs={get(n,e,t){if(n instanceof IDBTransaction){if(e==="done")return bs.get(n);if(e==="objectStoreNames")return n.objectStoreNames||Po.get(n);if(e==="store")return t.objectStoreNames[1]?void 0:t.objectStore(t.objectStoreNames[0])}return Ie(n[e])},set(n,e,t){return n[e]=t,!0},has(n,e){return n instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in n}};function od(n){xs=n(xs)}function ad(n){return n===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...t){const s=n.call(ss(this),e,...t);return Po.set(s,e.sort?e.sort():[e]),Ie(s)}:sd().includes(n)?function(...e){return n.apply(ss(this),e),Ie(Ao.get(this))}:function(...e){return Ie(n.apply(ss(this),e))}}function ld(n){return typeof n=="function"?ad(n):(n instanceof IDBTransaction&&rd(n),td(n,nd())?new Proxy(n,xs):n)}function Ie(n){if(n instanceof IDBRequest)return id(n);if(ns.has(n))return ns.get(n);const e=ld(n);return e!==n&&(ns.set(n,e),Js.set(e,n)),e}const ss=n=>Js.get(n);function cd(n,e,{blocked:t,upgrade:s,blocking:i,terminated:r}={}){const o=indexedDB.open(n,e),l=Ie(o);return s&&o.addEventListener("upgradeneeded",c=>{s(Ie(o.result),c.oldVersion,c.newVersion,Ie(o.transaction),c)}),t&&o.addEventListener("blocked",c=>t(c.oldVersion,c.newVersion,c)),l.then(c=>{r&&c.addEventListener("close",()=>r()),i&&c.addEventListener("versionchange",d=>i(d.oldVersion,d.newVersion,d))}).catch(()=>{}),l}const dd=["get","getKey","getAll","getAllKeys","count"],hd=["put","add","delete","clear"],is=new Map;function Ji(n,e){if(!(n instanceof IDBDatabase&&!(e in n)&&typeof e=="string"))return;if(is.get(e))return is.get(e);const t=e.replace(/FromIndex$/,""),s=e!==t,i=hd.includes(t);if(!(t in(s?IDBIndex:IDBObjectStore).prototype)||!(i||dd.includes(t)))return;const r=async function(o,...l){const c=this.transaction(o,i?"readwrite":"readonly");let d=c.store;return s&&(d=d.index(l.shift())),(await Promise.all([d[t](...l),i&&c.done]))[0]};return is.set(e,r),r}od(n=>({...n,get:(e,t,s)=>Ji(e,t)||n.get(e,t,s),has:(e,t)=>!!Ji(e,t)||n.has(e,t)}));/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ud{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(t=>{if(fd(t)){const s=t.getImmediate();return`${s.library}/${s.version}`}else return null}).filter(t=>t).join(" ")}}function fd(n){const e=n.getComponent();return(e==null?void 0:e.type)==="VERSION"}const Es="@firebase/app",Xi="0.10.13";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const fe=new Qs("@firebase/app"),pd="@firebase/app-compat",md="@firebase/analytics-compat",gd="@firebase/analytics",_d="@firebase/app-check-compat",vd="@firebase/app-check",yd="@firebase/auth",wd="@firebase/auth-compat",bd="@firebase/database",xd="@firebase/data-connect",Ed="@firebase/database-compat",Id="@firebase/functions",Cd="@firebase/functions-compat",Nd="@firebase/installations",kd="@firebase/installations-compat",Td="@firebase/messaging",Sd="@firebase/messaging-compat",Rd="@firebase/performance",Ad="@firebase/performance-compat",Pd="@firebase/remote-config",Od="@firebase/remote-config-compat",Dd="@firebase/storage",jd="@firebase/storage-compat",Md="@firebase/firestore",Ld="@firebase/vertexai-preview",Fd="@firebase/firestore-compat",Ud="firebase",Wd="10.14.1";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Is="[DEFAULT]",Hd={[Es]:"fire-core",[pd]:"fire-core-compat",[gd]:"fire-analytics",[md]:"fire-analytics-compat",[vd]:"fire-app-check",[_d]:"fire-app-check-compat",[yd]:"fire-auth",[wd]:"fire-auth-compat",[bd]:"fire-rtdb",[xd]:"fire-data-connect",[Ed]:"fire-rtdb-compat",[Id]:"fire-fn",[Cd]:"fire-fn-compat",[Nd]:"fire-iid",[kd]:"fire-iid-compat",[Td]:"fire-fcm",[Sd]:"fire-fcm-compat",[Rd]:"fire-perf",[Ad]:"fire-perf-compat",[Pd]:"fire-rc",[Od]:"fire-rc-compat",[Dd]:"fire-gcs",[jd]:"fire-gcs-compat",[Md]:"fire-fst",[Fd]:"fire-fst-compat",[Ld]:"fire-vertex","fire-js":"fire-js",[Ud]:"fire-js-all"};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const mn=new Map,Vd=new Map,Cs=new Map;function Zi(n,e){try{n.container.addComponent(e)}catch(t){fe.debug(`Component ${e.name} failed to register with FirebaseApp ${n.name}`,t)}}function it(n){const e=n.name;if(Cs.has(e))return fe.debug(`There were multiple attempts to register component ${e}.`),!1;Cs.set(e,n);for(const t of mn.values())Zi(t,n);for(const t of Vd.values())Zi(t,n);return!0}function Xs(n,e){const t=n.container.getProvider("heartbeat").getImmediate({optional:!0});return t&&t.triggerHeartbeat(),n.container.getProvider(e)}function ae(n){return n.settings!==void 0}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Bd={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},Ce=new Vt("app","Firebase",Bd);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $d{constructor(e,t,s){this._isDeleted=!1,this._options=Object.assign({},e),this._config=Object.assign({},t),this._name=t.name,this._automaticDataCollectionEnabled=t.automaticDataCollectionEnabled,this._container=s,this.container.addComponent(new We("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw Ce.create("app-deleted",{appName:this._name})}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ht=Wd;function Oo(n,e={}){let t=n;typeof e!="object"&&(e={name:e});const s=Object.assign({name:Is,automaticDataCollectionEnabled:!1},e),i=s.name;if(typeof i!="string"||!i)throw Ce.create("bad-app-name",{appName:String(i)});if(t||(t=No()),!t)throw Ce.create("no-options");const r=mn.get(i);if(r){if(pn(t,r.options)&&pn(s,r.config))return r;throw Ce.create("duplicate-app",{appName:i})}const o=new Qc(i);for(const c of Cs.values())o.addComponent(c);const l=new $d(t,s,o);return mn.set(i,l),l}function Do(n=Is){const e=mn.get(n);if(!e&&n===Is&&No())return Oo();if(!e)throw Ce.create("no-app",{appName:n});return e}function Ne(n,e,t){var s;let i=(s=Hd[n])!==null&&s!==void 0?s:n;t&&(i+=`-${t}`);const r=i.match(/\s|\//),o=e.match(/\s|\//);if(r||o){const l=[`Unable to register library "${i}" with version "${e}":`];r&&l.push(`library name "${i}" contains illegal characters (whitespace or "/")`),r&&o&&l.push("and"),o&&l.push(`version name "${e}" contains illegal characters (whitespace or "/")`),fe.warn(l.join(" "));return}it(new We(`${i}-version`,()=>({library:i,version:e}),"VERSION"))}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const qd="firebase-heartbeat-database",zd=1,At="firebase-heartbeat-store";let rs=null;function jo(){return rs||(rs=cd(qd,zd,{upgrade:(n,e)=>{switch(e){case 0:try{n.createObjectStore(At)}catch(t){console.warn(t)}}}}).catch(n=>{throw Ce.create("idb-open",{originalErrorMessage:n.message})})),rs}async function Gd(n){try{const t=(await jo()).transaction(At),s=await t.objectStore(At).get(Mo(n));return await t.done,s}catch(e){if(e instanceof Ae)fe.warn(e.message);else{const t=Ce.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});fe.warn(t.message)}}}async function er(n,e){try{const s=(await jo()).transaction(At,"readwrite");await s.objectStore(At).put(e,Mo(n)),await s.done}catch(t){if(t instanceof Ae)fe.warn(t.message);else{const s=Ce.create("idb-set",{originalErrorMessage:t==null?void 0:t.message});fe.warn(s.message)}}}function Mo(n){return`${n.name}!${n.options.appId}`}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Kd=1024,Yd=30*24*60*60*1e3;class Qd{constructor(e){this.container=e,this._heartbeatsCache=null;const t=this.container.getProvider("app").getImmediate();this._storage=new Xd(t),this._heartbeatsCachePromise=this._storage.read().then(s=>(this._heartbeatsCache=s,s))}async triggerHeartbeat(){var e,t;try{const i=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),r=tr();return((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((t=this._heartbeatsCache)===null||t===void 0?void 0:t.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===r||this._heartbeatsCache.heartbeats.some(o=>o.date===r)?void 0:(this._heartbeatsCache.heartbeats.push({date:r,agent:i}),this._heartbeatsCache.heartbeats=this._heartbeatsCache.heartbeats.filter(o=>{const l=new Date(o.date).valueOf();return Date.now()-l<=Yd}),this._storage.overwrite(this._heartbeatsCache))}catch(s){fe.warn(s)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const t=tr(),{heartbeatsToSend:s,unsentEntries:i}=Jd(this._heartbeatsCache.heartbeats),r=hn(JSON.stringify({version:2,heartbeats:s}));return this._heartbeatsCache.lastSentHeartbeatDate=t,i.length>0?(this._heartbeatsCache.heartbeats=i,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),r}catch(t){return fe.warn(t),""}}}function tr(){return new Date().toISOString().substring(0,10)}function Jd(n,e=Kd){const t=[];let s=n.slice();for(const i of n){const r=t.find(o=>o.agent===i.agent);if(r){if(r.dates.push(i.date),nr(t)>e){r.dates.pop();break}}else if(t.push({agent:i.agent,dates:[i.date]}),nr(t)>e){t.pop();break}s=s.slice(1)}return{heartbeatsToSend:t,unsentEntries:s}}class Xd{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return jc()?Mc().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const t=await Gd(this.app);return t!=null&&t.heartbeats?t:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){var t;if(await this._canUseIndexedDBPromise){const i=await this.read();return er(this.app,{lastSentHeartbeatDate:(t=e.lastSentHeartbeatDate)!==null&&t!==void 0?t:i.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){var t;if(await this._canUseIndexedDBPromise){const i=await this.read();return er(this.app,{lastSentHeartbeatDate:(t=e.lastSentHeartbeatDate)!==null&&t!==void 0?t:i.lastSentHeartbeatDate,heartbeats:[...i.heartbeats,...e.heartbeats]})}else return}}function nr(n){return hn(JSON.stringify({version:2,heartbeats:n})).length}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Zd(n){it(new We("platform-logger",e=>new ud(e),"PRIVATE")),it(new We("heartbeat",e=>new Qd(e),"PRIVATE")),Ne(Es,Xi,n),Ne(Es,Xi,"esm2017"),Ne("fire-js","")}Zd("");var eh="firebase",th="10.14.1";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */Ne(eh,th,"app");function Zs(n,e){var t={};for(var s in n)Object.prototype.hasOwnProperty.call(n,s)&&e.indexOf(s)<0&&(t[s]=n[s]);if(n!=null&&typeof Object.getOwnPropertySymbols=="function")for(var i=0,s=Object.getOwnPropertySymbols(n);i<s.length;i++)e.indexOf(s[i])<0&&Object.prototype.propertyIsEnumerable.call(n,s[i])&&(t[s[i]]=n[s[i]]);return t}function Lo(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const nh=Lo,Fo=new Vt("auth","Firebase",Lo());/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const gn=new Qs("@firebase/auth");function sh(n,...e){gn.logLevel<=R.WARN&&gn.warn(`Auth (${ht}): ${n}`,...e)}function on(n,...e){gn.logLevel<=R.ERROR&&gn.error(`Auth (${ht}): ${n}`,...e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ne(n,...e){throw ei(n,...e)}function ie(n,...e){return ei(n,...e)}function Uo(n,e,t){const s=Object.assign(Object.assign({},nh()),{[e]:t});return new Vt("auth","Firebase",s).create(e,{appName:n.name})}function ke(n){return Uo(n,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function ei(n,...e){if(typeof n!="string"){const t=e[0],s=[...e.slice(1)];return s[0]&&(s[0].appName=n.name),n._errorFactory.create(t,...s)}return Fo.create(n,...e)}function y(n,e,...t){if(!n)throw ei(e,...t)}function le(n){const e="INTERNAL ASSERTION FAILED: "+n;throw on(e),new Error(e)}function pe(n,e){n||le(e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ns(){var n;return typeof self<"u"&&((n=self.location)===null||n===void 0?void 0:n.href)||""}function ih(){return sr()==="http:"||sr()==="https:"}function sr(){var n;return typeof self<"u"&&((n=self.location)===null||n===void 0?void 0:n.protocol)||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function rh(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(ih()||Oc()||"connection"in navigator)?navigator.onLine:!0}function oh(){if(typeof navigator>"u")return null;const n=navigator;return n.languages&&n.languages[0]||n.language||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Bt{constructor(e,t){this.shortDelay=e,this.longDelay=t,pe(t>e,"Short delay should be less than long delay!"),this.isMobile=Ks()||To()}get(){return rh()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ti(n,e){pe(n.emulator,"Emulator should always be set here");const{url:t}=n.emulator;return e?`${t}${e.startsWith("/")?e.slice(1):e}`:t}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Wo{static initialize(e,t,s){this.fetchImpl=e,t&&(this.headersImpl=t),s&&(this.responseImpl=s)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;le("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;le("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;le("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ah={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const lh=new Bt(3e4,6e4);function ze(n,e){return n.tenantId&&!e.tenantId?Object.assign(Object.assign({},e),{tenantId:n.tenantId}):e}async function Pe(n,e,t,s,i={}){return Ho(n,i,async()=>{let r={},o={};s&&(e==="GET"?o=s:r={body:JSON.stringify(s)});const l=dt(Object.assign({key:n.config.apiKey},o)).slice(1),c=await n._getAdditionalHeaders();c["Content-Type"]="application/json",n.languageCode&&(c["X-Firebase-Locale"]=n.languageCode);const d=Object.assign({method:e,headers:c},r);return Pc()||(d.referrerPolicy="no-referrer"),Wo.fetch()(Vo(n,n.config.apiHost,t,l),d)})}async function Ho(n,e,t){n._canInitEmulator=!1;const s=Object.assign(Object.assign({},ah),e);try{const i=new dh(n),r=await Promise.race([t(),i.promise]);i.clearNetworkTimeout();const o=await r.json();if("needConfirmation"in o)throw Zt(n,"account-exists-with-different-credential",o);if(r.ok&&!("errorMessage"in o))return o;{const l=r.ok?o.errorMessage:o.error.message,[c,d]=l.split(" : ");if(c==="FEDERATED_USER_ID_ALREADY_LINKED")throw Zt(n,"credential-already-in-use",o);if(c==="EMAIL_EXISTS")throw Zt(n,"email-already-in-use",o);if(c==="USER_DISABLED")throw Zt(n,"user-disabled",o);const u=s[c]||c.toLowerCase().replace(/[_\s]+/g,"-");if(d)throw Uo(n,u,d);ne(n,u)}}catch(i){if(i instanceof Ae)throw i;ne(n,"network-request-failed",{message:String(i)})}}async function Vn(n,e,t,s,i={}){const r=await Pe(n,e,t,s,i);return"mfaPendingCredential"in r&&ne(n,"multi-factor-auth-required",{_serverResponse:r}),r}function Vo(n,e,t,s){const i=`${e}${t}?${s}`;return n.config.emulator?ti(n.config,i):`${n.config.apiScheme}://${i}`}function ch(n){switch(n){case"ENFORCE":return"ENFORCE";case"AUDIT":return"AUDIT";case"OFF":return"OFF";default:return"ENFORCEMENT_STATE_UNSPECIFIED"}}class dh{constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((t,s)=>{this.timer=setTimeout(()=>s(ie(this.auth,"network-request-failed")),lh.get())})}clearNetworkTimeout(){clearTimeout(this.timer)}}function Zt(n,e,t){const s={appName:n.name};t.email&&(s.email=t.email),t.phoneNumber&&(s.phoneNumber=t.phoneNumber);const i=ie(n,e,s);return i.customData._tokenResponse=t,i}function ir(n){return n!==void 0&&n.enterprise!==void 0}class hh{constructor(e){if(this.siteKey="",this.recaptchaEnforcementState=[],e.recaptchaKey===void 0)throw new Error("recaptchaKey undefined");this.siteKey=e.recaptchaKey.split("/")[3],this.recaptchaEnforcementState=e.recaptchaEnforcementState}getProviderEnforcementState(e){if(!this.recaptchaEnforcementState||this.recaptchaEnforcementState.length===0)return null;for(const t of this.recaptchaEnforcementState)if(t.provider&&t.provider===e)return ch(t.enforcementState);return null}isProviderEnabled(e){return this.getProviderEnforcementState(e)==="ENFORCE"||this.getProviderEnforcementState(e)==="AUDIT"}}async function uh(n,e){return Pe(n,"GET","/v2/recaptchaConfig",ze(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function fh(n,e){return Pe(n,"POST","/v1/accounts:delete",e)}async function Bo(n,e){return Pe(n,"POST","/v1/accounts:lookup",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Et(n){if(n)try{const e=new Date(Number(n));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function ph(n,e=!1){const t=G(n),s=await t.getIdToken(e),i=ni(s);y(i&&i.exp&&i.auth_time&&i.iat,t.auth,"internal-error");const r=typeof i.firebase=="object"?i.firebase:void 0,o=r==null?void 0:r.sign_in_provider;return{claims:i,token:s,authTime:Et(os(i.auth_time)),issuedAtTime:Et(os(i.iat)),expirationTime:Et(os(i.exp)),signInProvider:o||null,signInSecondFactor:(r==null?void 0:r.sign_in_second_factor)||null}}function os(n){return Number(n)*1e3}function ni(n){const[e,t,s]=n.split(".");if(e===void 0||t===void 0||s===void 0)return on("JWT malformed, contained fewer than 3 sections"),null;try{const i=un(t);return i?JSON.parse(i):(on("Failed to decode base64 JWT payload"),null)}catch(i){return on("Caught error parsing JWT payload as JSON",i==null?void 0:i.toString()),null}}function rr(n){const e=ni(n);return y(e,"internal-error"),y(typeof e.exp<"u","internal-error"),y(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Pt(n,e,t=!1){if(t)return e;try{return await e}catch(s){throw s instanceof Ae&&mh(s)&&n.auth.currentUser===n&&await n.auth.signOut(),s}}function mh({code:n}){return n==="auth/user-disabled"||n==="auth/user-token-expired"}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gh{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){var t;if(e){const s=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),s}else{this.errorBackoff=3e4;const i=((t=this.user.stsTokenManager.expirationTime)!==null&&t!==void 0?t:0)-Date.now()-3e5;return Math.max(0,i)}}schedule(e=!1){if(!this.isRunning)return;const t=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},t)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){(e==null?void 0:e.code)==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ks{constructor(e,t){this.createdAt=e,this.lastLoginAt=t,this._initializeTime()}_initializeTime(){this.lastSignInTime=Et(this.lastLoginAt),this.creationTime=Et(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function _n(n){var e;const t=n.auth,s=await n.getIdToken(),i=await Pt(n,Bo(t,{idToken:s}));y(i==null?void 0:i.users.length,t,"internal-error");const r=i.users[0];n._notifyReloadListener(r);const o=!((e=r.providerUserInfo)===null||e===void 0)&&e.length?$o(r.providerUserInfo):[],l=vh(n.providerData,o),c=n.isAnonymous,d=!(n.email&&r.passwordHash)&&!(l!=null&&l.length),u=c?d:!1,h={uid:r.localId,displayName:r.displayName||null,photoURL:r.photoUrl||null,email:r.email||null,emailVerified:r.emailVerified||!1,phoneNumber:r.phoneNumber||null,tenantId:r.tenantId||null,providerData:l,metadata:new ks(r.createdAt,r.lastLoginAt),isAnonymous:u};Object.assign(n,h)}async function _h(n){const e=G(n);await _n(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function vh(n,e){return[...n.filter(s=>!e.some(i=>i.providerId===s.providerId)),...e]}function $o(n){return n.map(e=>{var{providerId:t}=e,s=Zs(e,["providerId"]);return{providerId:t,uid:s.rawId||"",displayName:s.displayName||null,email:s.email||null,phoneNumber:s.phoneNumber||null,photoURL:s.photoUrl||null}})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function yh(n,e){const t=await Ho(n,{},async()=>{const s=dt({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:i,apiKey:r}=n.config,o=Vo(n,i,"/v1/token",`key=${r}`),l=await n._getAdditionalHeaders();return l["Content-Type"]="application/x-www-form-urlencoded",Wo.fetch()(o,{method:"POST",headers:l,body:s})});return{accessToken:t.access_token,expiresIn:t.expires_in,refreshToken:t.refresh_token}}async function wh(n,e){return Pe(n,"POST","/v2/accounts:revokeToken",ze(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Je{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){y(e.idToken,"internal-error"),y(typeof e.idToken<"u","internal-error"),y(typeof e.refreshToken<"u","internal-error");const t="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):rr(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,t)}updateFromIdToken(e){y(e.length!==0,"internal-error");const t=rr(e);this.updateTokensAndExpiration(e,null,t)}async getToken(e,t=!1){return!t&&this.accessToken&&!this.isExpired?this.accessToken:(y(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,t){const{accessToken:s,refreshToken:i,expiresIn:r}=await yh(e,t);this.updateTokensAndExpiration(s,i,Number(r))}updateTokensAndExpiration(e,t,s){this.refreshToken=t||null,this.accessToken=e||null,this.expirationTime=Date.now()+s*1e3}static fromJSON(e,t){const{refreshToken:s,accessToken:i,expirationTime:r}=t,o=new Je;return s&&(y(typeof s=="string","internal-error",{appName:e}),o.refreshToken=s),i&&(y(typeof i=="string","internal-error",{appName:e}),o.accessToken=i),r&&(y(typeof r=="number","internal-error",{appName:e}),o.expirationTime=r),o}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new Je,this.toJSON())}_performRefresh(){return le("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ve(n,e){y(typeof n=="string"||typeof n>"u","internal-error",{appName:e})}class ce{constructor(e){var{uid:t,auth:s,stsTokenManager:i}=e,r=Zs(e,["uid","auth","stsTokenManager"]);this.providerId="firebase",this.proactiveRefresh=new gh(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=t,this.auth=s,this.stsTokenManager=i,this.accessToken=i.accessToken,this.displayName=r.displayName||null,this.email=r.email||null,this.emailVerified=r.emailVerified||!1,this.phoneNumber=r.phoneNumber||null,this.photoURL=r.photoURL||null,this.isAnonymous=r.isAnonymous||!1,this.tenantId=r.tenantId||null,this.providerData=r.providerData?[...r.providerData]:[],this.metadata=new ks(r.createdAt||void 0,r.lastLoginAt||void 0)}async getIdToken(e){const t=await Pt(this,this.stsTokenManager.getToken(this.auth,e));return y(t,this.auth,"internal-error"),this.accessToken!==t&&(this.accessToken=t,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),t}getIdTokenResult(e){return ph(this,e)}reload(){return _h(this)}_assign(e){this!==e&&(y(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(t=>Object.assign({},t)),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const t=new ce(Object.assign(Object.assign({},this),{auth:e,stsTokenManager:this.stsTokenManager._clone()}));return t.metadata._copy(this.metadata),t}_onReload(e){y(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,t=!1){let s=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),s=!0),t&&await _n(this),await this.auth._persistUserIfCurrent(this),s&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(ae(this.auth.app))return Promise.reject(ke(this.auth));const e=await this.getIdToken();return await Pt(this,fh(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return Object.assign(Object.assign({uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>Object.assign({},e)),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId},this.metadata.toJSON()),{apiKey:this.auth.config.apiKey,appName:this.auth.name})}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,t){var s,i,r,o,l,c,d,u;const h=(s=t.displayName)!==null&&s!==void 0?s:void 0,f=(i=t.email)!==null&&i!==void 0?i:void 0,g=(r=t.phoneNumber)!==null&&r!==void 0?r:void 0,_=(o=t.photoURL)!==null&&o!==void 0?o:void 0,p=(l=t.tenantId)!==null&&l!==void 0?l:void 0,v=(c=t._redirectEventId)!==null&&c!==void 0?c:void 0,I=(d=t.createdAt)!==null&&d!==void 0?d:void 0,b=(u=t.lastLoginAt)!==null&&u!==void 0?u:void 0,{uid:P,emailVerified:M,isAnonymous:T,providerData:F,stsTokenManager:B}=t;y(P&&B,e,"internal-error");const q=Je.fromJSON(this.name,B);y(typeof P=="string",e,"internal-error"),ve(h,e.name),ve(f,e.name),y(typeof M=="boolean",e,"internal-error"),y(typeof T=="boolean",e,"internal-error"),ve(g,e.name),ve(_,e.name),ve(p,e.name),ve(v,e.name),ve(I,e.name),ve(b,e.name);const oe=new ce({uid:P,auth:e,email:f,emailVerified:M,displayName:h,isAnonymous:T,photoURL:_,phoneNumber:g,tenantId:p,stsTokenManager:q,createdAt:I,lastLoginAt:b});return F&&Array.isArray(F)&&(oe.providerData=F.map(es=>Object.assign({},es))),v&&(oe._redirectEventId=v),oe}static async _fromIdTokenResponse(e,t,s=!1){const i=new Je;i.updateFromServerResponse(t);const r=new ce({uid:t.localId,auth:e,stsTokenManager:i,isAnonymous:s});return await _n(r),r}static async _fromGetAccountInfoResponse(e,t,s){const i=t.users[0];y(i.localId!==void 0,"internal-error");const r=i.providerUserInfo!==void 0?$o(i.providerUserInfo):[],o=!(i.email&&i.passwordHash)&&!(r!=null&&r.length),l=new Je;l.updateFromIdToken(s);const c=new ce({uid:i.localId,auth:e,stsTokenManager:l,isAnonymous:o}),d={uid:i.localId,displayName:i.displayName||null,photoURL:i.photoUrl||null,email:i.email||null,emailVerified:i.emailVerified||!1,phoneNumber:i.phoneNumber||null,tenantId:i.tenantId||null,providerData:r,metadata:new ks(i.createdAt,i.lastLoginAt),isAnonymous:!(i.email&&i.passwordHash)&&!(r!=null&&r.length)};return Object.assign(c,d),c}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const or=new Map;function de(n){pe(n instanceof Function,"Expected a class definition");let e=or.get(n);return e?(pe(e instanceof n,"Instance stored in cache mismatched with class"),e):(e=new n,or.set(n,e),e)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qo{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,t){this.storage[e]=t}async _get(e){const t=this.storage[e];return t===void 0?null:t}async _remove(e){delete this.storage[e]}_addListener(e,t){}_removeListener(e,t){}}qo.type="NONE";const ar=qo;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function an(n,e,t){return`firebase:${n}:${e}:${t}`}class Xe{constructor(e,t,s){this.persistence=e,this.auth=t,this.userKey=s;const{config:i,name:r}=this.auth;this.fullUserKey=an(this.userKey,i.apiKey,r),this.fullPersistenceKey=an("persistence",i.apiKey,r),this.boundEventHandler=t._onStorageEvent.bind(t),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);return e?ce._fromJSON(this.auth,e):null}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const t=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,t)return this.setCurrentUser(t)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,t,s="authUser"){if(!t.length)return new Xe(de(ar),e,s);const i=(await Promise.all(t.map(async d=>{if(await d._isAvailable())return d}))).filter(d=>d);let r=i[0]||de(ar);const o=an(s,e.config.apiKey,e.name);let l=null;for(const d of t)try{const u=await d._get(o);if(u){const h=ce._fromJSON(e,u);d!==r&&(l=h),r=d;break}}catch{}const c=i.filter(d=>d._shouldAllowMigration);return!r._shouldAllowMigration||!c.length?new Xe(r,e,s):(r=c[0],l&&await r._set(o,l.toJSON()),await Promise.all(t.map(async d=>{if(d!==r)try{await d._remove(o)}catch{}})),new Xe(r,e,s))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function lr(n){const e=n.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(Yo(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(zo(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(Jo(e))return"Blackberry";if(Xo(e))return"Webos";if(Go(e))return"Safari";if((e.includes("chrome/")||Ko(e))&&!e.includes("edge/"))return"Chrome";if(Qo(e))return"Android";{const t=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,s=n.match(t);if((s==null?void 0:s.length)===2)return s[1]}return"Other"}function zo(n=z()){return/firefox\//i.test(n)}function Go(n=z()){const e=n.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function Ko(n=z()){return/crios\//i.test(n)}function Yo(n=z()){return/iemobile/i.test(n)}function Qo(n=z()){return/android/i.test(n)}function Jo(n=z()){return/blackberry/i.test(n)}function Xo(n=z()){return/webos/i.test(n)}function si(n=z()){return/iphone|ipad|ipod/i.test(n)||/macintosh/i.test(n)&&/mobile/i.test(n)}function bh(n=z()){var e;return si(n)&&!!(!((e=window.navigator)===null||e===void 0)&&e.standalone)}function xh(){return Dc()&&document.documentMode===10}function Zo(n=z()){return si(n)||Qo(n)||Xo(n)||Jo(n)||/windows phone/i.test(n)||Yo(n)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ea(n,e=[]){let t;switch(n){case"Browser":t=lr(z());break;case"Worker":t=`${lr(z())}-${n}`;break;default:t=n}const s=e.length?e.join(","):"FirebaseCore-web";return`${t}/JsCore/${ht}/${s}`}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Eh{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,t){const s=r=>new Promise((o,l)=>{try{const c=e(r);o(c)}catch(c){l(c)}});s.onAbort=t,this.queue.push(s);const i=this.queue.length-1;return()=>{this.queue[i]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const t=[];try{for(const s of this.queue)await s(e),s.onAbort&&t.push(s.onAbort)}catch(s){t.reverse();for(const i of t)try{i()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:s==null?void 0:s.message})}}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Ih(n,e={}){return Pe(n,"GET","/v2/passwordPolicy",ze(n,e))}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ch=6;class Nh{constructor(e){var t,s,i,r;const o=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=(t=o.minPasswordLength)!==null&&t!==void 0?t:Ch,o.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=o.maxPasswordLength),o.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=o.containsLowercaseCharacter),o.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=o.containsUppercaseCharacter),o.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=o.containsNumericCharacter),o.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=o.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=(i=(s=e.allowedNonAlphanumericCharacters)===null||s===void 0?void 0:s.join(""))!==null&&i!==void 0?i:"",this.forceUpgradeOnSignin=(r=e.forceUpgradeOnSignin)!==null&&r!==void 0?r:!1,this.schemaVersion=e.schemaVersion}validatePassword(e){var t,s,i,r,o,l;const c={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,c),this.validatePasswordCharacterOptions(e,c),c.isValid&&(c.isValid=(t=c.meetsMinPasswordLength)!==null&&t!==void 0?t:!0),c.isValid&&(c.isValid=(s=c.meetsMaxPasswordLength)!==null&&s!==void 0?s:!0),c.isValid&&(c.isValid=(i=c.containsLowercaseLetter)!==null&&i!==void 0?i:!0),c.isValid&&(c.isValid=(r=c.containsUppercaseLetter)!==null&&r!==void 0?r:!0),c.isValid&&(c.isValid=(o=c.containsNumericCharacter)!==null&&o!==void 0?o:!0),c.isValid&&(c.isValid=(l=c.containsNonAlphanumericCharacter)!==null&&l!==void 0?l:!0),c}validatePasswordLengthOptions(e,t){const s=this.customStrengthOptions.minPasswordLength,i=this.customStrengthOptions.maxPasswordLength;s&&(t.meetsMinPasswordLength=e.length>=s),i&&(t.meetsMaxPasswordLength=e.length<=i)}validatePasswordCharacterOptions(e,t){this.updatePasswordCharacterOptionsStatuses(t,!1,!1,!1,!1);let s;for(let i=0;i<e.length;i++)s=e.charAt(i),this.updatePasswordCharacterOptionsStatuses(t,s>="a"&&s<="z",s>="A"&&s<="Z",s>="0"&&s<="9",this.allowedNonAlphanumericCharacters.includes(s))}updatePasswordCharacterOptionsStatuses(e,t,s,i,r){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=t)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=s)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=i)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=r))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class kh{constructor(e,t,s,i){this.app=e,this.heartbeatServiceProvider=t,this.appCheckServiceProvider=s,this.config=i,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new cr(this),this.idTokenSubscription=new cr(this),this.beforeStateQueue=new Eh(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=Fo,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=i.sdkClientVersion}_initializeWithPersistence(e,t){return t&&(this._popupRedirectResolver=de(t)),this._initializationPromise=this.queue(async()=>{var s,i;if(!this._deleted&&(this.persistenceManager=await Xe.create(this,e),!this._deleted)){if(!((s=this._popupRedirectResolver)===null||s===void 0)&&s._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(t),this.lastNotifiedUid=((i=this.currentUser)===null||i===void 0?void 0:i.uid)||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{const t=await Bo(this,{idToken:e}),s=await ce._fromGetAccountInfoResponse(this,t,e);await this.directlySetCurrentUser(s)}catch(t){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",t),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){var t;if(ae(this.app)){const o=this.app.settings.authIdToken;return o?new Promise(l=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(o).then(l,l))}):this.directlySetCurrentUser(null)}const s=await this.assertedPersistence.getCurrentUser();let i=s,r=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const o=(t=this.redirectUser)===null||t===void 0?void 0:t._redirectEventId,l=i==null?void 0:i._redirectEventId,c=await this.tryRedirectSignIn(e);(!o||o===l)&&(c!=null&&c.user)&&(i=c.user,r=!0)}if(!i)return this.directlySetCurrentUser(null);if(!i._redirectEventId){if(r)try{await this.beforeStateQueue.runMiddleware(i)}catch(o){i=s,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(o))}return i?this.reloadAndSetCurrentUserOrClear(i):this.directlySetCurrentUser(null)}return y(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===i._redirectEventId?this.directlySetCurrentUser(i):this.reloadAndSetCurrentUserOrClear(i)}async tryRedirectSignIn(e){let t=null;try{t=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return t}async reloadAndSetCurrentUserOrClear(e){try{await _n(e)}catch(t){if((t==null?void 0:t.code)!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=oh()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(ae(this.app))return Promise.reject(ke(this));const t=e?G(e):null;return t&&y(t.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(t&&t._clone(this))}async _updateCurrentUser(e,t=!1){if(!this._deleted)return e&&y(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),t||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return ae(this.app)?Promise.reject(ke(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return ae(this.app)?Promise.reject(ke(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(de(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const t=this._getPasswordPolicyInternal();return t.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):t.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await Ih(this),t=new Nh(e);this.tenantId===null?this._projectPasswordPolicy=t:this._tenantPasswordPolicies[this.tenantId]=t}_getPersistence(){return this.assertedPersistence.persistence.type}_updateErrorMap(e){this._errorFactory=new Vt("auth","Firebase",e())}onAuthStateChanged(e,t,s){return this.registerStateListener(this.authStateSubscription,e,t,s)}beforeAuthStateChanged(e,t){return this.beforeStateQueue.pushCallback(e,t)}onIdTokenChanged(e,t,s){return this.registerStateListener(this.idTokenSubscription,e,t,s)}authStateReady(){return new Promise((e,t)=>{if(this.currentUser)e();else{const s=this.onAuthStateChanged(()=>{s(),e()},t)}})}async revokeAccessToken(e){if(this.currentUser){const t=await this.currentUser.getIdToken(),s={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:t};this.tenantId!=null&&(s.tenantId=this.tenantId),await wh(this,s)}}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:(e=this._currentUser)===null||e===void 0?void 0:e.toJSON()}}async _setRedirectUser(e,t){const s=await this.getOrInitRedirectPersistenceManager(t);return e===null?s.removeCurrentUser():s.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const t=e&&de(e)||this._popupRedirectResolver;y(t,this,"argument-error"),this.redirectPersistenceManager=await Xe.create(this,[de(t._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){var t,s;return this._isInitialized&&await this.queue(async()=>{}),((t=this._currentUser)===null||t===void 0?void 0:t._redirectEventId)===e?this._currentUser:((s=this.redirectUser)===null||s===void 0?void 0:s._redirectEventId)===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var e,t;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const s=(t=(e=this.currentUser)===null||e===void 0?void 0:e.uid)!==null&&t!==void 0?t:null;this.lastNotifiedUid!==s&&(this.lastNotifiedUid=s,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,t,s,i){if(this._deleted)return()=>{};const r=typeof t=="function"?t:t.next.bind(t);let o=!1;const l=this._isInitialized?Promise.resolve():this._initializationPromise;if(y(l,this,"internal-error"),l.then(()=>{o||r(this.currentUser)}),typeof t=="function"){const c=e.addObserver(t,s,i);return()=>{o=!0,c()}}else{const c=e.addObserver(t);return()=>{o=!0,c()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return y(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=ea(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var e;const t={"X-Client-Version":this.clientVersion};this.app.options.appId&&(t["X-Firebase-gmpid"]=this.app.options.appId);const s=await((e=this.heartbeatServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getHeartbeatsHeader());s&&(t["X-Firebase-Client"]=s);const i=await this._getAppCheckToken();return i&&(t["X-Firebase-AppCheck"]=i),t}async _getAppCheckToken(){var e;const t=await((e=this.appCheckServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getToken());return t!=null&&t.error&&sh(`Error while retrieving App Check token: ${t.error}`),t==null?void 0:t.token}}function ut(n){return G(n)}class cr{constructor(e){this.auth=e,this.observer=null,this.addObserver=Bc(t=>this.observer=t)}get next(){return y(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Bn={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function Th(n){Bn=n}function ta(n){return Bn.loadJS(n)}function Sh(){return Bn.recaptchaEnterpriseScript}function Rh(){return Bn.gapiScript}function Ah(n){return`__${n}${Math.floor(Math.random()*1e6)}`}const Ph="recaptcha-enterprise",Oh="NO_RECAPTCHA";class Dh{constructor(e){this.type=Ph,this.auth=ut(e)}async verify(e="verify",t=!1){async function s(r){if(!t){if(r.tenantId==null&&r._agentRecaptchaConfig!=null)return r._agentRecaptchaConfig.siteKey;if(r.tenantId!=null&&r._tenantRecaptchaConfigs[r.tenantId]!==void 0)return r._tenantRecaptchaConfigs[r.tenantId].siteKey}return new Promise(async(o,l)=>{uh(r,{clientType:"CLIENT_TYPE_WEB",version:"RECAPTCHA_ENTERPRISE"}).then(c=>{if(c.recaptchaKey===void 0)l(new Error("recaptcha Enterprise site key undefined"));else{const d=new hh(c);return r.tenantId==null?r._agentRecaptchaConfig=d:r._tenantRecaptchaConfigs[r.tenantId]=d,o(d.siteKey)}}).catch(c=>{l(c)})})}function i(r,o,l){const c=window.grecaptcha;ir(c)?c.enterprise.ready(()=>{c.enterprise.execute(r,{action:e}).then(d=>{o(d)}).catch(()=>{o(Oh)})}):l(Error("No reCAPTCHA enterprise script loaded."))}return new Promise((r,o)=>{s(this.auth).then(l=>{if(!t&&ir(window.grecaptcha))i(l,r,o);else{if(typeof window>"u"){o(new Error("RecaptchaVerifier is only supported in browser"));return}let c=Sh();c.length!==0&&(c+=l),ta(c).then(()=>{i(l,r,o)}).catch(d=>{o(d)})}}).catch(l=>{o(l)})})}}async function dr(n,e,t,s=!1){const i=new Dh(n);let r;try{r=await i.verify(t)}catch{r=await i.verify(t,!0)}const o=Object.assign({},e);return s?Object.assign(o,{captchaResp:r}):Object.assign(o,{captchaResponse:r}),Object.assign(o,{clientType:"CLIENT_TYPE_WEB"}),Object.assign(o,{recaptchaVersion:"RECAPTCHA_ENTERPRISE"}),o}async function hr(n,e,t,s){var i;if(!((i=n._getRecaptchaConfig())===null||i===void 0)&&i.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")){const r=await dr(n,e,t,t==="getOobCode");return s(n,r)}else return s(n,e).catch(async r=>{if(r.code==="auth/missing-recaptcha-token"){console.log(`${t} is protected by reCAPTCHA Enterprise for this project. Automatically triggering the reCAPTCHA flow and restarting the flow.`);const o=await dr(n,e,t,t==="getOobCode");return s(n,o)}else return Promise.reject(r)})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function jh(n,e){const t=Xs(n,"auth");if(t.isInitialized()){const i=t.getImmediate(),r=t.getOptions();if(pn(r,e??{}))return i;ne(i,"already-initialized")}return t.initialize({options:e})}function Mh(n,e){const t=(e==null?void 0:e.persistence)||[],s=(Array.isArray(t)?t:[t]).map(de);e!=null&&e.errorMap&&n._updateErrorMap(e.errorMap),n._initializeWithPersistence(s,e==null?void 0:e.popupRedirectResolver)}function Lh(n,e,t){const s=ut(n);y(s._canInitEmulator,s,"emulator-config-failed"),y(/^https?:\/\//.test(e),s,"invalid-emulator-scheme");const i=!1,r=na(e),{host:o,port:l}=Fh(e),c=l===null?"":`:${l}`;s.config.emulator={url:`${r}//${o}${c}/`},s.settings.appVerificationDisabledForTesting=!0,s.emulatorConfig=Object.freeze({host:o,port:l,protocol:r.replace(":",""),options:Object.freeze({disableWarnings:i})}),Uh()}function na(n){const e=n.indexOf(":");return e<0?"":n.substr(0,e+1)}function Fh(n){const e=na(n),t=/(\/\/)?([^?#/]+)/.exec(n.substr(e.length));if(!t)return{host:"",port:null};const s=t[2].split("@").pop()||"",i=/^(\[[^\]]+\])(:|$)/.exec(s);if(i){const r=i[1];return{host:r,port:ur(s.substr(r.length+1))}}else{const[r,o]=s.split(":");return{host:r,port:ur(o)}}}function ur(n){if(!n)return null;const e=Number(n);return isNaN(e)?null:e}function Uh(){function n(){const e=document.createElement("p"),t=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",t.position="fixed",t.width="100%",t.backgroundColor="#ffffff",t.border=".1em solid #000000",t.color="#b50000",t.bottom="0px",t.left="0px",t.margin="0px",t.zIndex="10000",t.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",n):n())}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ii{constructor(e,t){this.providerId=e,this.signInMethod=t}toJSON(){return le("not implemented")}_getIdTokenResponse(e){return le("not implemented")}_linkToIdToken(e,t){return le("not implemented")}_getReauthenticationResolver(e){return le("not implemented")}}async function Wh(n,e){return Pe(n,"POST","/v1/accounts:signUp",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Hh(n,e){return Vn(n,"POST","/v1/accounts:signInWithPassword",ze(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Vh(n,e){return Vn(n,"POST","/v1/accounts:signInWithEmailLink",ze(n,e))}async function Bh(n,e){return Vn(n,"POST","/v1/accounts:signInWithEmailLink",ze(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ot extends ii{constructor(e,t,s,i=null){super("password",s),this._email=e,this._password=t,this._tenantId=i}static _fromEmailAndPassword(e,t){return new Ot(e,t,"password")}static _fromEmailAndCode(e,t,s=null){return new Ot(e,t,"emailLink",s)}toJSON(){return{email:this._email,password:this._password,signInMethod:this.signInMethod,tenantId:this._tenantId}}static fromJSON(e){const t=typeof e=="string"?JSON.parse(e):e;if(t!=null&&t.email&&(t!=null&&t.password)){if(t.signInMethod==="password")return this._fromEmailAndPassword(t.email,t.password);if(t.signInMethod==="emailLink")return this._fromEmailAndCode(t.email,t.password,t.tenantId)}return null}async _getIdTokenResponse(e){switch(this.signInMethod){case"password":const t={returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return hr(e,t,"signInWithPassword",Hh);case"emailLink":return Vh(e,{email:this._email,oobCode:this._password});default:ne(e,"internal-error")}}async _linkToIdToken(e,t){switch(this.signInMethod){case"password":const s={idToken:t,returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return hr(e,s,"signUpPassword",Wh);case"emailLink":return Bh(e,{idToken:t,email:this._email,oobCode:this._password});default:ne(e,"internal-error")}}_getReauthenticationResolver(e){return this._getIdTokenResponse(e)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Ze(n,e){return Vn(n,"POST","/v1/accounts:signInWithIdp",ze(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const $h="http://localhost";class He extends ii{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const t=new He(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(t.idToken=e.idToken),e.accessToken&&(t.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(t.nonce=e.nonce),e.pendingToken&&(t.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(t.accessToken=e.oauthToken,t.secret=e.oauthTokenSecret):ne("argument-error"),t}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const t=typeof e=="string"?JSON.parse(e):e,{providerId:s,signInMethod:i}=t,r=Zs(t,["providerId","signInMethod"]);if(!s||!i)return null;const o=new He(s,i);return o.idToken=r.idToken||void 0,o.accessToken=r.accessToken||void 0,o.secret=r.secret,o.nonce=r.nonce,o.pendingToken=r.pendingToken||null,o}_getIdTokenResponse(e){const t=this.buildRequest();return Ze(e,t)}_linkToIdToken(e,t){const s=this.buildRequest();return s.idToken=t,Ze(e,s)}_getReauthenticationResolver(e){const t=this.buildRequest();return t.autoCreate=!1,Ze(e,t)}buildRequest(){const e={requestUri:$h,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const t={};this.idToken&&(t.id_token=this.idToken),this.accessToken&&(t.access_token=this.accessToken),this.secret&&(t.oauth_token_secret=this.secret),t.providerId=this.providerId,this.nonce&&!this.pendingToken&&(t.nonce=this.nonce),e.postBody=dt(t)}return e}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function qh(n){switch(n){case"recoverEmail":return"RECOVER_EMAIL";case"resetPassword":return"PASSWORD_RESET";case"signIn":return"EMAIL_SIGNIN";case"verifyEmail":return"VERIFY_EMAIL";case"verifyAndChangeEmail":return"VERIFY_AND_CHANGE_EMAIL";case"revertSecondFactorAddition":return"REVERT_SECOND_FACTOR_ADDITION";default:return null}}function zh(n){const e=bt(xt(n)).link,t=e?bt(xt(e)).deep_link_id:null,s=bt(xt(n)).deep_link_id;return(s?bt(xt(s)).link:null)||s||t||e||n}class ri{constructor(e){var t,s,i,r,o,l;const c=bt(xt(e)),d=(t=c.apiKey)!==null&&t!==void 0?t:null,u=(s=c.oobCode)!==null&&s!==void 0?s:null,h=qh((i=c.mode)!==null&&i!==void 0?i:null);y(d&&u&&h,"argument-error"),this.apiKey=d,this.operation=h,this.code=u,this.continueUrl=(r=c.continueUrl)!==null&&r!==void 0?r:null,this.languageCode=(o=c.languageCode)!==null&&o!==void 0?o:null,this.tenantId=(l=c.tenantId)!==null&&l!==void 0?l:null}static parseLink(e){const t=zh(e);try{return new ri(t)}catch{return null}}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ft{constructor(){this.providerId=ft.PROVIDER_ID}static credential(e,t){return Ot._fromEmailAndPassword(e,t)}static credentialWithLink(e,t){const s=ri.parseLink(t);return y(s,"argument-error"),Ot._fromEmailAndCode(e,s.code,s.tenantId)}}ft.PROVIDER_ID="password";ft.EMAIL_PASSWORD_SIGN_IN_METHOD="password";ft.EMAIL_LINK_SIGN_IN_METHOD="emailLink";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class sa{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $t extends sa{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ye extends $t{constructor(){super("facebook.com")}static credential(e){return He._fromParams({providerId:ye.PROVIDER_ID,signInMethod:ye.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return ye.credentialFromTaggedObject(e)}static credentialFromError(e){return ye.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return ye.credential(e.oauthAccessToken)}catch{return null}}}ye.FACEBOOK_SIGN_IN_METHOD="facebook.com";ye.PROVIDER_ID="facebook.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class we extends $t{constructor(){super("google.com"),this.addScope("profile")}static credential(e,t){return He._fromParams({providerId:we.PROVIDER_ID,signInMethod:we.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:t})}static credentialFromResult(e){return we.credentialFromTaggedObject(e)}static credentialFromError(e){return we.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:t,oauthAccessToken:s}=e;if(!t&&!s)return null;try{return we.credential(t,s)}catch{return null}}}we.GOOGLE_SIGN_IN_METHOD="google.com";we.PROVIDER_ID="google.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class be extends $t{constructor(){super("github.com")}static credential(e){return He._fromParams({providerId:be.PROVIDER_ID,signInMethod:be.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return be.credentialFromTaggedObject(e)}static credentialFromError(e){return be.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return be.credential(e.oauthAccessToken)}catch{return null}}}be.GITHUB_SIGN_IN_METHOD="github.com";be.PROVIDER_ID="github.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xe extends $t{constructor(){super("twitter.com")}static credential(e,t){return He._fromParams({providerId:xe.PROVIDER_ID,signInMethod:xe.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:t})}static credentialFromResult(e){return xe.credentialFromTaggedObject(e)}static credentialFromError(e){return xe.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthAccessToken:t,oauthTokenSecret:s}=e;if(!t||!s)return null;try{return xe.credential(t,s)}catch{return null}}}xe.TWITTER_SIGN_IN_METHOD="twitter.com";xe.PROVIDER_ID="twitter.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rt{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,t,s,i=!1){const r=await ce._fromIdTokenResponse(e,s,i),o=fr(s);return new rt({user:r,providerId:o,_tokenResponse:s,operationType:t})}static async _forOperation(e,t,s){await e._updateTokensIfNecessary(s,!0);const i=fr(s);return new rt({user:e,providerId:i,_tokenResponse:s,operationType:t})}}function fr(n){return n.providerId?n.providerId:"phoneNumber"in n?"phone":null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vn extends Ae{constructor(e,t,s,i){var r;super(t.code,t.message),this.operationType=s,this.user=i,Object.setPrototypeOf(this,vn.prototype),this.customData={appName:e.name,tenantId:(r=e.tenantId)!==null&&r!==void 0?r:void 0,_serverResponse:t.customData._serverResponse,operationType:s}}static _fromErrorAndOperation(e,t,s,i){return new vn(e,t,s,i)}}function ia(n,e,t,s){return(e==="reauthenticate"?t._getReauthenticationResolver(n):t._getIdTokenResponse(n)).catch(r=>{throw r.code==="auth/multi-factor-auth-required"?vn._fromErrorAndOperation(n,r,e,s):r})}async function Gh(n,e,t=!1){const s=await Pt(n,e._linkToIdToken(n.auth,await n.getIdToken()),t);return rt._forOperation(n,"link",s)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Kh(n,e,t=!1){const{auth:s}=n;if(ae(s.app))return Promise.reject(ke(s));const i="reauthenticate";try{const r=await Pt(n,ia(s,i,e,n),t);y(r.idToken,s,"internal-error");const o=ni(r.idToken);y(o,s,"internal-error");const{sub:l}=o;return y(n.uid===l,s,"user-mismatch"),rt._forOperation(n,i,r)}catch(r){throw(r==null?void 0:r.code)==="auth/user-not-found"&&ne(s,"user-mismatch"),r}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function ra(n,e,t=!1){if(ae(n.app))return Promise.reject(ke(n));const s="signIn",i=await ia(n,s,e),r=await rt._fromIdTokenResponse(n,s,i);return t||await n._updateCurrentUser(r.user),r}async function Yh(n,e){return ra(ut(n),e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Qh(n){const e=ut(n);e._getPasswordPolicyInternal()&&await e._updatePasswordPolicy()}function Jh(n,e,t){return ae(n.app)?Promise.reject(ke(n)):Yh(G(n),ft.credential(e,t)).catch(async s=>{throw s.code==="auth/password-does-not-meet-requirements"&&Qh(n),s})}function Xh(n,e,t,s){return G(n).onIdTokenChanged(e,t,s)}function Zh(n,e,t){return G(n).beforeAuthStateChanged(e,t)}function eu(n,e,t,s){return G(n).onAuthStateChanged(e,t,s)}function tu(n){return G(n).signOut()}const yn="__sak";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class oa{constructor(e,t){this.storageRetriever=e,this.type=t}_isAvailable(){try{return this.storage?(this.storage.setItem(yn,"1"),this.storage.removeItem(yn),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,t){return this.storage.setItem(e,JSON.stringify(t)),Promise.resolve()}_get(e){const t=this.storage.getItem(e);return Promise.resolve(t?JSON.parse(t):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const nu=1e3,su=10;class aa extends oa{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,t)=>this.onStorageEvent(e,t),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=Zo(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const t of Object.keys(this.listeners)){const s=this.storage.getItem(t),i=this.localCache[t];s!==i&&e(t,i,s)}}onStorageEvent(e,t=!1){if(!e.key){this.forAllChangedKeys((o,l,c)=>{this.notifyListeners(o,c)});return}const s=e.key;t?this.detachListener():this.stopPolling();const i=()=>{const o=this.storage.getItem(s);!t&&this.localCache[s]===o||this.notifyListeners(s,o)},r=this.storage.getItem(s);xh()&&r!==e.newValue&&e.newValue!==e.oldValue?setTimeout(i,su):i()}notifyListeners(e,t){this.localCache[e]=t;const s=this.listeners[e];if(s)for(const i of Array.from(s))i(t&&JSON.parse(t))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,t,s)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:t,newValue:s}),!0)})},nu)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,t){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,t){await super._set(e,t),this.localCache[e]=JSON.stringify(t)}async _get(e){const t=await super._get(e);return this.localCache[e]=JSON.stringify(t),t}async _remove(e){await super._remove(e),delete this.localCache[e]}}aa.type="LOCAL";const iu=aa;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class la extends oa{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,t){}_removeListener(e,t){}}la.type="SESSION";const ca=la;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ru(n){return Promise.all(n.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(t){return{fulfilled:!1,reason:t}}}))}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $n{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){const t=this.receivers.find(i=>i.isListeningto(e));if(t)return t;const s=new $n(e);return this.receivers.push(s),s}isListeningto(e){return this.eventTarget===e}async handleEvent(e){const t=e,{eventId:s,eventType:i,data:r}=t.data,o=this.handlersMap[i];if(!(o!=null&&o.size))return;t.ports[0].postMessage({status:"ack",eventId:s,eventType:i});const l=Array.from(o).map(async d=>d(t.origin,r)),c=await ru(l);t.ports[0].postMessage({status:"done",eventId:s,eventType:i,response:c})}_subscribe(e,t){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(t)}_unsubscribe(e,t){this.handlersMap[e]&&t&&this.handlersMap[e].delete(t),(!t||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}$n.receivers=[];/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function oi(n="",e=10){let t="";for(let s=0;s<e;s++)t+=Math.floor(Math.random()*10);return n+t}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ou{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,t,s=50){const i=typeof MessageChannel<"u"?new MessageChannel:null;if(!i)throw new Error("connection_unavailable");let r,o;return new Promise((l,c)=>{const d=oi("",20);i.port1.start();const u=setTimeout(()=>{c(new Error("unsupported_event"))},s);o={messageChannel:i,onMessage(h){const f=h;if(f.data.eventId===d)switch(f.data.status){case"ack":clearTimeout(u),r=setTimeout(()=>{c(new Error("timeout"))},3e3);break;case"done":clearTimeout(r),l(f.data.response);break;default:clearTimeout(u),clearTimeout(r),c(new Error("invalid_response"));break}}},this.handlers.add(o),i.port1.addEventListener("message",o.onMessage),this.target.postMessage({eventType:e,eventId:d,data:t},[i.port2])}).finally(()=>{o&&this.removeMessageHandler(o)})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function re(){return window}function au(n){re().location.href=n}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function da(){return typeof re().WorkerGlobalScope<"u"&&typeof re().importScripts=="function"}async function lu(){if(!(navigator!=null&&navigator.serviceWorker))return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function cu(){var n;return((n=navigator==null?void 0:navigator.serviceWorker)===null||n===void 0?void 0:n.controller)||null}function du(){return da()?self:null}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ha="firebaseLocalStorageDb",hu=1,wn="firebaseLocalStorage",ua="fbase_key";class qt{constructor(e){this.request=e}toPromise(){return new Promise((e,t)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{t(this.request.error)})})}}function qn(n,e){return n.transaction([wn],e?"readwrite":"readonly").objectStore(wn)}function uu(){const n=indexedDB.deleteDatabase(ha);return new qt(n).toPromise()}function Ts(){const n=indexedDB.open(ha,hu);return new Promise((e,t)=>{n.addEventListener("error",()=>{t(n.error)}),n.addEventListener("upgradeneeded",()=>{const s=n.result;try{s.createObjectStore(wn,{keyPath:ua})}catch(i){t(i)}}),n.addEventListener("success",async()=>{const s=n.result;s.objectStoreNames.contains(wn)?e(s):(s.close(),await uu(),e(await Ts()))})})}async function pr(n,e,t){const s=qn(n,!0).put({[ua]:e,value:t});return new qt(s).toPromise()}async function fu(n,e){const t=qn(n,!1).get(e),s=await new qt(t).toPromise();return s===void 0?null:s.value}function mr(n,e){const t=qn(n,!0).delete(e);return new qt(t).toPromise()}const pu=800,mu=3;class fa{constructor(){this.type="LOCAL",this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.db?this.db:(this.db=await Ts(),this.db)}async _withRetries(e){let t=0;for(;;)try{const s=await this._openDb();return await e(s)}catch(s){if(t++>mu)throw s;this.db&&(this.db.close(),this.db=void 0)}}async initializeServiceWorkerMessaging(){return da()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=$n._getInstance(du()),this.receiver._subscribe("keyChanged",async(e,t)=>({keyProcessed:(await this._poll()).includes(t.key)})),this.receiver._subscribe("ping",async(e,t)=>["keyChanged"])}async initializeSender(){var e,t;if(this.activeServiceWorker=await lu(),!this.activeServiceWorker)return;this.sender=new ou(this.activeServiceWorker);const s=await this.sender._send("ping",{},800);s&&!((e=s[0])===null||e===void 0)&&e.fulfilled&&!((t=s[0])===null||t===void 0)&&t.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||cu()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{if(!indexedDB)return!1;const e=await Ts();return await pr(e,yn,"1"),await mr(e,yn),!0}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,t){return this._withPendingWrite(async()=>(await this._withRetries(s=>pr(s,e,t)),this.localCache[e]=t,this.notifyServiceWorker(e)))}async _get(e){const t=await this._withRetries(s=>fu(s,e));return this.localCache[e]=t,t}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(t=>mr(t,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){const e=await this._withRetries(i=>{const r=qn(i,!1).getAll();return new qt(r).toPromise()});if(!e)return[];if(this.pendingWrites!==0)return[];const t=[],s=new Set;if(e.length!==0)for(const{fbase_key:i,value:r}of e)s.add(i),JSON.stringify(this.localCache[i])!==JSON.stringify(r)&&(this.notifyListeners(i,r),t.push(i));for(const i of Object.keys(this.localCache))this.localCache[i]&&!s.has(i)&&(this.notifyListeners(i,null),t.push(i));return t}notifyListeners(e,t){this.localCache[e]=t;const s=this.listeners[e];if(s)for(const i of Array.from(s))i(t)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),pu)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,t){Object.keys(this.listeners).length===0&&this.startPolling(),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&this.stopPolling()}}fa.type="LOCAL";const gu=fa;new Bt(3e4,6e4);/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function _u(n,e){return e?de(e):(y(n._popupRedirectResolver,n,"argument-error"),n._popupRedirectResolver)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ai extends ii{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return Ze(e,this._buildIdpRequest())}_linkToIdToken(e,t){return Ze(e,this._buildIdpRequest(t))}_getReauthenticationResolver(e){return Ze(e,this._buildIdpRequest())}_buildIdpRequest(e){const t={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(t.idToken=e),t}}function vu(n){return ra(n.auth,new ai(n),n.bypassAuthState)}function yu(n){const{auth:e,user:t}=n;return y(t,e,"internal-error"),Kh(t,new ai(n),n.bypassAuthState)}async function wu(n){const{auth:e,user:t}=n;return y(t,e,"internal-error"),Gh(t,new ai(n),n.bypassAuthState)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pa{constructor(e,t,s,i,r=!1){this.auth=e,this.resolver=s,this.user=i,this.bypassAuthState=r,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(t)?t:[t]}execute(){return new Promise(async(e,t)=>{this.pendingPromise={resolve:e,reject:t};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(s){this.reject(s)}})}async onAuthEvent(e){const{urlResponse:t,sessionId:s,postBody:i,tenantId:r,error:o,type:l}=e;if(o){this.reject(o);return}const c={auth:this.auth,requestUri:t,sessionId:s,tenantId:r||void 0,postBody:i||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(l)(c))}catch(d){this.reject(d)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return vu;case"linkViaPopup":case"linkViaRedirect":return wu;case"reauthViaPopup":case"reauthViaRedirect":return yu;default:ne(this.auth,"internal-error")}}resolve(e){pe(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){pe(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const bu=new Bt(2e3,1e4);class Ye extends pa{constructor(e,t,s,i,r){super(e,t,i,r),this.provider=s,this.authWindow=null,this.pollId=null,Ye.currentPopupAction&&Ye.currentPopupAction.cancel(),Ye.currentPopupAction=this}async executeNotNull(){const e=await this.execute();return y(e,this.auth,"internal-error"),e}async onExecution(){pe(this.filter.length===1,"Popup operations only handle one event");const e=oi();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(t=>{this.reject(t)}),this.resolver._isIframeWebStorageSupported(this.auth,t=>{t||this.reject(ie(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){var e;return((e=this.authWindow)===null||e===void 0?void 0:e.associatedEvent)||null}cancel(){this.reject(ie(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,Ye.currentPopupAction=null}pollUserCancellation(){const e=()=>{var t,s;if(!((s=(t=this.authWindow)===null||t===void 0?void 0:t.window)===null||s===void 0)&&s.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(ie(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,bu.get())};e()}}Ye.currentPopupAction=null;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const xu="pendingRedirect",ln=new Map;class Eu extends pa{constructor(e,t,s=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],t,void 0,s),this.eventId=null}async execute(){let e=ln.get(this.auth._key());if(!e){try{const s=await Iu(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(s)}catch(t){e=()=>Promise.reject(t)}ln.set(this.auth._key(),e)}return this.bypassAuthState||ln.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){const t=await this.auth._redirectUserForId(e.eventId);if(t)return this.user=t,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}}async function Iu(n,e){const t=ku(e),s=Nu(n);if(!await s._isAvailable())return!1;const i=await s._get(t)==="true";return await s._remove(t),i}function Cu(n,e){ln.set(n._key(),e)}function Nu(n){return de(n._redirectPersistence)}function ku(n){return an(xu,n.config.apiKey,n.name)}async function Tu(n,e,t=!1){if(ae(n.app))return Promise.reject(ke(n));const s=ut(n),i=_u(s,e),o=await new Eu(s,i,t).execute();return o&&!t&&(delete o.user._redirectEventId,await s._persistUserIfCurrent(o.user),await s._setRedirectUser(null,e)),o}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Su=10*60*1e3;class Ru{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let t=!1;return this.consumers.forEach(s=>{this.isEventForConsumer(e,s)&&(t=!0,this.sendToConsumer(e,s),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!Au(e)||(this.hasHandledPotentialRedirect=!0,t||(this.queuedRedirectEvent=e,t=!0)),t}sendToConsumer(e,t){var s;if(e.error&&!ma(e)){const i=((s=e.error.code)===null||s===void 0?void 0:s.split("auth/")[1])||"internal-error";t.onError(ie(this.auth,i))}else t.onAuthEvent(e)}isEventForConsumer(e,t){const s=t.eventId===null||!!e.eventId&&e.eventId===t.eventId;return t.filter.includes(e.type)&&s}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=Su&&this.cachedEventUids.clear(),this.cachedEventUids.has(gr(e))}saveEventToCache(e){this.cachedEventUids.add(gr(e)),this.lastProcessedEventTime=Date.now()}}function gr(n){return[n.type,n.eventId,n.sessionId,n.tenantId].filter(e=>e).join("-")}function ma({type:n,error:e}){return n==="unknown"&&(e==null?void 0:e.code)==="auth/no-auth-event"}function Au(n){switch(n.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return ma(n);default:return!1}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Pu(n,e={}){return Pe(n,"GET","/v1/projects",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ou=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,Du=/^https?/;async function ju(n){if(n.config.emulator)return;const{authorizedDomains:e}=await Pu(n);for(const t of e)try{if(Mu(t))return}catch{}ne(n,"unauthorized-domain")}function Mu(n){const e=Ns(),{protocol:t,hostname:s}=new URL(e);if(n.startsWith("chrome-extension://")){const o=new URL(n);return o.hostname===""&&s===""?t==="chrome-extension:"&&n.replace("chrome-extension://","")===e.replace("chrome-extension://",""):t==="chrome-extension:"&&o.hostname===s}if(!Du.test(t))return!1;if(Ou.test(n))return s===n;const i=n.replace(/\./g,"\\.");return new RegExp("^(.+\\."+i+"|"+i+")$","i").test(s)}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Lu=new Bt(3e4,6e4);function _r(){const n=re().___jsl;if(n!=null&&n.H){for(const e of Object.keys(n.H))if(n.H[e].r=n.H[e].r||[],n.H[e].L=n.H[e].L||[],n.H[e].r=[...n.H[e].L],n.CP)for(let t=0;t<n.CP.length;t++)n.CP[t]=null}}function Fu(n){return new Promise((e,t)=>{var s,i,r;function o(){_r(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{_r(),t(ie(n,"network-request-failed"))},timeout:Lu.get()})}if(!((i=(s=re().gapi)===null||s===void 0?void 0:s.iframes)===null||i===void 0)&&i.Iframe)e(gapi.iframes.getContext());else if(!((r=re().gapi)===null||r===void 0)&&r.load)o();else{const l=Ah("iframefcb");return re()[l]=()=>{gapi.load?o():t(ie(n,"network-request-failed"))},ta(`${Rh()}?onload=${l}`).catch(c=>t(c))}}).catch(e=>{throw cn=null,e})}let cn=null;function Uu(n){return cn=cn||Fu(n),cn}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Wu=new Bt(5e3,15e3),Hu="__/auth/iframe",Vu="emulator/auth/iframe",Bu={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},$u=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function qu(n){const e=n.config;y(e.authDomain,n,"auth-domain-config-required");const t=e.emulator?ti(e,Vu):`https://${n.config.authDomain}/${Hu}`,s={apiKey:e.apiKey,appName:n.name,v:ht},i=$u.get(n.config.apiHost);i&&(s.eid=i);const r=n._getFrameworks();return r.length&&(s.fw=r.join(",")),`${t}?${dt(s).slice(1)}`}async function zu(n){const e=await Uu(n),t=re().gapi;return y(t,n,"internal-error"),e.open({where:document.body,url:qu(n),messageHandlersFilter:t.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:Bu,dontclear:!0},s=>new Promise(async(i,r)=>{await s.restyle({setHideOnLeave:!1});const o=ie(n,"network-request-failed"),l=re().setTimeout(()=>{r(o)},Wu.get());function c(){re().clearTimeout(l),i(s)}s.ping(c).then(c,()=>{r(o)})}))}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Gu={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},Ku=500,Yu=600,Qu="_blank",Ju="http://localhost";class vr{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}}function Xu(n,e,t,s=Ku,i=Yu){const r=Math.max((window.screen.availHeight-i)/2,0).toString(),o=Math.max((window.screen.availWidth-s)/2,0).toString();let l="";const c=Object.assign(Object.assign({},Gu),{width:s.toString(),height:i.toString(),top:r,left:o}),d=z().toLowerCase();t&&(l=Ko(d)?Qu:t),zo(d)&&(e=e||Ju,c.scrollbars="yes");const u=Object.entries(c).reduce((f,[g,_])=>`${f}${g}=${_},`,"");if(bh(d)&&l!=="_self")return Zu(e||"",l),new vr(null);const h=window.open(e||"",l,u);y(h,n,"popup-blocked");try{h.focus()}catch{}return new vr(h)}function Zu(n,e){const t=document.createElement("a");t.href=n,t.target=e;const s=document.createEvent("MouseEvent");s.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),t.dispatchEvent(s)}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ef="__/auth/handler",tf="emulator/auth/handler",nf=encodeURIComponent("fac");async function yr(n,e,t,s,i,r){y(n.config.authDomain,n,"auth-domain-config-required"),y(n.config.apiKey,n,"invalid-api-key");const o={apiKey:n.config.apiKey,appName:n.name,authType:t,redirectUrl:s,v:ht,eventId:i};if(e instanceof sa){e.setDefaultLanguage(n.languageCode),o.providerId=e.providerId||"",ws(e.getCustomParameters())||(o.customParameters=JSON.stringify(e.getCustomParameters()));for(const[u,h]of Object.entries({}))o[u]=h}if(e instanceof $t){const u=e.getScopes().filter(h=>h!=="");u.length>0&&(o.scopes=u.join(","))}n.tenantId&&(o.tid=n.tenantId);const l=o;for(const u of Object.keys(l))l[u]===void 0&&delete l[u];const c=await n._getAppCheckToken(),d=c?`#${nf}=${encodeURIComponent(c)}`:"";return`${sf(n)}?${dt(l).slice(1)}${d}`}function sf({config:n}){return n.emulator?ti(n,tf):`https://${n.authDomain}/${ef}`}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const as="webStorageSupport";class rf{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=ca,this._completeRedirectFn=Tu,this._overrideRedirectResult=Cu}async _openPopup(e,t,s,i){var r;pe((r=this.eventManagers[e._key()])===null||r===void 0?void 0:r.manager,"_initialize() not called before _openPopup()");const o=await yr(e,t,s,Ns(),i);return Xu(e,o,oi())}async _openRedirect(e,t,s,i){await this._originValidation(e);const r=await yr(e,t,s,Ns(),i);return au(r),new Promise(()=>{})}_initialize(e){const t=e._key();if(this.eventManagers[t]){const{manager:i,promise:r}=this.eventManagers[t];return i?Promise.resolve(i):(pe(r,"If manager is not set, promise should be"),r)}const s=this.initAndGetManager(e);return this.eventManagers[t]={promise:s},s.catch(()=>{delete this.eventManagers[t]}),s}async initAndGetManager(e){const t=await zu(e),s=new Ru(e);return t.register("authEvent",i=>(y(i==null?void 0:i.authEvent,e,"invalid-auth-event"),{status:s.onEvent(i.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:s},this.iframes[e._key()]=t,s}_isIframeWebStorageSupported(e,t){this.iframes[e._key()].send(as,{type:as},i=>{var r;const o=(r=i==null?void 0:i[0])===null||r===void 0?void 0:r[as];o!==void 0&&t(!!o),ne(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){const t=e._key();return this.originValidationPromises[t]||(this.originValidationPromises[t]=ju(e)),this.originValidationPromises[t]}get _shouldInitProactively(){return Zo()||Go()||si()}}const of=rf;var wr="@firebase/auth",br="1.7.9";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class af{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),((e=this.auth.currentUser)===null||e===void 0?void 0:e.uid)||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const t=this.auth.onIdTokenChanged(s=>{e((s==null?void 0:s.stsTokenManager.accessToken)||null)});this.internalListeners.set(e,t),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const t=this.internalListeners.get(e);t&&(this.internalListeners.delete(e),t(),this.updateProactiveRefresh())}assertAuthConfigured(){y(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function lf(n){switch(n){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function cf(n){it(new We("auth",(e,{options:t})=>{const s=e.getProvider("app").getImmediate(),i=e.getProvider("heartbeat"),r=e.getProvider("app-check-internal"),{apiKey:o,authDomain:l}=s.options;y(o&&!o.includes(":"),"invalid-api-key",{appName:s.name});const c={apiKey:o,authDomain:l,clientPlatform:n,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:ea(n)},d=new kh(s,i,r,c);return Mh(d,t),d},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,t,s)=>{e.getProvider("auth-internal").initialize()})),it(new We("auth-internal",e=>{const t=ut(e.getProvider("auth").getImmediate());return(s=>new af(s))(t)},"PRIVATE").setInstantiationMode("EXPLICIT")),Ne(wr,br,lf(n)),Ne(wr,br,"esm2017")}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const df=5*60,hf=ko("authIdTokenMaxAge")||df;let xr=null;const uf=n=>async e=>{const t=e&&await e.getIdTokenResult(),s=t&&(new Date().getTime()-Date.parse(t.issuedAtTime))/1e3;if(s&&s>hf)return;const i=t==null?void 0:t.token;xr!==i&&(xr=i,await fetch(n,{method:i?"POST":"DELETE",headers:i?{Authorization:`Bearer ${i}`}:{}}))};function ff(n=Do()){const e=Xs(n,"auth");if(e.isInitialized())return e.getImmediate();const t=jh(n,{popupRedirectResolver:of,persistence:[gu,iu,ca]}),s=ko("authTokenSyncURL");if(s&&typeof isSecureContext=="boolean"&&isSecureContext){const r=new URL(s,location.origin);if(location.origin===r.origin){const o=uf(r.toString());Zh(t,o,()=>o(t.currentUser)),Xh(t,l=>o(l))}}const i=Co("auth");return i&&Lh(t,`http://${i}`),t}function pf(){var n,e;return(e=(n=document.getElementsByTagName("head"))===null||n===void 0?void 0:n[0])!==null&&e!==void 0?e:document}Th({loadJS(n){return new Promise((e,t)=>{const s=document.createElement("script");s.setAttribute("src",n),s.onload=e,s.onerror=i=>{const r=ie("internal-error");r.customData=i,t(r)},s.type="text/javascript",s.charset="UTF-8",pf().appendChild(s)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});cf("Browser");var Er={};const Ir="@firebase/database",Cr="1.0.8";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let ga="";function mf(n){ga=n}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gf{constructor(e){this.domStorage_=e,this.prefix_="firebase:"}set(e,t){t==null?this.domStorage_.removeItem(this.prefixedName_(e)):this.domStorage_.setItem(this.prefixedName_(e),H(t))}get(e){const t=this.domStorage_.getItem(this.prefixedName_(e));return t==null?null:Rt(t)}remove(e){this.domStorage_.removeItem(this.prefixedName_(e))}prefixedName_(e){return this.prefix_+e}toString(){return this.domStorage_.toString()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _f{constructor(){this.cache_={},this.isInMemoryStorage=!0}set(e,t){t==null?delete this.cache_[e]:this.cache_[e]=t}get(e){return _e(this.cache_,e)?this.cache_[e]:null}remove(e){delete this.cache_[e]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const _a=function(n){try{if(typeof window<"u"&&typeof window[n]<"u"){const e=window[n];return e.setItem("firebase:sentinel","cache"),e.removeItem("firebase:sentinel"),new gf(e)}}catch{}return new _f},Fe=_a("localStorage"),vf=_a("sessionStorage");/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const et=new Qs("@firebase/database"),yf=function(){let n=1;return function(){return n++}}(),va=function(n){const e=zc(n),t=new Vc;t.update(e);const s=t.digest();return zs.encodeByteArray(s)},zt=function(...n){let e="";for(let t=0;t<n.length;t++){const s=n[t];Array.isArray(s)||s&&typeof s=="object"&&typeof s.length=="number"?e+=zt.apply(null,s):typeof s=="object"?e+=H(s):e+=s,e+=" "}return e};let It=null,Nr=!0;const wf=function(n,e){m(!e,"Can't turn on custom loggers persistently."),et.logLevel=R.VERBOSE,It=et.log.bind(et)},$=function(...n){if(Nr===!0&&(Nr=!1,It===null&&vf.get("logging_enabled")===!0&&wf()),It){const e=zt.apply(null,n);It(e)}},Gt=function(n){return function(...e){$(n,...e)}},Ss=function(...n){const e="FIREBASE INTERNAL ERROR: "+zt(...n);et.error(e)},me=function(...n){const e=`FIREBASE FATAL ERROR: ${zt(...n)}`;throw et.error(e),new Error(e)},Q=function(...n){const e="FIREBASE WARNING: "+zt(...n);et.warn(e)},bf=function(){typeof window<"u"&&window.location&&window.location.protocol&&window.location.protocol.indexOf("https:")!==-1&&Q("Insecure Firebase access from a secure page. Please use https in calls to new Firebase().")},ya=function(n){return typeof n=="number"&&(n!==n||n===Number.POSITIVE_INFINITY||n===Number.NEGATIVE_INFINITY)},xf=function(n){if(document.readyState==="complete")n();else{let e=!1;const t=function(){if(!document.body){setTimeout(t,Math.floor(10));return}e||(e=!0,n())};document.addEventListener?(document.addEventListener("DOMContentLoaded",t,!1),window.addEventListener("load",t,!1)):document.attachEvent&&(document.attachEvent("onreadystatechange",()=>{document.readyState==="complete"&&t()}),window.attachEvent("onload",t))}},ot="[MIN_NAME]",Ve="[MAX_NAME]",pt=function(n,e){if(n===e)return 0;if(n===ot||e===Ve)return-1;if(e===ot||n===Ve)return 1;{const t=kr(n),s=kr(e);return t!==null?s!==null?t-s===0?n.length-e.length:t-s:-1:s!==null?1:n<e?-1:1}},Ef=function(n,e){return n===e?0:n<e?-1:1},_t=function(n,e){if(e&&n in e)return e[n];throw new Error("Missing required key ("+n+") in object: "+H(e))},li=function(n){if(typeof n!="object"||n===null)return H(n);const e=[];for(const s in n)e.push(s);e.sort();let t="{";for(let s=0;s<e.length;s++)s!==0&&(t+=","),t+=H(e[s]),t+=":",t+=li(n[e[s]]);return t+="}",t},wa=function(n,e){const t=n.length;if(t<=e)return[n];const s=[];for(let i=0;i<t;i+=e)i+e>t?s.push(n.substring(i,t)):s.push(n.substring(i,i+e));return s};function J(n,e){for(const t in n)n.hasOwnProperty(t)&&e(t,n[t])}const ba=function(n){m(!ya(n),"Invalid JSON number");const e=11,t=52,s=(1<<e-1)-1;let i,r,o,l,c;n===0?(r=0,o=0,i=1/n===-1/0?1:0):(i=n<0,n=Math.abs(n),n>=Math.pow(2,1-s)?(l=Math.min(Math.floor(Math.log(n)/Math.LN2),s),r=l+s,o=Math.round(n*Math.pow(2,t-l)-Math.pow(2,t))):(r=0,o=Math.round(n/Math.pow(2,1-s-t))));const d=[];for(c=t;c;c-=1)d.push(o%2?1:0),o=Math.floor(o/2);for(c=e;c;c-=1)d.push(r%2?1:0),r=Math.floor(r/2);d.push(i?1:0),d.reverse();const u=d.join("");let h="";for(c=0;c<64;c+=8){let f=parseInt(u.substr(c,8),2).toString(16);f.length===1&&(f="0"+f),h=h+f}return h.toLowerCase()},If=function(){return!!(typeof window=="object"&&window.chrome&&window.chrome.extension&&!/^chrome/.test(window.location.href))},Cf=function(){return typeof Windows=="object"&&typeof Windows.UI=="object"};function Nf(n,e){let t="Unknown Error";n==="too_big"?t="The data requested exceeds the maximum size that can be accessed with a single request.":n==="permission_denied"?t="Client doesn't have permission to access the desired data.":n==="unavailable"&&(t="The service is unavailable");const s=new Error(n+" at "+e._path.toString()+": "+t);return s.code=n.toUpperCase(),s}const kf=new RegExp("^-?(0*)\\d{1,10}$"),Tf=-2147483648,Sf=2147483647,kr=function(n){if(kf.test(n)){const e=Number(n);if(e>=Tf&&e<=Sf)return e}return null},mt=function(n){try{n()}catch(e){setTimeout(()=>{const t=e.stack||"";throw Q("Exception was thrown by user callback.",t),e},Math.floor(0))}},Rf=function(){return(typeof window=="object"&&window.navigator&&window.navigator.userAgent||"").search(/googlebot|google webmaster tools|bingbot|yahoo! slurp|baiduspider|yandexbot|duckduckbot/i)>=0},Ct=function(n,e){const t=setTimeout(n,e);return typeof t=="number"&&typeof Deno<"u"&&Deno.unrefTimer?Deno.unrefTimer(t):typeof t=="object"&&t.unref&&t.unref(),t};/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Af{constructor(e,t){this.appName_=e,this.appCheckProvider=t,this.appCheck=t==null?void 0:t.getImmediate({optional:!0}),this.appCheck||t==null||t.get().then(s=>this.appCheck=s)}getToken(e){return this.appCheck?this.appCheck.getToken(e):new Promise((t,s)=>{setTimeout(()=>{this.appCheck?this.getToken(e).then(t,s):t(null)},0)})}addTokenChangeListener(e){var t;(t=this.appCheckProvider)===null||t===void 0||t.get().then(s=>s.addTokenListener(e))}notifyForInvalidToken(){Q(`Provided AppCheck credentials for the app named "${this.appName_}" are invalid. This usually indicates your app was not initialized correctly.`)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Pf{constructor(e,t,s){this.appName_=e,this.firebaseOptions_=t,this.authProvider_=s,this.auth_=null,this.auth_=s.getImmediate({optional:!0}),this.auth_||s.onInit(i=>this.auth_=i)}getToken(e){return this.auth_?this.auth_.getToken(e).catch(t=>t&&t.code==="auth/token-not-initialized"?($("Got auth/token-not-initialized error.  Treating as null token."),null):Promise.reject(t)):new Promise((t,s)=>{setTimeout(()=>{this.auth_?this.getToken(e).then(t,s):t(null)},0)})}addTokenChangeListener(e){this.auth_?this.auth_.addAuthTokenListener(e):this.authProvider_.get().then(t=>t.addAuthTokenListener(e))}removeTokenChangeListener(e){this.authProvider_.get().then(t=>t.removeAuthTokenListener(e))}notifyForInvalidToken(){let e='Provided authentication credentials for the app named "'+this.appName_+'" are invalid. This usually indicates your app was not initialized correctly. ';"credential"in this.firebaseOptions_?e+='Make sure the "credential" property provided to initializeApp() is authorized to access the specified "databaseURL" and is from the correct project.':"serviceAccount"in this.firebaseOptions_?e+='Make sure the "serviceAccount" property provided to initializeApp() is authorized to access the specified "databaseURL" and is from the correct project.':e+='Make sure the "apiKey" and "databaseURL" properties provided to initializeApp() match the values provided for your app at https://console.firebase.google.com/.',Q(e)}}class dn{constructor(e){this.accessToken=e}getToken(e){return Promise.resolve({accessToken:this.accessToken})}addTokenChangeListener(e){e(this.accessToken)}removeTokenChangeListener(e){}notifyForInvalidToken(){}}dn.OWNER="owner";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ci="5",xa="v",Ea="s",Ia="r",Ca="f",Na=/(console\.firebase|firebase-console-\w+\.corp|firebase\.corp)\.google\.com/,ka="ls",Ta="p",Rs="ac",Sa="websocket",Ra="long_polling";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Aa{constructor(e,t,s,i,r=!1,o="",l=!1,c=!1){this.secure=t,this.namespace=s,this.webSocketOnly=i,this.nodeAdmin=r,this.persistenceKey=o,this.includeNamespaceInQueryParams=l,this.isUsingEmulator=c,this._host=e.toLowerCase(),this._domain=this._host.substr(this._host.indexOf(".")+1),this.internalHost=Fe.get("host:"+e)||this._host}isCacheableHost(){return this.internalHost.substr(0,2)==="s-"}isCustomHost(){return this._domain!=="firebaseio.com"&&this._domain!=="firebaseio-demo.com"}get host(){return this._host}set host(e){e!==this.internalHost&&(this.internalHost=e,this.isCacheableHost()&&Fe.set("host:"+this._host,this.internalHost))}toString(){let e=this.toURLString();return this.persistenceKey&&(e+="<"+this.persistenceKey+">"),e}toURLString(){const e=this.secure?"https://":"http://",t=this.includeNamespaceInQueryParams?`?ns=${this.namespace}`:"";return`${e}${this.host}/${t}`}}function Of(n){return n.host!==n.internalHost||n.isCustomHost()||n.includeNamespaceInQueryParams}function Pa(n,e,t){m(typeof e=="string","typeof type must == string"),m(typeof t=="object","typeof params must == object");let s;if(e===Sa)s=(n.secure?"wss://":"ws://")+n.internalHost+"/.ws?";else if(e===Ra)s=(n.secure?"https://":"http://")+n.internalHost+"/.lp?";else throw new Error("Unknown connection type: "+e);Of(n)&&(t.ns=n.namespace);const i=[];return J(t,(r,o)=>{i.push(r+"="+o)}),s+i.join("&")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Df{constructor(){this.counters_={}}incrementCounter(e,t=1){_e(this.counters_,e)||(this.counters_[e]=0),this.counters_[e]+=t}get(){return Ic(this.counters_)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ls={},cs={};function di(n){const e=n.toString();return ls[e]||(ls[e]=new Df),ls[e]}function jf(n,e){const t=n.toString();return cs[t]||(cs[t]=e()),cs[t]}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Mf{constructor(e){this.onMessage_=e,this.pendingResponses=[],this.currentResponseNum=0,this.closeAfterResponse=-1,this.onClose=null}closeAfter(e,t){this.closeAfterResponse=e,this.onClose=t,this.closeAfterResponse<this.currentResponseNum&&(this.onClose(),this.onClose=null)}handleResponse(e,t){for(this.pendingResponses[e]=t;this.pendingResponses[this.currentResponseNum];){const s=this.pendingResponses[this.currentResponseNum];delete this.pendingResponses[this.currentResponseNum];for(let i=0;i<s.length;++i)s[i]&&mt(()=>{this.onMessage_(s[i])});if(this.currentResponseNum===this.closeAfterResponse){this.onClose&&(this.onClose(),this.onClose=null);break}this.currentResponseNum++}}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Tr="start",Lf="close",Ff="pLPCommand",Uf="pRTLPCB",Oa="id",Da="pw",ja="ser",Wf="cb",Hf="seg",Vf="ts",Bf="d",$f="dframe",Ma=1870,La=30,qf=Ma-La,zf=25e3,Gf=3e4;class Qe{constructor(e,t,s,i,r,o,l){this.connId=e,this.repoInfo=t,this.applicationId=s,this.appCheckToken=i,this.authToken=r,this.transportSessionId=o,this.lastSessionId=l,this.bytesSent=0,this.bytesReceived=0,this.everConnected_=!1,this.log_=Gt(e),this.stats_=di(t),this.urlFn=c=>(this.appCheckToken&&(c[Rs]=this.appCheckToken),Pa(t,Ra,c))}open(e,t){this.curSegmentNum=0,this.onDisconnect_=t,this.myPacketOrderer=new Mf(e),this.isClosed_=!1,this.connectTimeoutTimer_=setTimeout(()=>{this.log_("Timed out trying to connect."),this.onClosed_(),this.connectTimeoutTimer_=null},Math.floor(Gf)),xf(()=>{if(this.isClosed_)return;this.scriptTagHolder=new hi((...r)=>{const[o,l,c,d,u]=r;if(this.incrementIncomingBytes_(r),!!this.scriptTagHolder)if(this.connectTimeoutTimer_&&(clearTimeout(this.connectTimeoutTimer_),this.connectTimeoutTimer_=null),this.everConnected_=!0,o===Tr)this.id=l,this.password=c;else if(o===Lf)l?(this.scriptTagHolder.sendNewPolls=!1,this.myPacketOrderer.closeAfter(l,()=>{this.onClosed_()})):this.onClosed_();else throw new Error("Unrecognized command received: "+o)},(...r)=>{const[o,l]=r;this.incrementIncomingBytes_(r),this.myPacketOrderer.handleResponse(o,l)},()=>{this.onClosed_()},this.urlFn);const s={};s[Tr]="t",s[ja]=Math.floor(Math.random()*1e8),this.scriptTagHolder.uniqueCallbackIdentifier&&(s[Wf]=this.scriptTagHolder.uniqueCallbackIdentifier),s[xa]=ci,this.transportSessionId&&(s[Ea]=this.transportSessionId),this.lastSessionId&&(s[ka]=this.lastSessionId),this.applicationId&&(s[Ta]=this.applicationId),this.appCheckToken&&(s[Rs]=this.appCheckToken),typeof location<"u"&&location.hostname&&Na.test(location.hostname)&&(s[Ia]=Ca);const i=this.urlFn(s);this.log_("Connecting via long-poll to "+i),this.scriptTagHolder.addTag(i,()=>{})})}start(){this.scriptTagHolder.startLongPoll(this.id,this.password),this.addDisconnectPingFrame(this.id,this.password)}static forceAllow(){Qe.forceAllow_=!0}static forceDisallow(){Qe.forceDisallow_=!0}static isAvailable(){return Qe.forceAllow_?!0:!Qe.forceDisallow_&&typeof document<"u"&&document.createElement!=null&&!If()&&!Cf()}markConnectionHealthy(){}shutdown_(){this.isClosed_=!0,this.scriptTagHolder&&(this.scriptTagHolder.close(),this.scriptTagHolder=null),this.myDisconnFrame&&(document.body.removeChild(this.myDisconnFrame),this.myDisconnFrame=null),this.connectTimeoutTimer_&&(clearTimeout(this.connectTimeoutTimer_),this.connectTimeoutTimer_=null)}onClosed_(){this.isClosed_||(this.log_("Longpoll is closing itself"),this.shutdown_(),this.onDisconnect_&&(this.onDisconnect_(this.everConnected_),this.onDisconnect_=null))}close(){this.isClosed_||(this.log_("Longpoll is being closed."),this.shutdown_())}send(e){const t=H(e);this.bytesSent+=t.length,this.stats_.incrementCounter("bytes_sent",t.length);const s=Eo(t),i=wa(s,qf);for(let r=0;r<i.length;r++)this.scriptTagHolder.enqueueSegment(this.curSegmentNum,i.length,i[r]),this.curSegmentNum++}addDisconnectPingFrame(e,t){this.myDisconnFrame=document.createElement("iframe");const s={};s[$f]="t",s[Oa]=e,s[Da]=t,this.myDisconnFrame.src=this.urlFn(s),this.myDisconnFrame.style.display="none",document.body.appendChild(this.myDisconnFrame)}incrementIncomingBytes_(e){const t=H(e).length;this.bytesReceived+=t,this.stats_.incrementCounter("bytes_received",t)}}class hi{constructor(e,t,s,i){this.onDisconnect=s,this.urlFn=i,this.outstandingRequests=new Set,this.pendingSegs=[],this.currentSerial=Math.floor(Math.random()*1e8),this.sendNewPolls=!0;{this.uniqueCallbackIdentifier=yf(),window[Ff+this.uniqueCallbackIdentifier]=e,window[Uf+this.uniqueCallbackIdentifier]=t,this.myIFrame=hi.createIFrame_();let r="";this.myIFrame.src&&this.myIFrame.src.substr(0,11)==="javascript:"&&(r='<script>document.domain="'+document.domain+'";<\/script>');const o="<html><body>"+r+"</body></html>";try{this.myIFrame.doc.open(),this.myIFrame.doc.write(o),this.myIFrame.doc.close()}catch(l){$("frame writing exception"),l.stack&&$(l.stack),$(l)}}}static createIFrame_(){const e=document.createElement("iframe");if(e.style.display="none",document.body){document.body.appendChild(e);try{e.contentWindow.document||$("No IE domain setting required")}catch{const s=document.domain;e.src="javascript:void((function(){document.open();document.domain='"+s+"';document.close();})())"}}else throw"Document body has not initialized. Wait to initialize Firebase until after the document is ready.";return e.contentDocument?e.doc=e.contentDocument:e.contentWindow?e.doc=e.contentWindow.document:e.document&&(e.doc=e.document),e}close(){this.alive=!1,this.myIFrame&&(this.myIFrame.doc.body.textContent="",setTimeout(()=>{this.myIFrame!==null&&(document.body.removeChild(this.myIFrame),this.myIFrame=null)},Math.floor(0)));const e=this.onDisconnect;e&&(this.onDisconnect=null,e())}startLongPoll(e,t){for(this.myID=e,this.myPW=t,this.alive=!0;this.newRequest_(););}newRequest_(){if(this.alive&&this.sendNewPolls&&this.outstandingRequests.size<(this.pendingSegs.length>0?2:1)){this.currentSerial++;const e={};e[Oa]=this.myID,e[Da]=this.myPW,e[ja]=this.currentSerial;let t=this.urlFn(e),s="",i=0;for(;this.pendingSegs.length>0&&this.pendingSegs[0].d.length+La+s.length<=Ma;){const o=this.pendingSegs.shift();s=s+"&"+Hf+i+"="+o.seg+"&"+Vf+i+"="+o.ts+"&"+Bf+i+"="+o.d,i++}return t=t+s,this.addLongPollTag_(t,this.currentSerial),!0}else return!1}enqueueSegment(e,t,s){this.pendingSegs.push({seg:e,ts:t,d:s}),this.alive&&this.newRequest_()}addLongPollTag_(e,t){this.outstandingRequests.add(t);const s=()=>{this.outstandingRequests.delete(t),this.newRequest_()},i=setTimeout(s,Math.floor(zf)),r=()=>{clearTimeout(i),s()};this.addTag(e,r)}addTag(e,t){setTimeout(()=>{try{if(!this.sendNewPolls)return;const s=this.myIFrame.doc.createElement("script");s.type="text/javascript",s.async=!0,s.src=e,s.onload=s.onreadystatechange=function(){const i=s.readyState;(!i||i==="loaded"||i==="complete")&&(s.onload=s.onreadystatechange=null,s.parentNode&&s.parentNode.removeChild(s),t())},s.onerror=()=>{$("Long-poll script failed to load: "+e),this.sendNewPolls=!1,this.close()},this.myIFrame.doc.body.appendChild(s)}catch{}},Math.floor(1))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Kf=16384,Yf=45e3;let bn=null;typeof MozWebSocket<"u"?bn=MozWebSocket:typeof WebSocket<"u"&&(bn=WebSocket);class X{constructor(e,t,s,i,r,o,l){this.connId=e,this.applicationId=s,this.appCheckToken=i,this.authToken=r,this.keepaliveTimer=null,this.frames=null,this.totalFrames=0,this.bytesSent=0,this.bytesReceived=0,this.log_=Gt(this.connId),this.stats_=di(t),this.connURL=X.connectionURL_(t,o,l,i,s),this.nodeAdmin=t.nodeAdmin}static connectionURL_(e,t,s,i,r){const o={};return o[xa]=ci,typeof location<"u"&&location.hostname&&Na.test(location.hostname)&&(o[Ia]=Ca),t&&(o[Ea]=t),s&&(o[ka]=s),i&&(o[Rs]=i),r&&(o[Ta]=r),Pa(e,Sa,o)}open(e,t){this.onDisconnect=t,this.onMessage=e,this.log_("Websocket connecting to "+this.connURL),this.everConnected_=!1,Fe.set("previous_websocket_failure",!0);try{let s;So(),this.mySock=new bn(this.connURL,[],s)}catch(s){this.log_("Error instantiating WebSocket.");const i=s.message||s.data;i&&this.log_(i),this.onClosed_();return}this.mySock.onopen=()=>{this.log_("Websocket connected."),this.everConnected_=!0},this.mySock.onclose=()=>{this.log_("Websocket connection was disconnected."),this.mySock=null,this.onClosed_()},this.mySock.onmessage=s=>{this.handleIncomingFrame(s)},this.mySock.onerror=s=>{this.log_("WebSocket error.  Closing connection.");const i=s.message||s.data;i&&this.log_(i),this.onClosed_()}}start(){}static forceDisallow(){X.forceDisallow_=!0}static isAvailable(){let e=!1;if(typeof navigator<"u"&&navigator.userAgent){const t=/Android ([0-9]{0,}\.[0-9]{0,})/,s=navigator.userAgent.match(t);s&&s.length>1&&parseFloat(s[1])<4.4&&(e=!0)}return!e&&bn!==null&&!X.forceDisallow_}static previouslyFailed(){return Fe.isInMemoryStorage||Fe.get("previous_websocket_failure")===!0}markConnectionHealthy(){Fe.remove("previous_websocket_failure")}appendFrame_(e){if(this.frames.push(e),this.frames.length===this.totalFrames){const t=this.frames.join("");this.frames=null;const s=Rt(t);this.onMessage(s)}}handleNewFrameCount_(e){this.totalFrames=e,this.frames=[]}extractFrameCount_(e){if(m(this.frames===null,"We already have a frame buffer"),e.length<=6){const t=Number(e);if(!isNaN(t))return this.handleNewFrameCount_(t),null}return this.handleNewFrameCount_(1),e}handleIncomingFrame(e){if(this.mySock===null)return;const t=e.data;if(this.bytesReceived+=t.length,this.stats_.incrementCounter("bytes_received",t.length),this.resetKeepAlive(),this.frames!==null)this.appendFrame_(t);else{const s=this.extractFrameCount_(t);s!==null&&this.appendFrame_(s)}}send(e){this.resetKeepAlive();const t=H(e);this.bytesSent+=t.length,this.stats_.incrementCounter("bytes_sent",t.length);const s=wa(t,Kf);s.length>1&&this.sendString_(String(s.length));for(let i=0;i<s.length;i++)this.sendString_(s[i])}shutdown_(){this.isClosed_=!0,this.keepaliveTimer&&(clearInterval(this.keepaliveTimer),this.keepaliveTimer=null),this.mySock&&(this.mySock.close(),this.mySock=null)}onClosed_(){this.isClosed_||(this.log_("WebSocket is closing itself"),this.shutdown_(),this.onDisconnect&&(this.onDisconnect(this.everConnected_),this.onDisconnect=null))}close(){this.isClosed_||(this.log_("WebSocket is being closed"),this.shutdown_())}resetKeepAlive(){clearInterval(this.keepaliveTimer),this.keepaliveTimer=setInterval(()=>{this.mySock&&this.sendString_("0"),this.resetKeepAlive()},Math.floor(Yf))}sendString_(e){try{this.mySock.send(e)}catch(t){this.log_("Exception thrown from WebSocket.send():",t.message||t.data,"Closing connection."),setTimeout(this.onClosed_.bind(this),0)}}}X.responsesRequiredToBeHealthy=2;X.healthyTimeout=3e4;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Dt{constructor(e){this.initTransports_(e)}static get ALL_TRANSPORTS(){return[Qe,X]}static get IS_TRANSPORT_INITIALIZED(){return this.globalTransportInitialized_}initTransports_(e){const t=X&&X.isAvailable();let s=t&&!X.previouslyFailed();if(e.webSocketOnly&&(t||Q("wss:// URL used, but browser isn't known to support websockets.  Trying anyway."),s=!0),s)this.transports_=[X];else{const i=this.transports_=[];for(const r of Dt.ALL_TRANSPORTS)r&&r.isAvailable()&&i.push(r);Dt.globalTransportInitialized_=!0}}initialTransport(){if(this.transports_.length>0)return this.transports_[0];throw new Error("No transports available")}upgradeTransport(){return this.transports_.length>1?this.transports_[1]:null}}Dt.globalTransportInitialized_=!1;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Qf=6e4,Jf=5e3,Xf=10*1024,Zf=100*1024,ds="t",Sr="d",ep="s",Rr="r",tp="e",Ar="o",Pr="a",Or="n",Dr="p",np="h";class sp{constructor(e,t,s,i,r,o,l,c,d,u){this.id=e,this.repoInfo_=t,this.applicationId_=s,this.appCheckToken_=i,this.authToken_=r,this.onMessage_=o,this.onReady_=l,this.onDisconnect_=c,this.onKill_=d,this.lastSessionId=u,this.connectionCount=0,this.pendingDataMessages=[],this.state_=0,this.log_=Gt("c:"+this.id+":"),this.transportManager_=new Dt(t),this.log_("Connection created"),this.start_()}start_(){const e=this.transportManager_.initialTransport();this.conn_=new e(this.nextTransportId_(),this.repoInfo_,this.applicationId_,this.appCheckToken_,this.authToken_,null,this.lastSessionId),this.primaryResponsesRequired_=e.responsesRequiredToBeHealthy||0;const t=this.connReceiver_(this.conn_),s=this.disconnReceiver_(this.conn_);this.tx_=this.conn_,this.rx_=this.conn_,this.secondaryConn_=null,this.isHealthy_=!1,setTimeout(()=>{this.conn_&&this.conn_.open(t,s)},Math.floor(0));const i=e.healthyTimeout||0;i>0&&(this.healthyTimeout_=Ct(()=>{this.healthyTimeout_=null,this.isHealthy_||(this.conn_&&this.conn_.bytesReceived>Zf?(this.log_("Connection exceeded healthy timeout but has received "+this.conn_.bytesReceived+" bytes.  Marking connection healthy."),this.isHealthy_=!0,this.conn_.markConnectionHealthy()):this.conn_&&this.conn_.bytesSent>Xf?this.log_("Connection exceeded healthy timeout but has sent "+this.conn_.bytesSent+" bytes.  Leaving connection alive."):(this.log_("Closing unhealthy connection after timeout."),this.close()))},Math.floor(i)))}nextTransportId_(){return"c:"+this.id+":"+this.connectionCount++}disconnReceiver_(e){return t=>{e===this.conn_?this.onConnectionLost_(t):e===this.secondaryConn_?(this.log_("Secondary connection lost."),this.onSecondaryConnectionLost_()):this.log_("closing an old connection")}}connReceiver_(e){return t=>{this.state_!==2&&(e===this.rx_?this.onPrimaryMessageReceived_(t):e===this.secondaryConn_?this.onSecondaryMessageReceived_(t):this.log_("message on old connection"))}}sendRequest(e){const t={t:"d",d:e};this.sendData_(t)}tryCleanupConnection(){this.tx_===this.secondaryConn_&&this.rx_===this.secondaryConn_&&(this.log_("cleaning up and promoting a connection: "+this.secondaryConn_.connId),this.conn_=this.secondaryConn_,this.secondaryConn_=null)}onSecondaryControl_(e){if(ds in e){const t=e[ds];t===Pr?this.upgradeIfSecondaryHealthy_():t===Rr?(this.log_("Got a reset on secondary, closing it"),this.secondaryConn_.close(),(this.tx_===this.secondaryConn_||this.rx_===this.secondaryConn_)&&this.close()):t===Ar&&(this.log_("got pong on secondary."),this.secondaryResponsesRequired_--,this.upgradeIfSecondaryHealthy_())}}onSecondaryMessageReceived_(e){const t=_t("t",e),s=_t("d",e);if(t==="c")this.onSecondaryControl_(s);else if(t==="d")this.pendingDataMessages.push(s);else throw new Error("Unknown protocol layer: "+t)}upgradeIfSecondaryHealthy_(){this.secondaryResponsesRequired_<=0?(this.log_("Secondary connection is healthy."),this.isHealthy_=!0,this.secondaryConn_.markConnectionHealthy(),this.proceedWithUpgrade_()):(this.log_("sending ping on secondary."),this.secondaryConn_.send({t:"c",d:{t:Dr,d:{}}}))}proceedWithUpgrade_(){this.secondaryConn_.start(),this.log_("sending client ack on secondary"),this.secondaryConn_.send({t:"c",d:{t:Pr,d:{}}}),this.log_("Ending transmission on primary"),this.conn_.send({t:"c",d:{t:Or,d:{}}}),this.tx_=this.secondaryConn_,this.tryCleanupConnection()}onPrimaryMessageReceived_(e){const t=_t("t",e),s=_t("d",e);t==="c"?this.onControl_(s):t==="d"&&this.onDataMessage_(s)}onDataMessage_(e){this.onPrimaryResponse_(),this.onMessage_(e)}onPrimaryResponse_(){this.isHealthy_||(this.primaryResponsesRequired_--,this.primaryResponsesRequired_<=0&&(this.log_("Primary connection is healthy."),this.isHealthy_=!0,this.conn_.markConnectionHealthy()))}onControl_(e){const t=_t(ds,e);if(Sr in e){const s=e[Sr];if(t===np){const i=Object.assign({},s);this.repoInfo_.isUsingEmulator&&(i.h=this.repoInfo_.host),this.onHandshake_(i)}else if(t===Or){this.log_("recvd end transmission on primary"),this.rx_=this.secondaryConn_;for(let i=0;i<this.pendingDataMessages.length;++i)this.onDataMessage_(this.pendingDataMessages[i]);this.pendingDataMessages=[],this.tryCleanupConnection()}else t===ep?this.onConnectionShutdown_(s):t===Rr?this.onReset_(s):t===tp?Ss("Server Error: "+s):t===Ar?(this.log_("got pong on primary."),this.onPrimaryResponse_(),this.sendPingOnPrimaryIfNecessary_()):Ss("Unknown control packet command: "+t)}}onHandshake_(e){const t=e.ts,s=e.v,i=e.h;this.sessionId=e.s,this.repoInfo_.host=i,this.state_===0&&(this.conn_.start(),this.onConnectionEstablished_(this.conn_,t),ci!==s&&Q("Protocol version mismatch detected"),this.tryStartUpgrade_())}tryStartUpgrade_(){const e=this.transportManager_.upgradeTransport();e&&this.startUpgrade_(e)}startUpgrade_(e){this.secondaryConn_=new e(this.nextTransportId_(),this.repoInfo_,this.applicationId_,this.appCheckToken_,this.authToken_,this.sessionId),this.secondaryResponsesRequired_=e.responsesRequiredToBeHealthy||0;const t=this.connReceiver_(this.secondaryConn_),s=this.disconnReceiver_(this.secondaryConn_);this.secondaryConn_.open(t,s),Ct(()=>{this.secondaryConn_&&(this.log_("Timed out trying to upgrade."),this.secondaryConn_.close())},Math.floor(Qf))}onReset_(e){this.log_("Reset packet received.  New host: "+e),this.repoInfo_.host=e,this.state_===1?this.close():(this.closeConnections_(),this.start_())}onConnectionEstablished_(e,t){this.log_("Realtime connection established."),this.conn_=e,this.state_=1,this.onReady_&&(this.onReady_(t,this.sessionId),this.onReady_=null),this.primaryResponsesRequired_===0?(this.log_("Primary connection is healthy."),this.isHealthy_=!0):Ct(()=>{this.sendPingOnPrimaryIfNecessary_()},Math.floor(Jf))}sendPingOnPrimaryIfNecessary_(){!this.isHealthy_&&this.state_===1&&(this.log_("sending ping on primary."),this.sendData_({t:"c",d:{t:Dr,d:{}}}))}onSecondaryConnectionLost_(){const e=this.secondaryConn_;this.secondaryConn_=null,(this.tx_===e||this.rx_===e)&&this.close()}onConnectionLost_(e){this.conn_=null,!e&&this.state_===0?(this.log_("Realtime connection failed."),this.repoInfo_.isCacheableHost()&&(Fe.remove("host:"+this.repoInfo_.host),this.repoInfo_.internalHost=this.repoInfo_.host)):this.state_===1&&this.log_("Realtime connection lost."),this.close()}onConnectionShutdown_(e){this.log_("Connection shutdown command received. Shutting down..."),this.onKill_&&(this.onKill_(e),this.onKill_=null),this.onDisconnect_=null,this.close()}sendData_(e){if(this.state_!==1)throw"Connection is not connected";this.tx_.send(e)}close(){this.state_!==2&&(this.log_("Closing realtime connection."),this.state_=2,this.closeConnections_(),this.onDisconnect_&&(this.onDisconnect_(),this.onDisconnect_=null))}closeConnections_(){this.log_("Shutting down all connections"),this.conn_&&(this.conn_.close(),this.conn_=null),this.secondaryConn_&&(this.secondaryConn_.close(),this.secondaryConn_=null),this.healthyTimeout_&&(clearTimeout(this.healthyTimeout_),this.healthyTimeout_=null)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Fa{put(e,t,s,i){}merge(e,t,s,i){}refreshAuthToken(e){}refreshAppCheckToken(e){}onDisconnectPut(e,t,s){}onDisconnectMerge(e,t,s){}onDisconnectCancel(e,t){}reportStats(e){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ua{constructor(e){this.allowedEvents_=e,this.listeners_={},m(Array.isArray(e)&&e.length>0,"Requires a non-empty array")}trigger(e,...t){if(Array.isArray(this.listeners_[e])){const s=[...this.listeners_[e]];for(let i=0;i<s.length;i++)s[i].callback.apply(s[i].context,t)}}on(e,t,s){this.validateEventType_(e),this.listeners_[e]=this.listeners_[e]||[],this.listeners_[e].push({callback:t,context:s});const i=this.getInitialEvent(e);i&&t.apply(s,i)}off(e,t,s){this.validateEventType_(e);const i=this.listeners_[e]||[];for(let r=0;r<i.length;r++)if(i[r].callback===t&&(!s||s===i[r].context)){i.splice(r,1);return}}validateEventType_(e){m(this.allowedEvents_.find(t=>t===e),"Unknown event: "+e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xn extends Ua{constructor(){super(["online"]),this.online_=!0,typeof window<"u"&&typeof window.addEventListener<"u"&&!Ks()&&(window.addEventListener("online",()=>{this.online_||(this.online_=!0,this.trigger("online",!0))},!1),window.addEventListener("offline",()=>{this.online_&&(this.online_=!1,this.trigger("online",!1))},!1))}static getInstance(){return new xn}getInitialEvent(e){return m(e==="online","Unknown event type: "+e),[this.online_]}currentlyOnline(){return this.online_}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const jr=32,Mr=768;class A{constructor(e,t){if(t===void 0){this.pieces_=e.split("/");let s=0;for(let i=0;i<this.pieces_.length;i++)this.pieces_[i].length>0&&(this.pieces_[s]=this.pieces_[i],s++);this.pieces_.length=s,this.pieceNum_=0}else this.pieces_=e,this.pieceNum_=t}toString(){let e="";for(let t=this.pieceNum_;t<this.pieces_.length;t++)this.pieces_[t]!==""&&(e+="/"+this.pieces_[t]);return e||"/"}}function S(){return new A("")}function C(n){return n.pieceNum_>=n.pieces_.length?null:n.pieces_[n.pieceNum_]}function Se(n){return n.pieces_.length-n.pieceNum_}function O(n){let e=n.pieceNum_;return e<n.pieces_.length&&e++,new A(n.pieces_,e)}function Wa(n){return n.pieceNum_<n.pieces_.length?n.pieces_[n.pieces_.length-1]:null}function ip(n){let e="";for(let t=n.pieceNum_;t<n.pieces_.length;t++)n.pieces_[t]!==""&&(e+="/"+encodeURIComponent(String(n.pieces_[t])));return e||"/"}function Ha(n,e=0){return n.pieces_.slice(n.pieceNum_+e)}function Va(n){if(n.pieceNum_>=n.pieces_.length)return null;const e=[];for(let t=n.pieceNum_;t<n.pieces_.length-1;t++)e.push(n.pieces_[t]);return new A(e,0)}function L(n,e){const t=[];for(let s=n.pieceNum_;s<n.pieces_.length;s++)t.push(n.pieces_[s]);if(e instanceof A)for(let s=e.pieceNum_;s<e.pieces_.length;s++)t.push(e.pieces_[s]);else{const s=e.split("/");for(let i=0;i<s.length;i++)s[i].length>0&&t.push(s[i])}return new A(t,0)}function k(n){return n.pieceNum_>=n.pieces_.length}function K(n,e){const t=C(n),s=C(e);if(t===null)return e;if(t===s)return K(O(n),O(e));throw new Error("INTERNAL ERROR: innerPath ("+e+") is not within outerPath ("+n+")")}function ui(n,e){if(Se(n)!==Se(e))return!1;for(let t=n.pieceNum_,s=e.pieceNum_;t<=n.pieces_.length;t++,s++)if(n.pieces_[t]!==e.pieces_[s])return!1;return!0}function Z(n,e){let t=n.pieceNum_,s=e.pieceNum_;if(Se(n)>Se(e))return!1;for(;t<n.pieces_.length;){if(n.pieces_[t]!==e.pieces_[s])return!1;++t,++s}return!0}class rp{constructor(e,t){this.errorPrefix_=t,this.parts_=Ha(e,0),this.byteLength_=Math.max(1,this.parts_.length);for(let s=0;s<this.parts_.length;s++)this.byteLength_+=Hn(this.parts_[s]);Ba(this)}}function op(n,e){n.parts_.length>0&&(n.byteLength_+=1),n.parts_.push(e),n.byteLength_+=Hn(e),Ba(n)}function ap(n){const e=n.parts_.pop();n.byteLength_-=Hn(e),n.parts_.length>0&&(n.byteLength_-=1)}function Ba(n){if(n.byteLength_>Mr)throw new Error(n.errorPrefix_+"has a key path longer than "+Mr+" bytes ("+n.byteLength_+").");if(n.parts_.length>jr)throw new Error(n.errorPrefix_+"path specified exceeds the maximum depth that can be written ("+jr+") or object contains a cycle "+Me(n))}function Me(n){return n.parts_.length===0?"":"in property '"+n.parts_.join(".")+"'"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fi extends Ua{constructor(){super(["visible"]);let e,t;typeof document<"u"&&typeof document.addEventListener<"u"&&(typeof document.hidden<"u"?(t="visibilitychange",e="hidden"):typeof document.mozHidden<"u"?(t="mozvisibilitychange",e="mozHidden"):typeof document.msHidden<"u"?(t="msvisibilitychange",e="msHidden"):typeof document.webkitHidden<"u"&&(t="webkitvisibilitychange",e="webkitHidden")),this.visible_=!0,t&&document.addEventListener(t,()=>{const s=!document[e];s!==this.visible_&&(this.visible_=s,this.trigger("visible",s))},!1)}static getInstance(){return new fi}getInitialEvent(e){return m(e==="visible","Unknown event type: "+e),[this.visible_]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const vt=1e3,lp=60*5*1e3,Lr=30*1e3,cp=1.3,dp=3e4,hp="server_kill",Fr=3;class ue extends Fa{constructor(e,t,s,i,r,o,l,c){if(super(),this.repoInfo_=e,this.applicationId_=t,this.onDataUpdate_=s,this.onConnectStatus_=i,this.onServerInfoUpdate_=r,this.authTokenProvider_=o,this.appCheckTokenProvider_=l,this.authOverride_=c,this.id=ue.nextPersistentConnectionId_++,this.log_=Gt("p:"+this.id+":"),this.interruptReasons_={},this.listens=new Map,this.outstandingPuts_=[],this.outstandingGets_=[],this.outstandingPutCount_=0,this.outstandingGetCount_=0,this.onDisconnectRequestQueue_=[],this.connected_=!1,this.reconnectDelay_=vt,this.maxReconnectDelay_=lp,this.securityDebugCallback_=null,this.lastSessionId=null,this.establishConnectionTimer_=null,this.visible_=!1,this.requestCBHash_={},this.requestNumber_=0,this.realtime_=null,this.authToken_=null,this.appCheckToken_=null,this.forceTokenRefresh_=!1,this.invalidAuthTokenCount_=0,this.invalidAppCheckTokenCount_=0,this.firstConnection_=!0,this.lastConnectionAttemptTime_=null,this.lastConnectionEstablishedTime_=null,c&&!So())throw new Error("Auth override specified in options, but not supported on non Node.js platforms");fi.getInstance().on("visible",this.onVisible_,this),e.host.indexOf("fblocal")===-1&&xn.getInstance().on("online",this.onOnline_,this)}sendRequest(e,t,s){const i=++this.requestNumber_,r={r:i,a:e,b:t};this.log_(H(r)),m(this.connected_,"sendRequest call when we're not connected not allowed."),this.realtime_.sendRequest(r),s&&(this.requestCBHash_[i]=s)}get(e){this.initConnection_();const t=new Wn,i={action:"g",request:{p:e._path.toString(),q:e._queryObject},onComplete:o=>{const l=o.d;o.s==="ok"?t.resolve(l):t.reject(l)}};this.outstandingGets_.push(i),this.outstandingGetCount_++;const r=this.outstandingGets_.length-1;return this.connected_&&this.sendGet_(r),t.promise}listen(e,t,s,i){this.initConnection_();const r=e._queryIdentifier,o=e._path.toString();this.log_("Listen called for "+o+" "+r),this.listens.has(o)||this.listens.set(o,new Map),m(e._queryParams.isDefault()||!e._queryParams.loadsAllData(),"listen() called for non-default but complete query"),m(!this.listens.get(o).has(r),"listen() called twice for same path/queryId.");const l={onComplete:i,hashFn:t,query:e,tag:s};this.listens.get(o).set(r,l),this.connected_&&this.sendListen_(l)}sendGet_(e){const t=this.outstandingGets_[e];this.sendRequest("g",t.request,s=>{delete this.outstandingGets_[e],this.outstandingGetCount_--,this.outstandingGetCount_===0&&(this.outstandingGets_=[]),t.onComplete&&t.onComplete(s)})}sendListen_(e){const t=e.query,s=t._path.toString(),i=t._queryIdentifier;this.log_("Listen on "+s+" for "+i);const r={p:s},o="q";e.tag&&(r.q=t._queryObject,r.t=e.tag),r.h=e.hashFn(),this.sendRequest(o,r,l=>{const c=l.d,d=l.s;ue.warnOnListenWarnings_(c,t),(this.listens.get(s)&&this.listens.get(s).get(i))===e&&(this.log_("listen response",l),d!=="ok"&&this.removeListen_(s,i),e.onComplete&&e.onComplete(d,c))})}static warnOnListenWarnings_(e,t){if(e&&typeof e=="object"&&_e(e,"w")){const s=st(e,"w");if(Array.isArray(s)&&~s.indexOf("no_index")){const i='".indexOn": "'+t._queryParams.getIndex().toString()+'"',r=t._path.toString();Q(`Using an unspecified index. Your data will be downloaded and filtered on the client. Consider adding ${i} at ${r} to your security rules for better performance.`)}}}refreshAuthToken(e){this.authToken_=e,this.log_("Auth token refreshed"),this.authToken_?this.tryAuth():this.connected_&&this.sendRequest("unauth",{},()=>{}),this.reduceReconnectDelayIfAdminCredential_(e)}reduceReconnectDelayIfAdminCredential_(e){(e&&e.length===40||Hc(e))&&(this.log_("Admin auth credential detected.  Reducing max reconnect time."),this.maxReconnectDelay_=Lr)}refreshAppCheckToken(e){this.appCheckToken_=e,this.log_("App check token refreshed"),this.appCheckToken_?this.tryAppCheck():this.connected_&&this.sendRequest("unappeck",{},()=>{})}tryAuth(){if(this.connected_&&this.authToken_){const e=this.authToken_,t=Wc(e)?"auth":"gauth",s={cred:e};this.authOverride_===null?s.noauth=!0:typeof this.authOverride_=="object"&&(s.authvar=this.authOverride_),this.sendRequest(t,s,i=>{const r=i.s,o=i.d||"error";this.authToken_===e&&(r==="ok"?this.invalidAuthTokenCount_=0:this.onAuthRevoked_(r,o))})}}tryAppCheck(){this.connected_&&this.appCheckToken_&&this.sendRequest("appcheck",{token:this.appCheckToken_},e=>{const t=e.s,s=e.d||"error";t==="ok"?this.invalidAppCheckTokenCount_=0:this.onAppCheckRevoked_(t,s)})}unlisten(e,t){const s=e._path.toString(),i=e._queryIdentifier;this.log_("Unlisten called for "+s+" "+i),m(e._queryParams.isDefault()||!e._queryParams.loadsAllData(),"unlisten() called for non-default but complete query"),this.removeListen_(s,i)&&this.connected_&&this.sendUnlisten_(s,i,e._queryObject,t)}sendUnlisten_(e,t,s,i){this.log_("Unlisten on "+e+" for "+t);const r={p:e},o="n";i&&(r.q=s,r.t=i),this.sendRequest(o,r)}onDisconnectPut(e,t,s){this.initConnection_(),this.connected_?this.sendOnDisconnect_("o",e,t,s):this.onDisconnectRequestQueue_.push({pathString:e,action:"o",data:t,onComplete:s})}onDisconnectMerge(e,t,s){this.initConnection_(),this.connected_?this.sendOnDisconnect_("om",e,t,s):this.onDisconnectRequestQueue_.push({pathString:e,action:"om",data:t,onComplete:s})}onDisconnectCancel(e,t){this.initConnection_(),this.connected_?this.sendOnDisconnect_("oc",e,null,t):this.onDisconnectRequestQueue_.push({pathString:e,action:"oc",data:null,onComplete:t})}sendOnDisconnect_(e,t,s,i){const r={p:t,d:s};this.log_("onDisconnect "+e,r),this.sendRequest(e,r,o=>{i&&setTimeout(()=>{i(o.s,o.d)},Math.floor(0))})}put(e,t,s,i){this.putInternal("p",e,t,s,i)}merge(e,t,s,i){this.putInternal("m",e,t,s,i)}putInternal(e,t,s,i,r){this.initConnection_();const o={p:t,d:s};r!==void 0&&(o.h=r),this.outstandingPuts_.push({action:e,request:o,onComplete:i}),this.outstandingPutCount_++;const l=this.outstandingPuts_.length-1;this.connected_?this.sendPut_(l):this.log_("Buffering put: "+t)}sendPut_(e){const t=this.outstandingPuts_[e].action,s=this.outstandingPuts_[e].request,i=this.outstandingPuts_[e].onComplete;this.outstandingPuts_[e].queued=this.connected_,this.sendRequest(t,s,r=>{this.log_(t+" response",r),delete this.outstandingPuts_[e],this.outstandingPutCount_--,this.outstandingPutCount_===0&&(this.outstandingPuts_=[]),i&&i(r.s,r.d)})}reportStats(e){if(this.connected_){const t={c:e};this.log_("reportStats",t),this.sendRequest("s",t,s=>{if(s.s!=="ok"){const r=s.d;this.log_("reportStats","Error sending stats: "+r)}})}}onDataMessage_(e){if("r"in e){this.log_("from server: "+H(e));const t=e.r,s=this.requestCBHash_[t];s&&(delete this.requestCBHash_[t],s(e.b))}else{if("error"in e)throw"A server-side error has occurred: "+e.error;"a"in e&&this.onDataPush_(e.a,e.b)}}onDataPush_(e,t){this.log_("handleServerMessage",e,t),e==="d"?this.onDataUpdate_(t.p,t.d,!1,t.t):e==="m"?this.onDataUpdate_(t.p,t.d,!0,t.t):e==="c"?this.onListenRevoked_(t.p,t.q):e==="ac"?this.onAuthRevoked_(t.s,t.d):e==="apc"?this.onAppCheckRevoked_(t.s,t.d):e==="sd"?this.onSecurityDebugPacket_(t):Ss("Unrecognized action received from server: "+H(e)+`
Are you using the latest client?`)}onReady_(e,t){this.log_("connection ready"),this.connected_=!0,this.lastConnectionEstablishedTime_=new Date().getTime(),this.handleTimestamp_(e),this.lastSessionId=t,this.firstConnection_&&this.sendConnectStats_(),this.restoreState_(),this.firstConnection_=!1,this.onConnectStatus_(!0)}scheduleConnect_(e){m(!this.realtime_,"Scheduling a connect when we're already connected/ing?"),this.establishConnectionTimer_&&clearTimeout(this.establishConnectionTimer_),this.establishConnectionTimer_=setTimeout(()=>{this.establishConnectionTimer_=null,this.establishConnection_()},Math.floor(e))}initConnection_(){!this.realtime_&&this.firstConnection_&&this.scheduleConnect_(0)}onVisible_(e){e&&!this.visible_&&this.reconnectDelay_===this.maxReconnectDelay_&&(this.log_("Window became visible.  Reducing delay."),this.reconnectDelay_=vt,this.realtime_||this.scheduleConnect_(0)),this.visible_=e}onOnline_(e){e?(this.log_("Browser went online."),this.reconnectDelay_=vt,this.realtime_||this.scheduleConnect_(0)):(this.log_("Browser went offline.  Killing connection."),this.realtime_&&this.realtime_.close())}onRealtimeDisconnect_(){if(this.log_("data client disconnected"),this.connected_=!1,this.realtime_=null,this.cancelSentTransactions_(),this.requestCBHash_={},this.shouldReconnect_()){this.visible_?this.lastConnectionEstablishedTime_&&(new Date().getTime()-this.lastConnectionEstablishedTime_>dp&&(this.reconnectDelay_=vt),this.lastConnectionEstablishedTime_=null):(this.log_("Window isn't visible.  Delaying reconnect."),this.reconnectDelay_=this.maxReconnectDelay_,this.lastConnectionAttemptTime_=new Date().getTime());const e=new Date().getTime()-this.lastConnectionAttemptTime_;let t=Math.max(0,this.reconnectDelay_-e);t=Math.random()*t,this.log_("Trying to reconnect in "+t+"ms"),this.scheduleConnect_(t),this.reconnectDelay_=Math.min(this.maxReconnectDelay_,this.reconnectDelay_*cp)}this.onConnectStatus_(!1)}async establishConnection_(){if(this.shouldReconnect_()){this.log_("Making a connection attempt"),this.lastConnectionAttemptTime_=new Date().getTime(),this.lastConnectionEstablishedTime_=null;const e=this.onDataMessage_.bind(this),t=this.onReady_.bind(this),s=this.onRealtimeDisconnect_.bind(this),i=this.id+":"+ue.nextConnectionId_++,r=this.lastSessionId;let o=!1,l=null;const c=function(){l?l.close():(o=!0,s())},d=function(h){m(l,"sendRequest call when we're not connected not allowed."),l.sendRequest(h)};this.realtime_={close:c,sendRequest:d};const u=this.forceTokenRefresh_;this.forceTokenRefresh_=!1;try{const[h,f]=await Promise.all([this.authTokenProvider_.getToken(u),this.appCheckTokenProvider_.getToken(u)]);o?$("getToken() completed but was canceled"):($("getToken() completed. Creating connection."),this.authToken_=h&&h.accessToken,this.appCheckToken_=f&&f.token,l=new sp(i,this.repoInfo_,this.applicationId_,this.appCheckToken_,this.authToken_,e,t,s,g=>{Q(g+" ("+this.repoInfo_.toString()+")"),this.interrupt(hp)},r))}catch(h){this.log_("Failed to get token: "+h),o||(this.repoInfo_.nodeAdmin&&Q(h),c())}}}interrupt(e){$("Interrupting connection for reason: "+e),this.interruptReasons_[e]=!0,this.realtime_?this.realtime_.close():(this.establishConnectionTimer_&&(clearTimeout(this.establishConnectionTimer_),this.establishConnectionTimer_=null),this.connected_&&this.onRealtimeDisconnect_())}resume(e){$("Resuming connection for reason: "+e),delete this.interruptReasons_[e],ws(this.interruptReasons_)&&(this.reconnectDelay_=vt,this.realtime_||this.scheduleConnect_(0))}handleTimestamp_(e){const t=e-new Date().getTime();this.onServerInfoUpdate_({serverTimeOffset:t})}cancelSentTransactions_(){for(let e=0;e<this.outstandingPuts_.length;e++){const t=this.outstandingPuts_[e];t&&"h"in t.request&&t.queued&&(t.onComplete&&t.onComplete("disconnect"),delete this.outstandingPuts_[e],this.outstandingPutCount_--)}this.outstandingPutCount_===0&&(this.outstandingPuts_=[])}onListenRevoked_(e,t){let s;t?s=t.map(r=>li(r)).join("$"):s="default";const i=this.removeListen_(e,s);i&&i.onComplete&&i.onComplete("permission_denied")}removeListen_(e,t){const s=new A(e).toString();let i;if(this.listens.has(s)){const r=this.listens.get(s);i=r.get(t),r.delete(t),r.size===0&&this.listens.delete(s)}else i=void 0;return i}onAuthRevoked_(e,t){$("Auth token revoked: "+e+"/"+t),this.authToken_=null,this.forceTokenRefresh_=!0,this.realtime_.close(),(e==="invalid_token"||e==="permission_denied")&&(this.invalidAuthTokenCount_++,this.invalidAuthTokenCount_>=Fr&&(this.reconnectDelay_=Lr,this.authTokenProvider_.notifyForInvalidToken()))}onAppCheckRevoked_(e,t){$("App check token revoked: "+e+"/"+t),this.appCheckToken_=null,this.forceTokenRefresh_=!0,(e==="invalid_token"||e==="permission_denied")&&(this.invalidAppCheckTokenCount_++,this.invalidAppCheckTokenCount_>=Fr&&this.appCheckTokenProvider_.notifyForInvalidToken())}onSecurityDebugPacket_(e){this.securityDebugCallback_?this.securityDebugCallback_(e):"msg"in e&&console.log("FIREBASE: "+e.msg.replace(`
`,`
FIREBASE: `))}restoreState_(){this.tryAuth(),this.tryAppCheck();for(const e of this.listens.values())for(const t of e.values())this.sendListen_(t);for(let e=0;e<this.outstandingPuts_.length;e++)this.outstandingPuts_[e]&&this.sendPut_(e);for(;this.onDisconnectRequestQueue_.length;){const e=this.onDisconnectRequestQueue_.shift();this.sendOnDisconnect_(e.action,e.pathString,e.data,e.onComplete)}for(let e=0;e<this.outstandingGets_.length;e++)this.outstandingGets_[e]&&this.sendGet_(e)}sendConnectStats_(){const e={};let t="js";e["sdk."+t+"."+ga.replace(/\./g,"-")]=1,Ks()?e["framework.cordova"]=1:To()&&(e["framework.reactnative"]=1),this.reportStats(e)}shouldReconnect_(){const e=xn.getInstance().currentlyOnline();return ws(this.interruptReasons_)&&e}}ue.nextPersistentConnectionId_=0;ue.nextConnectionId_=0;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class N{constructor(e,t){this.name=e,this.node=t}static Wrap(e,t){return new N(e,t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class zn{getCompare(){return this.compare.bind(this)}indexedValueChanged(e,t){const s=new N(ot,e),i=new N(ot,t);return this.compare(s,i)!==0}minPost(){return N.MIN}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let en;class $a extends zn{static get __EMPTY_NODE(){return en}static set __EMPTY_NODE(e){en=e}compare(e,t){return pt(e.name,t.name)}isDefinedOn(e){throw ct("KeyIndex.isDefinedOn not expected to be called.")}indexedValueChanged(e,t){return!1}minPost(){return N.MIN}maxPost(){return new N(Ve,en)}makePost(e,t){return m(typeof e=="string","KeyIndex indexValue must always be a string."),new N(e,en)}toString(){return".key"}}const tt=new $a;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class tn{constructor(e,t,s,i,r=null){this.isReverse_=i,this.resultGenerator_=r,this.nodeStack_=[];let o=1;for(;!e.isEmpty();)if(e=e,o=t?s(e.key,t):1,i&&(o*=-1),o<0)this.isReverse_?e=e.left:e=e.right;else if(o===0){this.nodeStack_.push(e);break}else this.nodeStack_.push(e),this.isReverse_?e=e.right:e=e.left}getNext(){if(this.nodeStack_.length===0)return null;let e=this.nodeStack_.pop(),t;if(this.resultGenerator_?t=this.resultGenerator_(e.key,e.value):t={key:e.key,value:e.value},this.isReverse_)for(e=e.left;!e.isEmpty();)this.nodeStack_.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack_.push(e),e=e.left;return t}hasNext(){return this.nodeStack_.length>0}peek(){if(this.nodeStack_.length===0)return null;const e=this.nodeStack_[this.nodeStack_.length-1];return this.resultGenerator_?this.resultGenerator_(e.key,e.value):{key:e.key,value:e.value}}}class W{constructor(e,t,s,i,r){this.key=e,this.value=t,this.color=s??W.RED,this.left=i??Y.EMPTY_NODE,this.right=r??Y.EMPTY_NODE}copy(e,t,s,i,r){return new W(e??this.key,t??this.value,s??this.color,i??this.left,r??this.right)}count(){return this.left.count()+1+this.right.count()}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||!!e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min_(){return this.left.isEmpty()?this:this.left.min_()}minKey(){return this.min_().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,t,s){let i=this;const r=s(e,i.key);return r<0?i=i.copy(null,null,null,i.left.insert(e,t,s),null):r===0?i=i.copy(null,t,null,null,null):i=i.copy(null,null,null,null,i.right.insert(e,t,s)),i.fixUp_()}removeMin_(){if(this.left.isEmpty())return Y.EMPTY_NODE;let e=this;return!e.left.isRed_()&&!e.left.left.isRed_()&&(e=e.moveRedLeft_()),e=e.copy(null,null,null,e.left.removeMin_(),null),e.fixUp_()}remove(e,t){let s,i;if(s=this,t(e,s.key)<0)!s.left.isEmpty()&&!s.left.isRed_()&&!s.left.left.isRed_()&&(s=s.moveRedLeft_()),s=s.copy(null,null,null,s.left.remove(e,t),null);else{if(s.left.isRed_()&&(s=s.rotateRight_()),!s.right.isEmpty()&&!s.right.isRed_()&&!s.right.left.isRed_()&&(s=s.moveRedRight_()),t(e,s.key)===0){if(s.right.isEmpty())return Y.EMPTY_NODE;i=s.right.min_(),s=s.copy(i.key,i.value,null,null,s.right.removeMin_())}s=s.copy(null,null,null,null,s.right.remove(e,t))}return s.fixUp_()}isRed_(){return this.color}fixUp_(){let e=this;return e.right.isRed_()&&!e.left.isRed_()&&(e=e.rotateLeft_()),e.left.isRed_()&&e.left.left.isRed_()&&(e=e.rotateRight_()),e.left.isRed_()&&e.right.isRed_()&&(e=e.colorFlip_()),e}moveRedLeft_(){let e=this.colorFlip_();return e.right.left.isRed_()&&(e=e.copy(null,null,null,null,e.right.rotateRight_()),e=e.rotateLeft_(),e=e.colorFlip_()),e}moveRedRight_(){let e=this.colorFlip_();return e.left.left.isRed_()&&(e=e.rotateRight_(),e=e.colorFlip_()),e}rotateLeft_(){const e=this.copy(null,null,W.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight_(){const e=this.copy(null,null,W.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip_(){const e=this.left.copy(null,null,!this.left.color,null,null),t=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,t)}checkMaxDepth_(){const e=this.check_();return Math.pow(2,e)<=this.count()+1}check_(){if(this.isRed_()&&this.left.isRed_())throw new Error("Red node has red child("+this.key+","+this.value+")");if(this.right.isRed_())throw new Error("Right child of ("+this.key+","+this.value+") is red");const e=this.left.check_();if(e!==this.right.check_())throw new Error("Black depths differ");return e+(this.isRed_()?0:1)}}W.RED=!0;W.BLACK=!1;class up{copy(e,t,s,i,r){return this}insert(e,t,s){return new W(e,t,null)}remove(e,t){return this}count(){return 0}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}check_(){return 0}isRed_(){return!1}}class Y{constructor(e,t=Y.EMPTY_NODE){this.comparator_=e,this.root_=t}insert(e,t){return new Y(this.comparator_,this.root_.insert(e,t,this.comparator_).copy(null,null,W.BLACK,null,null))}remove(e){return new Y(this.comparator_,this.root_.remove(e,this.comparator_).copy(null,null,W.BLACK,null,null))}get(e){let t,s=this.root_;for(;!s.isEmpty();){if(t=this.comparator_(e,s.key),t===0)return s.value;t<0?s=s.left:t>0&&(s=s.right)}return null}getPredecessorKey(e){let t,s=this.root_,i=null;for(;!s.isEmpty();)if(t=this.comparator_(e,s.key),t===0){if(s.left.isEmpty())return i?i.key:null;for(s=s.left;!s.right.isEmpty();)s=s.right;return s.key}else t<0?s=s.left:t>0&&(i=s,s=s.right);throw new Error("Attempted to find predecessor key for a nonexistent key.  What gives?")}isEmpty(){return this.root_.isEmpty()}count(){return this.root_.count()}minKey(){return this.root_.minKey()}maxKey(){return this.root_.maxKey()}inorderTraversal(e){return this.root_.inorderTraversal(e)}reverseTraversal(e){return this.root_.reverseTraversal(e)}getIterator(e){return new tn(this.root_,null,this.comparator_,!1,e)}getIteratorFrom(e,t){return new tn(this.root_,e,this.comparator_,!1,t)}getReverseIteratorFrom(e,t){return new tn(this.root_,e,this.comparator_,!0,t)}getReverseIterator(e){return new tn(this.root_,null,this.comparator_,!0,e)}}Y.EMPTY_NODE=new up;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function fp(n,e){return pt(n.name,e.name)}function pi(n,e){return pt(n,e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let As;function pp(n){As=n}const qa=function(n){return typeof n=="number"?"number:"+ba(n):"string:"+n},za=function(n){if(n.isLeafNode()){const e=n.val();m(typeof e=="string"||typeof e=="number"||typeof e=="object"&&_e(e,".sv"),"Priority must be a string or number.")}else m(n===As||n.isEmpty(),"priority of unexpected type.");m(n===As||n.getPriority().isEmpty(),"Priority nodes can't have a priority of their own.")};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Ur;class U{constructor(e,t=U.__childrenNodeConstructor.EMPTY_NODE){this.value_=e,this.priorityNode_=t,this.lazyHash_=null,m(this.value_!==void 0&&this.value_!==null,"LeafNode shouldn't be created with null/undefined value."),za(this.priorityNode_)}static set __childrenNodeConstructor(e){Ur=e}static get __childrenNodeConstructor(){return Ur}isLeafNode(){return!0}getPriority(){return this.priorityNode_}updatePriority(e){return new U(this.value_,e)}getImmediateChild(e){return e===".priority"?this.priorityNode_:U.__childrenNodeConstructor.EMPTY_NODE}getChild(e){return k(e)?this:C(e)===".priority"?this.priorityNode_:U.__childrenNodeConstructor.EMPTY_NODE}hasChild(){return!1}getPredecessorChildName(e,t){return null}updateImmediateChild(e,t){return e===".priority"?this.updatePriority(t):t.isEmpty()&&e!==".priority"?this:U.__childrenNodeConstructor.EMPTY_NODE.updateImmediateChild(e,t).updatePriority(this.priorityNode_)}updateChild(e,t){const s=C(e);return s===null?t:t.isEmpty()&&s!==".priority"?this:(m(s!==".priority"||Se(e)===1,".priority must be the last token in a path"),this.updateImmediateChild(s,U.__childrenNodeConstructor.EMPTY_NODE.updateChild(O(e),t)))}isEmpty(){return!1}numChildren(){return 0}forEachChild(e,t){return!1}val(e){return e&&!this.getPriority().isEmpty()?{".value":this.getValue(),".priority":this.getPriority().val()}:this.getValue()}hash(){if(this.lazyHash_===null){let e="";this.priorityNode_.isEmpty()||(e+="priority:"+qa(this.priorityNode_.val())+":");const t=typeof this.value_;e+=t+":",t==="number"?e+=ba(this.value_):e+=this.value_,this.lazyHash_=va(e)}return this.lazyHash_}getValue(){return this.value_}compareTo(e){return e===U.__childrenNodeConstructor.EMPTY_NODE?1:e instanceof U.__childrenNodeConstructor?-1:(m(e.isLeafNode(),"Unknown node type"),this.compareToLeafNode_(e))}compareToLeafNode_(e){const t=typeof e.value_,s=typeof this.value_,i=U.VALUE_TYPE_ORDER.indexOf(t),r=U.VALUE_TYPE_ORDER.indexOf(s);return m(i>=0,"Unknown leaf type: "+t),m(r>=0,"Unknown leaf type: "+s),i===r?s==="object"?0:this.value_<e.value_?-1:this.value_===e.value_?0:1:r-i}withIndex(){return this}isIndexed(){return!0}equals(e){if(e===this)return!0;if(e.isLeafNode()){const t=e;return this.value_===t.value_&&this.priorityNode_.equals(t.priorityNode_)}else return!1}}U.VALUE_TYPE_ORDER=["object","boolean","number","string"];/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Ga,Ka;function mp(n){Ga=n}function gp(n){Ka=n}class _p extends zn{compare(e,t){const s=e.node.getPriority(),i=t.node.getPriority(),r=s.compareTo(i);return r===0?pt(e.name,t.name):r}isDefinedOn(e){return!e.getPriority().isEmpty()}indexedValueChanged(e,t){return!e.getPriority().equals(t.getPriority())}minPost(){return N.MIN}maxPost(){return new N(Ve,new U("[PRIORITY-POST]",Ka))}makePost(e,t){const s=Ga(e);return new N(t,new U("[PRIORITY-POST]",s))}toString(){return".priority"}}const j=new _p;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const vp=Math.log(2);class yp{constructor(e){const t=r=>parseInt(Math.log(r)/vp,10),s=r=>parseInt(Array(r+1).join("1"),2);this.count=t(e+1),this.current_=this.count-1;const i=s(this.count);this.bits_=e+1&i}nextBitIsOne(){const e=!(this.bits_&1<<this.current_);return this.current_--,e}}const En=function(n,e,t,s){n.sort(e);const i=function(c,d){const u=d-c;let h,f;if(u===0)return null;if(u===1)return h=n[c],f=t?t(h):h,new W(f,h.node,W.BLACK,null,null);{const g=parseInt(u/2,10)+c,_=i(c,g),p=i(g+1,d);return h=n[g],f=t?t(h):h,new W(f,h.node,W.BLACK,_,p)}},r=function(c){let d=null,u=null,h=n.length;const f=function(_,p){const v=h-_,I=h;h-=_;const b=i(v+1,I),P=n[v],M=t?t(P):P;g(new W(M,P.node,p,null,b))},g=function(_){d?(d.left=_,d=_):(u=_,d=_)};for(let _=0;_<c.count;++_){const p=c.nextBitIsOne(),v=Math.pow(2,c.count-(_+1));p?f(v,W.BLACK):(f(v,W.BLACK),f(v,W.RED))}return u},o=new yp(n.length),l=r(o);return new Y(s||e,l)};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let hs;const Ke={};class he{constructor(e,t){this.indexes_=e,this.indexSet_=t}static get Default(){return m(Ke&&j,"ChildrenNode.ts has not been loaded"),hs=hs||new he({".priority":Ke},{".priority":j}),hs}get(e){const t=st(this.indexes_,e);if(!t)throw new Error("No index defined for "+e);return t instanceof Y?t:null}hasIndex(e){return _e(this.indexSet_,e.toString())}addIndex(e,t){m(e!==tt,"KeyIndex always exists and isn't meant to be added to the IndexMap.");const s=[];let i=!1;const r=t.getIterator(N.Wrap);let o=r.getNext();for(;o;)i=i||e.isDefinedOn(o.node),s.push(o),o=r.getNext();let l;i?l=En(s,e.getCompare()):l=Ke;const c=e.toString(),d=Object.assign({},this.indexSet_);d[c]=e;const u=Object.assign({},this.indexes_);return u[c]=l,new he(u,d)}addToIndexes(e,t){const s=fn(this.indexes_,(i,r)=>{const o=st(this.indexSet_,r);if(m(o,"Missing index implementation for "+r),i===Ke)if(o.isDefinedOn(e.node)){const l=[],c=t.getIterator(N.Wrap);let d=c.getNext();for(;d;)d.name!==e.name&&l.push(d),d=c.getNext();return l.push(e),En(l,o.getCompare())}else return Ke;else{const l=t.get(e.name);let c=i;return l&&(c=c.remove(new N(e.name,l))),c.insert(e,e.node)}});return new he(s,this.indexSet_)}removeFromIndexes(e,t){const s=fn(this.indexes_,i=>{if(i===Ke)return i;{const r=t.get(e.name);return r?i.remove(new N(e.name,r)):i}});return new he(s,this.indexSet_)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let yt;class w{constructor(e,t,s){this.children_=e,this.priorityNode_=t,this.indexMap_=s,this.lazyHash_=null,this.priorityNode_&&za(this.priorityNode_),this.children_.isEmpty()&&m(!this.priorityNode_||this.priorityNode_.isEmpty(),"An empty node cannot have a priority")}static get EMPTY_NODE(){return yt||(yt=new w(new Y(pi),null,he.Default))}isLeafNode(){return!1}getPriority(){return this.priorityNode_||yt}updatePriority(e){return this.children_.isEmpty()?this:new w(this.children_,e,this.indexMap_)}getImmediateChild(e){if(e===".priority")return this.getPriority();{const t=this.children_.get(e);return t===null?yt:t}}getChild(e){const t=C(e);return t===null?this:this.getImmediateChild(t).getChild(O(e))}hasChild(e){return this.children_.get(e)!==null}updateImmediateChild(e,t){if(m(t,"We should always be passing snapshot nodes"),e===".priority")return this.updatePriority(t);{const s=new N(e,t);let i,r;t.isEmpty()?(i=this.children_.remove(e),r=this.indexMap_.removeFromIndexes(s,this.children_)):(i=this.children_.insert(e,t),r=this.indexMap_.addToIndexes(s,this.children_));const o=i.isEmpty()?yt:this.priorityNode_;return new w(i,o,r)}}updateChild(e,t){const s=C(e);if(s===null)return t;{m(C(e)!==".priority"||Se(e)===1,".priority must be the last token in a path");const i=this.getImmediateChild(s).updateChild(O(e),t);return this.updateImmediateChild(s,i)}}isEmpty(){return this.children_.isEmpty()}numChildren(){return this.children_.count()}val(e){if(this.isEmpty())return null;const t={};let s=0,i=0,r=!0;if(this.forEachChild(j,(o,l)=>{t[o]=l.val(e),s++,r&&w.INTEGER_REGEXP_.test(o)?i=Math.max(i,Number(o)):r=!1}),!e&&r&&i<2*s){const o=[];for(const l in t)o[l]=t[l];return o}else return e&&!this.getPriority().isEmpty()&&(t[".priority"]=this.getPriority().val()),t}hash(){if(this.lazyHash_===null){let e="";this.getPriority().isEmpty()||(e+="priority:"+qa(this.getPriority().val())+":"),this.forEachChild(j,(t,s)=>{const i=s.hash();i!==""&&(e+=":"+t+":"+i)}),this.lazyHash_=e===""?"":va(e)}return this.lazyHash_}getPredecessorChildName(e,t,s){const i=this.resolveIndex_(s);if(i){const r=i.getPredecessorKey(new N(e,t));return r?r.name:null}else return this.children_.getPredecessorKey(e)}getFirstChildName(e){const t=this.resolveIndex_(e);if(t){const s=t.minKey();return s&&s.name}else return this.children_.minKey()}getFirstChild(e){const t=this.getFirstChildName(e);return t?new N(t,this.children_.get(t)):null}getLastChildName(e){const t=this.resolveIndex_(e);if(t){const s=t.maxKey();return s&&s.name}else return this.children_.maxKey()}getLastChild(e){const t=this.getLastChildName(e);return t?new N(t,this.children_.get(t)):null}forEachChild(e,t){const s=this.resolveIndex_(e);return s?s.inorderTraversal(i=>t(i.name,i.node)):this.children_.inorderTraversal(t)}getIterator(e){return this.getIteratorFrom(e.minPost(),e)}getIteratorFrom(e,t){const s=this.resolveIndex_(t);if(s)return s.getIteratorFrom(e,i=>i);{const i=this.children_.getIteratorFrom(e.name,N.Wrap);let r=i.peek();for(;r!=null&&t.compare(r,e)<0;)i.getNext(),r=i.peek();return i}}getReverseIterator(e){return this.getReverseIteratorFrom(e.maxPost(),e)}getReverseIteratorFrom(e,t){const s=this.resolveIndex_(t);if(s)return s.getReverseIteratorFrom(e,i=>i);{const i=this.children_.getReverseIteratorFrom(e.name,N.Wrap);let r=i.peek();for(;r!=null&&t.compare(r,e)>0;)i.getNext(),r=i.peek();return i}}compareTo(e){return this.isEmpty()?e.isEmpty()?0:-1:e.isLeafNode()||e.isEmpty()?1:e===Kt?-1:0}withIndex(e){if(e===tt||this.indexMap_.hasIndex(e))return this;{const t=this.indexMap_.addIndex(e,this.children_);return new w(this.children_,this.priorityNode_,t)}}isIndexed(e){return e===tt||this.indexMap_.hasIndex(e)}equals(e){if(e===this)return!0;if(e.isLeafNode())return!1;{const t=e;if(this.getPriority().equals(t.getPriority()))if(this.children_.count()===t.children_.count()){const s=this.getIterator(j),i=t.getIterator(j);let r=s.getNext(),o=i.getNext();for(;r&&o;){if(r.name!==o.name||!r.node.equals(o.node))return!1;r=s.getNext(),o=i.getNext()}return r===null&&o===null}else return!1;else return!1}}resolveIndex_(e){return e===tt?null:this.indexMap_.get(e.toString())}}w.INTEGER_REGEXP_=/^(0|[1-9]\d*)$/;class wp extends w{constructor(){super(new Y(pi),w.EMPTY_NODE,he.Default)}compareTo(e){return e===this?0:1}equals(e){return e===this}getPriority(){return this}getImmediateChild(e){return w.EMPTY_NODE}isEmpty(){return!1}}const Kt=new wp;Object.defineProperties(N,{MIN:{value:new N(ot,w.EMPTY_NODE)},MAX:{value:new N(Ve,Kt)}});$a.__EMPTY_NODE=w.EMPTY_NODE;U.__childrenNodeConstructor=w;pp(Kt);gp(Kt);/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const bp=!0;function V(n,e=null){if(n===null)return w.EMPTY_NODE;if(typeof n=="object"&&".priority"in n&&(e=n[".priority"]),m(e===null||typeof e=="string"||typeof e=="number"||typeof e=="object"&&".sv"in e,"Invalid priority type found: "+typeof e),typeof n=="object"&&".value"in n&&n[".value"]!==null&&(n=n[".value"]),typeof n!="object"||".sv"in n){const t=n;return new U(t,V(e))}if(!(n instanceof Array)&&bp){const t=[];let s=!1;if(J(n,(o,l)=>{if(o.substring(0,1)!=="."){const c=V(l);c.isEmpty()||(s=s||!c.getPriority().isEmpty(),t.push(new N(o,c)))}}),t.length===0)return w.EMPTY_NODE;const r=En(t,fp,o=>o.name,pi);if(s){const o=En(t,j.getCompare());return new w(r,V(e),new he({".priority":o},{".priority":j}))}else return new w(r,V(e),he.Default)}else{let t=w.EMPTY_NODE;return J(n,(s,i)=>{if(_e(n,s)&&s.substring(0,1)!=="."){const r=V(i);(r.isLeafNode()||!r.isEmpty())&&(t=t.updateImmediateChild(s,r))}}),t.updatePriority(V(e))}}mp(V);/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xp extends zn{constructor(e){super(),this.indexPath_=e,m(!k(e)&&C(e)!==".priority","Can't create PathIndex with empty path or .priority key")}extractChild(e){return e.getChild(this.indexPath_)}isDefinedOn(e){return!e.getChild(this.indexPath_).isEmpty()}compare(e,t){const s=this.extractChild(e.node),i=this.extractChild(t.node),r=s.compareTo(i);return r===0?pt(e.name,t.name):r}makePost(e,t){const s=V(e),i=w.EMPTY_NODE.updateChild(this.indexPath_,s);return new N(t,i)}maxPost(){const e=w.EMPTY_NODE.updateChild(this.indexPath_,Kt);return new N(Ve,e)}toString(){return Ha(this.indexPath_,0).join("/")}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ep extends zn{compare(e,t){const s=e.node.compareTo(t.node);return s===0?pt(e.name,t.name):s}isDefinedOn(e){return!0}indexedValueChanged(e,t){return!e.equals(t)}minPost(){return N.MIN}maxPost(){return N.MAX}makePost(e,t){const s=V(e);return new N(t,s)}toString(){return".value"}}const Ip=new Ep;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ya(n){return{type:"value",snapshotNode:n}}function at(n,e){return{type:"child_added",snapshotNode:e,childName:n}}function jt(n,e){return{type:"child_removed",snapshotNode:e,childName:n}}function Mt(n,e,t){return{type:"child_changed",snapshotNode:e,childName:n,oldSnap:t}}function Cp(n,e){return{type:"child_moved",snapshotNode:e,childName:n}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class mi{constructor(e){this.index_=e}updateChild(e,t,s,i,r,o){m(e.isIndexed(this.index_),"A node must be indexed if only a child is updated");const l=e.getImmediateChild(t);return l.getChild(i).equals(s.getChild(i))&&l.isEmpty()===s.isEmpty()||(o!=null&&(s.isEmpty()?e.hasChild(t)?o.trackChildChange(jt(t,l)):m(e.isLeafNode(),"A child remove without an old child only makes sense on a leaf node"):l.isEmpty()?o.trackChildChange(at(t,s)):o.trackChildChange(Mt(t,s,l))),e.isLeafNode()&&s.isEmpty())?e:e.updateImmediateChild(t,s).withIndex(this.index_)}updateFullNode(e,t,s){return s!=null&&(e.isLeafNode()||e.forEachChild(j,(i,r)=>{t.hasChild(i)||s.trackChildChange(jt(i,r))}),t.isLeafNode()||t.forEachChild(j,(i,r)=>{if(e.hasChild(i)){const o=e.getImmediateChild(i);o.equals(r)||s.trackChildChange(Mt(i,r,o))}else s.trackChildChange(at(i,r))})),t.withIndex(this.index_)}updatePriority(e,t){return e.isEmpty()?w.EMPTY_NODE:e.updatePriority(t)}filtersNodes(){return!1}getIndexedFilter(){return this}getIndex(){return this.index_}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Lt{constructor(e){this.indexedFilter_=new mi(e.getIndex()),this.index_=e.getIndex(),this.startPost_=Lt.getStartPost_(e),this.endPost_=Lt.getEndPost_(e),this.startIsInclusive_=!e.startAfterSet_,this.endIsInclusive_=!e.endBeforeSet_}getStartPost(){return this.startPost_}getEndPost(){return this.endPost_}matches(e){const t=this.startIsInclusive_?this.index_.compare(this.getStartPost(),e)<=0:this.index_.compare(this.getStartPost(),e)<0,s=this.endIsInclusive_?this.index_.compare(e,this.getEndPost())<=0:this.index_.compare(e,this.getEndPost())<0;return t&&s}updateChild(e,t,s,i,r,o){return this.matches(new N(t,s))||(s=w.EMPTY_NODE),this.indexedFilter_.updateChild(e,t,s,i,r,o)}updateFullNode(e,t,s){t.isLeafNode()&&(t=w.EMPTY_NODE);let i=t.withIndex(this.index_);i=i.updatePriority(w.EMPTY_NODE);const r=this;return t.forEachChild(j,(o,l)=>{r.matches(new N(o,l))||(i=i.updateImmediateChild(o,w.EMPTY_NODE))}),this.indexedFilter_.updateFullNode(e,i,s)}updatePriority(e,t){return e}filtersNodes(){return!0}getIndexedFilter(){return this.indexedFilter_}getIndex(){return this.index_}static getStartPost_(e){if(e.hasStart()){const t=e.getIndexStartName();return e.getIndex().makePost(e.getIndexStartValue(),t)}else return e.getIndex().minPost()}static getEndPost_(e){if(e.hasEnd()){const t=e.getIndexEndName();return e.getIndex().makePost(e.getIndexEndValue(),t)}else return e.getIndex().maxPost()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Np{constructor(e){this.withinDirectionalStart=t=>this.reverse_?this.withinEndPost(t):this.withinStartPost(t),this.withinDirectionalEnd=t=>this.reverse_?this.withinStartPost(t):this.withinEndPost(t),this.withinStartPost=t=>{const s=this.index_.compare(this.rangedFilter_.getStartPost(),t);return this.startIsInclusive_?s<=0:s<0},this.withinEndPost=t=>{const s=this.index_.compare(t,this.rangedFilter_.getEndPost());return this.endIsInclusive_?s<=0:s<0},this.rangedFilter_=new Lt(e),this.index_=e.getIndex(),this.limit_=e.getLimit(),this.reverse_=!e.isViewFromLeft(),this.startIsInclusive_=!e.startAfterSet_,this.endIsInclusive_=!e.endBeforeSet_}updateChild(e,t,s,i,r,o){return this.rangedFilter_.matches(new N(t,s))||(s=w.EMPTY_NODE),e.getImmediateChild(t).equals(s)?e:e.numChildren()<this.limit_?this.rangedFilter_.getIndexedFilter().updateChild(e,t,s,i,r,o):this.fullLimitUpdateChild_(e,t,s,r,o)}updateFullNode(e,t,s){let i;if(t.isLeafNode()||t.isEmpty())i=w.EMPTY_NODE.withIndex(this.index_);else if(this.limit_*2<t.numChildren()&&t.isIndexed(this.index_)){i=w.EMPTY_NODE.withIndex(this.index_);let r;this.reverse_?r=t.getReverseIteratorFrom(this.rangedFilter_.getEndPost(),this.index_):r=t.getIteratorFrom(this.rangedFilter_.getStartPost(),this.index_);let o=0;for(;r.hasNext()&&o<this.limit_;){const l=r.getNext();if(this.withinDirectionalStart(l))if(this.withinDirectionalEnd(l))i=i.updateImmediateChild(l.name,l.node),o++;else break;else continue}}else{i=t.withIndex(this.index_),i=i.updatePriority(w.EMPTY_NODE);let r;this.reverse_?r=i.getReverseIterator(this.index_):r=i.getIterator(this.index_);let o=0;for(;r.hasNext();){const l=r.getNext();o<this.limit_&&this.withinDirectionalStart(l)&&this.withinDirectionalEnd(l)?o++:i=i.updateImmediateChild(l.name,w.EMPTY_NODE)}}return this.rangedFilter_.getIndexedFilter().updateFullNode(e,i,s)}updatePriority(e,t){return e}filtersNodes(){return!0}getIndexedFilter(){return this.rangedFilter_.getIndexedFilter()}getIndex(){return this.index_}fullLimitUpdateChild_(e,t,s,i,r){let o;if(this.reverse_){const h=this.index_.getCompare();o=(f,g)=>h(g,f)}else o=this.index_.getCompare();const l=e;m(l.numChildren()===this.limit_,"");const c=new N(t,s),d=this.reverse_?l.getFirstChild(this.index_):l.getLastChild(this.index_),u=this.rangedFilter_.matches(c);if(l.hasChild(t)){const h=l.getImmediateChild(t);let f=i.getChildAfterChild(this.index_,d,this.reverse_);for(;f!=null&&(f.name===t||l.hasChild(f.name));)f=i.getChildAfterChild(this.index_,f,this.reverse_);const g=f==null?1:o(f,c);if(u&&!s.isEmpty()&&g>=0)return r!=null&&r.trackChildChange(Mt(t,s,h)),l.updateImmediateChild(t,s);{r!=null&&r.trackChildChange(jt(t,h));const p=l.updateImmediateChild(t,w.EMPTY_NODE);return f!=null&&this.rangedFilter_.matches(f)?(r!=null&&r.trackChildChange(at(f.name,f.node)),p.updateImmediateChild(f.name,f.node)):p}}else return s.isEmpty()?e:u&&o(d,c)>=0?(r!=null&&(r.trackChildChange(jt(d.name,d.node)),r.trackChildChange(at(t,s))),l.updateImmediateChild(t,s).updateImmediateChild(d.name,w.EMPTY_NODE)):e}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gi{constructor(){this.limitSet_=!1,this.startSet_=!1,this.startNameSet_=!1,this.startAfterSet_=!1,this.endSet_=!1,this.endNameSet_=!1,this.endBeforeSet_=!1,this.limit_=0,this.viewFrom_="",this.indexStartValue_=null,this.indexStartName_="",this.indexEndValue_=null,this.indexEndName_="",this.index_=j}hasStart(){return this.startSet_}isViewFromLeft(){return this.viewFrom_===""?this.startSet_:this.viewFrom_==="l"}getIndexStartValue(){return m(this.startSet_,"Only valid if start has been set"),this.indexStartValue_}getIndexStartName(){return m(this.startSet_,"Only valid if start has been set"),this.startNameSet_?this.indexStartName_:ot}hasEnd(){return this.endSet_}getIndexEndValue(){return m(this.endSet_,"Only valid if end has been set"),this.indexEndValue_}getIndexEndName(){return m(this.endSet_,"Only valid if end has been set"),this.endNameSet_?this.indexEndName_:Ve}hasLimit(){return this.limitSet_}hasAnchoredLimit(){return this.limitSet_&&this.viewFrom_!==""}getLimit(){return m(this.limitSet_,"Only valid if limit has been set"),this.limit_}getIndex(){return this.index_}loadsAllData(){return!(this.startSet_||this.endSet_||this.limitSet_)}isDefault(){return this.loadsAllData()&&this.index_===j}copy(){const e=new gi;return e.limitSet_=this.limitSet_,e.limit_=this.limit_,e.startSet_=this.startSet_,e.startAfterSet_=this.startAfterSet_,e.indexStartValue_=this.indexStartValue_,e.startNameSet_=this.startNameSet_,e.indexStartName_=this.indexStartName_,e.endSet_=this.endSet_,e.endBeforeSet_=this.endBeforeSet_,e.indexEndValue_=this.indexEndValue_,e.endNameSet_=this.endNameSet_,e.indexEndName_=this.indexEndName_,e.index_=this.index_,e.viewFrom_=this.viewFrom_,e}}function kp(n){return n.loadsAllData()?new mi(n.getIndex()):n.hasLimit()?new Np(n):new Lt(n)}function Wr(n){const e={};if(n.isDefault())return e;let t;if(n.index_===j?t="$priority":n.index_===Ip?t="$value":n.index_===tt?t="$key":(m(n.index_ instanceof xp,"Unrecognized index type!"),t=n.index_.toString()),e.orderBy=H(t),n.startSet_){const s=n.startAfterSet_?"startAfter":"startAt";e[s]=H(n.indexStartValue_),n.startNameSet_&&(e[s]+=","+H(n.indexStartName_))}if(n.endSet_){const s=n.endBeforeSet_?"endBefore":"endAt";e[s]=H(n.indexEndValue_),n.endNameSet_&&(e[s]+=","+H(n.indexEndName_))}return n.limitSet_&&(n.isViewFromLeft()?e.limitToFirst=n.limit_:e.limitToLast=n.limit_),e}function Hr(n){const e={};if(n.startSet_&&(e.sp=n.indexStartValue_,n.startNameSet_&&(e.sn=n.indexStartName_),e.sin=!n.startAfterSet_),n.endSet_&&(e.ep=n.indexEndValue_,n.endNameSet_&&(e.en=n.indexEndName_),e.ein=!n.endBeforeSet_),n.limitSet_){e.l=n.limit_;let t=n.viewFrom_;t===""&&(n.isViewFromLeft()?t="l":t="r"),e.vf=t}return n.index_!==j&&(e.i=n.index_.toString()),e}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class In extends Fa{constructor(e,t,s,i){super(),this.repoInfo_=e,this.onDataUpdate_=t,this.authTokenProvider_=s,this.appCheckTokenProvider_=i,this.log_=Gt("p:rest:"),this.listens_={}}reportStats(e){throw new Error("Method not implemented.")}static getListenId_(e,t){return t!==void 0?"tag$"+t:(m(e._queryParams.isDefault(),"should have a tag if it's not a default query."),e._path.toString())}listen(e,t,s,i){const r=e._path.toString();this.log_("Listen called for "+r+" "+e._queryIdentifier);const o=In.getListenId_(e,s),l={};this.listens_[o]=l;const c=Wr(e._queryParams);this.restRequest_(r+".json",c,(d,u)=>{let h=u;if(d===404&&(h=null,d=null),d===null&&this.onDataUpdate_(r,h,!1,s),st(this.listens_,o)===l){let f;d?d===401?f="permission_denied":f="rest_error:"+d:f="ok",i(f,null)}})}unlisten(e,t){const s=In.getListenId_(e,t);delete this.listens_[s]}get(e){const t=Wr(e._queryParams),s=e._path.toString(),i=new Wn;return this.restRequest_(s+".json",t,(r,o)=>{let l=o;r===404&&(l=null,r=null),r===null?(this.onDataUpdate_(s,l,!1,null),i.resolve(l)):i.reject(new Error(l))}),i.promise}refreshAuthToken(e){}restRequest_(e,t={},s){return t.format="export",Promise.all([this.authTokenProvider_.getToken(!1),this.appCheckTokenProvider_.getToken(!1)]).then(([i,r])=>{i&&i.accessToken&&(t.auth=i.accessToken),r&&r.token&&(t.ac=r.token);const o=(this.repoInfo_.secure?"https://":"http://")+this.repoInfo_.host+e+"?ns="+this.repoInfo_.namespace+dt(t);this.log_("Sending REST request for "+o);const l=new XMLHttpRequest;l.onreadystatechange=()=>{if(s&&l.readyState===4){this.log_("REST Response for "+o+" received. status:",l.status,"response:",l.responseText);let c=null;if(l.status>=200&&l.status<300){try{c=Rt(l.responseText)}catch{Q("Failed to parse JSON response for "+o+": "+l.responseText)}s(null,c)}else l.status!==401&&l.status!==404&&Q("Got unsuccessful REST response for "+o+" Status: "+l.status),s(l.status);s=null}},l.open("GET",o,!0),l.send()})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Tp{constructor(){this.rootNode_=w.EMPTY_NODE}getNode(e){return this.rootNode_.getChild(e)}updateSnapshot(e,t){this.rootNode_=this.rootNode_.updateChild(e,t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Cn(){return{value:null,children:new Map}}function Qa(n,e,t){if(k(e))n.value=t,n.children.clear();else if(n.value!==null)n.value=n.value.updateChild(e,t);else{const s=C(e);n.children.has(s)||n.children.set(s,Cn());const i=n.children.get(s);e=O(e),Qa(i,e,t)}}function Ps(n,e,t){n.value!==null?t(e,n.value):Sp(n,(s,i)=>{const r=new A(e.toString()+"/"+s);Ps(i,r,t)})}function Sp(n,e){n.children.forEach((t,s)=>{e(s,t)})}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Rp{constructor(e){this.collection_=e,this.last_=null}get(){const e=this.collection_.get(),t=Object.assign({},e);return this.last_&&J(this.last_,(s,i)=>{t[s]=t[s]-i}),this.last_=e,t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Vr=10*1e3,Ap=30*1e3,Pp=5*60*1e3;class Op{constructor(e,t){this.server_=t,this.statsToReport_={},this.statsListener_=new Rp(e);const s=Vr+(Ap-Vr)*Math.random();Ct(this.reportStats_.bind(this),Math.floor(s))}reportStats_(){const e=this.statsListener_.get(),t={};let s=!1;J(e,(i,r)=>{r>0&&_e(this.statsToReport_,i)&&(t[i]=r,s=!0)}),s&&this.server_.reportStats(t),Ct(this.reportStats_.bind(this),Math.floor(Math.random()*2*Pp))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var ee;(function(n){n[n.OVERWRITE=0]="OVERWRITE",n[n.MERGE=1]="MERGE",n[n.ACK_USER_WRITE=2]="ACK_USER_WRITE",n[n.LISTEN_COMPLETE=3]="LISTEN_COMPLETE"})(ee||(ee={}));function Ja(){return{fromUser:!0,fromServer:!1,queryId:null,tagged:!1}}function _i(){return{fromUser:!1,fromServer:!0,queryId:null,tagged:!1}}function vi(n){return{fromUser:!1,fromServer:!0,queryId:n,tagged:!0}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Nn{constructor(e,t,s){this.path=e,this.affectedTree=t,this.revert=s,this.type=ee.ACK_USER_WRITE,this.source=Ja()}operationForChild(e){if(k(this.path)){if(this.affectedTree.value!=null)return m(this.affectedTree.children.isEmpty(),"affectedTree should not have overlapping affected paths."),this;{const t=this.affectedTree.subtree(new A(e));return new Nn(S(),t,this.revert)}}else return m(C(this.path)===e,"operationForChild called for unrelated child."),new Nn(O(this.path),this.affectedTree,this.revert)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ft{constructor(e,t){this.source=e,this.path=t,this.type=ee.LISTEN_COMPLETE}operationForChild(e){return k(this.path)?new Ft(this.source,S()):new Ft(this.source,O(this.path))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Be{constructor(e,t,s){this.source=e,this.path=t,this.snap=s,this.type=ee.OVERWRITE}operationForChild(e){return k(this.path)?new Be(this.source,S(),this.snap.getImmediateChild(e)):new Be(this.source,O(this.path),this.snap)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ut{constructor(e,t,s){this.source=e,this.path=t,this.children=s,this.type=ee.MERGE}operationForChild(e){if(k(this.path)){const t=this.children.subtree(new A(e));return t.isEmpty()?null:t.value?new Be(this.source,S(),t.value):new Ut(this.source,S(),t)}else return m(C(this.path)===e,"Can't get a merge for a child not on the path of the operation"),new Ut(this.source,O(this.path),this.children)}toString(){return"Operation("+this.path+": "+this.source.toString()+" merge: "+this.children.toString()+")"}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $e{constructor(e,t,s){this.node_=e,this.fullyInitialized_=t,this.filtered_=s}isFullyInitialized(){return this.fullyInitialized_}isFiltered(){return this.filtered_}isCompleteForPath(e){if(k(e))return this.isFullyInitialized()&&!this.filtered_;const t=C(e);return this.isCompleteForChild(t)}isCompleteForChild(e){return this.isFullyInitialized()&&!this.filtered_||this.node_.hasChild(e)}getNode(){return this.node_}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Dp{constructor(e){this.query_=e,this.index_=this.query_._queryParams.getIndex()}}function jp(n,e,t,s){const i=[],r=[];return e.forEach(o=>{o.type==="child_changed"&&n.index_.indexedValueChanged(o.oldSnap,o.snapshotNode)&&r.push(Cp(o.childName,o.snapshotNode))}),wt(n,i,"child_removed",e,s,t),wt(n,i,"child_added",e,s,t),wt(n,i,"child_moved",r,s,t),wt(n,i,"child_changed",e,s,t),wt(n,i,"value",e,s,t),i}function wt(n,e,t,s,i,r){const o=s.filter(l=>l.type===t);o.sort((l,c)=>Lp(n,l,c)),o.forEach(l=>{const c=Mp(n,l,r);i.forEach(d=>{d.respondsTo(l.type)&&e.push(d.createEvent(c,n.query_))})})}function Mp(n,e,t){return e.type==="value"||e.type==="child_removed"||(e.prevName=t.getPredecessorChildName(e.childName,e.snapshotNode,n.index_)),e}function Lp(n,e,t){if(e.childName==null||t.childName==null)throw ct("Should only compare child_ events.");const s=new N(e.childName,e.snapshotNode),i=new N(t.childName,t.snapshotNode);return n.index_.compare(s,i)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Gn(n,e){return{eventCache:n,serverCache:e}}function Nt(n,e,t,s){return Gn(new $e(e,t,s),n.serverCache)}function Xa(n,e,t,s){return Gn(n.eventCache,new $e(e,t,s))}function Os(n){return n.eventCache.isFullyInitialized()?n.eventCache.getNode():null}function qe(n){return n.serverCache.isFullyInitialized()?n.serverCache.getNode():null}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let us;const Fp=()=>(us||(us=new Y(Ef)),us);class D{constructor(e,t=Fp()){this.value=e,this.children=t}static fromObject(e){let t=new D(null);return J(e,(s,i)=>{t=t.set(new A(s),i)}),t}isEmpty(){return this.value===null&&this.children.isEmpty()}findRootMostMatchingPathAndValue(e,t){if(this.value!=null&&t(this.value))return{path:S(),value:this.value};if(k(e))return null;{const s=C(e),i=this.children.get(s);if(i!==null){const r=i.findRootMostMatchingPathAndValue(O(e),t);return r!=null?{path:L(new A(s),r.path),value:r.value}:null}else return null}}findRootMostValueAndPath(e){return this.findRootMostMatchingPathAndValue(e,()=>!0)}subtree(e){if(k(e))return this;{const t=C(e),s=this.children.get(t);return s!==null?s.subtree(O(e)):new D(null)}}set(e,t){if(k(e))return new D(t,this.children);{const s=C(e),r=(this.children.get(s)||new D(null)).set(O(e),t),o=this.children.insert(s,r);return new D(this.value,o)}}remove(e){if(k(e))return this.children.isEmpty()?new D(null):new D(null,this.children);{const t=C(e),s=this.children.get(t);if(s){const i=s.remove(O(e));let r;return i.isEmpty()?r=this.children.remove(t):r=this.children.insert(t,i),this.value===null&&r.isEmpty()?new D(null):new D(this.value,r)}else return this}}get(e){if(k(e))return this.value;{const t=C(e),s=this.children.get(t);return s?s.get(O(e)):null}}setTree(e,t){if(k(e))return t;{const s=C(e),r=(this.children.get(s)||new D(null)).setTree(O(e),t);let o;return r.isEmpty()?o=this.children.remove(s):o=this.children.insert(s,r),new D(this.value,o)}}fold(e){return this.fold_(S(),e)}fold_(e,t){const s={};return this.children.inorderTraversal((i,r)=>{s[i]=r.fold_(L(e,i),t)}),t(e,this.value,s)}findOnPath(e,t){return this.findOnPath_(e,S(),t)}findOnPath_(e,t,s){const i=this.value?s(t,this.value):!1;if(i)return i;if(k(e))return null;{const r=C(e),o=this.children.get(r);return o?o.findOnPath_(O(e),L(t,r),s):null}}foreachOnPath(e,t){return this.foreachOnPath_(e,S(),t)}foreachOnPath_(e,t,s){if(k(e))return this;{this.value&&s(t,this.value);const i=C(e),r=this.children.get(i);return r?r.foreachOnPath_(O(e),L(t,i),s):new D(null)}}foreach(e){this.foreach_(S(),e)}foreach_(e,t){this.children.inorderTraversal((s,i)=>{i.foreach_(L(e,s),t)}),this.value&&t(e,this.value)}foreachChild(e){this.children.inorderTraversal((t,s)=>{s.value&&e(t,s.value)})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class te{constructor(e){this.writeTree_=e}static empty(){return new te(new D(null))}}function kt(n,e,t){if(k(e))return new te(new D(t));{const s=n.writeTree_.findRootMostValueAndPath(e);if(s!=null){const i=s.path;let r=s.value;const o=K(i,e);return r=r.updateChild(o,t),new te(n.writeTree_.set(i,r))}else{const i=new D(t),r=n.writeTree_.setTree(e,i);return new te(r)}}}function Br(n,e,t){let s=n;return J(t,(i,r)=>{s=kt(s,L(e,i),r)}),s}function $r(n,e){if(k(e))return te.empty();{const t=n.writeTree_.setTree(e,new D(null));return new te(t)}}function Ds(n,e){return Ge(n,e)!=null}function Ge(n,e){const t=n.writeTree_.findRootMostValueAndPath(e);return t!=null?n.writeTree_.get(t.path).getChild(K(t.path,e)):null}function qr(n){const e=[],t=n.writeTree_.value;return t!=null?t.isLeafNode()||t.forEachChild(j,(s,i)=>{e.push(new N(s,i))}):n.writeTree_.children.inorderTraversal((s,i)=>{i.value!=null&&e.push(new N(s,i.value))}),e}function Te(n,e){if(k(e))return n;{const t=Ge(n,e);return t!=null?new te(new D(t)):new te(n.writeTree_.subtree(e))}}function js(n){return n.writeTree_.isEmpty()}function lt(n,e){return Za(S(),n.writeTree_,e)}function Za(n,e,t){if(e.value!=null)return t.updateChild(n,e.value);{let s=null;return e.children.inorderTraversal((i,r)=>{i===".priority"?(m(r.value!==null,"Priority writes must always be leaf nodes"),s=r.value):t=Za(L(n,i),r,t)}),!t.getChild(n).isEmpty()&&s!==null&&(t=t.updateChild(L(n,".priority"),s)),t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function yi(n,e){return sl(e,n)}function Up(n,e,t,s,i){m(s>n.lastWriteId,"Stacking an older write on top of newer ones"),i===void 0&&(i=!0),n.allWrites.push({path:e,snap:t,writeId:s,visible:i}),i&&(n.visibleWrites=kt(n.visibleWrites,e,t)),n.lastWriteId=s}function Wp(n,e){for(let t=0;t<n.allWrites.length;t++){const s=n.allWrites[t];if(s.writeId===e)return s}return null}function Hp(n,e){const t=n.allWrites.findIndex(l=>l.writeId===e);m(t>=0,"removeWrite called with nonexistent writeId.");const s=n.allWrites[t];n.allWrites.splice(t,1);let i=s.visible,r=!1,o=n.allWrites.length-1;for(;i&&o>=0;){const l=n.allWrites[o];l.visible&&(o>=t&&Vp(l,s.path)?i=!1:Z(s.path,l.path)&&(r=!0)),o--}if(i){if(r)return Bp(n),!0;if(s.snap)n.visibleWrites=$r(n.visibleWrites,s.path);else{const l=s.children;J(l,c=>{n.visibleWrites=$r(n.visibleWrites,L(s.path,c))})}return!0}else return!1}function Vp(n,e){if(n.snap)return Z(n.path,e);for(const t in n.children)if(n.children.hasOwnProperty(t)&&Z(L(n.path,t),e))return!0;return!1}function Bp(n){n.visibleWrites=el(n.allWrites,$p,S()),n.allWrites.length>0?n.lastWriteId=n.allWrites[n.allWrites.length-1].writeId:n.lastWriteId=-1}function $p(n){return n.visible}function el(n,e,t){let s=te.empty();for(let i=0;i<n.length;++i){const r=n[i];if(e(r)){const o=r.path;let l;if(r.snap)Z(t,o)?(l=K(t,o),s=kt(s,l,r.snap)):Z(o,t)&&(l=K(o,t),s=kt(s,S(),r.snap.getChild(l)));else if(r.children){if(Z(t,o))l=K(t,o),s=Br(s,l,r.children);else if(Z(o,t))if(l=K(o,t),k(l))s=Br(s,S(),r.children);else{const c=st(r.children,C(l));if(c){const d=c.getChild(O(l));s=kt(s,S(),d)}}}else throw ct("WriteRecord should have .snap or .children")}}return s}function tl(n,e,t,s,i){if(!s&&!i){const r=Ge(n.visibleWrites,e);if(r!=null)return r;{const o=Te(n.visibleWrites,e);if(js(o))return t;if(t==null&&!Ds(o,S()))return null;{const l=t||w.EMPTY_NODE;return lt(o,l)}}}else{const r=Te(n.visibleWrites,e);if(!i&&js(r))return t;if(!i&&t==null&&!Ds(r,S()))return null;{const o=function(d){return(d.visible||i)&&(!s||!~s.indexOf(d.writeId))&&(Z(d.path,e)||Z(e,d.path))},l=el(n.allWrites,o,e),c=t||w.EMPTY_NODE;return lt(l,c)}}}function qp(n,e,t){let s=w.EMPTY_NODE;const i=Ge(n.visibleWrites,e);if(i)return i.isLeafNode()||i.forEachChild(j,(r,o)=>{s=s.updateImmediateChild(r,o)}),s;if(t){const r=Te(n.visibleWrites,e);return t.forEachChild(j,(o,l)=>{const c=lt(Te(r,new A(o)),l);s=s.updateImmediateChild(o,c)}),qr(r).forEach(o=>{s=s.updateImmediateChild(o.name,o.node)}),s}else{const r=Te(n.visibleWrites,e);return qr(r).forEach(o=>{s=s.updateImmediateChild(o.name,o.node)}),s}}function zp(n,e,t,s,i){m(s||i,"Either existingEventSnap or existingServerSnap must exist");const r=L(e,t);if(Ds(n.visibleWrites,r))return null;{const o=Te(n.visibleWrites,r);return js(o)?i.getChild(t):lt(o,i.getChild(t))}}function Gp(n,e,t,s){const i=L(e,t),r=Ge(n.visibleWrites,i);if(r!=null)return r;if(s.isCompleteForChild(t)){const o=Te(n.visibleWrites,i);return lt(o,s.getNode().getImmediateChild(t))}else return null}function Kp(n,e){return Ge(n.visibleWrites,e)}function Yp(n,e,t,s,i,r,o){let l;const c=Te(n.visibleWrites,e),d=Ge(c,S());if(d!=null)l=d;else if(t!=null)l=lt(c,t);else return[];if(l=l.withIndex(o),!l.isEmpty()&&!l.isLeafNode()){const u=[],h=o.getCompare(),f=r?l.getReverseIteratorFrom(s,o):l.getIteratorFrom(s,o);let g=f.getNext();for(;g&&u.length<i;)h(g,s)!==0&&u.push(g),g=f.getNext();return u}else return[]}function Qp(){return{visibleWrites:te.empty(),allWrites:[],lastWriteId:-1}}function kn(n,e,t,s){return tl(n.writeTree,n.treePath,e,t,s)}function wi(n,e){return qp(n.writeTree,n.treePath,e)}function zr(n,e,t,s){return zp(n.writeTree,n.treePath,e,t,s)}function Tn(n,e){return Kp(n.writeTree,L(n.treePath,e))}function Jp(n,e,t,s,i,r){return Yp(n.writeTree,n.treePath,e,t,s,i,r)}function bi(n,e,t){return Gp(n.writeTree,n.treePath,e,t)}function nl(n,e){return sl(L(n.treePath,e),n.writeTree)}function sl(n,e){return{treePath:n,writeTree:e}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xp{constructor(){this.changeMap=new Map}trackChildChange(e){const t=e.type,s=e.childName;m(t==="child_added"||t==="child_changed"||t==="child_removed","Only child changes supported for tracking"),m(s!==".priority","Only non-priority child changes can be tracked.");const i=this.changeMap.get(s);if(i){const r=i.type;if(t==="child_added"&&r==="child_removed")this.changeMap.set(s,Mt(s,e.snapshotNode,i.snapshotNode));else if(t==="child_removed"&&r==="child_added")this.changeMap.delete(s);else if(t==="child_removed"&&r==="child_changed")this.changeMap.set(s,jt(s,i.oldSnap));else if(t==="child_changed"&&r==="child_added")this.changeMap.set(s,at(s,e.snapshotNode));else if(t==="child_changed"&&r==="child_changed")this.changeMap.set(s,Mt(s,e.snapshotNode,i.oldSnap));else throw ct("Illegal combination of changes: "+e+" occurred after "+i)}else this.changeMap.set(s,e)}getChanges(){return Array.from(this.changeMap.values())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Zp{getCompleteChild(e){return null}getChildAfterChild(e,t,s){return null}}const il=new Zp;class xi{constructor(e,t,s=null){this.writes_=e,this.viewCache_=t,this.optCompleteServerCache_=s}getCompleteChild(e){const t=this.viewCache_.eventCache;if(t.isCompleteForChild(e))return t.getNode().getImmediateChild(e);{const s=this.optCompleteServerCache_!=null?new $e(this.optCompleteServerCache_,!0,!1):this.viewCache_.serverCache;return bi(this.writes_,e,s)}}getChildAfterChild(e,t,s){const i=this.optCompleteServerCache_!=null?this.optCompleteServerCache_:qe(this.viewCache_),r=Jp(this.writes_,i,t,1,s,e);return r.length===0?null:r[0]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function em(n){return{filter:n}}function tm(n,e){m(e.eventCache.getNode().isIndexed(n.filter.getIndex()),"Event snap not indexed"),m(e.serverCache.getNode().isIndexed(n.filter.getIndex()),"Server snap not indexed")}function nm(n,e,t,s,i){const r=new Xp;let o,l;if(t.type===ee.OVERWRITE){const d=t;d.source.fromUser?o=Ms(n,e,d.path,d.snap,s,i,r):(m(d.source.fromServer,"Unknown source."),l=d.source.tagged||e.serverCache.isFiltered()&&!k(d.path),o=Sn(n,e,d.path,d.snap,s,i,l,r))}else if(t.type===ee.MERGE){const d=t;d.source.fromUser?o=im(n,e,d.path,d.children,s,i,r):(m(d.source.fromServer,"Unknown source."),l=d.source.tagged||e.serverCache.isFiltered(),o=Ls(n,e,d.path,d.children,s,i,l,r))}else if(t.type===ee.ACK_USER_WRITE){const d=t;d.revert?o=am(n,e,d.path,s,i,r):o=rm(n,e,d.path,d.affectedTree,s,i,r)}else if(t.type===ee.LISTEN_COMPLETE)o=om(n,e,t.path,s,r);else throw ct("Unknown operation type: "+t.type);const c=r.getChanges();return sm(e,o,c),{viewCache:o,changes:c}}function sm(n,e,t){const s=e.eventCache;if(s.isFullyInitialized()){const i=s.getNode().isLeafNode()||s.getNode().isEmpty(),r=Os(n);(t.length>0||!n.eventCache.isFullyInitialized()||i&&!s.getNode().equals(r)||!s.getNode().getPriority().equals(r.getPriority()))&&t.push(Ya(Os(e)))}}function rl(n,e,t,s,i,r){const o=e.eventCache;if(Tn(s,t)!=null)return e;{let l,c;if(k(t))if(m(e.serverCache.isFullyInitialized(),"If change path is empty, we must have complete server data"),e.serverCache.isFiltered()){const d=qe(e),u=d instanceof w?d:w.EMPTY_NODE,h=wi(s,u);l=n.filter.updateFullNode(e.eventCache.getNode(),h,r)}else{const d=kn(s,qe(e));l=n.filter.updateFullNode(e.eventCache.getNode(),d,r)}else{const d=C(t);if(d===".priority"){m(Se(t)===1,"Can't have a priority with additional path components");const u=o.getNode();c=e.serverCache.getNode();const h=zr(s,t,u,c);h!=null?l=n.filter.updatePriority(u,h):l=o.getNode()}else{const u=O(t);let h;if(o.isCompleteForChild(d)){c=e.serverCache.getNode();const f=zr(s,t,o.getNode(),c);f!=null?h=o.getNode().getImmediateChild(d).updateChild(u,f):h=o.getNode().getImmediateChild(d)}else h=bi(s,d,e.serverCache);h!=null?l=n.filter.updateChild(o.getNode(),d,h,u,i,r):l=o.getNode()}}return Nt(e,l,o.isFullyInitialized()||k(t),n.filter.filtersNodes())}}function Sn(n,e,t,s,i,r,o,l){const c=e.serverCache;let d;const u=o?n.filter:n.filter.getIndexedFilter();if(k(t))d=u.updateFullNode(c.getNode(),s,null);else if(u.filtersNodes()&&!c.isFiltered()){const g=c.getNode().updateChild(t,s);d=u.updateFullNode(c.getNode(),g,null)}else{const g=C(t);if(!c.isCompleteForPath(t)&&Se(t)>1)return e;const _=O(t),v=c.getNode().getImmediateChild(g).updateChild(_,s);g===".priority"?d=u.updatePriority(c.getNode(),v):d=u.updateChild(c.getNode(),g,v,_,il,null)}const h=Xa(e,d,c.isFullyInitialized()||k(t),u.filtersNodes()),f=new xi(i,h,r);return rl(n,h,t,i,f,l)}function Ms(n,e,t,s,i,r,o){const l=e.eventCache;let c,d;const u=new xi(i,e,r);if(k(t))d=n.filter.updateFullNode(e.eventCache.getNode(),s,o),c=Nt(e,d,!0,n.filter.filtersNodes());else{const h=C(t);if(h===".priority")d=n.filter.updatePriority(e.eventCache.getNode(),s),c=Nt(e,d,l.isFullyInitialized(),l.isFiltered());else{const f=O(t),g=l.getNode().getImmediateChild(h);let _;if(k(f))_=s;else{const p=u.getCompleteChild(h);p!=null?Wa(f)===".priority"&&p.getChild(Va(f)).isEmpty()?_=p:_=p.updateChild(f,s):_=w.EMPTY_NODE}if(g.equals(_))c=e;else{const p=n.filter.updateChild(l.getNode(),h,_,f,u,o);c=Nt(e,p,l.isFullyInitialized(),n.filter.filtersNodes())}}}return c}function Gr(n,e){return n.eventCache.isCompleteForChild(e)}function im(n,e,t,s,i,r,o){let l=e;return s.foreach((c,d)=>{const u=L(t,c);Gr(e,C(u))&&(l=Ms(n,l,u,d,i,r,o))}),s.foreach((c,d)=>{const u=L(t,c);Gr(e,C(u))||(l=Ms(n,l,u,d,i,r,o))}),l}function Kr(n,e,t){return t.foreach((s,i)=>{e=e.updateChild(s,i)}),e}function Ls(n,e,t,s,i,r,o,l){if(e.serverCache.getNode().isEmpty()&&!e.serverCache.isFullyInitialized())return e;let c=e,d;k(t)?d=s:d=new D(null).setTree(t,s);const u=e.serverCache.getNode();return d.children.inorderTraversal((h,f)=>{if(u.hasChild(h)){const g=e.serverCache.getNode().getImmediateChild(h),_=Kr(n,g,f);c=Sn(n,c,new A(h),_,i,r,o,l)}}),d.children.inorderTraversal((h,f)=>{const g=!e.serverCache.isCompleteForChild(h)&&f.value===null;if(!u.hasChild(h)&&!g){const _=e.serverCache.getNode().getImmediateChild(h),p=Kr(n,_,f);c=Sn(n,c,new A(h),p,i,r,o,l)}}),c}function rm(n,e,t,s,i,r,o){if(Tn(i,t)!=null)return e;const l=e.serverCache.isFiltered(),c=e.serverCache;if(s.value!=null){if(k(t)&&c.isFullyInitialized()||c.isCompleteForPath(t))return Sn(n,e,t,c.getNode().getChild(t),i,r,l,o);if(k(t)){let d=new D(null);return c.getNode().forEachChild(tt,(u,h)=>{d=d.set(new A(u),h)}),Ls(n,e,t,d,i,r,l,o)}else return e}else{let d=new D(null);return s.foreach((u,h)=>{const f=L(t,u);c.isCompleteForPath(f)&&(d=d.set(u,c.getNode().getChild(f)))}),Ls(n,e,t,d,i,r,l,o)}}function om(n,e,t,s,i){const r=e.serverCache,o=Xa(e,r.getNode(),r.isFullyInitialized()||k(t),r.isFiltered());return rl(n,o,t,s,il,i)}function am(n,e,t,s,i,r){let o;if(Tn(s,t)!=null)return e;{const l=new xi(s,e,i),c=e.eventCache.getNode();let d;if(k(t)||C(t)===".priority"){let u;if(e.serverCache.isFullyInitialized())u=kn(s,qe(e));else{const h=e.serverCache.getNode();m(h instanceof w,"serverChildren would be complete if leaf node"),u=wi(s,h)}u=u,d=n.filter.updateFullNode(c,u,r)}else{const u=C(t);let h=bi(s,u,e.serverCache);h==null&&e.serverCache.isCompleteForChild(u)&&(h=c.getImmediateChild(u)),h!=null?d=n.filter.updateChild(c,u,h,O(t),l,r):e.eventCache.getNode().hasChild(u)?d=n.filter.updateChild(c,u,w.EMPTY_NODE,O(t),l,r):d=c,d.isEmpty()&&e.serverCache.isFullyInitialized()&&(o=kn(s,qe(e)),o.isLeafNode()&&(d=n.filter.updateFullNode(d,o,r)))}return o=e.serverCache.isFullyInitialized()||Tn(s,S())!=null,Nt(e,d,o,n.filter.filtersNodes())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class lm{constructor(e,t){this.query_=e,this.eventRegistrations_=[];const s=this.query_._queryParams,i=new mi(s.getIndex()),r=kp(s);this.processor_=em(r);const o=t.serverCache,l=t.eventCache,c=i.updateFullNode(w.EMPTY_NODE,o.getNode(),null),d=r.updateFullNode(w.EMPTY_NODE,l.getNode(),null),u=new $e(c,o.isFullyInitialized(),i.filtersNodes()),h=new $e(d,l.isFullyInitialized(),r.filtersNodes());this.viewCache_=Gn(h,u),this.eventGenerator_=new Dp(this.query_)}get query(){return this.query_}}function cm(n){return n.viewCache_.serverCache.getNode()}function dm(n,e){const t=qe(n.viewCache_);return t&&(n.query._queryParams.loadsAllData()||!k(e)&&!t.getImmediateChild(C(e)).isEmpty())?t.getChild(e):null}function Yr(n){return n.eventRegistrations_.length===0}function hm(n,e){n.eventRegistrations_.push(e)}function Qr(n,e,t){const s=[];if(t){m(e==null,"A cancel should cancel all event registrations.");const i=n.query._path;n.eventRegistrations_.forEach(r=>{const o=r.createCancelEvent(t,i);o&&s.push(o)})}if(e){let i=[];for(let r=0;r<n.eventRegistrations_.length;++r){const o=n.eventRegistrations_[r];if(!o.matches(e))i.push(o);else if(e.hasAnyCallback()){i=i.concat(n.eventRegistrations_.slice(r+1));break}}n.eventRegistrations_=i}else n.eventRegistrations_=[];return s}function Jr(n,e,t,s){e.type===ee.MERGE&&e.source.queryId!==null&&(m(qe(n.viewCache_),"We should always have a full cache before handling merges"),m(Os(n.viewCache_),"Missing event cache, even though we have a server cache"));const i=n.viewCache_,r=nm(n.processor_,i,e,t,s);return tm(n.processor_,r.viewCache),m(r.viewCache.serverCache.isFullyInitialized()||!i.serverCache.isFullyInitialized(),"Once a server snap is complete, it should never go back"),n.viewCache_=r.viewCache,ol(n,r.changes,r.viewCache.eventCache.getNode(),null)}function um(n,e){const t=n.viewCache_.eventCache,s=[];return t.getNode().isLeafNode()||t.getNode().forEachChild(j,(r,o)=>{s.push(at(r,o))}),t.isFullyInitialized()&&s.push(Ya(t.getNode())),ol(n,s,t.getNode(),e)}function ol(n,e,t,s){const i=s?[s]:n.eventRegistrations_;return jp(n.eventGenerator_,e,t,i)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Rn;class fm{constructor(){this.views=new Map}}function pm(n){m(!Rn,"__referenceConstructor has already been defined"),Rn=n}function mm(){return m(Rn,"Reference.ts has not been loaded"),Rn}function gm(n){return n.views.size===0}function Ei(n,e,t,s){const i=e.source.queryId;if(i!==null){const r=n.views.get(i);return m(r!=null,"SyncTree gave us an op for an invalid query."),Jr(r,e,t,s)}else{let r=[];for(const o of n.views.values())r=r.concat(Jr(o,e,t,s));return r}}function _m(n,e,t,s,i){const r=e._queryIdentifier,o=n.views.get(r);if(!o){let l=kn(t,i?s:null),c=!1;l?c=!0:s instanceof w?(l=wi(t,s),c=!1):(l=w.EMPTY_NODE,c=!1);const d=Gn(new $e(l,c,!1),new $e(s,i,!1));return new lm(e,d)}return o}function vm(n,e,t,s,i,r){const o=_m(n,e,s,i,r);return n.views.has(e._queryIdentifier)||n.views.set(e._queryIdentifier,o),hm(o,t),um(o,t)}function ym(n,e,t,s){const i=e._queryIdentifier,r=[];let o=[];const l=Re(n);if(i==="default")for(const[c,d]of n.views.entries())o=o.concat(Qr(d,t,s)),Yr(d)&&(n.views.delete(c),d.query._queryParams.loadsAllData()||r.push(d.query));else{const c=n.views.get(i);c&&(o=o.concat(Qr(c,t,s)),Yr(c)&&(n.views.delete(i),c.query._queryParams.loadsAllData()||r.push(c.query)))}return l&&!Re(n)&&r.push(new(mm())(e._repo,e._path)),{removed:r,events:o}}function al(n){const e=[];for(const t of n.views.values())t.query._queryParams.loadsAllData()||e.push(t);return e}function nt(n,e){let t=null;for(const s of n.views.values())t=t||dm(s,e);return t}function ll(n,e){if(e._queryParams.loadsAllData())return Kn(n);{const s=e._queryIdentifier;return n.views.get(s)}}function cl(n,e){return ll(n,e)!=null}function Re(n){return Kn(n)!=null}function Kn(n){for(const e of n.views.values())if(e.query._queryParams.loadsAllData())return e;return null}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let An;function wm(n){m(!An,"__referenceConstructor has already been defined"),An=n}function bm(){return m(An,"Reference.ts has not been loaded"),An}let xm=1;class Xr{constructor(e){this.listenProvider_=e,this.syncPointTree_=new D(null),this.pendingWriteTree_=Qp(),this.tagToQueryMap=new Map,this.queryToTagMap=new Map}}function dl(n,e,t,s,i){return Up(n.pendingWriteTree_,e,t,s,i),i?Yt(n,new Be(Ja(),e,t)):[]}function Ue(n,e,t=!1){const s=Wp(n.pendingWriteTree_,e);if(Hp(n.pendingWriteTree_,e)){let r=new D(null);return s.snap!=null?r=r.set(S(),!0):J(s.children,o=>{r=r.set(new A(o),!0)}),Yt(n,new Nn(s.path,r,t))}else return[]}function Yn(n,e,t){return Yt(n,new Be(_i(),e,t))}function Em(n,e,t){const s=D.fromObject(t);return Yt(n,new Ut(_i(),e,s))}function Im(n,e){return Yt(n,new Ft(_i(),e))}function Cm(n,e,t){const s=Ci(n,t);if(s){const i=Ni(s),r=i.path,o=i.queryId,l=K(r,e),c=new Ft(vi(o),l);return ki(n,r,c)}else return[]}function Fs(n,e,t,s,i=!1){const r=e._path,o=n.syncPointTree_.get(r);let l=[];if(o&&(e._queryIdentifier==="default"||cl(o,e))){const c=ym(o,e,t,s);gm(o)&&(n.syncPointTree_=n.syncPointTree_.remove(r));const d=c.removed;if(l=c.events,!i){const u=d.findIndex(f=>f._queryParams.loadsAllData())!==-1,h=n.syncPointTree_.findOnPath(r,(f,g)=>Re(g));if(u&&!h){const f=n.syncPointTree_.subtree(r);if(!f.isEmpty()){const g=Tm(f);for(let _=0;_<g.length;++_){const p=g[_],v=p.query,I=fl(n,p);n.listenProvider_.startListening(Tt(v),Pn(n,v),I.hashFn,I.onComplete)}}}!h&&d.length>0&&!s&&(u?n.listenProvider_.stopListening(Tt(e),null):d.forEach(f=>{const g=n.queryToTagMap.get(Qn(f));n.listenProvider_.stopListening(Tt(f),g)}))}Sm(n,d)}return l}function Nm(n,e,t,s){const i=Ci(n,s);if(i!=null){const r=Ni(i),o=r.path,l=r.queryId,c=K(o,e),d=new Be(vi(l),c,t);return ki(n,o,d)}else return[]}function km(n,e,t,s){const i=Ci(n,s);if(i){const r=Ni(i),o=r.path,l=r.queryId,c=K(o,e),d=D.fromObject(t),u=new Ut(vi(l),c,d);return ki(n,o,u)}else return[]}function Zr(n,e,t,s=!1){const i=e._path;let r=null,o=!1;n.syncPointTree_.foreachOnPath(i,(f,g)=>{const _=K(f,i);r=r||nt(g,_),o=o||Re(g)});let l=n.syncPointTree_.get(i);l?(o=o||Re(l),r=r||nt(l,S())):(l=new fm,n.syncPointTree_=n.syncPointTree_.set(i,l));let c;r!=null?c=!0:(c=!1,r=w.EMPTY_NODE,n.syncPointTree_.subtree(i).foreachChild((g,_)=>{const p=nt(_,S());p&&(r=r.updateImmediateChild(g,p))}));const d=cl(l,e);if(!d&&!e._queryParams.loadsAllData()){const f=Qn(e);m(!n.queryToTagMap.has(f),"View does not exist, but we have a tag");const g=Rm();n.queryToTagMap.set(f,g),n.tagToQueryMap.set(g,f)}const u=yi(n.pendingWriteTree_,i);let h=vm(l,e,t,u,r,c);if(!d&&!o&&!s){const f=ll(l,e);h=h.concat(Am(n,e,f))}return h}function Ii(n,e,t){const i=n.pendingWriteTree_,r=n.syncPointTree_.findOnPath(e,(o,l)=>{const c=K(o,e),d=nt(l,c);if(d)return d});return tl(i,e,r,t,!0)}function Yt(n,e){return hl(e,n.syncPointTree_,null,yi(n.pendingWriteTree_,S()))}function hl(n,e,t,s){if(k(n.path))return ul(n,e,t,s);{const i=e.get(S());t==null&&i!=null&&(t=nt(i,S()));let r=[];const o=C(n.path),l=n.operationForChild(o),c=e.children.get(o);if(c&&l){const d=t?t.getImmediateChild(o):null,u=nl(s,o);r=r.concat(hl(l,c,d,u))}return i&&(r=r.concat(Ei(i,n,s,t))),r}}function ul(n,e,t,s){const i=e.get(S());t==null&&i!=null&&(t=nt(i,S()));let r=[];return e.children.inorderTraversal((o,l)=>{const c=t?t.getImmediateChild(o):null,d=nl(s,o),u=n.operationForChild(o);u&&(r=r.concat(ul(u,l,c,d)))}),i&&(r=r.concat(Ei(i,n,s,t))),r}function fl(n,e){const t=e.query,s=Pn(n,t);return{hashFn:()=>(cm(e)||w.EMPTY_NODE).hash(),onComplete:i=>{if(i==="ok")return s?Cm(n,t._path,s):Im(n,t._path);{const r=Nf(i,t);return Fs(n,t,null,r)}}}}function Pn(n,e){const t=Qn(e);return n.queryToTagMap.get(t)}function Qn(n){return n._path.toString()+"$"+n._queryIdentifier}function Ci(n,e){return n.tagToQueryMap.get(e)}function Ni(n){const e=n.indexOf("$");return m(e!==-1&&e<n.length-1,"Bad queryKey."),{queryId:n.substr(e+1),path:new A(n.substr(0,e))}}function ki(n,e,t){const s=n.syncPointTree_.get(e);m(s,"Missing sync point for query tag that we're tracking");const i=yi(n.pendingWriteTree_,e);return Ei(s,t,i,null)}function Tm(n){return n.fold((e,t,s)=>{if(t&&Re(t))return[Kn(t)];{let i=[];return t&&(i=al(t)),J(s,(r,o)=>{i=i.concat(o)}),i}})}function Tt(n){return n._queryParams.loadsAllData()&&!n._queryParams.isDefault()?new(bm())(n._repo,n._path):n}function Sm(n,e){for(let t=0;t<e.length;++t){const s=e[t];if(!s._queryParams.loadsAllData()){const i=Qn(s),r=n.queryToTagMap.get(i);n.queryToTagMap.delete(i),n.tagToQueryMap.delete(r)}}}function Rm(){return xm++}function Am(n,e,t){const s=e._path,i=Pn(n,e),r=fl(n,t),o=n.listenProvider_.startListening(Tt(e),i,r.hashFn,r.onComplete),l=n.syncPointTree_.subtree(s);if(i)m(!Re(l.value),"If we're adding a query, it shouldn't be shadowed");else{const c=l.fold((d,u,h)=>{if(!k(d)&&u&&Re(u))return[Kn(u).query];{let f=[];return u&&(f=f.concat(al(u).map(g=>g.query))),J(h,(g,_)=>{f=f.concat(_)}),f}});for(let d=0;d<c.length;++d){const u=c[d];n.listenProvider_.stopListening(Tt(u),Pn(n,u))}}return o}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ti{constructor(e){this.node_=e}getImmediateChild(e){const t=this.node_.getImmediateChild(e);return new Ti(t)}node(){return this.node_}}class Si{constructor(e,t){this.syncTree_=e,this.path_=t}getImmediateChild(e){const t=L(this.path_,e);return new Si(this.syncTree_,t)}node(){return Ii(this.syncTree_,this.path_)}}const Pm=function(n){return n=n||{},n.timestamp=n.timestamp||new Date().getTime(),n},eo=function(n,e,t){if(!n||typeof n!="object")return n;if(m(".sv"in n,"Unexpected leaf node or priority contents"),typeof n[".sv"]=="string")return Om(n[".sv"],e,t);if(typeof n[".sv"]=="object")return Dm(n[".sv"],e);m(!1,"Unexpected server value: "+JSON.stringify(n,null,2))},Om=function(n,e,t){switch(n){case"timestamp":return t.timestamp;default:m(!1,"Unexpected server value: "+n)}},Dm=function(n,e,t){n.hasOwnProperty("increment")||m(!1,"Unexpected server value: "+JSON.stringify(n,null,2));const s=n.increment;typeof s!="number"&&m(!1,"Unexpected increment value: "+s);const i=e.node();if(m(i!==null&&typeof i<"u","Expected ChildrenNode.EMPTY_NODE for nulls"),!i.isLeafNode())return s;const o=i.getValue();return typeof o!="number"?s:o+s},jm=function(n,e,t,s){return Ri(e,new Si(t,n),s)},pl=function(n,e,t){return Ri(n,new Ti(e),t)};function Ri(n,e,t){const s=n.getPriority().val(),i=eo(s,e.getImmediateChild(".priority"),t);let r;if(n.isLeafNode()){const o=n,l=eo(o.getValue(),e,t);return l!==o.getValue()||i!==o.getPriority().val()?new U(l,V(i)):n}else{const o=n;return r=o,i!==o.getPriority().val()&&(r=r.updatePriority(new U(i))),o.forEachChild(j,(l,c)=>{const d=Ri(c,e.getImmediateChild(l),t);d!==c&&(r=r.updateImmediateChild(l,d))}),r}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ai{constructor(e="",t=null,s={children:{},childCount:0}){this.name=e,this.parent=t,this.node=s}}function Pi(n,e){let t=e instanceof A?e:new A(e),s=n,i=C(t);for(;i!==null;){const r=st(s.node.children,i)||{children:{},childCount:0};s=new Ai(i,s,r),t=O(t),i=C(t)}return s}function gt(n){return n.node.value}function ml(n,e){n.node.value=e,Us(n)}function gl(n){return n.node.childCount>0}function Mm(n){return gt(n)===void 0&&!gl(n)}function Jn(n,e){J(n.node.children,(t,s)=>{e(new Ai(t,n,s))})}function _l(n,e,t,s){t&&!s&&e(n),Jn(n,i=>{_l(i,e,!0,s)}),t&&s&&e(n)}function Lm(n,e,t){let s=n.parent;for(;s!==null;){if(e(s))return!0;s=s.parent}return!1}function Qt(n){return new A(n.parent===null?n.name:Qt(n.parent)+"/"+n.name)}function Us(n){n.parent!==null&&Fm(n.parent,n.name,n)}function Fm(n,e,t){const s=Mm(t),i=_e(n.node.children,e);s&&i?(delete n.node.children[e],n.node.childCount--,Us(n)):!s&&!i&&(n.node.children[e]=t.node,n.node.childCount++,Us(n))}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Um=/[\[\].#$\/\u0000-\u001F\u007F]/,Wm=/[\[\].#$\u0000-\u001F\u007F]/,fs=10*1024*1024,vl=function(n){return typeof n=="string"&&n.length!==0&&!Um.test(n)},yl=function(n){return typeof n=="string"&&n.length!==0&&!Wm.test(n)},Hm=function(n){return n&&(n=n.replace(/^\/*\.info(\/|$)/,"/")),yl(n)},wl=function(n,e,t,s){s&&e===void 0||Oi(Ys(n,"value"),e,t)},Oi=function(n,e,t){const s=t instanceof A?new rp(t,n):t;if(e===void 0)throw new Error(n+"contains undefined "+Me(s));if(typeof e=="function")throw new Error(n+"contains a function "+Me(s)+" with contents = "+e.toString());if(ya(e))throw new Error(n+"contains "+e.toString()+" "+Me(s));if(typeof e=="string"&&e.length>fs/3&&Hn(e)>fs)throw new Error(n+"contains a string greater than "+fs+" utf8 bytes "+Me(s)+" ('"+e.substring(0,50)+"...')");if(e&&typeof e=="object"){let i=!1,r=!1;if(J(e,(o,l)=>{if(o===".value")i=!0;else if(o!==".priority"&&o!==".sv"&&(r=!0,!vl(o)))throw new Error(n+" contains an invalid key ("+o+") "+Me(s)+`.  Keys must be non-empty strings and can't contain ".", "#", "$", "/", "[", or "]"`);op(s,o),Oi(n,l,s),ap(s)}),i&&r)throw new Error(n+' contains ".value" child '+Me(s)+" in addition to actual children.")}},bl=function(n,e,t,s){if(!yl(t))throw new Error(Ys(n,e)+'was an invalid path = "'+t+`". Paths must be non-empty strings and can't contain ".", "#", "$", "[", or "]"`)},Vm=function(n,e,t,s){t&&(t=t.replace(/^\/*\.info(\/|$)/,"/")),bl(n,e,t)},Di=function(n,e){if(C(e)===".info")throw new Error(n+" failed = Can't modify data under /.info/")},Bm=function(n,e){const t=e.path.toString();if(typeof e.repoInfo.host!="string"||e.repoInfo.host.length===0||!vl(e.repoInfo.namespace)&&e.repoInfo.host.split(":")[0]!=="localhost"||t.length!==0&&!Hm(t))throw new Error(Ys(n,"url")+`must be a valid firebase URL and the path can't contain ".", "#", "$", "[", or "]".`)};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $m{constructor(){this.eventLists_=[],this.recursionDepth_=0}}function ji(n,e){let t=null;for(let s=0;s<e.length;s++){const i=e[s],r=i.getPath();t!==null&&!ui(r,t.path)&&(n.eventLists_.push(t),t=null),t===null&&(t={events:[],path:r}),t.events.push(i)}t&&n.eventLists_.push(t)}function xl(n,e,t){ji(n,t),El(n,s=>ui(s,e))}function ge(n,e,t){ji(n,t),El(n,s=>Z(s,e)||Z(e,s))}function El(n,e){n.recursionDepth_++;let t=!0;for(let s=0;s<n.eventLists_.length;s++){const i=n.eventLists_[s];if(i){const r=i.path;e(r)?(qm(n.eventLists_[s]),n.eventLists_[s]=null):t=!1}}t&&(n.eventLists_=[]),n.recursionDepth_--}function qm(n){for(let e=0;e<n.events.length;e++){const t=n.events[e];if(t!==null){n.events[e]=null;const s=t.getEventRunner();It&&$("event: "+t.toString()),mt(s)}}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const zm="repo_interrupt",Gm=25;class Km{constructor(e,t,s,i){this.repoInfo_=e,this.forceRestClient_=t,this.authTokenProvider_=s,this.appCheckProvider_=i,this.dataUpdateCount=0,this.statsListener_=null,this.eventQueue_=new $m,this.nextWriteId_=1,this.interceptServerDataCallback_=null,this.onDisconnect_=Cn(),this.transactionQueueTree_=new Ai,this.persistentConnection_=null,this.key=this.repoInfo_.toURLString()}toString(){return(this.repoInfo_.secure?"https://":"http://")+this.repoInfo_.host}}function Ym(n,e,t){if(n.stats_=di(n.repoInfo_),n.forceRestClient_||Rf())n.server_=new In(n.repoInfo_,(s,i,r,o)=>{to(n,s,i,r,o)},n.authTokenProvider_,n.appCheckProvider_),setTimeout(()=>no(n,!0),0);else{if(typeof t<"u"&&t!==null){if(typeof t!="object")throw new Error("Only objects are supported for option databaseAuthVariableOverride");try{H(t)}catch(s){throw new Error("Invalid authOverride provided: "+s)}}n.persistentConnection_=new ue(n.repoInfo_,e,(s,i,r,o)=>{to(n,s,i,r,o)},s=>{no(n,s)},s=>{Qm(n,s)},n.authTokenProvider_,n.appCheckProvider_,t),n.server_=n.persistentConnection_}n.authTokenProvider_.addTokenChangeListener(s=>{n.server_.refreshAuthToken(s)}),n.appCheckProvider_.addTokenChangeListener(s=>{n.server_.refreshAppCheckToken(s.token)}),n.statsReporter_=jf(n.repoInfo_,()=>new Op(n.stats_,n.server_)),n.infoData_=new Tp,n.infoSyncTree_=new Xr({startListening:(s,i,r,o)=>{let l=[];const c=n.infoData_.getNode(s._path);return c.isEmpty()||(l=Yn(n.infoSyncTree_,s._path,c),setTimeout(()=>{o("ok")},0)),l},stopListening:()=>{}}),Li(n,"connected",!1),n.serverSyncTree_=new Xr({startListening:(s,i,r,o)=>(n.server_.listen(s,r,i,(l,c)=>{const d=o(l,c);ge(n.eventQueue_,s._path,d)}),[]),stopListening:(s,i)=>{n.server_.unlisten(s,i)}})}function Il(n){const t=n.infoData_.getNode(new A(".info/serverTimeOffset")).val()||0;return new Date().getTime()+t}function Mi(n){return Pm({timestamp:Il(n)})}function to(n,e,t,s,i){n.dataUpdateCount++;const r=new A(e);t=n.interceptServerDataCallback_?n.interceptServerDataCallback_(e,t):t;let o=[];if(i)if(s){const c=fn(t,d=>V(d));o=km(n.serverSyncTree_,r,c,i)}else{const c=V(t);o=Nm(n.serverSyncTree_,r,c,i)}else if(s){const c=fn(t,d=>V(d));o=Em(n.serverSyncTree_,r,c)}else{const c=V(t);o=Yn(n.serverSyncTree_,r,c)}let l=r;o.length>0&&(l=Xn(n,r)),ge(n.eventQueue_,l,o)}function no(n,e){Li(n,"connected",e),e===!1&&Xm(n)}function Qm(n,e){J(e,(t,s)=>{Li(n,t,s)})}function Li(n,e,t){const s=new A("/.info/"+e),i=V(t);n.infoData_.updateSnapshot(s,i);const r=Yn(n.infoSyncTree_,s,i);ge(n.eventQueue_,s,r)}function Cl(n){return n.nextWriteId_++}function Jm(n,e,t,s,i){Fi(n,"set",{path:e.toString(),value:t,priority:s});const r=Mi(n),o=V(t,s),l=Ii(n.serverSyncTree_,e),c=pl(o,l,r),d=Cl(n),u=dl(n.serverSyncTree_,e,c,d,!0);ji(n.eventQueue_,u),n.server_.put(e.toString(),o.val(!0),(f,g)=>{const _=f==="ok";_||Q("set at "+e+" failed: "+f);const p=Ue(n.serverSyncTree_,d,!_);ge(n.eventQueue_,e,p),ng(n,i,f,g)});const h=Rl(n,e);Xn(n,h),ge(n.eventQueue_,h,[])}function Xm(n){Fi(n,"onDisconnectEvents");const e=Mi(n),t=Cn();Ps(n.onDisconnect_,S(),(i,r)=>{const o=jm(i,r,n.serverSyncTree_,e);Qa(t,i,o)});let s=[];Ps(t,S(),(i,r)=>{s=s.concat(Yn(n.serverSyncTree_,i,r));const o=Rl(n,i);Xn(n,o)}),n.onDisconnect_=Cn(),ge(n.eventQueue_,S(),s)}function Zm(n,e,t){let s;C(e._path)===".info"?s=Zr(n.infoSyncTree_,e,t):s=Zr(n.serverSyncTree_,e,t),xl(n.eventQueue_,e._path,s)}function eg(n,e,t){let s;C(e._path)===".info"?s=Fs(n.infoSyncTree_,e,t):s=Fs(n.serverSyncTree_,e,t),xl(n.eventQueue_,e._path,s)}function tg(n){n.persistentConnection_&&n.persistentConnection_.interrupt(zm)}function Fi(n,...e){let t="";n.persistentConnection_&&(t=n.persistentConnection_.id+":"),$(t,...e)}function ng(n,e,t,s){e&&mt(()=>{if(t==="ok")e(null);else{const i=(t||"error").toUpperCase();let r=i;s&&(r+=": "+s);const o=new Error(r);o.code=i,e(o)}})}function Nl(n,e,t){return Ii(n.serverSyncTree_,e,t)||w.EMPTY_NODE}function Ui(n,e=n.transactionQueueTree_){if(e||Zn(n,e),gt(e)){const t=Tl(n,e);m(t.length>0,"Sending zero length transaction queue"),t.every(i=>i.status===0)&&sg(n,Qt(e),t)}else gl(e)&&Jn(e,t=>{Ui(n,t)})}function sg(n,e,t){const s=t.map(d=>d.currentWriteId),i=Nl(n,e,s);let r=i;const o=i.hash();for(let d=0;d<t.length;d++){const u=t[d];m(u.status===0,"tryToSendTransactionQueue_: items in queue should all be run."),u.status=1,u.retryCount++;const h=K(e,u.path);r=r.updateChild(h,u.currentOutputSnapshotRaw)}const l=r.val(!0),c=e;n.server_.put(c.toString(),l,d=>{Fi(n,"transaction put response",{path:c.toString(),status:d});let u=[];if(d==="ok"){const h=[];for(let f=0;f<t.length;f++)t[f].status=2,u=u.concat(Ue(n.serverSyncTree_,t[f].currentWriteId)),t[f].onComplete&&h.push(()=>t[f].onComplete(null,!0,t[f].currentOutputSnapshotResolved)),t[f].unwatcher();Zn(n,Pi(n.transactionQueueTree_,e)),Ui(n,n.transactionQueueTree_),ge(n.eventQueue_,e,u);for(let f=0;f<h.length;f++)mt(h[f])}else{if(d==="datastale")for(let h=0;h<t.length;h++)t[h].status===3?t[h].status=4:t[h].status=0;else{Q("transaction at "+c.toString()+" failed: "+d);for(let h=0;h<t.length;h++)t[h].status=4,t[h].abortReason=d}Xn(n,e)}},o)}function Xn(n,e){const t=kl(n,e),s=Qt(t),i=Tl(n,t);return ig(n,i,s),s}function ig(n,e,t){if(e.length===0)return;const s=[];let i=[];const o=e.filter(l=>l.status===0).map(l=>l.currentWriteId);for(let l=0;l<e.length;l++){const c=e[l],d=K(t,c.path);let u=!1,h;if(m(d!==null,"rerunTransactionsUnderNode_: relativePath should not be null."),c.status===4)u=!0,h=c.abortReason,i=i.concat(Ue(n.serverSyncTree_,c.currentWriteId,!0));else if(c.status===0)if(c.retryCount>=Gm)u=!0,h="maxretry",i=i.concat(Ue(n.serverSyncTree_,c.currentWriteId,!0));else{const f=Nl(n,c.path,o);c.currentInputSnapshot=f;const g=e[l].update(f.val());if(g!==void 0){Oi("transaction failed: Data returned ",g,c.path);let _=V(g);typeof g=="object"&&g!=null&&_e(g,".priority")||(_=_.updatePriority(f.getPriority()));const v=c.currentWriteId,I=Mi(n),b=pl(_,f,I);c.currentOutputSnapshotRaw=_,c.currentOutputSnapshotResolved=b,c.currentWriteId=Cl(n),o.splice(o.indexOf(v),1),i=i.concat(dl(n.serverSyncTree_,c.path,b,c.currentWriteId,c.applyLocally)),i=i.concat(Ue(n.serverSyncTree_,v,!0))}else u=!0,h="nodata",i=i.concat(Ue(n.serverSyncTree_,c.currentWriteId,!0))}ge(n.eventQueue_,t,i),i=[],u&&(e[l].status=2,function(f){setTimeout(f,Math.floor(0))}(e[l].unwatcher),e[l].onComplete&&(h==="nodata"?s.push(()=>e[l].onComplete(null,!1,e[l].currentInputSnapshot)):s.push(()=>e[l].onComplete(new Error(h),!1,null))))}Zn(n,n.transactionQueueTree_);for(let l=0;l<s.length;l++)mt(s[l]);Ui(n,n.transactionQueueTree_)}function kl(n,e){let t,s=n.transactionQueueTree_;for(t=C(e);t!==null&&gt(s)===void 0;)s=Pi(s,t),e=O(e),t=C(e);return s}function Tl(n,e){const t=[];return Sl(n,e,t),t.sort((s,i)=>s.order-i.order),t}function Sl(n,e,t){const s=gt(e);if(s)for(let i=0;i<s.length;i++)t.push(s[i]);Jn(e,i=>{Sl(n,i,t)})}function Zn(n,e){const t=gt(e);if(t){let s=0;for(let i=0;i<t.length;i++)t[i].status!==2&&(t[s]=t[i],s++);t.length=s,ml(e,t.length>0?t:void 0)}Jn(e,s=>{Zn(n,s)})}function Rl(n,e){const t=Qt(kl(n,e)),s=Pi(n.transactionQueueTree_,e);return Lm(s,i=>{ps(n,i)}),ps(n,s),_l(s,i=>{ps(n,i)}),t}function ps(n,e){const t=gt(e);if(t){const s=[];let i=[],r=-1;for(let o=0;o<t.length;o++)t[o].status===3||(t[o].status===1?(m(r===o-1,"All SENT items should be at beginning of queue."),r=o,t[o].status=3,t[o].abortReason="set"):(m(t[o].status===0,"Unexpected transaction status in abort"),t[o].unwatcher(),i=i.concat(Ue(n.serverSyncTree_,t[o].currentWriteId,!0)),t[o].onComplete&&s.push(t[o].onComplete.bind(null,new Error("set"),!1,null))));r===-1?ml(e,void 0):t.length=r+1,ge(n.eventQueue_,Qt(e),i);for(let o=0;o<s.length;o++)mt(s[o])}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function rg(n){let e="";const t=n.split("/");for(let s=0;s<t.length;s++)if(t[s].length>0){let i=t[s];try{i=decodeURIComponent(i.replace(/\+/g," "))}catch{}e+="/"+i}return e}function og(n){const e={};n.charAt(0)==="?"&&(n=n.substring(1));for(const t of n.split("&")){if(t.length===0)continue;const s=t.split("=");s.length===2?e[decodeURIComponent(s[0])]=decodeURIComponent(s[1]):Q(`Invalid query segment '${t}' in query '${n}'`)}return e}const so=function(n,e){const t=ag(n),s=t.namespace;t.domain==="firebase.com"&&me(t.host+" is no longer supported. Please use <YOUR FIREBASE>.firebaseio.com instead"),(!s||s==="undefined")&&t.domain!=="localhost"&&me("Cannot parse Firebase url. Please use https://<YOUR FIREBASE>.firebaseio.com"),t.secure||bf();const i=t.scheme==="ws"||t.scheme==="wss";return{repoInfo:new Aa(t.host,t.secure,s,i,e,"",s!==t.subdomain),path:new A(t.pathString)}},ag=function(n){let e="",t="",s="",i="",r="",o=!0,l="https",c=443;if(typeof n=="string"){let d=n.indexOf("//");d>=0&&(l=n.substring(0,d-1),n=n.substring(d+2));let u=n.indexOf("/");u===-1&&(u=n.length);let h=n.indexOf("?");h===-1&&(h=n.length),e=n.substring(0,Math.min(u,h)),u<h&&(i=rg(n.substring(u,h)));const f=og(n.substring(Math.min(n.length,h)));d=e.indexOf(":"),d>=0?(o=l==="https"||l==="wss",c=parseInt(e.substring(d+1),10)):d=e.length;const g=e.slice(0,d);if(g.toLowerCase()==="localhost")t="localhost";else if(g.split(".").length<=2)t=g;else{const _=e.indexOf(".");s=e.substring(0,_).toLowerCase(),t=e.substring(_+1),r=s}"ns"in f&&(r=f.ns)}return{host:e,port:c,domain:t,subdomain:s,secure:o,scheme:l,pathString:i,namespace:r}};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const io="-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz",lg=function(){let n=0;const e=[];return function(t){const s=t===n;n=t;let i;const r=new Array(8);for(i=7;i>=0;i--)r[i]=io.charAt(t%64),t=Math.floor(t/64);m(t===0,"Cannot push at time == 0");let o=r.join("");if(s){for(i=11;i>=0&&e[i]===63;i--)e[i]=0;e[i]++}else for(i=0;i<12;i++)e[i]=Math.floor(Math.random()*64);for(i=0;i<12;i++)o+=io.charAt(e[i]);return m(o.length===20,"nextPushId: Length should be 20."),o}}();/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class cg{constructor(e,t,s,i){this.eventType=e,this.eventRegistration=t,this.snapshot=s,this.prevName=i}getPath(){const e=this.snapshot.ref;return this.eventType==="value"?e._path:e.parent._path}getEventType(){return this.eventType}getEventRunner(){return this.eventRegistration.getEventRunner(this)}toString(){return this.getPath().toString()+":"+this.eventType+":"+H(this.snapshot.exportVal())}}class dg{constructor(e,t,s){this.eventRegistration=e,this.error=t,this.path=s}getPath(){return this.path}getEventType(){return"cancel"}getEventRunner(){return this.eventRegistration.getEventRunner(this)}toString(){return this.path.toString()+":cancel"}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hg{constructor(e,t){this.snapshotCallback=e,this.cancelCallback=t}onValue(e,t){this.snapshotCallback.call(null,e,t)}onCancel(e){return m(this.hasCancelCallback,"Raising a cancel event on a listener with no cancel callback"),this.cancelCallback.call(null,e)}get hasCancelCallback(){return!!this.cancelCallback}matches(e){return this.snapshotCallback===e.snapshotCallback||this.snapshotCallback.userCallback!==void 0&&this.snapshotCallback.userCallback===e.snapshotCallback.userCallback&&this.snapshotCallback.context===e.snapshotCallback.context}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Wi{constructor(e,t,s,i){this._repo=e,this._path=t,this._queryParams=s,this._orderByCalled=i}get key(){return k(this._path)?null:Wa(this._path)}get ref(){return new Oe(this._repo,this._path)}get _queryIdentifier(){const e=Hr(this._queryParams),t=li(e);return t==="{}"?"default":t}get _queryObject(){return Hr(this._queryParams)}isEqual(e){if(e=G(e),!(e instanceof Wi))return!1;const t=this._repo===e._repo,s=ui(this._path,e._path),i=this._queryIdentifier===e._queryIdentifier;return t&&s&&i}toJSON(){return this.toString()}toString(){return this._repo.toString()+ip(this._path)}}class Oe extends Wi{constructor(e,t){super(e,t,new gi,!1)}get parent(){const e=Va(this._path);return e===null?null:new Oe(this._repo,e)}get root(){let e=this;for(;e.parent!==null;)e=e.parent;return e}}class On{constructor(e,t,s){this._node=e,this.ref=t,this._index=s}get priority(){return this._node.getPriority().val()}get key(){return this.ref.key}get size(){return this._node.numChildren()}child(e){const t=new A(e),s=Wt(this.ref,e);return new On(this._node.getChild(t),s,j)}exists(){return!this._node.isEmpty()}exportVal(){return this._node.val(!0)}forEach(e){return this._node.isLeafNode()?!1:!!this._node.forEachChild(this._index,(s,i)=>e(new On(i,Wt(this.ref,s),j)))}hasChild(e){const t=new A(e);return!this._node.getChild(t).isEmpty()}hasChildren(){return this._node.isLeafNode()?!1:!this._node.isEmpty()}toJSON(){return this.exportVal()}val(){return this._node.val()}}function nn(n,e){return n=G(n),n._checkNotDeleted("ref"),e!==void 0?Wt(n._root,e):n._root}function Wt(n,e){return n=G(n),C(n._path)===null?Vm("child","path",e):bl("child","path",e),new Oe(n._repo,L(n._path,e))}function ug(n,e){n=G(n),Di("push",n._path),wl("push",e,n._path,!0);const t=Il(n._repo),s=lg(t),i=Wt(n,s),r=Wt(n,s);let o;return o=Promise.resolve(r),i.then=o.then.bind(o),i.catch=o.then.bind(o,void 0),i}function fg(n){return Di("remove",n._path),pg(n,null)}function pg(n,e){n=G(n),Di("set",n._path),wl("set",e,n._path,!1);const t=new Wn;return Jm(n._repo,n._path,e,null,t.wrapCallback(()=>{})),t.promise}class Hi{constructor(e){this.callbackContext=e}respondsTo(e){return e==="value"}createEvent(e,t){const s=t._queryParams.getIndex();return new cg("value",this,new On(e.snapshotNode,new Oe(t._repo,t._path),s))}getEventRunner(e){return e.getEventType()==="cancel"?()=>this.callbackContext.onCancel(e.error):()=>this.callbackContext.onValue(e.snapshot,null)}createCancelEvent(e,t){return this.callbackContext.hasCancelCallback?new dg(this,e,t):null}matches(e){return e instanceof Hi?!e.callbackContext||!this.callbackContext?!0:e.callbackContext.matches(this.callbackContext):!1}hasAnyCallback(){return this.callbackContext!==null}}function mg(n,e,t,s,i){const r=new hg(t,void 0),o=new Hi(r);return Zm(n._repo,n,o),()=>eg(n._repo,n,o)}function gg(n,e,t,s){return mg(n,"value",e)}pm(Oe);wm(Oe);/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const _g="FIREBASE_DATABASE_EMULATOR_HOST",Ws={};let vg=!1;function yg(n,e,t,s){n.repoInfo_=new Aa(`${e}:${t}`,!1,n.repoInfo_.namespace,n.repoInfo_.webSocketOnly,n.repoInfo_.nodeAdmin,n.repoInfo_.persistenceKey,n.repoInfo_.includeNamespaceInQueryParams,!0),s&&(n.authTokenProvider_=s)}function wg(n,e,t,s,i){let r=s||n.options.databaseURL;r===void 0&&(n.options.projectId||me("Can't determine Firebase Database URL. Be sure to include  a Project ID when calling firebase.initializeApp()."),$("Using default host for project ",n.options.projectId),r=`${n.options.projectId}-default-rtdb.firebaseio.com`);let o=so(r,i),l=o.repoInfo,c;typeof process<"u"&&Er&&(c=Er[_g]),c?(r=`http://${c}?ns=${l.namespace}`,o=so(r,i),l=o.repoInfo):o.repoInfo.secure;const d=new Pf(n.name,n.options,e);Bm("Invalid Firebase Database URL",o),k(o.path)||me("Database URL must point to the root of a Firebase Database (not including a child path).");const u=xg(l,n,d,new Af(n.name,t));return new Eg(u,n)}function bg(n,e){const t=Ws[e];(!t||t[n.key]!==n)&&me(`Database ${e}(${n.repoInfo_}) has already been deleted.`),tg(n),delete t[n.key]}function xg(n,e,t,s){let i=Ws[e.name];i||(i={},Ws[e.name]=i);let r=i[n.toURLString()];return r&&me("Database initialized multiple times. Please make sure the format of the database URL matches with each database() call."),r=new Km(n,vg,t,s),i[n.toURLString()]=r,r}class Eg{constructor(e,t){this._repoInternal=e,this.app=t,this.type="database",this._instanceStarted=!1}get _repo(){return this._instanceStarted||(Ym(this._repoInternal,this.app.options.appId,this.app.options.databaseAuthVariableOverride),this._instanceStarted=!0),this._repoInternal}get _root(){return this._rootInternal||(this._rootInternal=new Oe(this._repo,S())),this._rootInternal}_delete(){return this._rootInternal!==null&&(bg(this._repo,this.app.name),this._repoInternal=null,this._rootInternal=null),Promise.resolve()}_checkNotDeleted(e){this._rootInternal===null&&me("Cannot call "+e+" on a deleted database.")}}function Ig(n=Do(),e){const t=Xs(n,"database").getImmediate({identifier:e});if(!t._instanceStarted){const s=Rc("database");s&&Cg(t,...s)}return t}function Cg(n,e,t,s={}){n=G(n),n._checkNotDeleted("useEmulator"),n._instanceStarted&&me("Cannot call useEmulator() after instance has already been initialized.");const i=n._repoInternal;let r;if(i.repoInfo_.nodeAdmin)s.mockUserToken&&me('mockUserToken is not supported by the Admin SDK. For client access with mock users, please use the "firebase" package instead of "firebase-admin".'),r=new dn(dn.OWNER);else if(s.mockUserToken){const o=typeof s.mockUserToken=="string"?s.mockUserToken:Ac(s.mockUserToken,n.app.options.projectId);r=new dn(o)}yg(i,e,t,r)}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ng(n){mf(ht),it(new We("database",(e,{instanceIdentifier:t})=>{const s=e.getProvider("app").getImmediate(),i=e.getProvider("auth-internal"),r=e.getProvider("app-check-internal");return wg(s,i,r,t)},"PUBLIC").setMultipleInstances(!0)),Ne(Ir,Cr,n),Ne(Ir,Cr,"esm2017")}ue.prototype.simpleListen=function(n,e){this.sendRequest("q",{p:n},e)};ue.prototype.echo=function(n,e){this.sendRequest("echo",{d:n},e)};Ng();const kg={apiKey:"AIzaSyBKls4H_tQiAkcNmfYhpJLg9mr7mKWcx_s",authDomain:"atfr-dashboard.firebaseapp.com",databaseURL:"https://atfr-dashboard-default-rtdb.europe-west1.firebasedatabase.app",projectId:"atfr-dashboard",storageBucket:"atfr-dashboard.firebasestorage.app",messagingSenderId:"325266859490",appId:"1:325266859490:web:3256b0e4f9eb30a88a85bb"},Al=Oo(kg),ms=ff(Al),sn=Ig(Al),Jt=Dn(n=>({isAuthenticated:!1,user:null,loading:!0,error:null,login:async(e,t)=>{try{n({loading:!0,error:null});const s=await Jh(ms,e,t);n({isAuthenticated:!0,user:s.user,loading:!1})}catch(s){throw n({error:s instanceof Error?s.message:"Erreur de connexion",loading:!1}),s}},logout:async()=>{try{await tu(ms),n({isAuthenticated:!1,user:null,error:null})}catch(e){throw n({error:e instanceof Error?e.message:"Erreur de déconnexion"}),e}},initialize:()=>{const e=eu(ms,t=>{n({isAuthenticated:!!t,user:t,loading:!1})});return()=>e()}})),ro=[{href:"/",label:"Accueil"},{href:"/#about",label:"À Propos"},{href:"/#achievements",label:"Exploits"},{href:"/#activities",label:"Notre Activité"},{href:"/#join",label:"Nous Rejoindre"}];function Tg(){const[n,e]=x.useState(!1),t=Fl(),s=Jt(o=>o.isAuthenticated),i=()=>{e(!1)},r=t.pathname==="/";return a.jsxs("nav",{className:"fixed w-full z-50 bg-wot-darker/95 backdrop-blur-sm border-b border-wot-gold/10",children:[a.jsx("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",children:a.jsxs("div",{className:"flex items-center justify-between h-16",children:[a.jsxs("div",{className:"flex items-center",children:[a.jsx("div",{className:"flex-shrink-0",children:a.jsx("img",{src:"https://eu.wargaming.net/clans/media/clans/emblems/cl_501/500191501/emblem_195x195.png",alt:"ATFR Logo",className:"h-10 w-10"})}),a.jsx("div",{className:"hidden md:block",children:a.jsx("div",{className:"ml-10 flex items-baseline space-x-6",children:r?ro.map(o=>a.jsx("a",{href:o.href,className:`text-wot-light hover:text-wot-gold px-3 py-2 text-sm 
                               uppercase tracking-wider font-medium
                               border-b-2 border-transparent hover:border-wot-gold/50 
                               transition-all duration-300`,onClick:i,children:o.label},o.href)):a.jsx(De,{to:"/",className:`text-wot-light hover:text-wot-gold px-3 py-2 text-sm 
                             uppercase tracking-wider font-medium
                             border-b-2 border-transparent hover:border-wot-gold/50 
                             transition-all duration-300`,children:"Retour au site"})})})]}),a.jsx("div",{className:"hidden md:flex items-center",children:s?a.jsxs(De,{to:"/dashboard",className:`flex items-center text-wot-light hover:text-wot-gold 
                         px-3 py-2 text-sm uppercase tracking-wider font-medium
                         border-2 border-wot-gold/30 hover:border-wot-gold/50 
                         transition-all duration-300 rounded-lg`,children:[a.jsx(Ee,{className:"h-4 w-4 mr-2",strokeWidth:1.5}),"Dashboard"]}):a.jsxs(De,{to:"/login",className:`flex items-center text-wot-light hover:text-wot-gold 
                         px-3 py-2 text-sm uppercase tracking-wider font-medium
                         border-2 border-wot-gold/30 hover:border-wot-gold/50 
                         transition-all duration-300 rounded-lg`,children:[a.jsx(Ee,{className:"h-4 w-4 mr-2",strokeWidth:1.5}),"Admin"]})}),a.jsx("div",{className:"md:hidden",children:a.jsx("button",{onClick:()=>e(!n),className:`inline-flex items-center justify-center p-2 text-wot-light 
                       hover:text-wot-gold hover:bg-wot-gray/50 
                       transition-colors duration-300 focus:outline-none`,children:n?a.jsx(Un,{className:"h-6 w-6",strokeWidth:1.5}):a.jsx(yo,{className:"h-6 w-6",strokeWidth:1.5})})})]})}),n&&a.jsx("div",{className:"md:hidden bg-wot-darker border-t border-wot-gold/10",children:a.jsxs("div",{className:"px-2 pt-2 pb-3 space-y-1",children:[r?ro.map(o=>a.jsx("a",{href:o.href,className:`text-wot-light hover:text-wot-gold block px-3 py-2 
                           text-base uppercase tracking-wider font-medium
                           hover:bg-wot-gray/50 transition-all duration-300`,onClick:i,children:o.label},o.href)):a.jsx(De,{to:"/",className:`text-wot-light hover:text-wot-gold block px-3 py-2 
                         text-base uppercase tracking-wider font-medium
                         hover:bg-wot-gray/50 transition-all duration-300`,onClick:i,children:"Retour au site"}),s?a.jsxs(De,{to:"/dashboard",className:`flex items-center text-wot-light hover:text-wot-gold 
                         px-3 py-2 text-base uppercase tracking-wider font-medium
                         hover:bg-wot-gray/50 transition-all duration-300`,onClick:i,children:[a.jsx(Ee,{className:"h-5 w-5 mr-2",strokeWidth:1.5}),"Dashboard"]}):a.jsxs(De,{to:"/login",className:`flex items-center text-wot-light hover:text-wot-gold 
                         px-3 py-2 text-base uppercase tracking-wider font-medium
                         hover:bg-wot-gray/50 transition-all duration-300`,onClick:i,children:[a.jsx(Ee,{className:"h-5 w-5 mr-2",strokeWidth:1.5}),"Admin"]})]})})]})}function Xt(){const[n,e]=x.useState(!1),t=x.useRef(null);return x.useEffect(()=>{const s=new IntersectionObserver(([i])=>{e(i.isIntersecting)},{root:null,rootMargin:"0px",threshold:.1});return t.current&&s.observe(t.current),()=>{t.current&&s.unobserve(t.current)}},[]),[t,n]}const Sg=[{icon:Le,title:"Objectifs",description:"Notre mission est de développer la communauté ATFR pour en faire le clan français le plus attractif et performant. Nous visons l'excellence à travers une progression constante et un esprit d'équipe inégalé."},{icon:Fn,title:"Communauté",description:"Plus de 70 joueurs passionnés forment notre famille, unis par le même amour du jeu et le désir de progresser ensemble. Notre force réside dans notre cohésion et notre entraide mutuelle."},{icon:Ln,title:"Excellence",description:"Notre programme de formation continue permet à chaque membre de s'améliorer. Des sessions d'entraînement régulières et un partage constant des connaissances assurent notre progression collective."},{icon:nc,title:"Compétition",description:"Nous participons activement aux plus grands événements compétitifs de World of Tanks. Chaque tournoi est une opportunité de démontrer notre valeur et de repousser nos limites."},{icon:$s,title:"Stratégie",description:"Notre équipe développe et adapte constamment ses tactiques pour rester compétitive. La maîtrise du méta-game et l'innovation stratégique sont au cœur de notre approche."},{icon:Ee,title:"Valeurs",description:"Le respect, l'engagement et l'esprit d'équipe sont nos fondements. Ces valeurs guident chacune de nos actions et font la force de notre communauté depuis 2021."}];function Rg(){const[n,e]=Xt();return a.jsx("section",{className:"py-20 px-4 bg-wot-gradient",id:"about",children:a.jsxs("div",{className:"max-w-6xl mx-auto",children:[a.jsxs("div",{className:"text-center mb-16",children:[a.jsx("h2",{className:"section-title",children:"Notre Clan"}),a.jsx("p",{className:"section-subtitle",children:"Fondé en 2021, ATFR s'est rapidement imposé comme l'un des clans les plus actifs et respectés de la scène World of Tanks française. Notre engagement envers l'excellence et notre esprit communautaire nous distinguent."})]}),a.jsx("div",{ref:n,className:"grid md:grid-cols-2 lg:grid-cols-3 gap-8",children:Sg.map((t,s)=>a.jsxs("div",{className:`card p-8 rounded-lg transform transition-all duration-1000
                ${e?"opacity-100 translate-y-0":"opacity-0 translate-y-10"}`,style:{transitionDelay:`${s*100}ms`},children:[a.jsx(t.icon,{className:"h-10 w-10 text-wot-gold mb-6",strokeWidth:1.5}),a.jsx("h3",{className:"text-xl font-bold mb-4 text-wot-goldLight",children:t.title}),a.jsx("p",{className:"text-wot-light/80 leading-relaxed",children:t.description})]},s))})]})})}const Ag=[{icon:Le,image:"https://eu-wotp.wgcdn.co/dcont/fb/image/strongholds_maneuvers_event_1920x900.jpg",title:"Manoeuvres",description:"En cours... - Novembre 2024",stats:["Position FR : ?","Batailles : ?","Chars gagnés : ?"]},{icon:Le,image:"https://eu-wotp.wgcdn.co/dcont/fb/image/strongholds_maneuvers_event_1920x900.jpg",title:"Manoeuvres",description:"Top 14 FR - Mars 2024",stats:["Position FR : 14","Batailles : +1000","Chars gagnés : 6"]},{icon:Le,image:"https://eu-wotp.wgcdn.co/dcont/fb/image/strongholds_maneuvers_event_1920x900.jpg",title:"Manoeuvres",description:"Top 9 FR - Août 2023",stats:["Position FR : 9","Batailles : +750","Chars gagnés : 12"]},{icon:Le,image:"https://eu-wotp.wgcdn.co/dcont/fb/image/global_map_winter_event_1920h900.jpg",title:"Dieu de la guerre",description:"Top 12 FR - Février 2023",stats:["Position FR : 12","Batailles : +420","Chars gagnés : 21"]}];function Pg(){const[n,e]=Xt();return a.jsx("section",{className:"py-20 bg-wot-gradient",id:"achievements",children:a.jsxs("div",{className:"max-w-6xl mx-auto px-4",children:[a.jsxs("div",{className:"text-center mb-16",children:[a.jsx("h2",{className:"section-title",children:"Nos Derniers Exploits"}),a.jsx("p",{className:"section-subtitle",children:"Des années d'excellence et de victoires qui ont forgé notre réputation"})]}),a.jsx("div",{ref:n,className:"grid md:grid-cols-2 gap-8",children:Ag.map((t,s)=>a.jsxs("div",{className:`card overflow-hidden transition-all duration-1000 transform
                ${e?"opacity-100 translate-x-0":s%2===0?"opacity-0 -translate-x-20":"opacity-0 translate-x-20"}`,style:{transitionDelay:`${s*200}ms`},children:[a.jsxs("div",{className:"relative h-48",children:[a.jsx("img",{src:t.image,alt:t.title,className:"w-full h-full object-cover"}),a.jsx("div",{className:"absolute inset-0 bg-gradient-to-t from-wot-dark via-wot-dark/50 to-transparent"}),a.jsx(t.icon,{className:"absolute bottom-4 right-4 h-10 w-10 text-wot-gold",strokeWidth:1.5})]}),a.jsxs("div",{className:"p-6",children:[a.jsx("h3",{className:"text-xl font-bold mb-2 text-wot-goldLight",children:t.title}),a.jsx("p",{className:"text-wot-light/80 mb-4",children:t.description}),a.jsx("div",{className:"grid grid-cols-3 gap-4",children:t.stats.map((i,r)=>a.jsx("div",{className:"bg-wot-darker p-2 rounded text-center text-sm border border-wot-gold/10 text-wot-light/90",children:i},r))})]})]},s))})]})})}const Og={BASE_URL:"/",DEV:!1,MODE:"production",PROD:!0,SSR:!1,VITE_API_URL:"https://votre-serveur.com/atfr-api",VITE_FIREBASE_API_KEY:"AIzaSyBKls4H_tQiAkcNmfYhpJLg9mr7mKWcx_s",VITE_FIREBASE_APP_ID:"1:325266859490:web:3256b0e4f9eb30a88a85bb",VITE_FIREBASE_AUTH_DOMAIN:"atfr-dashboard.firebaseapp.com",VITE_FIREBASE_DATABASE_URL:"https://atfr-dashboard-default-rtdb.europe-west1.firebasedatabase.app",VITE_FIREBASE_MESSAGING_SENDER_ID:"325266859490",VITE_FIREBASE_PROJECT_ID:"atfr-dashboard",VITE_FIREBASE_STORAGE_BUCKET:"atfr-dashboard.firebasestorage.app"};function Dg(n,e){let t;try{t=n()}catch{return}return{getItem:i=>{var r;const o=c=>c===null?null:JSON.parse(c,void 0),l=(r=t.getItem(i))!=null?r:null;return l instanceof Promise?l.then(o):o(l)},setItem:(i,r)=>t.setItem(i,JSON.stringify(r,void 0)),removeItem:i=>t.removeItem(i)}}const Ht=n=>e=>{try{const t=n(e);return t instanceof Promise?t:{then(s){return Ht(s)(t)},catch(s){return this}}}catch(t){return{then(s){return this},catch(s){return Ht(s)(t)}}}},jg=(n,e)=>(t,s,i)=>{let r={getStorage:()=>localStorage,serialize:JSON.stringify,deserialize:JSON.parse,partialize:v=>v,version:0,merge:(v,I)=>({...I,...v}),...e},o=!1;const l=new Set,c=new Set;let d;try{d=r.getStorage()}catch{}if(!d)return n((...v)=>{console.warn(`[zustand persist middleware] Unable to update item '${r.name}', the given storage is currently unavailable.`),t(...v)},s,i);const u=Ht(r.serialize),h=()=>{const v=r.partialize({...s()});let I;const b=u({state:v,version:r.version}).then(P=>d.setItem(r.name,P)).catch(P=>{I=P});if(I)throw I;return b},f=i.setState;i.setState=(v,I)=>{f(v,I),h()};const g=n((...v)=>{t(...v),h()},s,i);let _;const p=()=>{var v;if(!d)return;o=!1,l.forEach(b=>b(s()));const I=((v=r.onRehydrateStorage)==null?void 0:v.call(r,s()))||void 0;return Ht(d.getItem.bind(d))(r.name).then(b=>{if(b)return r.deserialize(b)}).then(b=>{if(b)if(typeof b.version=="number"&&b.version!==r.version){if(r.migrate)return r.migrate(b.state,b.version);console.error("State loaded from storage couldn't be migrated since no migrate function was provided")}else return b.state}).then(b=>{var P;return _=r.merge(b,(P=s())!=null?P:g),t(_,!0),h()}).then(()=>{I==null||I(_,void 0),o=!0,c.forEach(b=>b(_))}).catch(b=>{I==null||I(void 0,b)})};return i.persist={setOptions:v=>{r={...r,...v},v.getStorage&&(d=v.getStorage())},clearStorage:()=>{d==null||d.removeItem(r.name)},getOptions:()=>r,rehydrate:()=>p(),hasHydrated:()=>o,onHydrate:v=>(l.add(v),()=>{l.delete(v)}),onFinishHydration:v=>(c.add(v),()=>{c.delete(v)})},p(),_||g},Mg=(n,e)=>(t,s,i)=>{let r={storage:Dg(()=>localStorage),partialize:p=>p,version:0,merge:(p,v)=>({...v,...p}),...e},o=!1;const l=new Set,c=new Set;let d=r.storage;if(!d)return n((...p)=>{console.warn(`[zustand persist middleware] Unable to update item '${r.name}', the given storage is currently unavailable.`),t(...p)},s,i);const u=()=>{const p=r.partialize({...s()});return d.setItem(r.name,{state:p,version:r.version})},h=i.setState;i.setState=(p,v)=>{h(p,v),u()};const f=n((...p)=>{t(...p),u()},s,i);i.getInitialState=()=>f;let g;const _=()=>{var p,v;if(!d)return;o=!1,l.forEach(b=>{var P;return b((P=s())!=null?P:f)});const I=((v=r.onRehydrateStorage)==null?void 0:v.call(r,(p=s())!=null?p:f))||void 0;return Ht(d.getItem.bind(d))(r.name).then(b=>{if(b)if(typeof b.version=="number"&&b.version!==r.version){if(r.migrate)return[!0,r.migrate(b.state,b.version)];console.error("State loaded from storage couldn't be migrated since no migrate function was provided")}else return[!1,b.state];return[!1,void 0]}).then(b=>{var P;const[M,T]=b;if(g=r.merge(T,(P=s())!=null?P:f),t(g,!0),M)return u()}).then(()=>{I==null||I(g,void 0),g=s(),o=!0,c.forEach(b=>b(g))}).catch(b=>{I==null||I(void 0,b)})};return i.persist={setOptions:p=>{r={...r,...p},p.storage&&(d=p.storage)},clearStorage:()=>{d==null||d.removeItem(r.name)},getOptions:()=>r,rehydrate:()=>_(),hasHydrated:()=>o,onHydrate:p=>(l.add(p),()=>{l.delete(p)}),onFinishHydration:p=>(c.add(p),()=>{c.delete(p)})},r.skipHydration||_(),g||f},Lg=(n,e)=>"getStorage"in e||"serialize"in e||"deserialize"in e?((Og?"production":void 0)!=="production"&&console.warn("[DEPRECATED] `getStorage`, `serialize` and `deserialize` options are deprecated. Use `storage` option instead."),jg(n,e)):Mg(n,e),Pl=Lg,Vi=Dn()(Pl(n=>({events:[],addEvent:e=>n(t=>({events:[...t.events,{...e,id:crypto.randomUUID()}]})),deleteEvent:e=>n(t=>({events:t.events.filter(s=>s.id!==e)})),updateEvent:(e,t)=>n(s=>({events:s.events.map(i=>i.id===e?{...i,...t}:i)}))}),{name:"events-storage"})),oo=[{icon:$s,title:"Clan Wars",schedule:"Campagnes Globales",description:"Participez aux batailles stratégiques pour le contrôle de la carte globale",frequency:"Événements saisonniers"},{icon:Ln,title:"Incursions",schedule:"Tier X",description:"Affrontez d'autres clans en 15v15 dans des batailles tactiques intenses",frequency:"Sessions quotidiennes"},{icon:rc,title:"Bastion",schedule:"Tiers VIII & X",description:"Mode compétitif 7v7 avec stratégies avancées et coordination d'équipe",frequency:"Plusieurs fois par semaine"}];function Fg(){const[n,e]=Xt(),{events:t}=Vi(),s=t.filter(i=>i.isPublic);return a.jsxs("section",{className:"py-20 bg-wot-darker relative overflow-hidden",id:"activities",children:[a.jsx("div",{className:"absolute inset-0 opacity-5",children:a.jsx("div",{className:"absolute inset-0 grid grid-cols-6 gap-px",children:[...Array(42)].map((i,r)=>a.jsx("div",{className:"border border-wot-gold/10"},r))})}),a.jsxs("div",{className:"max-w-6xl mx-auto px-4 relative",children:[a.jsxs("div",{className:"text-center mb-16",children:[a.jsx("h2",{className:"section-title",children:"Notre Activité"}),a.jsx("p",{className:"section-subtitle",children:"Un programme varié d'activités pour tous les styles de jeu et tous les niveaux"})]}),a.jsxs("div",{ref:n,className:"grid md:grid-cols-2 lg:grid-cols-3 gap-6",children:[oo.map((i,r)=>a.jsxs("div",{className:`card group p-6 relative overflow-hidden
                transform transition-all duration-700
                ${e?"opacity-100 translate-y-0":"opacity-0 translate-y-20"}`,style:{transitionDelay:`${r*100}ms`},children:[a.jsx("div",{className:`absolute top-0 right-0 w-24 h-24 bg-wot-gold/5 rounded-bl-full 
                            transform group-hover:scale-150 transition-transform duration-500`}),a.jsxs("div",{className:"flex items-start gap-4",children:[a.jsx(i.icon,{className:"h-8 w-8 text-wot-gold shrink-0",strokeWidth:1.5}),a.jsxs("div",{children:[a.jsx("h3",{className:"text-xl font-bold text-wot-goldLight mb-1",children:i.title}),a.jsxs("p",{className:"text-sm text-wot-gold/80 mb-3 flex items-center gap-2",children:[a.jsx(St,{className:"h-4 w-4",strokeWidth:1.5}),i.schedule]}),a.jsx("p",{className:"text-wot-light/80 mb-3",children:i.description}),a.jsxs("p",{className:"text-sm text-wot-light/60 flex items-center gap-2",children:[a.jsx(wo,{className:"h-4 w-4",strokeWidth:1.5}),i.frequency]})]})]})]},r)),s.map((i,r)=>a.jsxs("div",{className:`card group p-6 relative overflow-hidden
                transform transition-all duration-700
                ${e?"opacity-100 translate-y-0":"opacity-0 translate-y-20"}`,style:{transitionDelay:`${(r+oo.length)*100}ms`},children:[a.jsx("div",{className:`absolute top-0 right-0 w-24 h-24 bg-wot-gold/5 rounded-bl-full 
                            transform group-hover:scale-150 transition-transform duration-500`}),a.jsxs("div",{className:"flex items-start gap-4",children:[a.jsx(ic,{className:"h-8 w-8 text-wot-gold shrink-0",strokeWidth:1.5}),a.jsxs("div",{children:[a.jsx("h3",{className:"text-xl font-bold text-wot-goldLight mb-1",children:i.title}),a.jsxs("p",{className:"text-sm text-wot-gold/80 mb-3 flex items-center gap-2",children:[a.jsx(St,{className:"h-4 w-4",strokeWidth:1.5}),i.date," à ",i.time]}),a.jsx("p",{className:"text-wot-light/80 mb-3",children:i.description}),a.jsx("p",{className:"text-sm text-wot-light/60",children:a.jsx("span",{className:"px-2 py-1 text-xs rounded-full bg-wot-gold/20 text-wot-gold",children:i.type})})]})]})]},i.id))]})]})]})}function Ug(){const[n,e]=Xt(),{events:t}=Vi(),s=t.filter(i=>i.isPublic).sort((i,r)=>new Date(i.date).getTime()-new Date(r.date).getTime());return s.length===0?null:a.jsx("section",{className:"py-20 bg-wot-darker",id:"planned-events",children:a.jsxs("div",{className:"max-w-6xl mx-auto px-4",children:[a.jsxs("div",{className:"text-center mb-16",children:[a.jsx("h2",{className:"section-title",children:"Événements Planifiés"}),a.jsx("p",{className:"section-subtitle",children:"Découvrez nos prochains événements et rejoignez-nous pour des moments inoubliables"})]}),a.jsx("div",{ref:n,className:"grid gap-8 md:grid-cols-2 lg:grid-cols-3",children:s.map((i,r)=>a.jsx("div",{className:`transform transition-all duration-700
                ${e?"opacity-100 translate-y-0":"opacity-0 translate-y-20"}`,style:{transitionDelay:`${r*100}ms`},children:a.jsxs("div",{className:"relative group h-full",children:[a.jsx("div",{className:"absolute inset-0 bg-cover bg-center rounded-lg",style:{backgroundImage:`url(${i.backgroundImage||"https://images.unsplash.com/photo-1624687943971-e86af76d57de?q=80&w=2070"})`}}),a.jsx("div",{className:`absolute inset-0 bg-gradient-to-t from-wot-darker via-wot-darker/90 to-wot-darker/70 
                              group-hover:from-wot-darker/95 group-hover:via-wot-darker/85 group-hover:to-wot-darker/75
                              transition-all duration-300 rounded-lg`}),a.jsxs("div",{className:"relative p-6 h-full flex flex-col",children:[a.jsxs("div",{className:"flex-1",children:[a.jsx("span",{className:`inline-block px-3 py-1 text-sm rounded-full bg-wot-gold/20 
                                   text-wot-gold mb-4`,children:i.type}),a.jsx("h3",{className:"text-xl font-bold text-wot-goldLight mb-3",children:i.title}),a.jsx("p",{className:"text-wot-light/80 mb-6",children:i.description})]}),a.jsxs("div",{className:"space-y-2",children:[a.jsxs("div",{className:"flex items-center text-wot-light/60",children:[a.jsx(St,{className:"h-4 w-4 mr-2",strokeWidth:1.5}),i.date]}),a.jsxs("div",{className:"flex items-center text-wot-light/60",children:[a.jsx(go,{className:"h-4 w-4 mr-2",strokeWidth:1.5}),i.time]}),a.jsxs("div",{className:"flex items-center text-wot-light/60",children:[a.jsx(vo,{className:"h-4 w-4 mr-2",strokeWidth:1.5}),"Discord ATFR"]})]})]})]})},i.id))})]})})}const Wg="https://discord.com/api/webhooks/1303716498749264053/pss6pxCyqr7clvQsqAkQXVKXPQcpmi3SlA45kAQkALlSgauL44qVH37u4AQ2WFsrxzEq",Ol=Dn((n,e)=>({applications:[],initialized:!1,initialize:()=>{if(e().initialized)return;const t=nn(sn,"applications");gg(t,s=>{const i=s.val(),r=i?Object.entries(i).map(([o,l])=>({id:o,...l})):[];n({applications:r.sort((o,l)=>l.timestamp-o.timestamp),initialized:!0})})},addApplication:async t=>{try{const s=nn(sn,"applications"),i=ug(s),r={...t,timestamp:Date.now(),status:"pending"};await n(i,r);try{await fetch(Wg,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({embeds:[{title:`📝 Nouvelle candidature ${t.targetClan}`,color:16036387,fields:[{name:"Joueur",value:t.playerName,inline:!0},{name:"WN8",value:t.wn8,inline:!0},{name:"Winrate",value:t.winRate,inline:!0},{name:"Discord",value:t.discordTag,inline:!0},{name:"Chars Tier X",value:t.tier10Count,inline:!0},{name:"Batailles",value:t.battles,inline:!0},{name:"Clan actuel",value:t.previousClans,inline:!0},{name:"Disponibilités",value:t.availability},{name:"Motivation",value:t.motivation}],timestamp:new Date().toISOString(),url:`https://tomato.gg/stats/EU/${encodeURIComponent(t.playerName)}`}]})})}catch(o){console.error("Erreur lors de l'envoi de la notification Discord:",o)}}catch(s){throw console.error("Erreur lors de l'ajout de la candidature:",s),new Error("Erreur lors de l'ajout de la candidature")}},updateStatus:async(t,s)=>{try{const i=nn(sn,`applications/${t}`),r=await e(i);r.exists()&&await n(i,{...r.val(),status:s})}catch(i){throw console.error("Erreur lors de la mise à jour du statut:",i),new Error("Erreur lors de la mise à jour du statut")}},deleteApplication:async t=>{try{const s=nn(sn,`applications/${t}`);await fg(s)}catch(s){throw console.error("Erreur lors de la suppression de la candidature:",s),new Error("Erreur lors de la suppression de la candidature")}}})),Hg="6de9de98abd254ebc17dfa65ed9b17b6";async function Vg(n){var s;const e=await fetch(`https://api.worldoftanks.eu/wot/account/list/?application_id=${Hg}&search=${encodeURIComponent(n)}`);if(!e.ok)throw new Error("Erreur de connexion à l'API WoT");const t=await e.json();if(t.error)throw new Error(t.error.message);if(!((s=t.data)!=null&&s.length))throw new Error("Joueur non trouvé");return{account_id:t.data[0].account_id,nickname:t.data[0].nickname}}function Bg({message:n,type:e,onClose:t}){const s={error:"bg-red-900/30 text-red-400 border-red-500/30",warning:"bg-yellow-900/30 text-yellow-400 border-yellow-500/30",info:"bg-blue-900/30 text-blue-400 border-blue-500/30"};return a.jsxs("div",{className:`p-4 rounded-lg flex items-center gap-3 border ${s[e]}`,children:[a.jsx(Hs,{className:"h-5 w-5 shrink-0",strokeWidth:1.5}),a.jsx("p",{className:"flex-1",children:n}),a.jsx("button",{onClick:t,className:"text-current hover:opacity-80",children:a.jsx(Un,{className:"h-5 w-5",strokeWidth:1.5})})]})}const $g=["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"],qg=["Matin (8h-12h)","Après-midi (12h-18h)","Soir (18h-22h)","Nuit (22h-00h)"];function zg({onChange:n,disabled:e}){const[t,s]=x.useState([]),[i,r]=x.useState([]);x.useEffect(()=>{const c=[...t,...i].join(", ");n(c)},[t,i,n]);const o=c=>{s(d=>d.includes(c)?d.filter(u=>u!==c):[...d,c])},l=c=>{r(d=>d.includes(c)?d.filter(u=>u!==c):[...d,c])};return a.jsxs("div",{className:"space-y-4",children:[a.jsx("label",{className:"block text-sm font-medium text-wot-light/80",children:"Disponibilités *"}),a.jsxs("div",{className:"space-y-4",children:[a.jsxs("div",{className:"space-y-2",children:[a.jsx("p",{className:"text-sm text-wot-light/60",children:"Jours disponibles:"}),a.jsx("div",{className:"flex flex-wrap gap-2",children:$g.map(c=>a.jsx("button",{type:"button",onClick:()=>o(c),disabled:e,className:`px-3 py-1 rounded-full text-sm transition-colors
                  ${t.includes(c)?"bg-wot-gold text-wot-dark":"bg-wot-dark text-wot-light/60 hover:text-wot-light"}`,children:c},c))})]}),a.jsxs("div",{className:"space-y-2",children:[a.jsx("p",{className:"text-sm text-wot-light/60",children:"Horaires disponibles:"}),a.jsx("div",{className:"flex flex-wrap gap-2",children:qg.map(c=>a.jsx("button",{type:"button",onClick:()=>l(c),disabled:e,className:`px-3 py-1 rounded-full text-sm transition-colors
                  ${i.includes(c)?"bg-wot-gold text-wot-dark":"bg-wot-dark text-wot-light/60 hover:text-wot-light"}`,children:c},c))})]})]})]})}function Gg({playerName:n,onPlayerNameChange:e,onVerify:t,isVerified:s,isSearching:i,disabled:r}){return a.jsxs("div",{children:[a.jsx("label",{className:"block text-sm font-medium text-wot-light/80 mb-2",children:"Pseudo en jeu *"}),a.jsxs("div",{className:"flex gap-2",children:[a.jsx("input",{type:"text",value:n,onChange:o=>e(o.target.value),className:`flex-1 px-3 py-2 bg-wot-dark border border-wot-gold/20 rounded-lg
                   text-wot-light placeholder-wot-light/50 focus:outline-none focus:border-wot-gold`,disabled:s||r,placeholder:"Entrez votre pseudo exact"}),a.jsxs("button",{type:"button",onClick:t,disabled:i||s||r,className:"btn-secondary flex items-center gap-2 min-w-[100px] justify-center",children:[i?a.jsx(ys,{className:"h-5 w-5 animate-spin",strokeWidth:1.5}):s?a.jsx(Vs,{className:"h-5 w-5 text-green-400",strokeWidth:1.5}):a.jsx(Mn,{className:"h-5 w-5",strokeWidth:1.5}),s?"Vérifié":"Vérifier"]})]})]})}function Kg({clans:n,selectedClan:e,onClanChange:t,disabled:s}){return a.jsxs("div",{children:[a.jsx("label",{className:"block text-sm font-medium text-wot-light/80 mb-2",children:"Clan souhaité *"}),a.jsx("select",{value:e,onChange:i=>t(i.target.value),disabled:s,className:`w-full px-3 py-2 bg-wot-dark border border-wot-gold/20 rounded-lg
                 text-wot-light focus:outline-none focus:border-wot-gold`,children:n.map(i=>a.jsx("option",{value:i.id,children:i.name},i.id))})]})}function Yg({onClose:n}){return a.jsxs("div",{className:"text-center",children:[a.jsx("h3",{className:"text-xl font-bold text-wot-goldLight mb-4",children:"Candidature envoyée avec succès !"}),a.jsx("p",{className:"text-wot-light/80 mb-6",children:"Nous examinerons votre candidature dans les plus brefs délais. Vous serez contacté via Discord pour la suite du processus."}),a.jsx("button",{onClick:n,className:"btn-primary",children:"Fermer"})]})}const gs=[{id:"500191501",name:"ATFR"},{id:"500197997",name:"A-T-O"}];function Qg({onClose:n}){const e=Ol(M=>M.addApplication),[t,s]=x.useState(!1),[i,r]=x.useState(!1),[o,l]=x.useState(!1),[c,d]=x.useState(""),[u,h]=x.useState(null),[f,g]=x.useState(gs[0].id),[_,p]=x.useState(""),[v,I]=x.useState(null),b=async()=>{if(!c.trim()){I({message:"Veuillez entrer un pseudo",type:"warning"});return}l(!0),I(null);try{const M=await Vg(c);h(M.account_id)}catch(M){I({message:M instanceof Error?M.message:"Erreur lors de la recherche du joueur",type:"error"}),h(null)}finally{l(!1)}},P=async M=>{var F;if(M.preventDefault(),!u)return;s(!0),I(null);const T=new FormData(M.currentTarget);try{await e({playerName:c,discordTag:T.get("discordTag"),availability:_,motivation:T.get("motivation"),targetClan:((F=gs.find(B=>B.id===f))==null?void 0:F.name)||"ATFR",wn8:"0",winRate:"0",battles:"0",tier10Count:"0",previousClans:"Non vérifié"}),r(!0)}catch{I({message:"Erreur lors de l'envoi de la candidature. Veuillez réessayer.",type:"error"})}finally{s(!1)}};return a.jsx("div",{className:"fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4",children:a.jsxs("div",{className:"bg-wot-darker border border-wot-gold/20 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto",children:[a.jsxs("div",{className:"sticky top-0 bg-wot-darker border-b border-wot-gold/20 p-4 flex justify-between items-center",children:[a.jsx("h2",{className:"text-xl font-bold text-wot-gold",children:"Candidature ATFR"}),a.jsx("button",{onClick:n,className:"text-wot-light/60 hover:text-wot-light",children:a.jsx(Un,{className:"h-6 w-6",strokeWidth:1.5})})]}),a.jsxs("div",{className:"p-6 space-y-6",children:[v&&a.jsx(Bg,{message:v.message,type:v.type,onClose:()=>I(null)}),i?a.jsx(Yg,{onClose:n}):a.jsxs("form",{onSubmit:P,className:"space-y-6",children:[a.jsx(Kg,{clans:gs,selectedClan:f,onClanChange:g,disabled:t}),a.jsx(Gg,{playerName:c,onPlayerNameChange:d,onVerify:b,isVerified:!!u,isSearching:o,disabled:t}),u&&a.jsx("div",{className:"p-4 bg-wot-dark rounded-lg border border-wot-gold/20",children:a.jsx("a",{href:`https://tomato.gg/stats/${encodeURIComponent(c)}-${u}/EU`,target:"_blank",rel:"noopener noreferrer",className:"text-wot-gold hover:text-wot-goldLight transition-colors",children:"Voir mon profil sur Tomato.gg"})}),u&&a.jsxs(a.Fragment,{children:[a.jsxs("div",{children:[a.jsx("label",{className:"block text-sm font-medium text-wot-light/80 mb-2",children:"Pseudo Discord *"}),a.jsx("input",{required:!0,type:"text",name:"discordTag",minLength:2,maxLength:32,className:`w-full px-3 py-2 bg-wot-dark border border-wot-gold/20 rounded-lg
                               text-wot-light placeholder-wot-light/50 focus:outline-none focus:border-wot-gold`,placeholder:"Votre pseudo Discord",disabled:t})]}),a.jsx(zg,{onChange:p,disabled:t}),a.jsxs("div",{children:[a.jsx("label",{className:"block text-sm font-medium text-wot-light/80 mb-2",children:"Informations complémentaires *"}),a.jsx("textarea",{required:!0,name:"motivation",rows:4,className:`w-full px-3 py-2 bg-wot-dark border border-wot-gold/20 rounded-lg
                               text-wot-light placeholder-wot-light/50 focus:outline-none focus:border-wot-gold
                               resize-none`,placeholder:"Parlez-nous de votre expérience, vos objectifs, et pourquoi vous souhaitez rejoindre notre clan...",disabled:t})]}),a.jsx("div",{className:"flex justify-end space-x-4",children:a.jsx("button",{type:"submit",className:"btn-primary",disabled:t||!_,children:t?"Envoi...":"Envoyer ma candidature"})})]})]})]})]})})}const Jg=[{icon:Ee,title:"Équipement",items:["Minimum 20 chars Tier X","Chars méta actuels","Équipements optimisés"]},{icon:Le,title:"Performance",items:["WN8 > 2000","Winrate > 52%","Connaissance méta"]},{icon:Fn,title:"Engagement",items:["Participation active","Communication Discord","Esprit d'équipe"]},{icon:Ln,title:"Disponibilité",items:["Présence régulière","Participation campagnes","Entraînements hebdo"]}];function Xg(){const[n,e]=Xt(),[t,s]=x.useState(!1);return a.jsxs(a.Fragment,{children:[a.jsx("section",{className:"py-20 px-4 bg-gradient-to-b from-gray-900 to-gray-800",id:"join",children:a.jsxs("div",{className:"max-w-6xl mx-auto",children:[a.jsxs("div",{className:"text-center mb-16",children:[a.jsx("h2",{className:"section-title",children:"Rejoignez ATFR"}),a.jsx("p",{className:"section-subtitle",children:"Vous pensez avoir ce qu'il faut pour rejoindre l'élite? Découvrez nos critères de recrutement"})]}),a.jsx("div",{ref:n,className:`grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12 transition-all duration-1000 transform
              ${e?"opacity-100 scale-100":"opacity-0 scale-95"}`,children:Jg.map((i,r)=>a.jsxs("div",{className:"card p-6 rounded-lg",style:{transitionDelay:`${r*100}ms`},children:[a.jsx(i.icon,{className:"h-8 w-8 text-wot-gold mb-4",strokeWidth:1.5}),a.jsx("h3",{className:"text-xl font-bold mb-4",children:i.title}),a.jsx("ul",{className:"space-y-2",children:i.items.map((o,l)=>a.jsxs("li",{className:"flex items-center text-wot-light",children:[a.jsx(Vs,{className:"h-4 w-4 text-wot-goldLight mr-2",strokeWidth:1.5}),o]},l))})]},r))}),a.jsxs("div",{className:"text-center space-y-6",children:[a.jsxs("button",{onClick:()=>s(!0),className:"btn-primary clip-diagonal inline-flex items-center",children:["Postuler Maintenant",a.jsx(mo,{className:"ml-2 h-5 w-5",strokeWidth:1.5})]}),a.jsxs("p",{className:"text-wot-light/80",children:["Ou"," ",a.jsx("a",{href:"https://discord.gg/wxhUYVaKYr",target:"_blank",rel:"noopener noreferrer",className:"text-wot-gold hover:text-wot-goldLight transition-colors",children:"rejoignez notre Discord"})," ","pour plus d'informations"]})]})]})}),t&&a.jsx(Qg,{onClose:()=>s(!1)})]})}const Zg=[{icon:Bs,href:"https://discord.gg/wxhUYVaKYr",label:"Discord"},{icon:yc,href:"https://www.youtube.com/@ATFR/featured",label:"YouTube"},{icon:cc,href:"#",label:"GitHub"}];function e_(){return a.jsx("footer",{className:"bg-wot-darker py-12 px-4 border-t border-wot-gold/10",children:a.jsxs("div",{className:"max-w-6xl mx-auto",children:[a.jsxs("div",{className:"flex flex-col items-center mb-8",children:[a.jsx("img",{src:"https://eu.wargaming.net/clans/media/clans/emblems/cl_501/500191501/emblem_195x195.png",alt:"ATFR Logo",className:"h-12 w-12 mb-4"}),a.jsx("h3",{className:"text-2xl font-bold mb-2 text-wot-gold",children:"- ATFR -"}),a.jsx("p",{className:"text-wot-light/80",children:"Des valeurs partagées depuis 2021"})]}),a.jsx("div",{className:"flex justify-center space-x-6 mb-8",children:Zg.map((n,e)=>a.jsx("a",{href:n.href,target:"_blank",rel:"noopener noreferrer",className:"text-wot-light hover:text-wot-gold transition-colors","aria-label":n.label,children:a.jsx(n.icon,{className:"h-6 w-6",strokeWidth:1.5})},e))}),a.jsxs("div",{className:"text-center text-wot-light/60 text-sm",children:[a.jsxs("p",{children:["© ",new Date().getFullYear()," ATFR. Tous droits réservés."]}),a.jsx("p",{className:"mt-2",children:"World of Tanks est une marque déposée de Wargaming.net"})]})]})})}const t_=Array.from({length:30},(n,e)=>({date:`${String(e+1).padStart(2,"0")}/03`,count:Math.floor(Math.random()*50)+20})),rn={members_count:72,battles_avg:35,efficiency:8750,global_rating:9200},n_=[{id:1,name:"Membres",value:rn.members_count,icon:Fn},{id:2,name:"Batailles/Jour",value:Math.round(rn.battles_avg),icon:Le},{id:3,name:"Efficacité",value:Math.round(rn.efficiency).toLocaleString(),icon:Ln},{id:4,name:"Rating Global",value:Math.round(rn.global_rating).toLocaleString(),icon:$s}];function ao(){return a.jsxs("div",{className:"space-y-6",children:[a.jsx("div",{className:"flex justify-between items-center",children:a.jsx("h1",{className:"text-2xl font-bold text-wot-gold",children:"Dashboard"})}),a.jsx("div",{className:"grid gap-6 md:grid-cols-2 lg:grid-cols-4",children:n_.map(n=>a.jsxs("div",{className:"card p-6",children:[a.jsx("div",{className:"flex items-center justify-between",children:a.jsx(n.icon,{className:"h-8 w-8 text-wot-gold",strokeWidth:1.5})}),a.jsxs("div",{className:"mt-4",children:[a.jsx("h3",{className:"text-lg font-medium text-wot-light/80",children:n.name}),a.jsx("p",{className:"text-2xl font-bold text-wot-goldLight",children:n.value})]})]},n.id))}),a.jsxs("div",{className:"card p-6",children:[a.jsx("h3",{className:"text-lg font-medium text-wot-goldLight mb-6",children:"Activité du Clan (30 jours)"}),a.jsx("div",{className:"h-[300px]",children:a.jsx(Hl,{width:"100%",height:"100%",children:a.jsxs(Vl,{data:t_,children:[a.jsx(Bl,{strokeDasharray:"3 3",stroke:"#2D2D2D"}),a.jsx($l,{dataKey:"date",stroke:"#999999",tick:{fill:"#999999"}}),a.jsx(ql,{stroke:"#999999",tick:{fill:"#999999"}}),a.jsx(zl,{contentStyle:{backgroundColor:"#1E1E1E",border:"1px solid rgba(244, 178, 35, 0.2)",borderRadius:"8px"}}),a.jsx(Gl,{type:"monotone",dataKey:"count",stroke:"#F4B223",name:"Batailles",strokeWidth:2,dot:!1})]})})})]})]})}function s_({member:n,stats:e,onEditDiscord:t}){const s=l=>new Date(l*1e3).toLocaleDateString("fr-FR",{year:"numeric",month:"long",day:"numeric"}),i=l=>{const d=Date.now()/1e3-l,u=Math.floor(d/60),h=Math.floor(u/60),f=Math.floor(h/24);return u<1?"À l'instant":u<60?`Il y a ${u} min`:h<24?`Il y a ${h}h`:f===1?"Hier":f<7?`Il y a ${f} jours`:s(l)},r=l=>{const d=Date.now()/1e3-l,u=Math.floor(d/(24*60*60));return u<=2?"text-green-400":u<=7?"text-yellow-400":u<=14?"text-orange-400":"text-red-400"},o=l=>Date.now()/1e3-l<900;return a.jsx("div",{className:"card p-4",children:a.jsxs("div",{className:"flex flex-col md:flex-row md:items-center gap-4",children:[a.jsxs("div",{className:"flex items-center space-x-4 flex-1",children:[a.jsxs("div",{className:"relative",children:[a.jsx("div",{className:"h-12 w-12 rounded-full bg-wot-darker flex items-center justify-center",children:a.jsx(Ee,{className:"h-6 w-6 text-wot-gold",strokeWidth:1.5})}),e&&a.jsx("div",{className:`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-wot-darker
                  ${o(e.lastBattleTime)?"bg-green-500":"bg-gray-500"}`,title:o(e.lastBattleTime)?"En ligne":"Hors ligne"})]}),a.jsxs("div",{children:[a.jsxs("h3",{className:"text-lg font-medium text-wot-goldLight flex items-center gap-2",children:[n.account_name,a.jsx("a",{href:`https://tomato.gg/stats/EU/${n.account_name}=${n.account_id}`,target:"_blank",rel:"noopener noreferrer",className:"text-wot-light/60 hover:text-wot-gold transition-colors",children:a.jsx(_o,{className:"h-4 w-4",strokeWidth:1.5})})]}),a.jsxs("div",{className:"flex items-center gap-4 text-sm text-wot-light/60",children:[a.jsxs("span",{className:"flex items-center",children:[a.jsx(Ee,{className:"h-4 w-4 mr-1",strokeWidth:1.5}),n.role_i18n]}),a.jsxs("span",{className:"flex items-center",children:[a.jsx(wo,{className:"h-4 w-4 mr-1",strokeWidth:1.5}),"Depuis le ",s(n.joined_at)]})]})]})]}),a.jsx("div",{className:"flex-1",children:e?a.jsxs("div",{className:"text-center p-3 bg-wot-darker rounded-lg",children:[a.jsx("div",{className:`text-lg font-bold ${r(e.lastBattleTime)}`,children:i(e.lastBattleTime)}),a.jsx("div",{className:"text-xs text-wot-light/60",children:"Dernière activité"})]}):a.jsxs("div",{className:"flex items-center justify-center p-3 bg-wot-darker rounded-lg text-wot-light/60",children:[a.jsx(Hs,{className:"h-5 w-5 mr-2",strokeWidth:1.5}),"Activité indisponible"]})}),a.jsx("div",{className:"flex items-center gap-2",children:a.jsxs("button",{onClick:()=>t(n.account_id),className:`btn-secondary flex items-center ${n.discord_id?"border-green-500/30 text-green-400":""}`,title:n.discord_id?"Discord lié":"Discord non lié",children:[a.jsx(Bs,{className:"h-5 w-5 mr-2",strokeWidth:1.5}),n.discord_id?"Discord lié":"Lier Discord"]})})]})})}const Dl="6de9de98abd254ebc17dfa65ed9b17b6",_s="500191501",jl="https://api.worldoftanks.eu/wot";async function i_(){try{const e=await(await fetch(`${jl}/clans/info/?application_id=${Dl}&clan_id=${_s}&fields=members`)).json();return e.status==="ok"&&e.data[_s]?{success:!0,data:e.data[_s].members}:{success:!1,error:"Erreur lors de la récupération des membres"}}catch{return{success:!1,error:"Erreur de connexion à l'API WoT"}}}async function r_(n){try{if(!n.length)return{success:!0,data:{}};const t=await(await fetch(`${jl}/account/info/?application_id=${Dl}&account_id=${n.join(",")}&fields=last_battle_time`)).json();if(t.status!=="ok")throw new Error("WoT API Error");const s={};for(const[i,r]of Object.entries(t.data))r&&(s[Number(i)]={lastBattleTime:r.last_battle_time});return{success:!0,data:s}}catch(e){return{success:!1,error:e instanceof Error?e.message:"Erreur lors de la récupération des statistiques"}}}const lo={commander:1,executive_officer:2,personnel_officer:3,combat_officer:4,intelligence_officer:5,quartermaster:6,recruitment_officer:7,junior_officer:8,private:9,recruit:10,reservist:11},o_={commander:"Commandant",executive_officer:"Commandant en second",personnel_officer:"Officier du personnel",combat_officer:"Officier de combat",intelligence_officer:"Officier du renseignement",quartermaster:"Quartier-maître",recruitment_officer:"Recruteur",junior_officer:"Officier subalterne",private:"Soldat",recruit:"Recrue",reservist:"Réserviste"};function a_(){const[n,e]=x.useState([]),[t,s]=x.useState({}),[i,r]=x.useState(""),[o,l]=x.useState(!0),[c,d]=x.useState(""),[u,h]=x.useState(!1),[f,g]=x.useState({key:"role",direction:"asc"}),[_,p]=x.useState("all"),v=async()=>{try{h(!0);const T=await i_();if(T.success){const F=T.data.map(q=>({...q,role_i18n:o_[q.role]||q.role_i18n}));e(F);const B=await r_(T.data.map(q=>q.account_id));B.success&&s(B.data)}else d(T.error)}catch{d("Erreur inattendue lors du chargement des données")}finally{l(!1),h(!1)}};x.useEffect(()=>{v()},[]);const I=T=>{const F=n.find(q=>q.account_id===T);if(!F)return;const B=prompt("Entrez l'ID Discord du joueur:",F.discord_id||"");B!==null&&e(n.map(q=>q.account_id===T?{...q,discord_id:B||void 0}:q))},b=(T,F)=>{const{key:B,direction:q}=f;let oe=0;if(B==="discord_id"){const es=!!T.discord_id,Ml=!!F.discord_id;oe=Number(Ml)-Number(es)}else B==="role"?oe=(lo[T.role]||99)-(lo[F.role]||99):oe=String(T[B]).localeCompare(String(F[B]));return q==="asc"?oe:-oe},P=T=>{g(F=>({key:T,direction:F.key===T&&F.direction==="asc"?"desc":"asc"}))},M=n.filter(T=>T.account_name.toLowerCase().includes(i.toLowerCase())&&(_==="all"||_==="linked"&&T.discord_id||_==="unlinked"&&!T.discord_id)).sort(b);return o?a.jsx("div",{className:"flex items-center justify-center h-64",children:a.jsx(qi,{className:"h-8 w-8 text-wot-gold animate-spin",strokeWidth:1.5})}):a.jsxs("div",{className:"space-y-6",children:[a.jsxs("div",{className:"flex justify-between items-center",children:[a.jsx("h1",{className:"text-2xl font-bold text-wot-gold",children:"Membres du Clan"}),a.jsxs("button",{onClick:v,className:"btn-secondary flex items-center",disabled:u,children:[a.jsx(qi,{className:`h-5 w-5 mr-2 ${u?"animate-spin":""}`,strokeWidth:1.5}),"Actualiser"]})]}),c&&a.jsx("div",{className:"bg-red-900/30 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg",children:c}),a.jsxs("div",{className:"flex flex-col md:flex-row gap-4",children:[a.jsxs("div",{className:"relative flex-1",children:[a.jsx("input",{type:"text",placeholder:"Rechercher un membre...",className:`w-full pl-10 pr-4 py-2 bg-wot-darker border border-wot-gold/20 rounded-lg
                     text-wot-light placeholder-wot-light/50 focus:outline-none focus:border-wot-gold`,value:i,onChange:T=>r(T.target.value)}),a.jsx(Mn,{className:"absolute left-3 top-2.5 h-5 w-5 text-wot-light/50",strokeWidth:1.5})]}),a.jsxs("div",{className:"flex gap-2",children:[a.jsxs("button",{onClick:()=>P("account_name"),className:`btn-secondary flex items-center ${f.key==="account_name"?"text-wot-gold":""}`,children:[a.jsx($i,{className:"h-5 w-5 mr-2",strokeWidth:1.5}),"Nom"]}),a.jsxs("button",{onClick:()=>P("role"),className:`btn-secondary flex items-center ${f.key==="role"?"text-wot-gold":""}`,children:[a.jsx($i,{className:"h-5 w-5 mr-2",strokeWidth:1.5}),"Grade"]}),a.jsxs("button",{onClick:()=>P("discord_id"),className:`btn-secondary flex items-center ${f.key==="discord_id"?"text-wot-gold":""}`,children:[a.jsx(Bs,{className:"h-5 w-5 mr-2",strokeWidth:1.5}),"Discord"]})]}),a.jsxs("select",{value:_,onChange:T=>p(T.target.value),className:`px-3 py-2 bg-wot-darker border border-wot-gold/20 rounded-lg
                   text-wot-light focus:outline-none focus:border-wot-gold`,children:[a.jsx("option",{value:"all",children:"Tous les membres"}),a.jsx("option",{value:"linked",children:"Discord lié"}),a.jsx("option",{value:"unlinked",children:"Discord non lié"})]})]}),a.jsxs("div",{className:"grid gap-4",children:[M.map(T=>a.jsx(s_,{member:T,stats:t[T.account_id],onEditDiscord:I},T.account_id)),M.length===0&&a.jsx("div",{className:"text-center text-wot-light/60 py-8",children:"Aucun membre trouvé"})]})]})}const l_=Dn()(Pl(n=>({clanActivities:[],playerInfos:{},addActivity:e=>n(t=>({clanActivities:[e,...t.clanActivities]})),clearActivities:()=>n({clanActivities:[]}),updatePlayerInfo:(e,t)=>n(s=>({playerInfos:{...s.playerInfos,[e]:{...s.playerInfos[e],...t}}})),addPlayerStats:(e,t)=>n(s=>{var i;return{playerInfos:{...s.playerInfos,[e]:{...s.playerInfos[e],stats:[...((i=s.playerInfos[e])==null?void 0:i.stats)||[],t].slice(-30)}}}})}),{name:"members-storage"}));function c_(){const[n,e]=x.useState(""),{clanActivities:t,clearActivities:s}=l_(),i=t.filter(o=>o.account_name.toLowerCase().includes(n.toLowerCase())),r=o=>new Date(o*1e3).toLocaleString("fr-FR",{year:"numeric",month:"numeric",day:"numeric",hour:"2-digit",minute:"2-digit"});return a.jsxs("div",{className:"space-y-6",children:[a.jsxs("div",{className:"flex justify-between items-center",children:[a.jsx("h1",{className:"text-2xl font-bold text-wot-gold",children:"Journal d'Activité du Clan"}),a.jsxs("button",{onClick:s,className:"btn-secondary flex items-center text-red-500 hover:text-red-400 border-red-500/30",children:[a.jsx(qs,{className:"h-5 w-5 mr-2",strokeWidth:1.5}),"Vider l'historique"]})]}),a.jsxs("div",{className:"relative",children:[a.jsx("input",{type:"text",placeholder:"Rechercher un membre...",className:`w-full pl-10 pr-4 py-2 bg-wot-darker border border-wot-gold/20 rounded-lg
                   text-wot-light placeholder-wot-light/50 focus:outline-none focus:border-wot-gold`,value:n,onChange:o=>e(o.target.value)}),a.jsx(Mn,{className:"absolute left-3 top-2.5 h-5 w-5 text-wot-light/50",strokeWidth:1.5})]}),a.jsxs("div",{className:"space-y-4",children:[i.map((o,l)=>a.jsxs("div",{className:"card p-4 flex items-center space-x-4",children:[o.type==="join"?a.jsx("div",{className:"h-10 w-10 rounded-full bg-green-900/30 flex items-center justify-center",children:a.jsx(_c,{className:"h-5 w-5 text-green-400",strokeWidth:1.5})}):a.jsx("div",{className:"h-10 w-10 rounded-full bg-red-900/30 flex items-center justify-center",children:a.jsx(gc,{className:"h-5 w-5 text-red-400",strokeWidth:1.5})}),a.jsxs("div",{className:"flex-1",children:[a.jsxs("div",{className:"flex items-center justify-between",children:[a.jsx("h3",{className:"text-lg font-medium text-wot-goldLight",children:o.account_name}),a.jsx("span",{className:"text-sm text-wot-light/60",children:r(o.timestamp)})]}),a.jsxs("p",{className:"text-wot-light/80",children:[o.type==="join"?"A rejoint":"A quitté"," le clan",o.role_i18n&&` en tant que ${o.role_i18n}`,o.reason&&` - Raison: ${o.reason}`]})]})]},`${o.account_id}-${o.timestamp}`)),i.length===0&&a.jsx("div",{className:"text-center text-wot-light/60 py-8",children:"Aucune activité enregistrée"})]})]})}function d_(){const{applications:n,updateStatus:e,deleteApplication:t,initialize:s,initialized:i}=Ol(),[r,o]=x.useState(""),[l,c]=x.useState("all"),[d,u]=x.useState(!1);x.useEffect(()=>{s()},[s]);const h=i?n.filter(p=>{const v=p.playerName.toLowerCase().includes(r.toLowerCase()),I=l==="all"||p.status===l;return v&&I}):[],f=async(p,v)=>{if(window.confirm(`Êtes-vous sûr de vouloir ${v==="accepted"?"accepter":"refuser"} cette candidature ?`)){u(!0);try{await e(p,v)}catch{alert("Erreur lors de la mise à jour du statut")}finally{u(!1)}}},g=async p=>{if(window.confirm("Êtes-vous sûr de vouloir supprimer cette candidature ?")){u(!0);try{await t(p)}catch{alert("Erreur lors de la suppression")}finally{u(!1)}}},_=p=>{switch(p){case"accepted":return"text-green-400";case"rejected":return"text-red-400";default:return"text-yellow-400"}};return i?a.jsxs("div",{className:"space-y-6",children:[a.jsx("h1",{className:"text-2xl font-bold text-wot-gold",children:"Candidatures"}),a.jsxs("div",{className:"flex flex-col md:flex-row gap-4",children:[a.jsxs("div",{className:"relative flex-1",children:[a.jsx("input",{type:"text",placeholder:"Rechercher un candidat...",className:`w-full pl-10 pr-4 py-2 bg-wot-darker border border-wot-gold/20 rounded-lg
                     text-wot-light placeholder-wot-light/50 focus:outline-none focus:border-wot-gold`,value:r,onChange:p=>o(p.target.value)}),a.jsx(Mn,{className:"absolute left-3 top-2.5 h-5 w-5 text-wot-light/50",strokeWidth:1.5})]}),a.jsxs("select",{value:l,onChange:p=>c(p.target.value),className:`px-4 py-2 bg-wot-darker border border-wot-gold/20 rounded-lg
                   text-wot-light focus:outline-none focus:border-wot-gold`,children:[a.jsx("option",{value:"all",children:"Toutes les candidatures"}),a.jsx("option",{value:"pending",children:"En attente"}),a.jsx("option",{value:"accepted",children:"Acceptées"}),a.jsx("option",{value:"rejected",children:"Refusées"})]})]}),d&&a.jsx("div",{className:"fixed inset-0 bg-black/50 flex items-center justify-center z-50",children:a.jsx(ys,{className:"h-8 w-8 text-wot-gold animate-spin",strokeWidth:1.5})}),a.jsxs("div",{className:"space-y-4",children:[h.map(p=>a.jsx("div",{className:"card p-6",children:a.jsxs("div",{className:"flex flex-col md:flex-row gap-6",children:[a.jsxs("div",{className:"flex-1 space-y-4",children:[a.jsxs("div",{className:"flex justify-between items-start",children:[a.jsxs("div",{children:[a.jsxs("h3",{className:"text-xl font-bold text-wot-goldLight flex items-center gap-2",children:[p.playerName,a.jsx("a",{href:`https://tomato.gg/stats/EU/${p.playerName}`,target:"_blank",rel:"noopener noreferrer",className:"text-wot-light/60 hover:text-wot-gold transition-colors",children:a.jsx(_o,{className:"h-4 w-4",strokeWidth:1.5})})]}),a.jsxs("p",{className:"text-sm text-wot-light/60",children:["Candidature reçue le ",new Date(p.timestamp).toLocaleDateString("fr-FR")]})]}),a.jsx("span",{className:`px-3 py-1 rounded-full text-sm ${_(p.status)}`,children:p.status==="pending"?"En attente":p.status==="accepted"?"Acceptée":"Refusée"})]}),a.jsxs("div",{className:"grid grid-cols-2 md:grid-cols-4 gap-4",children:[a.jsxs("div",{className:"bg-wot-darker p-3 rounded",children:[a.jsx("div",{className:"text-sm text-wot-light/60",children:"WN8"}),a.jsx("div",{className:"text-wot-goldLight font-bold",children:p.wn8})]}),a.jsxs("div",{className:"bg-wot-darker p-3 rounded",children:[a.jsx("div",{className:"text-sm text-wot-light/60",children:"Winrate"}),a.jsx("div",{className:"text-wot-goldLight font-bold",children:p.winRate})]}),a.jsxs("div",{className:"bg-wot-darker p-3 rounded",children:[a.jsx("div",{className:"text-sm text-wot-light/60",children:"Batailles"}),a.jsx("div",{className:"text-wot-goldLight font-bold",children:p.battles})]}),a.jsxs("div",{className:"bg-wot-darker p-3 rounded",children:[a.jsx("div",{className:"text-sm text-wot-light/60",children:"Chars Tier X"}),a.jsx("div",{className:"text-wot-goldLight font-bold",children:p.tier10Count})]})]}),a.jsxs("div",{className:"space-y-2",children:[a.jsxs("div",{children:[a.jsx("span",{className:"text-wot-light/60",children:"Discord:"}),a.jsx("span",{className:"ml-2 text-wot-light",children:p.discordTag})]}),a.jsxs("div",{children:[a.jsx("span",{className:"text-wot-light/60",children:"Disponibilités:"}),a.jsx("span",{className:"ml-2 text-wot-light",children:p.availability})]})]}),p.previousClans&&a.jsxs("div",{children:[a.jsx("h4",{className:"text-sm font-medium text-wot-light/60 mb-1",children:"Clans précédents"}),a.jsx("p",{className:"text-wot-light",children:p.previousClans})]}),a.jsxs("div",{children:[a.jsx("h4",{className:"text-sm font-medium text-wot-light/60 mb-1",children:"Motivation"}),a.jsx("p",{className:"text-wot-light",children:p.motivation})]})]}),a.jsxs("div",{className:"flex md:flex-col justify-end gap-2",children:[p.status==="pending"&&a.jsxs(a.Fragment,{children:[a.jsx("button",{onClick:()=>f(p.id,"accepted"),className:`btn-secondary border-green-500/30 text-green-400 
                               hover:border-green-500/50 hover:text-green-300`,disabled:d,children:a.jsx(Vs,{className:"h-5 w-5",strokeWidth:1.5})}),a.jsx("button",{onClick:()=>f(p.id,"rejected"),className:`btn-secondary border-red-500/30 text-red-400
                               hover:border-red-500/50 hover:text-red-300`,disabled:d,children:a.jsx(vc,{className:"h-5 w-5",strokeWidth:1.5})})]}),a.jsx("button",{onClick:()=>g(p.id),className:`btn-secondary border-red-500/30 text-red-400
                           hover:border-red-500/50 hover:text-red-300`,disabled:d,children:a.jsx(qs,{className:"h-5 w-5",strokeWidth:1.5})})]})]})},p.id)),h.length===0&&a.jsx("div",{className:"text-center text-wot-light/60 py-8",children:"Aucune candidature trouvée"})]})]}):a.jsx("div",{className:"flex items-center justify-center h-64",children:a.jsx(ys,{className:"h-8 w-8 text-wot-gold animate-spin",strokeWidth:1.5})})}const vs=["Entraînement","Compétition","Tournoi","Réunion","Événement Spécial"];function h_(){const{events:n,addEvent:e,deleteEvent:t,updateEvent:s}=Vi(),[i,r]=x.useState(!1),[o,l]=x.useState({title:"",date:"",time:"",type:vs[0],description:"",isPublic:!0,backgroundImage:""}),c=h=>{h.preventDefault(),e(o),l({title:"",date:"",time:"",type:vs[0],description:"",isPublic:!0,backgroundImage:""}),r(!1)},d=h=>{window.confirm("Êtes-vous sûr de vouloir supprimer cet événement ?")&&t(h)},u=h=>{s(h.id,{isPublic:!h.isPublic})};return a.jsxs("div",{className:"space-y-6",children:[a.jsxs("div",{className:"flex justify-between items-center",children:[a.jsx("h1",{className:"text-2xl font-bold text-wot-gold",children:"Calendrier des Événements"}),a.jsxs("button",{onClick:()=>r(!i),className:"btn-primary flex items-center",children:[a.jsx(fc,{className:"h-5 w-5 mr-2",strokeWidth:1.5}),"Nouvel Événement"]})]}),i&&a.jsx("div",{className:"card p-6",children:a.jsxs("form",{onSubmit:c,className:"space-y-4",children:[a.jsxs("div",{children:[a.jsx("label",{className:"block text-sm font-medium text-wot-light/80 mb-2",children:"Titre"}),a.jsx("input",{type:"text",required:!0,className:`w-full px-3 py-2 bg-wot-dark border border-wot-gold/20 rounded-lg
                         text-wot-light placeholder-wot-light/50 focus:outline-none focus:border-wot-gold`,value:o.title,onChange:h=>l({...o,title:h.target.value})})]}),a.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-4",children:[a.jsxs("div",{children:[a.jsx("label",{className:"block text-sm font-medium text-wot-light/80 mb-2",children:"Date"}),a.jsx("input",{type:"date",required:!0,className:`w-full px-3 py-2 bg-wot-dark border border-wot-gold/20 rounded-lg
                           text-wot-light placeholder-wot-light/50 focus:outline-none focus:border-wot-gold`,value:o.date,onChange:h=>l({...o,date:h.target.value})})]}),a.jsxs("div",{children:[a.jsx("label",{className:"block text-sm font-medium text-wot-light/80 mb-2",children:"Heure"}),a.jsx("input",{type:"time",required:!0,className:`w-full px-3 py-2 bg-wot-dark border border-wot-gold/20 rounded-lg
                           text-wot-light placeholder-wot-light/50 focus:outline-none focus:border-wot-gold`,value:o.time,onChange:h=>l({...o,time:h.target.value})})]}),a.jsxs("div",{children:[a.jsx("label",{className:"block text-sm font-medium text-wot-light/80 mb-2",children:"Type"}),a.jsx("select",{className:`w-full px-3 py-2 bg-wot-dark border border-wot-gold/20 rounded-lg
                           text-wot-light focus:outline-none focus:border-wot-gold`,value:o.type,onChange:h=>l({...o,type:h.target.value}),children:vs.map(h=>a.jsx("option",{value:h,children:h},h))})]})]}),a.jsxs("div",{children:[a.jsx("label",{className:"block text-sm font-medium text-wot-light/80 mb-2",children:"Description"}),a.jsx("textarea",{required:!0,rows:3,className:`w-full px-3 py-2 bg-wot-dark border border-wot-gold/20 rounded-lg
                         text-wot-light placeholder-wot-light/50 focus:outline-none focus:border-wot-gold
                         resize-none`,value:o.description,onChange:h=>l({...o,description:h.target.value})})]}),a.jsxs("div",{children:[a.jsx("label",{className:"block text-sm font-medium text-wot-light/80 mb-2",children:"Image de fond (URL)"}),a.jsxs("div",{className:"flex gap-4",children:[a.jsx("input",{type:"url",className:`flex-1 px-3 py-2 bg-wot-dark border border-wot-gold/20 rounded-lg
                           text-wot-light placeholder-wot-light/50 focus:outline-none focus:border-wot-gold`,placeholder:"https://example.com/image.jpg",value:o.backgroundImage,onChange:h=>l({...o,backgroundImage:h.target.value})}),o.backgroundImage&&a.jsx("div",{className:"w-12 h-12 rounded overflow-hidden",children:a.jsx("img",{src:o.backgroundImage,alt:"Preview",className:"w-full h-full object-cover",onError:h=>{h.currentTarget.src="https://images.unsplash.com/photo-1624687943971-e86af76d57de?q=80&w=2070"}})})]})]}),a.jsxs("div",{className:"flex items-center space-x-2",children:[a.jsx("input",{type:"checkbox",id:"isPublic",checked:o.isPublic,onChange:h=>l({...o,isPublic:h.target.checked}),className:`rounded border-wot-gold/20 bg-wot-dark text-wot-gold 
                         focus:ring-wot-gold focus:ring-offset-wot-dark`}),a.jsx("label",{htmlFor:"isPublic",className:"text-sm text-wot-light/80",children:"Afficher sur le site public"})]}),a.jsxs("div",{className:"flex justify-end space-x-4",children:[a.jsx("button",{type:"button",onClick:()=>r(!1),className:"btn-secondary",children:"Annuler"}),a.jsx("button",{type:"submit",className:"btn-primary",children:"Créer l'événement"})]})]})}),a.jsx("div",{className:"grid gap-6 md:grid-cols-2 lg:grid-cols-3",children:n.map(h=>a.jsxs("div",{className:"relative group overflow-hidden rounded-lg",children:[a.jsx("div",{className:"absolute inset-0 bg-cover bg-center",style:{backgroundImage:`url(${h.backgroundImage||"https://images.unsplash.com/photo-1624687943971-e86af76d57de?q=80&w=2070"})`}}),a.jsx("div",{className:"absolute inset-0 bg-gradient-to-t from-wot-darker via-wot-darker/90 to-wot-darker/70"}),a.jsxs("div",{className:"relative p-6 space-y-4",children:[a.jsxs("div",{className:"flex justify-between items-start",children:[a.jsx("h3",{className:"text-lg font-semibold text-wot-goldLight",children:h.title}),a.jsxs("div",{className:"flex space-x-2",children:[a.jsx("button",{onClick:()=>u(h),className:"p-1.5 text-wot-light/60 hover:text-wot-gold transition-colors",title:h.isPublic?"Masquer du site public":"Afficher sur le site public",children:h.isPublic?a.jsx(ac,{className:"h-5 w-5",strokeWidth:1.5}):a.jsx(oc,{className:"h-5 w-5",strokeWidth:1.5})}),a.jsx("button",{onClick:()=>d(h.id),className:"p-1.5 text-red-400 hover:text-red-500 transition-colors",children:a.jsx(qs,{className:"h-5 w-5",strokeWidth:1.5})})]})]}),a.jsx("div",{children:a.jsx("span",{className:"px-2 py-1 text-xs rounded-full bg-wot-gold/20 text-wot-gold",children:h.type})}),a.jsx("p",{className:"text-wot-light/80",children:h.description}),a.jsxs("div",{className:"space-y-2",children:[a.jsxs("div",{className:"flex items-center text-wot-light/60",children:[a.jsx(St,{className:"h-4 w-4 mr-2",strokeWidth:1.5}),h.date]}),a.jsxs("div",{className:"flex items-center text-wot-light/60",children:[a.jsx(go,{className:"h-4 w-4 mr-2",strokeWidth:1.5}),h.time]}),a.jsxs("div",{className:"flex items-center text-wot-light/60",children:[a.jsx(vo,{className:"h-4 w-4 mr-2",strokeWidth:1.5}),"Discord ATFR"]})]})]})]},h.id))})]})}function u_(){return a.jsxs("div",{className:"space-y-6",children:[a.jsx("h1",{className:"text-2xl font-bold text-wot-gold",children:"Paramètres du Clan"}),a.jsx("div",{className:"card p-6",children:a.jsxs("form",{className:"space-y-6",children:[a.jsxs("div",{className:"space-y-4",children:[a.jsx("h3",{className:"text-lg font-medium text-wot-goldLight",children:"Informations Générales"}),a.jsxs("div",{children:[a.jsx("label",{className:"block text-sm font-medium text-wot-light/80 mb-2",children:"Description du Clan"}),a.jsx("textarea",{rows:4,className:`w-full px-3 py-2 bg-wot-dark border border-wot-gold/20 rounded-lg
                         text-wot-light placeholder-wot-light/50 focus:outline-none 
                         focus:border-wot-gold resize-none`,placeholder:"Description du clan..."})]}),a.jsxs("div",{children:[a.jsx("label",{className:"block text-sm font-medium text-wot-light/80 mb-2",children:"Discord Invite Link"}),a.jsx("input",{type:"text",className:`w-full px-3 py-2 bg-wot-dark border border-wot-gold/20 rounded-lg
                         text-wot-light placeholder-wot-light/50 focus:outline-none 
                         focus:border-wot-gold`,placeholder:"https://discord.gg/..."})]})]}),a.jsxs("div",{className:"space-y-4",children:[a.jsx("h3",{className:"text-lg font-medium text-wot-goldLight",children:"Critères de Recrutement"}),a.jsxs("div",{className:"grid gap-4 md:grid-cols-2",children:[a.jsxs("div",{children:[a.jsx("label",{className:"block text-sm font-medium text-wot-light/80 mb-2",children:"WN8 Minimum"}),a.jsx("input",{type:"number",className:`w-full px-3 py-2 bg-wot-dark border border-wot-gold/20 rounded-lg
                           text-wot-light placeholder-wot-light/50 focus:outline-none 
                           focus:border-wot-gold`,placeholder:"2000"})]}),a.jsxs("div",{children:[a.jsx("label",{className:"block text-sm font-medium text-wot-light/80 mb-2",children:"Winrate Minimum"}),a.jsx("input",{type:"number",className:`w-full px-3 py-2 bg-wot-dark border border-wot-gold/20 rounded-lg
                           text-wot-light placeholder-wot-light/50 focus:outline-none 
                           focus:border-wot-gold`,placeholder:"52"})]})]})]}),a.jsx("div",{className:"pt-4 border-t border-wot-gold/20",children:a.jsxs("button",{type:"submit",className:"btn-primary flex items-center",children:[a.jsx(pc,{className:"h-5 w-5 mr-2",strokeWidth:1.5}),"Sauvegarder les modifications"]})})]})})]})}const f_=[{name:"Dashboard",href:"/dashboard/statistics",icon:sc},{name:"Membres",href:"/dashboard/members",icon:Fn},{name:"Historique",href:"/dashboard/history",icon:dc},{name:"Candidatures",href:"/dashboard/applications",icon:lc},{name:"Événements",href:"/dashboard/events",icon:St},{name:"Paramètres",href:"/dashboard/settings",icon:mc}];function p_(){const[n,e]=x.useState(!1),t=Jt(r=>r.logout),s=co(),i=()=>{t(),s("/login")};return a.jsxs("div",{className:"min-h-screen bg-wot-dark",children:[a.jsx("div",{className:"lg:hidden",children:a.jsx("button",{className:"fixed top-4 left-4 p-2 text-wot-light z-50",onClick:()=>e(!n),children:n?a.jsx(Un,{className:"h-6 w-6",strokeWidth:1.5}):a.jsx(yo,{className:"h-6 w-6",strokeWidth:1.5})})}),a.jsx("div",{className:`fixed inset-y-0 left-0 z-40 w-64 bg-wot-darker transform 
                   transition-transform duration-300 ease-in-out lg:translate-x-0
                   ${n?"translate-x-0":"-translate-x-full"}`,children:a.jsxs("div",{className:"h-full flex flex-col",children:[a.jsxs("div",{className:"flex items-center justify-center h-16 px-4 bg-wot-dark border-b border-wot-gold/20",children:[a.jsx("img",{src:"https://eu.wargaming.net/clans/media/clans/emblems/cl_501/500191501/emblem_195x195.png",alt:"ATFR Logo",className:"h-10 w-10"}),a.jsx("span",{className:"ml-2 text-xl font-bold text-wot-gold",children:"ATFR Admin"})]}),a.jsx("nav",{className:"flex-1 px-2 py-4 space-y-1",children:f_.map(r=>a.jsxs(De,{to:r.href,className:`flex items-center px-4 py-2 text-wot-light hover:bg-wot-dark
                         hover:text-wot-gold rounded-lg transition-colors duration-200`,onClick:()=>e(!1),children:[a.jsx(r.icon,{className:"h-5 w-5 mr-3",strokeWidth:1.5}),r.name]},r.name))}),a.jsx("div",{className:"p-4 border-t border-wot-gold/20",children:a.jsxs("button",{onClick:i,className:`flex items-center w-full px-4 py-2 text-wot-light
                     hover:text-wot-gold rounded-lg transition-colors duration-200`,children:[a.jsx(uc,{className:"h-5 w-5 mr-3",strokeWidth:1.5}),"Déconnexion"]})})]})}),a.jsx("div",{className:"lg:pl-64",children:a.jsx("main",{className:"p-6",children:a.jsxs(ho,{children:[a.jsx(se,{path:"statistics",element:a.jsx(ao,{})}),a.jsx(se,{path:"members",element:a.jsx(a_,{})}),a.jsx(se,{path:"history",element:a.jsx(c_,{})}),a.jsx(se,{path:"applications",element:a.jsx(d_,{})}),a.jsx(se,{path:"events",element:a.jsx(h_,{})}),a.jsx(se,{path:"settings",element:a.jsx(u_,{})}),a.jsx(se,{path:"*",element:a.jsx(ao,{})})]})})})]})}function m_(){const[n,e]=x.useState(""),[t,s]=x.useState(""),[i,r]=x.useState(""),[o,l]=x.useState(!1),c=Jt(h=>h.login),d=co(),u=async h=>{h.preventDefault(),r(""),l(!0);try{await c(n,t),d("/dashboard")}catch{r("Email ou mot de passe incorrect")}finally{l(!1)}};return a.jsx("div",{className:"min-h-screen bg-wot-dark flex items-center justify-center px-4",children:a.jsxs("div",{className:"max-w-md w-full space-y-8 bg-wot-darker p-8 rounded-lg border border-wot-gold/20",children:[a.jsxs("div",{className:"text-center",children:[a.jsx(hc,{className:"mx-auto h-12 w-12 text-wot-gold",strokeWidth:1.5}),a.jsx("h2",{className:"mt-6 text-3xl font-bold text-wot-gold",children:"Dashboard ATFR"}),a.jsx("p",{className:"mt-2 text-sm text-wot-light/80",children:"Accès réservé aux administrateurs"})]}),a.jsxs("form",{className:"mt-8 space-y-6",onSubmit:u,children:[a.jsxs("div",{className:"space-y-4",children:[a.jsxs("div",{children:[a.jsx("label",{htmlFor:"email",className:"sr-only",children:"Email"}),a.jsx("input",{id:"email",name:"email",type:"email",required:!0,className:`appearance-none rounded relative block w-full px-3 py-2 
                         border border-wot-gold/20 bg-wot-dark text-wot-light
                         placeholder-wot-light/50 focus:outline-none focus:ring-2 
                         focus:ring-wot-gold focus:border-transparent`,placeholder:"Email",value:n,onChange:h=>e(h.target.value),disabled:o})]}),a.jsxs("div",{children:[a.jsx("label",{htmlFor:"password",className:"sr-only",children:"Mot de passe"}),a.jsx("input",{id:"password",name:"password",type:"password",required:!0,className:`appearance-none rounded relative block w-full px-3 py-2 
                         border border-wot-gold/20 bg-wot-dark text-wot-light
                         placeholder-wot-light/50 focus:outline-none focus:ring-2 
                         focus:ring-wot-gold focus:border-transparent`,placeholder:"Mot de passe",value:t,onChange:h=>s(h.target.value),disabled:o})]})]}),i&&a.jsxs("div",{className:"flex items-center gap-2 text-red-400 text-sm",children:[a.jsx(Hs,{className:"h-4 w-4",strokeWidth:1.5}),i]}),a.jsx("button",{type:"submit",className:"btn-primary w-full",disabled:o,children:o?"Connexion...":"Se connecter"})]})]})})}function g_({children:n}){const{isAuthenticated:e,loading:t}=Jt();return t?a.jsx("div",{children:"Chargement..."}):e?a.jsx(a.Fragment,{children:n}):a.jsx(Ul,{to:"/login"})}function __(){return a.jsxs("div",{className:"bg-wot-dark text-wot-light",children:[a.jsx(Tg,{}),a.jsx(bc,{}),a.jsx(Rg,{}),a.jsx(Pg,{}),a.jsx(Fg,{}),a.jsx(Ug,{}),a.jsx(Xg,{}),a.jsx(e_,{})]})}function v_(){const n=Jt(e=>e.initialize);return x.useEffect(()=>{n()},[n]),a.jsxs(ho,{children:[a.jsx(se,{path:"/",element:a.jsx(__,{})}),a.jsx(se,{path:"/login",element:a.jsx(m_,{})}),a.jsx(se,{path:"/dashboard/*",element:a.jsx(g_,{children:a.jsx(p_,{})})})]})}po(document.getElementById("root")).render(a.jsx(x.StrictMode,{children:a.jsx(Wl,{children:a.jsx(v_,{})})}));
//# sourceMappingURL=index-WD1EEwES.js.map
