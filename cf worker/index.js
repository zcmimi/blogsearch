const file='https://zcmimi.github.io/pure_data.json', // json数据文件位置
    addr='https://blog_search.zcmimi.workers.dev', // 当前worker网址
    preview_len=50; // 预览字数
var data,url;
async function getdata(){
    await fetch(file).
            then(res=>res.json()).
            then(json=>data=json);
}
function chk(content,text,typ=0){
    content=content.toLowerCase();
    if(typ==0)return content.indexOf(text)!=-1;
    else if(typ==1){
        for(var i=0,j=0;i<content.length;++i)
            if(content[i]==text[j])
                if(++j==text.length)return 1;
    }
    return 0;
}
async function search(text,typ=0){
    text=text.toLowerCase();
    if(!data)await getdata();
    var res=[];
    for(i in data){
        var f=0;
        if(chk(data[i].title,text,typ))f=1;
        else for(j in data[i].tags)
            if(chk(data[i].tags[j],text,typ)){
                f=1;
                break;
            }
        else for(j in data[i].categories)
            for(k in data[i].categories[j])
                if(chk(data[i].categories[j][k],text,typ)){
                    f=1;
                    break;
                }
        else if(chk(data[i].content,text,typ))f=1;
        if(f)res.push([data[i].link,data[i].title,data[i].content.substring(0,preview_len)]);
    }
    return JSON.stringify(res);
}
function geturl(keyword){
    var vars=url.split("&");
    for(var i=0;i<vars.length;++i){
        var pair=vars[i].split("=");
        if(pair[0]==keyword)return pair[1];
    }
    return 0;
}
/*------------------------------------------------------------*/
addEventListener('fetch',event=>{
    event.respondWith(handleRequest(event.request))
})
async function handleRequest(request){
    var res="usage:\n\
?keyword=<keyword>&typ=<typ>\n\
required: keyword";
    url=decodeURI(request.url);
    if(chk(url,"keyword")){
        url=url.substr(addr.length+2,url.length);
        res=await search(geturl("keyword"),geturl("typ"));
    }
    return new Response(res,{
        status:200,
        headers:new Headers({
            // 允许跨域访问,也可自定义域名
            'access-control-allow-origin': '*',
            'access-control-allow-methods': 'GET,POST,PUT,PATCH,TRACE,DELETE,HEAD,OPTIONS',
            'access-control-max-age': '1728000',
        }),
    });
}