import { Mistral } from "@mistralai/mistralai";

const mistral = new Mistral({
  apiKey: import.meta.env.VITE_MISTRAL_API_KEY,
});

export const generateQuestions = async (candidateInfo) => {
  const prompt = `Generate 6 technical interview questions for a full-stack developer position (React/Node.js). 
  The candidate's name is ${candidateInfo.name} and they have experience in the field.
  
  Requirements:
  - 2 Easy questions (basic concepts)
  - 2 Medium questions (practical knowledge)
  - 2 Hard questions (advanced problem-solving)
  
  IMPORTANT: Return ONLY plain text questions without any markdown formatting, asterisks, backticks, or special characters.
  
  Return the questions in JSON format with this structure:
  [
    {
      "id": 1,
      "text": "Question text here",
      "difficulty": "easy|medium|hard",
      "category": "JavaScript|React|Node.js|System Design|etc"
    }
  ]
  
  Make the questions relevant to full-stack development with React and Node.js.`;

  const response = await mistral.chat.complete({
    model: "mistral-tiny",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const content = response.choices[0].message.content;

  // Try to parse JSON from the response
  let jsonMatch = content.match(/\[[\s\S]*\]/);

  // If no array found, try to find JSON object and wrap it in array
  if (!jsonMatch) {
    const objectMatch = content.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      jsonMatch = [`[${objectMatch[0]}]`];
    }
  }

  if (jsonMatch) {
    let cleanedJson = null;
    try {
      // Clean the JSON string by removing control characters
      cleanedJson = jsonMatch[0]
        .replace(/[\x00-\x1F\x7F-\x9F]/g, "") // Remove control characters
        .replace(/\n/g, " ") // Replace newlines with spaces
        .replace(/\r/g, " ") // Replace carriage returns with spaces
        .replace(/\t/g, " ") // Replace tabs with spaces
        .replace(/\s+/g, " ") // Replace multiple spaces with single space
        .trim();

      const questions = JSON.parse(cleanedJson);

      // Ensure we have an array
      if (!Array.isArray(questions)) {
        throw new Error("Parsed result is not an array");
      }

      return questions;
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      if (cleanedJson) {
        console.error("Cleaned JSON:", cleanedJson);
      }
      console.error("Original content:", content);
      throw new Error(
        "Could not parse questions from Mistral response: " + parseError.message
      );
    }
  } else {
    console.error("No JSON found in response:", content);

    // Fallback: Create default questions if AI response is malformed
    console.log("Creating fallback questions due to parsing error");
    return [
      {
        id: 1,
        text: "What is the difference between let, const, and var in JavaScript?",
        difficulty: "easy",
        category: "JavaScript",
      },
      {
        id: 2,
        text: "Explain the concept of closures in JavaScript with an example.",
        difficulty: "easy",
        category: "JavaScript",
      },
      {
        id: 3,
        text: "How do you handle state management in a React application?",
        difficulty: "medium",
        category: "React",
      },
      {
        id: 4,
        text: "What is the difference between useEffect and useLayoutEffect in React?",
        difficulty: "medium",
        category: "React",
      },
      {
        id: 5,
        text: "Design a scalable microservices architecture for an e-commerce platform.",
        difficulty: "hard",
        category: "System Design",
      },
      {
        id: 6,
        text: "How would you implement real-time communication between client and server?",
        difficulty: "hard",
        category: "Node.js",
      },
    ];
  }
};

export const evaluateAnswer = async (question, answer, difficulty) => {
  const prompt = `Evaluate this technical interview answer and provide a score from 1-10.

Question: "${question}"
Difficulty: ${difficulty}
Answer: "${answer}"

Please evaluate based on:
1. Technical accuracy
2. Depth of understanding
3. Practical examples
4. Clarity of explanation
5. Relevance to the question

IMPORTANT: Return ONLY plain text feedback without any markdown formatting, asterisks, backticks, or special characters.

Return your evaluation in JSON format:
{
  "score": 8,
  "feedback": "Detailed feedback about the answer",
  "suggestions": ["suggestion1", "suggestion2"]
}

Score guidelines:
- 9-10: Excellent, comprehensive answer
- 7-8: Good answer with minor gaps
- 5-6: Adequate but needs improvement
- 3-4: Poor understanding, major gaps
- 0-2: Very poor or irrelevant answer`;

  const response = await mistral.chat.complete({
    model: "mistral-tiny",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const content = response.choices[0].message.content;

  // Try to parse JSON from the response
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    let cleanedJson = null;
    try {
      // Clean the JSON string by removing control characters
      cleanedJson = jsonMatch[0]
        .replace(/[\x00-\x1F\x7F-\x9F]/g, "") // Remove control characters
        .replace(/\n/g, " ") // Replace newlines with spaces
        .replace(/\r/g, " ") // Replace carriage returns with spaces
        .replace(/\t/g, " ") // Replace tabs with spaces
        .replace(/\s+/g, " ") // Replace multiple spaces with single space
        .trim();

      const evaluation = JSON.parse(cleanedJson);
      return evaluation;
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      if (cleanedJson) {
        console.error("Cleaned JSON:", cleanedJson);
      }
      // Fallback: try to extract a numeric score from the full content
      const scoreMatch = content.match(/\bscore\b\s*[:=-]?\s*(10|[0-9])/i);
      const parsedScore = scoreMatch
        ? Math.max(0, Math.min(10, parseInt(scoreMatch[1], 10)))
        : 5;
      const feedbackMatch = content.match(
        /"?feedback"?\s*[:=-]?\s*["“”]?([\s\S]{0,300}?)["”]?\s*(,|\}|$)/i
      );
      const feedback = feedbackMatch
        ? feedbackMatch[1].toString().trim()
        : "Automatic fallback evaluation due to JSON parsing issue.";
      return {
        score: Number.isFinite(parsedScore) ? parsedScore : 5,
        feedback,
        suggestions: [
          "Clarify key points concisely",
          "Include a concrete example or trade-offs",
        ],
      };
    }
  } else {
    console.error("No JSON found in evaluation response:", content);

    // Fallback: Create default evaluation if AI response is malformed
    console.log("Creating fallback evaluation due to parsing error");
    return {
      score: 5,
      feedback:
        "Unable to evaluate answer due to technical issues. Please try again.",
      suggestions: [
        "Provide more detailed explanation",
        "Include practical examples",
      ],
    };
  }
};

export const extractCandidateInfoFromResume = async (resumeText) => {
  const prompt = `Extract the following information from this resume text:

${resumeText}

Please extract ONLY the following information:
1. Full Name (first and last name)
2. Email Address
3. Phone Number

IMPORTANT: Return ONLY a JSON object with this exact structure:
{
  "name": "Full Name Here",
  "email": "email@example.com", 
  "phone": "phone number here"
}

Rules:
- If any information is not found, use an empty string ""
- For phone numbers, include the full number as it appears in the resume
- For names, use the complete name as it appears (first and last)
- For emails, use the exact email address as it appears
- Do not include any other text, explanations, or formatting
- Return ONLY the JSON object`;

  try {
    const response = await mistral.chat.complete({
      model: "mistral-tiny",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = response.choices[0].message.content;

    // Try to parse JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      let cleanedJson = null;
      try {
        // Clean the JSON string by removing control characters
        cleanedJson = jsonMatch[0]
          .replace(/[\x00-\x1F\x7F-\x9F]/g, "") // Remove control characters
          .replace(/\n/g, " ") // Replace newlines with spaces
          .replace(/\r/g, " ") // Replace carriage returns with spaces
          .replace(/\t/g, " ") // Replace tabs with spaces
          .replace(/\s+/g, " ") // Replace multiple spaces with single space
          .trim();

        const extractedInfo = JSON.parse(cleanedJson);

        // Validate the extracted info has the required fields
        const validatedInfo = {
          name: extractedInfo.name || "",
          email: extractedInfo.email || "",
          phone: extractedInfo.phone || "",
        };

        return validatedInfo;
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        if (cleanedJson) {
          console.error("Cleaned JSON:", cleanedJson);
        }
        throw new Error(
          "Could not parse extracted information from AI response: " +
            parseError.message
        );
      }
    } else {
      console.error("No JSON found in AI response:", content);
      throw new Error("AI response did not contain valid JSON");
    }
  } catch (error) {
    console.error("Error extracting info with AI:", error);
    throw new Error("Failed to extract information using AI: " + error.message);
  }
};

export const generateSummary = async (candidateInfo, answers) => {
  const totalScore = answers.reduce(
    (sum, answer) => sum + (answer?.score || 0),
    0
  );
  const averageScore = totalScore / answers.length;

  const prompt = `Generate a comprehensive interview summary for a candidate.

Candidate Information:
- Name: ${candidateInfo.name}
- Email: ${candidateInfo.email}
- Phone: ${candidateInfo.phone}

Interview Results:
- Total Score: ${totalScore}/60
- Average Score: ${averageScore.toFixed(1)}/10
- Questions Answered: ${answers.length}/6

Answer Details:
${answers
  .map(
    (answer, index) => `
Question ${index + 1}: Score ${answer?.score ?? 0}/10
Answer: ${answer?.answer ?? "No answer provided"}
`
  )
  .join("")}

IMPORTANT: Return ONLY plain text summary without any markdown formatting, asterisks, backticks, or special characters.

Please provide a concise professional summary (maximum 3-4 sentences) that includes:
1. Overall performance score and brief assessment
2. Key technical strengths or weaknesses
3. Brief hiring recommendation

Keep it short, clear, and actionable for HR and technical managers.`;

  const response = await mistral.chat.complete({
    model: "mistral-tiny",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const content = response.choices[0].message.content;

  return { summary: content };
};
