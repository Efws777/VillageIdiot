function getUsername(){
    document.getElementById('nameHeader').innerText = "Hi " + getUser() + "!";
}


function getUser(){
    return document.cookie.split("%22")[3];
}

function getStats() {
    user = getUser();
    var html = '';
    /*let url = '/stats/' + user;
    let p1 = fetch(url)
    p1.then( (response) => {
        console.log(response);
        console.log(response.json());
        return response.json();
    }).then((stats) => {
        console.log(stats.json());
        console.log(stats.text());
    }).then((data) => {
        console.log(data);
        /*html = '<h1>Stats for ' + user+ '</h1>' + '<li id = statsList>' + '<ul>Wins: ' + 
        stats[0].wins +'</ul>' + '<ul>Losses: ' + stats[0].losses + '</ul>' + '<ul>Games played: ' + stats[0].gamesPlayed 
        + '</ul>' + '<ul>Win Percentage: ' + stats[0].winPercentage + '</ul>' + '</li>';
    }).catch(() => { 
        alert('something went wrong 1');
    });*/

    let p2 = fetch('/leaderboard');
    p2.then( (response) => {
        return response.json();
    }).then((leaderboard) => {
        html += '<h1>Leaderboard</h1>' + '<ul id = statsList>';
        for (i = 0; i < 5; i++){
            if (i < leaderboard.length){
                html += '<li>' + (i+1) + ': ' + leaderboard[i].username + " - " + leaderboard[i].winPercentage + '%</li>';
            }
            else{
                html += '<li>' + (i+1) + ': ' + "........." + " - " + ".......%" + '</li>';
            }
        }
        html += '</ul>';
        document.getElementById("left").innerHTML = html;
    }).catch(() => { 
        alert('something went wrong');
    });
    document.getElementById("left").innerHTML = html;
}

//Pulls up all the users whose name contains the input and displays stats
function searchUsers(){
    console.log(document.getElementById("searchBar").value);
    keyword = document.getElementById("searchBar").value;
    fetch('/search/stats/' + keyword)
    .then((response) => {
        return response.text();
    }).then((data) => {
        data = JSON.parse(data);
        writeUsers(data);
    });
}

//Will write users and give the opportunity to follow them if you're not following them already
function writeUsers(data){
    fetch('/search/stats/' + getUser())
    .then( (response) => {
        return response.json()
    }).then((u) => {
        result = "<input type=\"text\" id=\"searchBar\"> <br> <button id = \"search\" type = \"button\" onclick=\"searchUsers()\">Search Users</button>";
                //+ "<button id = \"follow\" type = \"button\" onclick=\"getFollowing()\">Following</button>";
        for (let i = 0; i < data.length; i++){
            console.log(data[i]);
            if (data[i].username != getUser()){
                result += "<div class=\"itemDiv\"> <h2>" +  data[i].username + "</h2>\n<p>Wins: "+
                    data[i].wins + "<p>\n </p>Losses: " + data[i].losses + "<p>\n</p>Games played: " + data[i].gamesPlayed
                    + "</p>\n<p>Win Percentage: " + data[i].winPercentage + "%</p>";        
                /*if ((u[0].following).includes(data[i]._id) == false){
                    //Each button has the id of the item that it is linked to
                    result += "<button class=\"followButton\" type=\"button\" id=\""
                        + data[i]._id + "\" onclick=\"follow(this.id)\">Follow</button>\n</div>\n";
                }
                else {
                    result += "<p>Following</p>\n</div>\n";
                }*/
            }
        }
        document.getElementById("right").innerHTML = result;
    })
}

/*//Follows a user
function follow(id){
    u = getUser();
    console.log(id)
    console.log(u)
    fetch('/follow/' + id + '/' + u)
    .then((response) =>{
        if (response.ok) {
            alert("Good")
        }
        else{
            alert("BAd")
        }
        console.log("Followed")
        console.log(response);
    })
}

//????????????????
function getFollowing(){
    u = getUser();
    fetch('/following/' + u)
    .then((response) => {
        console.log(response)
        console.log(response.text());
        console.log(response.json());
        console.log("DONE")
        return response.json();
    })/*.then((data) => {
        console.log(data);
        writeFollowers(data);
    });
}
//????????????
function writeFollowers(data){
    console.log(data);
    result = "<input type=\"text\" id=\"searchBar\"><button id = \"search\" type = \"button\" onclick=\"searchUsers()\">Search Users</button>"
        + "<button id = \"follow\" type = \"button\" onclick=\"getFollowing()\">Following</button>";
    for (let i = 0; i < data.length; i++){
        console.log(data[i]);
        result += "<div class=\"itemDiv\"> <h2>" +  data[i].username + "</h2>\n<p>Wins: "+
            data[i].wins + "<p>\n </p>Losses: " + data[i].losses + "<p>\n</p>Games played: " + data[i].gamesPlayed
            + "</p>\n<p>Win Percentage: " + data[i].winPercentage + "</p>";        
        document.getElementById("right").innerHTML = result;
    }
}*/