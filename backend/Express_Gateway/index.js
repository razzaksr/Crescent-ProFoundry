const express = require('express');
require('dotenv').config();
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const consul = require('./middleware/consul'); // Import the Consul registration file



const app = express();
const PORT = process.env.PORT;


app.use(cors());


app.get('/', (req, res) => {
    res.send('Express Gateway running');
});


// Health Check Route for Consul
app.get('/health', (req, res) => {
    res.json({ status: 'API Gateway is healthy' });
});

// Function to fetch the respective service details from Consul
const fetchingService = async (requestedService) => {
    try {
        const services = await consul.catalog.service.nodes(requestedService);
        if (services.length === 0) {
            throw new Error(`Requested service '${requestedService}' not registered in Consul`);
        }
        const foundService = services[0];
        return `http://${foundService.Address}:${foundService.ServicePort}`;
    } catch (error) {
        throw new Error(`Error fetching service details for ${requestedService}: ${error.message}`);
    }
};

// Middleware to forward requests to the respective microservices
const forwardRequest = (serviceName) => {
    return async (req, res, next) => {
        try {
            const serviceNameEnv = process.env[`${serviceName}_SERVICE_NAME`];
            if (!serviceNameEnv) {
                throw new Error(`Environment variable for ${serviceName}_SERVICE_NAME is not defined`);
            }
            const serviceUrl = await fetchingService(serviceNameEnv);
            createProxyMiddleware({
                target: serviceUrl,
                changeOrigin: true,
            })(req, res, next);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };
};

// Define API gateways for each service
app.use('/poc_gateway', forwardRequest('POC'));
app.use('/expert_gateway', forwardRequest('EXPERT'));
app.use('/mcq_gateway', forwardRequest('MCQ'));
app.use('/test_gateway', forwardRequest('TEST'));
app.use('/testcase_gateway', forwardRequest('TESTCASE'));
app.use('/coding_gateway', forwardRequest('CODING'));
app.use('/attendance_gateway', forwardRequest('ATTENDANCE'));
app.use('/certificates_gateway', forwardRequest('CERTIFICATES'));
app.use('/overall_gateway', forwardRequest('OVERALL'));
app.use('/individual_gateway', forwardRequest('INDIVIDUAL'));
app.use('/results_gateway', forwardRequest('RESULTS'));
app.use('/user_gateway', forwardRequest('USER'));
app.use('/modules_gateway', forwardRequest('MODULES'));
app.use('/organization_gateway', forwardRequest('ORGANIZATION'));

// Start the API Gateway
app.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
});
