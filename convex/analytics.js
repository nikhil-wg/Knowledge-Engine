import { query } from "./_generated/server";

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const publications = await ctx.db.query("publications").collect();
    
    const totalPublications = publications.length;
    const analyzedPublications = publications.filter((p) => p.summary).length;
    
    const allTopics = publications.flatMap((p) => p.topics);
    const uniqueTopics = new Set(allTopics);
    
    const allOrganisms = publications.flatMap((p) => p.organisms);
    const uniqueOrganisms = new Set(allOrganisms);
    
    return {
      totalPublications,
      analyzedPublications,
      totalTopics: uniqueTopics.size,
      totalOrganisms: uniqueOrganisms.size,
    };
  },
});

export const getTopicDistribution = query({
  args: {},
  handler: async (ctx) => {
    const publications = await ctx.db.query("publications").collect();
    const topicCounts = {};
    
    publications.forEach((pub) => {
      pub.topics.forEach((topic) => {
        topicCounts[topic] = (topicCounts[topic] || 0) + 1;
      });
    });
    
    return Object.entries(topicCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  },
});
