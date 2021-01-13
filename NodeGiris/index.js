const bodyParser=require("body-parser");
const express=require("express");
const app=express();
app.use(bodyParser.urlencoded( {extended:true}));
app.set('view engine', 'ejs');






app.get('/', function(req,res){

  res.sendFile(__dirname + "/index.html");
})

app.get("/iletisim",function(req,res){

  res.sendFile(__dirname + "/iletisim.html");

});

app.get("/giris",function(req,res){

  res.sendFile(__dirname + "/giris.html");

});

app.get("/profil",function (req,res) {
  res.send("get ile geldin");
});
app.post("/profil",function (req,res) {


if(req.body.Kullaniciadi=="Emre" && req.body.sifre=="1234"){
  res.send("Hosgeldiniz " + req.body.Kullaniciadi);
}else{
  res.send("Bilgiler Hatalı!!");
}
});

app.get("/yazi",function(req,res){

  var gonderilecekler={
     baslik : "Almanya Hükümetinden Açıklama",
 yorumsayisi :"30",
 yazar:"Recep Bey"}
res.render("yazi",gonderilecekler);
});

app.get("/urun",function(req,res){
var urunler={
  baslik:"En Çok Tercih Edilenler",
  yorumsayisi:"41"}
  res.render("urun",urunler);


});
app.get("/kitap",function(req,res){
var kitaplar={
  kitapAdi:"Olasılıksız",
yazarAdi:"Adam Fawer",
aciklama:"Amerikalı yazar Adam Fewer’ın 2005 yılında yayınladığı “Olasılıksız”, tüm dünyada büyük yankı uyandıran bir başyapıt niteliği taşıyor. “İnsan, beyninin ne kadarını kullanabilir ki?” sorusuna yanıtların arandığı bu kitap, okuyucuları matematiksel düşüncenin ve bilimin etrafında topluyor. Eserde işlenen konu, Laplace’in şeytanı teorisi üzerinde dururken, aslında hiçbir şeyin şans eseri olmadığını ve geçmişteki olayların etkileşimi ile bu anın yaşanabileceğini gözler önüne seriyor. Zekice oluşturulmuş bir kurgu ile karşı karşıya kalacağınız bu kitap, sizi içerisinden çıkamayacağınız bir olasılıklar zincirine davet ediyor.",
fiyat:"23tl"
}
  res.render("kitap",kitaplar);


});


app.get("*",function(req,res){
  res.send("Hataa ! Yanlış sayfadasınız.Lütfen tarayıcınızın ayarlarıyla oynayınız.")
});



app.listen(8000);
