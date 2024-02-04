window.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOMContentLoaded!!');
    const {h1, p, a} = van.tags
    const author = 'ytyaru'
    Scene.set('main', div(h1('メイン画面'),p('これはメイン画面です。')))
    Scene.set('sub', div(h1('サブ画面'),p('これはサブ画面です。')))
    van.add(document.querySelector('main'), 
        h1(a({href:`https://github.com/${author}/Html.VanJS.Scene.20240204150501/`}, 'Scene')),
        p('画面遷移ライブラリを作る。'),
//        p('Create a screen transition library.'),
    )
    van.add(document.querySelector('footer'),  new Footer('ytyaru', '../').make())
});
window.addEventListener('beforeunload', (event) => {
    console.log('beforeunload!!');
});

