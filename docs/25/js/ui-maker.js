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
    #removeHeader(text) { const i=text.indexOf('\n'); return ((-1===i) ? text : text.substr(i+1)); }
}
class _TsvHeader {
    get(lang='en', isLong=false) { return (('ja'===lang) ? this.getJa(isLong) : this.getEn(isLong)) }
    getEn(isLong=false) {
        if (isLong) { return ['sceneId','elementId','type','label','placeholder','value,min,max,step','datalist','attributes'].join('\t') }
        return ['sid','eid','type','label','placeholder','value','datalist','attrs'].join('\t')
    }
    getJa(isLong=false) {
        if (isLong) { return ['画面ID','要素ID','型','ラベル','プレースホルダ','値,最小値,最大値,刻値','データリスト','他属性'].join('\t') }
        return ['画面ID','要素ID','型','ラベル','プレースホルダ','値','データリスト','他属性'].join('\t')
    }
}
const TsvHeader = new _TsvHeader()

class TsvSample {
//    constructor() { this._header = new TsvHeader() }
//    get header() { return this._header }
    get header() { return TsvHeader }
//    get(lang='en', isLong=false) { return this._header.get(lang,isLong) + `
    get(lang='en', isLong=false) { return TsvHeader.get(lang,isLong) + `
dl-ex	description	textarea	説明	説明。		["候補１(無効)","候補２(無効)"]	
dl-ex	category	select	カテゴリ		key2	{"key1":"label-1", "groupValue":{"key2":"label-2"}}	
dl-ex	title	text	タイトル	表題		["候補１","候補２"]	
dl-ex	search	search	検索	検索キーワード		["候補１","候補２"]	
dl-ex	url	url	URL	https://domain.com/		["候補１","候補２"]	
dl-ex	tel	tel	電話番号	00000000000		["候補１","候補２"]	
dl-ex	password	password	パスワード	見せられないよ！		["候補１(無効)","候補２(無効)"]	
dl-ex	even	number	偶数	0	0,0,100,2	[0,25,50,75,100]	
dl-ex	odd	range	奇数	0	0,1,99,2	[1,24,49,74,99]	
dl-ex	datetime	datetime	日時			["1999-12-31T23:59:59","2000-01-01T00:00:00"]	
dl-ex	date	date	日付			["1999-12-31","2000-01-01"]	
dl-ex	month	month	月			["1999-12","2000-01"]	
dl-ex	week	week	週			["1999-W52","2000-W01"]	
dl-ex	time	time	時刻			["00:00","23:59"]	
dl-ex	color	color	色			["#ff0000","#00ff00","#0000ff"]	
dl-ex	file	file	ファイル			["候補１(無効)","候補２(無効)"]	
dl-ex	sex	radio	性別		{"male":"男", "female":"女"}		
dl-ex	isMan	check	人間か		true		
dl-ex	editor	div	エディタ				{"tabindex":0, "contenteditable":true}
dl-ex	viewer	div	ビューア				{"tabindex":0}
dl-ex	save	button			JSONファイルダウンロード		
    `}
}
class SceneMap {
    constructor() {
        //this._keys = 'sid,eid,type,label,placeholder,value,datalist,attrs'.split(',')
        //this._keys = TsvHeader.get().split('\t').join(',')
        this._map = new Map()
        this._tsv = new Tsv()
        this._keys = this._tsv.line(TsvHeader.get())
    }
    loadTsv(tsv, hasNotHeader) {
        tsv = this._tsv.load(tsv, hasNotHeader)
        for (let line of tsv) { this.add(...line) }
    }
    addElsTsv(sid, tsv) {
        tsv = this._tsv.load(tsv, hasNotHeader)
        for (let line of tsv) { this.add(sid, ...line) }
    }
    has(sid, eid) {
        if (sid && eid) { return (this._map.has(sid) && this._map.get(sid).uiMap.has(eid)) }
        else if (sid) { return this._map.has(sid) }
        return false
    }
    add(sid, eid, type, label, placeholder, value, datalist, attrs) {
        const col = this.#line(sid, eid, type, label, placeholder, value, datalist, attrs)
        if (this._map.has(sid)) { this._map.get(sid).uiMap.set(eid, {col:col}) }
        //if (this._map.has(sid)) { this._map.get(sid).uiMap.set(eid, col) }
        //else { this._map.add(sid, new Map([[eid, col]])) }
        else { this._map.set(sid, {uiMap:new Map([[eid, ({col:col})]]), make:SceneMakeHelper.table}) }
    }
    set(sid, eid, type, label, placeholder, value, datalist, attrs) {
        const col = this.#line(sid, eid, type, label, placeholder, value, datalist, attrs)
        if (this._map.has(sid)) { this._map.get(sid).uiMap.set(eid, {col:col}) }
        //if (this._map.has(sid)) { this._map.get(sid).uiMap.set(eid, col) }
        else { this._map.add(sid, {uiMap:new Map([[eid, ({col:col})]]), make:SceneMakeHelper.table}) }
        //else { this._map.add(sid, new Map([[eid, col]])) }
    }
    get(sid, eid) {
        if (sid && eid) { return this._map.get(sid).uiMap.get(eid) }
        else if (sid) { return this._map.get(sid) }
        return this._map
    }
    del(sid, eid) {
        if (sid && eid) { return this._map.get(sid).uiMap.delete(eid) }
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
            return {sid:sid, eid:eid, type:type, label:label, placeholder:placeholder, value:value, datalist:datalist, attrs:attrs}
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
    /*
    setAttr(sid, eid, key, value) { if (this._map.has(sid, eid)) { this.get(sid, eid).tag.attrs[key] = value } else { throw new Error(`存在しないキーです。:sid:${sid}, eid:${eid}`) }  }
    //addChild(sid, eid, value) { if (this._tsv.has(sid, eid)) { if (Type.isAry(this.get(sid, eid).tag.children)) {this.get(sid, eid).tag.children=[]} this.get(sid, eid).tag.children.push(value) } else { throw new Error(`存在しないキーです。:sid:${sid}, eid:${eid}`) } } 
    addChild(sid, eid, value) { if (this.has(sid, eid)) { this.get(sid, eid).tag.children.push(value) } else { throw new Error(`存在しないキーです。:sid:${sid}, eid:${eid}`) } } 
    margeAttrs(sid, eid, attrs) { this.get(sid, eid).tag.attrs[key] = ({...this._map.get(sid, eid).obj.attrs[key], ...attrs}) }
    setMake(sid, fn) { this.get(sid).make = fn }
    */
}
/*
class TsvTypeParsers {
    constructor() {
        this._parsers = []
        this.#addDefaultParser()
    }
}
*/
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
//    static tag(col, obj) { return Tag.make(col, obj) }
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
    constructor(map) {
        this._map = map // new SceneMap()
        this._parsers = new TsvTypeParsers()
    }
//    get Map() { return this._map }
    get Parsers() { return this._parsers }
    load(tsv, hasNotHeader) { this._map.loadTsv(tsv, hasNotHeader) }
    make() {
        for (let [sid, uiMap] of this._map.get()) {
            for (let [eid, uiObj] of uiMap) {
                const obj = this._map.get(sid, eid)
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
        for (let [sid, s] of this._map.get()) {
            for (let [eid, uiObj] of s.uiMap) {
                const obj = this._map.get(sid, eid)
                console.log(obj)
                obj.parser = this._parsers.get(obj.col.type)
                console.log(obj, this._parsers, obj.col.type, this._parsers.get(obj.col.type))
                obj.tag = obj.parser.makeTag(obj.col, this._parsers.makeTag(obj.col))
                /*
                obj.dom = {
                    el: obj.parser.makeEl(obj.col,obj.tag), 
                    dl: obj.parser.makeDl(obj.col,obj.tag), 
                    lb: obj.parser.makeLb(obj.col,obj.tag)
                }
                */
                //this._tsv.set(sid, eid, {...obj, parser:parser, tag:tag, dom:dom})
                // obj(uiObj) = {col:,parser:,tag:,dom:}
            }
        }
    }
    makeDoms() {
        for (let [sid, s] of this._map.get()) {
            for (let [eid, uiObj] of s.uiMap) {
                const obj = this._map.get(sid, eid)
                if (!obj.hasOwnProperty('parser') || !obj.hasOwnProperty('tag')) { this.makeTag(sid, eid) }
                obj.dom = {el:obj.parser.makeEl(col,tag), dl:obj.parser.makeDl(col,tag), lb:obj.parser.makeLb(col,tag)}
                //this._tsv.set(sid, eid, {...obj, parser:parser, tag:tag, dom:dom})
                // obj(uiObj) = {col:,parser:,tag:,dom:}
            }
        }
    }
    makeTag(sid, eid) {
        console.log(sid, eid)
        const obj = this._map.get(sid, eid)
        console.log(obj)
        const parser = this._parsers.get(obj.col.type)
        const tag = parser.makeTag(obj.col, this._parsers.makeTag(obj.col))
        obj.parser = parser
        obj.tag = tag
        //this._tsv.set(sid, eid, {...obj, parser:parser, tag:tag})
        // {col:, tag:, parser:, dom:}
        return obj
    }
    makeDom(sid, eid) {
        const obj = this._map.get(sid, eid)
        if (!obj.hasOwnProperty('parser') || !obj.hasOwnProperty('tag')) { this.makeTag(sid, eid) }
        obj.dom = {
            el: obj.parser.makeEl(obj.col, obj.tag), 
            dl: obj.parser.makeDl(obj.col, obj.tag), 
            lb: obj.parser.makeLb(obj.col, obj.tag),
        }
        return obj
    }
    /*
    setAttr(sid, eid, key, value) { if (this._map.has(sid, eid)) { this._map.get(sid, eid).tag.attrs[key] = value } else { throw new Error(`存在しないキーです。:sid:${sid}, eid:${eid}`) }  }
    //addChild(sid, eid, value) { if (this._tsv.has(sid, eid)) { if (Type.isAry(this.get(sid, eid).tag.children)) {this.get(sid, eid).tag.children=[]} this.get(sid, eid).tag.children.push(value) } else { throw new Error(`存在しないキーです。:sid:${sid}, eid:${eid}`) } } 
    addChild(sid, eid, value) { if (this._map.has(sid, eid)) { this._map.get(sid, eid).tag.children.push(value) } else { throw new Error(`存在しないキーです。:sid:${sid}, eid:${eid}`) } } 
    margeAttrs(sid, eid, attrs) { this._map.get(sid, eid).tag.attrs[key] = ({...this._map.get(sid, eid).obj.attrs[key], ...attrs}) }
    setMake(sid, fn) { this._map.get(sid).make = fn }
    */
}
class TsvTypeParsers {
    constructor() {
        this._parsers = []
        this.#addDefaultParser()
    }
    #addDefaultParser() {
        this.add(new TextParser())
        this.add(new UrlParser())
        this.add(new SearchParser())
        this.add(new TelParser())
        this.add(new PasswordParser())
        this.add(new NumberParser())
        this.add(new RangeParser())
        this.add(new DateTimeParser())
        this.add(new DateParser())
        this.add(new TimeParser())
        this.add(new MonthParser())
        this.add(new WeekParser())
        this.add(new ColorParser())
        this.add(new FileParser())
        this.add(new RadioParser())
        this.add(new CheckboxParser())
        this.add(new ButtonParser())
        this.add(new SubmitButtonParser())
        this.add(new ResetButtonParser())
        this.add(new ImageButtonParser())
        this.add(new SelectParser())
        this.add(new TextareaParser())
    }
    //add(type) { if (type instanceof TsvUiType) { this._parsers.push(type) } }
    //#matchParse() { return this._parsers.filter(p=>p.match(parser.types)) }
    //#matchParser(type) { return this._parsers.filter(p=>p.match(type)) }
    #matchParser(types) { return this._parsers.filter(p=>p.match(type)) }
    /*
    #matchParse(type) {
        const ps = this._parsers.filter(p=>p.match(type))
        if ()
        return ps[0]
    }
    */
    add(parser) {
        console.log(parser.constructor.name, ':', parser instanceof UiParser)
        if (parser instanceof UiParser) {
//            const types = this._parsers.filter(p=>p.match(parser.types))
//            const parsers = this.#matchParser()
            console.log(this._parsers)
            const parsers = this._parsers.filter(p=>p.match(parser.types))
            console.log(parsers, parser.types, parser)
            if (0 < parsers.length) { throw new Error(`重複エラー。引数は既存TsvUiTypeのtype名と重複します。: ${parsers.types}`) }
            else if (1 < parsers.length) { throw new Error(`重複エラー。すでに重複したパーサがあります。: ${parsers.length} : ${parsers.map(p=>p._types)}`) }
            this._parsers.push(parser)
        } else { throw new Error(`型エラー。引数はTsvUiType型であるべきです。`) }
    }
    get(type) {
        const parsers = this._parsers.filter(p=>p.match(type))
        if      (1===parsers.length) { return parsers[0] }
        //else if (0===parsers.length) { return null } // 標準HTML要素を返すパーサを動的生成する
        else if (0===parsers.length) { // 標準HTML要素を返すパーサを動的生成する
            const parser = this.#makeStandeardHtmlParser(type)
            if (parser) { return parser } 
            throw new Error(`指定されたtype ${type} に該当するパーサが取得できませんでした。`)
        }
        else { throw new Error(`論理エラー。一意であるべきなのに複数あります。`) }
    }
    #makeStandeardHtmlParser(type) { return ((this.#getStandeardHtmlNames().some(n=>n===type)) ? new UiParser(type, type, {}) : null) }
    #getStandeardHtmlNames() { return 'a,abbr,address,area,article,aside,audio,b,base,bdi,bdo,blockquote,body,br,button,canvas,caption,cite,code,col,colgroup,data,datalist,dd,del,details,dfn,dialog,div,dl,dt,em,embed,fieldset,figcaption,figure,footer,form,h1,head,header,hgroup,hr,html,i,iframe,img,input,ins,kbd,label,legend,li,link,main,map,mark,menu,meta,meter,nav,noscript,object,ol,optgroup,option,output,p,picture,portal,pre,progress,q,rp,rt,ruby,s,samp,script,search,section,select,slot,small,source,span,strong,style,sub,summary,sup,table,tbody,td,template,textarea,tfoot,th,thead,time,title,tr,track,u,ul,var,video,wbr'.split(',') }
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
        this.#setValue(column, tag, parser)
        if (tag.hasOwnProperty('children')) { tag.children = [] }
        return parser.makeTag(column, tag)
    }
    #setValue(column, tag, parser) {
        if ('input'===tag.tagName && 'file'===tag.attrs.type || UiParser.ValueKinds.None===parser.valueKind) { return }
        else if (this.#isButton(tag.tagName, tag.attrs) || UiParser.ValueKinds.ButtonLike===parser.valueKind) { tag.attrs.value = this.#newLine((column.value || column.label || '')) }
        else if (tag.attrs.hasOwnProperty('contenteditable') || UiParser.ValueKinds.Children===parser.valueKind) { tag.children = this.#newLine(column.value) }
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
    constructor(types, tagName, attrs, valueKinds=UiParser.ValueKinds.Attr) {
        this._types = types
        this._tagName = tagName
        this._attrs = attrs
        this._valueKinds = valueKinds
        if (!(Type.isStr(this._types) || Type.isStrs(this._types))) { throw new Error(`typesは文字列かその配列のみ受け付けます。配列の場合は短縮名などを複数指定したい時に指定します。: ${this._types}`) }
    }
    get types() { return this._types }
    get tagName() { return this._tagName}
    get attrs() { return this._attrs }
    get valueKinds() { return this._valueKinds }
    match(type) {
             if (Type.isStr (type) && Type.isStr (this._types)) { return this._types===type }
        else if (Type.isStr (type) && Type.isStrs(this._types)) { return this._types.some(t=>t===type) }
        else if (Type.isStrs(type) && Type.isStr (this._types)) { return type.some(t=>t===this._types) }
        else if (Type.isStrs(type) && Type.isStrs(this._types)) {
            for (let typ of type) {
                for (let t of this._types) {
                    if (t===typ) { return true }
                }
            }
            return false
        }
        throw new Error(`引数typeは文字列または文字列の配列であるべきです。:${typeof type}: ${type}`)

    }
    /*
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
    */
    getTag(type) { return {tagName:'input', attrs:{type:'text'}, children:[]} }
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
//        console.warn('#makeDatalist()', id, type, values)
        if (!tag.datalist) { console.warn(`datalistのデータが存在しないので作成を中断しました。`); return null }
        if (!Type.isArray(tag.datalist)) { console.warn(`datalistのデータが配列でないので作成を中断しました。`); return null }
        if (('input'===tag.tagName && ['text','search','url','tel','email','number','month','week','date','time','datetime','datetime-local','range','color','password'].some(v=>v===tag.attrs.type))) { console.warn(`datalist作成失敗。非対応要素<input type="${type}">のため。`); return null; }
        return van.tags.datalist({id:tag.attrs.list}, tag.datalist.map(v=>van.tags.option({value:v})))
        //return van.tags.datalist({id:id}, values.map(v=>van.tags.option({value:v})))
    }
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


class TextParser extends UiParser { constructor(types='text', tagName='input', attrs={type:'text'}, valueKinds=UiParser.ValueKinds.Attr) { super(types, tagName, attrs, valueKinds) } }
class UrlParser extends UiParser { constructor(types='url', tagName='input', attrs={type:'url'}, valueKinds=UiParser.ValueKinds.Attr) { super(types, tagName, attrs, valueKinds) } }
class TelParser extends UiParser { constructor(types='tel', tagName='input', attrs={type:'tel'}, valueKinds=UiParser.ValueKinds.Attr) { super(types, tagName, attrs, valueKinds) } }
class SearchParser extends UiParser { constructor(types='search', tagName='input', attrs={type:'search'}, valueKinds=UiParser.ValueKinds.Attr) { super(types, tagName, attrs, valueKinds) } }
class PasswordParser extends UiParser { constructor(types='password', tagName='input', attrs={type:'password'}, valueKinds=UiParser.ValueKinds.Attr) { super(types, tagName, attrs, valueKinds) } }
class NumberParser extends UiParser {
    constructor(types='number',tagName='input',attrs={type:'number'},valueKinds=UiParser.ValueKinds.Attr) { super(types,tagName,attrs,valueKinds) }
    makeTag(col, tag) {
        tag = super.makeTag(col, tag)
        const [value, min, max, step] = col.value.split(',')
        const vals = JSON.stringify({value, min, max, step})
        for (let attr of ['value','min','max','step']) {
            const n = Number(vals[attr])
            if (!isNaN(n)) { tag.attrs[attr] = n }
        }
        return tag
    }
}
class RangeParser extends NumberParser { constructor(types='range', tagName='input', attrs={type:'range'}, valueKinds=UiParser.ValueKinds.Attr) { super(types, tagName, attrs, valueKinds) } }
class DateTimeParser extends UiParser { constructor(types=['datetime-local','datetime'], tagName='input', attrs={type:'datetime-local'}, valueKinds=UiParser.ValueKinds.Attr) { super(types, tagName, attrs, valueKinds) } }
class DateParser extends UiParser { constructor(types='date', tagName='input', attrs={type:'date'}, valueKinds=UiParser.ValueKinds.Attr) { super(types, tagName, attrs, valueKinds) } }
class TimeParser extends UiParser { constructor(types='time', tagName='input', attrs={type:'time'}, valueKinds=UiParser.ValueKinds.Attr) { super(types, tagName, attrs, valueKinds) } }
class MonthParser extends UiParser { constructor(types='month', tagName='input', attrs={type:'month'}, valueKinds=UiParser.ValueKinds.Attr) { super(types, tagName, attrs, valueKinds) } }
class WeekParser extends UiParser { constructor(types='week', tagName='input', attrs={type:'week'}, valueKinds=UiParser.ValueKinds.Attr) { super(types, tagName, attrs, valueKinds) } }
class ColorParser extends UiParser { constructor(types='color', tagName='input', attrs={type:'color'}, valueKinds=UiParser.ValueKinds.Attr) { super(types, tagName, attrs, valueKinds) } }
class FileParser extends UiParser { constructor(types='file', tagName='input', attrs={type:'file'}, valueKinds=UiParser.ValueKinds.Attr) { super(types, tagName, attrs, valueKinds) } }
class RadioParser extends UiParser {
    constructor(types='radio', tagName='input', attrs={type:'radio'}, valueKinds=UiParser.ValueKinds.Attr) { super(types, tagName, attrs, valueKinds) }
    makeEl(col, tag) {
        console.log(col.datalist)
        const valueLabelObj = JSON.parse(col.datalist)
        // [<label><input>]
        // attrsを共用する。複数のラジオボタンで。けどそれは困るのでディープコピーした。
        //return Array.from(Object.entries(values)).map(([k,v])=>{const att=JSON.parse(JSON.stringify(attrs));console.log(k,v,att.id);att.value=k;att.id+='-'+k.Chain;return van.tags.label(van.tags.input(att), v);})
        return Array.from(Object.entries(values)).map(([k,v])=>{const att=JSON.parse(JSON.stringify(attrs));console.log(k,v,att.id);att.value=k;att.id+='-'+k.Chain;att.checked=(col.value===k);return van.tags.label(van.tags.input(att), v);})
    }
}
class CheckboxParser extends UiParser {
    constructor(types=['checkbox','check'], tagName='input', attrs='checkbox', valueKinds=UiParser.ValueKinds.Attr) { super(types, tagName, attrs, valueKinds) }
    makeEl(col, tag) {
        tag.attrs.checked = ['true','1','checked'].some(v=>v===tag.attrs.value)
        tag.attrs.value = null
        return van.tags.label(van.tags.input(attrs), label)
    }
}
class ButtonParser extends UiParser { constructor(types='button', tagName='button', attrs={type:'button'}, valueKinds=UiParser.ValueKinds.ButtonLike) { super(types, tagName, attrs, valueKinds) } }
class SubmitButtonParser extends UiParser { constructor(types='submit', tagName='button', attrs={type:'submit'}, valueKinds=UiParser.ValueKinds.ButtonLike) { super(types, tagName, attrs, valueKinds) } }
class ResetButtonParser extends UiParser { constructor(types='reset', tagName='button', attrs={type:'reset'}, valueKinds=UiParser.ValueKinds.ButtonLike) { super(types, tagName, attrs, valueKinds) } }
class ImageButtonParser extends UiParser {
    constructor(types='image', tagName='button', attrs={type:'image'}, valueKinds=UiParser.ValueKinds.ButtonLike) { super(types, tagName, attrs, valueKinds) }
    makeEl(col, tag) {
        const el = super.makeEl(col, tag)
        const img = document.createElement('img')
        img.src = tag.attrs.value
        el.appendChild(img)
        return el
    }
}
class SelectParser extends UiParser {
    constructor(types='select', tagName='select', attrs={}, valueKinds=UiParser.ValueKinds.Attr) { super(types, tagName, attrs, valueKinds) }
    makeEl(col, tag) {
        const el = super.makeEl(col, tag)
        if (!Type.isObj(tag.datalist)) { console.warn(`select要素のoption要素作成を中断します。datalistがObject型でなかったためです。値は次のようにしてください。:{"opt-val":"label-1", "optgroup-label-2":{"opt-val":"label-2-1"}}`); return }
        el.appendChild(this.#makeOptions(tag.datalist, col.value))
        return el
    }
    #makeOptionGroup(label, valueLabelObj, value) { console.log(label, valueLabelObj);return van.tags.optgroup({label:label}, this.#makeOptions(valueLabelObj, value)) }
    #makeOptions(valueLabelObj, value) { console.log(valueLabelObj, value); return Array.from(Object.entries(valueLabelObj)).map(([k,v])=>{console.log(k,v,value);return ((Type.isStr(v)) ? van.tags.option({value:k, selected:(k===value)}, v) : this.#makeOptionGroup(k, v, value))}) }
}
class TextareaParser extends UiParser { constructor(types=['textarea','area'], tagName='textarea', attrs={}, valueKinds=UiParser.ValueKinds.Attr) { super(types, tagName, attrs, valueKinds) } }
/*
class TextParser extends UiParser {
    constructor() { super() }
    match(type, v) { return super.match(type, 'text') }
    getTag(type) { return {tagName:'input', attrs:{type:'text'}} }
}
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
class PasswordParser extends UiParser {
    constructor() { super() }
    match(type, v) { return super.match(type, 'password') }
    getTag(type) { return {tagName:'input', attrs:{type:'password'}} }
}
class NumberParser extends UiParser {
    constructor() { super() }
    match(type, v) { return super.match(type, 'number') }
    getTag(type) { return {tagName:'input', attrs:{type:'number'}} }
    makeTag(col, tag) {
        tag = super.makeTag(col, tag)
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
    makeEl(col, tag) {
        const el = super.makeEl(col, tag)
        const img = document.createElement('img')
        img.src = tag.attrs.value
        el.appendChild(img)
        return el
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
class TextareaParser extends UiParser {
    constructor() { super() }
    match(type, v) { return super.match(type, 'textarea') }
    getTag(type) { return {tagName:'textarea', attrs:{}} }
}
*/
class SceneBuilder {
    constructor(map) {
        this._map = map // new SceneMap()
        this._uiMaker = new UiMaker(this._map)
    }
    get Map() { return this._map }
    get UiMaker() { return this._uiMaker }
    setAttr(sid, eid, key, value) { if (this._map.has(sid, eid)) { this._map.get(sid, eid).tag.attrs[key] = value } else { throw new Error(`存在しないキーです。:sid:${sid}, eid:${eid}`) }  }
    //addChild(sid, eid, value) { if (this._tsv.has(sid, eid)) { if (Type.isAry(this.get(sid, eid).tag.children)) {this.get(sid, eid).tag.children=[]} this.get(sid, eid).tag.children.push(value) } else { throw new Error(`存在しないキーです。:sid:${sid}, eid:${eid}`) } } 
    //setChildren(sid, eid, children) { if (this._map.has(sid, eid)) { this._map.get(sid, eid).tag.children = children } else { throw new Error(`存在しないキーです。:sid:${sid}, eid:${eid}`) } }
    setChildren(sid, eid, children) {
        if (!Type.isAry(children)) { throw new Error(`setChildrenの第三引数はHTML要素またはそれを返す関数の配列であるべきです。:${typeof children}, ${children}`) }
        if (!this._map.has(sid, eid)) { throw new Error(`存在しないキーです。:sid:${sid}, eid:${eid}`) }
        this._map.get(sid, eid).tag.children = children
        //if (this._map.has(sid, eid)) { this._map.get(sid, eid).tag.children = children } else { throw new Error(`存在しないキーです。:sid:${sid}, eid:${eid}`) } }
    }
    //addChild(sid, eid, value) { if (this._map.has(sid, eid)) { this._map.get(sid, eid).tag.children.push(value) } else { throw new Error(`存在しないキーです。:sid:${sid}, eid:${eid}`) } } 
    addChild(sid, eid, child) {
        if (!(Type.isEl(child) || Type.isFn(child))) { throw new Error(`addChildの第三引数はHTML要素またはそれを返す関数であるべきです。:${typeof value}, ${value}`) }
        if (!this._map.has(sid, eid)) { throw new Error(`存在しないキーです。:sid:${sid}, eid:${eid}`) }
        console.log(this._map.get(sid, eid).tag)
        this._map.get(sid, eid).tag.children.push(child)
        //if (this._map.has(sid, eid)) { this._map.get(sid, eid).tag.children.push(value) } else { throw new Error(`存在しないキーです。:sid:${sid}, eid:${eid}`) }
    } 
    margeAttrs(sid, eid, attrs) { this._map.get(sid, eid).tag.attrs[key] = ({...this._map.get(sid, eid).obj.attrs[key], ...attrs}) }
    setMake(sid, fn) {
        this.#makeDoms(sid)
//        const firstUiObj = this._map.get(sid).uiMap.entries().next().value
//        if (!firstUiObj.hasOwnProperty('dom')) { this.UiMaker.makeDom(sid) }
//        else if (firstUiObj.hasOwnProperty('dom') && !firstUiObj.dom) { this.UiMaker.makeDom(sid) }
        this._map.get(sid).make = fn
    }
    makeAll() { return Array.from(this._map.keys()).map(sid=>this.make(sid)) }
    make(sid) {
        const s = this._map.get(sid)
        const m = s.make
        this.#makeDom(sid)
        const scene = ((Type.isFunction(m)) ? m(s.uiMap, sid) : SceneMakeHelper.table(s.uiMap, sid))
        scene.dataset.sceneId = sid
//        if (Type.isFunction(m)) { return m(s.uiMap, sid) }
//        //return this.#makeTable(s.uiMap, sid)
//        return SceneMakeHelper.table(s.uiMap, sid)
    }
    #makeDoms(sid) {
        for (let [eid, e] of this._map.get(sid).uiMap) {
            if (!e.hasOwnProperty('dom')) { this.UiMaker.makeDom(sid, eid) }
            else if (e.hasOwnProperty('dom') && !firstUiObj.dom) { this.UiMaker.makeDom(sid, eid) }
        }
    }
    #makeDom(sid, eid) {
        const firstUiObj = this._map.get(sid).uiMap.entries().next().value
        if (!firstUiObj.hasOwnProperty('dom')) { this.UiMaker.makeDom(sid) }
        else if (firstUiObj.hasOwnProperty('dom') && !firstUiObj.dom) { this.UiMaker.makeDom(sid) }
    }
    //getEl(sid) { return document.querySelector(`*[data-scene-id="${sid}"]`) }
    getEl(sid) {
        if (sid) { return document.querySelector(`*[data-scene-id="${sid}"]`) }
    }


}
class SceneTransitioner {
    //constructor(sceneMap) { // SceneMap instance
    constructor(builder) { // SceneMap instance
        //this._map = sceneMap
        this._builder = builder
        this._now = null
        this._mode = {dir:0, loopMethod:0}
        //this._seq = new MapSequence(this._map.get(), 0)
        this._seq = new MapSequence(this._builder.Map.get(), 0)
        this._fn = null
        this._dispMap = new Map()
        console.log(this._map)
    }
    set onSelected(v) { if (Type.isFunction(v)) { this._fn = v } }
    get nowId() { return this._now }
    get nowEl() { return document.querySelector(this._now) }
    init(sid) { this.#addAll(sid) }
    #addAll(sid) {
        //van.add(document.body, this._map.makeAll())
        van.add(document.body, this._builder.makeAll())
        this.#initDisp()
        this.#hideAll()
        this.select(sid)
    }
    select(sid) {
        //if (!this._map.get().has(sid)) { sid = this._map.get().entries().next().value[0] } // sidが未指定なら最初の画面を選択する
        if (!this._builder.Map.get().has(sid)) { sid = this._builder.Map.get().entries().next().value[0] } // sidが未指定なら最初の画面を選択する
        console.log(`select(): sid=${sid}`, this._fn, Type.isFunction(this._fn))
        this._now = sid
        this._seq.key = sid
        this.#hideAll()
        this.#show(sid)
        if (Type.isFunction(this._fn)) { this._fn(sid) }
    }
    move() {
        const [i, k, v] = this._seq.next()
        this.select(k)
    }
    first() { this.select(this._seq.first()[1]) }
    last() { this.select(this._seq.last()[1]) }
    //#initDisp() { for (let [sid,v] of this._map.get()) { const d=Css.get('display',document.querySelector(`#${sid}`)); this._dispMap.set(sid, ((d) ? d : 'block')); } }
    #initDisp() { for (let [sid,v] of this._builder.Map.get()) { const d=Css.get('display',this._builder.getEl(sid)); this._dispMap.set(sid, ((d) ? d : 'block')); } }
    //#hideAll() { for (let [sid,v] of this._map.get()) { this.#hide(sid) } }
    #hideAll() { for (let [sid,v] of this._builder.Map.get()) { this.#hide(sid) } }
    #hide(sid) { this.#setDisp(sid, false) }
    #show(sid) { this.#setDisp(sid, true) }
    #setDisp(sid, isShow) { const el=this._builder.getEl(sid); if (el) {el.style.setProperty('display', ((isShow) ? this._dispMap.get(sid) : 'none'))} }
    //#setDisp(sid, isShow) { const el=document.querySelector(`*[data-scene-id="${sid}"]`); if (el) {el.style.setProperty('display', ((isShow) ? this._dispMap.get(sid) : 'none'))} }
    //#setDisp(sid, isShow) { const el=document.querySelector(`#${sid}`); if (el) {el.style.setProperty('display', ((isShow) ? this._dispMap.get(sid) : 'none'))} }
}
class SceneStore { // 入力要素の値を取得・設定する
    constructor(sceneMap) { this._map = sceneMap.get() } // sceneMap: SceneMap instance
    get(sid) { return EV2Obj.get(this._map, sid) } // {sid:{eid:value, ...}, ...}
    set(obj) { return Obj2EV.set(obj) } // obj:{sid:{eid:value, ...}, ...}
}
class EV2Obj { // 要素の値をオブジェクトに変換する
    static get(map, sid) { // {sid:{eid:value, ...}, ...}
        console.log(map, sid)
        const json = {}
        if (sid) { return this.#jsonScene(map, sid) }
        console.log(this._map)
        for (let [sid, s] of map.entries()) {
            json[sid] = this.#evs(sid, s.uiMap)
        }
        return json
    }
    static #jsonScene(map, sid) { return this.#evs(sid, map.get(sid).uiMap) }
    static #evs(sid, uiMap) { return this.#pickBy(Object.assign(...Array.from(uiMap.entries()).map(([eid,e])=>{console.log(sid,eid);return ({[eid]:document.querySelector(`[data-sid="${sid.Chain}"][data-eid="${eid.Chain}"]`).jsonValue})}))) }
    static #pickBy(obj) { return Object.assign(...Array.from(Object.entries(obj)).filter(([k,v])=>(undefined!==v)).map(([k,v])=>({[k]:v})))}
}
class Obj2EV { // オブジェクトを要素の値に設定する
    static set(obj) {
        for (let [sid, s] of Object.entries(obj)) {
            for (let [eid, value] of Object.entries(s)) {
                document.querySelector(`[data-sid="${sid.Chain}"][data-eid="${eid.Chain}"]`).jsonValue = obj[sid][eid]
            }
        }
    }
}

class Scene {
    constructor() {
        this._tsv = new TsvSample()
        this._map = new SceneMap()
        //this._uiMaker = new UiMaker()
        this._builder = new SceneBuilder(this._map)
        this._trans = null
        this._store = null
        //this._uiex = new UiMakeExtend()
    }
    get Tsv() { return this._tsv }
    //get Map() { return this._map }
    //get UiMaker() { return this._builder.UiMaker }
    get Builder() { return this._builder } // .Map, .UiMaker.Parsers.add()
    get Transitioner() { return this._trans }
    get Store() { return this._store }
    get UiMakeExtend() { return UiMakeExtend }
    get MakeHelper() { return SceneMakeHelper }
    static get _MakeHelper() { return SceneMakeHelper }
    init(tsv, isHeaderTrim) {
//        this._map.init(tsv, isHeaderTrim)
        if (Type.isStr(tsv)) { this._map.loadTsv(tsv, isHeaderTrim) }
//        this._uiMaker.makeTags() 
        this._builder.UiMaker.makeTags() 
        //this._trans = new SceneTransitioner(this._map)
        this._trans = new SceneTransitioner(this._builder)
        this._store = new SceneStore(this._map)
    }
    addBody() {
//        if (!firstUiObj.hasOwnProperty('dom')) { this.UiMaker.makeDom(sid) }
//        else if (firstUiObj.hasOwnProperty('dom') && !firstUiObj.dom) { this.UiMaker.makeDom(sid) }
        this._trans.init()
    }
}
window.Scene = Scene
window.UiParser = UiParser 
//window.UiMaker = UiMaker
})()
