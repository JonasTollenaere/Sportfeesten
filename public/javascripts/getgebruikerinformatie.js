function getGebruikerInfo() {
    
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {

        if (this.readyState == 4 && this.status == 200) {
            var wedstrijden = JSON.parse(this.response);
            
        }
           
    }
    
    xmlhttp.open('GET', '/user/getGebruikerInfo/', true);
    xmlhttp.send();


    
}