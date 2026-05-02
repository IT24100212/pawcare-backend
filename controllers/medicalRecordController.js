const MedicalRecord = require('../models/MedicalRecord');


/**
 * Helper function to calculate next due date based on vaccine type
 * @param {string} vaccineName - Name of the vaccine
 * @param {Date} dateGiven - Date when vaccine was given
 * @returns {Date} Calculated next due date
 * Student 4 - Vaccination Module
 */
const calculateNextDueDate = (vaccineName, dateGiven) => {
    const vaccineDurations = {
        'Rabies': 365,
        'DHPP': 365,
        'Bordetella': 180,
        'Leptospirosis': 365,
        'Lyme': 365,
        'Canine Influenza': 365
    };
    const days = vaccineDurations[vaccineName] || 365; // Default 1 year
    const nextDate = new Date(dateGiven);
    nextDate.setDate(nextDate.getDate() + days);
    return nextDate;
};


const addRecord = async (req, res) => {
    try {
        const { vaccineName, dateGiven, nextDueDate } = req.body;

        // STUDENT 4: Auto-calculate nextDueDate for vaccinations
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

/**
 * Get medical records by pet ID
 * Student 4: Added type filter to get only vaccination records
 * Usage: GET /api/medicalrecords/pet/:petId?type=vaccination
 */
const getRecordsByPet = async (req, res) => {
    try {
        const { petId } = req.params;
        const { type } = req.query; // STUDENT 4: Filter for vaccination type

        let query = { petId, isDeleted: false };

        // STUDENT 4: Filter only vaccination records
        if (type === 'vaccination') {
            query.vaccineName = { $exists: true, $ne: null };
        }

        const records = await MedicalRecord.find(query).sort({ dateGiven: -1 });
        res.status(200).json(records);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Update medical record
 * Student 4: Recalculate nextDueDate if vaccine info changes
 */
const updateRecord = async (req, res) => {
    try {
        const { id } = req.params;
        const { vaccineName, dateGiven, nextDueDate } = req.body;

        // STUDENT 4: Recalculate if vaccine info changed
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

/**
 * Soft delete medical record
 */
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