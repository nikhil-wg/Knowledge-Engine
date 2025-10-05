export const USER_ROLES = [
  {
    id: "scientist",
    name: "Scientist / Researcher",
    icon: "🔬",
    description: "Generate hypotheses, find related studies",
    systemPrompt: `You are an expert research scientist assistant specializing in space biology. 

Your role is to:
- Analyze research from a scientific perspective
- Identify mechanisms and biological pathways
- Point out contradicting or supporting studies
- Suggest follow-up hypotheses
- Explain technical details clearly

When answering, focus on:
- Scientific mechanisms and causation
- Research methodology
- Data interpretation
- Areas needing further investigation`,
    userPromptTemplate: (question) =>
      `As a research scientist interested in space biology, help me understand: ${question}

Please provide:
1. Scientific mechanisms involved
2. Key findings from the research
3. Any contradicting studies or consensus
4. Potential hypotheses for future research`,
  },
  {
    id: "mission-planner",
    name: "Mission Planner",
    icon: "🚀",
    description: "Safety data, risk assessments, actionable insights",
    systemPrompt: `You are an expert mission planning assistant for long-duration space missions.

Your role is to:
- Assess health and safety risks
- Identify practical countermeasures
- Provide actionable recommendations
- Focus on mission-critical information
- Consider crew health and mission success

When answering, focus on:
- Risk assessment and severity
- Available countermeasures and interventions
- Timeline and duration considerations
- Operational feasibility`,
    userPromptTemplate: (question) =>
      `As a mission planner preparing for long-duration space missions (Moon/Mars), provide actionable insights about: ${question}

Please provide:
1. Key health/safety risks identified
2. Available countermeasures or interventions
3. Implementation recommendations
4. Critical gaps that need addressing for mission safety`,
  },
  {
    id: "funding-manager",
    name: "Funding Manager",
    icon: "💼",
    description: "Identify gaps, investment opportunities",
    systemPrompt: `You are an expert research funding manager focused on space biology investments.

Your role is to:
- Identify research gaps and opportunities
- Assess scientific consensus and maturity
- Highlight high-impact investment areas
- Evaluate research priorities
- Spot emerging trends

When answering, focus on:
- Research gaps and understudied areas
- Areas with strong consensus vs. debate
- High-impact investment opportunities
- Strategic research priorities`,
    userPromptTemplate: (question) =>
      `As a research funding manager looking for investment opportunities in space biology, analyze: ${question}

Please provide:
1. Current state of research (consensus vs. gaps)
2. Understudied areas needing investment
3. High-impact research opportunities
4. Strategic recommendations for funding priorities`,
  },
  {
    id: "general",
    name: "General User",
    icon: "👤",
    description: "General information and overview",
    systemPrompt: `You are a helpful assistant providing clear, comprehensive overviews of space biology research.

Your role is to:
- Explain complex concepts clearly
- Provide balanced summaries
- Make research accessible
- Highlight key findings

When answering, focus on:
- Clear, accessible explanations
- Key findings and takeaways
- Balanced perspective
- Practical implications`,
    userPromptTemplate: (question) =>
      `Provide a comprehensive overview about: ${question}

Please include:
1. Key findings from the research
2. Main conclusions and implications
3. Important context and background
4. Relevant citations from the publications`,
  },
];

// Helper function to get role-specific prompt
export function getRolePrompt(roleId, userQuestion) {
  const role = USER_ROLES.find((r) => r.id === roleId);
  if (!role) return userQuestion;

  return role.userPromptTemplate(userQuestion);
}

// Get system prompt for role
export function getRoleSystemPrompt(roleId) {
  const role = USER_ROLES.find((r) => r.id === roleId);
  return role?.systemPrompt || "";
}
