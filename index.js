var fs = require('fs')
var cors = require('cors')
var announcementsData = fs.readFileSync('announcements.json')
var announcements = JSON.parse(announcementsData)
var idsDataJSON = fs.readFileSync('ids.json')
var ids = JSON.parse(idsDataJSON)
var stateData = fs.readFileSync('state.json')
var state = JSON.parse(stateData)
const { response } = require('express')
var express = require('express')

var port = 3000 || process.env.PORT

var app = express()

var server = app.listen(port, function(){
    console.log('Currently listening on port ' + port + "...")
})

app.use(express.static('website'))
app.use(cors())

app.get('/repeat/:word/:num', function(req, res) {
    var word = req.params
    var num = word.num
    var response = ""
    for(var i = 0; i < num; i++) {
        response += word.word + "\n"
    }
    res.send(response)
})

app.get('/all', function(req, res) {
    res.send(announcements)
})

app.get('/add/:id?/:title?/:body?/:state?', function(req, res){
    var parameters = req.params
    var title = parameters.title
    var body = parameters.body
    var id = parameters.id
    var stateStatus = parameters.state

    var response;
    if(!title) {
        response = {
            "msg": "The title is required!"
        }
    } else if(!body) {
        response = {
            "msg": "The body is required!"
        }
    } else if(!id) {
        response = {
            "msg": "The ID is missing or the ID isn't a numerical value."
        }
    } else if(ids[id]) {
        response = {
            "msg": "The ID already exists!"
        }
    } else if(!stateStatus) {
        response = {
            "msg": "The state parameter is missing or doesn't exist."
        }
    } else {
        var spaceTitle = title.split('%20').join(' ')
        var spaceBody = body.split('%20').join(' ')
        var slashTitle = spaceTitle.split('%2F').join('/')
        var slashBody = spaceBody.split('%2F').join('/')
        var idkTitle = slashTitle.split('%27').join("'")
        var idkBody = slashBody.split('%27').join("'")
        announcements[spaceTitle] = idkBody
        ids[id] = idkTitle

        switch (stateStatus) {
            case 'solved':
                state[id] = 'solved'
                break;
            case 'none':
                state[id] = 'none'
                break;
            default:
                state[id] = 'none'
                break;
        }
        var announceData = JSON.stringify(announcements, null, 2)
        fs.writeFile('announcements.json', announceData, function(){
            console.log('announcements.json file saved: added title "' + spaceTitle + '"')
        })
        var idsData = JSON.stringify(ids, null, 2)
        fs.writeFile('ids.json', idsData, function() {
            console.log('ids.json file saved: added id ' + id)
        })
        response = {
            "msg": "Successfully posted on the database."
        }
    } 
    res.send(response)
}) 
app.get('/getids', function(req, res) {
    res.setHeader('Content-Type', 'application/json')
    res.send(ids)
})
app.get('/getannouncementid/:id?', function(req, res){
    var announcementID = Number(req.params.id)
    var response;
    if(!ids[announcementID]) {
        response = {
            "msg": "The ID argument is missing or the ID isn't a numerical value or either the ID doesn't exist."
        }
    } else {
        response = {
            title: ids[announcementID],
            body: announcements[ids[announcementID]],
            id: announcementID
        }
    }
    res.send(response)
})
app.get('/remove/:id?', function(req, res){
    var params = req.params
    var id = Number(params.id)
    var response;
    
    if(ids[id]) {
        delete announcements[ids[id]]
        var stringifyAnnouncements = JSON.stringify(announcements, null, 2)
        fs.writeFile('announcements.json', stringifyAnnouncements, function(){
            console.log('announcements.json file saved: deleted title "' + ids[id] + '"')
        })
        delete ids[id]
        var stringifyIDS = JSON.stringify(ids, null, 2)
        fs.writeFile('ids.json', stringifyIDS, function(){
            console.log('id.json file saved: deleted id ' + id)
        })
        response = {
            "msg": "ID " + id + " was successfully deleted!"
        } 
    } else {
        response = {
            "msg": "The ID parameter is missing or the ID doesn't exist."
        }
    }
    res.send(response)
})
app.get('/getannouncements', function(req, res){
    res.send(announcements)
})
app.get('/getstates', function(req, res){
    res.send(state)
})