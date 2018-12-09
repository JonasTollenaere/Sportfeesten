var table = document.getElementById("myTable");
var rows = table.rows;
var i;
var classes = ["", "gold", "silver", "bronze"]
for (i = 1; i <= 3; i++) {
    var row = rows[i];
    row.className += classes[i];
    var parent = rows[i].getElementsByTagName("a")[0];
    var image = document.createElement("img")
    image.src = "/images/medal" + i + ".ico";
    image.style.heigh = '16px';
    image.style.width = '16px';
    image.style.display = "inline-block";
    image.style.align = 'left';
    parent.appendChild(image);
}