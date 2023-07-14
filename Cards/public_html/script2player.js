/**
 * This is the client-side javascript for a 2 player game of village idiot. There is one AI player
 * across from the user. The cards are moved using cards.js, and the hands and decks are created 
 * using that too.
 */

turn = 0;
done = true;

/**
 * This function sets up the hands for the game and deals 3 people's hands - 3 cards facedown, 3
 * faceup, and 3 for their hand. It also sets up the deck and the discard pile, and the trash pile
 * for when someone plays a 10. Then it calls play() to play the game.
 */
function gameSetup(){
    //Set button display types to none
    document.getElementById("startButton").style.display = "none";
    document.getElementById("playOne").style.display = "none";
    document.getElementById("playAll").style.display = "none";
    //Create card table, the card deck, and the trash pile
    cards.init({table:'#card_table', type:STANDARD});
    deck = new cards.Deck();
    deck.x -= 50;
    deck.addCards(cards.all);
    deck.render({immediate:true});
    trash = new cards.Deck({faceUp:true});
    trash.x += 400;

    //Deals 3 hands (top is p2, bottom is p1 - the one played by the person)
    p2Hand = new cards.Hand({faceUp:false, y:50});
    p2Down = new cards.Hand({faceUp:false, y:50, x:625});
    p2Up = new cards.Hand({faceUp:true, y:60, x:625});
    p1Hand = new cards.Hand({faceUp:true, y:450});
    p1Down = new cards.Hand({faceUp:false, y:450, x:625});
    p1Up = new cards.Hand({faceUp:true, y:440, x:625});

    //Deck has a built in method to deal to hands.
    deck.deal(3, [p1Hand, p1Down, p1Up, p2Hand, p2Down, p2Up], 50);
    //deck.deal(20, [p1Hand, p2Hand], 1)
    //swapPlayerCards(p1Hand, p1Up);

    //Set up discard pile
    discard = new cards.Deck({faceUp:true});
    discard.x += 50;
    deck.render({callback:function() {
        //discard.addCard(deck.topCard());
        discard.render({callback:function(){
            //trash.addCards(deck);
            console.log("Game ready");
            AITurn();
            play();
        }});
    }});
    
}

/**
 * This is the function for the player to play the game. It has 3 event handlers, and it will only
 * let you click on a card if it's your turn
 */
