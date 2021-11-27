const { google } = require('googleapis')
const express = require('express')
const app = express()
const dotenv = require('dotenv').config()

//middleware for json decoding
app.use(express.json())
//serve static file from the public folder
app.use(express.static('public'))

//fire up the server
app.listen(
    process.env.PORT
)

//default page
// serve the homepage
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/wordlists', async (req, res) => {
    //google auth
    const auth = await google.auth.getClient({ scopes: ['https://www.googleapis.com/auth/spreadsheets'] })
    const sheets = google.sheets({ version: 'v4', auth })
    //get the key column
    const range = `Sheet1!B1:Y1`
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

app.post('/test', async (req, res) => {
    let data = req.body.data
    let token = req.body.token
    let answer = data.map(d => d.answer)
    let time = data.map(d => d.time)
    answer.unshift(token)
    time.unshift(`${token}-time`)
    //google auth
    const auth = await google.auth.getClient({ scopes: ['https://www.googleapis.com/auth/spreadsheets'] })
    const sheets = google.sheets({ version: 'v4', auth })
    //get the key column
    const range = `Sheet1!A1`
    const response = await sheets.spreadsheets.values.append({
        spreadsheetId: process.env.SHEET_ID,
        range,
        valueInputOption: 'RAW',
        resource: { values: [answer, time] }
    }, (err, result) => {
        if (err) {
            // Handle error
            console.log(err);
        } else {
            res.status(200).send('success')
            console.log('%d cells updated on range: %s', result.data.updates.updatedCells, result.data.updates.updatedRange);
        }
    })
})


app.get('/results/:token', async (req, res) => {
    //get token from request
    const { token } = req.params
    //basic check
    if ((typeof token === 'string' || token instanceof String) && token.length == 8) {
        //google auth
        const auth = await google.auth.getClient({ scopes: ['https://www.googleapis.com/auth/spreadsheets'] })
        const sheets = google.sheets({ version: 'v4', auth })
        //get the key column
        const keyRange = `Sheet1!A:A`
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
            const resultRange = `Sheet1!B${index + 1}:Y${index + 2}`
            const resultResponse = await sheets.spreadsheets.values.get({
                spreadsheetId: process.env.SHEET_ID,
                range: resultRange,
            })

            res.send({ result: resultResponse.data.values })
        } else {
            res.send({ result: 'no data' })
        }
    } else {
        res.send({ result: 'no data' })
    }
})