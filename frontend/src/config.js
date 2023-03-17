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

const config = process.env.NODE_ENV === "development" ? dev : prod;
export default config;