function play(){
    //For phase 1 of the game, play card(s) from your hand if it's your turn
    p1Hand.click(function(card){
        if (turn % 2 == 1){
            //Check if the card is valid - played = T if it is, F if not
            const p = new Promise((resolve, reject) => {
                played = checkCard(card, p1Hand)
                resolve(played);
            })
            p.then((played) => {
                //Return out of the promise and listen for another click
                if (played == false){
                    return;
                }
                //8's are skips, add extra turns (handled mostly in collectCards())
                if (discard.topCard().rank == 8){
                    console.log(turn);
                    turn += 1;
                }
                //If you play a 10, you go again - turn += 1
                if (discard.topCard().rank == 10){
                    const p = new Promise(function(resolve, reject){
                        console.log(turn)
                        turn += 1;
                        len = discard.length
                        //Add all the cards to the trash pile
                        for (i = 0; i < len; i++){
                            trash.addCard(discard[0]);
                        }
                        resolve();
                    })
                    p.then(() => {
                        trash.render()
                    })
                }
                //If the deck is empty and so is your hand, move the 3 faceUp cards to your hand
                if (deck.topCard() == null && p1Hand.length == 0 && p1Up.topCard() != null){
                    const p3 = new Promise(function(resolve, reject){
                        for (i = 0; i < 3; i++) {
                            p1Hand.addCard(p1Up[0]);
                        }
                        resolve();
                    })
                    .then(()=>{
                        p1Hand.render();
                    });
                }
            
                //If the deck is not empty, draw back up to 3 cards
                while(p1Hand.length < 3 && deck.topCard() != null){
                    p1Hand.addCard(deck.topCard());
                }
                deck.render();
                p1Hand.render();
                
                turn += 1;
                const p = new Promise((resolve, reject) =>{
                    //Check if game is over
                    isGameOver();
                    resolve();
                })
                p.then(() => {
                    //p2 turn
                    if (turn % 2 == 0 && !(done)){
                        AITurn();
                    }
                    else if (done){
                        endGame();
                    }
                })
            })
        }
    });
    //Handler for phase 3, when the user clicks on their facedown cards. Pick one and hope that
    //it's higher than the top card in the discard
    p1Down.click(function(card){
        //Deck and hand and faceUp cards must all be empty to do this
        if (deck.topCard() == null && p1Hand.length == 0 && p1Up.length == 0 && turn % 2 == 1){
            const p2 = new Promise((resolve, reject) =>{
                //If the card can be played, add it to the discard
                if (discard.topCard() == null || (discard.topCard().rank != 7 && card.rank >= discard.topCard().rank) || 
                        (discard.topCard().rank == 7 && card.rank < discard.topCard().rank) || card.rank == 10 || card.rank == 2){
                    discard.addCard(card);
                    discard.render();
                    turn += 1;
                    console.log(turn);
                }
                //Else you pick up the discard
                else{
                    p1Hand.addCard(card);
                    const p = new Promise((resolve, reject) =>{
                        drawDiscard(p1Hand);
                        resolve();
                    })
                    p.then(()=>{
                        turn += 1;
                        console.log(turn);
                    })
                }
                resolve();
            })
            p2.then(()=> {
                if (discard.topCard() != null){
                    //If you played an 8 or a 10, handle turns
                    if (discard.topCard().rank == 8){
                        turn += 1;
                        console.log(turn);
                    }
                    if (discard.topCard().rank == 10){
                        turn += 1;
                        //Add discard pile to trash pile
                        const p = new Promise(function(resolve, reject){
                            len = discard.length;
                            for (i = 0; i < len; i++){
                                trash.addCard(discard[0]);
                            }
                            resolve();
                        })
                        p.then(() => {
                            trash.render();
                        })
                    }
                }
                //Check if game is over
                const p = new Promise((resolve, reject) =>{
                    isGameOver();
                    resolve();
                })
                p.then(() => {
                    //p2 turn
                    if (turn % 2 == 0 && !(done)){
                        AITurn();
                    }
                    //Render the discard then call endgame
                    else if (done){
                        discard.render({callback:function() {
                            endGame();
                        }})
                    }
                })
            })
        }
    })

    discard.click(() =>{
        if (turn % 2 == 1){
            //Draw the discard pile
            drawDiscard(p1Hand);
            turn += 1;
            //Check if game is over
            const p = new Promise((resolve, reject) =>{
                isGameOver();
                resolve();
            })
            p.then(() => {
                //p2 turn
                if (turn % 2 == 0 && !(done)){
                    AITurn();
                }
                //If done, call endgame
                else if (done){
                    endGame();
                }
            })
        }
    });
}

/**
 * This function contains the logic for the AI player and takes a full turn
 */
