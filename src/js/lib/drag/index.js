import Drag from"./core.js";Anot.directive("drag",{priority:1500,init:function(e){e.expr='"'+e.expr+'"',e.overflow=!0,e.axis="xy",e.element.dataset.axis&&(e.axis=e.element.dataset.axis,delete e.element.dataset.axis),e.limit=!1,e.element.dataset.limit&&(e.limit=e.element.dataset.limit,e.overflow=!1,delete e.element.dataset.limit)},update:function(e){var t=this.element;if(e)for(t=this.element.parentNode;t;){if(t.classList||Anot.error(`${this.name}=${this.expr}, 解析异常[元素不存在]`),"WC-LAYER"===t.tagName&&"layer"===e){t=t.root.children[1];break}if(t.classList.contains(e)||t.id===e)break;t=t.parentNode}new Drag(t).by(this.element,{limit:this.limit,axis:this.axis,overflow:this.overflow})}});