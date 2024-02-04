(function(){
class Scene extends Map {
    constructor() { this._selected = null; this._displays = new Map(); }
    json(k) {
        const v = this.get(k)
        if (Type.isArray(v)) {
            for (let el of v) {
                if (!Type.isElement(v)) { continue }
                
            }
        }
        if (Type.isElement(v))
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
    fromCsv() {

    }
    loadCsv() {

    }
    make(name, options, innerText) {
        const [el, op] = this.#elOp(name)
        options = {...op, ...options}
        return van.tags[el](options, innerText)
    }
    #elOp(name) {
        const el = this.#makeNameIsType(name)
        if (el) { return el }
        switch (name) {
            case 'textarea':
            case 'area':
                return ['textarea', {}]
            case 'select': return [name, {}]
            case 'check': return ['input', {type:'checkbox'}]
            case 'datetime': return ['input', {type:'datetime-local'}]
            default: return ['input', {type:'text'}]
        }
    }
    #makeNameIsType(name) {
        if (['text','checkbox','color','date','datetime-local','email','file','hidden','month','number','password','range','search','tel','text','time','url','week'].same(v=>v===name)) { return ['input', {type:name}] }
        return null
    }
}
window.Scene = new Scene();
})()
