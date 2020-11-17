/**
  *
  * @authors yutent (yutent.io@gmail.com)
  * @date    2020-11-17 09:10:37
  * @version v1.0.0
  * 
  */

import"../icon/index.js";import $ from"../utils.js";const IS_FIREFOX=!!window.sidebar;export default class Button extends HTMLElement{static get observedAttributes(){return["icon","autofocus","loading","disabled","lazy"]}constructor(){super(),Object.defineProperty(this,"root",{value:this.attachShadow({mode:"open"}),writable:!0,enumerable:!1,configurable:!0}),Object.defineProperty(this,"props",{value:{icon:"",autofocus:"",loading:!1,disabled:!1,lazy:0},writable:!0,enumerable:!1,configurable:!0}),this.root.innerHTML="<style>*{box-sizing:border-box;margin:0;padding:0}::before,::after{box-sizing:border-box}:host{overflow:hidden;display:inline-block;min-width:64px;height:32px;border-radius:2px;user-select:none;-moz-user-select:none;color:#526273;font-size:14px;cursor:pointer}:host button{display:flex;justify-content:center;align-items:center;width:100%;height:inherit;padding:0 10px;margin:auto;line-height:0;border:1px solid #dae1e9;border-radius:inherit;white-space:nowrap;background:#fff;font-size:inherit;font-family:inherit;outline:none;color:inherit;cursor:inherit}:host button:hover{background:#f2f5fc}:host button:active{border-color:#bdbdbd}:host button::-moz-focus-inner{border:none}:host .icon{--size: 18px;margin-right:3px}:host([size='large']){min-width:120px;height:42px;font-size:16px}:host([size='large']) .icon{--size: 20px}:host([size='large'][circle]){min-width:62px;height:62px}:host([size='large'][circle]) button{padding:0 20px}:host([size='medium']){min-width:90px;height:36px}:host([size='medium']) button{padding:0 15px}:host([size='medium'][circle]){min-width:36px}:host([size='mini']),:host([text]){min-width:24px;height:24px;font-size:12px}:host([size='mini']) button,:host([text]) button{padding:0 5px}:host([size='mini']) .icon,:host([text]) .icon{--size: 14px}:host([size='mini'][circle]){min-width:24px}:host([text]){height:18px}:host([text]) button{padding:0;border:0}:host([text]) button:hover{background:none;text-decoration:underline}:host([round]){border-radius:21px}:host([circle]){min-width:32px;border-radius:50%}:host([circle]) button{padding:0}:host([circle]) .icon{margin-right:0}:host([loading]),:host([disabled]){cursor:not-allowed;color:#bdbdbd;opacity:0.6}:host([loading]) .icon,:host([disabled]) .icon{color:#bdbdbd}:host([loading]) button,:host([disabled]) button{background:#fff;border-color:#dae1e9}:host([color]){color:#fff}:host([color]) button{border-color:transparent}:host([color]) .icon{color:#fff}:host([color='red']) button{background:#eb3b48}:host([color='red']) button:hover{background:#ff5061}:host([color='red']) button:active{background:#ce3742}:host([color='red'][text]) button{background:transparent;color:#eb3b48}:host([color='red'][text]) button:hover{color:#ff5061}:host([color='red'][text]) button:active{color:#ce3742}:host([color='red'][loading]) button,:host([color='red'][disabled]) button{background:#ff5061}:host([color='blue']) button{background:#42a5f5}:host([color='blue']) button:hover{background:#64b5f6}:host([color='blue']) button:active{background:#2196f3}:host([color='blue'][text]) button{background:transparent;color:#42a5f5}:host([color='blue'][text]) button:hover{color:#64b5f6}:host([color='blue'][text]) button:active{color:#2196f3}:host([color='blue'][loading]) button,:host([color='blue'][disabled]) button{background:#64b5f6}:host([color='green']) button{background:#66bb6a}:host([color='green']) button:hover{background:#81c784}:host([color='green']) button:active{background:#4caf50}:host([color='green'][text]) button{background:transparent;color:#66bb6a}:host([color='green'][text]) button:hover{color:#81c784}:host([color='green'][text]) button:active{color:#4caf50}:host([color='green'][loading]) button,:host([color='green'][disabled]) button{background:#81c784}:host([color='teal']) button{background:#26a69a}:host([color='teal']) button:hover{background:#4db6ac}:host([color='teal']) button:active{background:#009688}:host([color='teal'][text]) button{background:transparent;color:#26a69a}:host([color='teal'][text]) button:hover{color:#4db6ac}:host([color='teal'][text]) button:active{color:#009688}:host([color='teal'][loading]) button,:host([color='teal'][disabled]) button{background:#4db6ac}:host([color='orange']) button{background:#f39c12}:host([color='orange']) button:hover{background:#ffb618}:host([color='orange']) button:active{background:#e67e22}:host([color='orange'][text]) button{background:transparent;color:#f39c12}:host([color='orange'][text]) button:hover{color:#ffb618}:host([color='orange'][text]) button:active{color:#e67e22}:host([color='orange'][loading]) button,:host([color='orange'][disabled]) button{background:#ffb618}:host([color='dark']) button{background:#526273}:host([color='dark']) button:hover{background:#62778d}:host([color='dark']) button:active{background:#425064}:host([color='dark'][text]) button{background:transparent;color:#526273}:host([color='dark'][text]) button:hover{color:#62778d}:host([color='dark'][text]) button:active{color:#425064}:host([color='dark'][loading]) button,:host([color='dark'][disabled]) button{background:#62778d}:host([color='purple']) button{background:#9575cd}:host([color='purple']) button:hover{background:#9575cd}:host([color='purple']) button:active{background:#673ab7}:host([color='purple'][text]) button{background:transparent;color:#9575cd}:host([color='purple'][text]) button:hover{color:#9575cd}:host([color='purple'][text]) button:active{color:#673ab7}:host([color='purple'][loading]) button,:host([color='purple'][disabled]) button{background:#9575cd}:host([color='grey']) button{background:#9e9e9e}:host([color='grey']) button:hover{background:#bdbdbd}:host([color='grey']) button:active{background:#757575}:host([color='grey'][text]) button{background:transparent;color:#9e9e9e}:host([color='grey'][text]) button:hover{color:#bdbdbd}:host([color='grey'][text]) button:active{color:#757575}:host([color='grey'][loading]) button,:host([color='grey'][disabled]) button{background:#bdbdbd}:host([no-border]) button{border-color:transparent;background:inherit}:host([text][loading]) button,:host([text][loading]) button:hover,:host([text][loading]) button:active,:host([text][disabled]) button,:host([text][disabled]) button:hover,:host([text][disabled]) button:active{text-decoration:none;background:transparent}:host(:focus-within){box-shadow:0 0 2px #88f7df}:host(:focus-within[disabled]),:host(:focus-within[loading]){box-shadow:none}</style> <button> <wc-icon class=\"icon\"></wc-icon> <slot></slot> </button> ",this.hasAttribute("circle")&&(this.textContent=""),this.__BTN__=this.root.children[1],this.__ICO__=this.__BTN__.children[0]}get loading(){return this.props.loading}set loading(o){var t=typeof o;o!==this.props.loading&&("boolean"===t&&o||"boolean"!==t?(this.props.loading=!0,this.__ICO__.setAttribute("is","loading"),this.setAttribute("loading","")):(this.props.loading=!1,this.__ICO__.setAttribute("is",this.props.icon),this.removeAttribute("loading")))}get disabled(){return this.props.disabled}set disabled(o){var t=typeof o;o!==this.props.disabled&&("boolean"===t&&o||"boolean"!==t?(this.props.disabled=!0,this.setAttribute("disabled","")):(this.props.disabled=!1,this.removeAttribute("disabled")))}connectedCallback(){this.stamp=0,this._handleClick=$.bind(this.__BTN__,"click",o=>{var{loading:t,disabled:e,lazy:r}=this.props,n=Date.now();return t||e||r&&n-this.stamp<r?o.stopPropagation():void(this.stamp=n)})}disconnectedCallback(){$.unbind(this.__BTN__,"click",this._handleClick)}attributeChangedCallback(o,t,e){if(null!==e&&t!==e)switch(o){case"icon":this.props.icon=e,e?this.props.loading||this.__ICO__.setAttribute("is",e):(this.removeAttribute("icon"),this.__ICO__.removeAttribute("is"));break;case"autofocus":this.__BTN__.setAttribute("autofocus",""),IS_FIREFOX&&setTimeout(o=>{this.__BTN__.focus()},10);break;case"lazy":this.props.lazy=e>>0;break;case"loading":case"disabled":this[o]=!0}}}

if(!customElements.get('wc-button')){
  customElements.define('wc-button', Button)
}
