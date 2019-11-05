/**
 *
 * @authors yutent (yutent@doui.cc)
 * @date    2019-11-05 23:34:04
 * @version v2.0.1
 * 
 */

'use strict'

import"../form/input.js";import Drag from"../drag/core.js";import{nextTick,bind,unbind,clickOutside}from"../utils.js";const LANGUAGES={en:{TITLE:"Dialog",BTNS:["Cancel","OK"]},zh:{TITLE:"提示",BTNS:["取消","确定"]}};LANGUAGES["zh-CN"]=LANGUAGES.zh;const lang=LANGUAGES[window.__ENV_LANG__||navigator.language]||LANGUAGES.en;let uniqueInstance=null,toastInstance=null;const UNIQUE_TYPES=["alert","confirm","prompt"];function renderBtns(t){var e="";return t.forEach((t,s)=>{e+=`<button data-idx="${s}"">${t||lang.BTNS[s]}</button>`}),e}class Layer extends HTMLElement{static get observedAttributes(){return["left","right","top","bottom","from","to","btns","type","title","blur","background","mask","mask-close","mask-color","fixed"]}constructor(){super(),Object.defineProperty(this,"root",{value:this.attachShadow({mode:"open"}),writable:!0,enumerable:!1,configurable:!0}),Object.defineProperty(this,"props",{value:{left:"auto",right:"auto",top:"auto",bottom:"auto",from:Object.create(null),to:Object.create(null),btns:[],type:"",title:"",blur:!1,background:null,mask:!1,"mask-close":!1,"mask-color":null,fixed:!0},writable:!0,enumerable:!1,configurable:!0}),this.root.innerHTML='<style>*{box-sizing:border-box;margin:0;padding:0}::before,::after{box-sizing:border-box}:host{display:none;justify-content:center;align-items:center;position:fixed;z-index:65534;left:0;top:0;width:100%}:host([alert]),:host([confirm]),:host([prompt]),:host([frame]),:host([toast]),:host([notify]),:host([common]){display:flex}.noselect{-webkit-touch-callout:none;-webkit-user-select:none;-moz-user-select:none;user-select:none}.noselect img,.noselect a{-webkit-user-drag:none}.layer{overflow:hidden;flex:0 auto;position:fixed;z-index:65535;border-radius:4px;color:#666;font-size:14px;background:rgba(255,255,255,0.7);box-shadow:0 5px 20px rgba(0,0,0,0.3);transition:opacity 0.2s ease-in-out, left 0.2s ease-in-out, right 0.2s ease-in-out, top 0.2s ease-in-out, bottom 0.2s ease-in-out;opacity:0}.layer.scale{transform:scale(1.01);transition:transform 0.1s linear}.layer.blur{backdrop-filter:blur(5px)}.layer:active{z-index:65536}.layer__title{display:none;justify-content:space-between;align-items:center;width:100%;height:60px;padding:15px;font-size:16px;color:#526273}.layer__title wc-icon{--size: 14px}.layer__title wc-icon:hover{color:#ff5061}.layer__content{display:flex;position:relative;width:100%;height:auto;min-height:50px;word-break:break-all;word-wrap:break-word}::slotted(.layer__content__input){flex:1;height:32px}::slotted(.layer__content__frame){display:flex;width:100%;height:100%;margin:0;padding:0;border:0;resize:none;background:#fff}::slotted(.layer__content__toast){display:flex;align-items:center;width:300px;padding:0 10px !important;border-radius:4px}::slotted(.layer__content__toast.style-info){border:1px solid #dae1e9;background:#e8ebf4;color:#7e909a}::slotted(.layer__content__toast.style-warn){border:1px solid #faebb4;background:#fffbed;color:#e67e22}::slotted(.layer__content__toast.style-error){border:1px solid #f5c4c4;background:#fef0f0;color:#ff5061}.layer__ctrl{display:none;justify-content:flex-end;width:100%;height:60px;padding:15px;line-height:30px;font-size:14px;color:#454545;text-align:right}.layer__ctrl button{min-width:64px;height:30px;padding:0 10px;margin:0 5px;border:1px solid #dae1e9;border-radius:4px;white-space:nowrap;background:#fff;font-size:inherit;font-family:inherit;outline:none;color:inherit}.layer__ctrl button:hover{background:#f3f5fb}.layer__ctrl button:active{border-color:#aabac3}.layer__ctrl button:focus{box-shadow:0 0 2px #88f7df}.layer__ctrl button:last-child{color:#fff;background:#19b491;border-color:transparent}.layer__ctrl button:last-child:hover{background:#3fc2a7}.layer__ctrl button:last-child:active{background:#16967a}.layer__ctrl button::-moz-focus-inner{border:none}:host([mask]){height:100%;background:rgba(255,255,255,0.15);backdrop-filter:blur(5px)}:host([alert]) .layer,:host([confirm]) .layer,:host([prompt]) .layer{max-width:600px;min-width:300px;background:#fff}:host([alert]) .layer__content,:host([confirm]) .layer__content,:host([prompt]) .layer__content{padding:0 15px}:host([notify]) .layer{width:300px;height:120px}:host([notify]) .layer__content{padding:0 15px}:host([toast]) .layer{box-shadow:none}:host([toast]) .layer__content{min-height:40px}\n</style> <div class="layer"> <div class="layer__title noselect"></div> <div class="layer__content"><slot></slot></div> <div class="layer__ctrl noselect"></div> </div> ',this.__TITLE__=this.root.children[1].firstElementChild,this.__BODY__=this.root.children[1].children[1],this.__CTRL__=this.root.children[1].lastElementChild,this.promise=new Promise((t,e)=>{this.resolve=t,this.reject=e})}set title(t){this.props.title=t,t?(this.__TITLE__.firstElementChild?this.__TITLE__.insertBefore(document.createTextNode(t),this.__TITLE__.firstElementChild):this.__TITLE__.textContent=t,this.__TITLE__.style.display="flex"):this.__TITLE__.style.display=""}set type(t){var{btns:e}=this.props;if(t&&!this._handleBtnClick){switch(t){case"alert":for(;e.length>1;)e.splice(0,1);break;case"confirm":case"prompt":for(;e.length>2;)e.splice(0,1);break;case"toast":case"notify":case"frame":if("notify"===t){var s=document.createElement("wc-icon");s.setAttribute("is","close"),this.__TITLE__.appendChild(s)}e=[];break;default:t="common"}this.props.type=t,e.length?(this.__CTRL__.innerHTML=renderBtns(e),this.__CTRL__.style.display="flex"):this.__CTRL__.style.display="",this.setAttribute(t,"")}}set fixed(t){this.props.fixed=!!t,this._updateFixedStat()}_updateFixedStat(){UNIQUE_TYPES.includes(this.props.type)||(this.props.fixed?this._dragIns&&(this._dragIns.destroy(),this._dragIns=null):(this._dragIns=new Drag(this.root.children[1]).by(this.__TITLE__,{overflow:!!this.props.hasOwnProperty("overflow")&&this.props.overflow}),this.removeAttribute("fixed")))}_intercept(t){this.props.intercept?this.props.intercept(t,e=>{delete this.props.intercept,this.resolve(t),this.close()}):(this.resolve(t),this.close())}close(t){if(!1===this.wrapped)if(this._dragIns&&this._dragIns.destroy(),UNIQUE_TYPES.includes(this.props.type)&&(uniqueInstance=null),delete this.promise,unbind(this.__CTRL__,"click",this._handleBtnClick),this.props.from&&!t){let t="opacity:0;";for(let e in this.props.from)t+=`${e}:${this.props.from[e]};`;this.root.children[1].style.cssText+=t,this.timer=setTimeout(()=>{this.parentNode.removeChild(this)},200)}else clearTimeout(this.timer),this.parentNode.removeChild(this);else this.removeAttribute("common")}show(){!1!==this.wrapped&&this.setAttribute("common","")}connectedCallback(){this.type=this.props.type,this.title=this.props.title,this._handleBtnClick=bind(this.__CTRL__,"click",t=>{if("BUTTON"===t.target.tagName){var e=+t.target.dataset.idx,{type:s}=this.props;switch(s){case"alert":this.resolve(),this.close();break;case"confirm":case"prompt":if(0===e)this.reject(),this.close();else{let t="prompt"===s?this.__INPUT__.value:null;this._intercept(t)}break;default:this._intercept(e)}}}),"prompt"===this.props.type&&(this.__INPUT__=this.__BODY__.firstElementChild.assignedNodes().pop(),this._handleSubmit=bind(this.__INPUT__,"submit",t=>{this._intercept(t.detail)})),this.props.mask&&this.setAttribute("mask",""),this._updateFixedStat(),this.props.mask&&(this._handlMask=clickOutside(this.root.children[1],t=>{t.target===this&&(this.props["mask-close"]?(!1===this.wrapped&&this.reject(null),this.close()):UNIQUE_TYPES.includes(this.props.type)&&(this.root.children[1].classList.toggle("scale",!0),setTimeout(t=>{this.root.children[1].classList.remove("scale")},100)))}),this.props["mask-color"]&&(this.style.backgroundColor=this.props["mask-color"])),this.props.blur&&this.root.children[1].classList.toggle("blur",!0);let t=this.props.from?"":"opacity:1;";if(this.props.background&&(t+=`background: ${this.props.background};`),(this.props.radius||0===this.props.radius)&&(t+=`border-radius: ${this.props.radius};`),this.props.size)for(let e in this.props.size)t+=`${e}:${this.props.size[e]};`;if(this.props.from){for(let e in this.props.from)t+=`${e}:${this.props.from[e]};`;setTimeout(t=>{let e="opacity:1;";for(let t in this.props.to)e+=`${t}:${this.props.to[t]};`;this.root.children[1].style.cssText+=e},50)}t&&(this.root.children[1].style.cssText+=t),"toast"===this.props.type&&(this.timer=setTimeout(()=>{toastInstance=null,this.close()},3e3)),"notify"===this.props.type&&(this._handleClose=bind(this.__TITLE__,"click",t=>{"WC-ICON"===t.target.tagName&&this.close()}))}disconnectedCallback(){unbind(document,"mousedown",this._handlMask),unbind(this.__TITLE__,"click",this._handleClose)}attributeChangedCallback(t,e,s){if(null!==s&&e!==s)switch(t){case"title":case"type":this[t]=s;break;case"mask-color":case"background":this.props[t]=s;break;case"mask":case"mask-close":case"blur":this.props[t]=!0;break;case"left":case"right":case"top":case"bottom":null!==s&&(this.props.from[t]=s,this.props.to=this.props.from,this.removeAttribute(t));break;case"fixed":this.fixed=!0}}}function _layer(t){var e=document.createElement("wc-layer");if(t.type||(t.type="common"),"toast"===t.type){var{type:s,content:o}=t;t={type:s,content:o,from:{top:0},to:{top:"30px"}},toastInstance&&toastInstance.close(!0),toastInstance=e}else e.props.mask=t.mask,!1===t.btns?e.props.btns=[]:t.btns&&t.btns.length?e.props.btns=t.btns:e.props.btns=lang.BTNS.concat(),t.intercept&&"function"==typeof t.intercept&&(e.props.intercept=t.intercept),e.props.mask=t.mask,e.props["mask-close"]=t["mask-close"],t.hasOwnProperty("overflow")&&(e.props.overflow=t.overflow),e.props["mask-color"]=t["mask-color"],e.props.blur=t.blur,e.props.radius=t.radius,e.props.background=t.background,t.size&&"object"==typeof t.size&&(e.props.size=t.size),UNIQUE_TYPES.includes(t.type)&&(uniqueInstance&&uniqueInstance.close(!0),uniqueInstance=e);return t.to&&"object"==typeof t.to&&(e.props.to=t.to,t.from&&"object"==typeof t.from?e.props.from=t.from:e.props.from=t.to),e.props.type=t.type,e.props.title=t.title,t.hasOwnProperty("fixed")&&(e.props.fixed=t.fixed),e.innerHTML=t.content,e.wrapped=!1,document.body.appendChild(e),e.promise}Object.assign(_layer,{alert(t,e=lang.TITLE){return this({type:"alert",title:e,content:t,mask:!0})},confirm(t,e=lang.TITLE,s){return"function"==typeof e&&(s=e,e=lang.TITLE),this({type:"confirm",title:e,content:t,mask:!0,intercept:s})},prompt(t=lang.TITLE,e){return this({type:"prompt",title:t,content:'<wc-input autofocus class="layer__content__input"></wc-input>',mask:!0,intercept:e})},frame(t,e={}){return this({...e,type:"frame",content:`<iframe class="layer__content__frame" src="${t}"></iframe>`,mask:!0,"mask-close":!0})},notify(t){return this({type:"notify",title:"通知",content:t,blur:!0,from:{right:"-300px",top:0},to:{right:0}})},toast(t,e="info"){switch(e){case"info":case"warn":case"error":break;default:e="info"}return this({content:`\n      <div class="layer__content__toast style-${e}">\n        <wc-icon size="mini" is="${e}"></wc-icon>\n        ${t}\n      </div>`,type:"toast"})}}),window.layer=_layer;export default _layer;

if(!customElements.get('wc-layer')){
  customElements.define('wc-layer', Layer)
}
