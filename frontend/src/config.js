const prod = {
  url: {
    API_URL: "/api",
  },
};

const dev = {
  url: {
    API_URL: "/api",
  },
};

const config = import.meta.env.DEV ? dev : prod;
export default config;
