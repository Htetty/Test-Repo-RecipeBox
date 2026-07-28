const { createApp } = Vue;

createApp({
  data() {
    return {
      items: [],
      total: 0,
      page: 1,
      perPage: 4,
      query: '',
      pendingRatings: {},
      loaded: false
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.total / this.perPage);
    }
  },
  methods: {
    async load() {
      const params = new URLSearchParams({ page: this.page });
      if (this.query) params.set('q', this.query);
      const res = await fetch(`/api/recipes?${params}`);
      const data = await res.json();
      this.items = data.items;
      this.total = data.total;
      this.loaded = true;
    },
    search() {
      this.page = 1;
      this.load();
    },
    go(page) {
      this.page = page;
      this.load();
    },
    async rate(id) {
      const rating = this.pendingRatings[id];
      if (!rating) return;
      await fetch(`/api/recipes/${id}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating })
      });
      this.pendingRatings[id] = '';
      this.load();
    }
  },
  mounted() {
    this.load();
  }
}).mount('#app');
