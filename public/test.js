let wordlists = []
let answer = []
let time = []
let showTime = 0
let currentWord = 0

//get wordlists from server
fetch('/wordlist', { method: 'GET' })
    .then(function (response) {
        if (response.ok) return response.json()
        $('.error').text('Something wrong with server plz contact https://github.com/ScarySheep/')
    })
    .then(function (data) {
        wordlists = data
        //shuffle(wordlists)
        $('#word').text(wordlists[currentWord])
        showTime = Date.now()
    })
//simulate enter as button press
$('#answer').keypress(function (e) {
    if (e.which == 13) {
        $('#next').click();
        return false;
    }
});
//onclick
function nextWord () {
    //if wordlists is fetched
    if (wordlists.length > 0) {
        let currentAnswer = $.trim($('#answer').val()).toLowerCase()
        //check if there is an answer
        if (currentAnswer.length > 0) {
            $('.error').text(' ')
            answer.push(currentAnswer)
            time.push(Date.now() - showTime)
            //last word
            if (currentWord == 23) {
                let token = Math.random().toString(36).substring(2, 6) + Math.random().toString(36).substring(2, 6);
                let body = { token: token, answer: answer, time: time }
                let strBody = JSON.stringify(body)
                // store it back to server
                fetch('/store', {
                    method: 'POST', // or 'PUT'
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: strBody
                })
                    .then(function (response) {
                        if (response.ok) {
                            //if data is successfully stored, redirect to result page
                            window.location.href = `https://word-association-test.herokuapp.com/result/${token}`;
                            return;
                        }
                        throw new Error('Request failed.');
                    })
                    .catch(function (error) {
                        console.log(error);
                    });
            }
            //iterating
            $('#answer').val('')
            currentWord++
            $('#word').text(wordlists[currentWord])
            showTime = Date.now()
        } else {
            $('.error').text('Type something at least plz :)')
        }
    } else {
        $('.error').text('Wait for the word to load plz :)')
    }
}

//array shuffle function for future use
/*function shuffle (array) {
    let currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}*/