FROM node:16

# Create app directory
WORKDIR /

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
COPY client ./client/
COPY routes ./routes/
COPY . ./


RUN npm install
RUN cd client
RUN npm install
RUN cd ..
#RUN npm run dev # to start frontend
#RUN npm start dev # to start backend

# If you are building your code for production
# RUN npm ci --only=production


EXPOSE 3000
EXPOSE 5000
CMD npm run dev / npm start dev