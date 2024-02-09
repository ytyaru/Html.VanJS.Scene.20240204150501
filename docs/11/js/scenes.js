(function(){
class Tsv {
    static COL_SZ = 8
    static fromStr(tsv, isHeaderTrim) { // [{sid,name,type,label,placeholder,value,datalist,attrs},...]
        tsv = tsv.trimLine()
        tsv = ((isHeaderTrim) ? this.#removeHeader(tsv) : tsv)
        return this.#lines(tsv).map(line=>this.#objects(this.#columns(line)))
    }
    static #removeHeader(text) { const i=text.indexOf('\n'); return ((-1===i) ? text : text.substr(i+1)); }
    static #lines(text) { return text.split(/\r?\n/) }
    static #columns(line, delimiter='\t') { return line.split(delimiter) }
    static #objects(columns) {
        // 不足列を空値で補う
        //if (columns.length < Tsv.COL_SZ) { [...Array(Tsv.COL_SZ - columns.length)].map(()=>columns.push('')) }
        if (Tsv.COL_SZ !== columns.length) { throw new Error(`TSVの列数が不正です。一行あたり${Tsv.COL_SZ}列であるべきです。:${columns.length}列:${columns}`) }
        const [sid, name, type, label, placeholder, value, datalist, attrs] = columns
        return {sid:sid, eid:name, type:type, label:label, placeholder:placeholder, value:value, datalist:datalist, attrs:attrs}
    }
}
class TsvParser {
    static fromTsv(tsv) { // [{tagName:, attrs:{}, detalist:{}, inners:null},...]
        return tsv.map(column=>this.fromColumn(column))
    }
    static fromColumn(column) {
        const obj = {}
        const attrs = ((column.attrs) ? JSON.parse(column.attrs) : ({}))
        const datalist = ((column.datalist) ? JSON.parse(column.datalist) : null)
        attrs.id = `${column.sid.Chain}-${column.eid.Chain}`
        attrs.name = column.eid.Camel
        attrs.placeholder = column.placeholder.replace('\\n', '\n')
        if (!this.#isContenteditable(attrs) && !['select','file'].some(v=>v===column.type)) { attrs.value = column.value.replace('\\n', '\n') }
        //if (!this.#isContenteditable(attrs) && !['file'].some(v=>v===column.type)) { attrs.value = column.value.replace('\\n', '\n') }
        if (datalist && ['hidden','password','check','checkbox','radio','button','submit','reset','image'].some(v=>v!==column.type)) { attrs.list = `${attrs.id}-list` }
        const [tagName, att] = this.#elOp(column.type)
        return {tagName:tagName, attrs:{...att, ...attrs}, datalist:datalist, inners:null}
    }
    static #elOp(type) {
        let el = this.#makeNameIsType(type); if (el) { return el };
        el = this.#makeButton(type); if (el) { return el };
        switch (type) {
            case 'textarea':
            case 'area':
                return ['textarea', {}]
            case 'select': return [type, {}]
            case 'check': return ['input', {type:'checkbox'}]
            case 'datetime': return ['input', {type:'datetime-local'}]
            default: return [type, {}]
        }
    }
    static #makeNameIsType(type) {
        if (['text','checkbox','radio','color','date','datetime-local','email','file','hidden','month','number','password','range','search','tel','text','time','url','week'].some(v=>v===type)) { return ['input', {type:type}] }
        return null
    }
    static #makeButton(type) { return ((['button','submit','reset'].some(v=>v===type)) ? ['button', {type:type}] : null) }
    static #isTextareaOrContenteditable(type, attrs) {
        if (['area','textarea'].some(v=>v===type)) { return true }
        else if (attrs.hasOwnProperty('contenteditable')) { return attrs.contenteditable }
        return false
    }
    static #isContenteditable(attrs) { return ((attrs.hasOwnProperty('contenteditable')) ? attrs.contenteditable : false )}
}
class Tag { // {el:, dl:, lb: }
    static make(col, obj) { // make(Tsv.fromStr('')[0], TsvParser.fromColumn(Tsv.fromStr('')[0]))
        return {
            el: this.#makeEl(col, obj),
            dl: this.#makeDl(col.type, obj.attrs.list, obj.datalist),
            lb: this.#makeLb(col.type, obj.attrs.id, col.label)
    }}
    static #makeEl(col, obj) { // make(Tsv.fromStr('')[0], TsvParser.fromColumn(Tsv.fromStr('')[0]))
        if ('radio'===col.type) { return this.#makeRadios(obj.attrs, obj.datalist) }
        else if (['check','checkbox'].some(v=>v===col.type)) { return this.#makeCheckbox(obj.attrs, col.label) }
        else if (['number','range'].some(v=>v===col.type)) { return this.#makeNumberOrRange(obj.attrs.value, obj.attrs) }
        console.log(obj, obj.attrs, obj.attrs.value)
        return van.tags[obj.tagName](obj.attrs, 
            ((Type.isStr(obj.attrs.value)) ? obj.attrs.value.replace('\\n', '\n') : null), 
            this.#makeSelectOptions(obj.tagName, col.value, obj.datalist),
            ((obj.inners) ? obj.inners : null))
            //((obj.inners) ? van.tags.div(obj.inners) : null))
            //obj.inners)
            //this.#makeSelectOptions(obj.tagName, col.value, obj.datalist))
            //this.#makeSelectOptions(obj.tagName, obj.attrs.value, obj.datalist))
    }
    static #makeRadios(attrs, datalist) {
        console.log('#makeRadios(attrs, datalist):', attrs, datalist)
        const valueLabelObj = JSON.parse(attrs.value)
        console.log(valueLabelObj, Array.from(Object.entries(valueLabelObj)))
        //return Array.from(Object.entries(valueLabelObj)).map(([k,v])=>{attrs.value=k;return van.tags.label(van.tags.input(attrs), v);})
        //return Array.from(Object.entries(valueLabelObj)).map(([k,v])=>{attrs.value=k;attrs.id+='-'+attrs.value.Chain;return van.tags.label(van.tags.input(attrs), v);})
        // attrsを共用する。複数のラジオボタンで。けどそれは困るのでディープコピーした。
        return Array.from(Object.entries(valueLabelObj)).map(([k,v])=>{const att=JSON.parse(JSON.stringify(attrs));console.log(k,v,att.id);att.value=k;att.id+='-'+k.Chain;return van.tags.label(van.tags.input(att), v);})
    }
    static #makeCheckbox(attrs, label) {
        attrs.checked = ['true','1','checked'].some(v=>v===attrs.value)
        attrs.value = null
        return van.tags.label(van.tags.input(attrs), label)
    }
    static #makeNumberOrRange(value, attrs) {
        const v = value.split(',') // value,min,max,step
        attrs.value = Number(v[0])
        if (1 < v.length) { attrs.min = Number(v[1]) }
        if (2 < v.length) { attrs.max = Number(v[2]) }
        if (3 < v.length) { attrs.step = Number(v[3]) }
        return van.tags.input(attrs)
    }
    static #makeDl(type, id, values) {
        console.warn('#makeDatalist()', id, type, values)
        if (!values) { console.warn(`datalistのデータが存在しないので作成を中断しました。`); return null }
        if (!Type.isArray(values)) { console.warn(`datalistのデータが配列でないので作成を中断しました。`); return null }
        if (!['text','search','url','tel','email','number','month','week','date','time','datetime','datetime-local','range','color','password'].some(v=>v===type)) { console.warn(`datalist作成失敗。非対応要素${type}のため。`); return null; }
        return van.tags.datalist({id:id}, values.map(v=>van.tags.option({value:v})))
    }
    static #makeSelectOptions(tagName, value, valueLabelObj) {
