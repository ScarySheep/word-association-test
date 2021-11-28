const { google } = require('googleapis')
const express = require('express')
const { render } = require('ejs')
const app = express()
const dotenv = require('dotenv').config()

//middleware for json decoding
app.use(express.json())
//serve static file from the public folder
app.use(express.static('public'))
//use ejs for dynamic html
app.set("view engine", "ejs");
//fire up the server
app.listen(
    process.env.PORT
)

//get wordlists
app.get('/wordlist', async (req, res) => {
    //google auth
    const auth = await google.auth.getClient({ scopes: ['https://www.googleapis.com/auth/spreadsheets'] })
    const sheets = google.sheets({ version: 'v4', auth })
    //get the key column
    const range = `wordlist!B1:U1`
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.SHEET_ID,
        range,
    }, (err, result) => {
        if (err) {
            // Handle error
            console.log(err);
        } else {
            res.status(200).send(result.data.values[0])
        }
    })
})

//
app.post('/store', async (req, res) => {
    let token = req.body.token
    let answer = req.body.answer
    let time = req.body.time
    //basic check
    if ((typeof token === 'string' || token instanceof String) && token.length == 8 && answer.length == 20 && time.length == 20) {
        answer.unshift(token)
        time.unshift(`${token}-time`)
        //google auth
        const auth = await google.auth.getClient({ scopes: ['https://www.googleapis.com/auth/spreadsheets'] })
        const sheets = google.sheets({ version: 'v4', auth })
        //get the key column
        const range = `response!A1`
        const response = await sheets.spreadsheets.values.append({
            spreadsheetId: process.env.SHEET_ID,
            range,
            valueInputOption: 'RAW',
            resource: { values: [answer, time] }
        }, (err, result) => {
            if (err) {
                // Handle error
                console.log(err);
                res.status(400).send('problem occured when storing data')
            } else {
                res.status(200).send('success')
                console.log('%d cells updated on range: %s', result.data.updates.updatedCells, result.data.updates.updatedRange);
            }
        })
    } else {
        res.status(400).send('wrong format')
    }
})


app.get('/result/:token', async (req, res) => {
    //get token from request
    const { token } = req.params
    //basic token check
    if ((typeof token === 'string' || token instanceof String) && token.length == 8) {
        //google auth
        const auth = await google.auth.getClient({ scopes: ['https://www.googleapis.com/auth/spreadsheets'] })
        const sheets = google.sheets({ version: 'v4', auth })
        //get the key column
        const keyRange = `response!A:A`
        const keyResponse = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.SHEET_ID,
            range: keyRange,
        })
        //formatting
        let keys = []
        for (row of keyResponse.data.values) for (e of row) keys.push(e)
        //check if token exist
        const index = keys.indexOf(token)
        if (index != -1) {
            //get data by token
            const wordlistsRange = `wordlist!B1:U1`
            const resultRange = `response!B${index + 1}:U${index + 2}`
            const resultResponse = await sheets.spreadsheets.values.batchGet({
                spreadsheetId: process.env.SHEET_ID,
                ranges: [wordlistsRange, resultRange],
            })
            //formatting
            let result = resultResponse.data.valueRanges
            let wordlist = result[0].values[0]
            let answer = result[1].values[0]
            let time = result[1].values[1]
            //find min and max time
            let minTime = time.indexOf(String(Math.min(...time)))
            let maxTime = time.indexOf(String(Math.max(...time)))
            //declare ejs variables
            let renderVar = {}
            for (let i = 0; i < 20; i++) {
                renderVar[`word${i}`] = `${wordlist[i]}:`
                renderVar[`answer${i}`] = answer[i]
                if (i == minTime) {
                    renderVar[`time${i}`] = `<h5 class="time" style="color:green">${Math.round(time[i] / 10) / 100}s</h5>`
                } else if (i == maxTime) {
                    renderVar[`time${i}`] = `<h5 class="time" style="color:red">${Math.round(time[i] / 10) / 100}s</h5>`
                } else {
                    renderVar[`time${i}`] = `<h5 class="time">${Math.round(time[i] / 10) / 100}s</h5>`
                }
            }
            renderVar.link = `https://word-association-test.herokuapp.com/result/${token}`
            //render dynamic html page to frontend
            res.render('result', renderVar)
        } else {
            res.status(404).send({ result: 'no data' })
        }
    } else {
        res.status(404).send({ result: 'no data' })
    }
})