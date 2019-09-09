/**
 *
 * @authors yutent (yutent@doui.cc)
 * @date    2019-09-07 23:35:03
 * @version v2.0.1
 * 
 */

'use strict'

import{bind,unbind}from"../utils.js";export default class Switch extends HTMLElement{static get observedAttributes(){return["checked","disabled"]}constructor(){super(),Object.defineProperty(this,"root",{value:this.attachShadow({mode:"open"}),writable:!0,enumerable:!1,configurable:!0}),Object.defineProperty(this,"props",{value:{checked:!1,disabled:!1},writable:!0,enumerable:!1,configurable:!0}),this.root.innerHTML="<style>*{box-sizing:border-box;margin:0;padding:0}::before,::after{box-sizing:border-box}:host{display:inline-block}:host section{display:flex;justify-content:center;align-items:center}:host label{display:flex;width:38px;height:22px;padding:3px;margin:5px;border-radius:21px;background:#dae1e9;cursor:inherit}:host label.checked{flex-direction:row-reverse;background:#7e909a}:host .dot{width:16px;height:16px;border-radius:50%;background:#fff}:host([disabled]){cursor:not-allowed;opacity:0.6}:host([size='large']) label{width:58px;height:32px}:host([size='large']) .dot{width:26px;height:26px}:host([size='medium']) label{width:50px;height:28px}:host([size='medium']) .dot{width:22px;height:22px}:host([size='mini']) label{width:22px;height:14px;padding:2px}:host([size='mini']) .dot{width:10px;height:10px}:host([color='red']) label.checked{background:#ff5061}:host([color='blue']) label.checked{background:#66b1ff}:host([color='green']) label.checked{background:#58d68d}:host([color='teal']) label.checked{background:#3fc2a7}:host([color='orange']) label.checked{background:#ffb618}:host([color='dark']) label.checked{background:#62778d}:host([color='purple']) label.checked{background:#ac61ce}\n</style> <section> <label> <span class=\"dot\"></span> </label> <slot></slot> </section> ",this.__SWITCH__=this.root.lastElementChild.firstElementChild}get value(){return this.props.checked}set value(e){this.checked=e}get checked(){return this.props.checked}set checked(e){this.props.checked=!!e,this.__SWITCH__.classList.toggle("checked",this.props.checked)}get disabled(){return this.props.disabled}set disabled(e){var t=typeof e;e!==this.props.disabled&&("boolean"===t&&e||"boolean"!==t?(this.props.disabled=!0,this.setAttribute("disabled","")):(this.props.disabled=!1,this.removeAttribute("disabled")))}connectedCallback(){this._handleClick=bind(this,"click",e=>{this.disabled||(this.checked=!this.checked,this.dispatchEvent(new CustomEvent("input")))})}disconnectedCallback(){unbind(this,"click",this._handleClick)}attributeChangedCallback(e,t,i){if(null!==i&&t!==i)switch(e){case"checked":case"disabled":this[e]=!0}}};

if(!customElements.get('wc-switch')){
  customElements.define('wc-switch', Switch)
}
