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
    /*
    const tsv = `画面ID	要素ID	type	label	placeholder	value,min,max,step	datalist	attrs
scene-0	title	text	タイトル	表題	初期値		
scene-0	category	select	カテゴリ		key2	{"key1":"label-1", "groupValue":{"key2":"label-2"}}	
scene-0	created	date	作成日				
scene-1	title	text	タイトル				
scene-1	body	area	本文	プレースホルダー。\\n二行目。	初期値。\\n二行目。		
scene-1	sex	radio	性別		{"male":"男", "female":"女"}	
scene-1	isMan	check	人間か		true		
scene-1	viewer	div					{"tabindex":0}
scene-1	editor	div					{"tabindex":0, "contenteditable":true}
`
*/
/*
画面ID	要素ID	type	label	placeholder	value,min,max,step	datalist	attrs
all-el	description	textarea	説明	説明。	全要素一覧		
all-el	category	select	カテゴリ		key2	{"key1":"label-1", "groupValue":{"key2":"label-2"}}	
all-el	title	text	タイトル	表題	初期値		
all-el	search	search	検索	検索キーワード	お前を消す方法		
all-el	url	url	URL	https://domain.com/		
all-el	tel	tel	電話番号	00000000000		
all-el	password	password	パスワード	見せられないよ！	誰にも秘密だよ？		
all-el	even	number	偶数	0	50,0,100,2		
all-el	odd	range	奇数	0	49,1,99,2		
all-el	datetime	datetime	日時			
all-el	date	date	日付			
all-el	month	month	月			
all-el	week	week	週			
all-el	time	time	時刻			
all-el	color	color	色			
all-el	file	file	ファイル			
all-el	sex	radio	性別		{"male":"男", "female":"女"}	
all-el	isMan	check	人間か		true		
all-el	hidden	hidden	秘密値		hidVal		
all-el	editor	div					{"tabindex":0, "contenteditable":true}
dl-ex	description	textarea	説明	説明。		["候補１(無効)","候補２(無効)"]	
dl-ex	category	select	カテゴリ		key2	{"key1":"label-1", "groupValue":{"key2":"label-2"}}	
dl-ex	title	text	タイトル	表題		["候補１","候補２"]	
dl-ex	search	search	検索	検索キーワード		["候補１","候補２"]	
dl-ex	url	url	URL	https://domain.com/		["候補１","候補２"]	
dl-ex	tel	tel	電話番号	00000000000		["候補１","候補２"]	
dl-ex	password	password	パスワード	見せられないよ！		["候補１(無効)","候補２(無効)"]	
dl-ex	even	number	偶数	0	,0,100,2	[0,25,50,75,100]	
dl-ex	odd	range	奇数	0	,1,99,2	[1,24,49,74,99]	
dl-ex	datetime	datetime	日時			["1999-12-31T23:59:59","2000-01-01T00:00:00"]	
dl-ex	date	date	日付			["1999-12-31","2000-01-01"]	
dl-ex	month	month	月			["1999-12","2000-01"]	
dl-ex	week	week	週			["1999-W52","2000-W01"]	
dl-ex	time	time	時刻			["00:00","23:59"]	
dl-ex	color	color	色			["#ff0000","#00ff00","#0000ff"]	
dl-ex	file	file	ファイル		["候補１(無効)","候補２(無効)"]	
dl-ex	sex	radio	性別		{"male":"男", "female":"女"}	
dl-ex	isMan	check	人間か		true		
dl-ex	editor	div					{"tabindex":0, "contenteditable":true}
*/
    const tsv = `画面ID	要素ID	type	label	placeholder	value,min,max,step	datalist	attrs
dl-ex	description	textarea	説明	説明。		["候補１(無効)","候補２(無効)"]	
dl-ex	category	select	カテゴリ		key2	{"key1":"label-1", "groupValue":{"key2":"label-2"}}	
dl-ex	title	text	タイトル	表題		["候補１","候補２"]	
dl-ex	search	search	検索	検索キーワード		["候補１","候補２"]	
dl-ex	url	url	URL	https://domain.com/		["候補１","候補２"]	
dl-ex	tel	tel	電話番号	00000000000		["候補１","候補２"]	
dl-ex	password	password	パスワード	見せられないよ！		["候補１(無効)","候補２(無効)"]	
dl-ex	even	number	偶数	0	,0,100,2	[0,25,50,75,100]	
dl-ex	odd	range	奇数	0	,1,99,2	[1,24,49,74,99]	
dl-ex	datetime	datetime	日時			["1999-12-31T23:59:59","2000-01-01T00:00:00"]	
dl-ex	date	date	日付			["1999-12-31","2000-01-01"]	
dl-ex	month	month	月			["1999-12","2000-01"]	
dl-ex	week	week	週			["1999-W52","2000-W01"]	
dl-ex	time	time	時刻			["00:00","23:59"]	
dl-ex	color	color	色			["#ff0000","#00ff00","#0000ff"]	
dl-ex	file	file	ファイル		["候補１(無効)","候補２(無効)"]	
dl-ex	sex	radio	性別		{"male":"男", "female":"女"}	
dl-ex	isMan	check	人間か		true		
dl-ex	editor	div					{"tabindex":0, "contenteditable":true}
sub	title	text	タイトル	サブ画面		["候補１","候補２"]	
`
    const uiEl = new UiEl()
    const uiMap = uiEl.fromTsv(tsv, true)
//    for (let [k,v] of uiMap) {
//        van.add(document.body, div(h1(k), uiEl.makeTable(v)))
//    }
//    van.add(document.body, uiEl.makeTables(uiMap))

    console.log(uiMap)
    const scenes = new Scene(uiMap)
    van.add(document.body, van.tags.button({onclick:e=>scenes.move()},'画面遷移'))
    //scenes.setMake('sid', (v, k)=>v.el)
    scenes.addAll()
    scenes.select()
});
window.addEventListener('beforeunload', (event) => {
    console.log('beforeunload!!');
});

