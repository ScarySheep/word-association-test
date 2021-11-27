let wordlists = []
let ans = []
let showTime = 0
let currentWord = 0

fetch('/wordlists', { method: 'GET' })
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

function nextWord () {
    if (wordlists.length > 0) {
        ans.push({ answer: $('#answer').val(), time: Date.now() - showTime })
        if (currentWord == 23) {
            let token = Math.random().toString(36).substring(2, 6) + Math.random().toString(36).substring(2, 6);
            let body = { token: token, data: ans }
            let strBody = JSON.stringify(body)
            // Store
            sessionStorage.setItem('result', strBody);
            fetch('/test', {
                method: 'POST', // or 'PUT'
                headers: {
                    'Content-Type': 'application/json',
                },
                body: strBody
            })
                .then(function (response) {
                    if (response.ok) {
                        console.log('Result was recorded');
                        return;
                    }
                    throw new Error('Request failed.');
                })
                .catch(function (error) {
                    console.log(error);
                });
            window.location.href = "./result.html";
        }
        $('#answer').val('')
        currentWord++
        $('#word').text(wordlists[currentWord])
        showTime = Date.now()
    }

}
function shuffle (array) {
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
}