const Consul = require('consul');
// const consul = new Consul({host: 'consul-e0hq.onrender.com', port:443, secure: true , promisify: true});
const consul = new Consul()
const dotenv = require('dotenv');
dotenv.config();

const CONSUL_SERVICE_ID = process.env.CONSUL_SERVICE_ID;
const CONSUL_SERVICE_NAME = process.env.CONSUL_SERVICE_NAME ;
const CONSUL_HOST = process.env.CONSUL_HOST;
const CONSUL_PORT = parseInt(process.env.PORT, 10);


// register expert service in consul discovery server
consul.agent.service.register({
    id: CONSUL_SERVICE_ID,
    name: CONSUL_SERVICE_NAME,
    address: CONSUL_HOST,
    port: CONSUL_PORT,
},
(err)=>{
    if(err)
        throw err;
    console.log('Test Service successfully registered')
})
// Gracefully deregister service when shutting down
process.on('SIGINT', async () => {
    try {
        await consul.agent.service.deregister(CONSUL_SERVICE_NAME);
        console.log('Beneficiary Service deregistered from Consul');
        process.exit();
    } catch (err) {
        console.error('Error deregistering service:', err);
        process.exit(1);
    }
});
module.exports = consul;