function AITurn(){
    console.log("AI goes");
    lowest = null;
    if (turn %2 == 0){
        setTimeout(() => {
            if (p2Hand.topCard() != null){
                //This for loop finds the lowest card that's higher than the top card in the discard
                //that's not a 2 or 10 if possible
                const p = new Promise((resolve, reject)=>{
                    for (i = 0; i < p2Hand.length; i++){
                        //Lowest if discard is null - any card can be played
                        if (discard.topCard() == null){
                            if (lowest == null && (p2Hand[i].rank != 2 && p2Hand[i].rank != 10)) {
                                lowest = i;
                            }
                            else if (lowest != null && (p2Hand[i].rank < p2Hand[lowest].rank || p2Hand[lowest].rank == 2 || p2Hand[lowest].rank == 10) 
                                    && (p2Hand[i].rank != 2 && p2Hand[i].rank != 10)){
                                lowest = i
                            }
                            else if (p2Hand[i].rank == 2 && lowest == null || (p2Hand[i].rank == 2 && lowest != null && p2Hand[lowest].rank == 10)){
                                lowest = i;
                            }
                            else if (p2Hand[i].rank == 10 && lowest == null){
                                lowest = i
                            }
                        }
                        //If discard is not 7, has to be higher or the same rank as what's down
                        else if (discard.topCard().rank != 7){
                            if (lowest == null && p2Hand[i].rank >= discard.topCard().rank && (p2Hand[i].rank != 2 && p2Hand[i].rank != 10)) {
                                lowest = i;
                            }
                            else if (lowest != null && (p2Hand[i].rank < p2Hand[lowest].rank || p2Hand[lowest].rank == 2 || p2Hand[lowest].rank == 10)
                                    && (p2Hand[i].rank >= discard.topCard().rank)  && (p2Hand[i].rank != 2 && p2Hand[i].rank != 10)){
                                lowest = i
                            }
                            else if (p2Hand[i].rank == 2 && lowest == null || (p2Hand[i].rank == 2 && lowest != null && p2Hand[lowest].rank == 10)){
                                lowest = i;
                            }
                            else if (p2Hand[i].rank == 10 && lowest == null){
                                lowest = i
                            }
                        }
                        //If discard is 7, has to be less than 7
                        else if (discard.topCard().rank == 7){
                            if (lowest == null && p2Hand[i].rank < discard.topCard().rank && (p2Hand[i].rank != 2 && p2Hand[i].rank != 10)) {
                                lowest = i;
                            }
                            else if (lowest != null && (p2Hand[i].rank < p2Hand[lowest].rank || p2Hand[lowest].rank == 2 || p2Hand[lowest].rank == 10)
                                    && (p2Hand[i].rank < discard.topCard().rank)  && (p2Hand[i].rank != 2 && p2Hand[i].rank != 10)){
                                lowest = i
                            }
                            else if ((p2Hand[i].rank == 2 && lowest == null) || (p2Hand[i].rank == 2 && lowest != null && p2Hand[lowest].rank == 10)){
                                lowest = i;
                            }
                            else if (p2Hand[i].rank == 10 && lowest == null){
                                lowest = i
                            }
                        }
                    }
                    //The integer of the lowest playable card - null if no cards playable
                    resolve(lowest);
                })
                .then((lowest)=>{
                    //console.log(p2Hand)
                    playable = [];
                    //For playing multiple cards, if there's more than 1 of the lowest card play them all
                    //Unless it's playing a 2 or a 10
                    if (lowest != null){
                        //Go through the hand and make a list of all the cards with the same rank
                        for (i = 0; i< p2Hand.length; i++){
                            //If it's a 2 or a 10, add the one found by the loop above
                            if (p2Hand[lowest].rank == 2 || p2Hand[lowest].rank == 10){
                                playable.push(lowest);
                                break;
                            }
                            else if (lowest != null && p2Hand[i].rank == p2Hand[lowest].rank){
                                playable.push(i);
                            }
                        }
                    }
                    return playable;
                })
                .then((playable)=>{
                    //If the AI can't play, draw the discard pile
                    if (playable.length == 0) {
                        drawDiscard(p2Hand);
                        turn += 1;
                    }
                    else{
                        //Add all cards being played to discard
                        const p = new Promise((resolve, reject) =>{
                            for (j = 0; j< playable.length; j++){
                                discard.addCard(p2Hand[playable[j] - j]);
                            }
                            resolve();
                        })
                        p.then(()=>{
                            turn += 1;
                            discard.render();
                            //Draw back up to 3 cards if the deck exists
                            while(p2Hand.length < 3 && deck.topCard() != null){
                                p2Hand.addCard(deck.topCard());
                            }
                            //If the deck and your hand is gone, move the faceup cards to your hand
                            if (deck.topCard() == null && p2Hand.length == 0 && p2Up.topCard() != null){
                                const p3 = new Promise(function(resolve, reject){
                                    for (i = 0; i < 3; i++) {
                                        p2Hand.addCard(p2Up[0]);
                                    }
                                    resolve();
                                })
                                .then(()=>{
                                    p2Hand.render();
                                });
                            }
                            p2Hand.render({callback:function(){
                                //If it played a 10 or an 8
                                if (discard.topCard().rank == 8){
                                    turn += 1;
                                    console.log(turn);
                                    if (turn % 2 == 0){
                                        AITurn();
                                    }
                                    else{
                                        console.log("Should not happen 342")
                                        return;
                                    }
                                }
                                if (discard.topCard().rank == 10){
                                    const p3 = new Promise(function(resolve, reject){
                                        turn += 1
                                        len = discard.length
                                        //If 10 was played, add all cards to trash pile
                                        for (i = 0; i < len; i++){
                                            trash.addCard(discard[0]);
                                        }
                                        resolve();
                                    })
                                    p3.then(() => {
                                        trash.render({callback:function() {
                                            //p2 extra turn for playing 10
                                            if (turn % 2 == 0){
                                                AITurn();
                                            }
                                            else{
                                                console.log("ERROR 361")
                                                return;
                                            }
                                        }});
                                    })
                                }
                                const p4 = new Promise((resolve, reject) =>{
                                    //Chekcs if game over
                                    isGameOver();
                                    resolve();
                                })
                                p4.then(() => {
                                    //If done, call endGame()
                                    if (done){
                                        discard.render({callback:function(){
                                            endGame();
                                        }})
                                    }
                                    //Else return
                                    return;
                                })
                            }}); 
                        })
                    } 
                });
            }
            //If hand and deck are empty
            else{
                //Generate random number to draw
                index = Math.floor(Math.random() * p2Down.length);
                const p2 = new Promise((resolve, reject) =>{
                    //If the card can be played, do it
                    if (discard.topCard() == null || (discard.topCard().rank != 7 && p2Down[index].rank >= discard.topCard().rank) || 
                            (discard.topCard().rank == 7 && p2Down[index].rank < discard.topCard().rank) || p2Down[index].rank == 10 ||
                            p2Down[index].rank == 2){
                        discard.addCard(p2Down[index]);
                        discard.render({callback:function(){
                            turn += 1;
                            console.log(turn);
                            resolve();
                        }});
                    }
                    //Else draw the discard pile 
                    else{
                        p2Hand.addCard(p2Down[index]);
                        const p = new Promise((resolve, reject) =>{
                            drawDiscard(p2Hand);
                            resolve();
                        })
                        p.then(()=>{
                            turn += 1;
                        })
                        resolve();
                    }
                })
                p2.then(()=> {
                    //If an 8 or a 10 was played
                    if (discard.topCard() != null){
                        if (discard.topCard().rank == 8){
                            turn += 1;
                        }
                        if (discard.topCard().rank == 10){
                            const p = new Promise(function(resolve, reject){
                                turn += 1;
                                len = discard.length;
                                //Add discard pile to trash pile
                                for (i = 0; i < len; i++){
                                    trash.addCard(discard[0]);
                                }
                                resolve();
                            })
                            p.then(() => {
                                trash.render();
                            })
                        }
                    }
                    //Check if game over
                    const p = new Promise((resolve, reject) =>{
                        isGameOver();
                        resolve();
                    })
                    p.then(() => {
                        //p2 turn
                        if (turn % 2 == 0 && !done){
                            AITurn();
                        }
                        //Call endgame 
                        else if (done){
                            discard.render({callback:function(){
                                endGame();
                            }})
                        }
                        //Else - p1 turn
                        return;
                    })
                })
            }
        }, 1500);
    }
}