//        console.log('#makeSelectOptions')
        if ('select'!==tagName) { return null }
        console.log(tagName, value, valueLabelObj)
        return this.#makeOptions(valueLabelObj, value)
    }
    static #makeOptionGroup(label, valueLabelObj, value) { console.log(label, valueLabelObj);return van.tags.optgroup({label:label}, this.#makeOptions(valueLabelObj, value)) }
    //#makeOptions(valueLabelObj, value) { return Array.from(Object.entries(valueLabelObj)).map(([k,v])=>{return ((Type.isStr(v)) ? van.tags.option({value:k, selected:(k===value)}, v) : this.#makeOptionGroup(k, v, value))}) }
    static #makeOptions(valueLabelObj, value) { console.log(valueLabelObj, value); return Array.from(Object.entries(valueLabelObj)).map(([k,v])=>{console.log(k,v,value);return ((Type.isStr(v)) ? van.tags.option({value:k, selected:(k===value)}, v) : this.#makeOptionGroup(k, v, value))}) }
    static #makeLb(type, id, text) { return van.tags.label(((['radio','check','checkbox'].some(v=>v===type)) ? ({}) : ({for:id})), text) }
}
class SceneMap {
    constructor() { this._map = new Map(); }
    init(tsv, isHeaderTrim) {
        this._map.clear()
        const columns = Tsv.fromStr(tsv, isHeaderTrim)
        for (let col of columns) {
            const obj = TsvParser.fromColumn(col)
            if (!this._map.has(col.sid)) { this._map.set(col.sid, {uiMap:new Map(), make:null}) }
            const scene = this._map.get(col.sid)
            const uiMap = scene.uiMap
            if (!scene.uiMap.has(col.eid)) { scene.uiMap.set(col.eid, {col:col, obj:obj}) }
        }
    }
    get(sid, eid) {
        if (sid && eid) { return this._map.get(sid).uiMap.get(eid) }
        else if (sid) { return this._map.get(sid) }
        return this._map
    }
    has(sid, eid) {
        if (sid && eid) { return (this._map.has(sid) && this._map.get(sid).uiMap.has(eid)) }
        else if (sid) { return this._map.has(sid) }
        return false
    }
    setAttr(sid, eid, key, value) { if (this.has(sid, eid)) { this.get(sid, eid).obj.attrs[key] = value } else { throw new Error(`存在しないキーです。:sid:${sid}, eid:${eid}`) }  }
    setInners(sid, eid, value) { if (this.has(sid, eid)) { this.get(sid, eid).obj.inners = value } else { throw new Error(`存在しないキーです。:sid:${sid}, eid:${eid}`) } } 
    margeAttrs(sid, eid, attrs) { this.get(sid, eid).obj.attrs[key] = ({...this.get(sid, eid).obj.attrs[key], ...attrs}) }
    setMake(sid, fn) { this.get(sid).make = fn }
    makeAll() { return Array.from(this._map.keys()).map(sid=>this.make(sid)) }
    make(sid) {
        const s = this.get(sid)
        const m = s.make
        if (Type.isFunction(m)) { return m(s.uiMap, sid) }
        return this.#makeTable(s.uiMap, sid)
    }
    #makeTable(uiMap, sid) {
        const table = SceneMakeHelper.table(uiMap, sid)
        table.id = sid
        return table
    }
}
class SceneMakeHelper {
    static table(uiMap, sid) {
        return van.tags.table({id:sid},
            van.tags.caption(sid),
            Array.from(uiMap.entries()).map(([eid, v])=>{
                const dom=Tag.make(v.col, v.obj)
                return van.tags.tr(van.tags.th(v.col.label), van.tags.td(dom.el, dom.dl))
            })
        )
    }
    static tag(col, obj) { return Tag.make(col, obj) }
}
class SceneTransitioner {
    constructor(sceneMap) { // SceneMap instance
        this._map = sceneMap
        this._now = null
        this._mode = {dir:0, loopMethod:0}
        this._seq = new MapSequence(this._map.get(), 0)
        console.log(this._map)
    }
    init(sid) { this.#addAll(sid) }
    #addAll(sid) {
        van.add(document.body, this._map.makeAll())
        this.#hideAll()
        this.select(sid)
    }
    select(sid) {
        if (!this._map.get().has(sid)) { sid = this._map.get().entries().next().value[0] } // sidが未指定なら最初の画面を選択する
        console.log(`select(): sid=${sid}`)
        this._now = sid
        this._seq.key = sid
        this.#hideAll()
        this.#show(sid)
    }
    move() {
        const [i, k, v] = this._seq.next()
        this.select(k)
    }
    first() { this.select(this._seq.first()[1]) }
    last() { this.select(this._seq.last()[1]) }
    #hideAll() { for (let [sid,v] of this._map.get()) { this.#hide(sid) } }
    #hide(sid) { this.#setDisp(sid, false) }
    #show(sid) { this.#setDisp(sid, true) }
    #setDisp(sid, isShow) { const el=document.querySelector(`#${sid}`); if (el) {el.style.setProperty('display', ((isShow) ? 'block' : 'none'))} }
}
class SceneStore {
    constructor(sceneMap) { // SceneMap instance
        this._map = sceneMap.get()
    }
    json(sid) {
        const json = {}
        if (sid) { return this.#jsonScene(sid) }
        console.log(this._map)
        for (let [sid, s] of this._map.entries()) {
            json[sid] = this.#evs(sid, s.uiMap)
        }
        return json
    }
    #jsonScene(sid) { return this.#evs(sid, this._map.get(sid).uiMap) }
    #evs(sid, uiMap) { return this.#pickBy(Object.assign(...Array.from(uiMap.entries()).map(([eid,e])=>({[eid]:this.#value(sid,eid,e.obj.tagName, e.obj.attrs)})))) }
    //#evs(sid, uiMap) { return Object.assign(...Array.from(uiMap.entries()).map(([eid,e])=>({[eid]:this.#value(sid,eid,e.obj.tagName, e.obj.attrs)}))) }
    //#evs(sid, uiMap) { return Object.assign(Array.from(uiMap.entries()).map(([eid,e])=>({[eid]:this.#value(sid,eid,e.obj.tagName, e.obj.attrs)}))) }
    //#evs(sid, uiMap) { return this.#pickBy(Object.assign(Array.from(uiMap.entries()).map(([eid,e])=>({[eid]:this.#value(sid,eid,e.obj.tagName, e.obj.attrs)})))) }
    //#evs(sid, uiMap) { return Object.assign(Array.from(uiMap.entries()).map(([eid,e])=>({eid:document.querySelector(`#${sid}-${eid}`).value}))) }
    #value(sid, eid, tagName, attrs) {
        if ('input'===tagName && 'radio'===attrs.type) {
            const checkedRadios = Array.from(document.querySelectorAll(`input[type="radio"][id^="${sid}-${eid}-"]`)).filter(radio=>radio.checked)
            return ((0===checkedRadios.length) ? null : checkedRadios[0].value)
        }
//        if ('input'===tagName && 'checkbox'===attrs.type) { return el.checked }
//        const q = (('input'===tagName && 'radio'===attrs.type) ? `input[type="radio"][id^="${sid}-${eid}-"][checked]` : `#${sid}-${eid}`)
//        const el = document.querySelector(q)
//        console.log(q, el)
        //const id = `#${sid}-${eid}`
        const id = `#${sid.Chain}-${eid.Chain}`
        const el = document.querySelector(id)
        const attNm = this.#getValueAttrName(tagName, attrs)
        console.log(id, el, attNm, ((attNm) ? el[attNm] : ''))
        if (attNm) { return ((['number','range'].some(v=>v===attrs.type)) ? Number(el[attNm]) : el[attNm]) }
        //if (attNm) { return el[attNm] }
        return undefined
        /*
        if (['textarea','select','input'].some(v=>v===tagName)) { return el.value }
        else if (attrs.hasOwnProperty('contenteditable')) { return el.innerHTML }
        else { return undefined }
        */
        /*
        if ('input'===tagName && 'radio'===attrs.type) {
            const el = document.querySelector(`input[type="radio"][id^="${sid}-${eid}-"][checked]`)
        }
//        const el = document.querySelector(`#${sid}-${eid}`)
//        const id = `#${sid}-${eid}${(('input'===tagName && ['radio','checkbox'].some(v=>v===attrs.type)) ? '-'+attrs.value.Chain : '')}`
        const el = document.querySelector(id)
        console.log(id, el)
        //console.log(`#${sid}-${eid}`, el)
        //if (['textarea','select','input'].some(v=>v===tagName)) { return el.value }
        //if (['textarea','select','input'].some(v=>v===tagName)) { return ((['radio','checkbox'].some(v=>v===attrs.type)) ? el.checked : el.value) }
        if (['textarea','select'].some(v=>v===tagName)) { return el.value }
        else if ('input'===tagName) { return ((['radio','checkbox'].some(v=>v===attrs.type)) ? el.checked : el.value) }
        else if (attrs.hasOwnProperty('contenteditable')) { return el.innerHTML }
        else { return undefined }
        */
    }
    #getValueAttrName(tagName, attrs) {
        //if ('input'===tagName && 'checkbox'===attrs.type) { return 'checked' }
        if ('input'===tagName && 'checkbox'===attrs.type) { console.log(attrs.type, 'checked!!!!!'); return 'checked' }
        if (['textarea','select','input'].some(v=>v===tagName)) { return 'value' }
        else if (attrs.hasOwnProperty('contenteditable')) { return 'innerHTML' }
        return null
    }
    #pickBy(obj) { return Object.assign(...Array.from(Object.entries(obj)).filter(([k,v])=>(undefined!==v)).map(([k,v])=>({[k]:v})))}
    /*
    #radioKvs(tagName, type) {
        const json = {}
        if (!json.hasOwnProperty(sid)) { json[sid] = {} }
        if ('input'===tagName && 'radio'===type) {
            for (let radio of document.querySelector(`input[type="radio"][id^="${sid}-${eid}-"]`)) {

            }
            document.getElementsByName('fruit');
        }
    }
    */
    /*
    #pickBy(obj) {
        const o = {}
        for (let [k,v] of Object.entries(obj)) {
            if (undefined===v) { continue }
            o[k] = v
        }
        return o
        Array.from(Object.entries(obj)).filter(([k,v])=>(undefined!==v))

        Array.from(Object.entries(obj)).map(([k,v])=>
    }
    #evs(sid, uiMap) {
        const json = {}
        for (let [eid, e] of uiMap) { json[eid] = document.querySelector(`#${sid}-${eid}`).value }
        Array.from(uiMap.entries()).map(([eid,e])=>json[eid]=document.querySelector(`#${sid}-${eid}`).value)
        return json
    }
    */
}
class Scene {
    constructor() {
        this._map = new SceneMap()
        this._trans = null
        this._store = null
    }
    get Map() { return this._map }
    get Transitioner() { return this._trans }
    get Store() { return this._store }
    get MakeHelper() { return SceneMakeHelper }
    init(tsv, isHeaderTrim) {
        this._map.init(tsv, isHeaderTrim)
        this._trans = new SceneTransitioner(this._map)
        this._store = new SceneStore(this._map)
    }
    addBody() { this._trans.init() }
}
window.Scene = Scene
/*
window.SceneMap = SceneMap
window.SceneMakeHelper = SceneMakeHelper
window.SceneTransitioner = SceneTransitioner
window.SceneStore = SceneStore
*/
})()
