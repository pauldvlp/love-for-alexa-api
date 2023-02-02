import express from 'express'
import cors from 'cors'
import http from 'http'
import dotenv from 'options = {}dotenv'
import { Server } from 'socket.io'
import path from 'path'
import mongoose from 'mongoose'
import { messageModel } from './message.model.js'

dotenv.config();

const formatDate = (date = new Date(Date.now()),  ) => {
  return Intl
  .DateTimeFormat('en-UK', { dateStyle: 'short', timeStyle: 'short', hourCycle: "h12", ...options })
  .format(date)
  .replace(',', ' -')
  .toUpperCase()
}

const PORT = process.env.PORT || 3000

const app = express()
const server = http.createServer(app)
const io = new Server(server, { cors: { origin: '*' } })

app.use(cors())
app.use(express.static(path.join(process.cwd(), 'public')))
app.use(express.json())

app.get('/messages', async (req, res) => {
  try {
    const { query: { page = 1 } } = req
    const data = await messageModel.paginate({}, { page, limit: 1, sort: { createdAt: 'desc' } })
    res.status(200).send({ status: 'OK', data })
  } catch (error) {
    res.status(500).send({ status: 'FAILED', data: { error: error?.message || error.toString() }})
  }
})

app.post('/messages', async (req, res) => {
  try {
    const { message, timeZone } = req.body
    const createdMessage = await messageModel.create({ text: message, date: formatDate(Date.now(), { timeZone }) });
    await createdMessage.save()
    res.status(201).send({ status: 'OK', data: createdMessage })
  } catch (error) {
    res.status(500).send({ status: 'FAILED', data: { error: error?.message || error.toString() }})
  }
})

mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`)
    })
  }).catch((error) => {
    console.log(error.message)
  })


io.on('connection', (socket) => {
  socket.on('new-message', async () => {
    try {
      io.emit('new-message')
    } catch (error) {
      console.log(error.message)
    }
  })
})