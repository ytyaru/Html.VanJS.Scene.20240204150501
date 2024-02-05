window.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOMContentLoaded!!');
    const {h1, p, a} = van.tags
    const author = 'ytyaru'
    /*
    Scene.set('main', div(h1('メイン画面'),p('これはメイン画面です。')))
    Scene.set('sub', div(h1('サブ画面'),p('これはサブ画面です。')))
    van.add(document.querySelector('main'), 
        h1(a({href:`https://github.com/${author}/Html.VanJS.Scene.20240204150501/`}, 'Scene')),
        p('画面遷移ライブラリを作る。'),
//        p('Create a screen transition library.'),
    )
    van.add(document.querySelector('footer'),  new Footer('ytyaru', '../').make())
    */
    const tsv = `画面ID	UI名	型	ラベル	プレースホルダー	初期値	attrs	datalist
scene-0	title	text	タイトル	表題	初期値		
scene-0	category	select	カテゴリ		label-2		{"value":"label-1", "groupValue":{"value":"label-2"}}
scene-0	created	date	作成日				
scene-1	title	text	タイトル				
scene-1	body	area	本文	プレースホルダー。\\n二行目。	初期値。\\n二行目。		
scene-1	sex	radio	性別			{"male":"男", "female":"女"}
scene-1	isMan	check	人間か		true		
scene-1	viewer	div				{"tabindex":0, "contenteditable":true}	

`
    const uiEl = new UiEl()
    const uiMap = uiEl.fromTsv(tsv, true)
//    for (let [k,v] of uiMap) {
//        van.add(document.body, div(h1(k), uiEl.makeTable(v)))
//    }
    van.add(document.body, uiEl.makeTables(uiMap))
});
window.addEventListener('beforeunload', (event) => {
    console.log('beforeunload!!');
});

