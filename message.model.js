import { model, Schema } from 'mongoose'
import paginate from 'mongoose-paginate-v2'

const messageSchema = new Schema({
  text: String,
  date: String
}, {
  timestamps: true,
  versionKey: false
})

messageSchema.plugin(paginate)

const messageModel = model('messages', messageSchema)

export { messageModel }