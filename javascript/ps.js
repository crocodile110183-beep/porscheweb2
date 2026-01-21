function Open718() {
    window.open("/718/718.html")
    self.close()
}
function Open911() {
    window.open("/911/911.html")
    self.close()
}
function OpenTC() {
    window.open("/Taycan/Taycan.html")
    self.close()
}
function OpenPNMR() {
    window.open("/Panamera/Panamera.html")
    self.close()
}
function openMenu() {
    window.open("/index.html")
    self.close()
}
function openPC() {
    window.open("https://connect-store.porsche.com/offer/sg/en-SG")
}
function openJD() {
    window.open("https://racing.porsche.com/articles/formulae-jeddah-race-report-2025")
}

function box1enter() {
    document.getElementById("card-2").classList.add("shrink");
}
function box1leave() {
    document.getElementById("card-2").classList.remove("shrink");
    document.getElementById("card-2").classList.add("filter");
}
function box2enter() {
    document.getElementById("card-1").classList.add("shrink");

}
function box2leave() {
    document.getElementById("card-1").classList.remove("shrink");
    document.getElementById("card-1").classList.add("filter");
}
function box3enter() {
    document.getElementById("card-4").classList.add("shrink");
}
function box3leave() {
    document.getElementById("card-4").classList.remove("shrink");
    document.getElementById("card-4").classList.add("filter");
}
function box4enter() {
    document.getElementById("card-3").classList.add("shrink");
}
function box4leave() {

    document.getElementById("card-3").classList.remove("shrink");
    document.getElementById("card-3").classList.add("filter");
}


function openNav1() {
    document.getElementById("mySidenav").style.width = "100%";
    document.getElementById("body").classList.add("blur");
}

function closeNav1() {
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("body").classList.remove("blur");
}


