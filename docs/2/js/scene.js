(function(){
class Scene {
    constructor(scenes, makeObj) {
        this._scenes = scenes
        this._meta = new Map()
        this._selected = null
        this._move = {dir:0, loopMethod:0} // dir:(0,正数:asc, 負数:desc), loopMethod(0:headTail, 1:yoyo, 2:stop)
        this._seq = new Sequence(Array.from(this._scenes.keys()), 0)
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
        van.add(document.body, Array.from(this._scenes).map(([k,v])=>{console.log(k,v);return this._meta.get(k).make(v, k)}))
        this.#hideAll()
        this.select(sid)
    }
    select(sid) {
        if (!this._scenes.has(sid)) { sid = this._scenes.entries().next().value[0] } // sidが未指定なら最初の画面を選択する
        console.log(`select(): sid=${sid}`)
        this._selected = sid
        this._seq.value = sid
        this.#hideAll()
        this.#show(sid)
    }
    move() {
        const [i, k] = this._seq.next()
        this.select(k)
    }
    #hideAll() {
        for (let [k,v] of this._scenes) {
            const scene = document.querySelector(`#${k}`)
            scene.style.setProperty('display', 'none')
        }
    }
    #show(k) { document.querySelector(`#${k}`).style.setProperty('display', 'block') }
    getKv(el) {
        const tag = el.tagName.toLowerCase()
        if (['select','input','textarea'].some(v=>v===tag)) { return [el.id, el.value] }
        if (el.getAttribute('contenteditable')) { return [el.id, el.innerText] }
    }
}
window.Scene = Scene;
})()
