/**
 *
 * @authors yutent (yutent@doui.cc)
 * @date    2019-09-07 23:35:03
 * @version v2.0.1
 * 
 */

'use strict'

export default class Progress extends HTMLElement{static get observedAttributes(){return["value","max"]}constructor(){super(),Object.defineProperty(this,"root",{value:this.attachShadow({mode:"open"}),writable:!0,enumerable:!1,configurable:!0}),Object.defineProperty(this,"props",{value:{value:0,max:1},writable:!0,enumerable:!1,configurable:!0}),this.root.innerHTML="<style>*{box-sizing:border-box;margin:0;padding:0}::before,::after{box-sizing:border-box}:host{display:flex;align-items:center}:host label{flex:1;height:var(--size, 10px);border-radius:9px;background:#e8ebf4}:host label span{display:block;width:0;height:100%;border-radius:9px;background:#3fc2a7}:host([size='large']) label{height:18px}:host([size='medium']) label{height:14px}:host([size='mini']) label{height:6px}:host([color='red']) label span{background:#ff5061}:host([color='blue']) label span{background:#66b1ff}:host([color='green']) label span{background:#58d68d}:host([color='orange']) label span{background:#ffb618}:host([color='dark']) label span{background:#62778d}:host([color='purple']) label span{background:#ac61ce}\n</style> <label><span></span></label> ",this.__THUMB__=this.root.children[1].lastElementChild}get value(){return this.props.value}set value(e){this.props.value=+e,this.calculate()}calculate(){var{max:e,value:a}=this.props;this.__THUMB__.style.width=`${100*a/e}%`}connectedCallback(){this.calculate()}attributeChangedCallback(e,a,l){if(null!==l&&a!==l)switch(e){case t:var t=+l;(t!=t||t<1)&&(t=1),this.props.max=t,this.calculate();break;case"value":var r=+l;r==r&&(this.props.value=r,this.calculate())}}};

if(!customElements.get('wc-progress')){
  customElements.define('wc-progress', Progress)
}
