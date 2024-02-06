(function(){
class UiEl {
    constructor() {
        this._scene = new Map()
    }
    async loadTsv(url) {
        const res = await fetch(url)
        const txt = await res.text()
        return this.fromTsv(txt)
    }
    fromTsv(text, isHeaderTrim) {
        const scenes = new Map()
        text = text.trimLine()
        text = ((isHeaderTrim) ? this.#removeHeader(text) : text)
        console.log(text)
        const lines = text.split(/\r?\n/)
        console.log(lines)
        for (let line of text.split(/\r?\n/)) { this.#fromLine(scenes, line) }
        return scenes
    }
    #removeHeader(text) { const i=text.indexOf('\n'); return ((-1===i) ? text : text.substr(i+1)); }
    #fromLine(scenes, line, delimiter='\t') { // 画面ID,UIName,型,label,placeholder,value,attrs,datalist
        const [sid, name, type, label, placeholder, value, _datalist, _attrs] = line.split(delimiter)
        console.log(sid, name, type, label, placeholder, value, _attrs, _datalist)
        console.log(`_attrs:${_attrs}`, ((_attrs) ? 'YES' : 'NO'))
        console.log(`value:${value}`)
        const attrs = ((_attrs) ? JSON.parse(_attrs) : ({}))
        const datalist = ((_datalist) ? JSON.parse(_datalist) : null)
        attrs.id = `${sid.Chain}-${name.Chain}`
        attrs.name = name.Camel
        attrs.placeholder = placeholder.replace('\\n', '\n')
//        if (!this.#isTextareaOrContenteditable(type, attrs) && 'select'!==type) { attrs.value = value }
        if (!this.#isTextareaOrContenteditable(type, attrs) && !['select','file'].some(v=>v===type)) { attrs.value = value }
//        attrs.value = value
//        if (datalist) { attrs.list = `${attrs.id}-list` }
        if (datalist && ['hidden','password','check','checkbox','radio','button','submit','reset','image'].some(v=>v!==type)) {
            attrs.list = `${attrs.id}-list`
        }
        if (!scenes.has(sid)) { scenes.set(sid, new Map()) }
        console.log(scenes, scenes.get(sid))
        if (!scenes.get(sid).has(name)) { scenes.get(sid).set(name, ({el:this.#makeUi(type, label, value, attrs, value, datalist), dl:this.#makeDatalist(attrs.list, type, datalist), label:this.#makeLabel(type, attrs.id, label)})) }
        return scenes
    }
    #makeUi(type, label, value, attrs, innerText, datalist) {
        const [el, op] = this.#elOp(type)
        //console.log(el, {...op, ...attrs}, innerText.replace('\\n', '\n'), this.#setNewline(innerText, type, attrs))
        attrs = {...op, ...attrs}
        if ('radio'===type) { return this.#makeRadios(attrs, datalist) }
        else if (['check','checkbox'].some(v=>v===type)) { return this.#makeCheckbox(attrs, label) }
        else if (['number','range'].some(v=>v===type)) { return this.#makeNumberOrRange(value, attrs) }
        return van.tags[el](attrs, innerText.replace('\\n', '\n'), this.#makeSelectOptions(el, value, datalist))
    }
    #makeRadios(attrs, datalist) {
        console.log('#makeRadios(attrs, datalist):', attrs, datalist)
        const valueLabelObj = JSON.parse(attrs.value)
        return Array.from(Object.entries(valueLabelObj)).map(([k,v])=>{attrs.value=k;return van.tags.label(van.tags.input(attrs), v);})
    }
    #makeCheckbox(attrs, label) {
        attrs.checked = ['true','1','checked'].some(v=>v===attrs.value)
        attrs.value = null
        return van.tags.label(van.tags.input(attrs), label)
    }
    #makeNumberOrRange(value, attrs) {
        const v = value.split(',') // value,min,max,step
        attrs.value = v[0]
        if (1 < v.length) { attrs.min = v[1] }
        if (2 < v.length) { attrs.max = v[2] }
        if (3 < v.length) { attrs.step = v[3] }
        return van.tags.input(attrs)
    }
    // \\n -> <br> or &#13;
    //#setNewline(text, type, attrs) { return text.replace('\\n', ((this.#isTextareaOrContenteditable(type, attrs)) ? '<br>' : '\n')) }
    #isNumberOrRange(type) { return ['number','range'].some(v=>v===type) }
    #isTextareaOrContenteditable(type, attrs) {
        if (['area','textarea'].some(v=>v===type)) { return true }
        else if (attrs.hasOwnProperty('contenteditable')) { return attrs.contenteditable }
        return false
    }
    //#isTextarea(type) { return ['area','textarea'].some(v=>v===type) } ;
    #elOp(type) {
        const el = this.#makeNameIsType(type)
        if (el) { return el }
        switch (type) {
            case 'textarea':
            case 'area':
                return ['textarea', {}]
            case 'select': return [type, {}]
            case 'check': return ['input', {type:'checkbox'}]
            case 'datetime': return ['input', {type:'datetime-local'}]
//            case 'div': return ['div', {contenteditable:true}]
//            default: return ['input', {type:'text'}]
            default: return [type, {}]
        }
    }
    #makeNameIsType(type) {
        if (['text','checkbox','radio','color','date','datetime-local','email','file','hidden','month','number','password','range','search','tel','text','time','url','week'].some(v=>v===type)) { return ['input', {type:type}] }
        return null
    }
    #makeDatalist(id, type, valueLabelObj) {
        if (!valueLabelObj) { return null }
        if (!['text','search','url','tel','email','number','month','week','date','time','datetime','datetime-local','range','color','password'].some(v=>v===type)) { return }
        return van.tags.datalist(this.#makeOptions(valueLabelObj))
    }
    #makeSelectOptions(tagName, value, valueLabelObj) {
        console.log('#makeSelectOptions')
        if ('select'!==tagName) { return null }
        console.log(valueLabelObj)
        return this.#makeOptions(valueLabelObj, value)
    }
    #makeOptionGroup(label, valueLabelObj, value) { console.log(label, valueLabelObj);return van.tags.optgroup({label:label}, this.#makeOptions(valueLabelObj, value)) }
    #makeOptions(valueLabelObj, value) { console.log(valueLabelObj, value); return Array.from(Object.entries(valueLabelObj)).map(([k,v])=>{console.log(k,v,value);return ((Type.isStr(v)) ? van.tags.option({value:k, selected:(k===value)}, v) : this.#makeOptionGroup(k, v, value))}) }
    //#makeOptions(valueLabelObj, value) { return Array.from(Object.entries(valueLabelObj)).map(([k,v])=>{console.log(k,v);return ((Type.isStr(v)) ? van.tags.option({value:k, selected:(k===value)}, v) : this.#makeOptionGroup(k, v, value))}) }
    //#makeOptions(valueLabelObj) { console.log(valueLabelObj); return Array.from(Object.entries(valueLabelObj)).map(([k,v])=>{console.log(k,v);return ((Type.isStr(v)) ? van.tags.option({value:k}, v) : this.#makeOptionGroup(k, v))}) }
    //#makeOptions(valueLabelObj) { return Array.from(Object.entries(JSON.parse(valueLabelObj))).map(([k,v])=>((Type.isStr(v)) ? van.tags.option({value:k}, v) : this.#makeOptionGroup(k, v))) }
    //#makeOptions(valueLabelObj) { return Array.from(Object.entries(JSON.parse(valueLabelObj))).map(([k,v])=>van.tags.option({value:k}, v)) }
    //#makeLabel(id, text) { return van.tags.label({for:id}, text) }
    #makeLabel(type, id, text) { return van.tags.label(((['radio','check','checkbox'].some(v=>v===type)) ? ({}) : ({for:id})), text) }
    makeTables(scenes) { return Array.from(scenes).map(([k,v])=>this.makeTable(v, k)) }
    makeTable(scene, k) {
        const trs = []
        for (let [k,v] of scene) {
            trs.push(van.tags.tr(van.tags.th(v.label), van.tags.td(v.el, v.dl)))
        }
        return van.tags.table(((k) ? van.tags.caption(k) : null), trs)
    }
}
window.UiEl = UiEl
})()
