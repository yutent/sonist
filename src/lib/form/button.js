/**
 *
 * @authors yutent (yutent@doui.cc)
 * @date    2019-09-01 23:16:06
 * @version v2.0.1
 * 
 */

'use strict'

import"../icon/index.js";const IS_FIREFOX=!!window.sidebar;export default class Button extends HTMLElement{static get observedAttributes(){return["icon","autofocus","loading","disabled"]}constructor(){super(),Object.defineProperty(this,"root",{value:this.attachShadow({mode:"open"}),writable:!0,enumerable:!1,configurable:!0}),Object.defineProperty(this,"props",{value:{icon:"",autofocus:"",loading:!1,disabled:!1},writable:!0,enumerable:!1,configurable:!0}),this.root.innerHTML="<style>*{box-sizing:border-box;margin:0;padding:0}::before,::after{box-sizing:border-box}:host{overflow:hidden;display:inline-block;min-width:64px;height:32px;user-select:none;-moz-user-select:none;color:#526273;font-size:14px;cursor:pointer}:host button{display:flex;justify-content:center;align-items:center;width:100%;height:inherit;padding:0 5px;margin:auto;border:1px solid #dae1e9;border-radius:4px;white-space:nowrap;background:#fff;font-size:inherit;outline:none;color:inherit;cursor:inherit}:host button:hover{background:#f3f5fb}:host button:active{border-color:#aabac3}:host button::-moz-focus-inner{border:none}:host .icon{--size: 18px;margin-right:3px}:host([round]) button{border-radius:21px}:host([circle]){min-width:32px}:host([circle]) button{padding:0;border-radius:50%}:host([circle]) .icon{margin-right:0}:host([size='large']){min-width:120px;height:42px;font-size:16px}:host([size='large']) .icon{--size: 20px}:host([size='large'][circle]){min-width:42px}:host([size='medium']){min-width:90px;height:36px}:host([size='medium'][circle]){min-width:36px}:host([size='mini']){min-width:24px;height:24px;font-size:12px}:host([size='mini']) .icon{--size: 14px}:host([loading]),:host([disabled]){cursor:not-allowed;color:#aabac3;opacity:0.6}:host([loading]) .icon,:host([disabled]) .icon{color:#aabac3}:host([loading]) button,:host([disabled]) button{background:#fff}:host([color]){color:#fff}:host([color]) button{border-color:transparent}:host([color]) .icon{color:#fff}:host([color='red']) button{background:#eb3b48}:host([color='red']) button:hover{background:#ff5061}:host([color='red']) button:active{background:#ce3742}:host([color='red'][loading]) button,:host([color='red'][disabled]) button{background:#ff5061}:host([color='blue']) button{background:#409eff}:host([color='blue']) button:hover{background:#66b1ff}:host([color='blue']) button:active{background:#3a8ee6}:host([color='blue'][loading]) button,:host([color='blue'][disabled]) button{background:#66b1ff}:host([color='green']) button{background:#2ecc71}:host([color='green']) button:hover{background:#58d68d}:host([color='green']) button:active{background:#27ae60}:host([color='green'][loading]) button,:host([color='green'][disabled]) button{background:#58d68d}:host([color='teal']) button{background:#19b491}:host([color='teal']) button:hover{background:#3fc2a7}:host([color='teal']) button:active{background:#16967a}:host([color='teal'][loading]) button,:host([color='teal'][disabled]) button{background:#3fc2a7}:host([color='orange']) button{background:#f39c12}:host([color='orange']) button:hover{background:#ffb618}:host([color='orange']) button:active{background:#e67e22}:host([color='orange'][loading]) button,:host([color='orange'][disabled]) button{background:#ffb618}:host([color='dark']) button{background:#526273}:host([color='dark']) button:hover{background:#62778d}:host([color='dark']) button:active{background:#425064}:host([color='dark'][loading]) button,:host([color='dark'][disabled]) button{background:#62778d}:host([color='purple']) button{background:#9b59b6}:host([color='purple']) button:hover{background:#ac61ce}:host([color='purple']) button:active{background:#8e44ad}:host([color='purple'][loading]) button,:host([color='purple'][disabled]) button{background:#ac61ce}:host([color='grey']) button{background:#90a3ae}:host([color='grey']) button:hover{background:#aabac3}:host([color='grey']) button:active{background:#7e909a}:host([color='grey'][loading]) button,:host([color='grey'][disabled]) button{background:#aabac3}\n</style> <button> <wc-icon class=\"icon\"></wc-icon> <slot></slot> </button> ",this.hasAttribute("circle")&&(this.textContent=""),this.__BTN__=this.root.children[1],this.__ICO__=this.__BTN__.children[0]}get loading(){return this.props.loading}set loading(o){var t=typeof o;o!==this.props.loading&&("boolean"===t&&o||"boolean"!==t?(this.props.loading=!0,this.__ICO__.setAttribute("is","loading"),this.setAttribute("loading","")):(this.props.loading=!1,this.__ICO__.setAttribute("is",this.props.icon),this.removeAttribute("loading")))}get disabled(){return this.props.disabled}set disabled(o){var t=typeof o;o!==this.props.disabled&&("boolean"===t&&o||"boolean"!==t?(this.props.disabled=!0,this.setAttribute("disabled","")):(this.props.disabled=!1,this.removeAttribute("disabled")))}connectedCallback(){this._handleClick=(o=>{this.props.loading||this.props.disabled?o.stopPropagation():this.dispatchEvent(new CustomEvent("active"))}),this.__BTN__.addEventListener("click",this._handleClick,!1)}disconnectedCallback(){this.__BTN__.removeEventListener("click",this._handleClick)}attributeChangedCallback(o,t,e){if(t!==e)switch(o){case"icon":this.props.icon=e,e?this.props.loading||this.__ICO__.setAttribute("is",e):(this.removeAttribute("icon"),this.__ICO__.removeAttribute("is"));break;case"autofocus":this.__BTN__.setAttribute("autofocus",""),IS_FIREFOX&&setTimeout(o=>{this.__BTN__.focus()},10);break;case"loading":case"disabled":this[o]=!0}}};

if(!customElements.get('wc-button')){
  customElements.define('wc-button', Button)
}
