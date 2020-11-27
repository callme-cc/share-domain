"use strict"
const port=process.env.PORT||1191,host=process.env.HOST||'';
const express=require('express'),
    bp=require('body-parser'),
    swig=require("swig"),
    fs=require("fs"),
    db=require("./database");
var config=require('./config'),
    send=require('./send')(config.mailer),
    cf;
require('./cloudflare')(config.cf).then(CF=>{
    cf=CF;
    console.log(cf);
});

function genToken(len=10){return Math.random().toString(16).slice(-len);}

var svr=express();
svr.server=svr.listen(port,host,()=>{
    console.log(`server running @ http://${host ? host : 'localhost'}:${port}`);
});
svr.use(bp.urlencoded({extended: false}));
svr.use(bp.json());
svr.use(require("cookie-parser")());
svr.use(express.static("./static"));

svr.all('*',(req,res,nxt)=>{
    if(req.body)console.log(req.body);
    nxt();
});

function pr(status,data){return {status,data};}
function chkToken(email,token){
    var t=db.tokens.qry(email);
    return t&&t.token==token;
}

const 
    WrongToken='Wrong token!',
    WrongMaster='Wrong master',
    Accepted='Accepted',
    Failed='Failed',
    QuotaExceeded='Quota exceeded!';

svr.post("/api/sendToken",async(req,res)=>{
    var email=req.body.email,t=db.tokens.qry(email),token;
    if(!t){
        token=genToken();
        db.tokens.ins(email,token);
    }
    else if(req.body.re){
        token=genToken();
        db.tokens.upd(email,token);
    }
    else token=t.token;
    try{
        var t=await send.sendToken(req.body.email,token);
        res.send(pr(1,'Sent successfully!'));
    }
    catch(e){res.send(pr(0,{error:e}));}
});
svr.get("/api/zone_name",async(req,res)=>{res.send(config.cf.zone_name)});
svr.post("/api/chkToken",async(req,res)=>{
    var {email,token}=req.body;
    if(!chkToken(email,token))res.send(pr(0,{error:WrongToken}));
    else res.send(pr(1,Accepted));
});
svr.post("/api/search",async(req,res)=>{
    var t=db.records.select_name(req.body.name);
    res.send(pr(1,t));
});
function reachQuota(email){
    var t=db.quotas.qry(email),x=t?t.quota:config.limit.per;
    return db.records.count(email)>=x;
}
svr.post("/api/add",async(req,res)=>{
    var {email,token,record}=req.body;
    if(!chkToken(email,token))return res.send(pr(0,{error:WrongToken}));
    var t=db.records.select_name(record.name);
    console.log(t);
    if(t.length&&t[0].email!=email)return res.send(pr(0,{error:WrongMaster}));
    if(reachQuota(email))
        return res.send(pr(0,{error:QuotaExceeded}));
    var t=await cf.add(record),ret=t.result;
    console.log(t);
    if(t.success){
        var {id,type,name,content,ttl}=ret;
        db.records.ins(id,type,name,content,ttl,JSON.stringify(ret),email);
        return res.send(pr(1,t));
    }
    else return res.send(pr(0,{error:t.errors[0].message}));
});
svr.post("/api/edit",async(req,res)=>{
    var {email,token,record}=req.body;
    if(!chkToken(email,token))return res.send(pr(0,{error:WrongToken}));
    var t=db.records.select_name(record.name);
    if(t.length&&t[0].email!=email)return res.send(pr(0,{error:WrongMaster}));
    var t=await cf.update(record),ret=t.result;
    console.log(t);
    if(t.success){
        var {id,type,name,content,ttl}=ret;
        db.records.upd(id,type,name,content,ttl,JSON.stringify(ret),email);
        return res.send(pr(1,t));
    }
    else return res.send(pr(0,{error:t.errors[0].message}));
});
svr.post("/api/del",async(req,res)=>{
    var {email,token,record}=req.body;
    if(!chkToken(email,token))return res.send(pr(0,{error:WrongToken}));
    var t=db.records.qry(record.id);
    if(!t)return res.send(pr(0,'None'));
    if(t.email!=email)return res.send(pr(0,{error:WrongMaster}));
    t=await cf.del(record);
    if(t.success){
        db.records.del(record.id);
        res.send(pr(1,t));        
    }
    else return res.send(pr(0,{error:t.errors[0].message}));
});
svr.post("/api/all",async(req,res)=>{
    var {email,token}=req.body;
    if(!chkToken(email,token))return res.send(pr(0,{error:WrongToken}));
    var t=db.records.select(email);
    return res.send(pr(1,t));
});