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