/**
 * This function draws the discard pile and adds it to the hand that's passed in
 * @param {Hand - collection of cards} hand - a player's hand 
 */
function drawDiscard(hand){
    const p2 = new Promise(function(resolve, reject){
        len = discard.length
        for (i = 0; i < len; i++){
            hand.addCard(discard[0]);
        }
        resolve();
    })
    p2.then(() => {
        hand.render();
        discard.render();
    })
}

/**
 * This function checks if a card can be played and adds it to the pile if it can
 */
async function checkCard(card, hand) {
    valid = false;
    //If the card can be played
    if (discard.topCard() == null || (discard.topCard().rank != 7 && card.rank >= discard.topCard().rank)
            || (discard.topCard().rank == 7 && card.rank < discard.topCard().rank) || card.rank == 2 || card.rank == 10){
        valid = true;
        //Collect all cards of the same rank if the user wants to 
        await collectCards(card, hand)
        .then((value => {
            //Play the cards
            const p = new Promise((resolve, reject) =>{
                for (i = 0; i < value.length; i++){
                    discard.addCard(value[i]);
                }
                resolve();
            })
            p.then(()=>{
                //console.log("Step 4.5 - render");
                discard.render({callback: function() {
                    return true;
                }});
            })
        }));
    }
    //Need the if statement to avoid returning too soon
    if (valid == false){
        console.log("It's doing the wrong thing")
        return false;
    }
}

