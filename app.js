const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()

app.use(express.json())

const dbpath = path.join(__dirname, 'cricketTeam.db')
let db = null
const intializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}
intializeDBAndServer()

const convertDbObjectToResponseObject = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  }
}

app.get('/players/', async (request, response) => {
  const getPlayersQuery = `
     SELECT * FROM cricket_team;`

  const playerArray = await db.all(getPlayersQuery)
  response.send(
    playerArray.map(eachPlayer => convertDbObjectToResponseObject(eachPlayer)),
  )
})

app.post('/players/', async (request, response) => {
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails

  const addPlayerQuery = `
    INSERT INTO cricket_team (player_Name,jersey_Number,role) 
    VALUES ('${playerName}',${jerseyNumber},'${role}');`

  await db.run(addPlayerQuery)

  response.send('Player Added to Team')
})

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayerQuery = ` SELECT * FROM cricket_team WHERE player_id = ${playerId};`

  const player = await db.get(getPlayerQuery)
  response.send(convertDbObjectToResponseObject(player))
})

app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const playerDetails = request.body

  const {playerName, jerseyNumber, role} = playerDetails

  const updatePlayerQuery = `UPDATE cricket_team SET player_Name= '${playerName}', jersey_Number=${jerseyNumber},role='${role}' WHERE player_id = ${playerId};`
  await db.run(updatePlayerQuery)
  response.send('Player Details Updated')
})

app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const deletePlayerQuery = `DELETE FROM cricket_team WHERE player_id = ${playerId};`

  await db.run(deletePlayerQuery)
  response.send('Player Removed')
})

module.exports = app
