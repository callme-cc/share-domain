const fetch=require("node-fetch");
var zone_id,headers;
async function get(url){
    return await fetch(url,{headers}).then(res=>res.json());
}
async function post(url,body,method='POST'){
    return await fetch(url,{
        headers,method,
        body:JSON.stringify(body)
    }).then(res=>res.json());
}
async function ask(record_name){
    return await get(`https://api.cloudflare.com/client/v4/zones/${zone_id}/dns_records?name=${record_name}`)
}
async function add({type,name,content,ttl=1}){
    return await post(
        `https://api.cloudflare.com/client/v4/zones/${zone_id}/dns_records`,
        {type,name,content,ttl}
    )
}
async function update({id,type,name,content,ttl=1}){
    var body={id,type,name,content};
    return await post(
        `https://api.cloudflare.com/client/v4/zones/${zone_id}/dns_records/${id}`,
        body,'PUT'
    )
}
async function del({id}){
    return await post(
        `https://api.cloudflare.com/client/v4/zones/${zone_id}/dns_records/${id}`,null,'DELETE'
    )
}
module.exports=async({zone_name,email,key})=>{
    headers={ 
        "X-Auth-Email":email,"X-Auth-Key":key,
        "Content-Type":"application/json"
    }
    res=await get(`https://api.cloudflare.com/client/v4/zones?name=${zone_name}`);
    zone_id=res.result[0].id;
    return {zone_id,ask,add,update,del};
}