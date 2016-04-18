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



function pickColor(str) {
  if(str != null) {
    if (str == 'Chennai Super Kings') {
      return "yellow";
    } else if (str == 'Deccan Chargers') {
      return "silver";
    } else if (str == 'Delhi Daredevils') {
      return "navy";
    } else if (str == 'Kings XI Punjab') {
      return "red";
    } else if (str == 'Kolkata Knight Riders') {
      return "purple";
    } else if (str == 'Mumbai Indians') {
      return "blue";
    } else if (str == 'Rajasthan Royals') {
      return "RoyalBlue";
    } else if (str == 'Royal Challengers Bangalore') {
      return "gold";
    } else if (str == 'Sunrisers Hyderabad') {
      return "orange";
    } else if (str == 'Rising Pune Supergiants') {
      return "pink";
    } else if (str == 'Gujarat Lions') {
      return "orange";
    } else if (str == 'Pune Warriors India') {
      return "LightSkyBlue";
    }
  }
  return "inherit";
}


function abbreviate(str) {
  var res = "";
  for(i=0; i<str.length; i++) {
    var character = str.charAt(i);
    if((character==character.toUpperCase()) && (character!=" ")) {
      res += character;
    }
    
  }
  return res;
}

