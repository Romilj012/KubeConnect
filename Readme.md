# KubeConnect: Node.js and MongoDB

This project demonstrates how to deploy a Node.js application on Kubernetes and connect it to a MongoDB database.


https://github.com/user-attachments/assets/37c6c999-b763-4a9b-b051-12faf7feb2ac




## Prerequisites

- Docker  
- Kubernetes cluster (Minikube for local development)  
- kubectl  
- Node.js  
- npm  

## Project Structure

```
.
├── app/
│   ├── index.js
│   └── package.json
├── k8s/
│   ├── mongodb-configmap.yaml
│   ├── mongodb-secret.yaml
│   ├── mongodb-deployment.yaml
│   ├── nodejs-deployment.yaml
│   └── node-app-service.yaml
├── Dockerfile
└── README.md
```

## Steps

### 1. Create Kubernetes Configuration Files

Create the following YAML files in the `k8s/` directory:

- **`mongodb-configmap.yaml`**: ConfigMap for MongoDB connection string  
- **`mongodb-secret.yaml`**: Secret for MongoDB credentials  
- **`mongodb-deployment.yaml`**: Deployment and Service for MongoDB  
- **`nodejs-deployment.yaml`**: Deployment for Node.js application  
- **`node-app-service.yaml`**: Service for Node.js application  

---

### 2. Deploy MongoDB

1. Apply the MongoDB Secret:

   ```sh
   kubectl apply -f k8s/mongodb-secret.yaml
   ```

2. Apply the MongoDB ConfigMap:

   ```sh
   kubectl apply -f k8s/mongodb-configmap.yaml
   ```

3. Deploy MongoDB:

   ```sh
   kubectl apply -f k8s/mongodb-deployment.yaml
   ```

---

### 3. Dockerize the Node.js Application

1. Update your `index.js` to use the MongoDB connection string from the environment:

   ```javascript
   const mongoUri = process.env.database_url;

   mongoose
     .connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
     .then(() => console.log('Connected to MongoDB'))
     .catch((err) => console.error('Failed to connect to MongoDB:', err));
   ```

2. Create a `Dockerfile` in the project root:

   ```dockerfile
   FROM node:18-alpine

   WORKDIR /app

   COPY package*.json ./

   RUN npm install

   COPY . .

   EXPOSE 3000

   CMD ["node", "index.js"]
   ```

3. Build the Docker image:

   ```sh
   docker build -t your-username/node-web-app .
   ```

4. Push the image to Docker Hub:

   ```sh
   docker push your-username/node-web-app
   ```

---

### 4. Deploy Node.js Application

1. Update `nodejs-deployment.yaml` with your Docker image:

   ```yaml
   spec:
     containers:
     - name: nodejs
       image: your-username/node-app:latest
   ```

2. Apply the Node.js Deployment:

   ```sh
   kubectl apply -f k8s/nodejs-deployment.yaml
   ```

3. Apply the Node.js Service:

   ```sh
   kubectl apply -f k8s/nodejs-service.yaml
   ```

---

### 5. Verify Deployment

Check the status of your deployments:

```sh
kubectl get deployments
kubectl get pods
kubectl get services
```

---

### 6. Access the Application

For Minikube, use the following command to get the service URL:

```sh
minikube service nodejs-service
```

---

## File Contents

### `mongodb-configmap.yaml`

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: mongodb-configmap
data:
  database_url: mongodb://$(MONGO_USER):$(MONGO_PASSWORD)@mongodb-service:27017/?authSource=admin
```

### `mongodb-secret.yaml`

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: mongodb-secret
type: Opaque
stringData:
  mongo-root-username: your_username_here
  mongo-root-password: your_password_here
```

### `mongodb-deployment.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mongodb-deployment
  labels:
    app: mongodb
spec:
  replicas: 1
  selector:
    matchLabels:
      app: mongodb
  template:
    metadata:
      labels:
        app: mongodb
    spec:
      containers:
      - name: mongodb
        image: mongo
        ports:
        - containerPort: 27017
        env:
        - name: MONGO_INITDB_ROOT_USERNAME
          valueFrom:
            secretKeyRef:
              name: mongodb-secret
              key: mongo-root-username
        - name: MONGO_INITDB_ROOT_PASSWORD
          valueFrom:
            secretKeyRef:
              name: mongodb-secret
              key: mongo-root-password
---
apiVersion: v1
kind: Service
metadata:
  name: mongodb-service
spec:
  selector:
    app: mongodb
  ports:
    - protocol: TCP
      port: 27017
      targetPort: 27017
```

### `nodejs-deployment.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nodejs-deployment
spec:
  replicas: 1
  selector:
    matchLabels:
      app: nodejs
  template:
    metadata:
      labels:
        app: nodejs
    spec:
      containers:
      - name: nodejs
        image: your-username/node-app:latest
        ports:
        - containerPort: 3000
        envFrom:
        - configMapRef:
            name: mongodb-configmap
        env:
        - name: MONGO_USER
          valueFrom:
            secretKeyRef:
              name: mongodb-secret
              key: mongo-root-username
        - name: MONGO_PASSWORD
          valueFrom:
            secretKeyRef:
              name: mongodb-secret
              key: mongo-root-password
```

### `node-app-service.yaml`

```yaml
apiVersion: v1
kind: Service
metadata:
  name: node-app-service
spec:
  selector:
    app: nodejs
  type: LoadBalancer
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
```

---

## Conclusion

This project demonstrates how to set up Kubernetes configurations, deploy MongoDB, containerize a Node.js application, and deploy it on Kubernetes with a connection to the MongoDB database. By following these steps, you can create a scalable and manageable deployment of your Node.js application.
```

This README provides clear instructions and a detailed walkthrough for deploying a Node.js application with MongoDB on Kubernetes. Let me know if any further customization is needed!
