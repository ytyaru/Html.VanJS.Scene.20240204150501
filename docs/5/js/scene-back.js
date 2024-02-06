(function(){
class Scene extends Map {
    /*
    constructor() {
        this._map = new Map()
    }
    get(k) { return this._map.get(k) }
    set(k, v) { return this._map.set(k, v) }
    has(k) { return this._map.has(k) }
    has(k) { return this._map.has(k) }
    */
    json(k) {
        const v = this.get(k)
        if (Type.isArray(v)) {
            for (let el of v) {
                if (!Type.isElement(v)) { continue }
                
            }
        }
        if (Type.isElement(v))
    }
    getKv(el) {
        const tag = el.tagName.toLowerCase()
        if (['select','input','textarea'].some(v=>v===tag)) { return [el.id, el.value] }
        if (el.getAttribute('contenteditable')) { return [el.id, el.innerText] }
    }
    /*
    isTarget(el) {
        const tag = el.tagName.toLowerCase()
        if (['select','input','textarea'].some(v=>v===tag)) { return true }
        if (el.getAttribute('contenteditable'))
        if (['select','input','textarea'].some(v=>v===tag)) { return true }
    }
    getValue(el, tag) {
        
    }
    getSelectValue(el) {

    }
    getRadioCheckValue(el) {

    }
    getInputValue(el) {

    }
    */
}
window.Scene = Scene;
})()
