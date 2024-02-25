(function(){
const {table,tbody,thead,tfoot,tr,th,td,caption} = van.tags
class KvTable { // ラベルとUIの列を持ったテーブル（th,tdはdisplay:block/inlineを切り替える）
    static make(uiMap, sid) {
        const doms = Array.from(uiMap.values()).map(v=>Scene._MakeHelper.tag(v.col, v.obj))
        const display = ((Css.getInt('inline-size') < 480) ? 'block' : 'inline');
        return table({class:'kv-table'}, ()=>tbody(this.#trs(doms, display)))
    }
    static #trs(doms, display) { return doms.map(dom=>this.#tr(dom, display)) }
    static #tr(dom, display) { console.log(dom);return tr(
        th({style:()=>`display:${display};`}, dom.lb),
        td({style:()=>`display:${display};`}, dom.el, dom.dl),
    )}
    static resize() {
        console.log('inline-size:', Css.getInt('inline-size'))
        const display = ((Css.getInt('inline-size') < 480) ? 'block' : 'table-cell')
        for (let table of document.querySelectorAll('table[class="kv-table"]')) {
            if ('none'===Css.get('display', table).trim()) { continue }
            for (let cell of document.querySelectorAll('th, td')) {
                Css.set('display', display, cell)
            }
        }
    }
    /*
    constructor(doms) {
        this._doms = doms
        this._display = van.state('table-cell')
    }
    //make(doms) { return table(...this.#trs()) }
    make() { return table({class:'kv-table'}, ()=>tbody(this.#trs())) }
    #trs() { return this._doms.map(dom=>this.#tr(dom)) }
    #tr(dom) { console.log(dom);return tr(
        th({style:()=>`display:${this._display.val};`}, dom.lb),
        td({style:()=>`display:${this._display.val};`}, dom.el, dom.dl),
    )}
    resize() {
        console.log('inline-size:', Css.getInt('inline-size'))
        this._display = ((Css.getInt('inline-size') < 480) ? 'block' : 'table-cell')
    }
    //resize() { this._display = (((Css.getInt('inline-size') < 480) ? 'block' : 'inline') }
    */
}
window.KvTable = KvTable
})()