/**
 * Collect all the cards that the player wants to play
 * @param {card} card - the card the player clicked on
 * @param {Hand - collection of cards} hand - the player's hand
 * @returns - list of card objects that are playable
 */
function collectCards(card, hand){
    //Collect the cards with the same rank as the one they clicked on
    playable = [];
    for (i = 0; i < hand.length; i++){
        if (hand[i].rank == card.rank){
            playable.push(hand[i])
        }
    }
    //Should never happen - card already validated
    if (playable.length == 0){
        console.log("ERROR ZERO SOMEHOW");
        console.log("YOU REALLY MESSED UP");
    }
    //Return that card to be played in checkCard()
    else if(playable.length == 1){
        return new Promise((resolve, reject) =>{
            resolve([card]);
        })
    }
    else {
        //Make these buttons reappear and wait for the player to click on one
        document.getElementById("playAll").style.display = "";
        document.getElementById("playOne").style.display = "";
        return new Promise((resolve, reject) =>{
            //The player clicks play all - return the whole playable list. Set button display to none
            document.getElementById("playAll").addEventListener('click', function(){
                console.log("Played all")
                document.getElementById("playAll").style.display = "none";
                document.getElementById("playOne").style.display = "none";
                //Return all the playable cards
                resolve(playable);
            })
            //The player clicks play one - return the card they clicked. Set button display to none
            document.getElementById("playOne").addEventListener('click', function(){
                console.log("played one")
                document.getElementById("playAll").style.display = "none";
                document.getElementById("playOne").style.display = "none";
                resolve([card]);
            })
        })
    }
}

/**
 * This function checks if the game is over
 */
function isGameOver(){
    //If any player is out of cards, the game has ended
    if((p1Down.length == 0 && p1Hand.length == 0) || (p2Down.length == 0 && p2Hand.length == 0)){
        console.log("GAME OVERRRR")
        done = true;
    }
}

/**
 * This function updates the users stats and redirects them back to the home page
 * @returns None
 */
function endGame(){
    console.log("Game ending");
    won = true;
    if (p1Down.length == 0 && p1Hand.length == 0) {
        won = true;
        alert("YOU WON!!!");
    }
    else{
        alert("YOU LOST!!!");
    }
    var username = localStorage.getItem('username');
    let user = JSON.stringify(username);
    user = user.split(":")
    user = user[1]
    user = user.substring(2, user.length - 4)
    let url = '/stats/update/' + user + '/' + won;
    fetch(url)
    window.location.href = '/home.html'
    return;
}

//Not used - redirects to play.html
function playNow(){
    window.location.href = '/play.html';
}

//pop up element
var win = document.getElementById("modal");
var winStats = document.getElementById("statsModal");

//button element
var btn = document.getElementById("questionButtonGame");
var btnStats = document.getElementById("statsButtonGame");

//span element that closes the pop up
var span = document.getElementsByClassName("close")[0];

//opens pop up when clicked
btn.onclick = function() {
  win.style.display = "block";
}

//Open the stats window and display the stats and the leaderboard; updates stats and leaderboard
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
    }).catch(() => { 
      alert('something went wrong');
    });*/
    winStats.style.display = "block";
  }

//closes the pop up when user clicks the x
span.onclick = function() {
  win.style.display = "none";
}

//closes the pop up when user clicks outside of the pop up
window.onclick = function(event) {
  if (event.target == win) {
    win.style.display = "none";
  }
  if (event.target == winStats) {
    winStats.style.display = "none";
  }
}

//changes clock in the upper right corner
function time(){
    console.log('AWDadwa')
    let text = "";
    var d = new Date();
    var s = d.getSeconds();
    var m = d.getMinutes();
    var h = d.getHours();
    if (h > 12) {
        h = h - 12;
    }
    h = addZero(h)
    m = addZero(m);
    s = addZero(s);
    text = h + ":" + m + ":" + s;
    let x = document.getElementById('clock');
    x.innerText = text;
  }

  function addZero(i) {
    if (i < 10) {i = "0" + i};
    return i;
}
setInterval(time,1000);