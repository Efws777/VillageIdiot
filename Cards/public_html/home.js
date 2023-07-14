/**
 * This is the client-side javascript for the home page of village idiot. It includes functionality for
 * opening and closing modals, updating stats and leaderboard (text on the client side),    
 */

//pop up element
var win = document.getElementById("modal");
var winStats = document.getElementById("statsModal");
var winRating = document.getElementById("ratingModal");

//button element
var btn = document.getElementById("questionButton");
var btnStats = document.getElementById("statsButton");
var btnRating = document.getElementById("ratingButton");

//span element that closes the pop up
var span = document.getElementsByClassName("close")[0];
var spanRating = document.getElementsByClassName("close")[1];

//opens pop up when clicked
btn.onclick = function() {
  win.style.display = "block";
}

//opens pop up when clicked
btnStats.onclick = function() {
  var username = localStorage.getItem('username');
  let user = JSON.stringify(username);
  user = user.split(":")
  user = user[1]
  user = user.substring(2, user.length - 4)
  let url = '/stats/' + user;
  var html = '';
  let p1 = fetch(url);
  p1.then( (response) => {
    console.log(response)
    return response.json();
  }).then((stats) => {
    html = '<h1>Stats for ' + user + '</h1>' + '<li id = statsList>' + '<ul>Wins: ' + stats[0].wins +'</ul>' + 
    '<ul>Losses: ' + stats[0].losses + '</ul>' + '<ul>Games played: ' + stats[0].gamesPlayed + '</ul>' + '<ul>Win Percentage: ' 
    + stats[0].winPercentage + '%</ul>' + '</li>'
    let x = document.getElementById('modal-stats');
    x.innerHTML = html;
  }).catch(() => { 
    alert('something went wrong');
  });
  winStats.style.display = "block";

  /*let p2 = fetch('/leaderboard');
  p2.then( (response) => {
    console.log(response)
    return response.json();
  }).then((leaderboard) => {
    console.log(leaderboard)

    html += '<h1>Leaderboard</h1>' + '<li id = statsList>';
    for (i = 0; i < 5; i++){
      if (i < leaderboard.length){
        html += '<ul>' + (i+1) + ': ' + leaderboard[i].username + " - " + leaderboard[i].winPercentage + '%</ul>';
      }
      else{
        html += '<ul>' + (i+1) + ': ' + "........." + " - " + ".......%" + '</ul>';
      }
    }
    html += '</li>';
    let x = document.getElementById('modal-stats');
    x.innerHTML = html;
  }).catch(() => { 
    alert('something went wrong');
  });*/
}

//opens pop up when clicked
btnRating.onclick = function() {
  winRating.style.display = "block";
}

//closes the pop up when user clicks the x
span.onclick = function() {
  win.style.display = "none";
}

//closes the pop up when user clicks the x
spanRating.onclick = function() {
  winRating.style.display = "none";
}

//closes the pop up when user clicks outside of the pop up
window.onclick = function(event) {
  if (event.target == win) {
    win.style.display = "none";
  }
  if (event.target == winStats) {
    winStats.style.display = "none";
  }
  if (event.target == winRating) {
    winRating.style.display = "none";
  }
}

//sends request to server to save a review in database
function saveReview() {
  var username = localStorage.getItem('username');
  let user = JSON.stringify(username);
  user = user.split(":")
  user = user[1]
  let u = user.substring(2, user.length - 4)
  let r = document.getElementById("rating").value;
  let p = document.getElementById("positives").value;
  let i = document.getElementById("improve").value;
  let url = '/review/' + u + '/' + r + '/' + p + '/' + i;
  fetch(url).then( (response) => {
    if (response.ok) {
      alert("REVIEW SUBMITTED SUCCESFULLY")
    }
  });
}

//sends the user to page to play 3-person village idiot
function playBots() {
  window.location.href = 'play3People.html';
}

//sends the user to page to play 2-person village idiot
function playPeople() {
  window.location.href = 'play2People.html';
}

//sends the user to page to view account stats, leaderboard, and friend other accounts
function accountLoad(){
  window.location.href = 'account.html'
}