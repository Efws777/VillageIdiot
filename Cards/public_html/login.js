/**
 * This is the client-side javascript for the login page of village idiot. This file provides the functionality for
 * the login button and create account button. Modal functionality is included to let the user know when they have typed
 * in an incorrect password, are trying to claim a username that is already taken, and when they have successfully created 
 * an account.
 */

//gets modals and x buttons to close modals
var win = document.getElementById("modal");
var span = document.getElementsByClassName("close")[0];
var loginWin = document.getElementById("loginModal");
var spanTwo = document.getElementsByClassName("close")[1];
var takenWin = document.getElementById("takenModal");
var spanThree = document.getElementsByClassName("close")[2];

//closes the pop up when user clicks the x
span.onclick = function() {
    $('#modal').modal('hide');
}

//closes the pop up when user clicks the x
spanTwo.onclick = function() {
    $('#loginModal').modal('hide'); 
}

//closes the pop up when user clicks the x
spanThree.onclick = function() {
  $('#takenModal').modal('hide'); 
}

//closes the pop up when user clicks outside of the pop up
window.onclick = function(event) {
  if (event.target == win) {
    $('#modal').modal('hide');
  }
  if (event.target == loginWin) {
    $('#loginModal').modal('hide'); 
  }
  if (event.target == takenWin) {
    $('#takenModal').modal('hide'); 
  }
}

//sends request to server to create a user account
function createAccount() {
    let u = $('#username').val();
    let p = $('#password').val();
    $.get(
      '/account/create/' + u + '/' + encodeURIComponent(p),
      (data, status) => {
        if (data == 'SUCCESS') { 
            $('#modal').modal('show'); 
        }
        else if (data == 'FAIL') {
            $('#takenModal').modal('show'); 
        }
    });
  }

//sends request to server to login to user account
function login() {
  let u = $('#usernameLogin').val();
  let p = $('#passwordLogin').val();
  $.get(
    '/account/login/' + u + '/' + encodeURIComponent(p),
    (data, status) => {
        if (data == 'SUCCESS') {
          window.location.href = '/home.html';
          var username = {username: u};
          localStorage.setItem('username', JSON.stringify(username))
        }
        else {
          $('#loginModal').modal('show'); 
        } 
  });
}