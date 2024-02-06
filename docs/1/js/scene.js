(function(){
class Scene {
    //constructor(scenes) { this._scenes = scenes; this._meta = new Map();; this._selected = null; this._displays = new Map(); }
//    constructor(scenes, makes) { this._scenes = scenes; this._meta = new Map(); this._selected = null; }
    constructor(scenes, makeObj) {
        this._scenes = scenes
        this._meta = new Map()
        this._selected = null
        this._move = {dir:0, loopMethod:0} // dir:(0,正数:asc, 負数:desc), loopMethod(0:headTail, 1:yoyo, 2:stop)
        console.log(this._scenes)
        this.#setupMeta()
        if (makeObj) { for (let [sid, fn] of Object.entries(makeObj)) { this.setMake(sid, fn) } }
    }
    #setupMeta() {
        console.log(this._scenes)
        for (let [k,v] of this._scenes) {
            this._meta.set(k, {make:this.#makeTable, display:'none'})
        }
    }
    setMake(sid, fn) { this._meta.get(sid).make = fn; }
    #makeTable(scene, k) {
        const trs = []
        for (let [k,v] of scene) {
            trs.push(van.tags.tr(van.tags.th(v.label), van.tags.td(v.el, v.dl)))
        }
        return van.tags.table({id:k}, ((k) ? van.tags.caption(k) : null), trs)
    }
    addAll(sid) {
        console.log(sid, this._meta, this._meta.get(sid))
        //van.add(document.body, Array.from(this._scenes).map(([k,v])=>this._meta.get(k)(v, k)))
        van.add(document.body, Array.from(this._scenes).map(([k,v])=>{console.log(k,v);return this._meta.get(k).make(v, k)}))
        this.#hideAll()
        this.select(sid)
    }
    select(sid) {
        //if (!this._scenes.has(sid)) { return }
        if (!this._scenes.has(sid)) { sid = this._scenes.entries().next().value[0] } // sidが未指定なら最初の画面を選択する
        console.log(`select(): sid=${sid}`)
        this._selected = sid
        this.#hideAll()
        this.#show(sid)
    }
    move() {
        let i = this.#selectedIndex()
        i += ((0 <= this._move.dir) ? 1 : -1)
        if (i < 0) {
            switch (this._move.loopMethod) {
                case 0: { i = this._scenes.size-1; break; }
                //case 1: { this._move.dir = ((0<=this._move.dir) ? -1 : 1); i = 1; }
                case 1: { this._move.dir = ((0<=this._move.dir) ? -1 : 1); i = ((1<this._scenes.size) ? 1 : 0); break; }
                case 2: { i = 0; break; }
                default: throw new Error('不正なloopMethod')
            }
        }
        else if (this._scenes.size <= i) {
            switch (this._move.loopMethod) {
                case 0: { i = 0; break; }
                //case 1: { this._move.dir = ((0<=this._move.dir) ? -1 : 1); i = this._scenes.size-2; }
                //case 1: { this._move.dir = ((0<=this._move.dir) ? -1 : 1); i = (this._scenes.size-((1<this._scenes.size) ? 2 : 1)); }
                case 1: { this._move.dir = ((0<=this._move.dir) ? -1 : 1); i = ((1<this._scenes.size) ? this._scenes.size-2 : 0); break; }
                case 2: { i = this._scenes.size-1; break; }
                default: throw new Error('不正なloopMethod')
            }
        }
        const [k, v] = Array.from(this._scenes)[i]
        this.select(k)
    }
    next() { // loopMethod: 末尾到達後 0:最初に戻る, 1:逆方向化, 2:停止
//        this._scenes.get(this._selected)
//        Array.from(this._scenes).map(([k,v])=>)
//        Array.from(this._scenes).findIndex(([k,v])=>)

//        const i = Array.from(this._scenes.keys()).findIndex(k=>k===this._selected)
//        const [k, v] = Array.from(this._scenes)[i]
        const [k, v] = Array.from(this._scenes)[this.#selectedIndex()]
        this.select(k)
    }
    prev() {
        const i = this.#selectedIndex()
        const [k, v] = Array.from(this._scenes)[i]
        this.select(k)
    }
    #selectedIndex() { return Array.from(this._scenes.keys()).findIndex(k=>k===this._selected) }
    #hideAll() {
        for (let [k,v] of this._scenes) {
            const scene = document.querySelector(`#${k}`)
            //this._meta.get(k).display = getComputedStyle(scene).getPropertyValue('display')
            scene.style.setProperty('display', 'none')
            //scene.setAttribute('display', 'none')
            //this._meta.get(k).display = getComputedStyle(v.el).getPropertyValue('display')
            //v.el.style.setProperty('display', 'none') // 'visibility', 'hidden'
        }
    }
    #show(k) { document.querySelector(`#${k}`).style.setProperty('display', 'block') }
    //#show(k) { document.querySelector(`#${k}`).style.setProperty('display', this._meta.get(k).display) }
    //#show(k) { this._scenes.get(k).el.style.setProperty('display', this._meta.get(k).display) }
    getKv(el) {
        const tag = el.tagName.toLowerCase()
        if (['select','input','textarea'].some(v=>v===tag)) { return [el.id, el.value] }
        if (el.getAttribute('contenteditable')) { return [el.id, el.innerText] }
    }
}
window.Scene = Scene;
/*
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
*/
})()
