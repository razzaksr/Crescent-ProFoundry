const Consul = require('consul');
const dotenv = require('dotenv');

dotenv.config();
// const consul = new Consul({host: 'consul-e0hq.onrender.com', port:443, secure: true , promisify: true});
const consul = new Consul()


const CONSUL_SERVICE_ID = process.env.CONSUL_SERVICE_ID;
const CONSUL_SERVICE_NAME = process.env.CONSUL_SERVICE_NAME;
const CONSUL_HOST = process.env.CONSUL_HOST;
const CONSUL_PORT = parseInt(process.env.PORT, 10);

// Register API Gateway in Consul
consul.agent.service.register(
    {
        id: CONSUL_SERVICE_ID,
        name: CONSUL_SERVICE_NAME,
        address: CONSUL_HOST,
        port: parseInt(CONSUL_PORT),
        check: {
            http: `http://${CONSUL_HOST}:${CONSUL_PORT}/health`,
            interval: '10s',
            timeout: '5s',
        },
    },
    (err) => {
        if (err) throw err;
        console.log('API Gateway successfully registered in Consul');
    }
);

// Gracefully deregister service when shutting down
process.on('SIGINT', async () => {
    try {
        await consul.agent.service.deregister(CONSUL_SERVICE_ID);
        console.log('API Gateway deregistered from Consul');
        process.exit();
    } catch (err) {
        console.error('Error deregistering service:', err);
        process.exit(1);
    }
});

module.exports = consul;