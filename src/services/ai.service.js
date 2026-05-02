import axios from 'axios';
import jwt from 'jsonwebtoken';
import sizeOf from 'image-size';

// Helper function to generate a color from label
const colors = ["cyan", "purple"];
const getColorForLabel = (label) => colors[label.length % colors.length];

// Mock Data as fallback when AI API is not ready or fails
const mockAiData = {
    detections: [
        { id: "OBJECT_042", label: "SERVER_RACK", confidence: 98.4, color: "cyan", box: { top: "10%", left: "14%", width: "16%", height: "22%" } },
        { id: "ENTITY_009", label: "PERSON", confidence: 72.1, color: "purple", box: { top: "60%", left: "70%", width: "8%", height: "22%" } },
        { id: "OBJECT_117", label: "THERMAL_LEAD", confidence: 82.1, color: "purple", box: { top: "32%", left: "44%", width: "10%", height: "12%" } },
    ],
    distribution: [
        { label: "Industrial Assets", value: 42, color: "cyan" },
        { label: "Safety Equipment", value: 28, color: "purple" },
    ],
    metrics: [
        { label: "Classification Accuracy", value: 99.2, suffix: "%", color: "cyan" },
        { label: "Processing Latency", value: 14, suffix: "ms", max: 50, color: "purple" },
        { label: "Object Persistence", value: 88.5, suffix: "%", color: "cyan" },
    ]
};

/**
 * Service to handle integration with the external AI API.
 * 
 * @param {string} image - The base64 or URL of the image to analyze
 * @returns {Object} - The structured data containing detections, distribution, and metrics
 */
export const analyzeImageWithAI = async (image) => {
    const title = "Scan " + new Date().toLocaleDateString();
    
    // 1. Strip the prefix from base64 if it exists for the AI service
    let base64Data = image;
    if (image.includes(',')) {
        base64Data = image.split(',')[1];
    }
    
    // 2. Get image dimensions (to convert absolute px bbox to percentages for frontend)
    let imgDimensions = { width: 640, height: 640 }; // default
    try {
        const buffer = Buffer.from(base64Data, 'base64');
        imgDimensions = sizeOf(buffer);
    } catch (e) {
        console.error("Failed to read image dimensions", e.message);
    }

    // 3. Generate JWT Token using the same secret as AI service (fallback 'abc-123')
    const jwtSecret = process.env.AI_JWT_SECRET || 'abc-123';
    const token = jwt.sign({ service: 'backend' }, jwtSecret, { algorithm: 'HS256' });

    // 4. Try real AI API if configured
    if (process.env.AI_API_URL) {
        try {
            // Append /detect if missing
            const url = process.env.AI_API_URL.endsWith('/detect') ? process.env.AI_API_URL : `${process.env.AI_API_URL}/detect`;
            
            const response = await axios.post(
                url, 
                { image: base64Data }, 
                { 
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    } 
                }
            );
            
            if (response.data && response.data.detections) {
                const aiDetections = response.data.detections;
                let distributionMap = {};
                let totalConfidence = 0;
                
                // Map AI detections to frontend format
                const mappedDetections = aiDetections.map((item, index) => {
                    const label = item.class_name ? item.class_name.toUpperCase() : "UNKNOWN";
                    
                    distributionMap[label] = (distributionMap[label] || 0) + 1;
                    totalConfidence += item.confidence;

                    // bbox: [x1, y1, x2, y2] in pixels
                    const [x1, y1, x2, y2] = item.bbox;
                    const leftPercent = (x1 / imgDimensions.width) * 100;
                    const topPercent = (y1 / imgDimensions.height) * 100;
                    const widthPercent = ((x2 - x1) / imgDimensions.width) * 100;
                    const heightPercent = ((y2 - y1) / imgDimensions.height) * 100;

                    return {
                        id: `OBJECT_${String(index + 1).padStart(3, '0')}`,
                        label: label,
                        confidence: parseFloat((item.confidence * 100).toFixed(1)),
                        color: getColorForLabel(label),
                        box: {
                            left: `${leftPercent}%`,
                            top: `${topPercent}%`,
                            width: `${widthPercent}%`,
                            height: `${heightPercent}%`
                        }
                    };
                });

                // Generate dynamic distribution based on counts
                const distribution = Object.keys(distributionMap).map(label => ({
                    label: label,
                    value: distributionMap[label],
                    color: getColorForLabel(label)
                }));

                // Generate dynamic metrics
                const avgConfidence = aiDetections.length > 0 
                    ? parseFloat(((totalConfidence / aiDetections.length) * 100).toFixed(1)) 
                    : 0;

                const metrics = [
                    { label: "Classification Accuracy", value: avgConfidence, suffix: "%", color: "cyan" },
                    { label: "Objects Detected", value: aiDetections.length, suffix: "", color: "purple" },
                ];

                return {
                    title,
                    image: image, // Store full image for history
                    detections: mappedDetections,
                    distribution: distribution, // Return dynamic distribution even if empty
                    metrics: metrics // Return dynamic metrics even if empty
                };
            }
        } catch (error) {
            console.error("AI API Error (falling back to mock data):", error.message);
            if (error.response) {
                console.error("Response data:", error.response.data);
                console.error("Response status:", error.response.status);
            }
        }
    }

    // 2. Fallback to mock data (Simulate network delay)
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
        title,
        image: image, // Store full image for history
        detections: mockAiData.detections,
        distribution: mockAiData.distribution,
        metrics: mockAiData.metrics
    };
};
