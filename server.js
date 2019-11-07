const fastify = require('fastify')({ logger: false })
const axios = require('axios')
const path = require('path')


fastify.register(require('fastify-rate-limit'), {
  global: false  
})

//-------------------------
const randomUsers = () => {
  return new Promise( async(resolve) => {
    let start = Math.floor((Math.random() * 10) + 1),
        limit = start + 10;  
      
    let res = await axios.get(`https://snappfire-db.herokuapp.com/api/v2/users/${start}/${limit}`)        
    resolve(res.data.success ? res.data.items : [])
  })
}
//-------------------------

//-------------------------
const randomSnapps = () => {
  return new Promise( async(resolve) => {
    let start = Math.floor((Math.random() * 100) + 1),
        limit = start + 10;  
      
    let res = await axios.get(`https://snappfire-db.herokuapp.com/api/v2/snapps/${start}/${limit}`)        
    resolve(res.data.success ? res.data.items : [])
  })
}
//-------------------------


//-------------------------
fastify.register(require('fastify-static'), {
  root: path.join(__dirname, 'public'),
  prefix: '/public/', // optional: default '/'
})

// Declare a route
fastify.get('/', async(request, reply) => {  
  reply.sendFile('/index.html')
})


fastify.get('/status', async(request, reply) => {
  let _res = await axios.get("https://snappfire-db.herokuapp.com")  
  reply.send(JSON.stringify(_res.data, null, 4))
})

fastify.get('/users/:start/:limit', async(request, reply) => {
  let {start, limit} = request.params
  let _res = await axios.get(`https://snappfire-db.herokuapp.com/api/v2/users/${start}/${limit}`)  
  reply.send(JSON.stringify(_res.data, null, 4))
})

fastify.get('/snapps/:start/:limit', async(request, reply) => {
  let {start, limit} = request.params
  let _res = await axios.get(`https://snappfire-db.herokuapp.com/api/v2/snapps/${start}/${limit}`)  
  reply.send(JSON.stringify(_res.data, null, 4))
})


const rateLimit = {
  config: {
    rateLimit: {
      max: 3,
      timeWindow: '1 minute',
      errorResponseBuilder: function(req, context) {
        return {
          code: 429,
          error: 'Too Many Requests',
          message: `You've attempted to log in too many times.  Please wait 1 minute and try again.`,
          date: Date.now()
        }
      }, 
    }
  }
}
let attempt = 0

fastify.get('/login', rateLimit, (req, reply) => {
  attempt++
  reply.send({ login: true, attempt})
})
//-------------------------




// Run the server!
const start = async () => {
  try {
    await fastify.listen(3000)    
    fastify.log.info(`server listening on ${fastify.server.address().port}`)
    console.log('Starting server...')
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()