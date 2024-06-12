FROM node:18

# Install necessary libraries
RUN apt-get update && apt-get install -y \
    libudev-dev \
    libnss3 \
    libxss1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxrandr2 \
    libgbm1 \
    libgtk-3-0 \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package.json /app/

RUN npm install && npm rebuild

# Bundle app source
COPY . /app

EXPOSE 3001

CMD [ "npm", "start" ]
