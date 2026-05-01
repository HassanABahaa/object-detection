import mongoose, { Schema, model } from 'mongoose';

const boxSchema = new Schema({
    top: { type: String, required: true },
    left: { type: String, required: true },
    width: { type: String, required: true },
    height: { type: String, required: true }
}, { _id: false });

const detectionSchema = new Schema({
    id: { type: String, required: true },
    label: { type: String, required: true },
    confidence: { type: Number, required: true },
    color: { type: String, required: true },
    box: boxSchema
}, { _id: false });

const historySchema = new Schema({
    title: { type: String, default: "Object Scan" },
    image: { type: String }, 
    detections: [detectionSchema],
    distribution: [{
        label: String,
        value: Number,
        color: String
    }],
    metrics: [{
        label: String,
        value: Number,
        suffix: String,
        max: Number,
        color: String
    }]
}, { timestamps: true });

const historyModel = mongoose.models.History || model('History', historySchema);
export default historyModel;
