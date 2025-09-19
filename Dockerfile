# Use the official Node.js image with Alpine Linux
FROM node:lts-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and yarn.lock to the working directory
COPY package.json yarn.lock ./

# Copy the prisma directory to the working directory
COPY prisma ./prisma

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy the rest of the application code to the working directory
COPY . .

# Build the application
RUN yarn build

# Expose the application port
EXPOSE 3000

# Define the command to run the application
CMD ["yarn", "start"]