/**
  *
  * @authors yutent (yutent.io@gmail.com)
  * @date    2020-11-17 09:10:37
  * @version v1.0.0
  * 
  */

import SVG_DICT from"./svg.js";let dict=SVG_DICT;window.EXT_SVG_DICT&&Object.assign(dict,EXT_SVG_DICT);export default class Icon extends HTMLElement{static get observedAttributes(){return["is"]}constructor(){super(),Object.defineProperty(this,"root",{value:this.attachShadow({mode:"open"}),writable:!0,enumerable:!1,configurable:!0}),Object.defineProperty(this,"props",{value:{is:""},writable:!0,enumerable:!1,configurable:!0}),this.root.innerHTML="<style>*{box-sizing:border-box;margin:0;padding:0}::before,::after{box-sizing:border-box}:host{display:inline-block;color:inherit}:host(:not([is])){display:none}.icon{display:block;width:var(--size, 32px);height:var(--size, 32px);margin:var(--pad, auto);fill:currentColor}.icon.load{animation:load 1.5s linear infinite}.icon circle{stroke:currentColor;animation:circle 1.5s ease-in-out infinite}:host([size='large']) .icon{width:42px;height:42px}:host([size='medium']) .icon{width:38px;height:38px}:host([size='mini']) .icon{width:20px;height:20px}:host([color='red']){color:#ff5061}:host([color='blue']){color:#64b5f6}:host([color='green']){color:#81c784}:host([color='teal']){color:#4db6ac}:host([color='orange']){color:#ffb618}:host([color='dark']){color:#62778d}:host([color='purple']){color:#9575cd}:host([color='grey']){color:#bdbdbd}@keyframes circle{0%{stroke-dasharray:0, 3812px;stroke-dashoffset:0}50%{stroke-dasharray:1906px, 3812px;stroke-dashoffset:-287px}100%{stroke-dasharray:1906px, 3812px;stroke-dashoffset:-2393px}}@keyframes load{to{transform:rotate(360deg)}}</style> <svg class=\"icon\" viewBox=\"0 0 1024 1024\"></svg> ",this.__ICO__=this.root.lastElementChild,this.drawPath()}get is(){return this.props.is}set is(o){o&&this.setAttribute("is",o)}drawPath(){var{is:o}=this.props,t=dict[o];this.__ICO__&&o&&t&&(this.__ICO__.innerHTML="loading"===o?t:`<path d="${t}" />`,this.__ICO__.classList.toggle("load","loading"===o))}attributeChangedCallback(o,t,e){if(null!==e&&t!==e)switch(o){case"is":this.props.is=e,e?this.drawPath():this.removeAttribute("is")}}}

if(!customElements.get('wc-icon')){
  customElements.define('wc-icon', Icon)
}
