(function(){
class Sequence {
    static Direct = { Asc:0, Desc:-1 }
    static LoopMethods = { HeadTail:0, Yoyo:1, Stop:2 }
    constructor(values, loopMethod, dir, step, i) {
        this._values = values
        this._i = i || 0
        this._dir = dir || Sequence.Direct.Asc
        this._step = step || 1
        this._loopMethod = loopMethod || Sequence.LoopMethods.HeadTail
    }
    next() {
        this._i += (((0 <= this._dir) ? 1 : -1) * this._step)
        if (this._i < 0) {
            switch (this._loopMethod) {
                case 0: { this._i = this._scenes.size-1; break; }
                case 1: { this._dir = ((0<=this._dir) ? -1 : 1); this._i = ((1<this._values.length) ? 1 : 0); break; }
                case 2: { this._i = 0; break; }
                default: throw new Error('不正なloopMethod')
            }
        }
        else if (this._values.length <= this._i) {
            switch (this._loopMethod) {
                case 0: { this._i = 0; break; }
                case 1: { this._dir = ((0<=this._dir) ? -1 : 1); this._i = ((1<this._values.length) ? this._values.length-2 : 0); break; }
                case 2: { this._i = this._values.length-1; break; }
                default: throw new Error('不正なloopMethod')
            }
        }
        return [this._i, this._values[this._i]]
    }
    get i() { return this._i }
    get value() { return this._values[this._i] }
    set i(v) { if (0<=v && v<=this._values.length) { this._i = v } }
    set value(val) { // setIdxFromValue
        const f = this._values.findIndex(v=>v===val)
        if (-1 < f) { this._i = f }
    }
}
window.Sequence = Sequence
})()
