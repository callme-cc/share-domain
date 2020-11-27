"use strict";
const Database=require("better-sqlite3");
var DB=new Database('./db.db');
// DB.prepare("DROP TABLE records").run();
DB.prepare("CREATE TABLE IF NOT EXISTS records (id,type,name,content,ttl,json,email)").run();
const records={
    _ins:DB.prepare("INSERT INTO records (id,type,name,content,ttl,json,email) VALUES (?,?,?,?,?,?,?)"),
    ins(id,type,name,content,ttl,json,email){this._ins.run(id,type,name,content,ttl,json,email);},
    _upd:DB.prepare("UPDATE records SET type=?,name=?,content=?,ttl=?,json=?,email=? WHERE id=?"),
    upd(id,type,name,content,ttl,json,email){this._upd.run(type,name,content,ttl,json,email,id);},
    _qry:DB.prepare("SELECT * FROM records WHERE id=?"),
    qry(id){return this._qry.get(id);},
    select(email){return DB.prepare("SELECT * FROM records WHERE email=?").all(email);},
    select_name(name){return DB.prepare("SELECT * FROM records WHERE name=?").all(name);},
    del(id){return DB.prepare("DELETE FROM records WHERE id=?").run(id);},
    _count:DB.prepare("SELECT COUNT(DISTINCT name) AS num FROM records WHERE email=?"),
    count(email){return this._count.get(email).num;}
}

DB.prepare("CREATE TABLE IF NOT EXISTS tokens (email,token)").run();
const tokens={
    _ins:DB.prepare("INSERT INTO tokens (email,token) VALUES (?,?)"),
    ins(email,token){this._ins.run(email,token);},
    _upd:DB.prepare("UPDATE tokens SET token=? where email=?"),
    upd(email,token){this._upd.run(token,email);},
    _qry:DB.prepare("SELECT * FROM tokens WHERE email=?"),
    qry(email){return this._qry.get(email);}
}
DB.prepare("CREATE TABLE IF NOT EXISTS quotas (email,quota)").run();
const quotas={
    _ins:DB.prepare("INSERT INTO quotas (email,quota) VALUES (?,?)"),
    ins(email,quota){this._ins.run(email,quota);},
    _upd:DB.prepare("UPDATE quotas SET quota=? where email=?"),
    upd(email,quota){this._upd.run(quota,email);},
    _qry:DB.prepare("SELECT * FROM quotas WHERE email=?"),
    qry(email){return this._qry.get(email);}
}
module.exports={
    records,tokens,quotas
}