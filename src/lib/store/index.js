const __STORE__={};function parse$And(_){let t="";for(let e in _){let i=_[e];switch(Anot.type(i)){case"object":if(i.$has){t+=`it.${e}.indexOf(${JSON.stringify(i.$has)}) > -1`;break}if(i.$in){t+=`${JSON.stringify(i.$in)}.indexOf(it.${e}) > -1`;break}if(i.$regex){t+=`${i.$regex}.test(it.${e})`;break}if(i.$lt||i.$lte){t+=`it.${e} <${i.$lte?"=":""} ${i.$lt||i.$lte}`,(i.$gt||i.$gte)&&(t+=` && it.${e} >${i.$gte?"=":""} ${i.$gt||i.$gte}`);break}if(i.$gt||i.$gte){t+=`it.${e} >${i.$gte?"=":""} ${i.$gt||i.$gte}`;break}if(i.$eq){t+=`it.${e} === ${i.$eq}`;break}default:t+=`it.${e} === ${JSON.stringify(_[e])}`}t+=" && "}return(t=t.slice(0,-4))||(t="true"),t}function parse$Or(_){let t="";return _.forEach(_=>{t+="(",t+=parse$And(_),t+=") || "}),t.slice(0,-4)}class AnotStore{constructor(_){Anot.hideProperty(this,"__name__",_),Anot.hideProperty(this,"__LAST_QUERY__",""),Anot.hideProperty(this,"__QUERY_HISTORY__",[]),__STORE__[_]||(__STORE__[_]=[],__STORE__[`${_}Dict`]={})}static collection(_){return new this(_)}__MAKE_FN__(_){let t="\n      let result = [];\n      let num = 0;\n      for (let it of arr) {\n        if(";return _.$or?t+=parse$Or(_.$or):t+=parse$And(_),t+="){\n        result.push(it)\n        num++\n        if(limit > 0 && num >= limit){\n          break\n        }\n      }\n    }\n    return result;",Function("arr","limit",t)}clear(_){this.__QUERY_HISTORY__=[],this.__LAST_QUERY__="",_&&(__STORE__[this.__name__]=[],__STORE__[`${this.__name__}Dict`]={})}getAll({filter:_,limit:t=[]}={}){const e=__STORE__[this.__name__];let i=[],r=!1;if(!e||!e.length)return i;if(t.length<1&&(t=[0]),t.length<2&&_&&(r=!0,t[0]>0&&t.unshift(0)),_){let n=JSON.stringify(_);if(this.__LAST_QUERY__===n)i=this.__QUERY_HISTORY__.slice.apply(this.__QUERY_HISTORY__,t);else{i=this.__MAKE_FN__(_)(e,r&&t[1]||0),r||(this.__LAST_QUERY__=n,this.__QUERY_HISTORY__=i,i=this.__QUERY_HISTORY__.slice.apply(this.__QUERY_HISTORY__,t))}}else i=e.slice.apply(e,t);return Anot.deepCopy(i)}get(_){const t=__STORE__[`${this.__name__}Dict`];return Anot.deepCopy(t[_])||null}count({filter:_}={}){return _?this.__LAST_QUERY__===JSON.stringify(_)?this.__QUERY_HISTORY__.length:this.getAll({filter:_,limit:[0]}).length:__STORE__[this.__name__].length}__INSERT__(_,t){let e=__STORE__[this.__name__],i=__STORE__[`${this.__name__}Dict`],r=_[t||"id"];i[r]?this.update(r,_):(e.push(_),i[r]=_)}insert(_,t){Array.isArray(_)||(_=[_]),_.forEach(_=>{this.__INSERT__(_,t)}),this.clear()}sort(_,t,e){let i="";t&&window.Intl&&(i+="\n      let col = new Intl.Collator('zh')\n      "),i+=e?"return arr.sort((b, a) => {":"return arr.sort((a, b) => {",i+=`\n      let filter = function(val) {\n        try {\n          return val.${_} || ''\n        } catch (err) {\n          return ''\n        }\n      }\n    `,t?window.Intl?i+="return col.compare(filter(a), filter(b))":i+="return (filter(a) + '').localeCompare(filter(b), 'zh')":i+="return filter(a) - filter(b)",i+="\n})",Function("arr",i).call(this,__STORE__[this.__name__]),this.clear()}update(_,t){let e=__STORE__[this.__name__],i=__STORE__[`${this.__name__}Dict`],r=i[_],n=e.indexOf(r);e.splice(n,1,t),i[_]=t}remove(_){let t=__STORE__[this.__name__],e=__STORE__[`${this.__name__}Dict`],i=e[_],r=t.indexOf(i);t.splice(r,1),delete e[_]}}Anot.store=window.store=AnotStore;export default AnotStore;