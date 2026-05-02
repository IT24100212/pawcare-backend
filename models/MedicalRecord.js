const mongoose = require('mongoose');



  //Added vaccination-specific fields

const medicalRecordSchema = new mongoose.Schema({
    petId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pet',
        required: true,
        description: 'Reference to the pet this record belongs to'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        description: 'User (Vet/Admin) who created this record'
    },

    // ==========================================
    // VACCINATION FIELDS - Added by Student 4
    // ==========================================
    vaccineName: {
        type: String,
        description: 'Name of the vaccine (e.g., Rabies, DHPP, Bordetella)'
    },
    dateGiven: {
        type: Date,
        description: 'Date when the vaccine was administered'
    },
    nextDueDate: {
        type: Date,
        description: 'Auto-calculated next vaccination due date (based on vaccine type)'
    },
    // ==========================================

    // General medical fields
    illnesses: {
        type: String,
        description: 'Any illnesses diagnosed'
    },
    treatments: {
        type: String,
        description: 'Treatments prescribed'
    },
    allergies: {
        type: String,
        description: 'Known allergies of the pet'
    },
    doctorNotes: {
        type: String,
        description: 'Additional notes from the veterinarian'
    },

    // Soft delete flag
    isDeleted: {
        type: Boolean,
        default: false,
        description: 'Soft delete flag - true if record is deleted'
    },
}, {
    timestamps: true  // Auto adds createdAt and updatedAt
});


  //Added compound index for petId + vaccineName queries

medicalRecordSchema.index({ petId: 1, dateGiven: -1 });
medicalRecordSchema.index({ vaccineName: 1 });

const MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema);
module.exports = MedicalRecord;
