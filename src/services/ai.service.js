import axios from 'axios';

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
    const imageSnippet = image.substring(0, 50) + "..."; // Keep DB size small temporarily
    
    // 1. Try real AI API if configured
    if (process.env.AI_API_URL) {
        try {
            const response = await axios.post(
                process.env.AI_API_URL, 
                { image }, 
                { 
                    headers: { 
                        'Authorization': `Bearer ${process.env.AI_API_KEY}`,
                        'Content-Type': 'application/json'
                    } 
                }
            );
            
            if (response.data && response.data.detections) {
                return {
                    title,
                    image: imageSnippet, // Replace with actual image url if AI returns one
                    detections: response.data.detections,
                    distribution: response.data.distribution || mockAiData.distribution,
                    metrics: response.data.metrics || mockAiData.metrics
                };
            }
        } catch (error) {
            console.error("AI API Error (falling back to mock data):", error.message);
        }
    }

    // 2. Fallback to mock data (Simulate network delay)
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
        title,
        image: imageSnippet,
        detections: mockAiData.detections,
        distribution: mockAiData.distribution,
        metrics: mockAiData.metrics
    };
};
