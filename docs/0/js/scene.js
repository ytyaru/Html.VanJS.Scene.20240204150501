(function(){
class Scene extends Map {
    constructor(iterable) { super(iterable); this._selected = null; this._displays = new Map(); }
    json(k) {
        const v = this.get(k)
        if (Type.isArray(v)) {
            for (let el of v) {
                if (!Type.isElement(v)) { continue }
                
            }
        }
        //if (Type.isElement(v))
    }
    select(k) {
        if (!this.has(k)) { return }
        this._selected = k
        this.#allHide()
        this.#show(k)
    }
    getKv(el) {
        const tag = el.tagName.toLowerCase()
        if (['select','input','textarea'].some(v=>v===tag)) { return [el.id, el.value] }
        if (el.getAttribute('contenteditable')) { return [el.id, el.innerText] }
    }
    #allHide() {
        for (let [k,v] of this) {
            this._displays.set(k, getComputedStyle(v).getPropertyValue('display'))
            this[k].style.setProperty('display', 'none') // 'visibility', 'hidden'
        }
    }
    #show(k) { this[k].style.setProperty('display', this._displays.get(k)) }
}
class UiEl {
    constructor() {
        this._scene = new Map()
    }
    async loadTsv(url) {
        const res = await fetch(url)
        const txt = await res.text()
        return this.fromTsv(txt)
    }
    /*
    fromCsv(text) {
        const lines = text.split(/\r?\n/)
    }
    */
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
        const [sid, name, type, label, placeholder, value, _attrs, _datalist] = line.split(delimiter)
        console.log(sid, name, type, label, placeholder, value, _attrs, _datalist)
        console.log(`_attrs:${_attrs}`, ((_attrs) ? 'YES' : 'NO'))
        console.log(`value:${value}`)
        const attrs = ((_attrs) ? JSON.parse(_attrs) : ({}))
        const datalist = ((_datalist) ? JSON.parse(_datalist) : null)
        attrs.id = `${sid.Chain}-${name.Chain}`
        attrs.name = name.Camel
        attrs.placeholder = placeholder.replace('\\n', '\n')
        if (!this.#isTextareaOrContenteditable(type, attrs) && 'select'!==type) { attrs.value = value }
//        attrs.value = value
        if (datalist) { attrs.list = `${attrs.id}-list` }
        if (!scenes.has(sid)) { scenes.set(sid, new Map()) }
        console.log(scenes, scenes.get(sid))
        if (!scenes.get(sid).has(name)) { scenes.get(sid).set(name, ({el:this.#makeUi(type, value, attrs, value, datalist), dl:this.#makeDatalist(attrs.list, type, datalist), label:this.#makeLabel(attrs.id, label)})) }
        return scenes
    }
    #makeUi(type, value, attrs, innerText, datalist) {
        const [el, op] = this.#elOp(type)
        console.log(el, {...op, ...attrs}, innerText.replace('\\n', '\n'), this.#setNewline(innerText, type, attrs))
        // \\n -> <br> or &#13;
 //       return van.tags[el]({...op, ...attrs}, this.#setNewline(innerText, type, attrs), this.#makeSelectOptions(el, datalist))
        //return van.tags[el]({...op, ...options}, innerText.replace('\\n', ((this.#isTextareaOrContenteditable(type, attrs)) ? '<br>' : '\n')), this.#makeSelectOptions(el, datalist))
        //return van.tags[el]({...op, ...options}, innerText.replace('\\n', ((this.#isTextarea(type)) ? '<br>' : '\n')), this.#makeSelectOptions(el, datalist))
        return van.tags[el]({...op, ...attrs}, innerText.replace('\\n', '\n'), this.#makeSelectOptions(el, value, datalist))
    }
    #setNewline(text, type, attrs) { return text.replace('\\n', ((this.#isTextareaOrContenteditable(type, attrs)) ? '<br>' : '\n')) }
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
        return datalist(this.#makeOptions(valueLabelObj))
    }
    #makeSelectOptions(tagName, value, valueLabelObj) {
        console.log('#makeSelectOptions')
        if ('select'!==tagName) { return null }
        console.log(valueLabelObj)
        return this.#makeOptions(valueLabelObj, value)
    }
    #makeOptionGroup(label, valueLabelObj, value) { console.log(label, valueLabelObj);return van.tags.optgroup({label:label}, this.#makeOptions(valueLabelObj, value)) }
    #makeOptions(valueLabelObj, value) { console.log(valueLabelObj, value); return Array.from(Object.entries(valueLabelObj)).map(([k,v])=>{console.log(k,v);return ((Type.isStr(v)) ? van.tags.option({value:k, selected:(k===value)}, v) : this.#makeOptionGroup(k, v, value))}) }
    //#makeOptions(valueLabelObj, value) { return Array.from(Object.entries(valueLabelObj)).map(([k,v])=>{console.log(k,v);return ((Type.isStr(v)) ? van.tags.option({value:k, selected:(k===value)}, v) : this.#makeOptionGroup(k, v, value))}) }
    //#makeOptions(valueLabelObj) { console.log(valueLabelObj); return Array.from(Object.entries(valueLabelObj)).map(([k,v])=>{console.log(k,v);return ((Type.isStr(v)) ? van.tags.option({value:k}, v) : this.#makeOptionGroup(k, v))}) }
    //#makeOptions(valueLabelObj) { return Array.from(Object.entries(JSON.parse(valueLabelObj))).map(([k,v])=>((Type.isStr(v)) ? van.tags.option({value:k}, v) : this.#makeOptionGroup(k, v))) }
    //#makeOptions(valueLabelObj) { return Array.from(Object.entries(JSON.parse(valueLabelObj))).map(([k,v])=>van.tags.option({value:k}, v)) }
    #makeLabel(id, text) { return van.tags.label({for:id}, text) }
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
window.Scene = new Scene();
})()
