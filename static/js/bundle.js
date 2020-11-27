function E(id){return document.getElementById(id);}
function V(id){return E(id).value.trim();}
function startLoading(){E('loading').hidden=0;}
function stopLoading(){E('loading').hidden=1;}
function sleep(ti){return new Promise((resolve)=>setTimeout(resolve,ti));}
function Notice(s,ti=2000){
    var notice=E('notice');
    notice.innerText=s;notice.style.opacity=1;noticefade=0;function fade(){if(noticefade)if((notice.style.opacity-=0.01)>0)
    requestAnimationFrame(fade);}
    sleep(ti).then(()=>{noticefade=1;fade();});
}
async function post(url,body,showLoading=1){
    if(showLoading)startLoading();
    var res=await fetch(url,{
        method: "POST",
        body:JSON.stringify(body),
        headers: {'content-type': 'application/json'},
    }).then(res=>res.json());
    if(showLoading)stopLoading();
    return res;
}
async function sendToken(re=0){
    var email=V('email');
    var res=await post('/api/sendToken',{email,re});
    Notice(res.data);
}
async function Fetch(){
    var token=V('token'),email=V('email');
    var res=await post('/api/chkToken',{email,token});
    if(!res.status)Notice(res.data.error),E('token').Vue='';
    else Notice(res.data),showAll();
}
async function add(){
    var name=V('name')+'.'+zone_name,type=V('type'),content=V('content'),ttl=Number(V('ttl'));
    var res=await post('/api/add',{
        email:V('email'),token:V('token'),
        record:{type,name,content,ttl}
    });
    console.log(res.data);
    if(res.status)Notice(`success id:${res.data.result.id}`),sleep(1000).then(Fetch);
    else Notice(`failed: ${res.data.error}`);
}
async function all(){
    var res=await post('/api/all',{
        email:V('email'),token:V('token')
    });
    return res.data;
}
function CE(tag){return document.createElement(tag);}
async function showAll(){
    var res=await all(),l=E('items');
    l.innerHTML='';
    function Input(val){
        var x=CE('input');x.value=val;
        return x;
    }
    function Typeselect(type){
        var x=CE('select'),list=['A','CNAME'];
        for(var i of list){
            var y=CE('option');y.innerText=i;y.value=i;
            if(type==i)y.selected='selected';
            x.append(y);
        }
        return x;
    }
    function TTLselect(ttl){
        var x=CE('select'),cTTL={
            1:'AUTO',2:'2',5:'5',10:'10',15:'15',
            60:'1H',120:'2H',300:'5H',720:'12H',1440:'1D'
        };
        for(var i in cTTL){
            var y=CE('option');
            y.value=i;y.innerText=cTTL[i];
            if(ttl==i)y.selected='selected';
            x.append(y);
        }
        return x;
    }
    for(var i of res){
        var item=CE('tr'),
            name=CE('th'),type=CE('th'),content=CE('th'),ttl=CE('th'),action=CE('th');
        name.append(Input(i.name.slice(0,i.name.length-zone_name.length-1)));name.align='left';
        type.append(Typeselect(i.type));type.align='left';
        content.append(Input(i.content));content.align='left';
        ttl.append(TTLselect(i.ttl));ttl.align='left';
        var Del=CE('button'),Edit=CE('button'),visit=CE('a');
        Del.innerText='Del';
        Del.onclick=(x)=>{del(x.target.parentElement.parentElement.id);}
        Edit.innerText='Edit';
        Edit.onclick=(x)=>{edit(x.target.parentElement.parentElement.id);}
        visit.href='http://'+i.name;visit.target='_blank';
        // visit.innerText='visit';
        action.append(Del,Edit,visit);
        item.id=i.id;
        item.append(name,type,content,ttl,action);
        l.append(item);
    }
}
async function del(id){
    var res=await post('/api/del',{
        email:V('email'),token:V('token'),
        record:{id}
    });
    console.log(res.data);
    if(res.status)Notice(`success id:${res.data.result.id}`),sleep(1000).then(Fetch);
    else Notice(`failed: ${res.data.error}`);
}
async function edit(id){
    var item=E(id);
    var name=item.children[0].children[0].value,
        type=item.children[1].children[0].value,
        content=item.children[2].children[0].value,
        ttl=item.children[3].children[0].value;
    var res=await post('/api/edit',{
        email:V('email'),token:V('token'),
        record:{id,type,name,content,ttl}
    });
    console.log(res.data);
    if(res.status)Notice(`success id:${res.data.result.id}`),sleep(1000).then(Fetch);
    else Notice(`failed: ${res.data.error}`);
}