(function(){
class Tsv {
    static COL_SZ = 8
    static fromStr(tsv, isHeaderTrim) { // [{sid,name,type,label,placeholder,value,datalist,attrs},...]
        tsv = tsv.trimLine()
        tsv = ((isHeaderTrim) ? this.#removeHeader(tsv) : tsv)
//        const lines = tsv.split(/\r?\n/)
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
    static fromTsv(tsv) { // [{tagName:, attrs:{}, detalist:{}},...]
        return tsv.map(column=>this.fromColumn(column))
    }
    static fromColumn(column) {
        const obj = {}
        const attrs = ((column.attrs) ? JSON.parse(column.attrs) : ({}))
        const datalist = ((column.datalist) ? JSON.parse(column.datalist) : null)
        attrs.id = `${column.sid.Chain}-${column.eid.Chain}`
        attrs.name = column.eid.Camel
        attrs.placeholder = column.placeholder.replace('\\n', '\n')
        //if (!this.#isTextareaOrContenteditable(column.type, attrs) && !['select','file'].some(v=>v===column.type)) { attrs.value = column.value }
        //if (!this.#isContenteditable(attrs) && !['select','file'].some(v=>v===column.type)) { attrs.value = column.value }
        if (!this.#isContenteditable(attrs) && !['select','file'].some(v=>v===column.type)) { attrs.value = column.value.replace('\\n', '\n') }
        if (datalist && ['hidden','password','check','checkbox','radio','button','submit','reset','image'].some(v=>v!==column.type)) { attrs.list = `${attrs.id}-list` }
        const [tagName, att] = this.#elOp(column.type)
        return {tagName:tagName, attrs:{...att, ...attrs}, datalist:datalist}
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
class Tag { // [{name:, attrs:{}, inners:[]},...]    Usage: van.tags[name](attrs, inners)
    /*
    #make(tsv, tag) { return {
        el:this.#makeUi(tsv.type, tsv.label, tsv.value, tag.attrs, tsv.value, tsv.datalist),
        dl:this.#makeDatalist(tag.attrs.list, tsv.type, tsv.datalist),
        lb:this.#makeLabel(tsv.type, tag.attrs.id, tsv.label)
    }}
    #makeUi(type, label, value, attrs, innerText, datalist) {
        const [el, op] = this.#elOp(type)
        attrs = {...op, ...attrs}
        if ('radio'===type) { return this.#makeRadios(attrs, datalist) }
        else if (['check','checkbox'].some(v=>v===type)) { return this.#makeCheckbox(attrs, label) }
        else if (['number','range'].some(v=>v===type)) { return this.#makeNumberOrRange(value, attrs) }
        return van.tags[el](attrs, innerText.replace('\\n', '\n'), this.#makeSelectOptions(el, value, datalist))
    }
    */
    // [el:van.tags[tagName](attrs, inners), dl:van.tags.datalist(), lb:van.tags.label()]
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
            this.#makeSelectOptions(obj.tagName, obj.attrs.value, obj.datalist))
    }
    static #makeRadios(attrs, datalist) {
        console.log('#makeRadios(attrs, datalist):', attrs, datalist)
        const valueLabelObj = JSON.parse(attrs.value)
        return Array.from(Object.entries(valueLabelObj)).map(([k,v])=>{attrs.value=k;return van.tags.label(van.tags.input(attrs), v);})
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
//        attrs.value = v[0]
//        if (1 < v.length) { attrs.min = v[1] }
//        if (2 < v.length) { attrs.max = v[2] }
//        if (3 < v.length) { attrs.step = v[3] }
        return van.tags.input(attrs)
    }
    //#makeDatalist(type, id, values) {
    static #makeDl(type, id, values) {
        console.warn('#makeDatalist()', id, type, values)
        if (!values) { console.warn(`datalistのデータが存在しないので作成を中断しました。`); return null }
        if (!Type.isArray(values)) { console.warn(`datalistのデータが配列でないので作成を中断しました。`); return null }
        if (!['text','search','url','tel','email','number','month','week','date','time','datetime','datetime-local','range','color','password'].some(v=>v===type)) { console.warn(`datalist作成失敗。非対応要素${type}のため。`); return null; }
        return van.tags.datalist({id:id}, values.map(v=>van.tags.option({value:v})))
    }
    static #makeSelectOptions(tagName, value, valueLabelObj) {
        console.log('#makeSelectOptions')
        if ('select'!==tagName) { return null }
        console.log(valueLabelObj)
        return this.#makeOptions(valueLabelObj, value)
    }
    static #makeOptionGroup(label, valueLabelObj, value) { console.log(label, valueLabelObj);return van.tags.optgroup({label:label}, this.#makeOptions(valueLabelObj, value)) }
    //#makeOptions(valueLabelObj, value) { return Array.from(Object.entries(valueLabelObj)).map(([k,v])=>{return ((Type.isStr(v)) ? van.tags.option({value:k, selected:(k===value)}, v) : this.#makeOptionGroup(k, v, value))}) }
    static #makeOptions(valueLabelObj, value) { console.log(valueLabelObj, value); return Array.from(Object.entries(valueLabelObj)).map(([k,v])=>{console.log(k,v,value);return ((Type.isStr(v)) ? van.tags.option({value:k, selected:(k===value)}, v) : this.#makeOptionGroup(k, v, value))}) }
    //#makeLabel(type, id, text) { return van.tags.label(((['radio','check','checkbox'].some(v=>v===type)) ? ({}) : ({for:id})), text) }
    static #makeLb(type, id, text) { return van.tags.label(((['radio','check','checkbox'].some(v=>v===type)) ? ({}) : ({for:id})), text) }
    /*
    #getTagName(column) {

    }
    #getAttrs(column) {

    }
    #getInners(column) {

    }
    */
}
/*
    const columns = Tsv.fromStr('')               // [{sid,name,type,label,placeholder,value,datalist,attrs},...]
    const objs = TsvParser.fromColumns(columns)   // [{tagName:, attrs:{}, detalist:{}},...]
    const doms = Tag.makes(columns, objs)         // [el:van.tags[tagName](attrs, inners), dl:van.tags.datalist(), lb:van.tags.label()]

    const col = columns[i]                        // {sid,name,type,label,placeholder,value,datalist,attrs}
    const obj = objs[i]                           // {tagName:, attrs:{}, detalist:{}
    const dom = Tag.make(col, obj)                // {el:, dl:, lb:}

    obj.attrs.oninput = (e)=>{}

    // UIにイベント処理を実装する
    new SceneMap(tsv)
    new SceneMap(columns, objs)
    SceneMap.get('sid')       // uiMap
    SceneMap.get('sid','eid') // {col:, obj:}
    SceneMap.setAttr('sid','eid','oninput',(e)=>{})
    SceneMap.margeAttrs('sid','eid',{oninput:(e)=>{},style:()=>`display:${disp.val};`))
    // 画面のレイアウトを実装する
    SceneMap.setMake('sid', (uiMap, sid)=>{})
    // 画面のHTML要素を生成する
    SceneMap.make('sid')

    new SceneMakeHelper(SceneMap)
    SceneMakeHelper.setMake(sid, fn) { map.set(sid, fn); }
    fn(sid, uiMap) {
        const els = []
        for (let [eid, v] of uiMap) {
            const [el, dl, lb] = Object.entries(Tag.make(v.col, v.obj)).map(([k,v])=>v)
            const dom = Tag.make(v.col, v.obj)
            els.push(dom.el)
        }
        return div(...els)
    }
*/
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
            //if (!scene.uiMap.has(col.eid)) { scene.uiMap.set(col.eid, {col:col, obj:obj}) }
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
    //setAttr(sid, eid, key, value) { this.get(sid, eid).obj.attrs[key] = value }
    setAttr(sid, eid, key, value) { if (this.has(sid, eid)) { this.get(sid, eid).obj.attrs[key] = value } else { throw new Error(`存在しないキーです。:sid:${sid}, eid:${eid}`) }  }
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
    /*
    #makeTable(uiMap, sid) {
        return van.tags.table({id:sid},
            van.tags.caption(sid),
            uiMap.entries().map(([eid, v])=>{
                const dom=Tag.make(v.col, v.obj)
                return van.tags.tr(van.tags.th(v.col.label), van.tags.td(dom.el, dom.dl))
            })
        )
    }
    */
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
}
class SceneTransitioner {
    constructor(sceneMap) {
        //this._map = sceneMap.get()
        this._map = sceneMap
        this._now = null
        this._mode = {dir:0, loopMethod:0}
        this._seq = new MapSequence(this._map.get(), 0)
        console.log(this._map)
        //this._seq = new Sequence(Array.from(this._map.keys()))
    }
    init(sid) { this.#addAll(sid) }
    #addAll(sid) {
        //console.log(sid, this._meta, this._meta.get(sid))
        van.add(document.body, this._map.makeAll())
        //van.add(document.body, Array.from(this._map).map(([k,v])=>{console.log(k,v);return this._meta.get(k).make(v, k)}))
        this.#hideAll()
        this.select(sid)
    }
    select(sid) {
        //if (!this._map.has(sid)) { sid = this._map.entries().next().value[0] } // sidが未指定なら最初の画面を選択する
        if (!this._map.get().has(sid)) { sid = this._map.get().entries().next().value[0] } // sidが未指定なら最初の画面を選択する
        console.log(`select(): sid=${sid}`)
        this._now = sid
        //this._seq.value = sid
        this._seq.key = sid
        this.#hideAll()
        this.#show(sid)
    }
    move() {
        //const [i, k] = this._seq.next()
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
class Scenes {
    constructor(scenes, makeObj) {
        this._scenes = scenes
        this._meta = new Map()
        this._selected = null
        this._move = {dir:0, loopMethod:0} // dir:(0,正数:asc, 負数:desc), loopMethod(0:headTail, 1:yoyo, 2:stop)
        //this._seq = new Sequence(Array.from(this._scenes.keys()), 0)
        this._seq = new MapSequence(this._scenes, 0)
        console.log(this._scenes)
        //this.#setupMeta()
        if (makeObj) { for (let [sid, fn] of Object.entries(makeObj)) { this.setMake(sid, fn) } }
    }
    get tsv() { return this._gen }
    get gen() { return this._gen }
    get seq() { return this._gen }
    get val() { return this._gen }
}

window.SceneMap = SceneMap
window.SceneMakeHelper = SceneMakeHelper
window.SceneTransitioner = SceneTransitioner
/*
class UiEl {
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
        const tsv = {sid:sid, eid:name, type:type, label:label, placeholder:placeholder, value:value, datalist:_datalist, attrs:_attrs}
        console.log(sid, name, type, label, placeholder, value, _attrs, _datalist)
        console.log(`_attrs:${_attrs}`, ((_attrs) ? 'YES' : 'NO'))
        console.log(`value:${value}`)
        console.log(`_datalist:${_datalist}`, ((_datalist) ? 'YES' : 'NO'))
        const attrs = ((_attrs) ? JSON.parse(_attrs) : ({}))
        const datalist = ((_datalist) ? JSON.parse(_datalist) : null)
        attrs.id = `${sid.Chain}-${name.Chain}`
        attrs.name = name.Camel
        attrs.placeholder = placeholder.replace('\\n', '\n')
        if (!this.#isTextareaOrContenteditable(type, attrs) && !['select','file'].some(v=>v===type)) { attrs.value = value }
        if (datalist && ['hidden','password','check','checkbox','radio','button','submit','reset','image'].some(v=>v!==type)) { attrs.list = `${attrs.id}-list` }
        //if (!scenes.has(sid)) { scenes.set(sid, new Map()) }
        if (!scenes.has(sid)) { scenes.set(sid, {uiMap:new Map(), make:null}) }
        console.log(scenes, scenes.get(sid))
        if (!scenes.get(sid).has(name)) { scenes.get(sid).set(name, ({tsv:tsv, tag:this.#makeTag(), make:this.#make, dom:this.#makeDom()})) }
        //if (!scenes.get(sid).has(name)) { scenes.get(sid).set(name, ({el:this.#makeUi(type, label, value, attrs, value, datalist), dl:this.#makeDatalist(attrs.list, type, datalist), label:this.#makeLabel(type, attrs.id, label)})) }
        return scenes
    }
    #make(tsv, tag) { return {
        el:this.#makeUi(tsv.type, tsv.label, tsv.value, tag.attrs, tsv.value, tsv.datalist),
        dl:this.#makeDatalist(tag.attrs.list, tsv.type, tsv.datalist),
        lb:this.#makeLabel(tsv.type, tag.attrs.id, tsv.label)
    }}
    #makeTag(sid, name, type, label, placeholder, value, datalist, attrs) {
        const [tagName, op] = this.#elOp(type)
        attrs = {...op, ...attrs}
        return {name:tagName, attrs:attrs, inners:this.#makeTagInners()}
        // van.tags[name](attrs, inners)
    }
    #makeTagInners(tagName, value, datalist, attrs) { // selectのみoption, checkbox,radioはlabel内
        //if ('textarea'===tagName || attrs.contenteditable?) { return value.replace('\\n', '\n') }
        if ('textarea'===tagName || attrs.hasOwnProperty('contenteditable')) { return value.replace('\\n', '\n') }
        else if ('select'===tagName) { return this.#makeSelectOptions(el, value, datalist) }
        return []
    }
    #makeDom(sid, name, type, label, placeholder, value, datalist, attrs) {
        return {
            el:this.#makeUi(type, label, value, attrs, value, datalist),
            dl:this.#makeDatalist(attrs.list, type, datalist),
            lb:this.#makeLabel(type, attrs.id, label)
        }
    }
    #makeUi(type, label, value, attrs, innerText, datalist) {
        const [el, op] = this.#elOp(type)
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
    #isNumberOrRange(type) { return ['number','range'].some(v=>v===type) }
    #isTextareaOrContenteditable(type, attrs) {
        if (['area','textarea'].some(v=>v===type)) { return true }
        else if (attrs.hasOwnProperty('contenteditable')) { return attrs.contenteditable }
        return false
    }
    //#isTextarea(type) { return ['area','textarea'].some(v=>v===type) } ;
    #elOp(type) {
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
    #makeNameIsType(type) {
        if (['text','checkbox','radio','color','date','datetime-local','email','file','hidden','month','number','password','range','search','tel','text','time','url','week'].some(v=>v===type)) { return ['input', {type:type}] }
        return null
    }
    #makeButton(type) { return ((['button','submit','reset'].some(v=>v===type)) ? ['button', {type:type}] : null) }
    #makeDatalist(id, type, values) {
        console.warn('#makeDatalist()', id, type, values)
        if (!values) { console.warn(`datalistのデータが存在しないので作成を中断しました。`); return null }
        if (!Type.isArray(values)) { console.warn(`datalistのデータが配列でないので作成を中断しました。`); return null }
        if (!['text','search','url','tel','email','number','month','week','date','time','datetime','datetime-local','range','color','password'].some(v=>v===type)) { console.warn(`datalist作成失敗。非対応要素${type}のため。`); return null; }
        return van.tags.datalist({id:id}, values.map(v=>van.tags.option({value:v})))
    }
    #makeSelectOptions(tagName, value, valueLabelObj) {
        console.log('#makeSelectOptions')
        if ('select'!==tagName) { return null }
        console.log(valueLabelObj)
        return this.#makeOptions(valueLabelObj, value)
    }
    #makeOptionGroup(label, valueLabelObj, value) { console.log(label, valueLabelObj);return van.tags.optgroup({label:label}, this.#makeOptions(valueLabelObj, value)) }
    //#makeOptions(valueLabelObj, value) { return Array.from(Object.entries(valueLabelObj)).map(([k,v])=>{return ((Type.isStr(v)) ? van.tags.option({value:k, selected:(k===value)}, v) : this.#makeOptionGroup(k, v, value))}) }
    #makeOptions(valueLabelObj, value) { console.log(valueLabelObj, value); return Array.from(Object.entries(valueLabelObj)).map(([k,v])=>{console.log(k,v,value);return ((Type.isStr(v)) ? van.tags.option({value:k, selected:(k===value)}, v) : this.#makeOptionGroup(k, v, value))}) }
    #makeLabel(type, id, text) { return van.tags.label(((['radio','check','checkbox'].some(v=>v===type)) ? ({}) : ({for:id})), text) }
}
class Scenes {
    constructor() {
        this._tsv = null
        this._gen = new Generator()
        this._seq = new MapSequence(this.gen.scenes)
        this._val = null
    }
    get tsv() { return this._tsv }
    get gen() { return this._gen }
    get seq() { return this._seq }
    get val() { return this._val }
}
window.Scenes = Scenes;
*/
/*
class Scenes {
    constructor(scenes, makeObj) {
        this._scenes = scenes
        this._meta = new Map()
        this._selected = null
        this._move = {dir:0, loopMethod:0} // dir:(0,正数:asc, 負数:desc), loopMethod(0:headTail, 1:yoyo, 2:stop)
        //this._seq = new Sequence(Array.from(this._scenes.keys()), 0)
        this._seq = new MapSequence(this._scenes, 0)
        console.log(this._scenes)
        this.#setupMeta()
        if (makeObj) { for (let [sid, fn] of Object.entries(makeObj)) { this.setMake(sid, fn) } }
    }
    get tsv() { return this._gen }
    get gen() { return this._gen }
    get seq() { return this._gen }
    get val() { return this._gen }

    #setupMeta() {
        console.log(this._scenes)
        for (let [k,v] of this._scenes) {
            this._meta.set(k, {make:this.makeTable, display:'none'})
        }
    }
    setMake(sid, fn) { this._meta.get(sid).make = fn; }
    makeTable(scene, k) {
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
        //this._seq.value = sid
        this._seq.key = sid
        this.#hideAll()
        this.#show(sid)
    }
    move() {
        //const [i, k] = this._seq.next()
        const [i, k, v] = this._seq.next()
        this.select(k)
    }
    first() { this.select(this._seq.first()[1]) }
    last() { this.select(this._seq.last()[1]) }
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
window.Scenes = new Scenes();
*/
})()
