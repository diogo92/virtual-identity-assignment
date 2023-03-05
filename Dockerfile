# Base image
FROM node:18

# Create app directory
WORKDIR /usr/src/app

# Copy package and package-lock files to app directory
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy app source code to app directory
COPY . .

# Build the app
RUN npm run build

# Set the environment variables
ENV MONGODB_URI=mongodb://db:27017/url-shortener
ENV PORT=3000

# Expose port 3000 for the app
EXPOSE 3000

# Start the app
CMD [ "npm", "start" ]