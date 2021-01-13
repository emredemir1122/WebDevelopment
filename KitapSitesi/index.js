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
const app     = express();
app.use(bodyParser.urlencoded( {extended: true} ));
app.set("view engine" , "ejs");
app.use(express.static(__dirname + "/dosyalar"));
var connection = mysql.createConnection({
  multipleStatements :true,
  host     : 'localhost',
  user     : 'root',
  password : '12344321',
  database : 'bilgiler'
});
connection.connect(function(err){
  if(err) throw err;
  console.log("MYSQL'e bağlandı..");
});







app.get("/" , function(req , res){
    connection.query("SELECT * from bilgiler.kitaplar WHERE kategori='Roman' LIMIT 6 ; SELECT * from kategoriler ; SELECT * from bilgiler.kitaplar WHERE kategori='Bilim' LIMIT 6 ; SELECT * from kitaplar ORDER BY satis DESC LIMIT 5"  , function(err, results, fields){
      if(err) throw err;


      var veriTabani6RomanKitabi = results[0];
      var veriTabaniKategoriler=results[1];
      var veriTabani6BilimKitabi = results[2];
      var veriTabaniCokSatanlar = results[3];

      res.render("anasayfa" , { bilimler : veriTabani6BilimKitabi,romanlar :  veriTabani6RomanKitabi, kategoriler:veriTabaniKategoriler, coksatanlar:veriTabaniCokSatanlar} );
    });
});
// kitapsitesi.com/kitap/TehlikeliOyunlar/78
app.get("/kitap/:isim/:id", function(req, res){
    var idDegeri = req.params.id; // -> 78
    var sql = "SELECT * from kitaplar WHERE id = " + idDegeri ;
    kategorileriAl(function(kategoriler){
      connection.query(sql, function(err, results, fields){
          if(err) throw err;
          console.log(results);
          var kitapId         = results[0].id;
          var kitapYazar      = results[0].yazar;
          var kitapAciklama   = results[0].aciklama;
          var kitapResim      = results[0].resimLinki;
          var kitapYayinEvi   = results[0].yayinEvi;
          var kitapIsmi       = results[0].kitapismi;
          var kitapFiyati     = results[0].fiyat;
          var kitapKategori   = results[0].kategori;
          var sql2 = "SELECT * FROM bilgiler.kitaplar WHERE kategori = '"+kitapKategori+"' AND id != "+kitapId+" ORDER BY satis DESC LIMIT 6"
          connection.query(sql2, function(err, results, fields){
            res.render("kitap" , { yazar : kitapYazar,
                                   aciklama: kitapAciklama,
                                   resim : kitapResim,
                                   yayinEvi : kitapYayinEvi,
                                   isim : kitapIsmi ,
                                   fiyat : kitapFiyati,
                                   kategori : kitapKategori,
                                   kitaplar : results,
                                   kategoriler : kategoriler
                                 });
          });
      });
    });
});

var kategoriler=[];

function kategorileriAl(callback){
  if(kategoriler.length>0){
    callback(kategoriler);
  }else{
    connection.query("SELECT * from kategoriler", function(err, results, fields){
      kategoriler=results;
      return callback(kategoriler);
    });
  }

}



app.get("/kategori/:kategorilink", function(req, res){
    kategorileriAl(function(gelenKategoriler){
      // kategoriler geldi...
        var kategoriLink = req.params.kategorilink; // edebiyat
        var sql = "SELECT bilgiler.kitaplar.* FROM bilgiler.kitaplar LEFT JOIN bilgiler.kategoriler ON bilgiler.kategoriler.kategori_link = '"+ kategoriLink +"' WHERE bilgiler.kategoriler.kategori_ismi = bilgiler.kitaplar.kategori"
        connection.query(sql , function(err , results, fields){
            res.render("kategori", {kitaplar : results , kategoriler : gelenKategoriler} );
        });
    });
});





app.get("/arama" , function(req, res){
    // veritabanına bağlanacağız, orada bu kelimeye ait
    // kitap varsa, onları kullanıcıya göstereceğiz.
    var kelime = req.query.kitap;
    // veritabanı bağlantısı oluşturalım. kullanıcın aradığı kelimeyi veritabanına soralım,
    // bulduğumuz sonuçları ekrana yazdıralım.
    var sql = "SELECT * from kitaplar WHERE kitapismi LIKE '%" + kelime + "%'";

    connection.query(sql+"; SELECT * from kategoriler",  function(err, results, fields){
      res.render("arama" , { kitaplar : results[0],kategoriler:results[1] });
    });
});


app.get("/kitapekle", function(req, res){
    res.sendFile(__dirname + "/views/kitapekle.html");
});
app.post("/veritabanina-ekle", upload.single('dosya') , function(req, res){
  var resimlinki="";

if(req.file){
  resimlinki="/resimler/"+req.file.filename;
}

    var kitapismi = req.body.kitapismi;
    var yazar     = req.body.yazar;
    var fiyat     = req.body.fiyat;
    var kategori  = req.body.kategori;
    var yayinevi  = req.body.yayinEvi;
    var aciklama  = req.body.aciklama;
    console.log(req.body);
    console.log(req.body.kitapismi);
    // veritabanına ekleme işlemi yapacağız.
    //kitapismi, fiyat, resimlinki, yayinevi, aciklama, yazar, kategori
    var sql = "INSERT INTO bilgiler.kitaplar (kitapismi, fiyat, resimLinki, yayinEvi, aciklama, yazar, kategori) VALUES('"+kitapismi+"','"+ fiyat+"', '"+resimlinki+"' ,'"+ yayinevi + "','" + aciklama +"','"+ yazar +"','"+ kategori+"')";
    connection.query(sql, function(err, results, fields){
      res.redirect("/kitapekle");
    });
});

let port = process.env.PORT;
if(port == "" || port == null){
  port = 5000;
}
app.listen(port, function(){
  console.log("port : " + port);
});
