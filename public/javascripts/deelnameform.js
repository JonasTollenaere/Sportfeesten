function updateDisciplines() {
    
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {

        if (this.readyState == 4 && this.status == 200) {
            var wedstrijden = JSON.parse(this.response);

            var select = document.getElementById("wedstrijd");
            select.options.length = 0;
            
            var defaultoption = new Option();
            if (wedstrijden.length == 0) {
                defaultoption.innerHTML = "Er zijn voorlopig geen disciplines ingevoerd bij dit sportfeest";
                select.disabled = true;
                document.getElementById('submitbutton').disabled = true;
            }
            else {
                defaultoption.innerHTML = "Selecteer een discipline";
                select.disabled = false;
                document.getElementById('submitbutton').disabled = false;
            }

            defaultoption.disabled = true;
            defaultoption.selected = true;
            defaultoption.value = null;
            defaultoption.style = 'display:none';
            select.options.add(defaultoption);
            
            wedstrijden.forEach(function (wedstrijd) {
                var newoption = new Option();
                newoption.text = wedstrijd.discipline.naam;
                newoption.value = wedstrijd._id;
                select.options.add(newoption);
            });
        }
           
    }
    var sportfeest = document.getElementById('sportfeest');
    var sportfeestid = sportfeest.value;

    xmlhttp.open('GET', '/menu/getWedstrijden/' + sportfeestid, true);
    xmlhttp.send();


    
}