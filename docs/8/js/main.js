window.addEventListener('DOMContentLoaded', (event) => {
    const tsv = `画面ID	要素ID	type	label	placeholder	value,min,max,step	datalist	attrs
all-type	description	textarea	説明	説明。			
all-type	category	select	カテゴリ		key2	{"key1":"label-1", "groupValue":{"key2":"label-2"}}	
all-type	title	text	タイトル	表題			
all-type	search	search	検索	検索キーワード			
all-type	url	url	URL	https://domain.com/			
all-type	tel	tel	電話番号	00000000000			
all-type	password	password	パスワード	見せられないよ！			
all-type	even	number	偶数	0	,0,100,2		
all-type	odd	range	奇数	0	,1,99,2		
all-type	datetime	datetime	日時				
all-type	date	date	日付				
all-type	month	month	月				
all-type	week	week	週				
all-type	time	time	時刻				
all-type	color	color	色				
all-type	file	file	ファイル				
all-type	sex	radio	性別		{"male":"男", "female":"女"}		
all-type	isMan	check	人間か		true		
all-type	editor	div					{"tabindex":0, "contenteditable":true}
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
dl-ex	file	file	ファイル			["候補１(無効)","候補２(無効)"]	
dl-ex	sex	radio	性別		{"male":"男", "female":"女"}		
dl-ex	isMan	check	人間か		true		
dl-ex	editor	div					{"tabindex":0, "contenteditable":true}
sub	title	text	タイトル	サブ画面		["候補１","候補２"]	
sub	reset	reset			初期化		
sub	submit	submit			送信		
sub	save	button			保存		
third	title	text	タイトル	第三画面		["候補１","候補２"]	
`
    const sceneMap = new SceneMap()
    sceneMap.init(tsv, true)
    console.log(sceneMap.get())
    console.log(sceneMap.get('dl-ex'))
    console.log(sceneMap.get('dl-ex', 'title'))
    //sceneMap.setAttr('', '', '', '')
    sceneMap.setAttr('dl-ex', 'title', 'value', 'setAttr()でvalueを変更した！')
    sceneMap.setMake('third', (uiMap, sid)=>{
        return van.tags.div({id:sid},
            van.tags.h1(sid),
            van.tags.p('任意にデザインした画面です。'),
            SceneMakeHelper.table(uiMap, sid)
    )})
    const sceneTrans = new SceneTransitioner(sceneMap)
    van.add(document.body, 
        van.tags.button({onclick:e=>sceneTrans.move()},'画面遷移'),
        van.tags.button({onclick:e=>sceneTrans.first()},'最初の画面へ遷移'),
        van.tags.button({onclick:e=>sceneTrans.last()},'最後の画面へ遷移'),
    )
    sceneTrans.init()
});
window.addEventListener('beforeunload', (event) => {
    console.log('beforeunload!!');
});

