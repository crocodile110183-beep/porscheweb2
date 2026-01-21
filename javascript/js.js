function openNav() {
    document.getElementById("mySidenav").style.width = "40%";
    document.getElementById("main").classList.add("blur");
    document.getElementById("main2").classList.add("blur");
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("main").classList.remove("blur");
    document.getElementById("main2").classList.remove("blur");
}



