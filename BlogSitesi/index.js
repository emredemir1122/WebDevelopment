
const multer=require("multer");

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname + '/dosyalar/resimler')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + '.jpg')
  }
});
var upload = multer({ storage: storage });

const mysql = require("mysql");
const bodyParser = require("body-parser");
const express = require("express");
var session =require('express-session');
const app = express()
app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'Matematik Okulu',
resave:true,
saveUninitialized:true
}))

app.use(bodyParser.urlencoded( {extended: true} ));
app.set("view engine" , "ejs");
app.use(express.static(__dirname + "/dosyalar"));
app.use(bodyParser.json());

var connection = mysql.createConnection({
  multipleStatements :true,
  host     : 'localhost',
  user     : 'root',
  password : '12344321',
  database : 'blogsitesi'
});
connection.connect(function(err){
  if(err) throw err;
  console.log("MYSQL'e bağlandı..");
});

var kategoriler=[];
var cokOkunanlar=[];

function getKategoriler(callback){
if (kategoriler.length>0){
  callback(kategoriler);
}else{
connection.query("SELECT * FROM kategoriler",function(err,results,fields){
kategoriler=results;
callback(results);

});
}

}

function getCokOkunanlar(callback){

if(cokOkunanlar.length>0){
  callback(cokOkunanlar)
}else{

connection.query("SELECT * FROM makaleler ORDER BY okunmasayisi DESC",function(err,results,fields){
cokOkunanlar=results;
callback(results);

});

}
}

app.get("/",function(req,res){

getCokOkunanlar(function(gelenCokOkunanlar){
  getKategoriler(function(gelenKategoriler){

connection.query("SELECT * FROM makaleler",function(err,results,fields){

  res.render("anasayfa",{kategoriler: gelenKategoriler,cokOkunanlar:gelenCokOkunanlar,makaleler:results});
  });

})



});


});



app.get("/kategori/:link",function(req,res){

var hangiLink=req.params.link;

getKategoriler(function(gelenKategoriler){

getCokOkunanlar(function(getCokOkunanlar){
var sql="SELECT blogsitesi.makaleler. * FROM blogsitesi.makaleler LEFT JOIN blogsitesi.kategoriler ON blogsitesi.kategoriler.link ='"+hangiLink+"'WHERE blogsitesi.kategoriler.isim =blogsitesi.makaleler.kategori";
connection.query(sql,function(err,results,fields){
  res.render("anasayfa",{kategoriler:gelenKategoriler,cokOkunanlar:getCokOkunanlar,makaleler:results});
});

});


});

});



app.get("/yazi/:id",function(req,res){

var yaziId=req.params.id;

getKategoriler(function(gelenKategoriler){

getCokOkunanlar(function(getCokOkunanlar){
  var artirmaSorgusu="UPDATE blogsitesi.makaleler SET okunmasayisi=blogsitesi.makaleler.okunmasayisi +1 WHERE blogsitesi.makaleler.id = " + yaziId;

connection.query(artirmaSorgusu);

connection.query("SELECT * FROM blogsitesi.yorumlar WHERE yorum_id = "+yaziId + " AND onay = 1",function(err,results,fields){

  var gelenYorumlar=results;


var sql="SELECT * FROM blogsitesi.makaleler WHERE id = " + yaziId;
connection.query(sql,function(err,results,fields){
  res.render("yazi",{kategoriler:gelenKategoriler,cokOkunanlar:getCokOkunanlar,
                            baslik:results[0].baslik,tarih:results[0].tarih,okunmasayisi:results[0].okunmasayisi,
                            resim:results[0].resim,aciklama:results[0].aciklama,
                          id:results[0].id,yorumlar:gelenYorumlar});
});
});
});


});

});






app.get("/makaleekle",function(req,res){

res.sendFile(__dirname + "/views/makaleekle.html");


});

app.post("/veritabanina-ekle",upload.single("dosya"),function(req,res){

  var resimlinki="";
if(req.file){
  resimlinki="/resimler/"+req.file.filename;
}

var kategori=req.body.kategori;
var baslik=req.body.baslik;
var yazi=req.body.makale;

 date =new Date()
var tarih=date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate();
 var degerler="'"+baslik+"','"+yazi+"','"+resimlinki+"','"+kategori+"','"+tarih+"',0";
var sql="INSERT INTO makaleler (baslik,aciklama,resim,kategori,tarih,okunmasayisi) VALUES("+degerler+")";
connection.query(sql,function(err,results,fields){

res.redirect("/admin-makaleekle");


})


})




app.get("/admin-paneli",function(req,res){

if(req.session.kullanici){
  res.redirect("/admin-makaleler");
}else{
  res.sendFile(__dirname +"/views/giris.html");
}

});


app.post("/yorum-gonder",function(req,res){

var isim =req.body.isim;
var yorum=req.body.yorum;
var yaziId =req.body.id;

console.log(req.body);

var sql ="INSERT INTO blogsitesi.yorumlar (isim,yorum,yorum_id,onay) VALUES('"+isim+"','"+yorum+"',"+yaziId+",0)";
connection.query(sql,function(err,results,fields){

  res.redirect("/yazi/"+yaziId);
});

});

app.get("/admin-yorumlar",function(req,res){

  var sql ="SELECT * FROM blogsitesi.yorumlar";
  connection.query(sql,function(err,results,fields){

    res.render("admin-yorumlar",{yorumlar:results});
  });


});
app.get("/yorumonayla",function(req,res){
  var yorumId=req.query.id;
  var sql ="UPDATE blogsitesi.yorumlar SET onay = 1 WHERE id= " +yorumId;
  connection.query(sql,function(err,results,fields){

    res.redirect("/admin-yorumlar");
  });


})


app.get("/admin-makaleekle",function(req,res){

res.render("admin-makaleekle")

});

app.get("/admin-makaleler",function(req,res){

  connection.query("SELECT * FROM makaleler",function(err,results,fields){

  res.render("admin-makaleler",{makaleler:results});

  })




});

app.get("/yazisil",function(req,res){

var id=req.query.id;

connection.query("DELETE FROM makaleler WHERE id= " +id,function(err,results,fieldz){

res.redirect("/admin-makaleler");

});

})




app.post("/giris-kontrol",function(req,res){
var email=req.body.email;
var pass=req.body.password;
connection.query("SELECT * FROM profil",function(err,results,fields){
var veritabanindakiKullaniciAdi =results[0].kullaniciadi;
var veritabanindakiSifre =results[0].sifre;
  if(veritabanindakiKullaniciAdi==email && veritabanindakiSifre==pass){

req.session.kullanici=veritabanindakiKullaniciAdi;

  res.redirect("/admin-makaleler");
  }else{
    res.redirect("/admin-paneli");
  }

});


});

app.get("/cikis",function(req,res){

  delete req.session.kullanici;
  res.redirect("/");
})

app.listen(5000);
