Connect to Mongo CLI:
    docker exec -it mongodb bash
    mongosh -u root -p example --authenticationDatabase admin
    use rec_data
    db.vehicles.find()

docker-compose logs -f rec_controller
docker-compose logs -f batt_alert 

Notes for kubernetes:
persistent volume

kubectl apply -f mqtt.yaml
kubectl apply -f mongodb.yaml
kubectl apply -f mongodb-config.yaml
kubectl apply -f rec_controller.yaml
