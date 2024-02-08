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
all-type	viewer	div					{"tabindex":0}
dl-ex	description	textarea	説明	説明。		["候補１(無効)","候補２(無効)"]	
dl-ex	viewer	div	ビューア				{"tabindex":0}
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
//    sceneMap.setAttr('dl-ex', 'title', 'value', 'setAttr()でvalueを変更した！')
    sceneMap.setAttr('dl-ex', 'viewer', 'style', ()=>`width:100px;height:100px;`)
    //sceneMap.setInners('dl-ex', 'viewer', ['テキスト一行目', '二行目'])
    //sceneMap.setInners('dl-ex', 'viewer', [van.tags.p('テキスト一行目'), van.tags.p('二行目')])
    const htmls = van.state([van.tags.p('テキスト一行目'), van.tags.p('二行目')])
    sceneMap.setInners('dl-ex', 'viewer', htmls.val)
    sceneMap.setAttr('dl-ex', 'description', 'oninput', (e)=>htmls.val=e.target.value)
    //sceneMap.setInners('dl-ex', 'viewer', ()=>htmls.val)
    //sceneMap.setInners('dl-ex', 'viewer', van.tags.div(()=>van.tags.div(htmls.val)))
    sceneMap.setInners('dl-ex', 'viewer', ()=>van.tags.div(htmls.val))
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

