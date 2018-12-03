var xmlhttp = new XMLHttpRequest();
xmlhttp.onreadystatechange = function () {

    if (this.readyState == 4 && this.status == 200) {
        var gebruikersnaam = this.response;
        if (!gebruikersnaam) {
            loginDiv = document.getElementById('loginDiv');
            loginDiv.hidden = false;
        }
        else {
            adminDiv = document.getElementById('adminDiv');
            adminDiv.hidden = false;
            loginDiv = document.getElementById('loginDiv');
            loginDiv.hidden = true;


        }
       
    }
           
}
    
xmlhttp.open('GET', '/user/getGebruikerInfo', true);
xmlhttp.send();


