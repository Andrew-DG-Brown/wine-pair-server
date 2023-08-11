import * as dotenv from 'dotenv'
dotenv.config()
console.log('ENV successful: ', Boolean(process.env.UNSPLASH_ID))