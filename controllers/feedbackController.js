const Feedback = require('../models/Feedback');

const submitFeedback = async (req, res) => {
  try {
    const { 
      serviceType, 
      rating, 
      comment, 
      message, 
      category: userCategory 
    } = req.body;
    
    const actualMessage = message || comment || '';
    let actualCategory = userCategory || (serviceType ? serviceType.toLowerCase() : 'general');
    
    let aiData = {
      sentiment: 'neutral',
      priority: 'low',
      autoReply: 'Thank you for your feedback.',
      aiProcessed: false
    };

    const apiKey = process.env.GROQ_API_KEY;
    if (apiKey && actualMessage.trim().length > 0) {
      try {
        const systemPrompt = `Analyze this customer feedback for PawCare.
Return ONLY valid JSON in this format:
{
  "sentiment": "positive", 
  "category": "vet",
  "priority": "low",
  "autoReply": "short professional admin reply"
}
Allowed sentiments: positive, neutral, negative
Allowed priorities: low, medium, high
Allowed categories: vet, shop, grooming, boarding, delivery, app, support, payment, general
Respond ONLY in valid JSON. No markdown fences.`;

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: `Feedback: "${actualMessage}"` },
            ],
            temperature: 0.1,
            max_tokens: 256,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const rawText = data?.choices?.[0]?.message?.content || '{}';
          const cleaned = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          const parsed = JSON.parse(cleaned);
          
          if (parsed.sentiment) aiData.sentiment = parsed.sentiment.toLowerCase();
          if (parsed.priority) aiData.priority = parsed.priority.toLowerCase();
          if (parsed.category) actualCategory = parsed.category.toLowerCase();
          if (parsed.autoReply) aiData.autoReply = parsed.autoReply;
          aiData.aiProcessed = true;
        }
      } catch (err) {
        console.error('AI Feedback Analysis Error:', err);
      }
    }

    // Role assignment mapping
    let assignedRole = 'Admin';
    if (actualCategory === 'vet') assignedRole = 'Vet';
    else if (actualCategory === 'shop') assignedRole = 'ShopOwner';
    else if (actualCategory === 'grooming') assignedRole = 'Groomer';
    else if (actualCategory === 'boarding') assignedRole = 'BoardingManager';

    const newFeedback = await Feedback.create({
      userId: req.user._id,
      serviceType, // Legacy
      comment, // Legacy
      message: actualMessage,
      rating,
      category: actualCategory,
      sentiment: aiData.sentiment,
      priority: aiData.priority,
      autoReply: aiData.autoReply,
      assignedRole,
      status: 'pending',
      aiProcessed: aiData.aiProcessed
    });
    
    res.status(201).json(newFeedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAdminFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStaffFeedback = async (req, res) => {
  try {
    const userRole = req.user.role;
    // Map existing system roles to feedback categories if assignedRole isn't strictly set
    let allowedCategories = [];
    let legacyTypes = [];
    if (userRole === 'Vet') { allowedCategories = ['vet']; legacyTypes = ['Vet']; }
    if (userRole === 'Groomer') { allowedCategories = ['grooming']; legacyTypes = ['Grooming']; }
    if (userRole === 'ShopOwner') { allowedCategories = ['shop']; legacyTypes = ['PetShop']; }
    if (userRole === 'BoardingManager') { allowedCategories = ['boarding']; legacyTypes = ['Boarding']; }
    
    const feedbacks = await Feedback.find({
      $or: [
        { assignedRole: userRole },
        { category: { $in: allowedCategories } },
        { serviceType: { $in: legacyTypes } }
      ]
    }).populate('userId', 'name').sort({ createdAt: -1 });
    
    res.status(200).json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Legacy support
const getAllFeedback = async (req, res) => {
  try {
    const { serviceType } = req.query;
    let query = {};
    if (serviceType) query.serviceType = serviceType;
    
    const feedbacks = await Feedback.find(query).populate('userId', 'name').sort({ createdAt: -1 });
    res.status(200).json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAverageRatings = async (req, res) => {
  try {
    const aggregationResult = await Feedback.aggregate([
      {
        $group: {
          _id: "$serviceType",
          averageRating: { $avg: "$rating" },
          totalFeedbacks: { $sum: 1 }
        }
      }
    ]);
    res.status(200).json(aggregationResult);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment, message, status } = req.body;
    
    const feedback = await Feedback.findById(id);
    if (!feedback) return res.status(404).json({ message: 'Feedback not found' });
    
    // Admin can update status
    if (req.user.role === 'Admin') {
      if (status) feedback.status = status;
    } else {
      // User can only update if it's theirs
      if (feedback.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to update this feedback' });
      }
      const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;
      if (Date.now() - feedback.createdAt.getTime() > THREE_DAYS_MS) {
        return res.status(403).json({ message: 'Edit window of 3 days has expired' });
      }
    }
    
    if (rating !== undefined) feedback.rating = rating;
    if (comment !== undefined) feedback.comment = comment;
    if (message !== undefined) feedback.message = message;
    
    await feedback.save();
    res.status(200).json(feedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const feedback = await Feedback.findById(id);
    
    if (!feedback) return res.status(404).json({ message: 'Feedback not found' });
    
    if (req.user.role !== 'Admin' && feedback.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this feedback' });
    }
    
    const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;
    if (req.user.role !== 'Admin' && (Date.now() - feedback.createdAt.getTime() > THREE_DAYS_MS)) {
      return res.status(403).json({ message: 'Delete window of 3 days has expired' });
    }
    
    await Feedback.findByIdAndDelete(id);
    res.status(200).json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  submitFeedback, 
  getAllFeedback, 
  getAdminFeedback,
  getStaffFeedback,
  getAverageRatings, 
  updateFeedback, 
  deleteFeedback 
};
