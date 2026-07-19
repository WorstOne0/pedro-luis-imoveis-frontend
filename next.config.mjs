/** @type {import('next').NextConfig} */
const nextConfig = {
  // Emits .next/standalone with only the files actually needed at runtime, so
  // the Docker image ships a trimmed node_modules instead of the whole tree.
  output: "standalone",
};

export default nextConfig;
