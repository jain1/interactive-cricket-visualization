function launchSeason() {
  var x = document.getElementById("seasonSelect").value;
  treemap(x);
}

function dropdown() {
      document.getElementById("dropdown-list").classList.toggle("show");
  }

  // Close the dropdown if the user clicks outside of it
window.onclick = function(e) {
  if (!e.target.matches('.dropbtn')) {

    var dropdowns = document.getElementsByClassName("dropdown-content");
    for (var d = 0; d < dropdowns.length; d++) {
      var openDropdown = dropdowns[d];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
}


