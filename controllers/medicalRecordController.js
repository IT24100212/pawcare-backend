const MedicalRecord = require('../models/MedicalRecord');

// Helper function to calculate next due date (Student 4)
const calculateNextDueDate = (vaccineName, dateGiven) => {
    const vaccineDurations = {
        'Rabies': 365,
        'DHPP': 365,
        'Bordetella': 180,
        'Leptospirosis': 365,
        'Lyme': 365,
        'Canine Influenza': 365
    };
    const days = vaccineDurations[vaccineName] || 365;
    const nextDate = new Date(dateGiven);
    nextDate.setDate(nextDate.getDate() + days);
    return nextDate;
};

const addRecord = async (req, res) => {
    try {
        const { vaccineName, dateGiven, nextDueDate } = req.body;

        // Auto-calculate nextDueDate for vaccinations (Student 4)
        let finalNextDueDate = nextDueDate;
        if (vaccineName && dateGiven && !nextDueDate) {
            finalNextDueDate = calculateNextDueDate(vaccineName, dateGiven);
        }

        const newRecord = await MedicalRecord.create({
            ...req.body,
            nextDueDate: finalNextDueDate,
            createdBy: req.user._id,
        });
        res.status(201).json(newRecord);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getRecordsByPet = async (req, res) => {
    try {
        const { petId } = req.params;
        const { type } = req.query; // Add filter for vaccination type (Student 4)

        let query = { petId, isDeleted: false };
        if (type === 'vaccination') {
            query.vaccineName = { $exists: true, $ne: null };
        }

        const records = await MedicalRecord.find(query).sort({ dateGiven: -1 });
        res.status(200).json(records);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateRecord = async (req, res) => {
    try {
        const { id } = req.params;
        const { vaccineName, dateGiven, nextDueDate } = req.body;

        // Recalculate if vaccine info changed (Student 4)
        let updateData = { ...req.body };
        if (vaccineName && dateGiven && !nextDueDate) {
            updateData.nextDueDate = calculateNextDueDate(vaccineName, dateGiven);
        }

        const updatedRecord = await MedicalRecord.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

        if (!updatedRecord) {
            return res.status(404).json({ message: 'Record not found' });
        }

        res.status(200).json(updatedRecord);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteRecord = async (req, res) => {
    try {
        const { id } = req.params;
        const record = await MedicalRecord.findByIdAndUpdate(id, { isDeleted: true }, { new: true });

        if (!record) {
            return res.status(404).json({ message: 'Record not found' });
        }

        res.status(200).json({ message: 'Record soft deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { addRecord, getRecordsByPet, updateRecord, deleteRecord };
