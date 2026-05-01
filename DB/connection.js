import mongoose from 'mongoose';

const connectDB = async () => {
    return await mongoose.connect(process.env.DB_LOCAL)
        .then(() => console.log('Database connected successfully on', process.env.DB_LOCAL))
        .catch(err => console.error('Database connection error:', err));
};

export default connectDB;
