import axios from 'axios';
import jwt from 'jsonwebtoken';

const test = async () => {
    const token = jwt.sign({ service: 'backend' }, 'abc-123', { algorithm: 'HS256' });
    try {
        console.log("Testing connection to http://localhost:8000/health...");
        const health = await axios.get('http://localhost:8000/health');
        console.log("Health Check:", health.data);

        console.log("Testing connection to http://localhost:8000/detect...");
        const res = await axios.post('http://localhost:8000/detect', 
            { image: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==" },
            { headers: { 'Authorization': `Bearer ${token}` } }
        );
        console.log("Detect Response:", JSON.stringify(res.data, null, 2));
    } catch (err) {
        console.error("Error:", err.message);
        if (err.response) {
            console.error("Status:", err.response.status);
            console.error("Data:", err.response.data);
        }
    }
};

test();
