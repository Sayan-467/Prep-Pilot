const Question = require("../models/Question");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.handleChat = async (req, res) => {
  const { message } = req.body;
  const userId = req.user.id;

  if (!message) {
    return res.status(400).json({ message: "Message required" });
  }

  try {
    // Fetch user's question data for context
    const questions = await Question.find({ userId });
    
    // Calculate user stats
    const total = questions.length;
    const solved = questions.filter(q => q.status === "done").length;
    const pending = total - solved;
    
    // Calculate topic-wise stats
    const topicStats = {};
    questions.forEach(q => {
      q.tags.forEach(tag => {
        if (!topicStats[tag]) {
          topicStats[tag] = { total: 0, solved: 0 };
        }
        topicStats[tag].total += 1;
        if (q.status === "done") topicStats[tag].solved += 1;
      });
    });
    
    // Calculate weak topics
    const weakTopics = Object.entries(topicStats)
      .map(([tag, stats]) => ({
        tag,
        accuracy: Math.round((stats.solved / stats.total) * 100),
        total: stats.total,
        solved: stats.solved
      }))
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 3);
    
    // Get next recommended question
    const nextQuestion = await Question.findOne({
      userId,
      status: { $ne: "done" }
    }).sort({ difficulty: 1 });
    
    // Prepare context for Gemini
    const weakTopicsText = weakTopics.length > 0 
      ? weakTopics.map(t => `- ${t.tag}: ${t.accuracy}% (${t.solved}/${t.total} solved)`).join('\n') 
      : 'No data yet';
    
    const nextQuestionText = nextQuestion 
      ? `NEXT RECOMMENDED QUESTION:\n- Title: ${nextQuestion.title}\n- Difficulty: ${nextQuestion.difficulty}\n- Tags: ${nextQuestion.tags.join(', ')}` 
      : 'All questions completed!';
    
    const context = `
You are PrepPilot AI, a friendly and helpful coding interview preparation assistant.

USER'S CURRENT PROGRESS:
- Total Questions: ${total}
- Solved: ${solved}
- Pending: ${pending}
- Success Rate: ${total > 0 ? Math.round((solved / total) * 100) : 0}%

WEAK TOPICS (need improvement):
${weakTopicsText}

${nextQuestionText}

INSTRUCTIONS:
- Be encouraging and motivational
- Provide specific, actionable advice
- Use emojis appropriately
- Keep responses concise but helpful (2-3 sentences max unless explaining concepts)
- When suggesting questions, reference the data above
- Help with study strategies, coding concepts, and interview prep
- If user asks about weak topics, reference the stats above
- If user asks what to solve next, recommend the next question

USER'S QUESTION: ${message}

Respond naturally and helpfully:`;

    // Call Gemini API
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(context);
    const response = await result.response;
    const reply = response.text();

    // If recommending a question, include the questionId
    const responseData = { reply: reply };
    
    if (nextQuestion && (message.toLowerCase().includes('next') || message.toLowerCase().includes('solve'))) {
      responseData.questionId = nextQuestion._id;
    }

    return res.json(responseData);

  } catch (err) {
    console.error('Gemini API Error:', err);
    
    // Fallback to basic responses if AI fails
    const lower = message.toLowerCase();
    
    if (lower.includes("weak")) {
    const questions = await Question.find({ userId });

    const stats = {};
    questions.forEach(q => {
      q.tags.forEach(tag => {
        stats[tag] = stats[tag] || { total: 0, done: 0 };
        stats[tag].total += 1;
        if (q.status === "done") stats[tag].done += 1;
      });
    });

    const weaknesses = Object.entries(stats)
      .map(([tag, s]) => ({
        tag,
        accuracy: Math.round((s.done / s.total) * 100)
      }))
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 3);

    return res.json({
      reply: `Your weakest topics are:\n` +
        weaknesses.map(w => `• ${w.tag} (${w.accuracy}%)`).join("\n")
    });
  }

  // 2️⃣ Recommendation
  if (lower.includes("solve next") || lower.includes("next question")) {
    const q = await Question.findOne({
      userId,
      status: "todo"
    }).sort({ difficulty: 1 });

    if (!q) {
      return res.json({ reply: "🎉 You’ve solved all your questions!" });
    }

    return res.json({
      reply: `You should solve **${q.title}** (${q.difficulty}) next.`,
      questionId: q._id
    });
  }

  // 3️⃣ Stats
  if (lower.includes("how many")) {
    const total = await Question.countDocuments({ userId });
    const solved = await Question.countDocuments({ userId, status: "done" });

    return res.json({
      reply: `You have solved ${solved} out of ${total} questions.`
    });
  }

  return res.json({
    reply: "🤖 Sorry, I'm having trouble connecting to my AI brain right now. Try asking about your weak topics, next questions, or stats!"
  });
  }
};
