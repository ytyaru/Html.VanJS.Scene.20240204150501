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
sub	title	text	タイトル	サブ画面		["候補１","候補２"]	
sub	reset	reset			初期化		
sub	submit	submit			送信		
sub	save	button			保存		
third	title	text	タイトル	第三画面		["候補１","候補２"]	
layout	description	textarea	説明	説明。			
layout	category	select	カテゴリ		key2	{"key1":"label-1", "groupValue":{"key2":"label-2"}}	
layout	title	text	タイトル	表題			
layout	search	search	検索	検索キーワード			
layout	url	url	URL	https://domain.com/			
layout	tel	tel	電話番号	00000000000			
layout	password	password	パスワード	見せられないよ！			
layout	even	number	偶数	0	0,0,100,2		
layout	odd	range	奇数	0	0,1,99,2		
layout	datetime	datetime	日時				
layout	date	date	日付				
layout	month	month	月				
layout	week	week	週				
layout	time	time	時刻				
layout	color	color	色				
layout	file	file	ファイル				
layout	sex	radio	性別		{"male":"男", "female":"女"}		
layout	isMan	check	人間か		true		
layout	editor	div	エディタ				{"tabindex":0, "contenteditable":true}
layout	viewer	div	ビューア				{"tabindex":0}
layout	save	button			JSONファイルダウンロード		
layout	load	button			JSONファイル読込		
layout	category	select	カテゴリ(option無し)				
layout	multi-children	div	複数children				
display	description1	textarea	説明1	説明1。			
display	description2	textarea	説明2	説明2。			
`
    const scene = new Scene()
    console.log('TSV例 開始-----------------------------')
    console.log(scene.Tsv.get())
    console.log(scene.Tsv.get('ja'))
    console.log(scene.Tsv.get('ja',true))
    console.log(scene.Tsv.get('en'))
    console.log(scene.Tsv.get('en',true))
    console.log(scene.Tsv.header.get())
    console.log(scene.Tsv.header.get('ja'))
    console.log(scene.Tsv.header.get('ja',true))
    console.log(scene.Tsv.header.get('en'))
    console.log(scene.Tsv.header.get('en',true))
    console.log('TSV例 終了-----------------------------')
    //scene.init(tsv, true)
    scene.init(tsv)
    scene.Map.setAttr('dl-ex', 'viewer', 'style', ()=>`width:100px;height:100px;`)
    const htmls = van.state([van.tags.p('テキスト一行目'), van.tags.p('二行目')])
    scene.Map.setChildren('dl-ex', 'viewer', htmls.val)
    scene.Map.setAttr('dl-ex', 'description', 'oninput', (e)=>htmls.val=e.target.value)
    scene.Map.setChildren('dl-ex', 'viewer', ()=>van.tags.div(htmls.val))
    scene.Map.setMake('third', (uiMap, sid)=>{
        return van.tags.div({id:sid},
            van.tags.h1(sid),
            van.tags.p('任意にデザインした画面です。'),
            scene.MakeHelper.table(uiMap, sid)
    )})
    scene.Map.setAttr('layout', 'viewer', 'style', ()=>`width:100px;height:100px;`)
    const layoutViewerHtmls = van.state([van.tags.p('テキスト一行目'), van.tags.p('二行目')])
    scene.Map.setAttr('layout', 'description', 'oninput', (e)=>layoutViewerHtmls.val=e.target.value)
    scene.Map.setChildren('layout', 'viewer', ()=>van.tags.div(layoutViewerHtmls.val))
    scene.Map.setAttr('layout', 'save', 'onclick', (e)=>{const j=scene.Store.get();console.log(j);JsonFile.download(j, 'scenes.json')})
    scene.Map.setAttr('layout', 'load', 'onclick', (e)=>{
        const j=scene.Store.get();
        j.layout.sex = 'female'
        console.log(j);
        scene.Store.set(j);
    })

    console.log('doms:', scene.Map.get('layout').uiMap)
    console.log('doms:', scene.Map.get('layout').uiMap.values())
    console.log('doms:', Array.from(scene.Map.get('layout').uiMap.values()))
//    console.log('doms:', scene.Map.get('layout').uiMap.values().map(v=>scene.MakeHelper.tag(v.col, v.obj)))
    console.log('doms:', Array.from(scene.Map.get('layout').uiMap.values()).map(v=>scene.MakeHelper.tag(v.col, v.obj)))
    console.log('doms:', Array.from(scene.Map.get('layout').uiMap.values()).map(v=>v.dom))
    console.error('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX')

    //const kvTable = new KvTable(scene.Map.get('layout').uiMap.values().map(v=>scene.MakeHelper.tag(v.col, v.obj)))
//    const kvTable = new KvTable(Array.from(scene.Map.get('layout').uiMap.values()).map(v=>scene.MakeHelper.tag(v.col, v.obj)))
//    scene.Map.setMake('layout', (uiMap, sid)=>van.tags.div({id:sid}, ()=>kvTable.make()))
    console.log(KvTable)
    scene.Map.setMake('layout', (uiMap, sid)=>van.tags.div({id:sid}, ()=>KvTable.make(uiMap, sid)))
    scene.Map.setChildren('layout', 'multi-children', [van.tags.h1('複数'),van.tags.p('子要素')])


    //scene.Map.setMake('display', (uiMap, sid)=>van.tags.div({id:sid, style:()=>`display:grid;grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr;`}, ()=>KvTable.make(uiMap, sid)))
    //const displayRows = van.state('1fr')
    const displayRows = van.state(`${document.documentElement.clientHeight}px`)
    scene.Map.setMake('display', (uiMap, sid)=>{
        return van.tags.div(
            {id:sid, style:()=>`display:grid;grid;grid-template-columns:1fr 1fr;grid-template-rows:${displayRows.val};`}, 
            //{id:sid, style:()=>`display:grid;grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr;`}, 
            //{id:sid, style:()=>`display:grid;grid;grid-template-columns:1fr 1fr;grid-template-rows:${document.documentElement.clientHeight};`}, 
//            ...Array.from(uiMap).map(([k,v])=>scene.MakeHelper.tag(v.col, v.obj).el),
            ...Array.from(uiMap).map(([k,v])=>v.dom.el),
    )})

    //window.addEventListener('resize', debounce(()=>KvTable.resize(), 300))
    window.addEventListener('resize', debounce(()=>{KvTable.resize();displayRows.val=document.documentElement.clientHeight;}, 300))
    /*
    window.addEventListener('resize', (event)=>{
//        console.log(kvTable, kvTable.make())
//        kvTable.resize()
//        KvTable.resize()
        KvTable.resize()
    })
    */
    /*
    window.addEventListener('resize', (event)=>debounce(()=>{
        console.log(kvTable, kvTable.make())
        kvTable.resize()
    }),300)
    scene.Map.setMake('layout', (uiMap, sid)=>{
        return van.tags.div({id:sid},
            van.tags.h1(sid),
            van.tags.p('複雑なレイアウトを設計した画面です。'),
            van.tags.table(
                Array.from(uiMap.entries()).map(([eid,v])=>{
                    const dom = scene.MakeHelper.tag(v.col, v.obj)
                    return van.tags.tr(
                        van.tags.th(dom.lb),         // ラベル
                        van.tags.td(dom.el, dom.dl), // 要素, datalist
                        van.tags.td('入力文字数'),
                        van.tags.td('validation結果'),
                    )
                }))
    )})
    */
    van.add(document.body, 
        van.tags.button({onclick:e=>scene.Transitioner.move()},'画面遷移'),
        van.tags.button({onclick:e=>scene.Transitioner.first()},'最初の画面へ遷移'),
        van.tags.button({onclick:e=>scene.Transitioner.last()},'最後の画面へ遷移'),
    )
    scene.addBody()
});
window.addEventListener('beforeunload', (event) => {
    console.log('beforeunload!!');
});

