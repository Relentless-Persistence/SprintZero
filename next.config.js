module.exports = {
  reactStrictMode: true,
  images: {
    domains: ["docs.microsoft.com", "developers.google.com"],
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/dashboard",
        permanent: true,
      },
    ];
  },
};
