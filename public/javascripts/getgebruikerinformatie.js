var xmlhttp = new XMLHttpRequest();
xmlhttp.onreadystatechange = function () {

    if (this.readyState == 4 && this.status == 200) {
        var gebruikersnaam = this.response;
        if (gebruikersnaam) {
            loginButton = document.getElementById('loginbutton');
            loginButton.innerHTML = "Log out";
            loginButton.form.action = '/user/logout';

            loginStatus = document.getElementById('loginstatus');
            loginStatus.innerHTML = "Welkom " + gebruikersnaam;
        }
       
    }
           
}
    
xmlhttp.open('GET', '/user/getGebruikerInfo', true);
xmlhttp.send();


