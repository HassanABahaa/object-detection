import historyModel from '../../../DB/models/History.model.js';
import { asyncHandler } from '../../utils/errorHandling.js';
import { analyzeImageWithAI } from '../../services/ai.service.js';

export const detectObjects = asyncHandler(async (req, res, next) => {
    const { image } = req.body;

    if (!image) {
        return next(new Error('Image is required', { cause: 400 }));
    }

    // Call the external AI API service (or mock fallback)
    const aiDataToUse = await analyzeImageWithAI(image);

    // Save to Database History
    const newHistory = await historyModel.create({
        title: aiDataToUse.title,
        image: aiDataToUse.image,
        detections: aiDataToUse.detections,
        distribution: aiDataToUse.distribution,
        metrics: aiDataToUse.metrics
    });

    // Return the response to the Frontend
    return res.status(200).json({
        message: "Detection successful",
        data: aiDataToUse,
        historyId: newHistory._id
    });
});

// 1. Get All History (for Dashboard list - "Past Week")
export const getHistory = asyncHandler(async (req, res, next) => {
    const history = await historyModel.find().sort({ createdAt: -1 }); // Latest first
    
    // Format to match pastWeek mock exactly
    const pastWeek = history.map((item, i) => ({
        id: item._id,
        title: item.title || "Scan Concept",
        date: new Date(item.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        image: item.image // In a real scenario, this would be a URL
    }));

    return res.status(200).json({ message: "Success", pastWeek });
});

// 2. Get Statistics (for Dashboard Cards & Charts)
export const getStats = asyncHandler(async (req, res, next) => {
    // Basic aggregation for stats
    const totalScans = await historyModel.countDocuments();
    
    // We can aggregate the detections to get total objects counted
    const objectAgg = await historyModel.aggregate([
        { $unwind: "$detections" },
        { $group: { _id: null, totalObjects: { $sum: 1 } } }
    ]);
    const totalObjectsCounted = objectAgg.length > 0 ? objectAgg[0].totalObjects : 0;

    // Use the latest distribution and metrics from the most recent scan
    const latestScan = await historyModel.findOne().sort({ createdAt: -1 });
    
    return res.status(200).json({
        message: "Success",
        summary: {
            dailyTotalObjectCounted: totalObjectsCounted,
            dailyTotalScans: totalScans
        },
        distribution: latestScan ? latestScan.distribution : [],
        metrics: latestScan ? latestScan.metrics : []
    });
});
