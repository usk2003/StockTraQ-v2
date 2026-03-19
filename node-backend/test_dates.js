const mongoose = require('mongoose');

// Define original schema-less model
const run = async () => {
    try {
        const conn = await mongoose.connect('mongodb://localhost:27017/stocktraq_admin');
        const IpoSchema = new mongoose.Schema({
            companyName: String,
            closeDate: Date
        });
        const Ipo = conn.model('Ipo', IpoSchema);

        const ipos = await Ipo.find({}).sort({ closeDate: -1 }).limit(10);
        console.log("--- TOP 10 CLOSED IPOS (Sorted Descending) ---");
        ipos.forEach(i => {
            console.log(`${i.companyName} -> CloseDate: ${i.closeDate}`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

run();
