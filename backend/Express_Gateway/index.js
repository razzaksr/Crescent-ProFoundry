require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const proxy = require('express-http-proxy');
const consul = require('./middleware/consul');

const app = express();
const PORT = process.env.PORT || 8086; // Match frontend BASE_URL
const JWT_SECRET = process.env.JWT_SECRET ;

app.use(cors());
app.use(express.json());

// JWT Authentication Middleware
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: 'Access token is missing' });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Health Check Route (no JWT required)
app.get('/health', (req, res) => {
  res.json({ status: 'API Gateway is healthy' });
});

// Root route (no JWT required)
app.get('/', (req, res) => {
  res.send('Express Gateway running');
});

// Fetch service details from Consul
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

// Middleware to forward requests
const forwardRequest = (serviceName) => {
  return async (req, res, next) => {
    try {
      const serviceNameEnv = process.env[`${serviceName}_SERVICE_NAME`];
      if (!serviceNameEnv) {
        throw new Error(`Environment variable for ${serviceName}_SERVICE_NAME is not defined`);
      }
      const serviceUrl = await fetchingService(serviceNameEnv);
      proxy(serviceUrl, {
        proxyReqOptDecorator: (proxyReqOpts) => {
          proxyReqOpts.headers['Host'] = new URL(serviceUrl).host;
          return proxyReqOpts;
        },
      })(req, res, next);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
};

// Define API gateways
app.use('/poc_gateway', authenticateJWT, forwardRequest('POC'));
app.use('/expert_gateway', authenticateJWT, forwardRequest('EXPERT'));
app.use('/mcq_gateway', authenticateJWT, forwardRequest('MCQ'));
app.use('/test_gateway', authenticateJWT, forwardRequest('TEST'));
app.use('/testcase_gateway', authenticateJWT, forwardRequest('TESTCASE'));
app.use('/coding_gateway', authenticateJWT, forwardRequest('CODING'));
app.use('/attendance_gateway', authenticateJWT, forwardRequest('ATTENDANCE'));
app.use('/certificates_gateway', authenticateJWT, forwardRequest('CERTIFICATES'));
app.use('/overall_gateway', authenticateJWT, forwardRequest('OVERALL'));
app.use('/individual_gateway', authenticateJWT, forwardRequest('INDIVIDUAL'));
app.use('/results_gateway', authenticateJWT, forwardRequest('RESULTS'));
app.use('/user_gateway', authenticateJWT, forwardRequest('USER'));
app.use('/modules_gateway', authenticateJWT, forwardRequest('MODULES'));
app.use('/organization_gateway', authenticateJWT, forwardRequest('ORGANIZATION'));
app.use('/login_gateway', forwardRequest('LOGIN')); // No JWT for login

// Start the API Gateway
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});