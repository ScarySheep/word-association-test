let wordlists
let result
let getWordList = fetch('/wordlists', { method: 'GET' })
    .then(function (response) {
        if (response.ok) return response.json()
        $('.error').text('Something wrong with server plz contact https://github.com/ScarySheep/')
    })
    .then(function (data) {
        wordlists = data
    })

getWordList.then(() => {
    fetch('/result', { method: 'GET' })
        .then(function (response) {
            if (response.ok) return response.json()
            $('.error').text('Something wrong with server plz contact https://github.com/ScarySheep/')
        })
        .then(function (data) {
            result = data.data
            for (let i = 0; i < 24; i++) {
                $(`#word-${i}`).text(wordlists[i])
                $(`#ans-${i}`).text(result[i].answer)
                $(`#time-${i}`).text(result[i].time)
            }
        })
})

