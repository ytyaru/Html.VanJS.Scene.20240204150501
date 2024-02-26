(function(){
class Tsv {
    get DELIM() { return '\t' }
    load(tsv, hasNotHeader) {
        tsv = tsv.trimLine()
        tsv = ((hasNotHeader) ? tsv : this.#removeHeader(tsv))
        const lines = tsv.split(/\r?\n/)
        return lines.map(line=>this.line(line))
        //return lines.map(line=>line.split(this.DELIM))
    }
    line(line) { return line.split(this.DELIM) }
    countCols(line) { return line.count(this.DELIM) + 1 }
    countLines(tsv) { return line.count('\n') + 1 }
    static #removeHeader(text) { const i=text.indexOf('\n'); return ((-1===i) ? text : text.substr(i+1)); }
}
class SceneMap {
    constructor() {
        this._keys = 'sid,eid,type,label,placeholder,value,datalist,attrs'.split(',')
        this._map = new Map()
        this._tsv = new Tsv()
    }
    loadTsv(tsv, hasNotHeader) {
        const tsv = this._tsv.load(tsv, hasNotHeader)
        for (let line of tsv) { this.add(...line) }
    }
    addElsTsv(sid, tsv) {
        const tsv = this._tsv.load(tsv, hasNotHeader)
        for (let line of tsv) { this.add(sid, ...line) }
    }
    has(sid, eid) {
        if (sid && eid) { return (this._map.has(sid) && this._map.get(sid).uiMap.has(eid)) }
        else if (sid) { return this._map.has(sid) }
        return false
    }
    add(sid, eid, type, label, placeholder, value, datalist, attrs) {
        const col = this.#line(sid, eid, type, label, placeholder, value, datalist, attrs)
        if (this._map.has(sid)) { this._map.get(sid).add(eid, col) }
        //else { this._map.add(sid, new Map([[eid, col]])) }
        else { this._map.add(sid, {uiMap:new Map([[eid, ({col:col})]]), make:SceneMakeHelper.table}) }
    }
    set(sid, eid, type, label, placeholder, value, datalist, attrs) {
        const col = this.#line(sid, eid, type, label, placeholder, value, datalist, attrs)
        if (this._map.has(sid)) { this._map.get(sid).set(eid, col) }
        else { this._map.add(sid, {uiMap:new Map([[eid, ({col:col})]]), make:SceneMakeHelper.table}) }
        //else { this._map.add(sid, new Map([[eid, col]])) }
    }
    get(sid, eid) {
        if (sid && eid) { return this._map.get(sid).get(eid) }
        else if (sid) { return this._map.get(sid) }
        return this._map
    }
    del(sid, eid) {
        if (sid && eid) { return this._map.get(sid).delete(eid) }
        else if (sid) { return this._map.delete(sid) }
        return this._map.clear()
    }
    clear() { this._map.clear() }
    #line(sid, eid, type, label, placeholder, value, datalist, attrs) {
        if (eid===undefined) {
                 if (Type.isAry(sid)) { return this.#array(sid) }
            else if (Type.isStr(sid)) { return this.#string(sid) }
            else if (Type.isObj(sid)) { return this.#object(sid) }
        }
        if (undefined!==sid && undefined!==eid && undefined!==type && undefined!==label && undefined!==placeholder && undefined!==value && undefined!==datalist && undefined!==attrs) {
            return {sid:sid, eid:eid:, type:type, label:label, placeholder:placeholder, value:value, datalist:datalist, attrs:attrs}
        }
        throw new Error(`入力値不足により中断します。UIを追加するとき引数値は${this._keys.length}個必要です。その内容と順序は${this._keys}です。型は文字列、配列、オブジェクト、関数引数のいずれかです。しかし与えられた引数には不足があるようです。その内容は ${sid}, ${eid}, ${type}, ${label}, ${playceholder}, ${value}, ${datalist}, ${attrs} でした。`)
    }
    #string(str) {
        const count = this._tsv.countCols(str)
        if (count < this._keys.length) { throw new Error(`入力値不足により中断します。文字列型をセットするとき、要素数は${this._keys.length}個必要です。要素を区切る文字はTabです。しかし与えられた値にはTabが${count}個しかありませんでした。その内容は ${str} でした。`) }
        return this.#array(this._tsv.line(str))
    }
    #array(ary) {
        if (ary.length < this._keys.length) { throw new Error(`入力値不足により中断します。配列型をセットするとき、要素数は${this._keys.length}個必要です。その内容と順序は ${this._keys} です。しかし与えられた値は${ary.length}個しかありませんでした。その内容は ${ary} でした。`) }
        return this._keys.reduce((obj, k, i) => { obj[k] = ary[i]; return obj; }, {})
    }
    #object(obj) {
        for (let k of this._keys) {
            if (!obj.hasOwnProperty(k)) { throw new Error(`入力値不足により中断します。オブジェクト型をセットするとき、次のプロパティキーを持っているべきです。${this._keys}。しかし与えられた値には ${k} がありませんでした。その内容は ${obj} でした。`) }
        }
        return obj
    }
}
class SceneMakeHelper {
    static table(uiMap, sid) {
        return van.tags.table({id:sid},
            van.tags.caption(sid),
            Array.from(uiMap.entries()).map(([eid, v])=>{
                if (!v.hasOwnProperty('dom')) { v.dom = Tag.make(v.col, v.obj) }
                return van.tags.tr(van.tags.th(v.col.label), van.tags.td(v.dom.el, v.dom.dl))
            })
        )
    }
    static tag(col, obj) { return Tag.make(col, obj) }
}

/*
const maker = new UiMaker()
maker.Tsv.load(tsv)
maker.Tsv.add(),set(),get(),del()
maker.makeTags()
const scene = new Scene(maker)
scene.setAttr(sid, eid, key, value)
scene.mergeAttrs(sid, eid, {key:val, key:val})
scene.addChild(sid, eid, child)
maker.makeDoms()
scene.setMake(sid, (uiMap, sid)=>{    // コールバック関数の直前であるsetMakeの内部で maker.makeDoms() する
    const uiObj = uiMap.get(eid)
    uiObj.dom.el
    uiObj.dom.dl
    uiObj.dom.lb
    return van.tags.div()
})
scene.addBody()
*/
/*
const maker = new UiMaker()
maker.Tsv.load(tsv)
maker.Tsv.add(),set(),get(),del()
maker.makeTags()
maker.setAttr(sid, eid, key, value)
maker.mergeAttrs(sid, eid, {key:val, key:val})
maker.addChild(sid, eid, child)
maker.setMake(sid, (uiMap, sid)=>{    // コールバック関数の直前であるsetMakeの内部で maker.makeDoms() する
    const uiObj = uiMap.get(eid)
    uiObj.dom.el
    uiObj.dom.dl
    uiObj.dom.lb
    return van.tags.div()
})
maker.addBody()

*/
class UiMaker {
    constructor() {
        this._map = new SceneMap()
        this._parsers = new TsvTypeParsers()
    }
    get Map() { return this._map }
    get Parsers() { return this._parsers }
    load(tsv, hasNotHeader) { this._map.loadTsv(tsv, hasNotHeader) }
    make() {
        for (let [sid, uiMap] of this._tsv.get()) {
            for (let [eid, uiObj] of uiMap) {
                const obj = this._tsv.get(sid, eid)
                obj.parser = this._parsers.get(obj.col.type)
                obj.tag = obj.parser.makeTag(obj.col, this._parsers.makeTag(obj.col))
                obj.dom = {el:obj.parser.makeEl(col,tag), dl:obj.parser.makeDl(col,tag), lb:obj.parser.makeLb(col,tag)}
                // obj(uiObj) {col:,parser:,tag:,dom:}
                /*
                //this.makeTag(sid, eid)
                //this.makeDom(sid, eid)
                const obj = this._tsv.get(sid, eid)
                const parser = this._parsers.get(obj.col.type)
                const tag = parser.makeTag(obj.col, this._parsers.makeTag(obj.col))
                obj.parser = parser
                obj.tag = tag
                obj.dom = {el:obj.parser.makeEl(col,tag), dl:obj.parser.makeDl(col,tag), lb:obj.parser.makeLb(col,tag)}
                //this._tsv.set(sid, eid, {...obj, parser:parser, tag:tag, dom:dom})
                */
            }
        }
    }
    makeTags() {
        for (let [sid, uiMap] of this._tsv.get()) {
            for (let [eid, uiObj] of uiMap) {
                const obj = this._tsv.get(sid, eid)
                obj.parser = this._parsers.get(obj.col.type)
                obj.tag = obj.parser.makeTag(obj.col, this._parsers.makeTag(obj.col))
                obj.dom = {el:obj.parser.makeEl(col,tag), dl:obj.parser.makeDl(col,tag), lb:obj.parser.makeLb(col,tag)}
                //this._tsv.set(sid, eid, {...obj, parser:parser, tag:tag, dom:dom})
                // obj(uiObj) = {col:,parser:,tag:,dom:}
            }
        }
    }
    makeDoms() {
        for (let [sid, uiMap] of this._tsv.get()) {
            for (let [eid, uiObj] of uiMap) {
                const obj = this._tsv.get(sid, eid)
                if (!obj.hasOwnProperty('parser') || !obj.hasOwnProperty('tag')) { this.makeTag(sid, eid) }
                obj.dom = {el:obj.parser.makeEl(col,tag), dl:obj.parser.makeDl(col,tag), lb:obj.parser.makeLb(col,tag)}
                //this._tsv.set(sid, eid, {...obj, parser:parser, tag:tag, dom:dom})
                // obj(uiObj) = {col:,parser:,tag:,dom:}
            }
        }
    }
    makeTag(sid, eid) {
        const obj = this._tsv.get(sid, eid)
        const parser = this._parsers.get(obj.col.type)
        const tag = parser.makeTag(obj.col, this._parsers.makeTag(obj.col))
        obj.parser = parser
        obj.tag = tag
        //this._tsv.set(sid, eid, {...obj, parser:parser, tag:tag})
        // {col:, tag:, parser:, dom:}
        return obj
    }
    makeDom(sid, eid) {
        const obj = this._tsv.get(sid, eid)
        if (!obj.hasOwnProperty('parser') || !obj.hasOwnProperty('tag')) { this.makeTag(sid, eid) }
        obj.dom = {el:obj.parser.makeEl(col,tag), dl:obj.parser.makeDl(col,tag), lb:obj.parser.makeLb(col,tag)}
        return obj
    }
    setAttr(sid, eid, key, value) { if (this._map.has(sid, eid)) { this._map.get(sid, eid).tag.attrs[key] = value } else { throw new Error(`存在しないキーです。:sid:${sid}, eid:${eid}`) }  }
    //addChild(sid, eid, value) { if (this._tsv.has(sid, eid)) { if (Type.isAry(this.get(sid, eid).tag.children)) {this.get(sid, eid).tag.children=[]} this.get(sid, eid).tag.children.push(value) } else { throw new Error(`存在しないキーです。:sid:${sid}, eid:${eid}`) } } 
    addChild(sid, eid, value) { if (this._map.has(sid, eid)) { this._map.get(sid, eid).tag.children.push(value) } else { throw new Error(`存在しないキーです。:sid:${sid}, eid:${eid}`) } } 
    margeAttrs(sid, eid, attrs) { this._map.get(sid, eid).tag.attrs[key] = ({...this._map.get(sid, eid).obj.attrs[key], ...attrs}) }
    setMake(sid, fn) { this._map.get(sid).make = fn }
}
class TsvTypeParsers {
    constructor() {
        this._parsers = []
    }
    //add(type) { if (type instanceof TsvUiType) { this._parsers.push(type) } }
    add(parser) {
        if (parser instanceof TsvUiType) {
            const types = this._parsers.filter(t=>t.match(parser.types))
            if (0 < types.length) { throw new Error('重複エラー。引数は既存TsvUiTypeのtype名と重複します。') }
            this._parsers.push(parser)
        } else { throw new Error(`型エラー。引数はTsvUiType型であるべきです。`) }
    }
    get(type) {
        const parsers = this._parsers.filter(p=>p.match(type))
        if      (1===parsers.length) { return parsers[0] }
        else if (0===parsers.length) { return null }
        else { throw new Error(`論理エラー。一意であるべきなのに複数あります。`) }
    }
    makeTag(column) {
        const parser = this.get(column.type)
        const tag = parser.getTag(column.type)
        if (!Type.isObj(tag)) { throw new Error(`parser.fromType(type)はオブジェクト型を返すべきです。:${typeof tag}: ${obj}`) }
        tag.datalist = ((column.datalist) ? JSON.parse(column.datalist) : null)
        tag.attrs = ((column.attrs) ? JSON.parse(column.attrs) : ({}))
        tag.attrs.id = `${column.sid.Chain}-${column.eid.Chain}`
        tag.attrs.name = column.eid.Camel
        tag.attrs.placeholder = column.placeholder.replace(/\\n/g, '\n')
        tag.attrs['data-sid'] = column.sid.Chain
        tag.attrs['data-eid'] = column.eid.Chain
        this.#setValue(tag, parser)
        if (tag.hasOwnProperty('children')) { tag.children = [] }
        return parser.makeTag(column, tag)
    }
    #setValue(tag, parser) {
        if ('input'===tagName && 'file'===attrs.type || UiParser.ValueKinds.None===parser.valueKind) { return }
        else if (this.#isButton(tag.tagName, tag.attrs) || UiParser.ValueKinds.ButtonLike===parser.valueKind) { tag.attrs.value = this.#newLine((column.value || column.label || '')) }
        else if (attrs.hasOwnProperty('contenteditable') || UiParser.ValueKinds.Children===parser.valueKind) { tag.children = this.#newLine(column.value) }
        tag.attrs.value = this.#newLine(column.value)
    }
    #isButton(tagName, attrs) { return ('button'===tagName || ('input'===tagName && 'button,submit,reset,image'.split(',').some(a=>a===attrs.type))) }
    #newLine(str) { return str.replace(/\\n/g, '\n') }
    makeEl(col, tag) {
        const parser = this.get(col.type)
        return parser.makeEl(col, tag)
    }
}
/*
class Tag {
    make(column) {
        const attrs = ((column.attrs) ? JSON.parse(column.attrs) : ({}))
        const datalist = ((column.datalist) ? JSON.parse(column.datalist) : null)
        attrs.id = `${column.sid.Chain}-${column.eid.Chain}`
        attrs.name = column.eid.Camel
        attrs.placeholder = column.placeholder.replace(/\\n/g, '\n')
        if (!this.#isContenteditable(attrs) && !['select','file'].some(v=>v===column.type)) { attrs.value = column.value.replace(/\\n/g, '\n') }
        if ('button'===column.type) {
            //el.innerText = ((col.value) ? col.value : ((col.label) ? col.label : ''))
            attrs.value = ((column.value) ? column.value : ((column.label) ? column.label : ((attrs.hasOwnProperty('value')) ? attrs.value : '')))
        }
        if (datalist && ['hidden','password','check','checkbox','radio','button','submit','reset','image'].some(v=>v!==column.type)) { attrs.list = `${attrs.id}-list` }
        console.log(attrs.dataset)
        attrs['data-sid'] = column.sid.Chain
        attrs['data-eid'] = column.eid.Chain

        return {tagName:, attrs:, datalist:, children}
    }
}
class El {
    make(col, tag) {

    }
}
*/

class UiParser {
    static ValueKinds = {
        'None': 0,
        'Attr': 1,
        'ButtonLike': 2,
        'Children': 3,
    }
    constructor() {
        this.valueKinds = UiParser.ValueKinds.Attr
//        this.isButtonValue = false
//        this.isTextValue = false
    }
    /*
    match(type) {
        if (Type.isStr(type)) { return 'text'===type }
        else if (Type.isStrs(type)) { return type.some(t=>t==='text') }
        throw new Error(`引数typeは文字列または文字列の配列であるべきです。:${typeof type}: ${type}`)
    }
    match(type, v) {
        if (Type.isStr(type)) { return 'text'===type }
        else if (Type.isStrs(type)) { return type.some(t=>t==='text') }
        throw new Error(`引数typeは文字列または文字列の配列であるべきです。:${typeof type}: ${type}`)
    }
    */
    match(type, v) {
             if (Type.isStr (type) && Type.isStr (v)) { return v===type }
        else if (Type.isStr (type) && Type.isStrs(v)) { return v.map(_=>_===type) }
        else if (Type.isStrs(type) && Type.isStr (v)) { return type.some(t=>t===v) }
        else if (Type.isStrs(type) && Type.isStrs(v)) {
            for (let typ of type) {
                for (let _ of v) {
                    if (_===typ) { return true }
                }
            }
            return false
        }
        throw new Error(`引数typeは文字列または文字列の配列であるべきです。:${typeof type}: ${type}`)
    }
    getTag(type) { return {tagName:'input', attrs:{type:'text'}} }
    makeTag(col, tag) { return tag }
    makeEl(col, tag) {
        const el = document.createElement(tag.tagName)
        for (let [k,v] of Object.entries(tag.attrs)) {
            if (el.hasOwnProperty(k)) { el[k] = v }
            else { el.setAttribute(k, v) }
        }
        return el
    }
    makeDl(col, tag) {
        console.warn('#makeDatalist()', id, type, values)
        if (!tag.datalist) { console.warn(`datalistのデータが存在しないので作成を中断しました。`); return null }
        if (!Type.isArray(tag.datalist)) { console.warn(`datalistのデータが配列でないので作成を中断しました。`); return null }
        if (('input'===tag.tagName && ['text','search','url','tel','email','number','month','week','date','time','datetime','datetime-local','range','color','password'].some(v=>v===tag.attrs.type))) { console.warn(`datalist作成失敗。非対応要素<input type="${type}">のため。`); return null; }
        return van.tags.datalist({id:tag.attrs.list}, tag.datalist.map(v=>van.tags.option({value:v})))
        //return van.tags.datalist({id:id}, values.map(v=>van.tags.option({value:v})))
    }
    //makeLb(type, id, text) { return van.tags.label(((['radio','check','checkbox'].some(v=>v===type)) ? ({}) : ({for:id})), text) }
    makeLb(col, tag) {
        const attrs = (('input'===tag.tagName && ['radio','checkbox'].some(v=>v===tag.attrs.type)) ? ({}) : ({for:tag.attrs.id}))
        return van.tags.label(attrs, col.label)
    }
}
/*
UiParser.ValueKinds.None
UiParser.ValueKinds.Attr
UiParser.ValueKinds.ButtonLike
UiParser.ValueKinds.Children
Object.defineProperty(UiParser, 'ValueKinds', {
    value: {
        'None': 0,
        'Attr': 1,
        'ButtonLike': 2,
        'Children': 3,
    },
    writable: false,
});
*/
class UrlParser extends UiParser {
    constructor() { super() }
    match(type, v) { return super.match(type, 'url') }
    getTag(type) { return {tagName:'input', attrs:{type:'url'}} }
}
class SearchParser extends UiParser {
    constructor() { super() }
    match(type, v) { return super.match(type, 'search') }
    getTag(type) { return {tagName:'input', attrs:{type:'search'}} }
}
class TelParser extends UiParser {
    constructor() { super() }
    match(type, v) { return super.match(type, 'tel') }
    getTag(type) { return {tagName:'input', attrs:{type:'tel'}} }
}
class TelParser extends UiParser {
    constructor() { super() }
    match(type, v) { return super.match(type, 'password') }
    getTag(type) { return {tagName:'input', attrs:{type:'password'}} }
}
class NumberParser extends UiParser {
    constructor() { super() }
    match(type, v) { return super.match(type, 'number') }
    getTag(type) { return {tagName:'input', attrs:{type:'number'}} }
    makeTag(col, tag) {
        const tag = super.makeTag(col, tag)
        const [value, min, max, step] = col.value.split(',')
        const vals = JSON.stringify({value, min, max, step})
        for (let attr of ['value','min','max','step']) {
            const n = Number(vals[attr])
            if (!isNaN(n)) { tag.attrs[attr] = n }
        }
        return tag
    }
}
class RangeParser extends NumberParser {
    constructor() { super() }
    match(type, v) { return super.match(type, 'range') }
    getTag(type) { return {tagName:'input', attrs:{type:'range'}} }
}
class DateTimeParser extends UiParser {
    constructor() { super() }
    match(type, v) { return super.match(type, ['datetime-local','datetime']) }
    getTag(type) { return {tagName:'input', attrs:{type:'datetime-local'}} }
}
class DateParser extends UiParser {
    constructor() { super() }
    match(type, v) { return super.match(type, 'date') }
    getTag(type) { return {tagName:'input', attrs:{type:'date'}} }
}
class TimeParser extends UiParser {
    constructor() { super() }
    match(type, v) { return super.match(type, 'time') }
    getTag(type) { return {tagName:'input', attrs:{type:'time'}} }
}
class MonthParser extends UiParser {
    constructor() { super() }
    match(type, v) { return super.match(type, 'month') }
    getTag(type) { return {tagName:'input', attrs:{type:'month'}} }
}
class WeekParser extends UiParser {
    constructor() { super() }
    match(type, v) { return super.match(type, 'week') }
    getTag(type) { return {tagName:'input', attrs:{type:'week'}} }
}
class ColorParser extends UiParser {
    constructor() { super() }
    match(type, v) { return super.match(type, 'color') }
    getTag(type) { return {tagName:'input', attrs:{type:'color'}} }
}
class FileParser extends UiParser {
    constructor() { super() }
    match(type, v) { return super.match(type, 'file') }
    getTag(type) { return {tagName:'input', attrs:{type:'file'}} }
}
class RadioParser extends UiParser {
    constructor() { super() }
    match(type, v) { return super.match(type, 'radio') }
    getTag(type) { return {tagName:'input', attrs:{type:'radio'}} }
    makeEl(col, tag) {
        const valueLabelObj = JSON.parse(col.datalist)
        // [<label><input>]
        // attrsを共用する。複数のラジオボタンで。けどそれは困るのでディープコピーした。
        //return Array.from(Object.entries(values)).map(([k,v])=>{const att=JSON.parse(JSON.stringify(attrs));console.log(k,v,att.id);att.value=k;att.id+='-'+k.Chain;return van.tags.label(van.tags.input(att), v);})
        return Array.from(Object.entries(values)).map(([k,v])=>{const att=JSON.parse(JSON.stringify(attrs));console.log(k,v,att.id);att.value=k;att.id+='-'+k.Chain;att.checked=(col.value===k);return van.tags.label(van.tags.input(att), v);})
    }
}
class CheckboxParser extends UiParser {
    constructor() { super() }
    match(type, v) { return super.match(type, ['checkbox', 'check']) }
    getTag(type) { return {tagName:'input', attrs:{type:'checkbox'}} }
    makeEl(col, tag) {
        tag.attrs.checked = ['true','1','checked'].some(v=>v===attrs.value)
        tag.attrs.value = null
        return van.tags.label(van.tags.input(attrs), label)
    }
}



class SelectParser extends UiParser {
    constructor() { super() }
    match(type, v) { return super.match(type, 'select') }
    getTag(type) { return {tagName:'select', attrs:{}} }
    makeEl(col, tag) {
        const el = super.makeEl(col, tag)
        if (!Type.isObj(tag.datalist)) { console.warn(`select要素のoption要素作成を中断します。datalistがObject型でなかったためです。値は次のようにしてください。:{"opt-val":"label-1", "optgroup-label-2":{"opt-val":"label-2-1"}}`); return }
        el.appendChild(this.#makeOptions(tag.datalist, col.value))
        return el
    }
    #makeOptionGroup(label, valueLabelObj, value) { console.log(label, valueLabelObj);return van.tags.optgroup({label:label}, this.#makeOptions(valueLabelObj, value)) }
    #makeOptions(valueLabelObj, value) { console.log(valueLabelObj, value); return Array.from(Object.entries(valueLabelObj)).map(([k,v])=>{console.log(k,v,value);return ((Type.isStr(v)) ? van.tags.option({value:k, selected:(k===value)}, v) : this.#makeOptionGroup(k, v, value))}) }
}
class ButtonParser extends UiParser {
    constructor() { super() }
    match(type, v) { return super.match(type, 'button') }
    getTag(type) { return {tagName:'button', attrs:{type:'button'}} }
}
class SubmitButtonParser extends UiParser {
    constructor() { super() }
    match(type, v) { return super.match(type, 'submit') }
    getTag(type) { return {tagName:'button', attrs:{type:'submit'}} }
}
class ResetButtonParser extends UiParser {
    constructor() { super() }
    match(type, v) { return super.match(type, 'reset') }
    getTag(type) { return {tagName:'button', attrs:{type:'reset'}} }
}
class ImageButtonParser extends UiParser {
    constructor() { super() }
    match(type, v) { return super.match(type, 'image') }
    getTag(type) { return {tagName:'button', attrs:{}} }
    makeTag(col, tag) {
        const tag = super.makeTag(col, tag)
        tag.children
    }
    makeEl(col, tag) {
        const el = super.makeEl(col, tag)
        const img = document.createElement('img')
        img.src = tag.attrs.value
        el.appendChild(img)
        return el
    }
}


class TextareaParser extends UiParser {
    constructor() { super() }
    match(type, v) { return super.match(type, 'textarea') }
    getTag(type) { return {tagName:'textarea', attrs:{}} }
}


class VanButtonParser extends UiParser {
    constructor() { this.super(); this.valueKinds = UiParser.ValueKinds.ButtonLike; }
    match(type, v) { return super.match(type, 'van-button') }
    getTag(type) { return {tagName:'van-button', attrs:{}} }
    makeTag(col, tag) {
        const tag = super.makeTag(col, tag) // JSON.parse()では関数型に変換できないので以下処理を行う（onpush,onhold）
        tag.attrs.value = this.#newLine((column.value || column.label || ''))
        for (let [key, type] of Object.entries(HTMLVanButtonElement.ATTRS)) {
            if (!tag.attrs.hasOwnProperty(key)) { continue }
            obj.attrs[key] = Type.to(type, tag.attrs[key])
        }
        return tag
    }
    make(col, tag) { // UiParser.make(col,tag)では
        const el = document.createElement('van-button')
        const ATTRS = Array.from(Object.entries(tag.attrs))
        const KEYS = Array.from(Object.keys(tag.attrs))
        console.log(col, tag, Object.keys(tag.attrs))
        for (let [k,type] of ATTRS) {
            if (KEYS.some(a=>a===k)) { el[((-1===k.indexOf('-')) ? k : k.Camel)] = tag.attrs[k] }
            else { el.setAttribute(k, tag.attrs[k]) }
        }
        el.innerText = ((col.value) ? col.value : ((col.label) ? col.label : ''))
        console.log(el)
        return el
    }
}


class UiMaker {
    constructor() {

    }
    load(tsv, isDelHead) {

    }
}
window.UiMaker = UiMaker
})()
