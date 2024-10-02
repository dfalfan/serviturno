function startTime() {
  var n = new Date(),
    e = n.getHours(),
    t = n.getMinutes(),
    a = n.getSeconds();
  (t = checkTime(t)),
    (a = checkTime(a)),
    (document.getElementById("txt").innerHTML = e + ":" + t),
    setTimeout(function () {
      startTime();
    }, 500);
}

function checkTime(n) {
  return n < 10 && (n = "0" + n), n;
}

var conn = new WebSocket("ws://192.168.5.25:8080");

conn.onopen = function (n) {
  console.log("Conexión establecida!");
};

conn.onmessage = function (n) {
  console.log(n.data);
  if ("Actualizar pantalla" === n.data.split("|")[0]) {
    console.log("Actualizando pantalla");
    location.reload(true);
  }
};

$(document).ready(function () {
  $(".tickets").show();
  $(".ticket").each(function (n) {
    $(this)
      .hide()
      .delay(200 * n)
      .fadeIn(500);
  });
});
