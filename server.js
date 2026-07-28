const path = require('path');
const fastify = require('fastify')({ logger: true });

fastify.register(require('@fastify/static'), {
  root: path.join(__dirname, 'public')
});

const PER_PAGE = 4;

let recipes = [
  { id: 1, title: 'Creamy Pasta Carbonara', time: 25, ratings: [5, 4] },
  { id: 2, title: 'Thai Green Curry', time: 40, ratings: [5] },
  { id: 3, title: 'Classic Beef Tacos', time: 30, ratings: [4, 4, 5] },
  { id: 4, title: 'Mushroom Risotto', time: 45, ratings: [] },
  { id: 5, title: 'Pasta Primavera', time: 20, ratings: [3] },
  { id: 6, title: 'Chicken Tikka Masala', time: 50, ratings: [5, 5] },
  { id: 7, title: 'Greek Salad', time: 15, ratings: [4] },
  { id: 8, title: 'Lentil Soup', time: 35, ratings: [] },
  { id: 9, title: 'Shrimp Pad Thai', time: 30, ratings: [4, 5] }
];

function withAverage(recipe) {
  const { ratings, ...rest } = recipe;
  const avg = ratings.length
    ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
    : null;
  return { ...rest, avgRating: avg, ratingCount: ratings.length };
}

fastify.get('/api/recipes', (request, reply) => {
  const page = parseInt(request.query.page || '1', 10);
  const q = request.query.q || '';

  const filtered = q
    ? recipes.filter(r => r.title.toLowerCase().includes(q.toLowerCase()))
    : recipes;

  const start = (page - 1) * PER_PAGE;
  const items = filtered.slice(start, start + PER_PAGE);

  reply.send({
    items: items.map(withAverage),
    total: filtered.length,
    page,
    perPage: PER_PAGE
  });
});

fastify.post('/api/recipes/:id/rate', (request, reply) => {
  const recipe = recipes.find(r => r.id === Number(request.params.id));
  if (!recipe) return reply.code(404).send({ error: 'Recipe not found' });

  const rating = Number(request.body.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return reply.code(400).send({ error: 'Rating must be 1-5' });
  }

  const ratings = [...recipe.ratings];
  ratings.push(rating);

  reply.send(withAverage(recipe));
});

const PORT = process.env.PORT || 3003;
fastify.listen({ port: PORT, host: '0.0.0.0' }, err => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
